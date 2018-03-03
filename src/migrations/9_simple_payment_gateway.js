var UNITv2 = artifacts.require("UNITv2");
var UNITPaymentGatewayList = artifacts.require("UNITPaymentGatewayList");

module.exports = function (deployer, network) {
    deployer.deploy(UNITPaymentGatewayList);
};
