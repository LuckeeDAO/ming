const defaultBaseUrl = 'https://api-inference.modelscope.cn/v1';
const defaultModel = 'Qwen/Qwen3-8B';
const defaultFallbackModel = 'Qwen/Qwen3-8B';
const defaultQaModel = 'Qwen/Qwen3-8B';
const defaultBasePrompt =
  '你是严谨的命理学习顾问。请基于用户给出的信息分析，不要编造未提供的事实。' +
  '\n规则：' +
  '\n1) 结论需说明依据；不确定时必须明确“不确定”。' +
  '\n2) 禁止绝对化、恐吓式表达。' +
  '\n3) 涉及医疗/法律/投资等高风险问题，必须提示咨询专业人士。';
const terminologyFactBase =
  '术语事实（必须遵守）：' +
  '\n- 天干：甲乙丙丁戊己庚辛壬癸（10个）。' +
  '\n- 地支：子丑寅卯辰巳午未申酉戌亥（12个）。' +
  '\n- 四柱=年柱、月柱、日柱、时柱；每柱由1个天干+1个地支组成。' +
  '\n- 若用户给出干支，以用户给出或本地排盘结果为准，不得擅自改写。';
const fullAnalysisInstruction =
  '模式=深度解析。仅当用户明确要求“全面解析/详批”，或已提供较完整出生信息时使用。' +
  '\n输出 Markdown，控制在 6 个一级/二级小节内，包含：' +
  '\n- 信息完整度检查（列缺失项）' +
  '\n- 命盘基础要点' +
  '\n- 性格与潜能' +
  '\n- 重点领域（仅用户关心的1-2个领域，避免面面俱到）' +
  '\n- 未来趋势（给出区间和不确定性）' +
  '\n- 可执行建议（3条以内）' +
  '\n一致性要求：先逐项复述用户已提供信息；若已明确提供某项，禁止再标记为缺失。';
const qaInstruction =
  '模式=快速问答。优先直接回答用户当前问题，不要强行展开完整框架。' +
  '\n输出结构：' +
  '\n- 结论（1-2句）' +
  '\n- 依据（2-4条）' +
  '\n- 下一步（1-2条，必要时请求补充信息）';
const rateWindowMs = 60 * 1000;
const maxRequestsPerWindow = Number(process.env.AI_FORTUNE_RATE_LIMIT || '20');
const rateStore = globalThis.__fortuneRateStore || new Map();
globalThis.__fortuneRateStore = rateStore;
const quickCache = globalThis.__fortuneQuickCache || new Map();
globalThis.__fortuneQuickCache = quickCache;

function getClientIp(req) {
  const xfwd = req.headers['x-forwarded-for'];
  if (typeof xfwd === 'string' && xfwd.trim()) {
    return xfwd.split(',')[0].trim();
  }
  if (Array.isArray(xfwd) && xfwd.length > 0) {
    return String(xfwd[0]).split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function hitRateLimit(clientKey) {
  const now = Date.now();
  const record = rateStore.get(clientKey);
  if (!record || now - record.start > rateWindowMs) {
    rateStore.set(clientKey, { start: now, count: 1 });
    return false;
  }
  record.count += 1;
  rateStore.set(clientKey, record);
  return record.count > maxRequestsPerWindow;
}

function isAllowedOrigin(req) {
  const raw = process.env.AI_FORTUNE_ALLOWED_ORIGINS || '';
  if (!raw.trim()) return true;
  const allowlist = raw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  const origin = req.headers.origin || '';
  return allowlist.includes(origin);
}

function isAllowedModel(model) {
  const raw = process.env.AI_FORTUNE_ALLOWED_MODELS || '';
  if (!raw.trim()) return true;
  const models = raw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  return models.includes(model);
}

function validateMessages(messages) {
  const maxMessages = Number(process.env.AI_FORTUNE_MAX_MESSAGES || '30');
  const maxChars = Number(process.env.AI_FORTUNE_MAX_CONTENT_CHARS || '4000');
  if (!Array.isArray(messages) || messages.length === 0) {
    return 'messages 不能为空';
  }
  if (messages.length > maxMessages) {
    return `messages 数量不能超过 ${maxMessages}`;
  }
  for (const item of messages) {
    if (!item || typeof item !== 'object') return 'messages 格式错误';
    if (!['system', 'user', 'assistant'].includes(item.role)) return 'messages.role 不合法';
    if (typeof item.content !== 'string' || !item.content.trim()) return 'messages.content 不能为空';
    if (item.content.length > maxChars) return `单条 content 长度不能超过 ${maxChars}`;
  }
  return '';
}

function hasBirthInfo(text) {
  if (!text) return false;
  const datePattern = /(\d{4}[-/.年]\d{1,2}[-/.月]\d{1,2})|([农陰阴]历)|([阳陽]历)/i;
  const timePattern = /(\d{1,2}:\d{1,2})|(时辰|子时|丑时|寅时|卯时|辰时|巳时|午时|未时|申时|酉时|戌时|亥时)/i;
  const genderPattern = /(男|女)/;
  return datePattern.test(text) && (timePattern.test(text) || genderPattern.test(text));
}

function detectMode(rawMessages, requestedMode) {
  if (requestedMode === 'full') return 'full';
  if (requestedMode === 'qa') return 'qa';
  const latestUser = [...rawMessages].reverse().find((m) => m.role === 'user')?.content || '';
  const explicitFull = /(全面|全方位|完整|详批|系统|深度解析|命盘|大运|流年)/i.test(latestUser);
  if (explicitFull) return 'full';
  if (hasBirthInfo(latestUser)) return 'full';
  return 'qa';
}

function trimHistory(messages) {
  const maxTurns = Number(process.env.AI_FORTUNE_MAX_HISTORY_TURNS || '20');
  if (messages.length <= maxTurns) return messages;
  return messages.slice(messages.length - maxTurns);
}

function buildMessages(rawMessages, mode) {
  const customSystemPrompt = process.env.AI_FORTUNE_SYSTEM_PROMPT?.trim();
  const basePrompt = customSystemPrompt || defaultBasePrompt;
  const extraPrompt = mode === 'full' ? fullAnalysisInstruction : qaInstruction;
  const cleanMessages = trimHistory(rawMessages.filter((m) => m.role !== 'system'));
  return [{ role: 'system', content: `${basePrompt}\n\n${terminologyFactBase}\n\n${extraPrompt}` }, ...cleanMessages];
}

function sanitizeLocalBaziContext(raw) {
  if (typeof raw !== 'string') return '';
  const text = raw.trim();
  if (!text) return '';
  const maxLen = Number(process.env.AI_FORTUNE_LOCAL_CONTEXT_MAX_CHARS || '1200');
  return text.slice(0, maxLen);
}

function parseLocalBaselineFromContext(localContext) {
  if (!localContext) return null;
  const m = localContext.match(
    /四柱:\s*年柱=([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])\s*月柱=([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])\s*日柱=([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])\s*时柱=([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])/
  );
  if (!m) return null;
  return {
    year: m[1],
    month: m[2],
    day: m[3],
    hour: m[4],
  };
}

function extractReplyPillars(reply) {
  const result = {};
  const regex = /(年柱|月柱|日柱|时柱|時柱)\s*[:：=]\s*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])/g;
  let m;
  while ((m = regex.exec(reply)) !== null) {
    const keyRaw = m[1];
    const key = keyRaw === '時柱' ? 'hour' :
      keyRaw === '年柱' ? 'year' :
      keyRaw === '月柱' ? 'month' :
      keyRaw === '日柱' ? 'day' : 'hour';
    result[key] = m[2];
  }
  return result;
}

function buildConsistencyReport(reply, localBaseline) {
  if (!localBaseline) {
    return { checked: false, mismatchCount: 0, mismatches: [] };
  }
  const replyPillars = extractReplyPillars(reply);
  const mismatches = [];
  for (const k of ['year', 'month', 'day', 'hour']) {
    const got = replyPillars[k];
    const expect = localBaseline[k];
    if (got && expect && got !== expect) {
      mismatches.push({ pillar: k, expected: expect, got });
    }
  }
  return {
    checked: true,
    mismatchCount: mismatches.length,
    mismatches,
    localFourPillars: localBaseline,
    replyFourPillars: replyPillars,
  };
}

function appendCorrectionIfMismatch(reply, report) {
  if (!report.checked || report.mismatchCount === 0) return reply;
  const p = report.localFourPillars;
  const fixBlock = [
    '',
    '---',
    '### 本地排盘校验纠偏',
    `检测到排盘字段不一致，已以本地权威排盘为准：年柱=${p.year} 月柱=${p.month} 日柱=${p.day} 时柱=${p.hour}。`,
    '请以上述四柱作为后续解读基线。',
  ].join('\n');
  return `${reply}${fixBlock}`;
}

function buildAutocorrectInstruction(localBaseline, mismatches) {
  const lines = mismatches.map((m) => {
    const label = m.pillar === 'year' ? '年柱' : m.pillar === 'month' ? '月柱' : m.pillar === 'day' ? '日柱' : '时柱';
    return `- ${label}: 你写的是 ${m.got}，本地基线是 ${m.expected}`;
  });
  return [
    '你上一条回复中的四柱字段与本地基线不一致，请立即修正。',
    '修正要求：',
    '1) 以本地基线为唯一正确值，不要重新排盘。',
    '2) 仅输出修正后的最终答案，不要解释“你被纠正了”。',
    `3) 本地基线：年柱=${localBaseline.year} 月柱=${localBaseline.month} 日柱=${localBaseline.day} 时柱=${localBaseline.hour}`,
    '4) 已检测到不一致字段：',
    ...lines,
  ].join('\n');
}

function normalizeTemperature(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0.6;
  return Math.min(1.2, Math.max(0, num));
}

function normalizeTopP(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0.95;
  return Math.min(1, Math.max(0, num));
}

function normalizeMaxTokens(value, mode) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return mode === 'qa'
      ? Number(process.env.AI_FORTUNE_QA_MAX_TOKENS || '420')
      : Number(process.env.AI_FORTUNE_FULL_MAX_TOKENS || '900');
  }
  return Math.min(4096, Math.max(1, Math.floor(num)));
}

function pickModel(baseModel, mode) {
  if (mode !== 'qa') return baseModel;
  return process.env.AI_FORTUNE_QA_MODEL || defaultQaModel || baseModel;
}

function getLastUserMessage(messages) {
  return [...messages].reverse().find((m) => m.role === 'user')?.content?.trim() || '';
}

function quickReplyForCommonInput(text) {
  const t = text.replace(/\s+/g, '');
  if (!t) return '';
  if (/^(你好|嗨|hello|hi|在吗|在嗎)[!！。,.]?$/i.test(t)) {
    return '在的。你可以直接问命理问题，或提供出生信息（阳历/阴历、时辰、地点、性别）后让我快速分析。';
  }
  if (/^(谢谢|感谢|thx|thanks)[!！。,.]?$/i.test(t)) {
    return '不客气。你可以继续问下一个问题。';
  }
  return '';
}

function localKnowledgeReply(text) {
  const q = text.replace(/\s+/g, '');
  if (!q) return '';
  const askWhat = q.includes('什么') || q.includes('是啥') || q.includes('是什麼') || q.includes('有哪些');
  if (q.includes('地支') && (askWhat || q.includes('十二地支'))) {
    return [
      '结论：地支是「子丑寅卯辰巳午未申酉戌亥」这12个符号，用于纪时与四柱排盘。',
      '',
      '依据：',
      '1. 地支固定为12个，顺序不可变：子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥。',
      '2. 四柱每一柱都由「天干+地支」组成，比如甲子、乙丑。',
      '',
      '下一步：如果你愿意，我可以按这12地支给你做速记法和对应时辰表。'
    ].join('\n');
  }
  if (q.includes('天干') && (askWhat || q.includes('十天干'))) {
    return [
      '结论：天干是「甲乙丙丁戊己庚辛壬癸」这10个符号，是四柱的另一半。',
      '',
      '依据：',
      '1. 天干固定10个，顺序为：甲、乙、丙、丁、戊、己、庚、辛、壬、癸。',
      '2. 与12地支组合形成干支，如甲子、乙丑，用于年/月/日/时表达。',
      '',
      '下一步：你可以给我一个具体日期，我用本地算法给你算出对应四柱。'
    ].join('\n');
  }
  if ((q.includes('天干地支') || q.includes('干支')) && askWhat) {
    return [
      '结论：干支是“10天干 + 12地支”的组合记法，用于历法纪时与命理排盘。',
      '',
      '依据：',
      '1. 天干：甲乙丙丁戊己庚辛壬癸。',
      '2. 地支：子丑寅卯辰巳午未申酉戌亥。',
      '3. 四柱中的年/月/日/时，都是以干支形式表示。',
      '',
      '下一步：如果你输入出生时间，我会先本地排盘，再基于结果解释。'
    ].join('\n');
  }
  return '';
}

function fnv1a(input) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}

function buildContextDigest(messages) {
  const recent = messages
    .filter((m) => m.role !== 'system')
    .slice(-6)
    .map((m) => `${m.role}:${String(m.content || '').trim().slice(0, 160)}`)
    .join('\n');
  if (!recent) return 'empty';
  return fnv1a(recent);
}

function makeCacheKey({ mode, model, lastUser, contextDigest, localBaziContext }) {
  const baziDigest = localBaziContext ? fnv1a(localBaziContext) : 'no_bazi';
  return `v2|${mode}|${model}|${lastUser}|${contextDigest}|${baziDigest}`;
}

function getCachedReply(cacheKey) {
  const ttlMs = Number(process.env.AI_FORTUNE_CACHE_TTL_MS || '120000');
  const now = Date.now();
  const hit = quickCache.get(cacheKey);
  if (!hit) return '';
  if (now - hit.ts > ttlMs) {
    quickCache.delete(cacheKey);
    return '';
  }
  return hit.reply;
}

function setCachedReply(cacheKey, reply) {
  const maxSize = Number(process.env.AI_FORTUNE_CACHE_MAX_SIZE || '200');
  quickCache.set(cacheKey, { reply, ts: Date.now() });
  if (quickCache.size <= maxSize) return;
  const oldest = quickCache.keys().next().value;
  if (oldest) quickCache.delete(oldest);
}

function getUpstreamUrl() {
  const base = process.env.AI_FORTUNE_BASE_URL || defaultBaseUrl;
  return `${base.replace(/\/+$/, '')}/chat/completions`;
}

async function requestUpstream({
  upstream,
  token,
  model,
  messages,
  temperature,
  topP,
  maxTokens,
  timeoutMs,
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const response = await fetch(upstream, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    signal: controller.signal,
    body: JSON.stringify({
      model,
      messages,
      temperature,
      top_p: topP,
      max_tokens: maxTokens,
      stream: false,
      enable_thinking: false,
    }),
  }).finally(() => clearTimeout(timeout));

  return response;
}

export default async function handler(req, res) {
  const requestId = `rid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed', request_id: requestId });
  }

  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ error: 'origin not allowed', request_id: requestId });
  }

  const requiredClientToken = process.env.AI_FORTUNE_CLIENT_TOKEN;
  if (requiredClientToken) {
    const clientToken = req.headers['x-client-token'];
    if (clientToken !== requiredClientToken) {
      return res.status(401).json({ error: 'invalid client token', request_id: requestId });
    }
  }

  const clientIp = getClientIp(req);
  if (hitRateLimit(clientIp)) {
    return res.status(429).json({ error: 'too many requests', request_id: requestId });
  }

  const token = process.env.MODELSCOPE_API_KEY;
  if (!token) {
    return res.status(500).json({ error: 'service not configured', request_id: requestId });
  }

  const baseModel = req.body?.model || process.env.AI_FORTUNE_MODEL || defaultModel;
  if (!isAllowedModel(baseModel)) {
    return res.status(400).json({ error: 'model not allowed', request_id: requestId });
  }

  const inputMessages = req.body?.messages || [];
  const msgError = validateMessages(inputMessages);
  if (msgError) {
    return res.status(400).json({ error: msgError, request_id: requestId });
  }
  const requestedMode = req.body?.mode;
  if (requestedMode && !['qa', 'full', 'auto'].includes(requestedMode)) {
    return res.status(400).json({ error: 'mode 不合法', request_id: requestId });
  }
  const resolvedMode = detectMode(inputMessages, requestedMode);
  const localBaziContext = sanitizeLocalBaziContext(req.body?.local_bazi_context);
  const localBaseline = parseLocalBaselineFromContext(localBaziContext);
  const model = pickModel(baseModel, resolvedMode);
  if (!isAllowedModel(model)) {
    return res.status(400).json({ error: 'model not allowed', request_id: requestId });
  }
  const latestUser = getLastUserMessage(inputMessages);
  const knowledgeReply = localKnowledgeReply(latestUser);
  if (knowledgeReply) {
    return res.status(200).json({
      reply: knowledgeReply,
      model,
      provider: 'local-knowledge',
      mode: resolvedMode,
      request_id: requestId,
    });
  }
  const quickReply = quickReplyForCommonInput(latestUser);
  if (resolvedMode === 'qa' && quickReply) {
    return res.status(200).json({
      reply: quickReply,
      model,
      provider: 'local-fast-path',
      mode: resolvedMode,
      request_id: requestId,
    });
  }
  const contextDigest = buildContextDigest(inputMessages);
  const cacheKey = makeCacheKey({
    mode: resolvedMode,
    model,
    lastUser: latestUser,
    contextDigest,
    localBaziContext,
  });
  const cachedReply = resolvedMode === 'qa' ? getCachedReply(cacheKey) : '';
  if (cachedReply) {
    return res.status(200).json({
      reply: cachedReply,
      model,
      provider: 'cache',
      mode: resolvedMode,
      request_id: requestId,
    });
  }
  const messages = buildMessages(inputMessages, resolvedMode);
  if (localBaziContext) {
    messages.splice(1, 0, {
      role: 'system',
      content:
        `${localBaziContext}\n\n` +
        '执行规则：以上“本地权威排盘基线”是唯一事实来源。你只能解释，不能改写或重算四柱/十神。',
    });
  }

  try {
    const upstream = process.env.AI_FORTUNE_API_URL || getUpstreamUrl();
    const temperature = normalizeTemperature(req.body?.temperature);
    const topP = normalizeTopP(req.body?.top_p);
    const maxTokens = normalizeMaxTokens(req.body?.max_tokens, resolvedMode);
    const timeoutMs = Number(process.env.AI_FORTUNE_TIMEOUT_MS || '90000');
    const fallbackModel = process.env.AI_FORTUNE_FALLBACK_MODEL || defaultFallbackModel;
    let selectedModel = model;
    let upstreamResp = await requestUpstream({
      upstream,
      token,
      model: selectedModel,
      messages,
      temperature,
      topP,
      maxTokens,
      timeoutMs,
    });

    if (!upstreamResp.ok) {
      const errBody = await upstreamResp.text();
      const shouldFallback =
        selectedModel !== fallbackModel && errBody.includes('has no provider supported');
      if (shouldFallback && isAllowedModel(fallbackModel)) {
        selectedModel = fallbackModel;
        upstreamResp = await requestUpstream({
          upstream,
          token,
          model: selectedModel,
          messages,
          temperature,
          topP,
          maxTokens,
          timeoutMs,
        });
      } else {
        return res.status(upstreamResp.status).json({
          error: 'upstream request failed',
          request_id: requestId,
        });
      }
    }

    const data = await upstreamResp.json();
    const reply = data?.choices?.[0]?.message?.content || '';
    if (!reply) {
      return res.status(502).json({ error: 'empty upstream response', request_id: requestId });
    }
    const initialConsistency = buildConsistencyReport(reply, localBaseline);
    let finalReply = appendCorrectionIfMismatch(reply, initialConsistency);
    let finalConsistency = initialConsistency;
    let autocorrectApplied = false;

    const enableAutocorrect = process.env.AI_FORTUNE_ENABLE_AUTOCORRECT !== 'false';
    if (
      enableAutocorrect &&
      localBaseline &&
      initialConsistency.checked &&
      initialConsistency.mismatchCount > 0
    ) {
      const correctionInstruction = buildAutocorrectInstruction(
        localBaseline,
        initialConsistency.mismatches || []
      );
      const correctionMessages = [
        ...messages,
        { role: 'assistant', content: reply },
        { role: 'system', content: correctionInstruction },
      ];
      const retryResp = await requestUpstream({
        upstream,
        token,
        model: selectedModel,
        messages: correctionMessages,
        temperature: Math.min(temperature, 0.4),
        topP,
        maxTokens,
        timeoutMs,
      });
      if (retryResp.ok) {
        const retryData = await retryResp.json();
        const retryReply = retryData?.choices?.[0]?.message?.content || '';
        if (retryReply) {
          const retryConsistency = buildConsistencyReport(retryReply, localBaseline);
          if (retryConsistency.mismatchCount <= initialConsistency.mismatchCount) {
            finalReply = appendCorrectionIfMismatch(retryReply, retryConsistency);
            finalConsistency = retryConsistency;
            autocorrectApplied = true;
          }
        }
      }
    }

    if (resolvedMode === 'qa' && latestUser) {
      setCachedReply(cacheKey, finalReply);
    }

    return res.status(200).json({
      reply: finalReply,
      model: data?.model || selectedModel,
      provider: 'modelscope',
      mode: resolvedMode,
      consistency: finalConsistency,
      autocorrect_applied: autocorrectApplied,
      request_id: requestId,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('[fortune-chat] request failed', {
      request_id: requestId,
      message: errMsg,
      name: error instanceof Error ? error.name : 'unknown',
    });
    if (error instanceof Error && error.name === 'AbortError') {
      return res.status(504).json({ error: 'upstream timeout', request_id: requestId });
    }
    return res.status(500).json({ error: 'internal error', request_id: requestId });
  }
}
