var UnilotAdvisors = artifacts.require('UnilotAdvisors');

contract('UnilotAdvisors', function (accounts) {
    const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
    const ACCURACY = 6;
    const SHARE_MULTIPLIER = 100 * Math.pow(10, ACCURACY);
    var coinbase = web3.eth.coinbase;
    var index = 1;


    it('Calculations testing', function () {
        var unilotAdvisors;
        var advisors = [];

        for (var i = 0; i < 5; i++) {
            advisors.push( accounts[index++] );
        }

        return UnilotAdvisors.new([], []).then(function (instance) {
            unilotAdvisors = instance;

            return unilotAdvisors.add(advisors[0], ( 0.1 * SHARE_MULTIPLIER ));
        }).then(function (tx) {
            return unilotAdvisors.getTotalDistribution.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), 10000000, 'Total distribution should be 10.000000%.');
        }).then(function () {
            return unilotAdvisors.add( advisors[1], (0.1 * SHARE_MULTIPLIER) );
        }).then(function (tx) {
            return unilotAdvisors.getTotalDistribution.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), 20000000,
                'Total distribution should be 20.000000%.')
        }).then(function(){
            return unilotAdvisors.update(advisors[1], (0.05 * SHARE_MULTIPLIER));
        }).then(function(tx){
            return unilotAdvisors.getTotalDistribution.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), 15000000, 'After update total distribution should be 15.000000%');
        }).then(function(result){
            return unilotAdvisors.getAdvisers.call();
        }).then(function (result) {
            var total = 0;

            for (var i in result[1]) {
                if ( !result[1].hasOwnProperty(i) ) {
                    continue;
                }

                total += parseInt(result[1][i].valueOf());
            }


            assert.equal(total, 15000000, 'Sum of shares should be equal to total distribution: 15.000000%');
        }).then(function () {
            return unilotAdvisors.add(advisors[2], (0.05 * SHARE_MULTIPLIER));
        }).then(function (tx) {
            return unilotAdvisors.getTotalDistribution.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), 20000000, 'After add total distribution should be 20.000000%');
        }).then(function () {
            return unilotAdvisors.remove(advisors[2]);
        }).then(function (tx) {
            return unilotAdvisors.getTotalDistribution.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), 15000000, 'After removal total distribution shoul be 15.000000%');
        });
    });

    it('Checking correct work of methods', function () {
        var unilotAdvisor;
        var advisors = [];

        for ( var i = 1; i < 4; i++ ){
            advisors.push(accounts[index++]);
        }

        it('Constructor', function() {
            UnilotInvestors.new([], []).then(function (instance) {
                unilotAdvisor = instance;

                return unilotAdvisor.getTotalDistribution.call();
            }).then(function (result) {
                assert.equal(result.valueOf(), 0, 'Empty conract should have total distribution 0');
            }).then(function () {
                return unilotAdvisor.getAdvisers.call();
            }).then(function (result) {
                assert.equal(result[0].length, 0, 'Contract should have no advisors.');
                assert.equal(result[1].length, 0, 'Contract should have no advisors.');
            }).then(function () {
                return UnilotInvestors.new([advisors[0], advisors[1], advisors[2], advisors[3]],
                    [(0.4 * SHARE_MULTIPLIER), (0.3 * SHARE_MULTIPLIER),
                        (0.2 * SHARE_MULTIPLIER) * (0.1 * SHARE_MULTIPLIER)]);
            }).then(function (instance) {
                unilotAdvisor = instance;

                return unilotAdvisor.getTotalDistribution.call();
            }).then(function (result) {
                assert.equal(result.valueOf(), 100000000, 'Total distribution should be 100.000000%');
            }).then(function () {
                return unilotAdvisor.getAdvisers.call();
            }).then(function (result) {
                assert.equal(result[0].length, 4, 'Contract should have 4 advisors');
                assert.equal(result[1].length, 4, 'Contract should have 4 advisors');
            }).then(function () {
                return unilotAdvisor.new([advisors[0], advisors[1], advisors[2], advisors[3]], []);
            }).catch(function (error) {
                var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
                assert(reverted, 'Transaction should be reverted. Advisors list and shares list should be of same length.');
            }).then(function () {
                return unilotAdvisor.new([], [(0.4 * SHARE_MULTIPLIER), (0.3 * SHARE_MULTIPLIER),
                        (0.2 * SHARE_MULTIPLIER) * (0.1 * SHARE_MULTIPLIER)]);
            }).catch(function (error) {
                var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
                assert(reverted, 'Transaction should be reverted. Advisors list and shares list should be of same length.');
            }).then(function () {
                return UnilotInvestors.new([advisors[0], advisors[1], advisors[2], advisors[3]],
                    [(0.4 * SHARE_MULTIPLIER), (0.3 * SHARE_MULTIPLIER),
                        (0.2 * SHARE_MULTIPLIER) * (0.2 * SHARE_MULTIPLIER)]);
            }).catch(function (error) {
                var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
                assert(reverted, 'Transaction should be reverted. Total shares distribution is more than 100%.');
            });
        });
    });

    it('Permissions', function() {
        var unilotAdvisors;
        var advisors = [];
        var shares = [];

        for ( var i = 1; i < 4; i++ ){
            advisors.push(accounts[index++]);
            shares.push( ( ( 0.5 - ( 0.1 * i ) ) * SHARE_MULTIPLIER ) );
        }

        return UnilotAdvisors.new([], []).then(function (instance) {
            unilotAdvisors = instance;
        }).then(function () {
            return unilotAdvisors.getAdministrator.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), coinbase, 'Administrator is the one who created the contract');
        }).then(function(){
            //Admin can add advisor
            return unilotAdvisors.add( advisors[0], shares[0] );
        }).then(function () {
            return unilotAdvisors.add(advisors[1], shares[1], {from:advisors[0]});
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Existing advisor can not add new one.');
        }).then(function () {
            return unilotAdvisors.add(advisors[1], shares[1], {from:advisors[1]});
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. New advisor can add himself.');
        }).then(function () {
            return unilotAdvisors.add(advisors[1], shares[1], {from:advisors[2]});
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Public user should now be able to add new advisor.');
        }).then(function(){
            //Adding another adviser. Needed further
            return unilotAdvisors.add( advisors[1], shares[1] );
        }).then(function(){
            //Admin can add advisor
            return unilotAdvisors.update( advisors[0], shares[0] + (0.1 * SHARE_MULTIPLIER) );
        }).then(function (tx) {
            return unilotAdvisors.update( advisors[0], shares[0], {from: advisors[0]} );
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Advisor can not update his share.');
        }).then(function (tx) {
            return unilotAdvisors.update( advisors[0], shares[0], {from: advisors[1]} );
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Advisor can not update another adviser\'s share.');
        }).then(function (tx) {
            return unilotAdvisors.update( advisors[0], shares[0], {from: advisors[2]} );
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Public user cannot update advisor\'s share.');
        }).then(function (tx) {
            return unilotAdvisors.remove( advisors[0], {from: advisors[0]} );
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Advisor cannot remove himself');
        }).then(function (tx) {
            return unilotAdvisors.remove( advisors[0], {from: advisors[1]} );
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Advisor cannot remove other advisor.');
        }).then(function (tx) {
            return unilotAdvisors.remove( advisors[0], {from: advisors[2]} );
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Public user cannot remove advisor.');
        }).then(function (tx) {
            return unilotAdvisors.remove( advisors[0] );
        }).then(function (tx) {
            //Existing advisor
            return unilotAdvisors.getAdministrator.call({from:advisors[1]});
        }).then(function (result) {
            //Public user
            return unilotAdvisors.getAdministrator.call({from:advisors[2]});
        }).then(function (result) {
            //Existing advisor
            return unilotAdvisors.getTotalDistribution.call({from:advisors[1]});
        }).then(function (result) {
            //Public user
            return unilotAdvisors.getTotalDistribution.call({from:advisors[2]});
        }).then(function (result) {
            //Admin
            return unilotAdvisors.getTotalDistribution.call();
        }).then(function (result) {
            //Existing advisor
            return unilotAdvisors.getAdvisers.call({from:advisors[1]});
        }).then(function (result) {
            //Public user
            return unilotAdvisors.getAdvisers.call({from:advisors[2]});
        }).then(function (result) {
            //Admin
            return unilotAdvisors.getAdvisers.call();
        }).then(function (result) {
            //Advisor getting his share
            return unilotAdvisors.add(advisors[2], shares[2]);
        }).then(function (tx) {
            //Advisor getting his share
            return unilotAdvisors.getAdvisorShare.call(advisors[1], {from:advisors[1]});
        }).then(function (result) {
            //Advisor is getting share of another advisor
            return unilotAdvisors.getAdvisorShare.call(advisors[1], {from:advisors[2]});
        }).then(function (result) {
            //Public user getting advisors share
            return unilotAdvisors.getAdvisorShare.call(advisors[1], {from:advisors[2]});
        }).then(function (result) {
            //Admin is getting advisors share
            return unilotAdvisors.getAdvisorShare.call(advisors[1]);
        });
    });
});
