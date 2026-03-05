/**
 * 仪式资源服务
 *
 * 提供：
 * - 仪式资源目录
 * - 项目内学习摘录
 * - 基于文本文件自动整理的学习资料（每文件一个知识点）
 */

import { learningMaterialsGenerated } from '../../content/learningMaterials.generated';

export interface CeremonyResource {
  id: string;
  title: string;
  description: string;
  category: '指南' | '素材' | '知识库';
  route: string;
}

export interface CeremonyTextSnippet {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
}

export interface LearningMaterial {
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

const ceremonyResources: CeremonyResource[] = [
  {
    id: 'basic_ceremony',
    title: '基础仪式指南',
    description: '了解基本的连接仪式流程和注意事项',
    category: '指南',
    route: '/ceremony-resources/basic_ceremony',
  },
  {
    id: 'natural_object_ceremonies',
    title: '自然物特定仪式',
    description: '针对不同自然物的专门仪式指导',
    category: '指南',
    route: '/ceremony-resources/natural_object_ceremonies',
  },
  {
    id: 'blessing_templates',
    title: '仪式文案模板',
    description: '仪式中使用的文案模板',
    category: '素材',
    route: '/ceremony-resources/blessing_templates',
  },
  {
    id: 'wuxing_energy',
    title: '五行能量理论',
    description: '深入了解五行生克理论和能量循环',
    category: '知识库',
    route: '/ceremony-resources/wuxing_energy',
  },
  {
    id: 'sizhu_bazi',
    title: '四柱八字基础',
    description: '学习四柱八字的基本概念和计算方法',
    category: '知识库',
    route: '/ceremony-resources/sizhu_bazi',
  },
];

const projectTextSnippets: CeremonyTextSnippet[] = [
  {
    id: 'wp_closed_loop',
    title: '三元闭环',
    excerpt: '以命理共学建立视角，以共识设定组织规则，再以仪式实践把意图落为链上契约。',
    tags: ['basic_ceremony', 'wuxing_energy', 'sizhu_bazi'],
  },
  {
    id: 'wp_anchor_contract',
    title: '锚定契约',
    excerpt: '仪式是将意图锚定为链上契约的动作。每一次铸造，都是一份可编程的自我承诺。',
    tags: ['basic_ceremony', 'blessing_templates'],
  },
  {
    id: 'wp_solar_timing',
    title: '节气与择时',
    excerpt: '节气是群体长期实践形成的时间坐标；择时是个体与外界对话的坐标系。',
    tags: ['natural_object_ceremonies', 'wuxing_energy'],
  },
  {
    id: 'flow_7_steps',
    title: '七阶段流程',
    excerpt: '流程覆盖：能量分析、外物推荐、选择外物、准备连接、内容创建、铸造阶段、完成记录。',
    tags: ['basic_ceremony'],
  },
  {
    id: 'contract_required',
    title: '合约依赖约束',
    excerpt: 'NFT铸造依赖合约。无有效合约配置时，立即铸造和定时铸造都会失败。',
    tags: ['basic_ceremony'],
  },
  {
    id: 'wuxing_quant',
    title: '五行量化口径',
    excerpt: '初始化口径为天干1000、地支1200，并在合化/刑冲中进行动态修正。',
    tags: ['wuxing_energy', 'sizhu_bazi'],
  },
  {
    id: 'bazi_baseline',
    title: '本地排盘基线',
    excerpt: '四柱与十神以本地权威排盘为基线，AI负责解释，不改写排盘事实。',
    tags: ['sizhu_bazi'],
  },
];

class CeremonyResourcesService {
  getAllResources(): CeremonyResource[] {
    return ceremonyResources;
  }

  getResourcesByCategory(category: '指南' | '素材' | '知识库'): CeremonyResource[] {
    return ceremonyResources.filter((resource) => resource.category === category);
  }

  getResourceById(id: string): CeremonyResource | undefined {
    return ceremonyResources.find((resource) => resource.id === id);
  }

  getProjectTextSnippets(resourceId?: string): CeremonyTextSnippet[] {
    if (!resourceId) return projectTextSnippets;
    return projectTextSnippets.filter((snippet) => snippet.tags.includes(resourceId));
  }

  getLearningMaterials(resourceId?: string): LearningMaterial[] {
    const materials = (learningMaterialsGenerated.materials as LearningMaterial[]).sort(
      (a, b) => a.sequence - b.sequence
    );
    if (!resourceId) return materials;
    return materials.filter((material) => material.tags.includes(resourceId));
  }

  getLearningMaterialById(id: string): LearningMaterial | undefined {
    const materials = learningMaterialsGenerated.materials as LearningMaterial[];
    return materials.find((material) => material.id === id);
  }

  getLearningMaterialNavigation(id: string): {
    previous?: LearningMaterial;
    next?: LearningMaterial;
    index: number;
    total: number;
  } {
    const materials = learningMaterialsGenerated.materials as LearningMaterial[];
    const index = materials.findIndex((material) => material.id === id);
    return {
      previous: index > 0 ? materials[index - 1] : undefined,
      next: index >= 0 && index < materials.length - 1 ? materials[index + 1] : undefined,
      index,
      total: materials.length,
    };
  }

  getRecommendedNextLearningMaterial(
    completedIds: string[]
  ): { material?: LearningMaterial; reason: 'next_unlocked' | 'all_completed' | 'blocked' } {
    const materials = this.getLearningMaterials();
    const completed = new Set(completedIds);
    const unfinished = materials.filter((material) => !completed.has(material.id));
    if (unfinished.length === 0) {
      return { material: materials[0], reason: 'all_completed' };
    }

    const nextUnlocked = unfinished.find((material) =>
      material.prerequisites.every((item) => completed.has(item))
    );
    if (nextUnlocked) {
      return { material: nextUnlocked, reason: 'next_unlocked' };
    }

    return { reason: 'blocked' };
  }

  getLearningMaterialsMeta(): { generatedAt: string; sourceRoot: string; count: number } {
    return {
      generatedAt: learningMaterialsGenerated.generatedAt,
      sourceRoot: learningMaterialsGenerated.sourceRoot,
      count: learningMaterialsGenerated.materials.length,
    };
  }
}

export const ceremonyResourcesService = new CeremonyResourcesService();
