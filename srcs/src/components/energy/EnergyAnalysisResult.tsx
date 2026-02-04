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
import { EnergyAnalysis } from '../../types/energy';
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
   * 简化版「每日能量值」计算：
   * - 依据当日干支的五行与本命五行状态（旺/平/弱/缺）
   * - 直觉规则（可后续迭代为更专业算法）：
   *   - 若当日五行属于本命「缺失」元素 → 视为补充机会，能量高（约 85）
   *   - 若当日五行属于本命「偏弱」元素 → 次高（约 75）
   *   - 若当日五行属于本命「正常」元素 → 中性（约 60）
   *   - 若当日五行属于本命「旺盛」元素 → 略显失衡，能量偏低（约 45）
   */
  const getDailyEnergyScore = (ganZhi: string): number => {
    if (!ganZhi || ganZhi.length < 2) {
      return 60;
    }

    // 与能量服务中的映射保持一致（简化版）
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

    const baseByStatus: Record<'strong' | 'normal' | 'weak' | 'missing', number> = {
      missing: 85,
      weak: 75,
      normal: 60,
      strong: 45,
    };

    const chars = ganZhi.split('');
    const scores: number[] = [];

    chars.forEach((ch) => {
      const el = elementMap[ch];
      if (el && analysis.fiveElements[el]) {
        const status = analysis.fiveElements[el].status;
        scores.push(baseByStatus[status]);
      }
    });

    if (scores.length === 0) {
      return 60;
    }

    const avg = scores.reduce((sum, v) => sum + v, 0) / scores.length;
    // 限制在 30-95 区间，防止过度极端
    return Math.max(30, Math.min(95, Math.round(avg)));
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
   * 构造通用 K 线数据（open/close/high/low + bodyRange）
   */
  const buildKLine = <T extends { energy: number }>(
    base: T[]
  ): Array<T & { open: number; close: number; high: number; low: number; bodyRange: [number, number] }> => {
    if (!base.length) return [];
    const result: Array<T & { open: number; close: number; high: number; low: number; bodyRange: [number, number] }> =
      [];
    let prevClose = base[0].energy;
    base.forEach((item, idx) => {
      const open = idx === 0 ? item.energy : prevClose;
      const close = item.energy;
      const hiRaw = Math.max(open, close) + 5;
      const loRaw = Math.min(open, close) - 5;
      const high = Math.min(100, hiRaw);
      const low = Math.max(0, loRaw);
      const bodyRange: [number, number] = [Math.min(open, close), Math.max(open, close)];
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
        energy: getDailyEnergyScore(item.ganZhi),
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
        energy: getDailyEnergyScore(m.ganZhi),
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
        energy: getDailyEnergyScore(d.ganZhi),
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
        const energy = getDailyEnergyScore(item.ganZhi);
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
  }, [birthDate, activeYear, activeMonth, fortuneData, getDailyEnergyScore]);

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
                              label="元男 / 元女（日主）"
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
                        日柱（日主）：元男 / 元女（日主）—— 日柱天干为命主本身，可视为「元男 / 元女」，是整套命盘能量的核心。
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
                          domain={[30, 95]}
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                          tickLine={false}
                          axisLine={false}
                          label={{
                            value: '年度能量分',
                            angle: -90,
                            position: 'insideLeft',
                            fontSize: 10,
                            fill: '#9ca3af',
                          }}
                        />
                        <RechartsTooltip
                          formatter={(value: any, _name: any, props: any) => {
                            const p = props.payload as any;
                            return [
                              `${value} 分`,
                              `年龄 ${p.age} 岁 · ${p.year} 年`,
                            ];
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
                          domain={[30, 95]}
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <RechartsTooltip
                          formatter={(value: any, _name: any, props: any) => {
                            const p = props.payload as any;
                            return [
                              `${value} 分`,
                              `能量 (${p.monthLabel})`,
                            ];
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
                          domain={[30, 95]}
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <RechartsTooltip
                          formatter={(value: any, _name: any, props: any) => {
                            const p = props.payload as any;
                            return [
                              `${value} 分`,
                              `能量 (${p.date})`,
                            ];
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
                          domain={[30, 95]}
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <RechartsTooltip
                          formatter={(value: any) => [`${value} 分`, '能量']}
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
