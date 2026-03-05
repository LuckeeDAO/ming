import React from 'react';
import { useLocation, useNavigate, useParams, Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Container,
  Link,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Typography,
} from '@mui/material';
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

const writeCompleted = (ids: string[]) => {
  localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(ids));
};

const LearningMaterialDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const material = id ? ceremonyResourcesService.getLearningMaterialById(id) : undefined;
  const returnTo = searchParams.get('returnTo') ?? undefined;
  const returnTarget = returnTo ? ceremonyResourcesService.getLearningMaterialById(returnTo) : undefined;
  const [completedIds, setCompletedIds] = React.useState<string[]>(() => readCompleted());
  const [showReturnToast, setShowReturnToast] = React.useState(false);
  const [returnToastText, setReturnToastText] = React.useState('');

  const navigation = material
    ? ceremonyResourcesService.getLearningMaterialNavigation(material.id)
    : { index: -1, total: 0 };
  const isCompleted = !!material && completedIds.includes(material.id);
  const completedSet = new Set(completedIds);
  const missingPrerequisites = material
    ? material.prerequisites.filter((item) => !completedSet.has(item))
    : [];
  const isLocked = missingPrerequisites.length > 0;
  const isReturnTargetUnlocked = returnTarget
    ? returnTarget.prerequisites.every((item) => completedSet.has(item))
    : false;
  const prerequisiteTitles = material
    ? material.prerequisites
        .map((item) => ceremonyResourcesService.getLearningMaterialById(item)?.title ?? item)
        .join(' / ')
    : '';

  React.useEffect(() => {
    const state = location.state as { autoReturned?: boolean; fromTitle?: string } | null;
    if (state?.autoReturned) {
      setReturnToastText(state.fromTitle ? `已完成前置并返回：${state.fromTitle}` : '已返回目标知识点');
      setShowReturnToast(true);
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }
  }, [location.pathname, location.search, location.state, navigate]);

  const toggleCompleted = () => {
    if (!material) return;
    if (isCompleted) {
      const next = completedIds.filter((item) => item !== material.id);
      setCompletedIds(next);
      writeCompleted(next);
    } else {
      const next = [...completedIds, material.id];
      setCompletedIds(next);
      writeCompleted(next);
      if (returnTarget) {
        const nextSet = new Set(next);
        const unlocked = returnTarget.prerequisites.every((item) => nextSet.has(item));
        if (unlocked) {
          navigate(`/learning/materials/${returnTarget.id}`, {
            state: { autoReturned: true, fromTitle: material.title },
          });
        }
      }
    }
  };

  if (!material) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link component={RouterLink} color="inherit" to="/ceremony-resources">
            学习资料中心
          </Link>
          <Typography color="text.primary">资料详情</Typography>
        </Breadcrumbs>
        <Typography variant="h5" gutterBottom>
          未找到学习资料
        </Typography>
        <Typography variant="body2" color="text.secondary">
          请返回学习资料中心重新选择。
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link component={RouterLink} color="inherit" to={`/ceremony-resources?focus=${material.id}`}>
            学习资料中心
          </Link>
          <Typography color="text.primary">{material.title}</Typography>
        </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        {material.sequence}. {material.title}
      </Typography>
      {isLocked && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          当前知识点尚未解锁，请先完成前置知识点：{missingPrerequisites.map((item) => ceremonyResourcesService.getLearningMaterialById(item)?.title ?? item).join(' / ')}
        </Alert>
      )}
      {returnTarget && (
        <Alert severity={isReturnTargetUnlocked ? 'success' : 'info'} sx={{ mb: 2 }}>
          回跳目标：{returnTarget.title}
          <Box sx={{ mt: 1 }}>
            <Button
              size="small"
              variant="outlined"
              component={isReturnTargetUnlocked ? RouterLink : 'button'}
              to={isReturnTargetUnlocked ? `/learning/materials/${returnTarget.id}` : undefined}
              disabled={!isReturnTargetUnlocked}
            >
              {isReturnTargetUnlocked ? '返回目标知识点' : '尚未解锁，继续完成前置'}
            </Button>
          </Box>
        </Alert>
      )}
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
        进度：第 {navigation.index + 1} / {navigation.total} 份资料
      </Typography>
      <Box sx={{ mb: 1 }}>
        <Chip label={material.level} size="small" />
      </Box>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        知识点：{material.knowledgePointTitle}
      </Typography>
      {material.prerequisites.length > 0 && (
        <Typography variant="body2" color="text.secondary" paragraph>
          先修建议：{prerequisiteTitles}
        </Typography>
      )}
      <Typography variant="body1" paragraph>
        学习目标：{material.learningGoal}
      </Typography>

      <Box sx={{ mb: 2 }}>
        {material.coreConcepts.map((concept) => (
          <Chip key={concept} label={concept} size="small" sx={{ mr: 1, mb: 1 }} />
        ))}
      </Box>

      <Typography variant="h6" gutterBottom>
        核心摘录
      </Typography>
      {isLocked ? (
        <Typography variant="body2" color="text.secondary">
          完成前置知识点后，将解锁本条详细摘录与练习任务。
        </Typography>
      ) : (
        <List dense>
          {material.excerptBlocks.map((excerpt) => (
            <ListItem key={excerpt} sx={{ alignItems: 'flex-start' }}>
              <ListItemText primary={excerpt} />
            </ListItem>
          ))}
        </List>
      )}

      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        练习任务
      </Typography>
      {isLocked ? (
        <Typography variant="body2" color="text.secondary" paragraph>
          当前未解锁，暂不显示练习任务。
        </Typography>
      ) : (
        <Typography variant="body1" paragraph>
          {material.practicePrompt}
        </Typography>
      )}

      <Typography variant="h6" gutterBottom>
        建议检索词
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {material.publicSearchKeywords.join(' / ')}
      </Typography>

      <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button variant={isCompleted ? 'outlined' : 'contained'} onClick={toggleCompleted} disabled={isLocked}>
          {isCompleted ? '已完成，取消标记' : '标记为已完成'}
        </Button>
        {isLocked &&
          missingPrerequisites.map((item) => (
            <Button
              key={item}
              component={RouterLink}
              to={`/learning/materials/${item}${returnTarget ? `?returnTo=${returnTarget.id}` : ''}`}
              variant="outlined"
            >
              去学前置：{ceremonyResourcesService.getLearningMaterialById(item)?.sequence ?? ''}. {ceremonyResourcesService.getLearningMaterialById(item)?.title ?? item}
            </Button>
          ))}
        {navigation.previous && (
          <Button
            component={RouterLink}
            to={`/learning/materials/${navigation.previous.id}`}
            variant="outlined"
          >
            上一条
          </Button>
        )}
        {navigation.next && (
          <Button component={RouterLink} to={`/learning/materials/${navigation.next.id}`} variant="outlined">
            下一条
          </Button>
        )}
      </Box>

      <Snackbar
        open={showReturnToast}
        autoHideDuration={2600}
        onClose={() => setShowReturnToast(false)}
        message={returnToastText}
      />
    </Container>
  );
};

export default LearningMaterialDetail;
