var UNITTransferWhiteList = artifacts.require("UNITTransferWhiteList");

module.exports = function (deployer, network) {
    deployer.deploy(UNITTransferWhiteList);
};
