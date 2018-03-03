var UnilotToken = artifacts.require("UnilotToken");
var UNITv2 = artifacts.require("UNITv2");

module.exports = function (deployer, network) {
    deployer.deploy(UNITv2, UnilotToken.address);
};
