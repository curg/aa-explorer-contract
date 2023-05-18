import { ethers, run } from "hardhat";

async function verifyOnNetwork(
  network: string,
  contractAddress: string,
  constructorArguments: any[]
) {
  console.log(`Verifying contract on ${network}`);

  await run("verify:verify", {
    network: network,
    address: contractAddress,
    constructorArguments: constructorArguments,
  });

  console.log(`Verified contract on ${network} at address ${contractAddress}`);
}

async function main() {
  const owner = "0x3c9437bb39D349dAbBE72f2C79997a2C1F33f123";
  const entryPoint = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
  const verifyingSigner = "0x3c9437bb39D349dAbBE72f2C79997a2C1F33f123";
  const constructorArguments = [owner, entryPoint, verifyingSigner];

  const sepoliaAddress = "0x48C17da2f39c8c70803F78E0ee0C479cE55d7687";
  const mumbaiAddress = "0x20B6420B9a035869b41583Eaac0A55d10374A8dA";

  await verifyOnNetwork("sepolia ", sepoliaAddress, constructorArguments);
  await verifyOnNetwork("polygonMumbai", mumbaiAddress, constructorArguments);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
