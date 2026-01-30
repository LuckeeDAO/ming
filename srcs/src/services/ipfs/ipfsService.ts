/**
 * IPFS 服务
 * 
 * 提供与 IPFS（InterPlanetary File System）网络交互的完整功能
 * 
 * 功能：
 * - 上传文件到IPFS（支持任意文件类型）
 * - 上传JSON数据到IPFS（自动序列化）
 * - 从IPFS获取文件（返回Blob）
 * - 从IPFS获取JSON数据（自动反序列化）
 * - 获取IPFS文件的访问URL
 * 
 * 实现说明：
 * - 当前使用 Pinata 作为IPFS网关和上传服务
 * - 需要配置 Pinata API Key 和 Secret API Key
 * - 如果没有配置Pinata，会抛出错误（未来可支持公共节点）
 * 
 * 使用流程：
 * 1. 调用 init() 初始化服务（配置Pinata API密钥）
 * 2. 使用 uploadFile() 或 uploadJSON() 上传数据
 * 3. 获取返回的IPFS哈希（CID）
 * 4. 使用 getFile() 或 getJSON() 获取数据
 * 5. 使用 getAccessUrl() 获取HTTP访问URL
 * 
 * 注意事项：
 * - 上传的文件会永久存储在IPFS网络中（通过Pinata Pin服务）
 * - IPFS哈希是内容寻址，相同内容会产生相同哈希
 * - 文件大小建议控制在合理范围内（当前未限制，但Pinata可能有限制）
 * - JSON上传会自动序列化，获取时自动反序列化
 * 
 * @module services/ipfs/ipfsService
 */
import axios from 'axios';

export interface IPFSConfig {
  pinataApiKey?: string;
  pinataSecretApiKey?: string;
  gatewayUrl?: string; // IPFS 网关 URL，如 https://gateway.pinata.cloud/ipfs/
}

class IPFSService {
  private config: IPFSConfig = {
    gatewayUrl: 'https://gateway.pinata.cloud/ipfs/',
  };

  /**
   * 初始化 IPFS 服务
   */
  init(config: IPFSConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 上传文件到 IPFS
   * 
   * @param file - 要上传的文件
   * @returns IPFS 哈希（CID）
   */
  async uploadFile(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // 如果配置了 Pinata API，使用 Pinata 上传
      if (this.config.pinataApiKey && this.config.pinataSecretApiKey) {
        return await this.uploadToPinata(formData);
      }

      // 否则使用公共 IPFS 节点（需要实现）
      throw new Error('Pinata API keys not configured');
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw error;
    }
  }

  /**
   * 上传 JSON 数据到 IPFS
   * 
   * @param data - 要上传的 JSON 对象
   * @returns IPFS 哈希（CID）
   */
  async uploadJSON(data: object): Promise<string> {
    try {
      const jsonString = JSON.stringify(data);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const file = new File([blob], 'metadata.json', {
        type: 'application/json',
      });

      return await this.uploadFile(file);
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      throw error;
    }
  }

  /**
   * 从 IPFS 获取文件
   * 
   * @param hash - IPFS 哈希（CID）
   * @returns 文件 Blob
   */
  async getFile(hash: string): Promise<Blob> {
    try {
      const url = `${this.config.gatewayUrl}${hash}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file from IPFS: ${response.statusText}`);
      }
      return await response.blob();
    } catch (error) {
      console.error('Error getting file from IPFS:', error);
      throw error;
    }
  }

  /**
   * 从 IPFS 获取 JSON 数据
   * 
   * @param hash - IPFS 哈希（CID）
   * @returns JSON 对象
   */
  async getJSON<T = any>(hash: string): Promise<T> {
    try {
      const blob = await this.getFile(hash);
      const text = await blob.text();
      return JSON.parse(text);
    } catch (error) {
      console.error('Error getting JSON from IPFS:', error);
      throw error;
    }
  }

  /**
   * 获取 IPFS 文件的访问 URL
   * 
   * @param hash - IPFS 哈希（CID）
   * @returns 完整的访问 URL
   */
  getAccessUrl(hash: string): string {
    return `${this.config.gatewayUrl}${hash}`;
  }

  /**
   * 使用 Pinata API 上传文件
   * 私有方法
   */
  private async uploadToPinata(formData: FormData): Promise<string> {
    if (!this.config.pinataApiKey || !this.config.pinataSecretApiKey) {
      throw new Error('Pinata API keys not configured');
    }

    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'pinata_api_key': this.config.pinataApiKey,
            'pinata_secret_api_key': this.config.pinataSecretApiKey,
          },
          maxBodyLength: Infinity,
        }
      );

      return response.data.IpfsHash;
    } catch (error) {
      console.error('Error uploading to Pinata:', error);
      throw error;
    }
  }
}

export const ipfsService = new IPFSService();
