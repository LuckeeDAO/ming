export interface NFTOnChain {
  tokenId: string;
  owner: string;
  contractAddress: string;
  tokenURI: string;
  mintedAt: number;
  txHash: string;
  blockNumber: number;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
  connection: {
    externalObjectId: string;
    externalObjectName: string;
    element: string;
    connectionType: string;
    connectionDate: string;
  };
  ceremony?: {
    location?: string;
    duration?: string;
    participants?: number;
  };
  feelings?: {
    before: string;
    during: string;
    after: string;
  };
  blessing?: {
    text: string;
    timestamp: string;
  };
  scheduledMint?: {
    scheduledTime: string;
    mintedTime?: string;
  };
  energyField: {
    consensusHash: string;
    witnessCount?: number;
  };
  metadata: {
    version: string;
    createdAt: string;
    platform: 'ming';
  };
}

export interface ConnectionRecord {
  id: string;
  walletAddress: string;
  nftTokenId: string;
  nftContractAddress: string;
  externalObject: {
    id: string;
    name: string;
    element: string;
  };
  connectionDate: Date;
  connectionType: string;
  ceremony?: {
    location?: string;
    duration?: string;
    notes?: string;
  };
  feelings: {
    before: string;
    during: string;
    after: string;
    updatedAt: Date;
  };
  blockchain: {
    txHash: string;
    blockNumber: number;
    gasUsed?: number;
  };
  ipfs: {
    metadataHash: string;
    imageHash?: string;
  };
  status: 'draft' | 'minted' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}
