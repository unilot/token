var UNITv2 = artifacts.require('UNITv2');
var UNITStagesManager = artifacts.require('UNITStagesManager');
var bigInt = require('big-integer');

contract('UNITStagesManager', function(accounts) {
    var EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
    var coinbase = web3.eth.coinbase;
    var index = 1;
    var stagesPools = [
            [bigInt(24705503438815932384141049)],
            [
                bigInt(5000000 * Math.pow(10,18)),
                bigInt(5000000 * Math.pow(10,18)),
                bigInt(5000000 * Math.pow(10,18)),
                bigInt(5000000 * Math.pow(10,18)),
                bigInt(122500000 * Math.pow(10,18))
            ],
            [bigInt(142794496561184067615858951)]
        ];

    it('Check first switchStage method call', function() {
        var stagesManager;

        return UNITStagesManager.new(true, UNITv2.deployed().address).then(function (instance) {
            stagesManager = instance;

            return stagesManager.switchStage();
        }).then(function (tx) {
            return stagesManager.getCurrentStage();
        }).then(function(stageInfo) {
            var sStartsAt = stageInfo[0].valueOf();
            var sEndssAt = stageInfo[1].valueOf();
            var now = (new Date()).getTime()/1000;

            assert((sStartsAt <= now || sStartsAt === 0), 'Stage should actual');
            assert((sEndssAt > now || sEndssAt === 0), 'Stage should actual');
        });
    });

    it('Check offer switch', function() {
        var stagesManager;

        return UNITStagesManager.new(true, UNITv2.deployed().address).then(function (instance) {
            stagesManager = instance;

            return stagesManager.dNextStage(0);
        }).then(function(tx){
            return stagesManager.getPool.call()
        }).then(function (pool) {
            return stagesManager.dAlterPull(pool.valueOf());
        }).then(function (tx) {
            return stagesManager.switchStage();
        }).then(function () {
            return stagesManager.stage.call();
        }).then(function (stage) {
            return assert.equal(stage.valueOf(), 1, 'Should switch to second offer');
        }).then(function (tx) {
            return stagesManager.offer.call();
        }).then(function (offer) {
            return assert.equal(offer.valueOf(), 1, 'Should switch to second offer');
        }).then(function() {
            return stagesManager.getPool.call();
        }).then(function (pool) {
            assert.equal(
                stagesPools[1][1].compare(bigInt(pool.valueOf())), 0, 'Pool should be actualized.');

            return stagesManager.getPool.call()
        }).then(function (pool) {
            return stagesManager.dAlterPull(pool.valueOf());
        }).then(function (tx) {
            return stagesManager.switchStage();
        }).then(function () {
            return stagesManager.stage.call();
        }).then(function (stage) {
            return assert.equal(stage.valueOf(), 1, 'Should switch to second offer');
        }).then(function (tx) {
            return stagesManager.offer.call();
        }).then(function (offer) {
            return assert.equal(offer.valueOf(), 2, 'Should switch to third offer');
        }).then(function() {
            return stagesManager.getPool.call();
        }).then(function (pool) {
            assert.equal(
                stagesPools[1][2].compare(bigInt(pool.valueOf())), 0, 'Pool should be actualized.');
        });
    });

    it('Check getBonusPool method', function() {
        var stagesManager;

        return UNITStagesManager.new(true, UNITv2.deployed().address).then(function (instance) {
            stagesManager = instance;

            return stagesManager.dStartsNow();
        }).then(function (value) {
            return stagesManager.getBonusPool.call()
        }).then(function (bonusPool) {
            return assert.equal(bigInt(bonusPool.valueOf()).compare(14322013755263720000000000), 0,
                'bonusPool should return 14322013755263720000000000');
        });
    });

    it('Check delegateFromPool method', function() {
        var stagesManager;

        var delegateAmount = 1000 * Math.pow(10, 18);

        return UNITStagesManager.new(true, UNITv2.deployed().address).then(function (instance) {
            stagesManager = instance;

            return stagesManager.dNextStage(0);
        }).then(function (value) {
            return stagesManager.delegateFromPool(delegateAmount)
        }).then(function (tx) {
            return stagesManager.getBonusPool.call()
        }).then(function (bonusPool) {
            return assert.equal(bigInt(bonusPool.valueOf()).compare(14321663755263720000000000), 0,
                'Bonus shoud decrease on 350');
        }).then(function () {
            return stagesManager.getPool.call()
        }).then(function (pool) {
            return assert.equal(bigInt(pool.valueOf()).compare(4999000000000000000000000), 0,
                'Pool should decrease on 1000 and be 4 999 000')
        });
    });

    it('Delegation of more than pool has should fail.', function() {
        var stagesManager;

        var delegateAmount = 5000001 * Math.pow(10, 18);

        return UNITStagesManager.new(true, UNITv2.deployed().address).then(function (instance) {
            stagesManager = instance;

            return stagesManager.dNextStage(0);
        }).then(function (value) {
            return stagesManager.delegateFromPool(delegateAmount)
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            return assert(reverted, 'Transaction should be reverted. Amount it too high to delegate.');
        });
    });
});