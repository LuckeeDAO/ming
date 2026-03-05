import React from 'react';
import {
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
import { Link as RouterLink } from 'react-router-dom';
import { ceremonyResourcesService } from '../../services/ceremony/ceremonyResourcesService';

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
  const [query, setQuery] = React.useState('');
  const resources = ceremonyResourcesService.getAllResources();
  const snippets = ceremonyResourcesService.getProjectTextSnippets();
  const entries = ceremonyResourcesService.getLearningMaterials();
  const meta = ceremonyResourcesService.getLearningMaterialsMeta();
  const normalizedQuery = query.trim().toLowerCase();
  const filteredEntries = entries.filter((entry) => {
    if (!normalizedQuery) return true;
    const haystack = [
      entry.title,
      entry.knowledgePointTitle,
      entry.learningGoal,
      ...entry.coreConcepts,
      ...entry.publicSearchKeywords,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });
  const getEntriesByTopic = (topic: EncyclopediaTopic) =>
    filteredEntries.filter((entry) => entry.tags.some((tag) => topic.tags.includes(tag)));

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
      <Alert severity="success" sx={{ mb: 2 }}>
        检索结果：{filteredEntries.length} / {entries.length} 条
      </Alert>
      <Box sx={{ mb: 2 }}>
        {TOPICS.map((topic) => (
          <Chip
            key={topic.id}
            label={`${topic.title}（${getEntriesByTopic(topic).length}）`}
            size="small"
            component="a"
            clickable
            href={`#${topic.id}`}
            sx={{ mr: 1, mb: 1 }}
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
          <Box key={topic.id} id={topic.id} sx={{ mb: 3, scrollMarginTop: 88 }}>
            <Typography variant="subtitle1" gutterBottom>
              {topic.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {topic.description}
            </Typography>
            <Grid container spacing={2}>
              {topicEntries.map((entry) => (
                <Grid item xs={12} md={6} key={entry.id}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {entry.sequence}. {entry.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        概念定义：{entry.knowledgePointTitle}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        概念说明：{entry.learningGoal}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        {entry.coreConcepts.map((concept) => (
                          <Chip key={concept} label={concept} size="small" sx={{ mr: 1, mb: 1 }} />
                        ))}
                      </Box>
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
