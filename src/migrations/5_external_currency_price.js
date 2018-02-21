var ExternalCurrencyPrice = artifacts.require("ExternalCurrencyPrice");

module.exports = function (deployer) {
    deployer.deploy(ExternalCurrencyPrice);
};
