// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ConnectionNFT
 * @dev 外物连接NFT合约
 * 
 * 功能说明：
 * - 基于ERC-721标准实现NFT
 * - 记录外物连接仪式的信息
 * - 支持能量场见证（共识哈希）
 * - 提供用户NFT查询功能
 * 
 * 安全特性：
 * - 使用OpenZeppelin的安全库
 * - 重入攻击防护
 * - 权限控制（仅所有者可铸造）
 * - 输入验证
 * 
 * @author Ming Platform Team
 */
contract ConnectionNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    /**
     * @dev Token ID计数器
     */
    Counters.Counter private _tokenIds;
    
    /**
     * @dev 连接信息结构体
     * 
     * @param tokenId - Token ID
     * @param owner - NFT所有者地址
     * @param tokenURI - IPFS元数据URI
     * @param connectionDate - 连接日期（时间戳）
     * @param externalObjectId - 外物ID
     * @param element - 能量类型（木、火、土、金、水）
     * @param consensusHash - 能量场见证共识哈希
     */
    struct ConnectionInfo {
        uint256 tokenId;
        address owner;
        string tokenURI;
        uint256 connectionDate;
        string externalObjectId;
        string element;
        bytes32 consensusHash;
    }
    
    /**
     * @dev Token ID => 连接信息映射
     */
    mapping(uint256 => ConnectionInfo) public connections;
    
    /**
     * @dev 用户地址 => Token ID列表映射
     */
    mapping(address => uint256[]) public userTokens;
    
    /**
     * @dev 连接铸造事件
     * 
     * @param tokenId - 铸造的Token ID
     * @param owner - NFT所有者
     * @param tokenURI - IPFS元数据URI
     * @param connectionDate - 连接日期
     * @param externalObjectId - 外物ID
     * @param element - 能量类型
     */
    event ConnectionMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string tokenURI,
        uint256 connectionDate,
        string externalObjectId,
        string element
    );
    
    /**
     * @dev 连接信息更新事件
     * 
     * @param tokenId - Token ID
     * @param consensusHash - 新的共识哈希
     */
    event ConnectionUpdated(
        uint256 indexed tokenId,
        bytes32 consensusHash
    );
    
    /**
     * @dev 构造函数
     * 
     * @param name - NFT名称
     * @param symbol - NFT符号
     */
    constructor(string memory name, string memory symbol) 
        ERC721(name, symbol) 
    {
        // 初始化时不需要额外操作
    }
    
    /**
     * @dev 铸造连接NFT
     * 
     * 功能：
     * - 创建新的NFT Token
     * - 记录连接信息
     * - 更新用户Token列表
     * - 触发ConnectionMinted事件
     * 
     * 权限：仅合约所有者可调用
     * 
     * @param to - NFT接收地址
     * @param tokenURI - IPFS元数据URI
     * @param externalObjectId - 外物ID
     * @param element - 能量类型
     * @param consensusHash - 共识哈希
     * @return 新铸造的Token ID
     */
    function mintConnection(
        address to,
        string memory tokenURI,
        string memory externalObjectId,
        string memory element,
        bytes32 consensusHash
    ) 
        public 
        onlyOwner 
        nonReentrant 
        returns (uint256) 
    {
        // 输入验证
        require(to != address(0), "ConnectionNFT: invalid address");
        require(bytes(tokenURI).length > 0, "ConnectionNFT: tokenURI cannot be empty");
        require(bytes(externalObjectId).length > 0, "ConnectionNFT: externalObjectId cannot be empty");
        require(bytes(element).length > 0, "ConnectionNFT: element cannot be empty");
        
        // 递增Token ID
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // 铸造NFT
        _mint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        // 记录连接信息
        connections[newTokenId] = ConnectionInfo({
            tokenId: newTokenId,
            owner: to,
            tokenURI: tokenURI,
            connectionDate: block.timestamp,
            externalObjectId: externalObjectId,
            element: element,
            consensusHash: consensusHash
        });
        
        // 记录用户Token
        userTokens[to].push(newTokenId);
        
        // 触发事件
        emit ConnectionMinted(
            newTokenId,
            to,
            tokenURI,
            block.timestamp,
            externalObjectId,
            element
        );
        
        return newTokenId;
    }
    
    /**
     * @dev 更新共识哈希
     * 
     * 功能：
     * - 更新能量场见证的共识哈希
     * - 触发ConnectionUpdated事件
     * 
     * 权限：仅合约所有者可调用
     * 
     * @param tokenId - Token ID
     * @param consensusHash - 新的共识哈希
     */
    function updateConsensusHash(
        uint256 tokenId,
        bytes32 consensusHash
    ) 
        public 
        onlyOwner 
    {
        require(_exists(tokenId), "ConnectionNFT: token does not exist");
        connections[tokenId].consensusHash = consensusHash;
        emit ConnectionUpdated(tokenId, consensusHash);
    }
    
    /**
     * @dev 查询用户的所有Token ID
     * 
     * @param user - 用户地址
     * @return Token ID数组
     */
    function getUserTokens(address user) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return userTokens[user];
    }
    
    /**
     * @dev 查询连接信息
     * 
     * @param tokenId - Token ID
     * @return ConnectionInfo结构体
     */
    function getConnectionInfo(uint256 tokenId)
        public
        view
        returns (ConnectionInfo memory)
    {
        require(_exists(tokenId), "ConnectionNFT: token does not exist");
        return connections[tokenId];
    }
    
    /**
     * @dev 查询用户Token数量
     * 
     * @param user - 用户地址
     * @return Token数量
     */
    function getUserTokenCount(address user) 
        public 
        view 
        returns (uint256) 
    {
        return userTokens[user].length;
    }
    
    /**
     * @dev 查询当前Token ID总数
     * 
     * @return 当前Token ID总数
     */
    function totalSupply() 
        public 
        view 
        returns (uint256) 
    {
        return _tokenIds.current();
    }
}
