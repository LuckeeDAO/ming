/**
 * 直接铸造NFT服务
 * 
 * @deprecated
 * 当前项目已统一采用钱包消息协议进行铸造（mingWalletInterface）。
 * 本服务保留为历史参考，不建议在现行流程中使用。
 * 
 * 功能：
 * - 直接调用合约的mintConnection方法
 * - 使用MetaMask签名交易
 * - 获取交易结果和Token ID
 */

import { ethers } from 'ethers';

// ConnectionNFT 合约完整ABI（包含铸造方法）
const CONNECTION_NFT_ABI = [
  // 铸造方法
  'function mintConnection(address to, string memory tokenURI, string memory externalObjectId, string memory element, bytes32 consensusHash) public returns (uint256)',
  // 查询方法
  'function getUserTokens(address user) public view returns (uint256[])',
  'function getConnectionInfo(uint256 tokenId) public view returns (tuple(uint256 tokenId, address owner, string tokenURI, uint256 connectionDate, string externalObjectId, string element, bytes32 consensusHash))',
  // 事件
  'event ConnectionMinted(uint256 indexed tokenId, address indexed owner, string tokenURI, uint256 connectionDate, string externalObjectId, string element)',
];

export interface DirectMintParams {
  to: string;
  tokenURI: string;
  externalObjectId: string;
  element: string;
  consensusHash: string;
}

export interface DirectMintResult {
  tokenId: string;
  txHash: string;
  blockNumber: number;
}

class DirectMintService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  /**
   * 初始化服务
   */
  async init(contractAddress: string): Promise<void> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    this.contract = new ethers.Contract(
      contractAddress,
      CONNECTION_NFT_ABI,
      this.signer
    );
  }

  /**
   * 直接铸造NFT
   * 
   * @param params - 铸造参数
   * @returns 铸造结果（包含tokenId和txHash）
   */
  async mintNFT(params: DirectMintParams): Promise<DirectMintResult> {
    if (!this.contract || !this.signer) {
      throw new Error('Service not initialized. Please call init() first.');
    }

    try {
      // 验证参数
      if (!params.to || !ethers.isAddress(params.to)) {
        throw new Error('Invalid recipient address');
      }
      if (!params.tokenURI || params.tokenURI.trim().length === 0) {
        throw new Error('TokenURI cannot be empty');
      }
      if (!params.consensusHash) {
        throw new Error('Consensus hash is required');
      }

      // 将共识哈希转换为bytes32
      let hashBytes: string;
      if (params.consensusHash.startsWith('0x') && params.consensusHash.length === 66) {
        hashBytes = params.consensusHash;
      } else {
        // 使用keccak256哈希函数处理字符串
        hashBytes = ethers.keccak256(ethers.toUtf8Bytes(params.consensusHash));
      }

      // 调用合约方法
      const tx = await this.contract.mintConnection(
        params.to,
        params.tokenURI,
        params.externalObjectId || '',
        params.element || '',
        hashBytes
      );

      // 等待交易确认
      const receipt = await tx.wait();

      if (!receipt) {
        throw new Error('Transaction receipt not found');
      }

      // 从事件中获取Token ID
      const tokenId = await this.getTokenIdFromReceipt(receipt);

      return {
        tokenId,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('Error minting NFT:', error);
      
      // 处理用户拒绝交易的情况
      if (error instanceof Error) {
        if (error.message.includes('user rejected') || error.message.includes('User denied')) {
          throw new Error('Transaction was rejected by user');
        }
        if (error.message.includes('insufficient funds')) {
          throw new Error('Insufficient funds for transaction');
        }
        if (error.message.includes('nonce')) {
          throw new Error('Transaction nonce error. Please try again.');
        }
      }
      
      throw error;
    }
  }

  /**
   * 从交易收据中获取Token ID
   */
  private async getTokenIdFromReceipt(receipt: ethers.ContractTransactionReceipt): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      // 使用合约接口解析事件
      const eventInterface = this.contract.interface;
      const eventFragment = eventInterface.getEvent('ConnectionMinted');
      
      if (!eventFragment) {
        throw new Error('ConnectionMinted event not found in contract ABI');
      }

      // 查找匹配的事件日志
      let tokenId: string | null = null;
      
      for (const log of receipt.logs) {
        try {
          // 尝试解析日志
          const parsedLog = eventInterface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });
          
          if (parsedLog && parsedLog.name === 'ConnectionMinted') {
            // tokenId是第一个参数（indexed）
            tokenId = parsedLog.args[0].toString();
            break;
          }
        } catch (e) {
          // 忽略解析失败（可能是其他事件）
          continue;
        }
      }

      if (!tokenId) {
        // 如果无法解析，尝试从用户Token列表中获取最新的
        const signerAddress = await this.signer!.getAddress();
        const userTokens = await this.contract.getUserTokens(signerAddress);
        if (userTokens && userTokens.length > 0) {
          // 假设最后一个是最新铸造的
          tokenId = userTokens[userTokens.length - 1].toString();
        } else {
          throw new Error('ConnectionMinted event not found in transaction');
        }
      }

      if (!tokenId) {
        throw new Error('Failed to get token ID from transaction');
      }

      return tokenId;
    } catch (error) {
      console.error('Error getting token ID from receipt:', error);
      throw error;
    }
  }

  /**
   * 检查合约是否已初始化
   */
  isInitialized(): boolean {
    return this.contract !== null && this.signer !== null;
  }

  /**
   * 获取当前连接的地址
   */
  async getAddress(): Promise<string> {
    if (!this.signer) {
      throw new Error('Service not initialized');
    }
    return await this.signer.getAddress();
  }
}

export const directMintService = new DirectMintService();
