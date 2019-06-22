const SupplyChain = artifacts.require("../halalBase/SupplyChain.sol");


module.exports = function(deployer) {
    deployer.deploy(SupplyChain);
};
