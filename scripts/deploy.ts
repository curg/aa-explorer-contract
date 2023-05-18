// scripts/deploy.ts

import { ethers } from "hardhat";

async function main() {
  // Fetch the contract factory
  const VerifyingSingletonPaymaster = await ethers.getContractFactory(
    "VerifyingSingletonPaymaster"
  );

  // Define constructor arguments
  const owner = "0x3c9437bb39D349dAbBE72f2C79997a2C1F33f123";
  const entryPoint = "0x0576a174D229E3cFA37253523E645A78A0C91B57";
  const verifyingSigner = "0x3c9437bb39D349dAbBE72f2C79997a2C1F33f123";

  // Deploy the contract
  const contract = await VerifyingSingletonPaymaster.deploy(
    owner,
    entryPoint,
    verifyingSigner
  );

  // Wait for the transaction to be mined
  await contract.deployed();

  // Log the contract address
  console.log("VerifyingSingletonPaymaster deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
