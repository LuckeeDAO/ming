import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Breadcrumbs,
  Chip,
  Container,
  Link,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { ceremonyResourcesService } from '../../services/ceremony/ceremonyResourcesService';

const LearningMaterialDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const entry = id ? ceremonyResourcesService.getLearningMaterialById(id) : undefined;
  const allEntries = ceremonyResourcesService.getLearningMaterials();

  if (!entry) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link component={RouterLink} color="inherit" to="/ceremony-resources">
            概念词条库
          </Link>
          <Typography color="text.primary">词条详情</Typography>
        </Breadcrumbs>
        <Typography variant="h5" gutterBottom>
          未找到词条
        </Typography>
        <Typography variant="body2" color="text.secondary">
          请返回概念词条库重新选择。
        </Typography>
      </Container>
    );
  }

  const prerequisiteEntries = entry.prerequisites
    .map((item) => ceremonyResourcesService.getLearningMaterialById(item))
    .filter((item): item is NonNullable<typeof item> => !!item);

  const relatedEntries = allEntries
    .filter((item) => item.id !== entry.id)
    .filter((item) => item.tags.some((tag) => entry.tags.includes(tag)))
    .slice(0, 6);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} color="inherit" to="/ceremony-resources">
          概念词条库
        </Link>
        <Typography color="text.primary">{entry.title}</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        {entry.sequence}. {entry.title}
      </Typography>
      <Chip label={entry.level} size="small" sx={{ mb: 1 }} />

      <Typography variant="h6" color="text.secondary" gutterBottom>
        概念定义
      </Typography>
      <Typography variant="body1" paragraph>
        {entry.knowledgePointTitle}
      </Typography>

      <Typography variant="h6" color="text.secondary" gutterBottom>
        概念说明
      </Typography>
      <Typography variant="body1" paragraph>
        {entry.learningGoal}
      </Typography>

      <Typography variant="h6" gutterBottom>
        核心概念
      </Typography>
      <Box sx={{ mb: 2 }}>
        {entry.coreConcepts.map((concept) => (
          <Chip key={concept} label={concept} size="small" sx={{ mr: 1, mb: 1 }} />
        ))}
      </Box>

      <Typography variant="h6" gutterBottom>
        原文摘录
      </Typography>
      <List dense>
        {entry.excerptBlocks.map((excerpt) => (
          <ListItem key={excerpt} sx={{ alignItems: 'flex-start' }}>
            <ListItemText primary={excerpt} />
          </ListItem>
        ))}
      </List>

      {prerequisiteEntries.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            关联前置概念
          </Typography>
          <List dense>
            {prerequisiteEntries.map((item) => (
              <ListItem key={item.id} sx={{ alignItems: 'flex-start' }}>
                <ListItemText
                  primary={
                    <Link component={RouterLink} to={`/learning/materials/${item.id}`} underline="hover">
                      {item.sequence}. {item.title}
                    </Link>
                  }
                  secondary={`定义：${item.knowledgePointTitle}`}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}

      {relatedEntries.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            相关词条
          </Typography>
          <List dense>
            {relatedEntries.map((item) => (
              <ListItem key={item.id} sx={{ alignItems: 'flex-start' }}>
                <ListItemText
                  primary={
                    <Link component={RouterLink} to={`/learning/materials/${item.id}`} underline="hover">
                      {item.sequence}. {item.title}
                    </Link>
                  }
                  secondary={`定义：${item.knowledgePointTitle}`}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}

      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        关联检索词
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {entry.publicSearchKeywords.join(' / ')}
      </Typography>
    </Container>
  );
};

export default LearningMaterialDetail;
