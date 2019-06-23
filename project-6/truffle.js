require('dotenv').config();


const HDWalletProvider = require("truffle-hdwallet-provider");
const mnemonic = process.env["MNEMONIC"];
const tokenKey = process.env["ENDPOINT_KEY"];

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
      from: '0x27d8d15cbc94527cadf5ec14b69519ae23288b95'
    },
    rinkeby: {
      provider: () => {
        return new HDWalletProvider(mnemonic,
          "https://rinkeby.infura.io/v3/" + tokenKey);
      },
      network_id: 4,
      gas: 6700000,
      gasPrice: 10000000000,
    },
  },
  compilers: {
    solc: {
      version: "0.5.8"
    }
  }
};
