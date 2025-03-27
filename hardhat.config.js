require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-network-helpers");
require("@nomiclabs/hardhat-etherscan");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-contract-sizer");
require("hardhat-docgen");
require("solidity-coverage");
require("dotenv").config({ path: "./.env" });
require("hardhat-abi-exporter");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
        details: {
          yul: true,
        },
      },
      viaIR: false,
    },
  },
  networks: {
    ethermainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 1,
      gasPrice: "auto",
    },
    ethertestnet: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111, // Sepolia testnet
    },
    immutableZkevmTestnet: {
      url: "https://rpc.testnet.immutable.com",
      accounts: [process.env.PRIVATE_KEY],
    },
    immutableZkevmMainnet: {
      url: "https://rpc.immutable.com",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    // API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: {
      // Ethereum networks
      mainnet: process.env.ETHERSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
      // Immutable networks
      immutableZkevmTestnet: process.env.ETHERSCAN_API_KEY,
      immutableZkevmMainnet: process.env.ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "immutableZkevmTestnet",
        chainId: 13473,
        urls: {
          apiURL: "https://explorer.testnet.immutable.com/api",
          browserURL: "https://explorer.testnet.immutable.com",
        },
      },
      {
        network: "immutableZkevmMainnet",
        chainId: 13371,
        urls: {
          apiURL: "https://explorer.immutable.com/api",
          browserURL: "https://explorer.immutable.com",
        },
      },
    ],
  },
};
