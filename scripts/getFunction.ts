// scripts/deploy.ts

import { ethers } from "hardhat";

async function main() {
  // Fetch the contract factory
  const simpleAccount = await ethers.getContractFactory("SimpleAccount");
  const simpleAccountFactory = await ethers.getContractFactory(
    "SimpleAccountFactory"
  );

  // Define constructor arguments
  const owner = "0x3c9437bb39D349dAbBE72f2C79997a2C1F33f123";
  const entryPoint = "0x0576a174D229E3cFA37253523E645A78A0C91B57";

  // Deploy the contract
  const accountContract = await simpleAccount.deploy(entryPoint);
  const accountFactoryContract = await simpleAccountFactory.deploy(entryPoint);

  // Wait for the transaction to be mined
  //   await contract.deployed();
  await accountContract.deployed();
  await accountFactoryContract.deployed();

  //   // Log the contract address
  //   console.log("baseAccount deployed to:", contract.address);
  console.log("accountContract deployed to:", accountContract.address);
  console.log(
    "accountFactoryContract deployed to:",
    accountFactoryContract.address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
