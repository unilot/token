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

        return UNITStagesManager.new(true).then(function (instance) {
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

        return UNITStagesManager.new(true).then(function (instance) {
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

    it ('Check pools migration', function() {
        var stagesManager;
        var expectedPool = stagesPools[2][0];

        return UNITStagesManager.new(true).then(function (instance) {
            stagesManager = instance;

            return stagesManager.dNextStage(0);
        }).then(function (tx) {
            return stagesManager.stage.call();
        }).then(function (currentStage) {
            var maxIndex = currentStage.valueOf();

            if ( maxIndex >= (stagesPools.length - 1) ) {
                maxIndex = stagesPools.length - 2;
            }

            for ( var i = 0; i < maxIndex; i++ ) {
                for(var j = 0; j < stagesPools[i].length; j++) {
                    expectedPool = expectedPool.plus(stagesPools[i][j]);
                }
            }

            return stagesManager.dGetPool.call(2, 0);
        }).then(function (value) {
            assert.equal(bigInt(value.valueOf()).compare(expectedPool), 0, 'All pools should migrate to last stage.');
        }).then(function (tx) {
            return stagesManager.dNextStage(0);
        }).then(function (tx) {
            return stagesManager.stage.call();
        }).then(function (currentStage) {
            var index = currentStage.valueOf() - 1;

            for(var i = 0; i < stagesPools[index].length; i++) {
                expectedPool = expectedPool.plus(stagesPools[index][i]);
            }

            return stagesManager.dGetPool.call(2, 0);
        }).then(function (value) {
            return assert.equal(bigInt(value.valueOf()).compare(expectedPool), 0, 'All pools should migrate to last stage.');
        });
    });
});