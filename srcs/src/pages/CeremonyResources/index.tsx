import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { ceremonyResourcesService } from '../../services/ceremony/ceremonyResourcesService';
import {
  FiveElementsRuleTable,
  SolarTermBoundaryRuleTable,
  TenGodRuleTable,
} from '../../components/knowledge/RuleReferenceCards';

type EncyclopediaTopic = {
  id: string;
  title: string;
  description: string;
  tags: string[];
};

const TOPICS: EncyclopediaTopic[] = [
  {
    id: 'topic_bazi',
    title: '八字基础体系',
    description: '聚焦日主、十神、格局与取用等四柱核心概念。',
    tags: ['sizhu_bazi'],
  },
  {
    id: 'topic_wuxing_jieqi',
    title: '五行与节气历法',
    description: '聚焦五行生克、交节边界与时间校验相关概念。',
    tags: ['wuxing_energy'],
  },
  {
    id: 'topic_liuren',
    title: '六壬扩展体系',
    description: '聚焦六壬课体、起课顺序与快速起盘方法。',
    tags: ['natural_object_ceremonies'],
  },
];

const CeremonyResources: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = React.useState('');
  const [termMatchMode, setTermMatchMode] = React.useState<'any' | 'all'>(
    (searchParams.get('mode') as 'any' | 'all') || 'any'
  );
  const [selectedTerms, setSelectedTerms] = React.useState<string[]>(
    (searchParams.get('term') ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  );
  const resources = ceremonyResourcesService.getAllResources();
  const snippets = ceremonyResourcesService.getProjectTextSnippets();
  const entries = ceremonyResourcesService.getLearningMaterials();
  const meta = ceremonyResourcesService.getLearningMaterialsMeta();
  const normalizedQuery = query.trim().toLowerCase();
  const filteredEntries = entries.filter((entry) => {
    const haystack = [
      entry.title,
      entry.knowledgePointTitle,
      entry.learningGoal,
      entry.scopeBoundary,
      entry.minimumAlgorithm,
      entry.counterExample,
      entry.sourceNote,
      ...entry.coreConcepts,
      ...entry.commonMisconceptions,
      ...entry.glossary,
      ...entry.publicSearchKeywords,
    ]
      .join(' ')
      .toLowerCase();
    const queryMatch = !normalizedQuery || haystack.includes(normalizedQuery);
    const termMatch =
      selectedTerms.length === 0 ||
      (termMatchMode === 'any'
        ? selectedTerms.some((term) => entry.glossary.some((item) => item.includes(term)))
        : selectedTerms.every((term) => entry.glossary.some((item) => item.includes(term))));
    return queryMatch && termMatch;
  });
  const getEntriesByTopic = (topic: EncyclopediaTopic) =>
    filteredEntries.filter((entry) => entry.tags.some((tag) => topic.tags.includes(tag)));
  const getTopicHitCount = (topic: EncyclopediaTopic) => getEntriesByTopic(topic).length;
  const glossaryMap = new Map<string, string>();
  entries.forEach((entry) => {
    entry.glossary.forEach((item) => {
      const [term, ...rest] = item.split(/[：:]/);
      const key = term.trim();
      const desc = rest.join('：').trim();
      if (!key || glossaryMap.has(key)) return;
      glossaryMap.set(key, desc || item.trim());
    });
  });
  const glossaryList = Array.from(glossaryMap.entries()).sort((a, b) => a[0].localeCompare(b[0], 'zh-Hans-CN'));

  React.useEffect(() => {
    const urlTerms = (searchParams.get('term') ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const urlMode = (searchParams.get('mode') as 'any' | 'all') || 'any';
    if (urlTerms.join('|') !== selectedTerms.join('|')) {
      setSelectedTerms(urlTerms);
    }
    if (urlMode !== termMatchMode) {
      setTermMatchMode(urlMode);
    }
  }, [searchParams, selectedTerms, termMatchMode]);

  React.useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (selectedTerms.length > 0) {
      next.set('term', selectedTerms.join(','));
      next.set('mode', termMatchMode);
    } else {
      next.delete('term');
      next.delete('mode');
    }
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, selectedTerms, termMatchMode, setSearchParams]);

  React.useEffect(() => {
    if (selectedTerms.length === 0) return;
    const target = document.getElementById(`glossary-${selectedTerms[0]}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedTerms]);

  const toggleTerm = (term: string) => {
    setSelectedTerms((prev) =>
      prev.includes(term) ? prev.filter((item) => item !== term) : [...prev, term]
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        命理概念词条库
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        本页采用百科式结构，按“概念定义-核心要点-原文摘录-关联词条”整理项目资料，不做考试化交互。
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        词条由项目文本自动整理，当前共 {meta.count} 条，最近更新时间：{new Date(meta.generatedAt).toLocaleString('zh-CN')}
      </Alert>

      <Typography variant="h6" gutterBottom>
        仪式主题目录
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {resources.map((resource) => (
          <Grid item xs={12} sm={6} md={4} key={resource.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Chip label={resource.category} size="small" sx={{ mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  {resource.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {resource.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button component={RouterLink} to={resource.route} size="small">
                  查看主题
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        项目概念摘录
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {snippets.map((snippet) => (
          <Grid item xs={12} md={6} key={snippet.id}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {snippet.title}
                </Typography>
                <Typography variant="body2">{snippet.excerpt}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        术语总表
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {glossaryList.map(([term, desc]) => (
          <Grid item xs={12} md={6} key={term}>
            <Card
              id={`glossary-${term}`}
              variant="outlined"
              sx={{
                borderColor: selectedTerms.includes(term) ? 'primary.main' : undefined,
                boxShadow: selectedTerms.includes(term) ? 2 : undefined,
              }}
            >
              <CardContent>
                <Typography
                  variant="subtitle2"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => toggleTerm(term)}
                >
                  {term}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {desc}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    variant={selectedTerms.includes(term) ? 'contained' : 'outlined'}
                    onClick={() => toggleTerm(term)}
                  >
                    {selectedTerms.includes(term) ? '已筛选' : '按术语筛选'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        规则速查区
      </Typography>
      <Accordion disableGutters sx={{ mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">五行生克速查</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FiveElementsRuleTable />
        </AccordionDetails>
      </Accordion>
      <Accordion disableGutters sx={{ mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">十神判定速查</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TenGodRuleTable />
        </AccordionDetails>
      </Accordion>
      <Accordion disableGutters sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">交节边界速查</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SolarTermBoundaryRuleTable />
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        概念词条（百科形式）
      </Typography>
      <TextField
        fullWidth
        size="small"
        label="搜索词条关键词"
        placeholder="例如：十神 / 交节 / 六壬 / 月令"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        sx={{ mb: 2 }}
      />
      {selectedTerms.length > 0 && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => setSelectedTerms([])}>
              清除全部术语
            </Button>
          }
        >
          当前术语筛选（{termMatchMode === 'any' ? '并集' : '交集'}）：{selectedTerms.join(' / ')}
        </Alert>
      )}
      {selectedTerms.length > 1 && (
        <Box sx={{ mb: 1.5, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">
            术语匹配模式：
          </Typography>
          <Button
            size="small"
            variant={termMatchMode === 'any' ? 'contained' : 'outlined'}
            onClick={() => setTermMatchMode('any')}
          >
            并集（命中任一术语）
          </Button>
          <Button
            size="small"
            variant={termMatchMode === 'all' ? 'contained' : 'outlined'}
            onClick={() => setTermMatchMode('all')}
          >
            交集（命中全部术语）
          </Button>
        </Box>
      )}
      {selectedTerms.length > 0 && (
        <Box sx={{ mb: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {selectedTerms.map((term) => (
            <Chip
              key={`selected-term-${term}`}
              label={term}
              color="primary"
              onDelete={() => setSelectedTerms((prev) => prev.filter((item) => item !== term))}
            />
          ))}
        </Box>
      )}
      <Alert severity="success" sx={{ mb: 2 }}>
        检索结果：{filteredEntries.length} / {entries.length} 条
      </Alert>
      <Box sx={{ mb: 2 }}>
        {TOPICS.map((topic) => (
          <Chip
            key={topic.id}
            label={`${topic.title}（${getTopicHitCount(topic)}）`}
            size="small"
            component="a"
            clickable
            href={`#${topic.id}`}
            color={selectedTerms.length > 0 && getTopicHitCount(topic) > 0 ? 'primary' : 'default'}
            variant={selectedTerms.length > 0 && getTopicHitCount(topic) === 0 ? 'outlined' : 'filled'}
            sx={{
              mr: 1,
              mb: 1,
              opacity: selectedTerms.length > 0 && getTopicHitCount(topic) === 0 ? 0.45 : 1,
            }}
          />
        ))}
      </Box>

      {filteredEntries.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          当前关键词未命中词条，请尝试更短的关键词或同义词。
        </Typography>
      )}

      {TOPICS.map((topic) => {
        const topicEntries = getEntriesByTopic(topic);
        if (topicEntries.length === 0) return null;
        return (
          <Box
            key={topic.id}
            id={topic.id}
            sx={{
              mb: 3,
              scrollMarginTop: 88,
              opacity: selectedTerms.length > 0 && topicEntries.length === 0 ? 0.4 : 1,
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              {topic.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {topic.description}
            </Typography>
            {selectedTerms.length > 0 && (
              <Alert severity={topicEntries.length > 0 ? 'success' : 'info'} sx={{ mb: 1.5 }}>
                {topicEntries.length > 0
                  ? `该主题命中 ${topicEntries.length} 条术语相关词条`
                  : '该主题暂无术语命中词条'}
              </Alert>
            )}
            <Grid container spacing={2}>
              {topicEntries.map((entry) => (
                <Grid item xs={12} md={6} key={entry.id}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {entry.sequence}. {entry.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        本质定义：{entry.knowledgePointTitle}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        关键说明：{entry.learningGoal}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        适用边界：{entry.scopeBoundary}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          必须掌握：
                        </Typography>
                        {entry.coreConcepts.slice(0, 2).map((concept) => (
                          <Typography key={concept} variant="body2">
                            - {concept}
                          </Typography>
                        ))}
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                        规则速览：{entry.minimumAlgorithm}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                        常见误区：{entry.commonMisconceptions[0]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        出处：{entry.sourceNote}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        关联检索词：{entry.publicSearchKeywords.join(' / ')}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button component={RouterLink} to={`/learning/materials/${entry.id}`} size="small">
                        查看词条详情
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}
    </Container>
  );
};

export default CeremonyResources;
