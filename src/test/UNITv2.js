var UnilotToken = artifacts.require('UnilotToken');
var UNITStagesManager = artifacts.require('UNITStagesManager');
var UNITTransferWhiteList = artifacts.require('UNITTransferWhiteList');
var UNITPaymentGatewayList = artifacts.require('UNITPaymentGatewayList');
var UNITSimplePaymentGateway = artifacts.require('UNITSimplePaymentGateway');
var UNITv2 = artifacts.require('UNITv2');
var bigInt = require('big-integer');

contract('UNITv2 test', function(accounts) {
    var EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
    var coinbase = web3.eth.coinbase;
    var index = 1;

    function pause(milliseconds) {
        var dt = new Date();
        while ((new Date()) - dt <= milliseconds) {/* Do nothing */}
    }

    it('Should consider tokens from source token', function() {
        var oldToken;
        var token;
        var paymentGatewayList;
        var paymentGateway;
        var stagesManager;

        return UnilotToken.new().then(function (instance) {
            oldToken = instance;

            return UNITv2.new(oldToken.address);
        }).then(function(instance){
            token = instance;

            return UNITSimplePaymentGateway.new(token.address)
        }).then(function (instance) {
            paymentGateway = instance;

            return UNITPaymentGatewayList.new()
        }).then(function (instance) {
            paymentGatewayList = instance;

            return paymentGatewayList.add(paymentGateway.address);
        }).then(function(tx){
            return token.setPaymentGatewayList(paymentGatewayList.address);
        }).then(function (tx) {
            return UNITStagesManager.new(true, token.address)
        }).then(function (instance) {
            stagesManager = instance;

            return token.setStatesManager(instance.address);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function(tx) {
            //Under 40%
            return oldToken.sendTransaction({
                from: accounts[1],
                value: web3.toWei(79000/2, 'szabo')
            })
        }).then(function(tx) {
            //Under 35%
            return paymentGateway.sendTransaction({
                from: accounts[1],
                value: web3.toWei(79000/2, 'szabo')
            })
        }).then(function (tx) {
            return token.balanceOf.call(accounts[1]);
        }).then(function (balance) {
            return assert.equal(balance.valueOf(), 1375 * Math.pow(10, 18),
                'Tokens from source contact sould be considered');
        });
    });

    it('Tokens can be transfered if unlocked', function() {
        var oldToken;
        var token;
        var paymentGatewayList;
        var paymentGateway;
        var stagesManager;

        return UnilotToken.new().then(function (instance) {
            oldToken = instance;

            return UNITv2.new(oldToken.address);
        }).then(function(instance){
            token = instance;

            return UNITSimplePaymentGateway.new(token.address)
        }).then(function (instance) {
            paymentGateway = instance;

            return UNITPaymentGatewayList.new()
        }).then(function (instance) {
            paymentGatewayList = instance;

            return paymentGatewayList.add(paymentGateway.address);
        }).then(function(tx){
            return token.setPaymentGatewayList(paymentGatewayList.address);
        }).then(function (tx) {
            return UNITStagesManager.new(true, token.address)
        }).then(function (instance) {
            stagesManager = instance;

            return token.setStatesManager(instance.address);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function(tx) {
            return paymentGateway.sendTransaction({
                from: accounts[1],
                value: web3.toWei(79000, 'szabo')
            })
        }).then(function (tx) {
            return token.unlock();
        }).then(function(tx) {
            return token.transfer(accounts[2], 500 * Math.pow(10,18), {
                from: accounts[1]
            });
        }).then(function (tx) {
            return token.balanceOf.call(accounts[2]);
        }).then(function (balance) {
            return assert.equal(balance.valueOf(), 500 * Math.pow(10, 18), 'Transfer should be successfull');
        });
    });

    it('Tokens can be transfered if unlocked', function() {
        var oldToken;
        var token;
        var paymentGatewayList;
        var paymentGateway;
        var stagesManager;

        return UnilotToken.new().then(function (instance) {
            oldToken = instance;

            return UNITv2.new(oldToken.address);
        }).then(function(instance){
            token = instance;

            return UNITSimplePaymentGateway.new(token.address)
        }).then(function (instance) {
            paymentGateway = instance;

            return UNITPaymentGatewayList.new()
        }).then(function (instance) {
            paymentGatewayList = instance;

            return paymentGatewayList.add(paymentGateway.address);
        }).then(function(tx){
            return token.setPaymentGatewayList(paymentGatewayList.address);
        }).then(function (tx) {
            return UNITStagesManager.new(true, token.address)
        }).then(function (instance) {
            stagesManager = instance;

            return token.setStatesManager(instance.address);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function(tx) {
            return paymentGateway.sendTransaction({
                from: accounts[1],
                value: web3.toWei(79000, 'szabo')
            })
        }).then(function (tx) {
            return token.unlock();
        }).then(function(tx) {
            return token.transfer(accounts[2], 500 * Math.pow(10,18), {
                from: accounts[1]
            });
        }).then(function (tx) {
            return token.balanceOf.call(accounts[2]);
        }).then(function (balance) {
            return assert.equal(balance.valueOf(), 500 * Math.pow(10, 18), 'Transfer should be successfull');
        });
    });

    it('Tokens can be transfered after ICO', function() {
        var oldToken;
        var token;
        var paymentGatewayList;
        var paymentGateway;
        var stagesManager;

        return UnilotToken.new().then(function (instance) {
            oldToken = instance;

            return UNITv2.new(oldToken.address);
        }).then(function(instance){
            token = instance;

            return UNITSimplePaymentGateway.new(token.address)
        }).then(function (instance) {
            paymentGateway = instance;

            return UNITPaymentGatewayList.new()
        }).then(function (instance) {
            paymentGatewayList = instance;

            return paymentGatewayList.add(paymentGateway.address);
        }).then(function(tx){
            return token.setPaymentGatewayList(paymentGatewayList.address);
        }).then(function (tx) {
            return UNITStagesManager.new(true, token.address)
        }).then(function (instance) {
            stagesManager = instance;

            return token.setStatesManager(instance.address);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function(tx) {
            return paymentGateway.sendTransaction({
                from: accounts[1],
                value: web3.toWei(79000, 'szabo')
            })
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function (tx) {
            return stagesManager.dTimeoutCurrentStage();
        }).then(function (tx) {
            return stagesManager.switchStage();
        }).then(function(tx) {
            return token.transfer(accounts[2], 500 * Math.pow(10,18), {
                from: accounts[1]
            });
        }).then(function (tx) {
            return token.balanceOf.call(accounts[2]);
        }).then(function (balance) {
            return assert.equal(balance.valueOf(), 500 * Math.pow(10, 18), 'Transfer should be successfull');
        });
    });

    it('User from whitelist can transfer tokens', function() {
        var oldToken;
        var token;
        var paymentGatewayList;
        var paymentGateway;
        var stagesManager;
        var transferWhiteList;


        return UnilotToken.new().then(function (instance) {
            oldToken = instance;

            return UNITv2.new(oldToken.address);
        }).then(function(instance){
            token = instance;

            return UNITSimplePaymentGateway.new(token.address)
        }).then(function (instance) {
            paymentGateway = instance;

            return UNITPaymentGatewayList.new()
        }).then(function (instance) {
            paymentGatewayList = instance;

            return paymentGatewayList.add(paymentGateway.address);
        }).then(function(tx){
            return token.setPaymentGatewayList(paymentGatewayList.address);
        }).then(function() {
            return UNITTransferWhiteList.new();
        }).then(function(instance) {
            transferWhiteList = instance;
            return token.setTransferWhitelist(transferWhiteList.address);
        }).then(function (tx) {
            return transferWhiteList.add(accounts[1]);
        }).then(function (tx) {
            return UNITStagesManager.new(true, token.address)
        }).then(function (instance) {
            stagesManager = instance;

            return token.setStatesManager(instance.address);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function(tx) {
            return paymentGateway.sendTransaction({
                from: accounts[1],
                value: web3.toWei(79000, 'szabo')
            })
        }).then(function(tx) {
            return token.transfer(accounts[2], 500 * Math.pow(10,18), {
                from: accounts[1]
            });
        });
    });

    it('User can\'t transfer tokens', function() {
        var token;
        var oldToken;
        var paymentGatewayList;
        var paymentGateway;
        var stagesManager;

        return UnilotToken.new().then(function (instance) {
            oldToken = instance;

            return UNITv2.new(oldToken.address);
        }).then(function(instance){
            token = instance;

            return UNITSimplePaymentGateway.new(token.address)
        }).then(function (instance) {
            paymentGateway = instance;

            return UNITPaymentGatewayList.new()
        }).then(function (instance) {
            paymentGatewayList = instance;

            return paymentGatewayList.add(paymentGateway.address);
        }).then(function(tx){
            return token.setPaymentGatewayList(paymentGatewayList.address);
        }).then(function (tx) {
            return UNITStagesManager.new(true, token.address)
        }).then(function (instance) {
            stagesManager = instance;

            return token.setStatesManager(instance.address);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function(tx) {
            return paymentGateway.sendTransaction({
                from: accounts[1],
                value: web3.toWei(79000, 'szabo')
            })
        }).then(function(tx) {
            return token.transfer(accounts[2], 500 * Math.pow(10,18), {
                from: accounts[1]
            });
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            return assert(reverted, 'Transaction should be reverted. Transfer not allowed.');
        });
    });

    it('Locked token should not allow transfer', function() {
        var oldToken;
        var token;
        var transferWhiteList;
        var stagesManager;
        var paymentGateway;
        var paymentGatewayList;

        return UnilotToken.new().then(function (instance) {
            oldToken = instance;

            return UNITv2.new(oldToken.address);
        }).then(function(instance){
            token = instance;

            return UNITTransferWhiteList.new();
        }).then(function (whiteList) {
            transferWhiteList = whiteList;
            return token.setTransferWhitelist(transferWhiteList.address)
        }).then(function(tx){
            return UNITSimplePaymentGateway.new(token.address)
        }).then(function (instance) {
            paymentGateway = instance;

            return UNITPaymentGatewayList.new()
        }).then(function (instance) {
            paymentGatewayList = instance;

            return paymentGatewayList.add(paymentGateway.address);
        }).then(function(tx){
            return token.setPaymentGatewayList(paymentGatewayList.address);
        }).then(function (tx) {
            return UNITStagesManager.new(true, token.address)
        }).then(function (instance) {
            stagesManager = instance;

            return token.setStatesManager(instance.address);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function(tx) {
            return paymentGateway.sendTransaction({
                from: accounts[1],
                value: web3.toWei(79000/2, 'szabo')
            })
        }).then(function(tx) {
            return paymentGateway.sendTransaction({
                from: accounts[1],
                value: web3.toWei(79000/2, 'szabo')
            })
        }).then(function (tx) {
            return token.transfer(accounts[2], 500 * Math.pow(10,18), {
                from: accounts[1]
            });
        }).catch(function(error){
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            return assert(reverted, 'Transaction should be reverted. Transfer not allowed.');
        });
    });
});