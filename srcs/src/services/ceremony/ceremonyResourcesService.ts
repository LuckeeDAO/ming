/**
 * 仪式资源服务
 * 
 * 提供仪式相关的资源内容：
 * - 仪式指南
 * - 仪式模板
 * - 知识库内容
 */

export interface CeremonyResource {
  id: string;
  title: string;
  description: string;
  category: '指南' | '素材' | '知识库';
  /**
   * 对应的前端路由路径
   * 例如：/ceremony-resources/basic_ceremony
   */
  route: string;
}

/**
 * 仪式资源数据
 * 从 /ref/web/resources_index.json 加载
 */
const ceremonyResources: CeremonyResource[] = [
  // 指南类
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
  // 素材类
  {
    id: 'blessing_templates',
    title: '仪式文案模板',
    description: '仪式中使用的文案模板',
    category: '素材',
    route: '/ceremony-resources/blessing_templates',
  },
  // 知识库类
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

class CeremonyResourcesService {
  /**
   * 获取所有资源
   */
  getAllResources(): CeremonyResource[] {
    return ceremonyResources;
  }

  /**
   * 根据分类获取资源
   */
  getResourcesByCategory(category: '指南' | '素材' | '知识库'): CeremonyResource[] {
    return ceremonyResources.filter((r) => r.category === category);
  }

  /**
   * 根据ID获取资源
   */
  getResourceById(id: string): CeremonyResource | undefined {
    return ceremonyResources.find((r) => r.id === id);
  }
}

export const ceremonyResourcesService = new CeremonyResourcesService();
