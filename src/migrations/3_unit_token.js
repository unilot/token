var UnilotToken = artifacts.require("UnilotToken");

module.exports = function (deployer, network) {
    deployer.deploy(UnilotToken);
};
