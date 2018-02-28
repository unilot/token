var UNITStagesManager = artifacts.require("UNITStagesManager");

module.exports = function (deployer, network) {
    deployer.deploy(UNITStagesManager, (network !== 'live'));
};
