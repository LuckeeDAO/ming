/// <reference types="vite/client" />

/**
 * Vite环境变量类型声明
 */
interface ImportMetaEnv {
  readonly VITE_NFT_CONTRACT_ADDRESS?: string;
  readonly VITE_IPFS_GATEWAY?: string;
  readonly VITE_PINATA_API_KEY?: string;
  readonly VITE_PINATA_SECRET_KEY?: string;
  readonly VITE_CHAIN_FAMILY?: 'evm' | 'solana';
  readonly VITE_CHAIN_NETWORK?: string;
  readonly VITE_CHAIN_ID?: string;
  readonly VITE_WALLET_APP_URL?: string;
  readonly VITE_WALLET_CONNECTION_MODE?: 'andao' | 'metamask';
  readonly VITE_WALLET_WINDOW_NAME?: string;
  readonly VITE_WALLET_TARGET_ORIGIN?: string;
  readonly VITE_WALLET_ALLOWED_ORIGINS?: string;
  readonly VITE_WALLET_BRIDGE_DEBUG?: 'true' | 'false' | '1' | '0';
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Window.ethereum类型声明（用于MetaMask）
 */
interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, handler: (...args: any[]) => void) => void;
    removeListener: (event: string, handler: (...args: any[]) => void) => void;
    selectedAddress?: string;
    chainId?: string;
  };
}
