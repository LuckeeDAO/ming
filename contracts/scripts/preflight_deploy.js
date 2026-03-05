const hre = require('hardhat');

async function main() {
  const network = await hre.ethers.provider.getNetwork();
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log('Preflight network:', hre.network.name);
  console.log('Preflight chainId:', network.chainId.toString());
  console.log('Preflight deployer:', deployer.address);
  console.log('Preflight balance:', hre.ethers.formatEther(balance), 'ETH');

  if (balance === 0n) {
    if (hre.network.name === 'fuji') {
      console.error(
        'Preflight failed: Fuji 余额为 0。请先领取测试币: https://core.app/tools/testnet-faucet/?subnet=c&token=c'
      );
    } else {
      console.error(`Preflight failed: deployer balance is 0 on network ${hre.network.name}`);
    }
    process.exit(2);
  }
}

main().catch((error) => {
  console.error('Preflight failed:', error.message || String(error));
  process.exit(1);
});

