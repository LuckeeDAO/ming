/**
 * ConnectionNFT 合约部署脚本
 * 
 * 功能：
 * - 部署ConnectionNFT合约
 * - 验证部署结果
 * - 保存部署信息
 * 
 * 使用方法：
 * npx hardhat run scripts/deploy.js --network <network>
 * 
 * 环境变量：
 * - PRIVATE_KEY: 部署账户私钥
 * - ETHERSCAN_API_KEY: Etherscan API密钥（用于验证）
 * 
 * @module scripts/deploy
 */
const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('开始部署 ConnectionNFT 合约...\n');

  // 获取部署账户
  const [deployer] = await hre.ethers.getSigners();
  console.log('部署账户:', deployer.address);
  
  // 检查账户余额
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log('账户余额:', hre.ethers.formatEther(balance), 'ETH\n');
  if (balance === 0n) {
    if (hre.network.name === 'fuji') {
      throw new Error(
        'Fuji 账户余额为 0。请先领取测试币: https://core.app/tools/testnet-faucet/?subnet=c&token=c'
      );
    }
    throw new Error(`部署账户余额为 0，无法在 ${hre.network.name} 发起部署交易`);
  }

  // 部署合约
  const ConnectionNFT = await hre.ethers.getContractFactory('ConnectionNFT');
  console.log('正在部署合约...');
  
  const nft = await ConnectionNFT.deploy(
    'Ming Connection NFT',  // 名称
    'MING'                   // 符号
  );

  await nft.waitForDeployment();
  const contractAddress = await nft.getAddress();

  console.log('\n✅ 合约部署成功！');
  console.log('合约地址:', contractAddress);
  console.log('网络:', hre.network.name);
  console.log('链ID:', (await hre.ethers.provider.getNetwork()).chainId);

  // 验证部署
  console.log('\n验证部署...');
  const name = await nft.name();
  const symbol = await nft.symbol();
  const owner = await nft.owner();
  
  console.log('合约名称:', name);
  console.log('合约符号:', symbol);
  console.log('合约所有者:', owner);
  console.log('部署账户:', deployer.address);
  
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    throw new Error('所有者地址不匹配！');
  }

  // 保存部署信息
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    contractAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contractName: 'ConnectionNFT',
    contractVersion: '1.0.0',
  };

  // 创建部署信息目录
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // 保存部署信息到文件
  const deploymentFile = path.join(
    deploymentsDir,
    `${hre.network.name}-${Date.now()}.json`
  );
  fs.writeFileSync(
    deploymentFile,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log('\n部署信息已保存到:', deploymentFile);

  // 如果是测试网或主网，提示验证合约
  if (hre.network.name !== 'hardhat' && hre.network.name !== 'localhost') {
    console.log('\n📝 下一步：');
    console.log('1. 在 Etherscan 上验证合约：');
    console.log(`   npx hardhat verify --network ${hre.network.name} ${contractAddress} "Ming Connection NFT" "MING"`);
    console.log('\n2. 将合约地址添加到前端配置中');
  }

  console.log('\n✨ 部署完成！');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
