var UnilotInvestors = artifacts.require("UnilotInvestors");
var UnilotToken = artifacts.require("UnilotToken");

module.exports = function (deployer) {
    deployer.deploy(UnilotInvestors).then(function () {
        return deployer.deploy(UnilotToken, UnilotInvestors.address, false);
    });
};
