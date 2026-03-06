import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
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
import { RuleCardByEntryId } from '../../components/knowledge/RuleReferenceCards';

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
        本质定义
      </Typography>
      <Typography variant="body1" paragraph>
        {entry.knowledgePointTitle}
      </Typography>

      <Typography variant="h6" color="text.secondary" gutterBottom>
        关键说明
      </Typography>
      <Typography variant="body1" paragraph>
        {entry.learningGoal}
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        适用边界
      </Typography>
      <Typography variant="body1" paragraph>
        {entry.scopeBoundary}
      </Typography>

      <Typography variant="h6" gutterBottom>
        必须掌握
      </Typography>
      <List dense>
        {entry.coreConcepts.map((concept) => (
          <ListItem key={concept} sx={{ alignItems: 'flex-start' }}>
            <ListItemText primary={concept} />
          </ListItem>
        ))}
      </List>

      <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
        最小判断步骤
      </Typography>
      <Typography variant="body1" paragraph>
        {entry.minimumAlgorithm}
      </Typography>

      <Typography variant="h6" gutterBottom>
        常见误区
      </Typography>
      <List dense>
        {entry.commonMisconceptions.map((item) => (
          <ListItem key={item} sx={{ alignItems: 'flex-start' }}>
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>

      <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
        反例说明
      </Typography>
      <Typography variant="body1" paragraph>
        {entry.counterExample}
      </Typography>

      <Typography variant="h6" gutterBottom>
        术语表
      </Typography>
      <List dense>
        {entry.glossary.map((item) => (
          <ListItem key={item} sx={{ alignItems: 'flex-start' }}>
            <ListItemText
              primary={
                <Link
                  component={RouterLink}
                  to={`/ceremony-resources?term=${encodeURIComponent(item.split(/[：:]/)[0].trim())}`}
                  underline="hover"
                >
                  {item}
                </Link>
              }
            />
          </ListItem>
        ))}
      </List>

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
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        出处说明
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {entry.sourceNote}
      </Typography>

      <RuleCardByEntryId entryId={entry.id} />
    </Container>
  );
};

export default LearningMaterialDetail;
