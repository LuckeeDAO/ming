export interface FourPillars {
  year: string; // 年柱（如：甲子）
  month: string; // 月柱
  day: string; // 日柱
  hour: string; // 时柱
}

export interface EnergyAnalysis {
  walletAddress: string;
  analysisId: string;
  fourPillars: FourPillars;
  fiveElements: {
    wood: {
      value: number;
      status: 'strong' | 'normal' | 'weak' | 'missing';
    };
    fire: {
      value: number;
      status: 'strong' | 'normal' | 'weak' | 'missing';
    };
    earth: {
      value: number;
      status: 'strong' | 'normal' | 'weak' | 'missing';
    };
    metal: {
      value: number;
      status: 'strong' | 'normal' | 'weak' | 'missing';
    };
    water: {
      value: number;
      status: 'strong' | 'normal' | 'weak' | 'missing';
    };
  };
  circulation: {
    status: 'smooth' | 'blocked' | 'weak';
    details: string;
    blockedPoints: string[];
  };
  missingElements: Array<{
    element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
    level: 'critical' | 'moderate' | 'minor';
    recommendation: string;
  }>;
  analyzedAt: Date;
}

export interface ExternalObject {
  id: string;
  name: string;
  nameEn?: string;
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  category: 'nature' | 'mineral' | 'plant' | 'water' | 'fire' | 'other';
  description: string;
  descriptionEn?: string;
  image: string;
  symbolImage?: string;
  connectionMethods: ConnectionMethod[];
  recommendedFor: Array<{
    element: string;
    reason: string;
  }>;
  culturalBackground?: {
    origin: string;
    meaning: string;
  };
}

export interface ConnectionMethod {
  type: 'symbolic' | 'experiential' | 'deep';
  name: string;
  description: string;
  steps: Array<{
    order: number;
    title: string;
    description: string;
    duration?: string;
  }>;
  materials: Array<{
    name: string;
    required: boolean;
    alternatives?: string[];
  }>;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
}
