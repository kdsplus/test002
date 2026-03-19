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
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'google/gemma-3-12b-it:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'qwen/qwen3-coder:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'openai/gpt-oss-120b:free',
  'stepfun/step-3.5-flash:free',
  'minimax/minimax-m2.5:free',
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function tryModel(model: string, messages: ChatMessage[], attempt: number): Promise<{ ok: boolean; content?: string; error?: string; status?: number }> {
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
    const content = data.choices[0]?.message?.content || '';
    if (content) return { ok: true, content };
    return { ok: false, error: 'Empty response', status: 200 };
  }

  const errorText = await response.text();

  // 429 rate limit: retry once after delay
  if (response.status === 429 && attempt === 0) {
    console.warn(`Model ${model} rate-limited, retrying in 3s...`);
    await delay(3000);
    return tryModel(model, messages, attempt + 1);
  }

  return { ok: false, error: errorText, status: response.status };
}

export async function generateWithAI(messages: ChatMessage[]): Promise<string> {
  let lastError = '';

  for (const model of FREE_MODELS) {
    console.log(`Trying model: ${model}`);
    const result = await tryModel(model, messages, 0);

    if (result.ok && result.content) {
      console.log(`Success with model: ${model}`);
      return result.content;
    }

    lastError = result.error || 'Unknown error';
    console.warn(`Model ${model} failed (${result.status}): ${lastError.substring(0, 100)}`);
  }

  throw new Error(`All models failed. Last error: ${lastError}`);
}
