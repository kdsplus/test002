interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

const FREE_MODELS = [
  'google/gemma-3-27b-it:free',
  'google/gemma-3-12b-it:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'qwen/qwen3-14b:free',
  'deepseek/deepseek-r1-0528:free',
];

export async function generateWithAI(messages: ChatMessage[]): Promise<string> {
  let lastError = '';

  for (const model of FREE_MODELS) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 4000,
      }),
    });

    if (response.ok) {
      const data: OpenRouterResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    }

    lastError = await response.text();
    console.warn(`Model ${model} failed (${response.status}), trying next...`);
  }

  throw new Error(`All models failed. Last error: ${lastError}`);
}
