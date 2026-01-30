/**
 * NFT 合约服务
 * 
 * 提供与 ConnectionNFT 智能合约交互的完整功能
 * 
 * 功能：
 * - 初始化合约连接（需要MetaMask和合约地址）
 * - 铸造连接NFT（mintConnection）
 * - 查询用户的所有NFT Token ID
 * - 查询NFT连接信息（getConnectionInfo）
 * - 更新共识哈希（updateConsensusHash）
 * - 批量查询用户NFT信息
 * 
 * 使用说明：
 * 1. 首先调用 init() 初始化合约服务（需要合约地址和链ID）
 * 2. 确保用户已连接MetaMask钱包
 * 3. 调用相应的方法进行合约交互
 * 
 * 注意事项：
 * - 所有写操作（mint、update）需要用户签名确认
 * - 合约地址和ABI需要根据实际部署的合约配置
 * - 错误处理：所有方法都会抛出错误，需要调用方处理
 * 
 * @module services/contract/nftContract
 */
import { ethers } from 'ethers';
import { NFTOnChain } from '../../types/nft';

// ConnectionNFT 合约 ABI（简化版，实际应从合约编译后获取）
const CONNECTION_NFT_ABI = [
  'function mintConnection(address to, string memory tokenURI, string memory externalObjectId, string memory element, bytes32 consensusHash) public returns (uint256)',
  'function getUserTokens(address user) public view returns (uint256[])',
  'function getConnectionInfo(uint256 tokenId) public view returns (tuple(uint256 tokenId, address owner, string tokenURI, uint256 connectionDate, string externalObjectId, string element, bytes32 consensusHash))',
  'function updateConsensusHash(uint256 tokenId, bytes32 consensusHash) public',
  'event ConnectionMinted(uint256 indexed tokenId, address indexed owner, string tokenURI, uint256 connectionDate, string externalObjectId, string element)',
];

export interface ConnectionNFTConfig {
  contractAddress: string;
  chainId: number;
}

class NFTContractService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  /**
   * 初始化合约服务
   */
  async init(config: ConnectionNFTConfig): Promise<void> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }
    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    this.contract = new ethers.Contract(
      config.contractAddress,
      CONNECTION_NFT_ABI,
      this.signer
    );
  }

  /**
   * 铸造连接 NFT
   */
  async mintConnection(
    to: string,
    tokenURI: string,
    externalObjectId: string,
    element: string,
    consensusHash: string
  ): Promise<string> {
    if (!this.contract || !this.signer) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.mintConnection(
        to,
        tokenURI,
        externalObjectId,
        element,
        consensusHash
      );
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }

  /**
   * 查询用户的所有 NFT Token ID
   */
  async getUserTokens(userAddress: string): Promise<string[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tokenIds = await this.contract.getUserTokens(userAddress);
      return tokenIds.map((id: bigint) => id.toString());
    } catch (error) {
      console.error('Error getting user tokens:', error);
      throw error;
    }
  }

  /**
   * 查询连接信息
   */
  async getConnectionInfo(tokenId: string): Promise<any> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const info = await this.contract.getConnectionInfo(tokenId);
      return info;
    } catch (error) {
      console.error('Error getting connection info:', error);
      throw error;
    }
  }

  /**
   * 更新共识哈希
   */
  async updateConsensusHash(
    tokenId: string,
    consensusHash: string
  ): Promise<string> {
    if (!this.contract || !this.signer) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.updateConsensusHash(tokenId, consensusHash);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error updating consensus hash:', error);
      throw error;
    }
  }

  /**
   * 从交易中获取Token ID
   * 
   * 通过解析交易收据中的ConnectionMinted事件来获取新铸造的NFT Token ID
   * 
   * 实现说明：
   * 1. 等待交易确认并获取交易收据
   * 2. 从收据的日志中查找ConnectionMinted事件
   * 3. 解析事件中的tokenId（第一个indexed参数）
   * 
   * @param txHash - 交易哈希
   * @returns Token ID（字符串格式）
   */
  async getTokenIdFromTransaction(txHash: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      // 获取交易收据
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        throw new Error('Transaction receipt not found');
      }

      // 使用合约接口解析事件
      // ConnectionMinted事件：ConnectionMinted(uint256 indexed tokenId, address indexed owner, ...)
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
        // 这是一个备用方案
        const userTokens = await this.getUserTokens(receipt.from);
        if (userTokens && userTokens.length > 0) {
          // 假设最后一个是最新铸造的（需要根据实际情况调整）
          tokenId = userTokens[userTokens.length - 1];
        } else {
          throw new Error('ConnectionMinted event not found in transaction');
        }
      }

      return tokenId;
    } catch (error) {
      console.error('Error getting token ID from transaction:', error);
      throw error;
    }
  }

  /**
   * 批量查询用户的 NFT 信息
   * 
   * @param userAddress - 用户钱包地址
   * @returns NFT信息数组
   */
  async getUserNFTs(userAddress: string): Promise<NFTOnChain[]> {
    const tokenIds = await this.getUserTokens(userAddress);
    const nfts: NFTOnChain[] = [];

    for (const tokenId of tokenIds) {
      try {
        const info = await this.getConnectionInfo(tokenId);
        nfts.push({
          tokenId,
          owner: info.owner,
          contractAddress: this.contract!.target as string,
          tokenURI: info.tokenURI,
          mintedAt: Number(info.connectionDate),
          txHash: '', // 需要从事件中获取（可通过历史事件查询）
          blockNumber: 0, // 需要从事件中获取（可通过历史事件查询）
        });
      } catch (error) {
        console.error(`Error getting NFT info for token ${tokenId}:`, error);
      }
    }

    return nfts;
  }
}

export const nftContractService = new NFTContractService();
