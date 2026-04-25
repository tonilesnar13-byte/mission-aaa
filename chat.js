export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const body = req.body;
    const systemPrompt = body.system || "Tu es un assistant utile. Reponds en francais.";
    const messages = body.messages || [];
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }].concat(
          messages.map(function(m) {
            return { role: m.role, content: String(m.content || "") };
          })
        ),
        max_tokens: 2048,
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const text = data.choices[0].message.content;
    return res.status(200).json({ content: [{ type: "text", text: text }] });
  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
}
