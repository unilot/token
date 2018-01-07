var UnilotInvestors = artifacts.require('UnilotInvestors');
var UnilotToken = artifacts.require('UnilotToken');

contract('UnilotToken', function(accounts) {
    var EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
    var coinbase = web3.eth.coinbase;
    var investorIndex = 0;
    var state = {
        ANONYMOUS: 0,
        REGISTERED: 1,
        APPROVED: 2,
        BANNED: 3,
        FROZEN: 4
    };

    it('Referral bonus calculation', function () {
        var unilotToken;
        var investorsPool;

        return UnilotInvestors.deployed().then(function (instance) {
            investorsPool = instance;

            return UnilotToken.deployed(investorsPool);
        }).then(function (instance) {
            unilotToken = instance;

            return unilotToken.calculateReferralBonus.call(100, 1);
        }).then(function (result) {
            assert.equal(result.valueOf(), 5, 'Referral bonus should be 5 tokens');
        }).then(function () {
            return unilotToken.calculateReferralBonus.call(100, 2);
        }).then(function (result) {
            assert.equal(result.valueOf(), 4, 'Referral bonus should be 4 tokens');
        }).then(function () {
            return unilotToken.calculateReferralBonus.call(100, 3);
        }).then(function (result) {
            assert.equal(result.valueOf(), 3, 'Referral bonus should be 3 tokens');
        }).then(function () {
            return unilotToken.calculateReferralBonus.call(100, 4);
        }).then(function (result) {
            assert.equal(result.valueOf(), 2, 'Referral bonus should be 2 tokens');
        }).then(function () {
            return unilotToken.calculateReferralBonus.call(100, 5);
        }).then(function (result) {
            assert.equal(result.valueOf(), 1, 'Referral bonus should be 1 tokens');
        }).then(function () {
            return unilotToken.calculateReferralBonus.call(100, 0);
        }).then(function (result) {
            assert.equal(result.valueOf(), 0, 'Referral bonus should be 0 tokens');
        }).then(function () {
            return unilotToken.calculateReferralBonus.call(100, 6);
        }).then(function (result) {
            assert.equal(result.valueOf(), 0, 'Referral bonus should be 0 tokens');
        }).then(function () {
            return unilotToken.calculateReferralBonus.call(123123, 1);
        }).then(function (result) {
            assert.equal(result.valueOf(), 6156,
                'Referral bonus for 123123 should be 6156 tokens');
        });
    });
});