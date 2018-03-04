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

    it('Check double import', function() {
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

            return token.setStagesManager(instance.address);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function(tx) {
            //Under 40%
            return oldToken.sendTransaction({
                from: accounts[1],
                value: web3.toWei(79000, 'szabo')
            })
        }).then(function(tx) {
            //Under 40%
            return oldToken.sendTransaction({
                from: accounts[2],
                value: web3.toWei(79000, 'szabo')
            })
        }).then(function(tx) {
            return token.importTokensSourceBulk(oldToken.address, [accounts[1], accounts[2]])
        }).then(function(tx) {
            return token.importTokensSourceBulk(oldToken.address, [accounts[1], accounts[2]])
        }).then(function (tx) {
            return token.balanceOf.call(accounts[1]);
        }).then(function (balance) {
            return assert.equal(balance.valueOf(), 1400 * Math.pow(10, 18),
                'Should import 1400 tokens (1000 bought + 400 bonus)');
        }).then(function (tx) {
            return token.balanceOf.call(accounts[2]);
        }).then(function (balance) {
            return assert.equal(balance.valueOf(), 1400 * Math.pow(10, 18),
                'Should import 1400 tokens (1000 bought + 400 bonus from source and 1350 in new)');
        });
    });

    it('Check merge import', function() {
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

            return token.setStagesManager(instance.address);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function(tx) {
            //Under 40%
            return oldToken.sendTransaction({
                from: accounts[1],
                value: web3.toWei(79000, 'szabo')
            })
        }).then(function(tx) {
            //Under 40%
            return oldToken.sendTransaction({
                from: accounts[2],
                value: web3.toWei(79000, 'szabo')
            })
        }).then(function(tx) {
            //Under 35%
            return paymentGateway.sendTransaction({
                from: accounts[2],
                value: web3.toWei(79000, 'szabo')
            })
        }).then(function(tx) {
            return token.importTokensSourceBulk(oldToken.address, [accounts[1], accounts[2]])
        }).then(function (tx) {
            return token.balanceOf.call(accounts[1]);
        }).then(function (balance) {
            return assert.equal(balance.valueOf(), 1400 * Math.pow(10, 18),
                'Should import 1400 tokens (1000 bought + 400 bonus)');
        }).then(function (tx) {
            return token.balanceOf.call(accounts[2]);
        }).then(function (balance) {
            return assert.equal(balance.valueOf(), 2750 * Math.pow(10, 18),
                'Should import 2750 tokens (1000 bought + 400 bonus from source and 1350 in new)');
        });
    });

    it('Check importTokensSourceBulk method', function() {
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

            return token.setStagesManager(instance.address);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function(tx) {
            //Under 40%
            return oldToken.sendTransaction({
                from: accounts[1],
                value: web3.toWei(79000, 'szabo')
            })
        }).then(function(tx) {
            //Under 40%
            return oldToken.sendTransaction({
                from: accounts[2],
                value: web3.toWei(79000, 'szabo')
            })
        }).then(function(tx) {
            return token.importTokensSourceBulk(oldToken.address, [accounts[1], accounts[2]])
        }).then(function (tx) {
            return token.balanceOf.call(accounts[1]);
        }).then(function (balance) {
            return assert.equal(balance.valueOf(), 1400 * Math.pow(10, 18),
                'Should import 1400 tokens (1000 bought + 400 bonus)');
        }).then(function (tx) {
            return token.balanceOf.call(accounts[2]);
        }).then(function (balance) {
            return assert.equal(balance.valueOf(), 1400 * Math.pow(10, 18),
                'Should import 1400 tokens (1000 bought + 400 bonus)');
        });
    });

    it('Stages manager can\'t be changed after burn', function() {
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

            return token.setStagesManager(instance.address);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function (tx) {
            return stagesManager.dTimeoutCurrentStage();
        }).then(function (tx) {
            return stagesManager.switchStage();
        }).then(function(tx) {
            return token.burn();
        }).then(function (tx) {
            return token.setStagesManager(stagesManager.address);
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            return assert(reverted, 'Transaction should be reverted. Stages manager can\'t be changed after burn.');
        });
    });

    it('Method delegateReferralTokensBulk should\'t work after burn', function() {
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

            return token.setStagesManager(instance.address);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function (tx) {
            return stagesManager.dTimeoutCurrentStage();
        }).then(function (tx) {
            return stagesManager.switchStage();
        }).then(function(tx) {
            return token.burn();
        }).then(function (tx) {
            return token.delegateReferralTokensBulk(
                [accounts[4]],
                [5000 * Math.pow(10,18)]);
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            return assert(reverted, 'Transaction should be reverted. Referral tokens can\'t be delegated after burn.');
        });
    });

    it('Referral tokens can\'t be delegated after burn', function() {
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

            return token.setStagesManager(instance.address);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function (tx) {
            return stagesManager.dTimeoutCurrentStage();
        }).then(function (tx) {
            return stagesManager.switchStage();
        }).then(function(tx) {
            return token.burn();
        }).then(function (tx) {
            return token.delegateReferalTokens(accounts[4], 5000 * Math.pow(10,18));
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            return assert(reverted, 'Transaction should be reverted. Referral tokens can\'t be delegated after burn.');
        });
    });

    it('Bonus tokens can\'t be delegated after burn', function() {
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

            return token.setStagesManager(instance.address);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function (tx) {
            return stagesManager.dTimeoutCurrentStage();
        }).then(function (tx) {
            return stagesManager.switchStage();
        }).then(function(tx) {
            return token.burn();
        }).then(function (tx) {
            return token.delegateBonusTokens(accounts[4], 5000 * Math.pow(10,18));
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            return assert(reverted, 'Transaction should be reverted. Bonus tokens can\'t be delegated after burn.');
        });
    });

    it('Tokens can\'t be bought after burn', function() {
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

            return token.setStagesManager(instance.address);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function (tx) {
            return stagesManager.dTimeoutCurrentStage();
        }).then(function (tx) {
            return stagesManager.switchStage();
        }).then(function(tx) {
            return token.burn();
        }).then(function (tx) {
            return paymentGateway.sendTransaction({
                from: accounts[3],
                value: web3.toWei(79000, 'szabo')
            });
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            return assert(reverted, 'Transaction should be reverted. Tokens can\'t be bought after burn.');
        });
    });

    it('All left tokens should burn after ICO ends', function() {
        var oldToken;
        var token;
        var paymentGatewayList;
        var paymentGateway;
        var stagesManager;

        var poolLeft;
        var bonusPoolLeft;
        var referralPoolLeft;

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

            return token.setStagesManager(instance.address);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function (tx) {
            return stagesManager.dTimeoutCurrentStage();
        }).then(function (tx) {
            return stagesManager.switchStage();
        }).then(function (tx) {
            return stagesManager.getPool.call();
        }).then(function (pool) {
            poolLeft = pool.valueOf();

            return stagesManager.getBonusPool.call();
        }).then(function (pool) {
            bonusPoolLeft = pool.valueOf();

            return stagesManager.getReferralPool.call();
        }).then(function(pool) {
            referralPoolLeft = pool.valueOf();

            return token.burn();
        }).then(function(tx) {
            return token.totalSupply.call();
        }).then(function (totalSupply) {
            var expectedTotalSupply = bigInt(500000000 * Math.pow(10, 18))
                .minus(poolLeft)
                .minus(bonusPoolLeft)
                .minus(referralPoolLeft);

            return assert.equal(expectedTotalSupply.compare(totalSupply.valueOf()), 0,
                'All left tokens from bonus, referral and ICO pools should be burned.');
        });
    });

    it('You can\'t burn tokens during ICO', function() {
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

            return token.setStagesManager(instance.address);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function(tx) {
            //Under 35%
            return token.burn();
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            return assert(reverted, 'Transaction should be reverted. Transfer not allowed.');
        });
    });

    it('Check delegateReferralTokensBulk method', function() {
        var oldToken;
        var token;
        var paymentGatewayList;
        var paymentGateway;
        var stagesManager;

        var referralPool;

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

            return token.setStagesManager(instance.address);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function (tx) {
            return stagesManager.getReferralPool.call();
        }).then(function(pool) {
            referralPool = bigInt(pool.valueOf());

            return token.delegateReferralTokensBulk(
                [accounts[3], accounts[4]],
                [ ( 5000 * Math.pow(10,18) ), ( 6000 * Math.pow(10,18) ) ]);
        }).then(function (tx) {
            return token.balanceOf.call(accounts[3]);
        }).then(function (balance) {
            return assert.equal(balance.valueOf(), 5000 * Math.pow(10, 18),
                'Account token balance should be 5000');
        }).then(function (tx) {
            return token.balanceOf.call(accounts[4]);
        }).then(function (balance) {
            return assert.equal(balance.valueOf(), 6000 * Math.pow(10, 18),
                'Account token balance should be 6000');
        }).then(function () {
            return stagesManager.getReferralPool.call();
        }).then(function (pool) {
            return assert.equal(referralPool.minus(pool.valueOf()).toJSNumber(), 11000 * Math.pow(10,18),
                'Referral pool should be decreased on 11000 tokens');
        });
    });

    it('Delegate referral tokens', function() {
        var oldToken;
        var token;
        var paymentGatewayList;
        var paymentGateway;
        var stagesManager;

        var referralPool;

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

            return token.setStagesManager(instance.address);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function (tx) {
            return stagesManager.getReferralPool.call();
        }).then(function(pool) {
            referralPool = pool.valueOf();

            return token.delegateReferalTokens(accounts[1], 5000 * Math.pow(10,18));
        }).then(function (tx) {
            return token.balanceOf.call(accounts[1]);
        }).then(function (balance) {
            return assert.equal(balance.valueOf(), 5000 * Math.pow(10, 18),
                'Account token balance should be 5000');
        }).then(function () {
            return stagesManager.getReferralPool.call();
        }).then(function (pool) {
            return assert.equal(pool.valueOf(), referralPool - (5000 * Math.pow(10,18)),
                'Referral pool should be decreased on 5000 tokens');
        });
    });

    it('Delegate bonus tokens', function() {
        var oldToken;
        var token;
        var paymentGatewayList;
        var paymentGateway;
        var stagesManager;

        var bonusPool;

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

            return token.setStagesManager(instance.address);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function (tx) {
            return stagesManager.getBonusPool.call();
        }).then(function(pool) {
            bonusPool = pool.valueOf();

            return token.delegateBonusTokens(accounts[1], 5000 * Math.pow(10,18));
        }).then(function (tx) {
            return token.balanceOf.call(accounts[1]);
        }).then(function (balance) {
            return assert.equal(balance.valueOf(), 5000 * Math.pow(10, 18),
                'Account token balance should be 5000');
        }).then(function () {
            return stagesManager.getBonusPool.call();
        }).then(function (pool) {
            return assert.equal(pool.valueOf(), bonusPool - (5000 * Math.pow(10,18)),
                'Referral pool should be decreased on 5000 tokens');
        });
    });

    it('Buy 250000 tokens', function() {
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

            return token.setStagesManager(instance.address);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function(tx) {
            //Under 35%
            return paymentGateway.sendTransaction({
                from: accounts[1],
                    value: web3.toWei(14.62962963, 'ether')
            })
        }).then(function (tx) {
            return token.balanceOf.call(accounts[1]);
        }).then(function (balance) {
            //Check is not looking for exact 250000 with accuracy till 18th digit after point
            //If accuracy is close till 5 digits after point it's fine enough
            return assert.equal(Math.round(balance.valueOf()/Math.pow(10,18), 5), 250000.00000,
                'Tokens from source contact sould be considered');
        });
    });

    it('Bonus wallet should have 15mln tokens', function() {
        var oldToken;
        var token;
        var BONUS_WALLET = '0x794EF9c680bDD0bEf48Bef46bA68471e449D67Fb';

        return UnilotToken.new().then(function (instance) {
            oldToken = instance;

            return UNITv2.new(oldToken.address);
        }).then(function(instance){
            token = instance;

            return token.balanceOf.call(BONUS_WALLET)
        }).then(function (balance) {
            return assert.equal(balance.valueOf(), 15000000 * Math.pow(10,18),
                'Bonus wallet should have balance of 15mln');
        });
    });

    it('Total supply is 500 mln', function() {
        var oldToken;
        var token;

        return UnilotToken.new().then(function (instance) {
            oldToken = instance;

            return UNITv2.new(oldToken.address);
        }).then(function(instance){
            token = instance;

            return token.totalSupply.call()
        }).then(function (balance) {
            return assert.equal(balance.valueOf(), 500000000 * Math.pow(10,18),
                'Total supply should be 500 mln');
        });
    });

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

            return token.setStagesManager(instance.address);
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

            return token.setStagesManager(instance.address);
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

            return token.setStagesManager(instance.address);
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

    it('Token holder can send to token holder from whitelist', function() {
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

            return token.setStagesManager(instance.address);
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function(tx) {
            return paymentGateway.sendTransaction({
                from: accounts[2],
                value: web3.toWei(79000, 'szabo')
            })
        }).then(function(tx) {
            return token.transfer(accounts[1], 500 * Math.pow(10,18), {
                from: accounts[2]
            });
        }).then(function(tx) {
            return token.balanceOf.call(accounts[1]);
        }).then(function (balance) {
            return assert.equal(balance.valueOf(), 500 * Math.pow(10,18),
                '500 tokens should be transfered');
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

            return token.setStagesManager(instance.address);
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
        }).then(function(tx) {
            return token.balanceOf.call(accounts[2]);
        }).then(function (balance) {
            return assert.equal(balance.valueOf(), 500 * Math.pow(10,18),
                '500 tokens should be transfered');
        }).then(function () {
            return token.approve(accounts[2], 500 * Math.pow(10,18), {
                from: accounts[1]
            });
        }).then(function () {
            return token.transferFrom(accounts[1], accounts[3], 500 * Math.pow(10,18), {
                from: accounts[2]
            });
        }).then(function(tx) {
            return token.balanceOf.call(accounts[3]);
        }).then(function (balance) {
            return assert.equal(balance.valueOf(), 500 * Math.pow(10,18),
                '500 tokens should be transfered');
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

            return token.setStagesManager(instance.address);
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
        }).then(function () {
            return token.approve(accounts[2], 500 * Math.pow(10,18), {
                from: accounts[1]
            });
        }).catch(function(error){
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

            return token.setStagesManager(instance.address);
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
        }).then(function () {
            return token.approve(accounts[2], 500 * Math.pow(10,18), {
                from: accounts[1]
            });
        }).catch(function(error){
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            return assert(reverted, 'Transaction should be reverted. Transfer not allowed.');
        });
    });
});