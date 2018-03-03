var UNITv2 = artifacts.require("UNITv2");
var UNITSimplePaymentGateway = artifacts.require("UNITSimplePaymentGateway");

module.exports = function (deployer, network) {
    deployer.deploy(UNITSimplePaymentGateway, UNITv2.address);
};
