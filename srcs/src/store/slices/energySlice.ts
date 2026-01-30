/**
 * 能量分析状态管理Slice
 * 
 * 管理四柱八字分析相关的状态：
 * - 四柱八字输入数据
 * - 能量分析结果
 * - 推荐的外物列表
 * - 选中的外物
 * - 加载状态和错误信息
 * 
 * @module store/slices/energySlice
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FourPillars, EnergyAnalysis, ExternalObject } from '../../types/energy';

/**
 * 能量分析状态接口
 */
interface EnergyState {
  fourPillars: FourPillars | null; // 四柱八字数据
  analysis: EnergyAnalysis | null; // 能量分析结果
  recommendedObjects: ExternalObject[]; // 推荐的外物列表
  selectedObject: ExternalObject | null; // 选中的外物
  loading: boolean; // 加载状态
  error: string | null; // 错误信息
}

/**
 * 初始状态
 */
const initialState: EnergyState = {
  fourPillars: null,
  analysis: null,
  recommendedObjects: [],
  selectedObject: null,
  loading: false,
  error: null,
};

/**
 * 能量分析Slice
 */
const energySlice = createSlice({
  name: 'energy',
  initialState,
  reducers: {
    /**
     * 设置四柱八字数据
     */
    setFourPillars: (state, action: PayloadAction<FourPillars | null>) => {
      state.fourPillars = action.payload;
    },
    /**
     * 设置能量分析结果
     */
    setAnalysis: (state, action: PayloadAction<EnergyAnalysis | null>) => {
      state.analysis = action.payload;
    },
    /**
     * 分析能量（设置分析结果并清除错误）
     */
    analyzeEnergy: (state, action: PayloadAction<EnergyAnalysis>) => {
      state.analysis = action.payload;
      state.fourPillars = action.payload.fourPillars;
      state.error = null;
    },
    /**
     * 设置推荐的外物列表
     */
    setRecommendedObjects: (
      state,
      action: PayloadAction<ExternalObject[]>
    ) => {
      state.recommendedObjects = action.payload;
    },
    /**
     * 设置选中的外物
     */
    setSelectedObject: (state, action: PayloadAction<ExternalObject | null>) => {
      state.selectedObject = action.payload;
    },
    /**
     * 设置加载状态
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    /**
     * 设置错误信息
     */
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setFourPillars,
  setAnalysis,
  analyzeEnergy,
  setRecommendedObjects,
  setSelectedObject,
  setLoading,
  setError,
} = energySlice.actions;

export default energySlice.reducer;
