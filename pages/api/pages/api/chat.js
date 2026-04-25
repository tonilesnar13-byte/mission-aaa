export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { messages, system } = req.body;
    const systemPrompt = system || "Tu es un assistant IA utile. Reponds en francais.";
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(function(m) {
            var content = typeof m.content === "string" ? m.content : "";
            return { role: m.role, content: content };
          })
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    var text = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : "";
    return res.status(200).json({ content: [{ type: "text", text: text }] });
  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
}
