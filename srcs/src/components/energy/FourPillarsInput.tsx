/**
 * 四柱八字输入组件
 * 
 * 功能：
 * - 提供年、月、日、时四柱的输入界面
 * - 支持天干地支选择或手动输入
 * - 输入验证和格式检查
 * - 与能量分析服务集成
 * 
 * @module components/energy/FourPillarsInput
 */

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { FourPillars } from '../../types/energy';
import { useAppDispatch } from '../../store/hooks';
import { analyzeEnergy } from '../../store/slices/energySlice';
import { energyAnalysisService } from '../../services/energy/energyAnalysisService';
import { isValidPillar } from '../../utils/validation';

interface FourPillarsInputProps {
  walletAddress?: string;
  onAnalysisComplete?: (analysisId: string) => void;
  /** 可选：预填的四柱八字（例如由生辰转换工具计算得到） */
  initialFourPillars?: FourPillars | null;
}

/**
 * 四柱八字输入组件
 * 
 * @param props - 组件属性
 * @param props.walletAddress - 钱包地址（可选）
 * @param props.onAnalysisComplete - 分析完成回调（可选）
 */
const FourPillarsInput: React.FC<FourPillarsInputProps> = ({
  walletAddress = '',
  onAnalysisComplete,
  initialFourPillars,
}: FourPillarsInputProps) => {
  const dispatch = useAppDispatch();
  const [fourPillars, setFourPillars] = useState<FourPillars>({
    year: '',
    month: '',
    day: '',
    hour: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FourPillars, string>>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  /**
   * 当外部提供了 initialFourPillars 时，用其预填本地状态
   */
  React.useEffect(() => {
    if (initialFourPillars) {
      setFourPillars(initialFourPillars);
      setErrorMessage('');
      setErrors({});
    }
  }, [initialFourPillars]);

  /**
   * 验证四柱八字格式
   * 
   * 使用工具函数进行完整验证，包括：
   * - 长度检查（2个字符）
   * - 天干验证（甲乙丙丁戊己庚辛壬癸）
   * - 地支验证（子丑寅卯辰巳午未申酉戌亥）
   * 
   * @param pillar - 柱的值
   * @returns 是否为有效格式
   */
  const validatePillar = (pillar: string): boolean => {
    return isValidPillar(pillar);
  };

  /**
   * 处理输入变化
   * 
   * @param field - 字段名
   * @param value - 输入值
   */
  const handleChange = (field: keyof FourPillars, value: string) => {
    // 限制输入长度为2
    const trimmedValue = value.slice(0, 2);
    setFourPillars((prev: FourPillars) => ({
      ...prev,
      [field]: trimmedValue,
    }));

    // 清除该字段的错误
    if (errors[field]) {
      setErrors((prev: Partial<Record<keyof FourPillars, string>>) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // 清除全局错误
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  /**
   * 验证所有输入
   * 
   * @returns 是否通过验证
   */
  const validateAll = (): boolean => {
    const newErrors: Partial<Record<keyof FourPillars, string>> = {};

    Object.entries(fourPillars).forEach(([field, value]) => {
      if (!value) {
        newErrors[field as keyof FourPillars] = '请输入' + getFieldLabel(field);
      } else if (!validatePillar(value)) {
        newErrors[field as keyof FourPillars] = '格式不正确，应为天干+地支（2个字符）';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 获取字段标签
   * 
   * @param field - 字段名
   * @returns 字段标签
   */
  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      year: '年柱',
      month: '月柱',
      day: '日柱',
      hour: '时柱',
    };
    return labels[field] || field;
  };

  /**
   * 处理分析提交
   */
  const handleAnalyze = async () => {
    // 验证输入
    if (!validateAll()) {
      setErrorMessage('请检查输入格式');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage('');

    try {
      // 执行能量分析
      const analysis = energyAnalysisService.analyze({
        ...fourPillars,
        // 确保 walletAddress 被设置
        ...(walletAddress && { walletAddress }),
      });

      // 更新 Redux store
      dispatch(analyzeEnergy(analysis));

      // 调用完成回调
      if (onAnalysisComplete) {
        onAnalysisComplete(analysis.analysisId);
      }
    } catch (error) {
      console.error('能量分析失败:', error);
      setErrorMessage(
        error instanceof Error ? error.message : '能量分析失败，请重试'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          输入四柱八字
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          请输入您的出生年月日时的天干地支组合
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Grid container spacing={2}>
          {(['year', 'month', 'day', 'hour'] as Array<keyof FourPillars>).map(
            (field) => (
              <Grid item xs={12} sm={6} key={field}>
                <TextField
                  fullWidth
                  label={getFieldLabel(field)}
                  value={fourPillars[field]}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(field, e.target.value)}
                  error={!!errors[field]}
                  helperText={errors[field] || '格式：天干+地支（如：甲子）'}
                  placeholder="如：甲子"
                  inputProps={{
                    maxLength: 2,
                  }}
                />
              </Grid>
            )
          )}
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? '分析中...' : '开始分析'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FourPillarsInput;
