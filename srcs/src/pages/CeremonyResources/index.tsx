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
  FormControlLabel,
  Grid,
  Link as MuiLink,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockIcon from '@mui/icons-material/Lock';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { ceremonyResourcesService } from '../../services/ceremony/ceremonyResourcesService';

const COMPLETED_STORAGE_KEY = 'ming_learning_material_completed_ids';

const readCompleted = (): string[] => {
  try {
    const raw = localStorage.getItem(COMPLETED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const CeremonyResources: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const resources = ceremonyResourcesService.getAllResources();
  const snippets = ceremonyResourcesService.getProjectTextSnippets();
  const learningMaterials = ceremonyResourcesService.getLearningMaterials();
  const learningMeta = ceremonyResourcesService.getLearningMaterialsMeta();
  const [completedIds, setCompletedIds] = React.useState<string[]>([]);
  const [showOnlyPending, setShowOnlyPending] = React.useState(false);
  const [pendingFilter, setPendingFilter] = React.useState<'all' | 'unlocked' | 'locked'>('all');
  const focusId = searchParams.get('focus');

  React.useEffect(() => {
    setCompletedIds(readCompleted());

    const reload = () => setCompletedIds(readCompleted());
    window.addEventListener('focus', reload);
    window.addEventListener('storage', reload);
    return () => {
      window.removeEventListener('focus', reload);
      window.removeEventListener('storage', reload);
    };
  }, []);

  React.useEffect(() => {
    if (!focusId) return;
    const timer = window.setTimeout(() => {
      const target = document.getElementById(`learning-card-${focusId}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const next = new URLSearchParams(searchParams);
      next.delete('focus');
      setSearchParams(next, { replace: true });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [focusId, searchParams, setSearchParams]);

  const completedCount = completedIds.filter((id) =>
    learningMaterials.some((material) => material.id === id)
  ).length;
  const completedSet = new Set(completedIds);
  const recommendation = ceremonyResourcesService.getRecommendedNextLearningMaterial(completedIds);
  const nextMaterial = recommendation.material;
  const allCompleted = learningMaterials.length > 0 && completedCount >= learningMaterials.length;
  const beginnerMaterials = learningMaterials.filter((material) => material.level === '入门');
  const advancedMaterials = learningMaterials.filter((material) => material.level === '进阶');
  const isUnlocked = (material: (typeof learningMaterials)[number]) =>
    material.prerequisites.every((item) => completedSet.has(item));
  const pendingMaterials = learningMaterials.filter((material) => !completedIds.includes(material.id));
  const unlockedPendingMaterials = pendingMaterials.filter((material) => isUnlocked(material));
  const lockedPendingMaterials = pendingMaterials.filter((material) => !isUnlocked(material));
  const visibleMaterials = (() => {
    if (!showOnlyPending) return learningMaterials;
    if (pendingFilter === 'unlocked') return unlockedPendingMaterials;
    if (pendingFilter === 'locked') return lockedPendingMaterials;
    return pendingMaterials;
  })();
  const formatPrerequisites = (ids: string[]) =>
    ids
      .map((item) => ceremonyResourcesService.getLearningMaterialById(item)?.title ?? item)
      .join(' / ');
  const prerequisiteEntries = (ids: string[], returnToId?: string) =>
    ids.map((item) => ({
      id: item,
      title: ceremonyResourcesService.getLearningMaterialById(item)?.title ?? item,
      to: returnToId ? `/learning/materials/${item}?returnTo=${returnToId}` : `/learning/materials/${item}`,
    }));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        学习资料中心
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        面向命理学习场景整理的功能型资料页：每份文件对应一个知识点，包含学习目标、核心概念、练习任务与示例摘录。
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        学习资料由脚本从项目文本自动整理，当前共 {learningMeta.count} 份，最近生成时间：{new Date(learningMeta.generatedAt).toLocaleString('zh-CN')}
      </Alert>
      <Alert severity="success" sx={{ mb: 3 }}>
        学习进度：已完成 {completedCount} / {learningMaterials.length} 份
      </Alert>
      {recommendation.reason !== 'blocked' && nextMaterial && (
        <Alert severity={allCompleted ? 'info' : 'warning'} sx={{ mb: 3 }}>
          {allCompleted ? '你已完成全部资料，可从头复习。' : `推荐下一条：${nextMaterial.title}`}
          <Box sx={{ mt: 1 }}>
            <Button component={RouterLink} to={`/learning/materials/${nextMaterial.id}`} size="small" variant="contained">
              {allCompleted ? '重新学习' : '继续学习'}
            </Button>
          </Box>
        </Alert>
      )}
      {recommendation.reason === 'blocked' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          当前没有可直接学习的知识点，请先完成已解锁的前置内容后再继续。
        </Alert>
      )}

      <Typography variant="h6" gutterBottom>
        仪式资源目录
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
                  查看详情
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        项目学习摘录
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
        结构化学习资料（每文件一个知识点）
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        学习路径：先完成“入门”再进入“进阶”。每个知识点均包含目标、概念和练习任务。
      </Typography>
      <Box sx={{ mb: 2 }}>
        {beginnerMaterials.length > 0 && (
          <Chip label={`入门 ${beginnerMaterials.length} 份`} color="primary" size="small" sx={{ mr: 1 }} />
        )}
        {advancedMaterials.length > 0 && (
          <Chip label={`进阶 ${advancedMaterials.length} 份`} color="secondary" size="small" />
        )}
      </Box>
      <FormControlLabel
        sx={{ mb: 1 }}
        control={<Switch checked={showOnlyPending} onChange={(_, checked) => setShowOnlyPending(checked)} />}
        label="仅看未完成"
      />
      {showOnlyPending && (
        <Box sx={{ mb: 1.5 }}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={pendingFilter}
            onChange={(_, value: 'all' | 'unlocked' | 'locked' | null) => {
              if (value) setPendingFilter(value);
            }}
          >
            <ToggleButton value="all">全部未完成</ToggleButton>
            <ToggleButton value="unlocked">可学未完成</ToggleButton>
            <ToggleButton value="locked">锁定未完成</ToggleButton>
          </ToggleButtonGroup>
          <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="contained"
              component={unlockedPendingMaterials[0] ? RouterLink : 'button'}
              to={unlockedPendingMaterials[0] ? `/learning/materials/${unlockedPendingMaterials[0].id}` : undefined}
              disabled={!unlockedPendingMaterials[0]}
            >
              一键学习首个可学项
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setPendingFilter('locked')}
              disabled={lockedPendingMaterials.length === 0}
            >
              查看锁定项（{lockedPendingMaterials.length}）
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
              可学 {unlockedPendingMaterials.length} / 锁定 {lockedPendingMaterials.length}
            </Typography>
          </Box>
        </Box>
      )}

      <Typography variant="subtitle1" gutterBottom>
        学习路径图
      </Typography>
      <Box
        sx={{
          mb: 2,
          p: 1.5,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          backgroundColor: 'background.paper',
          overflowX: 'auto',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 720 }}>
          {learningMaterials.map((material, index) => {
            const completed = completedIds.includes(material.id);
            const unlocked = isUnlocked(material);
            const isRecommended = recommendation.reason === 'next_unlocked' && nextMaterial?.id === material.id;
            return (
              <React.Fragment key={`path-${material.id}`}>
                <Card
                  variant="outlined"
                  component={unlocked ? RouterLink : 'div'}
                  to={unlocked ? `/learning/materials/${material.id}` : undefined}
                  sx={{
                    minWidth: 220,
                    borderColor: completed ? 'success.main' : 'divider',
                    backgroundColor: completed ? 'success.light' : isRecommended ? 'warning.light' : 'background.default',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: unlocked ? 'translateY(-2px)' : 'none',
                      boxShadow: unlocked ? 2 : 0,
                    },
                    opacity: unlocked ? 1 : 0.7,
                    cursor: unlocked ? 'pointer' : 'not-allowed',
                  }}
                >
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {material.sequence}. {material.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      级别：{material.level}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      先修：{material.prerequisites.length > 0 ? formatPrerequisites(material.prerequisites) : '无'}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: completed ? 'success.dark' : 'text.secondary', fontWeight: 600 }}
                    >
                      {completed ? '已完成' : !unlocked ? '已锁定' : isRecommended ? '推荐学习' : '待学习'}
                    </Typography>
                    {!unlocked && (
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="warning.dark" display="block">
                          需先完成：
                        </Typography>
                        {prerequisiteEntries(material.prerequisites, material.id).map((entry) => (
                          <MuiLink
                            key={`path-prereq-${material.id}-${entry.id}`}
                            component={RouterLink}
                            to={entry.to}
                            underline="hover"
                            sx={{ mr: 1 }}
                            variant="caption"
                          >
                            {entry.title}
                          </MuiLink>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
                {index < learningMaterials.length - 1 && (
                  <Box sx={{ px: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <ArrowForwardIcon fontSize="small" />
                  </Box>
                )}
              </React.Fragment>
            );
          })}
        </Box>
      </Box>

      <Grid container spacing={2}>
        {visibleMaterials.map((material) => (
          <Grid item xs={12} md={6} key={material.id}>
              {(() => {
                const unlocked = isUnlocked(material);
                return (
              <Card
                id={`learning-card-${material.id}`}
                variant="outlined"
                sx={{
                  height: '100%',
                  borderColor: focusId === material.id ? 'warning.main' : undefined,
                  boxShadow: focusId === material.id ? 3 : undefined,
                }}
              >
                <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {material.sequence}. {material.title}
                </Typography>
                {completedIds.includes(material.id) && (
                  <Chip label="已完成" color="success" size="small" sx={{ mb: 1 }} />
                )}
                <Chip label={material.level} size="small" sx={{ mb: 1, ml: 1 }} />
                {!unlocked && (
                  <Chip icon={<LockIcon />} label="未解锁" color="warning" size="small" sx={{ mb: 1, ml: 1 }} />
                )}
                <Typography variant="body2" color="text.secondary" paragraph>
                  知识点：{material.knowledgePointTitle}
                </Typography>
                {material.prerequisites.length > 0 && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      先修：
                    </Typography>
                    {prerequisiteEntries(material.prerequisites, material.id).map((entry) => (
                      <MuiLink
                        key={`card-prereq-${material.id}-${entry.id}`}
                        component={RouterLink}
                        to={entry.to}
                        underline="hover"
                        sx={{ mr: 1 }}
                        variant="caption"
                      >
                        {entry.title}
                      </MuiLink>
                    ))}
                  </Box>
                )}
                {!unlocked && (
                  <Typography variant="caption" color="warning.dark" display="block" sx={{ mb: 1 }}>
                    当前已锁定，请先完成前置知识点。
                  </Typography>
                )}
                <Typography variant="body2" paragraph>
                  学习目标：{material.learningGoal}
                </Typography>
                <Box sx={{ mb: 1 }}>
                  {material.coreConcepts.map((concept) => (
                    <Chip key={concept} label={concept} size="small" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                  练习任务
                </Typography>
                <Typography variant="body2" paragraph>
                  {material.practicePrompt}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  建议检索词：{material.publicSearchKeywords.join(' / ')}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  component={unlocked ? RouterLink : 'button'}
                  to={unlocked ? `/learning/materials/${material.id}` : undefined}
                  size="small"
                  disabled={!unlocked}
                >
                  {unlocked ? '进入学习' : '先完成前置'}
                </Button>
              </CardActions>
            </Card>
                );
              })()}
          </Grid>
        ))}
      </Grid>
      {visibleMaterials.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          当前筛选下暂无资料。
        </Typography>
      )}
    </Container>
  );
};

export default CeremonyResources;
