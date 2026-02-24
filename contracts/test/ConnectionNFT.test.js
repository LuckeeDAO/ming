/**
 * ConnectionNFT 合约测试
 * 
 * 测试覆盖：
 * - 合约部署
 * - NFT铸造功能
 * - 用户Token查询
 * - 连接信息查询
 * - 共识哈希更新
 * - 铸造权限模型
 * - 错误处理
 * 
 * @module test/ConnectionNFT.test
 */
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('ConnectionNFT', function () {
  let connectionNFT;
  let owner;
  let user1;
  let user2;

  // 测试数据
  const tokenURI = 'ipfs://QmTest123';
  const externalObjectId = 'wood_tree';
  const element = 'wood';
  const consensusHash = ethers.keccak256(ethers.toUtf8Bytes('test-consensus'));

  beforeEach(async function () {
    // 获取测试账户
    [owner, user1, user2] = await ethers.getSigners();

    // 部署合约
    const ConnectionNFT = await ethers.getContractFactory('ConnectionNFT');
    connectionNFT = await ConnectionNFT.deploy('Ming Connection NFT', 'MING');
    await connectionNFT.waitForDeployment();
  });

  describe('部署', function () {
    it('应该正确设置名称和符号', async function () {
      expect(await connectionNFT.name()).to.equal('Ming Connection NFT');
      expect(await connectionNFT.symbol()).to.equal('MING');
    });

    it('应该将部署者设置为所有者', async function () {
      expect(await connectionNFT.owner()).to.equal(owner.address);
    });
  });

  describe('铸造NFT', function () {
    it('应该允许任意用户铸造NFT（owner账户）', async function () {
      const tx = await connectionNFT.mintConnection(
        user1.address,
        tokenURI,
        externalObjectId,
        element,
        consensusHash
      );

      // 等待交易确认
      const receipt = await tx.wait();

      // 检查Token ID
      const tokenId = await connectionNFT.totalSupply();
      expect(tokenId).to.equal(1);

      // 检查所有权
      expect(await connectionNFT.ownerOf(1)).to.equal(user1.address);

      // 检查Token URI
      expect(await connectionNFT.tokenURI(1)).to.equal(tokenURI);

      // 检查连接信息
      const connectionInfo = await connectionNFT.getConnectionInfo(1);
      expect(connectionInfo.owner).to.equal(user1.address);
      expect(connectionInfo.tokenURI).to.equal(tokenURI);
      expect(connectionInfo.externalObjectId).to.equal(externalObjectId);
      expect(connectionInfo.element).to.equal(element);
      expect(connectionInfo.consensusHash).to.equal(consensusHash);

      // 检查事件
      await expect(tx)
        .to.emit(connectionNFT, 'ConnectionMinted')
        .withArgs(1, user1.address, tokenURI, anyValue, externalObjectId, element);
    });

    it('应该允许非所有者铸造NFT（用户账户）', async function () {
      const tx = await connectionNFT.connect(user1).mintConnection(
        user1.address,
        tokenURI,
        externalObjectId,
        element,
        consensusHash
      );

      await tx.wait();
      expect(await connectionNFT.ownerOf(1)).to.equal(user1.address);
    });

    it('应该拒绝无效地址', async function () {
      await expect(
        connectionNFT.mintConnection(
          ethers.ZeroAddress,
          tokenURI,
          externalObjectId,
          element,
          consensusHash
        )
      ).to.be.revertedWith('ConnectionNFT: invalid address');
    });

    it('应该拒绝空Token URI', async function () {
      await expect(
        connectionNFT.mintConnection(
          user1.address,
          '',
          externalObjectId,
          element,
          consensusHash
        )
      ).to.be.revertedWith('ConnectionNFT: tokenURI cannot be empty');
    });

    it('应该拒绝空外物ID', async function () {
      await expect(
        connectionNFT.mintConnection(
          user1.address,
          tokenURI,
          '',
          element,
          consensusHash
        )
      ).to.be.revertedWith('ConnectionNFT: externalObjectId cannot be empty');
    });

    it('应该拒绝空元素', async function () {
      await expect(
        connectionNFT.mintConnection(
          user1.address,
          tokenURI,
          externalObjectId,
          '',
          consensusHash
        )
      ).to.be.revertedWith('ConnectionNFT: element cannot be empty');
    });

    it('应该正确记录用户Token列表', async function () {
      await connectionNFT.mintConnection(
        user1.address,
        tokenURI,
        externalObjectId,
        element,
        consensusHash
      );

      const userTokens = await connectionNFT.getUserTokens(user1.address);
      expect(userTokens.length).to.equal(1);
      expect(userTokens[0]).to.equal(1);
    });

    it('应该支持为同一用户铸造多个NFT', async function () {
      await connectionNFT.mintConnection(
        user1.address,
        tokenURI,
        externalObjectId,
        element,
        consensusHash
      );

      await connectionNFT.mintConnection(
        user1.address,
        'ipfs://QmTest456',
        'fire_candle',
        'fire',
        consensusHash
      );

      const userTokens = await connectionNFT.getUserTokens(user1.address);
      expect(userTokens.length).to.equal(2);
      expect(userTokens[0]).to.equal(1);
      expect(userTokens[1]).to.equal(2);
    });
  });

  describe('查询功能', function () {
    beforeEach(async function () {
      // 铸造几个测试NFT
      await connectionNFT.mintConnection(
        user1.address,
        tokenURI,
        externalObjectId,
        element,
        consensusHash
      );

      await connectionNFT.mintConnection(
        user2.address,
        'ipfs://QmTest456',
        'fire_candle',
        'fire',
        consensusHash
      );
    });

    it('应该正确查询用户Token数量', async function () {
      expect(await connectionNFT.getUserTokenCount(user1.address)).to.equal(1);
      expect(await connectionNFT.getUserTokenCount(user2.address)).to.equal(1);
    });

    it('应该正确查询用户Token列表', async function () {
      const user1Tokens = await connectionNFT.getUserTokens(user1.address);
      expect(user1Tokens.length).to.equal(1);
      expect(user1Tokens[0]).to.equal(1);

      const user2Tokens = await connectionNFT.getUserTokens(user2.address);
      expect(user2Tokens.length).to.equal(1);
      expect(user2Tokens[0]).to.equal(2);
    });

    it('应该正确查询连接信息', async function () {
      const info = await connectionNFT.getConnectionInfo(1);
      expect(info.tokenId).to.equal(1);
      expect(info.owner).to.equal(user1.address);
      expect(info.tokenURI).to.equal(tokenURI);
      expect(info.externalObjectId).to.equal(externalObjectId);
      expect(info.element).to.equal(element);
      expect(info.consensusHash).to.equal(consensusHash);
    });

    it('应该拒绝查询不存在的Token', async function () {
      await expect(
        connectionNFT.getConnectionInfo(999)
      ).to.be.revertedWith('ConnectionNFT: token does not exist');
    });

    it('应该正确查询总供应量', async function () {
      expect(await connectionNFT.totalSupply()).to.equal(2);
    });
  });

  describe('共识哈希更新', function () {
    beforeEach(async function () {
      await connectionNFT.mintConnection(
        user1.address,
        tokenURI,
        externalObjectId,
        element,
        consensusHash
      );
    });

    it('应该允许所有者更新共识哈希', async function () {
      const newHash = ethers.keccak256(ethers.toUtf8Bytes('new-consensus'));
      const tx = await connectionNFT.updateConsensusHash(1, newHash);

      const info = await connectionNFT.getConnectionInfo(1);
      expect(info.consensusHash).to.equal(newHash);

      await expect(tx)
        .to.emit(connectionNFT, 'ConnectionUpdated')
        .withArgs(1, newHash);
    });

    it('应该拒绝非所有者更新共识哈希', async function () {
      const newHash = ethers.keccak256(ethers.toUtf8Bytes('new-consensus'));
      await expect(
        connectionNFT.connect(user1).updateConsensusHash(1, newHash)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('应该拒绝更新不存在的Token', async function () {
      const newHash = ethers.keccak256(ethers.toUtf8Bytes('new-consensus'));
      await expect(
        connectionNFT.updateConsensusHash(999, newHash)
      ).to.be.revertedWith('ConnectionNFT: token does not exist');
    });
  });

  describe('ERC-721标准功能', function () {
    beforeEach(async function () {
      await connectionNFT.mintConnection(
        user1.address,
        tokenURI,
        externalObjectId,
        element,
        consensusHash
      );
    });

    it('应该支持Token转移', async function () {
      await connectionNFT.connect(user1).transferFrom(
        user1.address,
        user2.address,
        1
      );

      expect(await connectionNFT.ownerOf(1)).to.equal(user2.address);
    });

    it('应该支持安全转移', async function () {
      await connectionNFT.connect(user1)['safeTransferFrom(address,address,uint256)'](
        user1.address,
        user2.address,
        1
      );

      expect(await connectionNFT.ownerOf(1)).to.equal(user2.address);
    });
  });
});

// 辅助函数：匹配任何值
function anyValue() {
  return true;
}
