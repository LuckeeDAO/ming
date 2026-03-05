export interface FortuneChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface FortuneChatResult {
  reply: string;
  model?: string;
  provider?: string;
  autocorrect_applied?: boolean;
  consistency?: {
    checked: boolean;
    mismatchCount: number;
    mismatches?: Array<{ pillar: string; expected: string; got: string }>;
  };
}

export type FortuneChatMode = 'qa' | 'full';

const DEFAULT_MODEL =
  import.meta.env.VITE_AI_FORTUNE_MODEL ||
  'Qwen/Qwen3-8B';

const DEFAULT_API_PATH =
  import.meta.env.VITE_AI_CHAT_API_PATH || '/api/fortune-chat';

export async function sendFortuneChat(
  messages: FortuneChatMessage[],
  mode: FortuneChatMode = 'qa',
  localBaziContext?: string
): Promise<FortuneChatResult> {
  const resp = await fetch(DEFAULT_API_PATH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      mode,
      local_bazi_context: localBaziContext || '',
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    try {
      const data = JSON.parse(txt);
      const rid = data?.request_id ? ` (request_id: ${data.request_id})` : '';
      const err = data?.error || `AI 命理服务调用失败: ${resp.status}`;
      throw new Error(`${err}${rid}`);
    } catch {
      throw new Error(txt || `AI 命理服务调用失败: ${resp.status}`);
    }
  }

  return resp.json();
}
