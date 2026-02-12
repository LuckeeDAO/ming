/**
 * 调试八字能量计算：乙卯丁亥辛未壬辰
 * 分析为什么火比金还弱
 */

// 模拟能量计算过程
const fourPillars = {
  year: '乙卯',
  month: '丁亥',
  day: '辛未',
  hour: '壬辰'
};

console.log('=== 八字分析：乙卯丁亥辛未壬辰 ===\n');

// 1. 初始能量
console.log('1. 初始能量（天干1000，地支1200）:');
const initialEnergy = {
  wood: 0,
  fire: 0,
  earth: 0,
  metal: 0,
  water: 0
};

// 天干
initialEnergy.wood += 1000; // 乙
initialEnergy.fire += 1000; // 丁
initialEnergy.metal += 1000; // 辛
initialEnergy.water += 1000; // 壬

// 地支藏干分配
// 卯：木1.0
initialEnergy.wood += 1200 * 1.0;

// 亥：水0.7, 木0.3
initialEnergy.water += 1200 * 0.7;
initialEnergy.wood += 1200 * 0.3;

// 未：土0.6, 火0.3, 木0.1
initialEnergy.earth += 1200 * 0.6;
initialEnergy.fire += 1200 * 0.3;
initialEnergy.wood += 1200 * 0.1;

// 辰：土0.6, 木0.3, 水0.1
initialEnergy.earth += 1200 * 0.6;
initialEnergy.wood += 1200 * 0.3;
initialEnergy.water += 1200 * 0.1;

console.log('初始能量:', initialEnergy);

// 2. 得根得气调整
console.log('\n2. 得根得气调整:');
const rootQiEnergy = { ...initialEnergy };

// 乙（木）在卯：得根（系数1.5）
rootQiEnergy.wood += 1000 * (1.5 - 1); // +500

// 丁（火）在未：未中火0.3 < 0.6，得气（系数1.2）
rootQiEnergy.fire += 1000 * (1.2 - 1); // +200

// 辛（金）在未：未中无金，检查其他地支
// 跨柱得气系数：1 + (1.2 - 1) * 0.8 = 1.16
rootQiEnergy.metal += 1000 * (1.16 - 1); // +160

// 壬（水）在辰：辰中水0.1 < 0.6，得气（系数1.2）
rootQiEnergy.water += 1000 * (1.2 - 1); // +200

console.log('得根得气后:', rootQiEnergy);

// 3. 月令校正（亥月）
console.log('\n3. 月令校正（亥月）:');
const monthCoeff = {
  water: 1.08,
  wood: 1.0,
  fire: 0.52,
  earth: 0.78,
  metal: 0.72
};

const monthAdjustedEnergy = {};
Object.keys(rootQiEnergy).forEach(el => {
  const coeff = monthCoeff[el] || 1.0;
  monthAdjustedEnergy[el] = rootQiEnergy[el] * coeff;
});

console.log('月令校正系数:', monthCoeff);
console.log('月令校正后:', monthAdjustedEnergy);

// 4. 分析问题
console.log('\n=== 问题分析 ===');
console.log('火能量:', monthAdjustedEnergy.fire);
console.log('金能量:', monthAdjustedEnergy.metal);
console.log('火/金比值:', (monthAdjustedEnergy.fire / monthAdjustedEnergy.metal).toFixed(2));

console.log('\n关键问题：');
console.log('1. 月令亥月对火的校正系数是0.52（非常弱）');
console.log('2. 月令亥月对金的校正系数是0.72（也弱，但比火强）');
console.log('3. 丁火在未中得气（+200），但月令校正后损失很大');
console.log('4. 辛金跨柱得气（+160），月令校正后损失相对较小');

console.log('\n建议：');
console.log('1. 检查月令校正表是否合理（亥月火0.52可能过低）');
console.log('2. 检查得根得气逻辑（辛金是否有根）');
console.log('3. 检查相生相克关系（水多可能生木，木多可能生火）');
