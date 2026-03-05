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
    knowledgePointTitle: '理解五行生克与干支取象的基础逻辑',
    learningGoal: '建立“先五行、后干支、再格局”的命理分析基础顺序。',
    coreConcepts: ['五行生成', '相生相克', '日主视角', '全局取用'],
    practicePrompt:
      '任选一个八字样例，先只写出五行分布和生克链条，再判断哪一环最失衡，并给出补偏建议。',
    publicSearchKeywords: ['三命通会 原文', '三命通会 五行生克', '日主 月令 取用'],
    prerequisites: [],
    tags: ['sizhu_bazi', 'wuxing_energy'],
    fallbackExcerpts: [
      '卷一开篇聚焦五行生成，强调阴阳与数理对应关系是后续干支、格局判断的基础。',
      '学习重点是先看能量结构，再进入十神和岁运，不可直接跳到结论。',
    ],
  },
  {
    id: 'lm_yuanhai',
    sequence: 2,
    level: '入门',
    fileName: '八字 - 渊海子平.txt',
    title: '《渊海子平》十神与日主关系',
    knowledgePointTitle: '按“日主中心”读懂十神关系',
    learningGoal: '把十神关系从“背诵表”转成“关系推理”。',
    coreConcepts: ['日主中心', '十神映射', '月令提纲', '岁运配合'],
    practicePrompt:
      '以甲日主和乙日主各举一例，写出它们看到同一干时为何十神定义不同，并说明实际影响。',
    publicSearchKeywords: ['渊海子平 十神', '以日为主 月为提纲', '渊海子平 原文'],
    prerequisites: ['lm_sanming'],
    tags: ['sizhu_bazi', 'wuxing_energy'],
    fallbackExcerpts: [
      '文本以“见某干即为何十神”展开，适合做十神速查与关系训练。',
      '重点不是死记，而是理解“同一对象在不同日主下角色会变化”。',
    ],
  },
  {
    id: 'lm_jiejie',
    sequence: 3,
    level: '入门',
    fileName: '1900-2030年的交节时间1.csv',
    title: '交节时间数据校验基础',
    knowledgePointTitle: '用交节边界修正排盘时间误差',
    learningGoal: '学会在节气临界日用数据校验“节前/节后”归属。',
    coreConcepts: ['交节边界', '月令切换', '时间戳校验', '排盘对比'],
    practicePrompt:
      '选一个接近节气切换的出生时刻，用本地排盘与外部排盘对比“月令是否切换”，记录差异来源。',
    publicSearchKeywords: ['交节时间 数据', '二十四节气 精确时刻', '节气边界 排盘'],
    prerequisites: ['lm_sanming'],
    tags: ['natural_object_ceremonies', 'wuxing_energy', 'sizhu_bazi'],
    fallbackExcerpts: [
      '数据格式为 YYYYMMDDHHmm，可直接用于程序化边界判断。',
      '重点用途是避免“临界日错月令”导致的后续全链路误差。',
    ],
  },
  {
    id: 'lm_yuding_liuren',
    sequence: 4,
    level: '进阶',
    fileName: '御定六壬直指.txt',
    title: '《御定六壬直指》六壬体系入门',
    knowledgePointTitle: '建立六壬“起课-断课”的序列意识',
    learningGoal: '理解六壬与四柱体系不同的推演路径，避免混用规则。',
    coreConcepts: ['课体结构', '起课顺序', '时空应象', '断课框架'],
    practicePrompt:
      '围绕同一问题，分别写出“四柱分析步骤”和“六壬分析步骤”，对比两者输入与输出差异。',
    publicSearchKeywords: ['御定六壬直指 原文', '大六壬 入门', '六壬 起课 断课'],
    prerequisites: ['lm_yuanhai'],
    tags: ['natural_object_ceremonies'],
    fallbackExcerpts: [
      '该资料用于六壬学习扩展，建议与术语表配套，先术语后课式再断例。',
      '当前整理版以方法论导读为主，便于纳入学习路径而非直接背诵。',
    ],
  },
  {
    id: 'lm_kuaisu_qipan',
    sequence: 5,
    level: '进阶',
    fileName: '大六壬 - 快速起盘法.txt',
    title: '大六壬快速起盘法',
    knowledgePointTitle: '掌握“相对位置”快速起盘核心',
    learningGoal: '把起盘速度训练为稳定可复现的流程动作。',
    coreConcepts: ['相对位置', '地盘天盘', '月将占时', '四课三传'],
    practicePrompt:
      '按文中步骤做 10 次“20 秒起盘”训练，记录每次错在哪里，并建立自己的纠错清单。',
    publicSearchKeywords: ['大六壬 快速起盘法', '月将 占时 相对位置', '四课三传 训练'],
    prerequisites: ['lm_yuding_liuren'],
    tags: ['natural_object_ceremonies', 'sizhu_bazi'],
    fallbackExcerpts: [
      '核心诀窍为“相对位置”，要求先在头脑中建立稳定地盘。',
      '训练目标是快速完成四课三传及天将配位，形成程序化操作习惯。',
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
  const excerptBlocks = config.fileName.endsWith('.csv')
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
    coreConcepts: config.coreConcepts,
    excerptBlocks,
    practicePrompt: config.practicePrompt,
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
  coreConcepts: string[];
  excerptBlocks: string[];
  practicePrompt: string;
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
