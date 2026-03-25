const hre = require("hardhat");

async function main() {
  const FutureLock = await hre.ethers.getContractFactory("FutureLock");
  const contract = await FutureLock.deploy();

  await contract.waitForDeployment();

  console.log(`FutureLock deployed to: ${await contract.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});