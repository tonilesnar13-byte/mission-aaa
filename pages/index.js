import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [msgs, setMsgs] = useState([{role:"bot", text:"Bonjour ! Je suis votre assistant Mission AAA. Je suis la pour vous aider a creer votre agence d'agents IA et atteindre 10 000 euros par mois. Comment puis-je vous aider ?"}]);
  const [hist, setHist] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [msgs]);

  const send = async (txt) => {
    const msg = (txt || input).trim();
    if (!msg || busy) return;
    setInput("");
    setBusy(true);
    setMsgs(prev => [...prev, {role:"user", text:msg}, {role:"bot", text:"..."}]);
    const newHist = [...hist, {role:"user", content:msg}];
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          system: "Tu es un expert en creation d agences d agents IA. Tu aides l utilisateur a gagner 10000 euros par mois. Sois direct, concret et motivant. Reponds en francais.",
          messages: newHist
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content[0].text;
      setMsgs(prev => [...prev.slice(0,-1), {role:"bot", text:text}]);
      setHist([...newHist, {role:"assistant", content:text}]);
    } catch(e) {
      setMsgs(prev => [...prev.slice(0,-1), {role:"bot", text:"Erreur: " + e.message, error:true}]);
    }
    setBusy(false);
  };

  const QUICK = [
    "Comment gagner 10000 euros par mois avec les agents IA ?",
    "Quelle est la niche la plus rentable pour vendre des agents IA ?",
    "Donne-moi un script pour vendre un agent IA a un client.",
    "Comment trouver mes premiers clients cette semaine ?"
  ];

  return (
    <div style={{display:"flex", flexDirection:"column", height:"100vh", fontFamily:"sans-serif", background:"#0f172a", color:"white"}}>
      <div style={{padding:"16px 20px", background:"linear-gradient(135deg,#1e1b4b,#312e81)", borderBottom:"1px solid rgba(255,255,255,.1)"}}>
        <div style={{fontWeight:800, fontSize:18}}>Mission AAA</div>
        <div style={{fontSize:12, color:"rgba(255,255,255,.6)", marginTop:2}}>Agence d Agents IA - Objectif 10 000 euros par mois</div>
      </div>
      <div ref={chatRef} style={{flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:12}}>
        {msgs.map((m,i) => (
          <div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start", maxWidth:"85%", padding:"10px 14px", borderRadius:12, background:m.error?"#fee2e2":m.role==="user"?"#3b82f6":"#1e293b", color:m.error?"#991b1b":"white", fontSize:14, lineHeight:1.6, whiteSpace:"pre-wrap"}}>
            {m.text}
          </div>
        ))}
        {!busy && msgs.length <= 1 && (
          <div style={{display:"flex", flexDirection:"column", gap:8, marginTop:8}}>
            {QUICK.map((q,i) => (
              <button key={i} onClick={() => send(q)} style={{padding:"10px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,.15)", background:"rgba(255,255,255,.07)", color:"rgba(255,255,255,.85)", cursor:"pointer", textAlign:"left", fontSize:13, fontFamily:"sans-serif"}}>
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{padding:"12px 16px", background:"#1e293b", borderTop:"1px solid rgba(255,255,255,.1)"}}>
        <div style={{display:"flex", gap:8}}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && send()} placeholder="Posez votre question..." style={{flex:1, padding:"10px 13px", borderRadius:10, border:"1px solid rgba(255,255,255,.15)", background:"rgba(255,255,255,.05)", color:"white", fontSize:13, outline:"none"}} />
          <button onClick={() => send()} disabled={busy || !input.trim()} style={{padding:"10px 18px", borderRadius:10, border:"none", background:busy?"#334155":"#f59e0b", color:"white", fontWeight:700, cursor:"pointer"}}>
            {busy ? "..." : "Envoyer"}
          </button>
        </div>
      </div>
    </div>
  );
}
