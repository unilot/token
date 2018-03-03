var UNITv2 = artifacts.require("UNITv2");
var UNITStagesManager = artifacts.require("UNITStagesManager");

module.exports = function (deployer, network) {
    deployer.deploy(UNITStagesManager, (network !== 'live'), UNITv2.address);
};
