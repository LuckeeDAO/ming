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

import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { EnergyAnalysis, TenGodType } from '../../types/energy';
import { TEN_GOD_NAMES } from '../../services/energy/tenGodService';
import {
  getDaYunSequence,
  getLiuRiSequence,
  getLiuNianSequence,
  getLiuYueSequence,
  Direction,
} from '../../services/energy/fortuneCycleService';
import {
  buildFortuneCascade,
  FortuneCascadeResult,
} from '../../services/energy/fortuneCascadeService';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ComposedChart,
  Bar,
} from 'recharts';

/**
 * 简化版K线蜡烛图形状组件
 *
 * 参考 lifekline 项目，实现：
 * - 竖线表示 high-low 区间
 * - 矩形实体表示 open-close 区间
 */
const CandleShape = (props: any) => {
  const { x, y, width, height, payload, yAxis } = props;

  const isUp = payload.close >= payload.open;
  const color = isUp ? '#22c55e' : '#ef4444';
  const strokeColor = isUp ? '#15803d' : '#b91c1c';

  let highY = y;
  let lowY = y + height;

  if (yAxis && typeof yAxis.scale === 'function') {
    try {
      highY = yAxis.scale(payload.high);
      lowY = yAxis.scale(payload.low);
    } catch {
      highY = y;
      lowY = y + height;
    }
  }

  const center = x + width / 2;
  const renderHeight = height < 2 ? 2 : height;

  return (
    <g>
      <line x1={center} y1={highY} x2={center} y2={lowY} stroke={strokeColor} strokeWidth={2} />
      <rect
        x={x}
        y={y}
        width={width}
        height={renderHeight}
        fill={color}
        stroke={strokeColor}
        strokeWidth={1}
        rx={1}
      />
    </g>
  );
};

interface EnergyAnalysisResultProps {
  analysis: EnergyAnalysis;
  /** 出生日期（公历，YYYY-MM-DD），用于大运/流年等时间轴计算（可选） */
  birthDate?: string;
  /** 出生时间（24 小时制，HH:mm），用于流时计算（可选） */
  birthTime?: string;
  /** 性别（男/女），用于判定大运顺逆（可选） */
  gender?: 'female' | 'male';
}

/**
 * 能量分析结果展示组件
 * 
 * @param props - 组件属性
 * @param props.analysis - 能量分析结果
 */
const EnergyAnalysisResult: React.FC<EnergyAnalysisResultProps> = ({
  analysis,
  birthDate,
  birthTime,
  gender,
}) => {
  /**
   * 获取能量状态颜色（基于能量强弱分值）
   * 
   * 颜色方案：
   * - 极弱：深红色（能量极低，接近缺失）
   * - 弱：粉红色（能量偏低）
   * - 中和：黄色/棕色/土色（平衡状态，土代表稳定、中和）
   * - 强：嫩绿色（能量偏高）
   * - 极强：深绿色（能量极高）
   * 
   * @param status - 能量状态
   * @returns 颜色对象（包含 main, light, dark）
   */
  const getStatusColor = (
    status: 'veryWeak' | 'weak' | 'balanced' | 'strong' | 'veryStrong'
  ): { main: string; light: string; dark: string } => {
    switch (status) {
      case 'veryWeak':
        return { main: '#d32f2f', light: '#ef5350', dark: '#c62828' }; // 深红色（极弱）
      case 'weak':
        return { main: '#e91e63', light: '#f48fb1', dark: '#c2185b' }; // 粉红色（弱）
      case 'balanced':
        return { main: '#f9a825', light: '#ffb74d', dark: '#f57c00' }; // 黄色/土色（中和）
      case 'strong':
        return { main: '#81c784', light: '#a5d6a7', dark: '#66bb6a' }; // 嫩绿色（强）
      case 'veryStrong':
        return { main: '#1b5e20', light: '#4caf50', dark: '#0d4f17' }; // 深绿色（极强）
      default:
        return { main: '#f57f17', light: '#ffb74d', dark: '#f57c00' }; // 默认中和色
    }
  };

  /**
   * 获取能量状态颜色名称（用于 Material-UI 组件）
   * 
   * @param status - 能量状态
   * @returns Material-UI 颜色名称
   */
  const getStatusColorName = (
    status: 'veryWeak' | 'weak' | 'balanced' | 'strong' | 'veryStrong'
  ): 'error' | 'warning' | 'info' | 'success' | 'primary' => {
    switch (status) {
      case 'veryWeak':
        return 'error';      // 极弱 - 红色
      case 'weak':
        return 'warning';    // 弱 - 粉红色
      case 'balanced':
        return 'warning';    // 中和 - 使用 warning（黄色/土色）
      case 'strong':
        return 'success';    // 强 - 嫩绿色
      case 'veryStrong':
        return 'success';    // 极强 - 深绿色
      default:
        return 'info';
    }
  };

  /**
   * 获取能量状态标签（5级划分，命理学标准）
   * 
   * 注意：五行能量标签不包含"从弱/从强"，这些概念仅用于日主。
   * 
   * @param status - 能量状态
   * @returns 中文标签
   */
  const getStatusLabel = (
    status: 'veryWeak' | 'weak' | 'balanced' | 'strong' | 'veryStrong'
  ): string => {
    const labels: Record<string, string> = {
      veryWeak: '极弱',
      weak: '弱',
      balanced: '中和',
      strong: '强',
      veryStrong: '极强',
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
   * 计算五行能量中的最大值，用于进度条归一化
   *
   * - 保持 `analysis.fiveElements.*.value` 为「绝对能量值」
   * - 仅在 UI 层按最大值归一化到 0-100，用于 LinearProgress 展示
   */
  const maxFiveElementValue =
    Math.max(
      analysis.fiveElements.wood.value,
      analysis.fiveElements.fire.value,
      analysis.fiveElements.earth.value,
      analysis.fiveElements.metal.value,
      analysis.fiveElements.water.value
    ) || 1;

  /**
   * 日主身旺 / 身弱 文本标签（5级划分：命理学标准）
   */
  const getDayMasterLabel = (
    strength: 'veryWeak' | 'weak' | 'balanced' | 'strong' | 'veryStrong'
  ): string => {
    const labels: Record<string, string> = {
      veryWeak: '极弱（从弱）',
      weak: '身弱',
      balanced: '中和（平和）',
      strong: '身旺',
      veryStrong: '极强（从强）',
    };
    return labels[strength] || strength;
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

  /**
   * 判断天干阴阳属性
   *
   * - 阳干：甲、丙、戊、庚、壬
   * - 阴干：乙、丁、己、辛、癸
   */
  const getStemPolarity = (stem: string): 'YANG' | 'YIN' => {
    const yangStems = ['甲', '丙', '戊', '庚', '壬'];
    const yinStems = ['乙', '丁', '己', '辛', '癸'];
    if (yangStems.includes(stem)) return 'YANG';
    if (yinStems.includes(stem)) return 'YIN';
    return 'YANG';
  };

  /**
   * 根据年干阴阳 + 性别判断大运顺逆方向
   *
   * 规则（参考 lifekline 项目常用约定）：
   * - 阳男 / 阴女：顺行
   * - 阴男 / 阳女：逆行
   * 若未提供性别，则默认顺行。
   */
  const getDaYunDirection = (yearStem: string, g?: 'female' | 'male'): Direction => {
    if (!g) return 'forward';
    const polarity = getStemPolarity(yearStem);
    if (g === 'male') {
      return polarity === 'YANG' ? 'forward' : 'backward';
    }
    // female
    return polarity === 'YIN' ? 'forward' : 'backward';
  };

  /**
   * 交互状态：
   * - activeYear：当前选中的流年（用于决定流月）
   * - activeMonth：当前选中的月份（用于决定具体日期）
   * - activeDay：当前选中的“日”（用于决定流时起点）
   *
   * 初始时全部为 null，在计算逻辑中会自动回退到出生年月日；
   * 一旦用户在「大运×流年」表格或月份列表中点击，即会更新为对应值。
   */
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [activeMonth, setActiveMonth] = useState<number | null>(null);
  const [activeDay, setActiveDay] = useState<number | null>(null);

  /**
   * 「每日能量值」计算（基于真实能量值，而非百分比分数）
   *
   * 规则：
   * - 将当日干支拆成字符，映射到对应的五行
   * - 使用本命盘中该五行的绝对能量值（analysis.fiveElements.*.value）
   * - 取这些能量的平均值作为当日能量
   * - 若无法解析到任何五行，则使用本命五行能量的平均值兜底
   */
  const getDailyEnergyValue = (ganZhi: string): number => {
    // 本命五行能量平均值（兜底用）
    const baseAvg =
      (analysis.fiveElements.wood.value +
        analysis.fiveElements.fire.value +
        analysis.fiveElements.earth.value +
        analysis.fiveElements.metal.value +
        analysis.fiveElements.water.value) /
      5;

    if (!ganZhi || ganZhi.length < 2) {
      return baseAvg;
    }

    const elementMap: Record<string, 'wood' | 'fire' | 'earth' | 'metal' | 'water'> = {
      甲: 'wood',
      乙: 'wood',
      丙: 'fire',
      丁: 'fire',
      戊: 'earth',
      己: 'earth',
      庚: 'metal',
      辛: 'metal',
      壬: 'water',
      癸: 'water',
      子: 'water',
      丑: 'earth',
      寅: 'wood',
      卯: 'wood',
      辰: 'earth',
      巳: 'fire',
      午: 'fire',
      未: 'earth',
      申: 'metal',
      酉: 'metal',
      戌: 'earth',
      亥: 'water',
    };

    const chars = ganZhi.split('');
    const values: number[] = [];

    chars.forEach((ch) => {
      const el = elementMap[ch];
      if (el && analysis.fiveElements[el]) {
        values.push(analysis.fiveElements[el].value);
      }
    });

    if (values.length === 0) {
      return baseAvg;
    }

    return values.reduce((sum, v) => sum + v, 0) / values.length;
  };

  /**
   * 基于四柱 + 生辰 + 性别 + 当前选中的年/月/日，计算：
   * - 大运序列
   * - 流年（从 fromYear 起的若干年）
   * - 流月（始终基于 activeYear 的 12 个月）
   * - 流日（始终基于 active 的具体日期起算）
   * - 流时（始终基于 active 的具体日期时间起算）
   */
  const fortuneData = useMemo(() => {
    if (!birthDate) {
      return null;
    }

    try {
      const [yearStr, monthStr, dayStr] = birthDate.split('-');
      const birthYear = Number(yearStr);
      const birthMonth = Number(monthStr);
      const birthDay = Number(dayStr);
      if (
        !Number.isFinite(birthYear) ||
        !Number.isFinite(birthMonth) ||
        !Number.isFinite(birthDay)
      ) {
        return null;
      }

      const yearPillar = analysis.fourPillars.year;
      const monthPillar = analysis.fourPillars.month;
      const yearStem = yearPillar.charAt(0);

      // 大运：以月柱为起运干支，起运年龄简化为 8 岁，推算 8 步大运
      const daYunDirection = getDaYunDirection(yearStem, gender);
      const daYun = getDaYunSequence(monthPillar, daYunDirection, 8, 8);

      // 使用级联算法统一生成流年 / 流月 / 流时
      // - fromYear：默认出生年
      // - yearsSpan：默认 10 年（可按需调整）
      // - activeYear / activeMonth / activeDay：若未选择，则回退到出生年月日
      const cascade: FortuneCascadeResult = buildFortuneCascade(birthDate, {
        fromYear: birthYear,
        yearsSpan: 10,
        activeYear: activeYear ?? birthYear,
        activeMonth: activeMonth ?? birthMonth,
        activeDay: activeDay ?? birthDay,
        includeLiuShi: !!birthTime,
        activeHour: birthTime ? Number(birthTime.split(':')[0]) : 12,
      });

      // 流日：从“当前激活日期”开始，展示 30 天
      const baseDateForLiuRi = `${cascade.active.year}-${String(
        cascade.active.month
      ).padStart(2, '0')}-${String(cascade.active.day).padStart(2, '0')}`;
      const liuRi = getLiuRiSequence(baseDateForLiuRi, 30);

      return {
        daYun,
        liuNian: cascade.liuNian,
        liuYue: cascade.liuYue,
        liuRi,
        liuShi: cascade.liuShi,
        cascadeActive: cascade.active,
      };
    } catch (e) {
      console.error('计算大运/流年/流月/流日/流时失败:', e);
      return null;
    }
  }, [analysis, birthDate, birthTime, gender, activeYear, activeMonth, activeDay]);

  /**
   * 日主信息（若已计算）
   */
  const dayMasterInfo = analysis.dayMaster;

  /**
   * 构造通用 K 线数据（open/close/high/low + bodyRange）
   */
  const buildKLine = <T extends { energy: number }>(
    base: T[]
  ): Array<T & { open: number; close: number; high: number; low: number; bodyRange: [number, number] }> => {
    if (!base.length) return [];
    const result: Array<
      T & { open: number; close: number; high: number; low: number; bodyRange: [number, number] }
    > = [];
    let prevClose = base[0].energy;
    base.forEach((item, idx) => {
      const open = idx === 0 ? item.energy : prevClose;
      const close = item.energy;
      const high = Math.max(open, close);
      const low = Math.min(open, close);
      const bodyRange: [number, number] = [low, high];
      prevClose = close;
      result.push({ ...(item as T), open, close, high, low, bodyRange });
    });
    return result;
  };

  /**
   * 能量曲线数据：
   * 1. lifeK：一生年度 K 线（按流年干支推 80 年）
   * 2. yearK：某一年 365 天 K 线（随 activeYear 变化）
   * 3. day24: 某一天 24 小时能量折线（随 activeDay 变化）
   */
  const energyCurves = useMemo(() => {
    if (!birthDate) {
      return {
        lifeK: [] as any[],
        yearK: [] as any[],
        monthK: [] as any[],
        day24: [] as any[],
      };
    }

    const [birthYearStr] = birthDate.split('-');
    const birthYear = Number(birthYearStr);
    if (!Number.isFinite(birthYear)) {
      return {
        lifeK: [] as any[],
        yearK: [] as any[],
        monthK: [] as any[],
        day24: [] as any[],
      };
    }

    // 1）一生年度 K 线（优先尝试 80 年，失败则逐步降级）
    let lifeK: any[] = [];
    try {
      let seq: Array<{ year: number; ganZhi: string }> = [];
      try {
        // 优先尝试 80 年跨度
        seq = getLiuNianSequence(birthYear, 80);
      } catch {
        try {
          // 若超出历法库支持范围，则退而求其次使用 40 年
          seq = getLiuNianSequence(birthYear, 40);
        } catch {
          // 最后兜底：如果 fortuneData 中已有流年序列，则直接使用
          if (fortuneData && Array.isArray(fortuneData.liuNian) && fortuneData.liuNian.length > 0) {
            seq = fortuneData.liuNian.map((n: any) => ({
              year: n.year,
              ganZhi: n.ganZhi,
            }));
          } else {
            seq = [];
          }
        }
      }

      const base = seq.map((item, idx) => ({
        energy: getDailyEnergyValue(item.ganZhi),
        year: item.year,
        age: idx + 1,
      }));
      lifeK = buildKLine(base);
    } catch {
      lifeK = [];
    }

    // 2）某一年的 12 个月 K 线（按月度能量作为点）
    let yearK: any[] = [];
    try {
      const targetYear = activeYear ?? birthYear;
      const months = getLiuYueSequence(targetYear, 1, 12);
      const base = months.map((m, index) => ({
        energy: getDailyEnergyValue(m.ganZhi),
        month: m.month,
        monthLabel: `${m.month}月`,
        monthIndex: index + 1,
      }));
      yearK = buildKLine(base);
    } catch {
      yearK = [];
    }

    // 3）某一月 30 天 K 线（按每日能量作为点，随 activeYear / activeMonth 变化）
    let monthK: any[] = [];
    try {
      const targetYear = activeYear ?? birthYear;
      // 如果没有显式选中月份，则使用出生月（如可解析）
      const [, birthMonthStr] = birthDate.split('-');
      const parsedBirthMonth = Number(birthMonthStr);
      const targetMonth =
        activeMonth && activeMonth >= 1 && activeMonth <= 12
          ? activeMonth
          : Number.isFinite(parsedBirthMonth)
          ? parsedBirthMonth
          : 1;
      const baseDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
      const days = getLiuRiSequence(baseDate, 30);
      const base = days.map((d, index) => ({
        energy: getDailyEnergyValue(d.ganZhi),
        date: d.date,
        dayLabel: d.date.slice(5),
        dayIndex: index + 1,
      }));
      monthK = buildKLine(base);
    } catch {
      monthK = [];
    }

    // 4）某一天 24 小时能量折线（基于当前 fortuneData.liuShi）
    let day24: any[] = [];
    if (fortuneData && fortuneData.liuShi && fortuneData.liuShi.length > 0) {
      const hourly: { hour: number; label: string; energy: number }[] = [];
      fortuneData.liuShi.forEach((item) => {
        const energy = getDailyEnergyValue(item.ganZhi);
        const timePart = item.dateTime.split('T')[1] || '00:00:00';
        const baseHour = Number(timePart.slice(0, 2));
        const h1 = baseHour;
        const h2 = (baseHour + 1) % 24;
        hourly.push(
          {
            hour: h1,
            label: `${String(h1).padStart(2, '0')}:00`,
            energy,
          },
          {
            hour: h2,
            label: `${String(h2).padStart(2, '0')}:00`,
            energy,
          }
        );
      });
      const dedup: { [h: number]: { hour: number; label: string; energy: number } } = hourly
        .sort((a, b) => a.hour - b.hour || a.label.localeCompare(b.label))
        // 去重：同一小时取最后一个
        .reduce((acc, cur) => {
          acc[cur.hour] = cur;
          return acc;
        }, {} as { [h: number]: { hour: number; label: string; energy: number } });
      day24 = Object.values(dedup).sort((a, b) => a.hour - b.hour);
    }

    return {
      lifeK,
      yearK,
      monthK,
      day24,
    };
  }, [birthDate, activeYear, activeMonth, fortuneData, getDailyEnergyValue]);

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

      {/* 五行能量分布 + 日主身旺身弱判断 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            五行能量分布（本命原局）
          </Typography>
          {dayMasterInfo && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                日主：{analysis.fourPillars.day}（{dayMasterInfo.stem}，{getElementName(dayMasterInfo.element)})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                身旺身弱判断：{getDayMasterLabel(dayMasterInfo.strength)}（日主五行能量约 {Math.round(dayMasterInfo.value)}）
              </Typography>
            </Box>
          )}
          <Grid container spacing={2}>
            {(
              ['wood', 'fire', 'earth', 'metal', 'water'] as Array<
                keyof typeof analysis.fiveElements
              >
            ).map((element) => {
              const elementData = analysis.fiveElements[element];
              const ratio =
                elementData.value > 0
                  ? Math.min((elementData.value / maxFiveElementValue) * 100, 100)
                  : 0;
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
                        color={getStatusColorName(elementData.status)}
                        sx={{
                          backgroundColor:
                            elementData.status === 'balanced'
                              ? getStatusColor(elementData.status).main
                              : undefined,
                          color:
                            elementData.status === 'balanced'
                              ? '#fff'
                              : undefined,
                        }}
                        size="small"
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={ratio}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor:
                          elementData.status === 'veryWeak'
                            ? getStatusColor(elementData.status).light
                            : elementData.status === 'veryStrong'
                            ? getStatusColor(elementData.status).light
                            : undefined,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getStatusColor(elementData.status).main,
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      {elementData.value.toFixed(0)}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* 能量计算过程（调试信息 / 校验标准） */}
      {analysis.energyDebugLog && analysis.energyDebugLog.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              能量计算过程（调试 / 校验）
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              下表记录了 V2 量化算法在每个关键步骤完成后，各个节点（年/月/日/时 · 干支）的能量快照，可作为后续校验与对比的“检验标准”。
            </Typography>
            <List dense>
              {analysis.energyDebugLog.map((entry, index) => (
                <ListItem
                  key={`${entry.step}-${index}`}
                  alignItems="flex-start"
                  sx={{ flexDirection: 'column', alignItems: 'stretch', mb: 1.5 }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    步骤 {index + 1}：{entry.description}（{entry.step}）
                  </Typography>
                  <Box
                    component="table"
                    sx={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      '& th, & td': {
                        border: '1px solid',
                        borderColor: 'divider',
                        p: 0.5,
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap',
                      },
                      '& th': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <thead>
                      <tr>
                        <th>节点</th>
                        <th>位置</th>
                        <th>五行/阴阳</th>
                        <th>总能量</th>
                        <th>属性能量分布</th>
                        <th>标记</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.nodes.map((node, idx) => (
                        <tr key={`${node.name}-${node.position}-${idx}`}>
                          <td>{node.name}（{node.nodeType === 'stem' ? '干' : '支'}）</td>
                          <td>{node.position}</td>
                          <td>
                            {getElementName(
                              node.originalElement as 'wood' | 'fire' | 'earth' | 'metal' | 'water'
                            )}
                            {' / '}
                            {node.polarity === 'YANG' ? '阳' : '阴'}
                          </td>
                          <td>{Math.round(node.totalEnergy)}</td>
                          <td>
                            {Object.entries(node.energies)
                              .map(([el, val]) => {
                                const label = getElementName(
                                  el as 'wood' | 'fire' | 'earth' | 'metal' | 'water'
                                );
                                return `${label}:${Math.round(val as number)}`;
                              })
                              .join('，') || '-'}
                          </td>
                          <td>
                            {Object.keys(node.flags).length === 0
                              ? '-'
                              : Object.entries(node.flags)
                                  .filter(([, v]) => v)
                                  .map(([k]) => k)
                                  .join('，')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Box>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* 缺失元素和推荐 */}
      {analysis.missingElements.length > 0 && (
        <Card sx={{ mb: 3 }}>
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

      {/* 格局判断与调理方案（基于量化病值） */}
      {analysis.patternMedicine && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              格局判断与调理方案
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              基于原局能量计算病值，判断格局并推荐调理用药方案
            </Typography>

            {/* 格局判断结果 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                格局判断
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {analysis.patternMedicine.patternJudgment.pattern}
                </Typography>
                <Typography variant="body2">
                  {analysis.patternMedicine.patternJudgment.description}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  置信度：{(analysis.patternMedicine.patternJudgment.confidence * 100).toFixed(0)}%
                </Typography>
              </Alert>

              {/* 主要病神 */}
              {analysis.patternMedicine.patternJudgment.primaryDiseases.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    主要病神
                  </Typography>
                  <Grid container spacing={1}>
                    {analysis.patternMedicine.patternJudgment.primaryDiseases.map((disease, idx) => {
                      const tenGodInfo = TEN_GOD_NAMES[disease.tenGod];
                      const levelColors: Record<string, 'error' | 'warning' | 'info' | 'success'> = {
                        severe: 'error',
                        moderate: 'warning',
                        mild: 'info',
                        none: 'success',
                      };
                      const levelLabels: Record<string, string> = {
                        severe: '重症',
                        moderate: '中症',
                        mild: '轻症',
                        none: '无病',
                      };
                      return (
                        <Grid item xs={12} sm={6} key={idx}>
                          <Card variant="outlined">
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Chip
                                  label={tenGodInfo.full}
                                  size="small"
                                  color={levelColors[disease.level]}
                                  sx={{ fontWeight: 'bold' }}
                                />
                                <Chip
                                  label={levelLabels[disease.level]}
                                  size="small"
                                  color={levelColors[disease.level]}
                                  variant="outlined"
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                病值：{disease.normalizedDiseaseValue.toFixed(3)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                能量：{disease.energy.toFixed(0)}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}

              {/* 病神计算过程（节点级别） */}
              {analysis.patternMedicine?.patternJudgment?.calculationProcess?.diseaseIdentification?.nodeThreatDetails && (
                <Box sx={{ mb: 3, mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    病神计算过程（节点级别）
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    详细展示每个节点的威胁值计算过程，然后按十神累加得到最终威胁值。
                  </Typography>

                  {/* 计算步骤 */}
                  {analysis.patternMedicine?.patternJudgment?.calculationProcess?.diseaseIdentification?.calculationSteps && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        计算步骤
                      </Typography>
                      <List dense>
                        <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch', mb: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            步骤 1：计算总能量
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {analysis.patternMedicine?.patternJudgment?.calculationProcess?.diseaseIdentification?.calculationSteps?.step1}
                          </Typography>
                        </ListItem>
                        <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch', mb: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            步骤 2：计算每个节点的威胁值
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            对每个节点计算：threat_node = α_tenGod × w_pos × (E_node / E_self)
                          </Typography>
                          <Box
                            component="table"
                            sx={{
                              width: '100%',
                              borderCollapse: 'collapse',
                              '& th, & td': {
                                border: '1px solid',
                                borderColor: 'divider',
                                p: 0.5,
                                fontSize: '0.75rem',
                                textAlign: 'left',
                              },
                              '& th': {
                                bgcolor: 'action.hover',
                                fontWeight: 'bold',
                              },
                            }}
                          >
                            <thead>
                              <tr>
                                <th>节点</th>
                                <th>位置</th>
                                <th>十神</th>
                                <th>节点能量</th>
                                <th>位置权重</th>
                                <th>威胁值</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(analysis.patternMedicine?.patternJudgment?.calculationProcess?.diseaseIdentification?.nodeThreatDetails || []).map((detail: any, idx: number) => (
                                <tr key={idx}>
                                  <td>{detail.nodeName}（{detail.nodeType === 'stem' ? '干' : '支'}）</td>
                                  <td>{detail.position}</td>
                                  <td>
                                    {detail.tenGod ? (
                                      <Chip
                                        label={TEN_GOD_NAMES[detail.tenGod as TenGodType].full}
                                        size="small"
                                        variant="outlined"
                                      />
                                    ) : (
                                      '-'
                                    )}
                                  </td>
                                  <td>{detail.nodeEnergy.toFixed(0)}</td>
                                  <td>{detail.positionWeight.toFixed(2)}</td>
                                  <td>{detail.threatValue.toFixed(4)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Box>
                        </ListItem>
                        <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch', mb: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            步骤 3：按十神累加威胁值
                          </Typography>
                          <Box
                            component="table"
                            sx={{
                              width: '100%',
                              borderCollapse: 'collapse',
                              '& th, & td': {
                                border: '1px solid',
                                borderColor: 'divider',
                                p: 0.5,
                                fontSize: '0.75rem',
                                textAlign: 'left',
                              },
                              '& th': {
                                bgcolor: 'action.hover',
                                fontWeight: 'bold',
                              },
                            }}
                          >
                            <thead>
                              <tr>
                                <th>十神</th>
                                <th>节点数量</th>
                                <th>累加威胁值</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(analysis.patternMedicine?.patternJudgment?.calculationProcess?.diseaseIdentification?.calculationSteps?.step3 || []).map((item: any, idx: number) => {
                                // 通过完整名称找到对应的十神类型
                                const tenGodType = (Object.keys(TEN_GOD_NAMES) as TenGodType[]).find(
                                  k => TEN_GOD_NAMES[k].full === item.tenGod
                                );
                                const isPrimary = analysis.patternMedicine?.patternJudgment?.calculationProcess?.diseaseIdentification?.primaryDisease?.tenGod === tenGodType;
                                return (
                                  <tr key={idx} style={{ backgroundColor: isPrimary ? 'rgba(25, 118, 210, 0.08)' : undefined }}>
                                    <td>
                                      <Chip
                                        label={item.tenGod}
                                        size="small"
                                        color={isPrimary ? 'primary' : 'default'}
                                        sx={{ fontWeight: isPrimary ? 'bold' : 'normal' }}
                                      />
                                    </td>
                                    <td>{item.nodeCount}</td>
                                    <td>{item.totalThreat.toFixed(4)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </Box>
                        </ListItem>
                      </List>
                    </Box>
                  )}

                  {/* 十神威胁值汇总 */}
                  {analysis.patternMedicine?.patternJudgment?.calculationProcess?.diseaseIdentification?.threats && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        十神威胁值汇总（归一化后）
                      </Typography>
                      <Box
                        component="table"
                        sx={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          '& th, & td': {
                            border: '1px solid',
                            borderColor: 'divider',
                            p: 1,
                            textAlign: 'center',
                          },
                          '& th': {
                            bgcolor: 'action.hover',
                            fontWeight: 'bold',
                          },
                        }}
                      >
                        <thead>
                          <tr>
                            <th>十神</th>
                            <th>原始威胁值</th>
                            <th>归一化威胁值</th>
                            <th>是否主要病神</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...(analysis.patternMedicine?.patternJudgment?.calculationProcess?.diseaseIdentification?.threats || [])]
                            .sort((a: any, b: any) => b.normalizedThreat - a.normalizedThreat)
                            .map((threat: any, idx: number) => {
                              const isPrimary = analysis.patternMedicine?.patternJudgment?.calculationProcess?.diseaseIdentification?.primaryDisease?.tenGod === threat.tenGod;
                              return (
                                <tr key={idx} style={{ backgroundColor: isPrimary ? 'rgba(25, 118, 210, 0.08)' : undefined }}>
                                  <td>
                                    <Chip
                                      label={TEN_GOD_NAMES[threat.tenGod as TenGodType].full}
                                      size="small"
                                      color={isPrimary ? 'primary' : 'default'}
                                      sx={{ fontWeight: isPrimary ? 'bold' : 'normal' }}
                                    />
                                  </td>
                                  <td>{threat.threat.toFixed(4)}</td>
                                  <td>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <LinearProgress
                                        variant="determinate"
                                        value={threat.normalizedThreat * 100}
                                        sx={{ flex: 1, height: 8, borderRadius: 4 }}
                                      />
                                      <Typography variant="caption">
                                        {threat.normalizedThreat.toFixed(3)}
                                      </Typography>
                                    </Box>
                                  </td>
                                  <td>
                                    {isPrimary ? (
                                      <Chip label="是" size="small" color="primary" />
                                    ) : (
                                      <Typography variant="caption" color="text.secondary">
                                        否
                                      </Typography>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            {/* 调理方案（用药建议） */}
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                调理方案（用药建议）
              </Typography>
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {analysis.patternMedicine.medicinePlan.pattern}
                </Typography>
                <Typography variant="body2">
                  {analysis.patternMedicine.medicinePlan.description}
                </Typography>
              </Alert>

              {/* 推荐药物 */}
              {analysis.patternMedicine.medicinePlan.medicines.length > 0 ? (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    推荐药物（按优先级排序）
                  </Typography>
                  <Grid container spacing={2}>
                    {analysis.patternMedicine.medicinePlan.medicines.map((medicine, idx) => {
                      const tenGodInfo = TEN_GOD_NAMES[medicine.tenGod];
                      const priorityColors: Record<string, 'primary' | 'secondary' | 'default'> = {
                        primary: 'primary',
                        secondary: 'secondary',
                        auxiliary: 'default',
                      };
                      const priorityLabels: Record<string, string> = {
                        primary: '首选',
                        secondary: '次选',
                        auxiliary: '辅助',
                      };
                      const actionLabels: Record<string, string> = {
                        '制': '制',
                        '化': '化',
                        '泄': '泄',
                      };
                      return (
                        <Grid item xs={12} sm={6} md={4} key={idx}>
                          <Card variant="outlined">
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Chip
                                  label={tenGodInfo.full}
                                  size="small"
                                  color={priorityColors[medicine.priority]}
                                  sx={{ fontWeight: 'bold' }}
                                />
                                <Chip
                                  label={priorityLabels[medicine.priority]}
                                  size="small"
                                  color={priorityColors[medicine.priority]}
                                  variant="outlined"
                                />
                              </Box>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>动作：</strong>{actionLabels[medicine.action]}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                效力：{medicine.effectiveness.toFixed(3)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                能量：{medicine.energy.toFixed(0)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                系数：{medicine.coefficient.toFixed(2)}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              ) : (
                <Alert severity="warning">
                  <Typography variant="body2">
                    当前命局缺乏有效药物，建议通过外物连接等方式补充能量。
                  </Typography>
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 十神分析（包含天干和地支藏干） */}
      {analysis.tenGods && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              十神分析
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              十神是相对于日主（日柱天干）的关系，包括天干十神和地支藏干十神
            </Typography>
            <Grid container spacing={2}>
              {[
                {
                  label: '年柱',
                  pillar: analysis.fourPillars.year,
                  stem: analysis.fourPillars.year.charAt(0),
                  branch: analysis.fourPillars.year.charAt(1),
                  tenGod: analysis.tenGods.year,
                  branchTenGods: analysis.tenGods.yearBranch,
                  isDayPillar: false,
                },
                {
                  label: '月柱',
                  pillar: analysis.fourPillars.month,
                  stem: analysis.fourPillars.month.charAt(0),
                  branch: analysis.fourPillars.month.charAt(1),
                  tenGod: analysis.tenGods.month,
                  branchTenGods: analysis.tenGods.monthBranch,
                  isDayPillar: false,
                },
                {
                  label: '日柱',
                  pillar: analysis.fourPillars.day,
                  stem: analysis.fourPillars.day.charAt(0),
                  branch: analysis.fourPillars.day.charAt(1),
                  tenGod: analysis.tenGods.day,
                  branchTenGods: analysis.tenGods.dayBranch,
                  isDayPillar: true,
                },
                {
                  label: '时柱',
                  pillar: analysis.fourPillars.hour,
                  stem: analysis.fourPillars.hour.charAt(0),
                  branch: analysis.fourPillars.hour.charAt(1),
                  tenGod: analysis.tenGods.hour,
                  branchTenGods: analysis.tenGods.hourBranch,
                  isDayPillar: false,
                },
              ].map(({ label, pillar, stem, branch, tenGod, branchTenGods, isDayPillar }) => {
                const tenGodInfo = tenGod && !isDayPillar ? TEN_GOD_NAMES[tenGod] : null;
                return (
                  <Grid item xs={12} sm={6} md={3} key={label}>
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {label}
                      </Typography>
                      <Typography variant="h6" gutterBottom>
                        {pillar}
                      </Typography>

                      {/* 天干十神 / 日主 */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                          天干：{stem}
                        </Typography>
                        {isDayPillar ? (
                          <>
                            <Chip
                              label={gender === 'female' ? '元女 /（日主）' : '元男 /（日主）'}
                              size="small"
                              color="primary"
                              sx={{ mb: 0.5 }}
                            />
                          </>
                        ) : tenGodInfo ? (
                          <>
                            <Chip
                              label={tenGodInfo.full}
                              size="small"
                              color="primary"
                              sx={{ mb: 0.5 }}
                            />
                          </>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            无法计算十神
                          </Typography>
                        )}
                      </Box>

                      {/* 地支藏干十神 */}
                      {branchTenGods && branchTenGods.length > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            地支：{branch}（藏干）
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {branchTenGods.map(({ stem: hiddenStem, tenGod: branchTenGod }, index) => {
                              const branchTenGodInfo = branchTenGod ? TEN_GOD_NAMES[branchTenGod] : null;
                              return (
                                <Box
                                  key={index}
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    mb: 0.5,
                                  }}
                                >
                                  <Typography variant="caption" color="text.secondary">
                                    {hiddenStem}:
                                  </Typography>
                                  {branchTenGodInfo ? (
                                    <Chip
                                      label={branchTenGodInfo.full}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: '0.7rem', height: '20px' }}
                                    />
                                  ) : (
                                    <Typography variant="caption" color="text.secondary">
                                      -
                                    </Typography>
                                  )}
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
            {/* 十神解释：统一放在四柱下面 */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                十神说明
              </Typography>
              <List dense>
                {/* 日柱（日主）说明 */}
                <ListItem disablePadding>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        日柱（日主）：{gender === 'female' ? '元女 /（日主）' : '元男 /（日主）'}—— 日柱天干为命主本身，可视为「{gender === 'female' ? '元女' : '元男'}」，是整套命盘能量的核心。
                      </Typography>
                    }
                  />
                </ListItem>
                {/* 其他三柱的十神说明 */}
                {[
                  {
                    label: '年柱',
                    pillar: analysis.fourPillars.year,
                    tenGod: analysis.tenGods.year,
                  },
                  {
                    label: '月柱',
                    pillar: analysis.fourPillars.month,
                    tenGod: analysis.tenGods.month,
                  },
                  {
                    label: '时柱',
                    pillar: analysis.fourPillars.hour,
                    tenGod: analysis.tenGods.hour,
                  },
                ]
                  .filter(({ tenGod }) => !!tenGod)
                  .map(({ label, pillar, tenGod }) => {
                    const info = tenGod ? TEN_GOD_NAMES[tenGod] : null;
                    if (!info) return null;
                    return (
                      <ListItem key={label} disablePadding>
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              {label}（{pillar}）：{info.full} —— {info.description}
                            </Typography>
                          }
                        />
                      </ListItem>
                    );
                  })}
              </List>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 格局分析 */}
      {analysis.patternAnalysis && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              格局分析
            </Typography>
            {analysis.patternAnalysis.dominantTenGod && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {analysis.patternAnalysis.pattern}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {analysis.patternAnalysis.description}
                </Typography>
                {analysis.patternAnalysis.characteristics.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      格局特征：
                    </Typography>
                    <List dense>
                      {analysis.patternAnalysis.characteristics.map((char, index) => (
                        <ListItem key={index} disablePadding>
                          <ListItemText
                            primary={
                              <Typography variant="body2">
                                • {char}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            )}

            {/* 格局分析计算过程 */}
            {analysis.patternAnalysis.calculationProcess && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  格局分析计算过程
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  详细展示格局分析的每个计算步骤，包括十神统计、主导十神判断等过程。
                </Typography>

                {/* 计算步骤 */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    计算步骤
                  </Typography>
                  <List dense>
                    {analysis.patternAnalysis.calculationProcess.steps.map((step, index) => (
                      <ListItem
                        key={index}
                        alignItems="flex-start"
                        sx={{ flexDirection: 'column', alignItems: 'stretch', mb: 2 }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Chip
                            label={`步骤 ${step.step}`}
                            size="small"
                            color="primary"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="subtitle2">
                            {step.description}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            p: 2,
                            bgcolor: 'background.default',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          {step.step === 1 && (
                            <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                              {JSON.stringify(step.details.counts, null, 2)}
                            </Typography>
                          )}
                          {step.step === 2 && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                天干十神分布：
                              </Typography>
                              <Grid container spacing={1} sx={{ mb: 1 }}>
                                {Object.entries(step.details.stemTenGods || {}).map(([pillar, tenGod]) => {
                                  const tenGodValue = tenGod as TenGodType | null;
                                  return (
                                    <Grid item key={pillar}>
                                      <Chip
                                        label={`${pillar}: ${tenGodValue ? TEN_GOD_NAMES[tenGodValue].full : '无'}`}
                                        size="small"
                                        variant="outlined"
                                      />
                                    </Grid>
                                  );
                                })}
                              </Grid>
                              <Typography variant="caption" color="text.secondary" display="block">
                                更新后的计数：
                              </Typography>
                              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap', mt: 0.5 }}>
                                {JSON.stringify(step.details.updatedCounts, null, 2)}
                              </Typography>
                            </Box>
                          )}
                          {step.step === 3 && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                地支藏干十神分布：
                              </Typography>
                              {Object.entries(step.details.branchTenGods || {}).map(([pillar, branchTenGods]) => (
                                <Box key={pillar} sx={{ mb: 1 }}>
                                  <Typography variant="caption" fontWeight="bold">
                                    {pillar}：
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                    {(branchTenGods as Array<{ stem: string; tenGod: TenGodType | null }>).map((item, idx) => (
                                      <Chip
                                        key={idx}
                                        label={`${item.stem}: ${item.tenGod ? TEN_GOD_NAMES[item.tenGod].full : '无'}`}
                                        size="small"
                                        variant="outlined"
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              ))}
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                更新后的计数：
                              </Typography>
                              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap', mt: 0.5 }}>
                                {JSON.stringify(step.details.updatedCounts, null, 2)}
                              </Typography>
                            </Box>
                          )}
                          {step.step === 4 && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                十神出现次数排序：
                              </Typography>
                              <List dense>
                                {(step.details.sortedCounts as Array<{ tenGod: TenGodType; count: number; name: string }>).map((item, idx) => (
                                  <ListItem key={idx} disablePadding sx={{ py: 0.5 }}>
                                    <ListItemText
                                      primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Typography variant="body2">
                                            {idx + 1}. {item.name}（{item.tenGod}）
                                          </Typography>
                                          <Chip
                                            label={`${item.count} 次`}
                                            size="small"
                                            color={idx === 0 ? 'primary' : 'default'}
                                            variant={idx === 0 ? 'filled' : 'outlined'}
                                          />
                                        </Box>
                                      }
                                    />
                                  </ListItem>
                                ))}
                              </List>
                              {step.details.dominantTenGod && (
                                <Alert severity="info" sx={{ mt: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    主导十神：{step.details.dominantTenGod.name}（{step.details.dominantTenGod.tenGod}）
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    出现次数：{step.details.dominantTenGod.count} 次
                                  </Typography>
                                </Alert>
                              )}
                            </Box>
                          )}
                          {step.step === 5 && (
                            <Box>
                              {step.details.dominantTenGod ? (
                                <>
                                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                    根据主导十神判断格局：
                                  </Typography>
                                  <Alert severity="success" sx={{ mt: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                      格局：{step.details.pattern}
                                    </Typography>
                                    <Typography variant="body2">
                                      {step.details.description}
                                    </Typography>
                                    {(step.details.characteristics as string[]) && (step.details.characteristics as string[]).length > 0 && (
                                      <Box sx={{ mt: 1 }}>
                                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                          格局特征：
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                          {(step.details.characteristics as string[]).map((char, idx) => (
                                            <Chip
                                              key={idx}
                                              label={char}
                                              size="small"
                                              variant="outlined"
                                            />
                                          ))}
                                        </Box>
                                      </Box>
                                    )}
                                  </Alert>
                                </>
                              ) : (
                                <Alert severity="warning">
                                  <Typography variant="body2">
                                    {step.details.judgment}
                                  </Typography>
                                  <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 'bold' }}>
                                    格局：{step.details.pattern}
                                  </Typography>
                                </Alert>
                              )}
                            </Box>
                          )}
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </Box>

                {/* 十神统计汇总 */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    十神统计汇总
                  </Typography>
                  <Box
                    component="table"
                    sx={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      '& th, & td': {
                        border: '1px solid',
                        borderColor: 'divider',
                        p: 1,
                        textAlign: 'center',
                      },
                      '& th': {
                        bgcolor: 'action.hover',
                        fontWeight: 'bold',
                      },
                    }}
                  >
                    <thead>
                      <tr>
                        <th>十神</th>
                        <th>出现次数</th>
                        <th>说明</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...Object.entries(analysis.patternAnalysis.calculationProcess.tenGodCounts)]
                        .sort(([, a], [, b]) => b - a)
                        .map(([tenGod, count]) => {
                          const tenGodType = tenGod as TenGodType;
                          const info = TEN_GOD_NAMES[tenGodType];
                          const isDominant = tenGodType === analysis.patternAnalysis?.dominantTenGod;
                          return (
                            <tr key={tenGod} style={{ backgroundColor: isDominant ? 'rgba(25, 118, 210, 0.08)' : undefined }}>
                              <td>
                                <Chip
                                  label={info.full}
                                  size="small"
                                  color={isDominant ? 'primary' : 'default'}
                                  sx={{ fontWeight: isDominant ? 'bold' : 'normal' }}
                                />
                              </td>
                              <td>
                                <Typography variant="body2" sx={{ fontWeight: isDominant ? 'bold' : 'normal' }}>
                                  {count}
                                </Typography>
                              </td>
                              <td>
                                <Typography variant="caption" color="text.secondary">
                                  {info.description}
                                </Typography>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </Box>
                </Box>

                {/* 各柱十神分布详情 */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    各柱十神分布详情
                  </Typography>
                  <Grid container spacing={2}>
                    {analysis.patternAnalysis.calculationProcess.pillarDetails.map((pillarDetail) => (
                      <Grid item xs={12} sm={6} md={3} key={pillarDetail.pillar}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                              {pillarDetail.pillar}
                            </Typography>
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                天干十神：
                              </Typography>
                              {pillarDetail.stemTenGod ? (
                                <Chip
                                  label={TEN_GOD_NAMES[pillarDetail.stemTenGod].full}
                                  size="small"
                                  color="primary"
                                />
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  无
                                </Typography>
                              )}
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                地支藏干十神：
                              </Typography>
                              {pillarDetail.branchTenGods.length > 0 ? (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {pillarDetail.branchTenGods.map((item, idx) => (
                                    <Chip
                                      key={idx}
                                      label={`${item.stem}: ${item.tenGod ? TEN_GOD_NAMES[item.tenGod].full : '无'}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  ))}
                                </Box>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  无
                                </Typography>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* 大运 / 流年 / 流月 / 流日 / 流时分析 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            大运 · 流年 · 流月 · 流日 · 流时分析
          </Typography>

          {!fortuneData ? (
            <Typography variant="body2" color="text.secondary">
              需要提供完整的出生日期（以及可选的出生时间和性别）才能计算大运与流年流月流日流时。
            </Typography>
          ) : (
            <Box>
              {/* 大运 × 流年矩阵 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  大运 × 流年总览（点击某一年可联动下方流月 / 流日 / 流时）
                </Typography>
                <Box
                  sx={{
                    overflowX: 'auto',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Box
                    component="table"
                    sx={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      '& th, & td': {
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        p: 0.5,
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                      },
                      '& th': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <thead>
                      <tr>
                        <th>流年 \\ 大运</th>
                        {fortuneData.daYun.map((step) => (
                          <th key={step.index}>
                            第 {step.index} 运
                            <br />
                            {step.ganZhi}
                            {step.startAge !== undefined && step.endAge !== undefined
                              ? `（${step.startAge}–${step.endAge}岁）`
                              : ''}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {fortuneData.liuNian.map((item) => {
                        // 解析出生年用于计算年龄与大运归属
                        const birthYearNum = birthDate
                          ? Number(birthDate.split('-')[0])
                          : undefined;
                        const age =
                          birthYearNum && Number.isFinite(birthYearNum)
                            ? item.year - birthYearNum + 1
                            : undefined;

                        return (
                          <tr key={item.year}>
                            <td>
                              <Chip
                                label={`${item.year}年：${item.ganZhi}${
                                  age ? `（约 ${age} 岁）` : ''
                                }`}
                                size="small"
                                color={activeYear === item.year ? 'primary' : 'default'}
                                variant={activeYear === item.year ? 'filled' : 'outlined'}
                                onClick={() => {
                                  setActiveYear(item.year);
                                  setActiveMonth(null);
                                  setActiveDay(null);
                                }}
                                sx={{ cursor: 'pointer' }}
                              />
                            </td>
                            {fortuneData.daYun.map((step) => {
                              const inThisDaYun =
                                age !== undefined &&
                                step.startAge !== undefined &&
                                step.endAge !== undefined &&
                                age >= step.startAge &&
                                age <= step.endAge;
                              return (
                                <td key={step.index}>
                                  {inThisDaYun ? (
                                    <Chip
                                      label={step.ganZhi}
                                      size="small"
                                      color="secondary"
                                      variant="outlined"
                                    />
                                  ) : (
                                    <Typography
                                      variant="caption"
                                      color="text.disabled"
                                    >
                                      -
                                    </Typography>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </Box>
                </Box>
              </Box>

              {/* 流月：基于当前激活年份 */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  流月（当前激活年份的 12 个月）
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {fortuneData.liuYue.map((item, idx) => {
                    const isActive =
                      activeMonth === item.month &&
                      (!activeYear || activeYear === item.year);
                    return (
                      <Chip
                        key={`${item.year}-${item.month}-${idx}`}
                        label={`${item.month}月：${item.ganZhi}`}
                        size="small"
                        color={isActive ? 'primary' : 'default'}
                        variant={isActive ? 'filled' : 'outlined'}
                        onClick={() => {
                          setActiveYear(item.year);
                          setActiveMonth(item.month);
                          setActiveDay(null);
                        }}
                        sx={{ cursor: 'pointer' }}
                      />
                    );
                  })}
                </Box>
              </Box>

              {/* 流日：从当前激活日期起 30 天 */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  流日（从当前激活日期起约 30 天）
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {fortuneData.liuRi.map((item) => {
                    const dayNum = Number(item.date.split('-')[2]);
                    const isActive = activeDay === dayNum;
                    return (
                      <Chip
                        key={item.date}
                        label={`${item.date}：${item.ganZhi}`}
                        size="small"
                        color={isActive ? 'primary' : 'default'}
                        variant={isActive ? 'filled' : 'outlined'}
                        onClick={() => {
                          setActiveDay(dayNum);
                        }}
                        sx={{ cursor: 'pointer' }}
                      />
                    );
                  })}
                </Box>
              </Box>

              {/* 1. 一生年度能量 K 线（固定） */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  一生年度能量 K 线（按流年干支推算 80 年）
                </Typography>
                {energyCurves.lifeK.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    暂无足够数据，无法计算一生能量曲线。
                  </Typography>
                ) : (
                  <Box sx={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={energyCurves.lifeK}
                        margin={{ top: 20, right: 10, bottom: 20, left: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="age"
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                          interval={9}
                          label={{
                            value: '年龄',
                            position: 'insideBottomRight',
                            offset: -5,
                            fontSize: 10,
                            fill: '#9ca3af',
                          }}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                          tickLine={false}
                          axisLine={false}
                          label={{
                            value: '年度能量值',
                            angle: -90,
                            position: 'insideLeft',
                            fontSize: 10,
                            fill: '#9ca3af',
                          }}
                        />
                        <RechartsTooltip
                          formatter={(value: any, _name: any, props: any) => {
                            const p = props.payload as any;
                            return [`${value}`, `年龄 ${p.age} 岁 · ${p.year} 年`];
                          }}
                        />
                        <Bar
                          dataKey="bodyRange"
                          shape={<CandleShape />}
                          isAnimationActive={true}
                          animationDuration={1200}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Box>

              {/* 2. 某一年 12 个月能量 K 线（随所选年份变化） */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  年度月度能量 K 线（当前选定年份的 12 个月）
                </Typography>
                {energyCurves.yearK.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    暂无年度月度数据。
                  </Typography>
                ) : (
                  <Box sx={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={energyCurves.yearK}
                        margin={{ top: 20, right: 10, bottom: 20, left: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="monthLabel"
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                          interval={0}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <RechartsTooltip
                          formatter={(value: any, _name: any, props: any) => {
                            const p = props.payload as any;
                            return [`${value}`, `能量 (${p.monthLabel})`];
                          }}
                        />
                        <Bar
                          dataKey="bodyRange"
                          shape={<CandleShape />}
                          isAnimationActive={true}
                          animationDuration={1000}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Box>

              {/* 3. 某一月 30 天能量 K 线（随所选年份和月份变化） */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  月度每日能量 K 线（当前选定年份与月份的约 30 天）
                </Typography>
                {energyCurves.monthK.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    暂无月度日度数据。
                  </Typography>
                ) : (
                  <Box sx={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={energyCurves.monthK}
                        margin={{ top: 20, right: 10, bottom: 20, left: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="dayLabel"
                          tick={{ fontSize: 8, fill: '#6b7280' }}
                          interval={4}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <RechartsTooltip
                          formatter={(value: any, _name: any, props: any) => {
                            const p = props.payload as any;
                            return [`${value}`, `能量 (${p.date})`];
                          }}
                        />
                        <Bar
                          dataKey="bodyRange"
                          shape={<CandleShape />}
                          isAnimationActive={true}
                          animationDuration={1000}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Box>

              {/* 4. 某一日 24 小时能量折线（随所选天数变化） */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  当日 24 小时能量折线图（随当前选定日期变化）
                </Typography>
                {energyCurves.day24.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    暂无流时数据，无法绘制 24 小时能量曲线。
                  </Typography>
                ) : (
                  <Box sx={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={energyCurves.day24}
                        margin={{ top: 20, right: 10, bottom: 20, left: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                          interval={2}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <RechartsTooltip
                          formatter={(value: any) => [`${value}`, '能量']}
                        />
                        <Line
                          type="monotone"
                          dataKey="energy"
                          stroke="#6366f1"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          activeDot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 分析时间 */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        分析时间：{new Date(analysis.analyzedAt).toLocaleString('zh-CN')}
      </Typography>
    </Box>
  );
};

export default EnergyAnalysisResult;
