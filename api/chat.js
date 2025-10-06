export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages
      })
    });

    const data = await openaiRes.json();
    const reply = data.choices?.[0]?.message?.content || '[No response]';

    res.status(200).json({ reply });
  } catch (err) {
    console.error('Error from OpenAI:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
