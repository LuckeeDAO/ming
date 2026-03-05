import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  FortuneChatMode,
  FortuneChatMessage,
  sendFortuneChat,
} from '../../services/ai/fortuneChatService';
import {
  buildLocalBaziBaselineFromText,
  formatLocalBaziBaseline,
} from '../../services/ai/localBaziBaseline';

const STORAGE_CONVERSATION_KEY = 'ai_fortune_conversation_v1';
const STORAGE_DRAFT_KEY = 'ai_fortune_draft_v1';
const STORAGE_MODE_KEY = 'ai_fortune_mode_v1';
const STORAGE_LOCAL_BAZI_CONTEXT_KEY = 'ai_fortune_local_bazi_context_v1';

const initialAssistantMessage: FortuneChatMessage = {
  role: 'assistant',
  content:
    '欢迎来到 AI 命理学习。默认是“快速问答”模式；若你提供完整出生信息并希望系统化分析，请切到“深度解析”。',
};

function resolveLatestLocalBaziContext(messages: FortuneChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const item = messages[i];
    if (item.role !== 'user') continue;
    const baseline = buildLocalBaziBaselineFromText(item.content || '');
    if (baseline) {
      return formatLocalBaziBaseline(baseline);
    }
  }
  return '';
}

const AIFortune: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [consistencyHint, setConsistencyHint] = useState('');
  const [mode, setMode] = useState<FortuneChatMode>('qa');
  const [conversation, setConversation] = useState<FortuneChatMessage[]>([initialAssistantMessage]);
  const [latestLocalBaziContext, setLatestLocalBaziContext] = useState('');

  useEffect(() => {
    try {
      const rawConversation = localStorage.getItem(STORAGE_CONVERSATION_KEY);
      const rawDraft = localStorage.getItem(STORAGE_DRAFT_KEY);
      const rawMode = localStorage.getItem(STORAGE_MODE_KEY);
      const rawLocalBaziContext = localStorage.getItem(STORAGE_LOCAL_BAZI_CONTEXT_KEY);
      if (rawConversation) {
        const parsed = JSON.parse(rawConversation);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversation(parsed);
        }
      }
      if (typeof rawDraft === 'string') {
        setQuestion(rawDraft);
      }
      if (rawMode === 'qa' || rawMode === 'full') {
        setMode(rawMode);
      }
      if (typeof rawLocalBaziContext === 'string' && rawLocalBaziContext.trim()) {
        setLatestLocalBaziContext(rawLocalBaziContext);
      }
    } catch {
      // ignore broken local storage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_CONVERSATION_KEY, JSON.stringify(conversation));
  }, [conversation]);

  useEffect(() => {
    localStorage.setItem(STORAGE_DRAFT_KEY, question);
  }, [question]);

  useEffect(() => {
    localStorage.setItem(STORAGE_MODE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    if (latestLocalBaziContext) {
      localStorage.setItem(STORAGE_LOCAL_BAZI_CONTEXT_KEY, latestLocalBaziContext);
    } else {
      localStorage.removeItem(STORAGE_LOCAL_BAZI_CONTEXT_KEY);
    }
  }, [latestLocalBaziContext]);

  const modeHint = useMemo(() => {
    if (mode === 'full') {
      return '深度解析：适合已提供完整出生信息（日期、时辰、地点、性别）的系统化分析。';
    }
    return '快速问答：适合概念提问、局部问题，不会强制展开全量框架。';
  }, [mode]);

  const onSend = async () => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError('');
    setConsistencyHint('');

    const nextConversation: FortuneChatMessage[] = [
      ...conversation,
      { role: 'user', content: trimmed },
    ];
    setConversation(nextConversation);
    try {
      localStorage.setItem(STORAGE_CONVERSATION_KEY, JSON.stringify(nextConversation));
    } catch {
      // ignore local storage write failures
    }
    setQuestion('');

    try {
      const localBaziContextFromConversation = resolveLatestLocalBaziContext(nextConversation);
      const effectiveLocalBaziContext = localBaziContextFromConversation || latestLocalBaziContext;
      if (localBaziContextFromConversation && localBaziContextFromConversation !== latestLocalBaziContext) {
        setLatestLocalBaziContext(localBaziContextFromConversation);
      }
      const result = await sendFortuneChat(nextConversation, mode, effectiveLocalBaziContext);
      setConversation([
        ...nextConversation,
        {
          role: 'assistant',
          content: result.reply || '模型未返回有效内容，请稍后重试。',
        },
      ]);
      if (result.consistency?.checked && result.consistency.mismatchCount > 0) {
        const corrected = result.autocorrect_applied ? '已自动纠偏后返回。' : '已附加纠偏说明。';
        setConsistencyHint(`检测到排盘冲突 ${result.consistency.mismatchCount} 处，${corrected}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '调用失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    if (loading) return;
    setError('');
    setQuestion('');
    setConversation([initialAssistantMessage]);
    setLatestLocalBaziContext('');
    localStorage.removeItem(STORAGE_CONVERSATION_KEY);
    localStorage.removeItem(STORAGE_DRAFT_KEY);
    localStorage.removeItem(STORAGE_LOCAL_BAZI_CONTEXT_KEY);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          AI命理学习
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          支持“快速问答”和“深度解析”两种模式，避免无关的模板化长回复。
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="fortune-mode-label">回答模式</InputLabel>
            <Select
              labelId="fortune-mode-label"
              value={mode}
              label="回答模式"
              onChange={(e) => setMode(e.target.value as FortuneChatMode)}
              disabled={loading}
            >
              <MenuItem value="qa">快速问答</MenuItem>
              <MenuItem value="full">深度解析</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {modeHint}
            </Typography>
          </Box>
        </Stack>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack spacing={2}>
              {conversation.map((item, idx) => (
                <Box
                  key={`${item.role}-${idx}`}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: item.role === 'user' ? 'action.hover' : 'grey.100',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {item.role === 'user' ? '你' : 'AI助教'}
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {item.content}
                  </Typography>
                </Box>
              ))}

              {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">
                    正在思考...
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {consistencyHint && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {consistencyHint}
          </Alert>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            maxRows={5}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={mode === 'full'
              ? '请输入出生信息与问题，例如：阳历1995-08-14 09:30，杭州，女；或 农历1995年七月十九巳时，杭州，女。'
              : '请输入问题，例如：日主偏弱怎么判断用神？'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={onSend}
            disabled={loading || !question.trim()}
            sx={{ minWidth: 120 }}
          >
            发送
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onReset}
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            清空会话
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default AIFortune;
