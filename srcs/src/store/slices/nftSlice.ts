/**
 * NFT状态管理Slice
 * 
 * 管理NFT相关的状态，包括：
 * - 用户持有的NFT列表
 * - 当前选中的NFT
 * - NFT铸造状态和进度
 * - 错误信息
 * 
 * @module store/slices/nftSlice
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NFTOnChain } from '../../types/nft';

/**
 * NFT状态接口
 */
interface NFTState {
  nfts: NFTOnChain[]; // 用户持有的NFT列表
  selectedNFT: NFTOnChain | null; // 当前选中的NFT
  minting: boolean; // 是否正在铸造NFT
  mintingProgress: {
    step: string; // 当前步骤描述
    progress: number; // 进度百分比（0-100）
  } | null; // 铸造进度信息
  error: string | null; // 错误信息
}

/**
 * 初始状态
 */
const initialState: NFTState = {
  nfts: [],
  selectedNFT: null,
  minting: false,
  mintingProgress: null,
  error: null,
};

/**
 * NFT状态Slice
 */
const nftSlice = createSlice({
  name: 'nft',
  initialState,
  reducers: {
    /**
     * 设置NFT列表（替换整个列表）
     */
    setNFTs: (state, action: PayloadAction<NFTOnChain[]>) => {
      state.nfts = action.payload;
    },
    /**
     * 添加NFT到列表
     */
    addNFT: (state, action: PayloadAction<NFTOnChain>) => {
      state.nfts.push(action.payload);
    },
    /**
     * 设置选中的NFT
     */
    setSelectedNFT: (state, action: PayloadAction<NFTOnChain | null>) => {
      state.selectedNFT = action.payload;
    },
    /**
     * 设置铸造状态
     */
    setMinting: (state, action: PayloadAction<boolean>) => {
      state.minting = action.payload;
    },
    /**
     * 设置铸造进度
     */
    setMintingProgress: (
      state,
      action: PayloadAction<{ step: string; progress: number } | null>
    ) => {
      state.mintingProgress = action.payload;
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
  setNFTs,
  addNFT,
  setSelectedNFT,
  setMinting,
  setMintingProgress,
  setError,
} = nftSlice.actions;

export default nftSlice.reducer;
