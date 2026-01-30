import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './slices/walletSlice';
import nftReducer from './slices/nftSlice';
import energyReducer from './slices/energySlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    nft: nftReducer,
    energy: energyReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
