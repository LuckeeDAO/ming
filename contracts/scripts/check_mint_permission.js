/**
 * 检查 ConnectionNFT.mintConnection 铸造可达性（不发送链上交易）
 *
 * 用法：
 *   CONTRACT_ADDRESS=0x... npx hardhat run scripts/check_mint_permission.js --network <network>
 *
 * 可选环境变量：
 *   CHECK_TO_ADDRESS=0x...              // 默认使用 owner 地址
 *   CHECK_TOKEN_URI=ipfs://...          // 默认使用示例 URI
 *   CHECK_EXTERNAL_OBJECT_ID=wood_forest
 *   CHECK_ELEMENT=木
 *   CHECK_CONSENSUS_HASH=0x...64hex
 *   NON_OWNER_PRIVATE_KEY=0x...         // 可选：用于验证非 owner 也可执行
 *
 * 说明：
 * - 本脚本只做只读检查和 staticCall 预执行，不会发送真实交易。
 * - staticCall 成功仅代表“当前参数下可执行”，不代表业务流程已完整联通。
 */
const hre = require('hardhat');

function assertEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value.trim();
}

function getDefaultConsensusHash() {
  return '0x' + '1'.repeat(64);
}

async function main() {
  const contractAddress = assertEnv('CONTRACT_ADDRESS');
  const provider = hre.ethers.provider;

  const abi = [
    'function owner() view returns (address)',
    'function mintConnection(address to, string tokenURI, string externalObjectId, string element, bytes32 consensusHash) returns (uint256)',
  ];

  const signers = await hre.ethers.getSigners();
  if (!signers.length) {
    throw new Error('No signer available from current network config.');
  }
  const signer = signers[0];

  const contractWithSigner = new hre.ethers.Contract(contractAddress, abi, signer);
  const owner = await contractWithSigner.owner();
  const signerAddress = await signer.getAddress();

  console.log('Network:', hre.network.name);
  console.log('Contract:', contractAddress);
  console.log('Owner:', owner);
  console.log('Signer:', signerAddress);
  console.log('Owner Match:', owner.toLowerCase() === signerAddress.toLowerCase() ? 'YES' : 'NO');

  const to = process.env.CHECK_TO_ADDRESS || owner;
  const tokenURI = process.env.CHECK_TOKEN_URI || 'ipfs://example-metadata-hash';
  const externalObjectId = process.env.CHECK_EXTERNAL_OBJECT_ID || 'wood_forest';
  const element = process.env.CHECK_ELEMENT || '木';
  const consensusHash = process.env.CHECK_CONSENSUS_HASH || getDefaultConsensusHash();

  console.log('\n[Signer Path] staticCall mintConnection ...');
  try {
    await contractWithSigner.mintConnection.staticCall(
      to,
      tokenURI,
      externalObjectId,
      element,
      consensusHash
    );
    console.log('Result: PASS (signer path can execute)');
  } catch (error) {
    console.log('Result: FAIL (signer path cannot execute)');
    console.log('Reason:', error && error.message ? error.message : String(error));
  }

  const nonOwnerPk = process.env.NON_OWNER_PRIVATE_KEY;
  if (!nonOwnerPk) {
    console.log('\n[Non-Owner Path] skipped (NON_OWNER_PRIVATE_KEY not provided)');
    return;
  }

  const nonOwnerSigner = new hre.ethers.Wallet(nonOwnerPk, provider);
  const nonOwnerContract = new hre.ethers.Contract(contractAddress, abi, nonOwnerSigner);
  const nonOwnerAddress = await nonOwnerSigner.getAddress();

  console.log('\nSecondary Signer:', nonOwnerAddress);
  console.log('[Secondary Path] staticCall mintConnection ...');
  try {
    await nonOwnerContract.mintConnection.staticCall(
      to,
      tokenURI,
      externalObjectId,
      element,
      consensusHash
    );
    console.log('Result: PASS (secondary signer can execute)');
  } catch (error) {
    console.log('Result: FAIL (secondary signer cannot execute)');
    console.log('Reason:', error && error.message ? error.message : String(error));
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
