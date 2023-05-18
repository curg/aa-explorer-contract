import * as dotenv from "dotenv";
dotenv.config();

import "solidity-coverage";
import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";
const SEPOLIA_PRIVATE_KEY = process.env.PRIVATE_KEY!; // test private key
const MUMBAI_PRIVATE_KEY =
  process.env.PRIVATE_KEY! ||
  "d523572f9bc7a3f895dc75d45cb3b337e4f56c749ff660c66f687f9c83fc2c5c"; // test private key

const optimizedComilerSettings = {
  version: "0.8.17",
  settings: {
    optimizer: { enabled: true, runs: 1000000 },
    viaIR: true,
  },
};
const entrypointRelatedComilerSettings = {
  version: "0.8.15",
  settings: {
    optimizer: { enabled: true, runs: 1000000 },
    viaIR: true,
  },
};

/** @type import('hardhat/config').HardhatUserConfig */
const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 50000,
          },
          viaIR: true,
        },
      },
    ],
    overrides: {
      "contracts/entrypoint/EntryPoint.sol": optimizedComilerSettings,
      "contracts/utils/Exec.sol": entrypointRelatedComilerSettings,
      "contracts/entrypoint/StakeManager.sol": entrypointRelatedComilerSettings,
      "contracts/entrypoint/SenderCreator.sol":
        entrypointRelatedComilerSettings,
      "contracts/entrypoint/Helpers.sol": entrypointRelatedComilerSettings,
    },
  },
  typechain: {
    outDir: "src/types",
    target: "ethers-v5",
    alwaysGenerateOverloads: false, // should overloads with full signatures like deposit(uint256) be generated always, even if there are no overloads?
    externalArtifacts: ["externalArtifacts/*.json"], // optional array of glob patterns with external artifacts to process (for example external libs from node_modules)
    dontOverrideCompile: false, // defaults to false
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        initialIndex: 0,
        accountsBalance: "10000000000000000000000000", // 10,000,000 ETH
      },
    },
    localhost: {
      allowUnlimitedContractSize: true,
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.SEPOLIA_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY],
      gasPrice: "auto",
      timeout: 1000000,
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/3QqPSn3-dpXvRn9zyrrfXR-IGj6vT_iH`,
      accounts: [MUMBAI_PRIVATE_KEY],
      gasPrice: "auto",
      timeout: 1000000,
    },
  },
  etherscan: {
    apiKey: "7WPBYSKDQYDISVN8EE5R94MY7F4VWVU4PH",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  gasReporter: {
    currency: "USD",
    coinmarketcap:
      process.env.COINMARKETCAP_API_KEY ||
      "0d8632d7-c0e8-4a95-8778-c8795312e2e5",
    enabled: true,
  },
};

export default config;
