import { energyAnalysisService } from '../services/energy/energyAnalysisService.js';
import type { FourPillars } from '../types/energy.js';

function runSample(name: string, fourPillars: FourPillars) {
  const result = energyAnalysisService.analyze(fourPillars);
  // 只打印关键信息，便于在终端快速观察效果
  // eslint-disable-next-line no-console
  console.log(`=== 样例：${name} ===`);
  console.log('四柱:', fourPillars);
  console.log(
    '五行能量:',
    Object.fromEntries(
      Object.entries(result.fiveElements).map(([k, v]) => [
        k,
        { value: Math.round(v.value), status: v.status },
      ]),
    ),
  );
  console.log('循环状态:', result.circulation);
  console.log('缺失/偏弱:', result.missingElements);
  console.log('---');
}

// 若你有自己的命例，可以按同样结构追加到这里
const samples: Array<{ name: string; fourPillars: FourPillars }> = [
  {
    name: '春季木火偏旺样例（甲寅年、丙辰月、甲子日、庚午时）',
    fourPillars: {
      year: '甲寅',
      month: '丙辰',
      day: '甲子',
      hour: '庚午',
    },
  },
  {
    name: '夏季火土偏旺样例（丙午年、戊午月、丁巳日、壬子时）',
    fourPillars: {
      year: '丙午',
      month: '戊午',
      day: '丁巳',
      hour: '壬子',
    },
  },
  {
    name: '秋季金水偏旺样例（庚申年、辛酉月、辛丑日、乙亥时）',
    fourPillars: {
      year: '庚申',
      month: '辛酉',
      day: '辛丑',
      hour: '乙亥',
    },
  },
  {
    name: '冬季水木偏旺样例（壬子年、癸亥月、甲子日、丙寅时）',
    fourPillars: {
      year: '壬子',
      month: '癸亥',
      day: '甲子',
      hour: '丙寅',
    },
  },
];

samples.forEach(({ name, fourPillars }) => runSample(name, fourPillars));

