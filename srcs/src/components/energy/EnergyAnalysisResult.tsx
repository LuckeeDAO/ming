/**
 * 能量分析结果展示组件
 * 
 * 功能：
 * - 展示五行能量分布
 * - 显示能量循环状态
 * - 展示缺失元素和推荐
 * - 提供可视化图表（可选）
 * 
 * @module components/energy/EnergyAnalysisResult
 */

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import { EnergyAnalysis } from '../../types/energy';

interface EnergyAnalysisResultProps {
  analysis: EnergyAnalysis;
}

/**
 * 能量分析结果展示组件
 * 
 * @param props - 组件属性
 * @param props.analysis - 能量分析结果
 */
const EnergyAnalysisResult: React.FC<EnergyAnalysisResultProps> = ({ analysis }) => {
  /**
   * 获取能量状态颜色
   * 
   * @param status - 能量状态
   * @returns Material-UI 颜色名称
   */
  const getStatusColor = (
    status: 'strong' | 'normal' | 'weak' | 'missing'
  ): 'success' | 'info' | 'warning' | 'error' => {
    switch (status) {
      case 'strong':
        return 'success';
      case 'normal':
        return 'info';
      case 'weak':
        return 'warning';
      case 'missing':
        return 'error';
      default:
        return 'info';
    }
  };

  /**
   * 获取能量状态标签
   * 
   * @param status - 能量状态
   * @returns 中文标签
   */
  const getStatusLabel = (
    status: 'strong' | 'normal' | 'weak' | 'missing'
  ): string => {
    const labels: Record<string, string> = {
      strong: '旺盛',
      normal: '正常',
      weak: '偏弱',
      missing: '缺失',
    };
    return labels[status] || status;
  };

  /**
   * 获取五行元素中文名称
   * 
   * @param element - 元素英文名
   * @returns 中文名称
   */
  const getElementName = (
    element: 'wood' | 'fire' | 'earth' | 'metal' | 'water'
  ): string => {
    const names: Record<string, string> = {
      wood: '木',
      fire: '火',
      earth: '土',
      metal: '金',
      water: '水',
    };
    return names[element] || element;
  };

  /**
   * 获取循环状态颜色
   * 
   * @param status - 循环状态
   * @returns Material-UI 颜色名称
   */
  const getCirculationColor = (
    status: 'smooth' | 'blocked' | 'weak'
  ): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'smooth':
        return 'success';
      case 'weak':
        return 'warning';
      case 'blocked':
        return 'error';
      default:
        return 'success';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        能量分析结果
      </Typography>

      {/* 能量循环状态 */}
      <Alert
        severity={getCirculationColor(analysis.circulation.status)}
        sx={{ mb: 3 }}
      >
        <Typography variant="subtitle2" gutterBottom>
          能量循环状态：{analysis.circulation.status === 'smooth' ? '顺畅' : '受阻'}
        </Typography>
        <Typography variant="body2">
          {analysis.circulation.details}
        </Typography>
      </Alert>

      {/* 五行能量分布 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            五行能量分布
          </Typography>
          <Grid container spacing={2}>
            {(
              ['wood', 'fire', 'earth', 'metal', 'water'] as Array<
                keyof typeof analysis.fiveElements
              >
            ).map((element) => {
              const elementData = analysis.fiveElements[element];
              return (
                <Grid item xs={12} sm={6} md={4} key={String(element)}>
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1">
                        {getElementName(element as 'wood' | 'fire' | 'earth' | 'metal' | 'water')}
                      </Typography>
                      <Chip
                        label={getStatusLabel(elementData.status)}
                        color={getStatusColor(elementData.status)}
                        size="small"
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={elementData.value}
                      color={getStatusColor(elementData.status)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      {elementData.value.toFixed(1)}%
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* 缺失元素和推荐 */}
      {analysis.missingElements.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              缺失元素与推荐
            </Typography>
            {analysis.missingElements.map((missing: EnergyAnalysis['missingElements'][0], index: number) => (
              <Alert
                key={index}
                severity={
                  missing.level === 'critical'
                    ? 'error'
                    : missing.level === 'moderate'
                    ? 'warning'
                    : 'info'
                }
                sx={{ mb: 1 }}
              >
                <Typography variant="subtitle2">
                  {getElementName(missing.element as 'wood' | 'fire' | 'earth' | 'metal' | 'water')} -{' '}
                  {missing.level === 'critical'
                    ? '严重缺失'
                    : missing.level === 'moderate'
                    ? '中度缺失'
                    : '轻微缺失'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {missing.recommendation}
                </Typography>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 分析时间 */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        分析时间：{new Date(analysis.analyzedAt).toLocaleString('zh-CN')}
      </Typography>
    </Box>
  );
};

export default EnergyAnalysisResult;
