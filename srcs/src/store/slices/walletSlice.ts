/**
 * 钱包状态管理 Slice
 * 
 * 管理钱包连接状态，包括：
 * - 钱包地址
 * - 连接状态
 * - 网络 ID
 * - 余额
 * - 加载状态
 * - 错误信息
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * 钱包状态接口
 */
interface WalletState {
  address: string | null; // 钱包地址
  isConnected: boolean; // 是否已连接
  networkId: number | null; // 网络 ID
  balance: string | null; // 余额（ETH）
  loading: boolean; // 加载状态
  error: string | null; // 错误信息
}

const initialState: WalletState = {
  address: null,
  isConnected: false,
  networkId: null,
  balance: null,
  loading: false,
  error: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setAddress: (state, action: PayloadAction<string | null>) => {
      state.address = action.payload;
      state.isConnected = action.payload !== null;
    },
    setNetworkId: (state, action: PayloadAction<number | null>) => {
      state.networkId = action.payload;
    },
    setBalance: (state, action: PayloadAction<string | null>) => {
      state.balance = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    reset: (state) => {
      state.address = null;
      state.isConnected = false;
      state.networkId = null;
      state.balance = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setAddress,
  setNetworkId,
  setBalance,
  setLoading,
  setError,
  reset,
} = walletSlice.actions;

export default walletSlice.reducer;
