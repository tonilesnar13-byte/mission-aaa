import { useState, useRef, useEffect } from "react";

const SYSTEM = `Tu es l'Assistant IA de la Mission AAA. Tu guides l'utilisateur pour créer son Agence d'Agents IA et atteindre 10 000€/mois. Sois direct, concret, motivant. Réponds en français.`;

const ÉTAPES = [
  { id: 1, label: "Ma situation", icon: "👤" },
  { id: 2, label: "Ma niche", icon: "🎯" },
  { id: 3, label: "Mon offre", icon: "💼" },
  { id: 4, label: "Plan 30j", icon: "🗓️" },
  { id: 5, label: "Mes scripts", icon: "📝" },
];

const QUICK = [
  { icon: "🏃", label: "Démarrer", text: "Je veux démarrer. Pose-moi les questions pour trouver ma niche." },
  { icon: "💰", label: "Mes revenus", text: "Combien puis-je gagner en vendant des agents IA ?" },
  { icon: "🎯", label: "Ma niche", text: "Aide-moi à trouver la niche la plus rentable pour moi." },
  { icon: "📞", label: "Script vente", text: "Donne-moi un script pour vendre un agent IA." },
  { icon: "🔍", label: "Trouver clients", text: "Comment trouver mes 4 premiers clients à 2500€/mois ?" },
  { icon: "🤖", label: "Quel agent ?", text: "Quel agent IA est le plus facile à créer et rentable ?" },
];

export default function MissionAAA() {
  const [msgs, setMsgs] = useState([]);
  const [hist, setHist] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [etape, setEtape] = useState(1);
  const chatRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [msgs]);
  useEffect(() => { initAgent(); }, []);

  const callAPI = async (messages) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system: SYSTEM, messages }),
    });
    return res.json();
  };

  const initAgent = async () => {
    setBusy(true);
    try {
      const data = await callAPI([{ role: "user", content: "Présente-toi et pose les premières questions pour comprendre ma situation." }]);
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n\n");
      setMsgs([{ role: "bot", text: text || "Bonjour ! Je suis votre assistant Mission AAA 🚀\n\nComment puis-je vous aider ?" }]);
      setHist([{ role: "user", content: "Présente-toi." }, { role: "assistant", content: text || "Bonjour !" }]);
    } catch (e) {
      setMsgs([{ role: "bot", text: "Bonjour ! Je suis votre assistant Mission AAA 🚀" }]);
    }
    setBusy(false);
  };

  const send = async (txt) => {
    const msg = (txt || input).trim();
    if (!msg || busy) return;
    setInput(""); if (taRef.current) taRef.current.style.height = "auto";
    setBusy(true);
    setMsgs(prev => [...prev, { role: "user", text: msg }, { role: "bot", loading: true }]);
    const newHist = [...hist, { role: "user", content: msg }];
    try {
      const data = await callAPI(newHist);
      if (data.error) throw new Error(data.error.message);
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n\n");
      setMsgs(prev => [...prev.slice(0, -1), { role: "bot", text: text || "..." }]);
      setHist([...newHist, { role: "assistant", content: text || "…" }]);
      if (text.toLowerCase().includes("niche") && etape < 2) setEtape(2);
      if (text.toLowerCase().includes("offre") && etape < 3) setEtape(3);
      if (text.toLowerCase().includes("30 jour") && etape < 4) setEtape(4);
      if (text.toLowerCase().includes("script") && etape < 5) setEtape(5);
    } catch (e) {
      setMsgs(prev => [...prev.slice(0, -1), { role: "bot", text: "Erreur : " + e.message, error: true }]);
    }
    setBusy(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Inter',system-ui,sans-serif", background: "#0f172a" }}>
      <style>{`@keyframes blink{0%,100%{opacity:.15}50%{opacity:1}} *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#334155;border-radius:4px} .qbtn:hover{background:rgba(255,255,255,.12)!important} textarea:focus{outline:none} body{margin:0}`}</style>
      <div style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81)", padding: "14px 20px", flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,.1)" }}>
        <div style={{ display: "flex", alignItems: "cent
