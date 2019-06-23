require('dotenv').config();
const ArkaneProvider = require("@arkane-network/truffle-arkane-provider");


module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: () =>
        new ArkaneProvider({
            apiKey: process.env["ARKANE_API_KEY"],
            baseUrl: 'https://api.arkane.network',
            providerUrl: 'https://ropsten.infura.io'
        }),
      network_id: '3',
    },
  }
};
