import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface CapabilityStatusLegendProps {
  maxWidth?: string | number;
  compact?: boolean;
  mb?: number;
}

const CapabilityStatusLegend: React.FC<CapabilityStatusLegendProps> = ({
  maxWidth,
  compact = false,
  mb = 2.5,
}) => {
  return (
    <Card
      sx={(theme) => ({
        maxWidth: maxWidth ?? '100%',
        mx: maxWidth ? 'auto' : undefined,
        mb,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: `${theme.palette.primary.main}05`,
      })}
    >
      <CardContent sx={{ p: compact ? { xs: 2, sm: 2.5 } : { xs: 2.25, md: 3 } }}>
        <Typography variant={compact ? 'subtitle2' : 'subtitle1'} sx={{ fontWeight: 600, mb: 1.5 }}>
          能力状态说明
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
          `已上线`：当前版本已可使用并可验证。
          {'  '}
          `进行中`：已进入实现或联调阶段，但尚未形成稳定闭环。
          {'  '}
          `规划中`：设计口径已明确，待后续版本落地。
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CapabilityStatusLegend;
