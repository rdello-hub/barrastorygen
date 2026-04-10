export async function callCopilot(apiKey, systemPrompt, userMessage, config = {}) {
  const { 
    provider = 'groq', 
    model = 'llama-3.3-70b-versatile' 
  } = config;

  if (!apiKey) {
    throw new Error("Chiave API mancante. Inseriscila nelle impostazioni del Copilot.");
  }

  let url = "https://api.groq.com/openai/v1/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
  };

  if (provider === 'openrouter') {
    url = "https://openrouter.ai/api/v1/chat/completions";
    headers["HTTP-Referer"] = "https://github.com/rdello-hub/barrastorygen"; // Required by OpenRouter
    headers["X-Title"] = "BarraStoryGen";
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Errore AI (${provider}): ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error(`Errore AI ${provider}:`, error);
    throw error;
  }
}
