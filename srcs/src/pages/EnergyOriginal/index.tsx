/**
 * 本命原局能量分析页面
 *
 * 功能：
 * - 输入公历生辰日期和时间，计算四柱八字（年柱、月柱、日柱、时柱）
 * - 调用 V2 量化算法计算本命原局五行能量与循环状态
 * - 显示大运流年信息
 * - 将分析结果写入全局状态，供连接指导 / 外物推荐等后续流程使用
 *
 * 设计说明：
 * - 使用本地封装的 `convertBirthToFourPillars`（基于 chinese-lunar 库）
 * - 不做复杂时区处理，默认按用户本地时间理解
 */

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Grid,
  Button,
  Alert,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
} from '@mui/material';
import { useAppDispatch } from '../../store/hooks';
import { convertBirthToFourPillars } from '../../services/energy/fourPillarsConverter';
import { analyzeEnergy, setFourPillars as setFourPillarsInStore } from '../../store/slices/energySlice';
import { energyAnalysisService } from '../../services/energy/energyAnalysisService';
import type { FourPillars, EnergyAnalysis } from '../../types/energy';
import EnergyAnalysisResult from '../../components/energy/EnergyAnalysisResult';

const EnergyOriginal: React.FC = () => {
  const dispatch = useAppDispatch();

  const today = new Date();
  const [date, setDate] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`
  );
  const [time, setTime] = useState<string>('12:00');
  const [fourPillars, setFourPillars] = useState<FourPillars | null>(null);
  const [error, setError] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // 性别选择：默认为女
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [analysis, setAnalysis] = useState<EnergyAnalysis | null>(null);

  /**
   * 解析日期与时间输入
   */
  const parseDateTime = () => {
    if (!date) {
      throw new Error('请选择出生日期');
    }
    const [yearStr, monthStr, dayStr] = date.split('-');
    if (!yearStr || !monthStr || !dayStr) {
      throw new Error('出生日期格式无效');
    }

    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    if (!time) {
      throw new Error('请选择出生时间');
    }
    const [hourStr] = time.split(':');
    const hour = Number(hourStr);

    if (
      !Number.isFinite(year) ||
      !Number.isFinite(month) ||
      !Number.isFinite(day) ||
      !Number.isFinite(hour)
    ) {
      throw new Error('生辰日期或时间格式无效');
    }

    return { year, month, day, hour };
  };

  /**
   * 处理"开始分析"并完成本命原局能量分析
   */
  const handleAnalyze = () => {
    setError('');
    setIsAnalyzing(true);
    try {
      const { year, month, day, hour } = parseDateTime();
      const pillars = convertBirthToFourPillars(year, month, day, hour);
      setFourPillars(pillars);
      // 将四柱写入全局状态
      dispatch(setFourPillarsInStore(pillars));
      // 本命原局能量分析
      const analysisResult = energyAnalysisService.analyze(pillars);
      dispatch(analyzeEnergy(analysisResult));
      setAnalysis(analysisResult);
    } catch (e) {
      console.error('能量分析失败:', e);
      setFourPillars(null);
      setAnalysis(null);
      setError(
        e instanceof Error
          ? e.message
          : '能量分析失败，请检查输入'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          五行能量测算
        </Typography>
        <Typography variant="body1" color="text.secondary">
          输入公历出生日期与时间，系统将计算对应的四柱八字，并完成本命原局的五行能量分析，包括大运流年信息。
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            一、生辰信息
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="出生日期（公历）"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="出生时间（24 小时制）"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">性别（用于大运顺逆判断）</FormLabel>
                <RadioGroup
                  row
                  aria-label="gender"
                  name="gender"
                  value={gender}
                  onChange={(e) =>
                    setGender(e.target.value === 'male' ? 'male' : 'female')
                  }
                >
                  <FormControlLabel value="female" control={<Radio />} label="女" />
                  <FormControlLabel value="male" control={<Radio />} label="男" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="contained"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAnalyze();
              }}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? '分析中...' : '开始分析'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            二、四柱八字结果
          </Typography>
          {fourPillars ? (
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="年柱"
                  value={fourPillars.year}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="月柱"
                  value={fourPillars.month}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="日柱"
                  value={fourPillars.day}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="时柱"
                  value={fourPillars.hour}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              请先填写生辰日期和时间，并点击"开始分析"。
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            三、本命原局能量分析（含大运流年）
          </Typography>
          {analysis ? (
            <Box sx={{ mt: 2 }}>
              <EnergyAnalysisResult
                analysis={analysis}
                birthDate={date}
                birthTime={time}
                gender={gender}
              />
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              请先填写生辰信息并点击"开始分析"，系统会在此展示本命原局的能量分布、循环状态以及大运流年信息。
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default EnergyOriginal;

