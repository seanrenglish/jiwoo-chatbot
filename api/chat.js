export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, convo_id } = req.body;

  try {
    // Call OpenAI
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages
      })
    });

    const data = await openaiRes.json();
    const reply = data.choices?.[0]?.message?.content || "[No response]";
    const turn = messages.length;

    // Supabase Logging
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const headers = {
      "Content-Type": "application/json",
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Prefer": "return=minimal"
    };

    const lastUserMsg = messages.at(-2)?.content || "unknown";

    // Log user message
    await fetch(`${supabaseUrl}/rest/v1/logs`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        convo_id,
        turn: turn - 1,
        role: "user",
        message: lastUserMsg
      })
    });

    // Log assistant reply
    await fetch(`${supabaseUrl}/rest/v1/logs`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        convo_id,
        turn,
        role: "assistant",
        message: reply
      })
    });

    res.status(200).json({ reply });

  } catch (err) {
    console.error("Error during OpenAI or Supabase call:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
