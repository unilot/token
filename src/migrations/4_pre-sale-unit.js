var UnilotToken = artifacts.require("UnilotToken");
var PreSaleUNIT = artifacts.require("PreSaleUNIT");

module.exports = function (deployer, network) {
    deployer.deploy(PreSaleUNIT, UnilotToken.address);
};
