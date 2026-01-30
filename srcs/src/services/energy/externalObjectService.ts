/**
 * 外物数据服务
 * 
 * 提供外物数据的获取和管理功能
 * 
 * 功能：
 * - 获取所有可用的外物列表
 * - 根据元素类型筛选外物
 * - 根据分类筛选外物
 * - 获取外物详情
 * 
 * 数据说明：
 * - 外物数据目前存储在本地（未来可迁移到IPFS或后端API）
 * - 每个外物包含：ID、名称、元素属性、分类、描述、连接方式等
 * 
 * @module services/energy/externalObjectService
 */
import { ExternalObject } from '../../types/energy';

/**
 * 外物数据列表
 * 
 * 包含各种外物的完整信息，用于能量分析和推荐
 * 数据基于传统命理学和五行理论
 */
const EXTERNAL_OBJECTS: ExternalObject[] = [
  // 木属性外物
  {
    id: 'wood_tree',
    name: '树木',
    nameEn: 'Tree',
    element: 'wood',
    category: 'plant',
    description: '树木代表生长和生命力，连接树木可以增强木属性能量，促进成长和发展。',
    descriptionEn: 'Trees represent growth and vitality. Connecting with trees can enhance wood element energy and promote growth and development.',
    image: '/images/objects/tree.jpg',
    connectionMethods: [
      {
        type: 'symbolic',
        name: '象征性连接',
        description: '在树木旁静坐，感受树木的生命力',
        steps: [
          { order: 1, title: '选择树木', description: '选择一棵健康、有活力的树木' },
          { order: 2, title: '静坐', description: '在树木旁静坐10-15分钟' },
          { order: 3, title: '感受', description: '感受树木的生命力和能量' },
        ],
        materials: [
          { name: '坐垫', required: false },
        ],
        difficulty: 'easy',
        estimatedTime: '15-20分钟',
      },
    ],
    recommendedFor: [
      { element: 'wood', reason: '直接补充木属性能量' },
    ],
    culturalBackground: {
      origin: '传统命理学',
      meaning: '树木在五行中代表木，象征生长、向上、发展',
    },
  },
  {
    id: 'wood_bamboo',
    name: '竹子',
    nameEn: 'Bamboo',
    element: 'wood',
    category: 'plant',
    description: '竹子代表坚韧和节节高升，连接竹子可以增强意志力和进取心。',
    descriptionEn: 'Bamboo represents resilience and continuous growth. Connecting with bamboo can enhance willpower and ambition.',
    image: '/images/objects/bamboo.jpg',
    connectionMethods: [
      {
        type: 'symbolic',
        name: '象征性连接',
        description: '观察竹子，感受其坚韧不拔的品质',
        steps: [
          { order: 1, title: '观察', description: '仔细观察竹子的形态和结构' },
          { order: 2, title: '触摸', description: '轻轻触摸竹子的表面' },
          { order: 3, title: '冥想', description: '闭目冥想，感受竹子的品质' },
        ],
        materials: [],
        difficulty: 'easy',
        estimatedTime: '10-15分钟',
      },
    ],
    recommendedFor: [
      { element: 'wood', reason: '补充木属性能量，增强意志力' },
    ],
  },
  
  // 火属性外物
  {
    id: 'fire_candle',
    name: '蜡烛',
    nameEn: 'Candle',
    element: 'fire',
    category: 'fire',
    description: '蜡烛代表光明和温暖，连接蜡烛可以增强火属性能量，提升热情和活力。',
    descriptionEn: 'Candles represent light and warmth. Connecting with candles can enhance fire element energy and boost passion and vitality.',
    image: '/images/objects/candle.jpg',
    connectionMethods: [
      {
        type: 'experiential',
        name: '体验式连接',
        description: '点燃蜡烛，观察火焰，感受温暖和光明',
        steps: [
          { order: 1, title: '准备', description: '准备一支蜡烛和安全的点燃环境' },
          { order: 2, title: '点燃', description: '点燃蜡烛，观察火焰' },
          { order: 3, title: '感受', description: '感受火焰的温暖和光明，冥想10-15分钟' },
        ],
        materials: [
          { name: '蜡烛', required: true },
          { name: '打火机', required: true },
        ],
        difficulty: 'easy',
        estimatedTime: '15-20分钟',
      },
    ],
    recommendedFor: [
      { element: 'fire', reason: '直接补充火属性能量' },
    ],
  },
  {
    id: 'fire_sun',
    name: '阳光',
    nameEn: 'Sunlight',
    element: 'fire',
    category: 'nature',
    description: '阳光代表能量和活力，在阳光下进行连接可以增强火属性能量。',
    descriptionEn: 'Sunlight represents energy and vitality. Connecting under sunlight can enhance fire element energy.',
    image: '/images/objects/sun.jpg',
    connectionMethods: [
      {
        type: 'experiential',
        name: '体验式连接',
        description: '在阳光下静坐或行走，感受阳光的能量',
        steps: [
          { order: 1, title: '选择时间', description: '选择阳光充足的时段（上午10点-下午3点）' },
          { order: 2, title: '户外活动', description: '在阳光下静坐或缓慢行走20-30分钟' },
          { order: 3, title: '感受', description: '感受阳光带来的温暖和能量' },
        ],
        materials: [],
        difficulty: 'easy',
        estimatedTime: '20-30分钟',
      },
    ],
    recommendedFor: [
      { element: 'fire', reason: '通过阳光补充火属性能量' },
    ],
  },
  
  // 土属性外物
  {
    id: 'earth_soil',
    name: '土壤',
    nameEn: 'Soil',
    element: 'earth',
    category: 'nature',
    description: '土壤代表稳定和承载，连接土壤可以增强土属性能量，提升稳定性和包容性。',
    descriptionEn: 'Soil represents stability and support. Connecting with soil can enhance earth element energy and improve stability and inclusiveness.',
    image: '/images/objects/soil.jpg',
    connectionMethods: [
      {
        type: 'experiential',
        name: '体验式连接',
        description: '触摸土壤，感受其稳定和承载的力量',
        steps: [
          { order: 1, title: '选择地点', description: '选择一处自然土壤（花园、公园等）' },
          { order: 2, title: '触摸', description: '用手触摸土壤，感受其质地和温度' },
          { order: 3, title: '冥想', description: '闭目冥想，感受土壤的稳定力量' },
        ],
        materials: [],
        difficulty: 'easy',
        estimatedTime: '15-20分钟',
      },
    ],
    recommendedFor: [
      { element: 'earth', reason: '直接补充土属性能量' },
    ],
  },
  {
    id: 'earth_stone',
    name: '石头',
    nameEn: 'Stone',
    element: 'earth',
    category: 'mineral',
    description: '石头代表坚固和持久，连接石头可以增强稳定性和耐力。',
    descriptionEn: 'Stones represent solidity and endurance. Connecting with stones can enhance stability and endurance.',
    image: '/images/objects/stone.jpg',
    connectionMethods: [
      {
        type: 'symbolic',
        name: '象征性连接',
        description: '选择一块石头，观察和触摸，感受其坚固',
        steps: [
          { order: 1, title: '选择石头', description: '选择一块有意义的石头' },
          { order: 2, title: '观察', description: '仔细观察石头的形状、颜色、纹理' },
          { order: 3, title: '触摸', description: '用手触摸石头，感受其质地' },
          { order: 4, title: '冥想', description: '将石头放在手中，闭目冥想10分钟' },
        ],
        materials: [],
        difficulty: 'easy',
        estimatedTime: '15-20分钟',
      },
    ],
    recommendedFor: [
      { element: 'earth', reason: '补充土属性能量，增强稳定性' },
    ],
  },
  
  // 金属性外物
  {
    id: 'metal_coin',
    name: '金属硬币',
    nameEn: 'Metal Coin',
    element: 'metal',
    category: 'mineral',
    description: '金属硬币代表价值和流通，连接金属可以增强金属性能量，提升决断力和执行力。',
    descriptionEn: 'Metal coins represent value and circulation. Connecting with metal can enhance metal element energy and improve decisiveness and execution.',
    image: '/images/objects/coin.jpg',
    connectionMethods: [
      {
        type: 'symbolic',
        name: '象征性连接',
        description: '手持金属硬币，感受其质感和能量',
        steps: [
          { order: 1, title: '准备', description: '准备一枚金属硬币（铜币、银币等）' },
          { order: 2, title: '观察', description: '仔细观察硬币的图案和文字' },
          { order: 3, title: '触摸', description: '用手触摸硬币，感受其质感和温度' },
          { order: 4, title: '冥想', description: '将硬币握在手中，闭目冥想10-15分钟' },
        ],
        materials: [
          { name: '金属硬币', required: true },
        ],
        difficulty: 'easy',
        estimatedTime: '15-20分钟',
      },
    ],
    recommendedFor: [
      { element: 'metal', reason: '直接补充金属性能量' },
    ],
  },
  {
    id: 'metal_bell',
    name: '金属铃铛',
    nameEn: 'Metal Bell',
    element: 'metal',
    category: 'mineral',
    description: '金属铃铛代表声音和振动，连接铃铛可以增强金属性能量，提升沟通能力。',
    descriptionEn: 'Metal bells represent sound and vibration. Connecting with bells can enhance metal element energy and improve communication skills.',
    image: '/images/objects/bell.jpg',
    connectionMethods: [
      {
        type: 'experiential',
        name: '体验式连接',
        description: '敲击铃铛，聆听声音，感受振动',
        steps: [
          { order: 1, title: '准备', description: '准备一个金属铃铛' },
          { order: 2, title: '敲击', description: '轻轻敲击铃铛，聆听声音' },
          { order: 3, title: '感受', description: '感受声音的振动和能量，冥想10分钟' },
        ],
        materials: [
          { name: '金属铃铛', required: true },
        ],
        difficulty: 'easy',
        estimatedTime: '10-15分钟',
      },
    ],
    recommendedFor: [
      { element: 'metal', reason: '补充金属性能量，增强沟通能力' },
    ],
  },
  
  // 水属性外物
  {
    id: 'water_river',
    name: '流水',
    nameEn: 'Flowing Water',
    element: 'water',
    category: 'water',
    description: '流水代表流动和变化，连接流水可以增强水属性能量，提升灵活性和适应性。',
    descriptionEn: 'Flowing water represents movement and change. Connecting with flowing water can enhance water element energy and improve flexibility and adaptability.',
    image: '/images/objects/river.jpg',
    connectionMethods: [
      {
        type: 'experiential',
        name: '体验式连接',
        description: '观察流水，聆听水声，感受流动',
        steps: [
          { order: 1, title: '选择地点', description: '选择一处有流水的地方（河流、小溪、喷泉等）' },
          { order: 2, title: '观察', description: '仔细观察流水的形态和流动' },
          { order: 3, title: '聆听', description: '闭目聆听流水的声音' },
          { order: 4, title: '感受', description: '感受流水的能量和流动，冥想15-20分钟' },
        ],
        materials: [],
        difficulty: 'easy',
        estimatedTime: '20-30分钟',
      },
    ],
    recommendedFor: [
      { element: 'water', reason: '直接补充水属性能量' },
    ],
  },
  {
    id: 'water_well',
    name: '静水',
    nameEn: 'Still Water',
    element: 'water',
    category: 'water',
    description: '静水代表深度和智慧，连接静水可以增强水属性能量，提升智慧和洞察力。',
    descriptionEn: 'Still water represents depth and wisdom. Connecting with still water can enhance water element energy and improve wisdom and insight.',
    image: '/images/objects/well.jpg',
    connectionMethods: [
      {
        type: 'deep',
        name: '深度连接',
        description: '观察静水，感受其深度和宁静',
        steps: [
          { order: 1, title: '选择地点', description: '选择一处静水（湖泊、池塘、水井等）' },
          { order: 2, title: '观察', description: '仔细观察静水的表面和深度' },
          { order: 3, title: '冥想', description: '在静水旁静坐，闭目冥想20-30分钟' },
        ],
        materials: [
          { name: '坐垫', required: false },
        ],
        difficulty: 'medium',
        estimatedTime: '25-35分钟',
      },
    ],
    recommendedFor: [
      { element: 'water', reason: '补充水属性能量，增强智慧' },
    ],
  },
];

class ExternalObjectService {
  /**
   * 获取所有可用的外物列表
   * 
   * @returns 外物列表
   */
  async getAvailableObjects(): Promise<ExternalObject[]> {
    // 模拟异步操作（未来可以从IPFS或API获取）
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...EXTERNAL_OBJECTS]);
      }, 100);
    });
  }

  /**
   * 根据元素类型获取外物列表
   * 
   * @param element - 元素类型（wood、fire、earth、metal、water）
   * @returns 匹配的外物列表
   */
  async getObjectsByElement(
    element: 'wood' | 'fire' | 'earth' | 'metal' | 'water'
  ): Promise<ExternalObject[]> {
    const allObjects = await this.getAvailableObjects();
    return allObjects.filter((obj) => obj.element === element);
  }

  /**
   * 根据分类获取外物列表
   * 
   * @param category - 分类（nature、mineral、plant、water、fire、other）
   * @returns 匹配的外物列表
   */
  async getObjectsByCategory(
    category: 'nature' | 'mineral' | 'plant' | 'water' | 'fire' | 'other'
  ): Promise<ExternalObject[]> {
    const allObjects = await this.getAvailableObjects();
    return allObjects.filter((obj) => obj.category === category);
  }

  /**
   * 根据ID获取外物详情
   * 
   * @param id - 外物ID
   * @returns 外物详情，如果不存在则返回null
   */
  async getObjectById(id: string): Promise<ExternalObject | null> {
    const allObjects = await this.getAvailableObjects();
    return allObjects.find((obj) => obj.id === id) || null;
  }

  /**
   * 根据多个ID批量获取外物
   * 
   * @param ids - 外物ID数组
   * @returns 外物列表
   */
  async getObjectsByIds(ids: string[]): Promise<ExternalObject[]> {
    const allObjects = await this.getAvailableObjects();
    return allObjects.filter((obj) => ids.includes(obj.id));
  }
}

export const externalObjectService = new ExternalObjectService();
