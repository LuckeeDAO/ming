#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const sourceRoot = path.resolve(cwd, '../../works-docs/ming/ref/国学');
const outputFile = path.resolve(cwd, 'src/content/learningMaterials.generated.ts');

const fileConfigs = [
  {
    id: 'lm_sanming',
    sequence: 1,
    level: '入门',
    fileName: '八字 - 三命通会.txt',
    title: '《三命通会》五行生克入门',
    knowledgePointTitle: '五行就是木、火、土、金、水五类气；生克是两条固定关系链。',
    learningGoal: '先认清五行和生克链，再看天干地支归属，最后才谈格局。',
    scopeBoundary:
      '本词条只解决“五行与生克基础判断”，不直接给出完整命局吉凶结论。',
    coreConcepts: [
      '五行：木、火、土、金、水。',
      '相生：木生火、火生土、土生金、金生水、水生木。',
      '相克：木克土、土克水、水克火、火克金、金克木。',
      '最小判断顺序：先看五行强弱，再看生克是否通畅。',
    ],
    practicePrompt:
      '判断步骤：1) 统计五行数量；2) 找最弱与最强；3) 用相生补弱、用相克制过强；4) 再结合月令与日主复核。',
    commonMisconceptions: [
      '误区：把“五行缺某项”直接等同于“必凶”。更正：需结合旺衰与全局平衡。',
      '误区：只看相生不看相克。更正：生克必须同时看，目标是平衡而非单向增强。',
    ],
    counterExample:
      '反例：某盘“水少”但金旺能生水且月令得助，水未必真弱；仅看数量会误判。',
    minimumAlgorithm:
      '最小算法：五行计数 -> 识别偏旺/偏弱 -> 套用生克链做平衡方案 -> 用月令复核。',
    glossary: [
      '五行：木火土金水五类气机分类。',
      '相生：促进关系，按木火土金水循环。',
      '相克：制衡关系，按木土水火金链条循环。',
    ],
    sourceNote:
      '古籍依据：《三命通会》卷一；百科校核：维基百科「五行」「干支」条目中的生克关系定义。',
    publicSearchKeywords: ['三命通会 原文', '三命通会 五行生克', '日主 月令 取用'],
    prerequisites: [],
    tags: ['sizhu_bazi', 'wuxing_energy'],
    forceFallbackExcerpts: true,
    fallbackExcerpts: [
      '五行=木火土金水，不是抽象口号，而是判断“偏旺/偏弱”的计量坐标。',
      '生克链是固定关系：相生用于补弱，相克用于制衡。',
      '先看五行结构，再谈十神和格局，顺序不可颠倒。',
    ],
  },
  {
    id: 'lm_yuanhai',
    sequence: 2,
    level: '入门',
    fileName: '八字 - 渊海子平.txt',
    title: '《渊海子平》十神关系入门',
    knowledgePointTitle: '十神是“以日主为中心”的相对关系，不是固定标签。',
    learningGoal: '先定日主，再按“我与他”的生克关系和阴阳同异判十神。',
    scopeBoundary: '本词条聚焦十神判定逻辑，不展开神煞、格局高低等扩展判断。',
    coreConcepts: [
      '同我：比肩/劫财。',
      '我生：食神/伤官。',
      '我克：正财/偏财。',
      '克我：正官/七杀；生我：正印/偏印。',
    ],
    practicePrompt:
      '判断步骤：1) 先定日主五行；2) 判目标五行与日主的生克；3) 判阴阳同异；4) 输出对应十神。',
    commonMisconceptions: [
      '误区：十神是某个天干的固定属性。更正：十神必须相对“日主”才成立。',
      '误区：先看名称再理解关系。更正：应先推生克与阴阳，再落名称。',
    ],
    counterExample:
      '反例：同样一个“庚”，对甲日主可为七杀，对乙日主可为正官，结果不同。',
    minimumAlgorithm:
      '最小算法：确定日主 -> 判生克方向 -> 判阴阳同异 -> 映射十神名称。',
    glossary: [
      '日主：日柱天干，命局分析中心点。',
      '十神：围绕日主建立的十类关系标签。',
      '阴阳同异：区分正偏（如正财/偏财、正官/七杀）的关键。'
    ],
    sourceNote:
      '古籍依据：《渊海子平》十神体系；百科校核：百度百科/维基中“十神以日主为中心”的通行定义。',
    publicSearchKeywords: ['渊海子平 十神', '以日为主 月为提纲', '渊海子平 原文'],
    prerequisites: ['lm_sanming'],
    tags: ['sizhu_bazi', 'wuxing_energy'],
    forceFallbackExcerpts: true,
    fallbackExcerpts: [
      '十神判断的唯一起点是日主；日主变了，十神结果就会变。',
      '十神=生克关系+阴阳同异，两步缺一不可。',
      '不要背表格，先做关系推导再落到名称。',
    ],
  },
  {
    id: 'lm_jiejie',
    sequence: 3,
    level: '入门',
    fileName: '1900-2030年的交节时间1.csv',
    title: '交节时间数据校验基础',
    knowledgePointTitle: '交节时刻决定月令切换；月令错，后续判断会系统性偏差。',
    learningGoal: '遇到节气临界日，必须先核对交节时间，再确定月柱归属。',
    scopeBoundary: '本词条解决历法边界校验，不替代完整排盘引擎实现细节。',
    coreConcepts: [
      '数据格式：YYYYMMDDHHmm（如 190002041357）。',
      '判断关键：出生时刻在交节前还是交节后。',
      '交节前后可能导致月令变化，进而影响旺衰与取用。',
      '边界场景必须做双盘对比（本地盘 vs 外部盘）。',
    ],
    practicePrompt:
      '判断步骤：1) 查当日交节时刻；2) 比较出生时刻；3) 判定节前/节后；4) 固化月柱后再继续分析。',
    commonMisconceptions: [
      '误区：按公历月份直接定月令。更正：月令以节气切换为准。',
      '误区：只看日期不看时分。更正：临界日必须精确到时分。'
    ],
    counterExample:
      '反例：同一天出生，上午在交节前与下午在交节后，月柱可能不同。',
    minimumAlgorithm:
      '最小算法：定位出生时刻 -> 查询当日交节时刻 -> 判前后 -> 确认月令。',
    glossary: [
      '交节：节气切换的精确时刻。',
      '月令：按节气划分的月份主令。',
      '临界日：靠近交节、最易出错的日期区间。'
    ],
    sourceNote:
      '数据依据：1900-2030交节时间表（CSV）；百科校核：维基百科「节气」与天文机构公开说明（节气按黄经划分）。',
    publicSearchKeywords: ['交节时间 数据', '二十四节气 精确时刻', '节气边界 排盘'],
    prerequisites: ['lm_sanming'],
    tags: ['natural_object_ceremonies', 'wuxing_energy', 'sizhu_bazi'],
    forceFallbackExcerpts: true,
    fallbackExcerpts: [
      '交节时间不是“当天随便算”，必须以精确时刻判边界。',
      '节前/节后会改变月令，月令变化会连锁影响十神与格局判断。',
      '临界日先做历法校验，再做命理分析。',
    ],
  },
  {
    id: 'lm_yuding_liuren',
    sequence: 4,
    level: '进阶',
    fileName: '御定六壬直指.txt',
    title: '《御定六壬直指》六壬体系入门',
    knowledgePointTitle: '六壬核心是“起课有序、断课有据”，与四柱静态盘思路不同。',
    learningGoal: '先掌握课体与起课顺序，再进入断课，不混用四柱规则。',
    scopeBoundary: '本词条仅给六壬方法论框架，不覆盖全部课例断法细节。',
    coreConcepts: [
      '输入对象不同：六壬重占时与课体，四柱重出生盘。',
      '流程不同：六壬先起课后断象，四柱先定盘后论运。',
      '判断抓手：课传结构、将神关系、时空应象。',
      '方法要求：按固定序列推演，避免跳步断语。',
    ],
    practicePrompt:
      '判断步骤：1) 明确占问；2) 按法起课；3) 校验课体完整；4) 再做断象归纳。',
    commonMisconceptions: [
      '误区：六壬可直接套四柱结论。更正：两者输入对象与流程不同。',
      '误区：先断后起课。更正：必须先保证课体成立再谈断象。'
    ],
    counterExample:
      '反例：课体取错将神位置，后续断语再“合理”也会整体偏离。',
    minimumAlgorithm:
      '最小算法：定问题 -> 起课 -> 校验课体 -> 断象 -> 复核。',
    glossary: [
      '起课：按时空条件生成课体。',
      '课体：断象所依赖的结构骨架。',
      '断象：依据课体关系进行结论归纳。'
    ],
    sourceNote:
      '古籍依据：《御定六壬直指》课体与断法；百科校核：百度百科/维基关于“大六壬为三式之一、重起课断象”的通行描述。',
    publicSearchKeywords: ['御定六壬直指 原文', '大六壬 入门', '六壬 起课 断课'],
    prerequisites: ['lm_yuanhai'],
    tags: ['natural_object_ceremonies'],
    forceFallbackExcerpts: true,
    fallbackExcerpts: [
      '六壬与四柱不是同一算法，不能直接套用同一判断口径。',
      '起课顺序错误会直接导致后续断课失真。',
      '先把流程跑通，再谈断语准确率。',
    ],
  },
  {
    id: 'lm_kuaisu_qipan',
    sequence: 5,
    level: '进阶',
    fileName: '大六壬 - 快速起盘法.txt',
    title: '大六壬快速起盘法',
    knowledgePointTitle: '快速起盘的本质是“相对位置映射”，不是死记每一步结果。',
    learningGoal: '固定地盘基准后，通过月将与占时相对位快速推得天盘与课传。',
    scopeBoundary: '本词条聚焦“起盘速度与准确性”的方法，不扩展具体断例。',
    coreConcepts: [
      '先固定地盘，再转动天盘。',
      '核心变量：月将-占时相对位置。',
      '输出目标：四课三传与将神配置。',
      '训练指标：速度可快，但顺序和校验不能省。',
    ],
    practicePrompt:
      '判断步骤：1) 先定位月将与占时；2) 推天盘落宫；3) 取四课三传；4) 最后核对将神。',
    commonMisconceptions: [
      '误区：快=省步骤。更正：快是流程内化，不是跳步骤。',
      '误区：只追求速度。更正：先稳正确率，再提速。'
    ],
    counterExample:
      '反例：20秒起盘但将神错位，后续全盘无效；宁可慢一点先做校验。',
    minimumAlgorithm:
      '最小算法：定相对位 -> 落天盘 -> 取课传 -> 将神校验 -> 输出。',
    glossary: [
      '地盘：固定参照宫位。',
      '天盘：相对地盘旋转后的映射层。',
      '四课三传：六壬核心输出结构。'
    ],
    sourceNote:
      '资料依据：《大六壬-快速起盘法》训练步骤；百科校核：百度百科/维基对六壬起课流程与术语的基础定义。',
    publicSearchKeywords: ['大六壬 快速起盘法', '月将 占时 相对位置', '四课三传 训练'],
    prerequisites: ['lm_yuding_liuren'],
    tags: ['natural_object_ceremonies', 'sizhu_bazi'],
    forceFallbackExcerpts: true,
    fallbackExcerpts: [
      '快速起盘不是省步骤，而是把步骤内化成稳定映射。',
      '月将与占时的相对位置是整个起盘的主轴。',
      '先保证正确率，再追求 20 秒内完成。',
    ],
  },
];

function normalizeText(input) {
  return input.replace(/\r\n/g, '\n').replace(/\u0000/g, '').trim();
}

function hasMojibake(text) {
  if (!text) return true;
  const replacementCount = (text.match(/�/g) || []).length;
  return replacementCount / Math.max(text.length, 1) > 0.01;
}

function extractTxtExcerpts(text, fallbackExcerpts) {
  if (hasMojibake(text)) return fallbackExcerpts;
  const lines = normalizeText(text)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length >= 12);

  const sampled = [];
  for (const line of lines) {
    if (sampled.length >= 3) break;
    sampled.push(line.length > 120 ? `${line.slice(0, 120)}...` : line);
  }

  return sampled.length > 0 ? sampled : fallbackExcerpts;
}

function extractCsvExcerpts(text, fallbackExcerpts) {
  const rows = normalizeText(text)
    .split('\n')
    .map((row) => row.trim())
    .filter(Boolean);
  if (rows.length === 0) return fallbackExcerpts;

  const sample = rows.slice(0, 10).join(' / ');
  return [
    `样例节气时间：${sample}`,
    '可直接用于“出生时刻是否跨节气”校验，避免月令误判。',
  ];
}

function buildMaterial(config) {
  const fullPath = path.join(sourceRoot, config.fileName);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`source file not found: ${fullPath}`);
  }

  const raw = fs.readFileSync(fullPath, 'utf8');
  const excerptBlocks = config.forceFallbackExcerpts
    ? config.fallbackExcerpts
    : config.fileName.endsWith('.csv')
      ? extractCsvExcerpts(raw, config.fallbackExcerpts)
      : extractTxtExcerpts(raw, config.fallbackExcerpts);

  return {
    id: config.id,
    sequence: config.sequence,
    level: config.level,
    fileName: config.fileName,
    title: config.title,
    knowledgePointTitle: config.knowledgePointTitle,
    learningGoal: config.learningGoal,
    scopeBoundary: config.scopeBoundary,
    coreConcepts: config.coreConcepts,
    excerptBlocks,
    practicePrompt: config.practicePrompt,
    commonMisconceptions: config.commonMisconceptions,
    counterExample: config.counterExample,
    minimumAlgorithm: config.minimumAlgorithm,
    glossary: config.glossary,
    sourceNote: config.sourceNote,
    publicSearchKeywords: config.publicSearchKeywords,
    prerequisites: config.prerequisites,
    tags: config.tags,
  };
}

function main() {
  const materials = fileConfigs.map(buildMaterial);
  const payload = {
    generatedAt: new Date().toISOString(),
    sourceRoot: 'works-docs/ming/ref/国学',
    materials,
  };

  const fileBody = `/* eslint-disable */
// Auto-generated by scripts/generate-learning-materials.mjs
// Do not edit manually.

export interface LearningMaterialGenerated {
  id: string;
  sequence: number;
  level: '入门' | '进阶';
  fileName: string;
  title: string;
  knowledgePointTitle: string;
  learningGoal: string;
  scopeBoundary: string;
  coreConcepts: string[];
  excerptBlocks: string[];
  practicePrompt: string;
  commonMisconceptions: string[];
  counterExample: string;
  minimumAlgorithm: string;
  glossary: string[];
  sourceNote: string;
  publicSearchKeywords: string[];
  prerequisites: string[];
  tags: string[];
}

export interface LearningMaterialsGeneratedPayload {
  generatedAt: string;
  sourceRoot: string;
  materials: LearningMaterialGenerated[];
}

export const learningMaterialsGenerated: LearningMaterialsGeneratedPayload = ${JSON.stringify(payload, null, 2)} as const;
`;

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, fileBody, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`generated: ${outputFile} (${materials.length} materials)`);
}

main();
