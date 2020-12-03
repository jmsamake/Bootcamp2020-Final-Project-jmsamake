const path = require("path");
//require("dotenv").config();
//const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
	/*rinkeby: {  // uncomment, if you'd like to deploy in Rinkeby testnet
      provider: () =>
       new HDWalletProvider(
         process.env.MNEMONIC,
         `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
       ),
      network_id: 4,  // Rinkeby's id
      gas: 5500000    // Rinkeby has a lower block limit than mainnet
    } */
  },
  
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
