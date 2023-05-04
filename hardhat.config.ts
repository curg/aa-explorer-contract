import * as dotenv from "dotenv";
dotenv.config();

import "solidity-coverage";
import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";
const GOERLI_PRIVATE_KEY =
  process.env.GOERLI_PRIVATE_KEY! ||
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // test private key
const SEPOLIA_PRIVATE_KEY =
  process.env.SEPOLIA_PRIVATE_KEY! ||
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // test private key
const MUMBAI_PRIVATE_KEY =
  process.env.MUMBAI_PRIVATE_KEY! ||
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // test private key

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
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.GORLI_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY],
      gasPrice: "auto",
      timeout: 1000000,
    },
    sepolia: {
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.SEPOLIA_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY],
      gasPrice: "auto",
      timeout: 1000000,
    },
    mumbai: {
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.MUMBAI_KEY}`,
      accounts: [MUMBAI_PRIVATE_KEY],
      gasPrice: "auto",
      timeout: 1000000,
    },
  },
  etherscan: {
    apiKey: {
      goerli: process.env.GOERLI_API_KEY || process.env.ETHERSCAN_API_KEY || "",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  gasReporter: {
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || "",
    enabled: true,
  },
};

export default config;
