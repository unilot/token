var UnilotAdvisors = artifacts.require('UnilotAdvisors');

contract('UnilotAdvisors', function (accounts) {
    const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
    const ACCURACY = 6;
    const SHARE_MULTIPLIER = 100 * Math.pow(10, ACCURACY);
    var coinbase = web3.eth.coinbase;
    var index = 1;

    it('Permissions', function () {
        var unilotAdvisors;
        var advisors = [];
        var shares = [];

        for (var i = 1; i < 4; i++) {
            advisors.push(accounts[index++]);
            shares.push(( ( 0.5 - ( 0.1 * i ) ) * SHARE_MULTIPLIER ));
        }

        return UnilotAdvisors.new([], []).then(function (instance) {
            unilotAdvisors = instance;
        }).then(function () {
            return unilotAdvisors.getAdministrator.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), coinbase, 'Administrator is the one who created the contract');
        }).then(function () {
            //Admin can add advisor
            return unilotAdvisors.add(advisors[0], shares[0]);
        }).then(function () {
            return unilotAdvisors.add(advisors[1], shares[1], {from: advisors[0]});
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Existing advisor can not add new one.');
        }).then(function () {
            return unilotAdvisors.add(advisors[1], shares[1], {from: advisors[1]});
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. New advisor can add himself.');
        }).then(function () {
            return unilotAdvisors.add(advisors[1], shares[1], {from: advisors[2]});
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Public user should now be able to add new advisor.');
        }).then(function () {
            //Adding another adviser. Needed further
            return unilotAdvisors.add(advisors[1], shares[1]);
        }).then(function () {
            //Admin can add advisor
            return unilotAdvisors.update(advisors[0], shares[0] + (0.1 * SHARE_MULTIPLIER));
        }).then(function (tx) {
            return unilotAdvisors.update(advisors[0], shares[0], {from: advisors[0]});
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Advisor can not update his share.');
        }).then(function (tx) {
            return unilotAdvisors.update(advisors[0], shares[0], {from: advisors[1]});
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Advisor can not update another adviser\'s share.');
        }).then(function (tx) {
            return unilotAdvisors.update(advisors[0], shares[0], {from: advisors[2]});
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Public user cannot update advisor\'s share.');
        }).then(function (tx) {
            return unilotAdvisors.remove(advisors[0], {from: advisors[0]});
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Advisor cannot remove himself');
        }).then(function (tx) {
            return unilotAdvisors.remove(advisors[0], {from: advisors[1]});
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Advisor cannot remove other advisor.');
        }).then(function (tx) {
            return unilotAdvisors.remove(advisors[0], {from: advisors[2]});
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Public user cannot remove advisor.');
        }).then(function (tx) {
            return unilotAdvisors.remove(advisors[0]);
        }).then(function (tx) {
            //Existing advisor
            return unilotAdvisors.getAdministrator.call({from: advisors[1]});
        }).then(function (result) {
            //Public user
            return unilotAdvisors.getAdministrator.call({from: advisors[2]});
        }).then(function (result) {
            //Existing advisor
            return unilotAdvisors.getTotalDistribution.call({from: advisors[1]});
        }).then(function (result) {
            //Public user
            return unilotAdvisors.getTotalDistribution.call({from: advisors[2]});
        }).then(function (result) {
            //Admin
            return unilotAdvisors.getTotalDistribution.call();
        }).then(function (result) {
            //Existing advisor
            return unilotAdvisors.getAdvisers.call({from: advisors[1]});
        }).then(function (result) {
            //Public user
            return unilotAdvisors.getAdvisers.call({from: advisors[2]});
        }).then(function (result) {
            //Admin
            return unilotAdvisors.getAdvisers.call();
        }).then(function (result) {
            //Advisor getting his share
            return unilotAdvisors.add(advisors[2], shares[2]);
        }).then(function (tx) {
            //Advisor getting his share
            return unilotAdvisors.getAdvisorShare.call(advisors[1], {from: advisors[1]});
        }).then(function (result) {
            //Advisor is getting share of another advisor
            return unilotAdvisors.getAdvisorShare.call(advisors[1], {from: advisors[2]});
        }).then(function (result) {
            //Public user getting advisors share
            return unilotAdvisors.getAdvisorShare.call(advisors[1], {from: advisors[2]});
        }).then(function (result) {
            //Admin is getting advisors share
            return unilotAdvisors.getAdvisorShare.call(advisors[1]);
        });
    });

    it('Calculations testing', function () {
        var unilotAdvisors;
        var advisors = [];

        for (var i = 0; i < 5; i++) {
            advisors.push(accounts[index++]);
        }

        return UnilotAdvisors.new([], []).then(function (instance) {
            unilotAdvisors = instance;

            return unilotAdvisors.add(advisors[0], ( 0.1 * SHARE_MULTIPLIER ));
        }).then(function (tx) {
            return unilotAdvisors.getTotalDistribution.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), 10000000, 'Total distribution should be 10.000000%.');
        }).then(function () {
            return unilotAdvisors.add(advisors[1], (0.1 * SHARE_MULTIPLIER));
        }).then(function (tx) {
            return unilotAdvisors.getTotalDistribution.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), 20000000,
                'Total distribution should be 20.000000%.')
        }).then(function () {
            return unilotAdvisors.update(advisors[1], (0.05 * SHARE_MULTIPLIER));
        }).then(function (tx) {
            return unilotAdvisors.getTotalDistribution.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), 15000000, 'After update total distribution should be 15.000000%');
        }).then(function (result) {
            return unilotAdvisors.getAdvisers.call();
        }).then(function (result) {
            var total = 0;

            for (var i in result[1]) {
                if (!result[1].hasOwnProperty(i)) {
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

    it('Constructor', function () {
        var unilotAdvisors;

        var advisors = [];

        for (var i = 1; i < 4; i++) {
            advisors.push(accounts[index++]);
        }


        return UnilotAdvisors.new([], []).then(function (instance) {
            unilotAdvisors = instance;

            return unilotAdvisors.getTotalDistribution.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), 0, 'Empty conract should have total distribution 0');
        }).then(function () {
            return unilotAdvisors.getAdvisers.call();
        }).then(function (result) {
            assert.equal(result[0].length, 0, 'Contract should have no advisors.');
            assert.equal(result[1].length, 0, 'Contract should have no advisors.');
        }).then(function () {
            return UnilotAdvisors.new([advisors[0], advisors[1], advisors[2], advisors[3]],
                [(0.4 * SHARE_MULTIPLIER), (0.3 * SHARE_MULTIPLIER),
                    (0.2 * SHARE_MULTIPLIER) * (0.1 * SHARE_MULTIPLIER)]);
        }).then(function (instance) {
            unilotAdvisors = instance;

            return unilotAdvisors.getTotalDistribution.call();
        }).then(function (result) {
            assert.equal(result.valueOf(), 100000000, 'Total distribution should be 100.000000%');
        }).then(function () {
            return unilotAdvisors.getAdvisers.call();
        }).then(function (result) {
            assert.equal(result[0].length, 4, 'Contract should have 4 advisors');
            assert.equal(result[1].length, 4, 'Contract should have 4 advisors');
        }).then(function () {
            return unilotAdvisors.new([advisors[0], advisors[1], advisors[2], advisors[3]], []);
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Advisors list and shares list should be of same length.');
        }).then(function () {
            return UnilotAdvisors.new([], [(0.4 * SHARE_MULTIPLIER), (0.3 * SHARE_MULTIPLIER),
                (0.2 * SHARE_MULTIPLIER) * (0.1 * SHARE_MULTIPLIER)]);
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Advisors list and shares list should be of same length.');
        });
    });

    it('Method add', function () {
        var unilotAdvisors;
        var advisors = [
            accounts[index++],
            accounts[index++],
            accounts[index++],
            accounts[index++]
        ];

        return UnilotAdvisors.new([], []).then(function (instance) {
            unilotAdvisors = instance;

            return unilotAdvisors.add(advisors[0], 0);
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Advisors share cannot be 0.');
        }).then(function () {
            return unilotAdvisors.add(advisors[0], -1);
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Advisors share cannot be less then 0.');
        }).then(function () {
            return unilotAdvisors.add(advisors[0], 100000001); //100.000001%
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Advisors share cannot be more than 100.000000%');
        }).then(function () {
            //Normally add 100.000000%
            return unilotAdvisors.add(advisors[0], 100000000);
        }).then(function (tx) {
            //Adding extra 20.000000%
            return unilotAdvisors.add(advisors[1], 20000000);
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Adding user should not be possible if total share is already 100.000000%');
        }).then(function () {
            //Setting 85.000000%
            return unilotAdvisors.update(advisors[0], 85000000);
        }).then(function (tx) {
            //Adding extra 20.000000%
            return unilotAdvisors.add(advisors[1], 20000000);
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted,
                'Transaction should be reverted. Adding user should not be possible if new user\'s share + existing users share is more then 100.000000%');
        }).then(function (tx) {
            //Trying to add existing advisor again
            return unilotAdvisors.add(advisors[0], 5000000);
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted,
                'Transaction should be reverted. Adding existing advisor should not be possible.');
        }).then(function () {
            return unilotAdvisors.add(advisors[1], 5000000);
        }).then(function () {
            return unilotAdvisors.add(advisors[2], 5000000);
        }).then(function (tx) {
            return unilotAdvisors.remove(advisors[1]);
        }).then(function (tx) {
            //Should be able to add remove advisor
            return unilotAdvisors.add(advisors[1], 5000000);
        }).then(function (tx) {
            return unilotAdvisors.getAdvisers.call();
        }).then(function (result) {
            // Testing if adviser will return back to it's index before advisor was removed.
            // Advisor was on index 1 and after add back should appear on the same place.
            assert.equal(result[0].length, 3, 'The should still be 3 advisors in the list.');
            assert.equal(result[0][1], advisors[1], 'Advisor should appear on the same array position.');
            assert.equal(result[1][1], 5000000, 'Advisors share should be on the same array position.');
        }).then(function () {
            return unilotAdvisors.remove(advisors[0]);
        }).then(function (tx) {
            return unilotAdvisors.add(advisors[3], 5000000);
        }).then(function (tx) {
            return unilotAdvisors.getAdvisers.call();
        }).then(function (result) {
            // This test checks some specific behavior of add method that
            // tries to keep size of array as small as possible. Because of some
            // solidity specifics, new user will be written to the first element
            // of array with index 0 (if it doens't contain reference to user),
            // but size of array will be kept the same.
            assert.equal(result[0].length, 3, 'The should still be 3 advisors in the list.');
            assert.equal(result[0][0], advisors[3], 'Advisor should appear on the same array position.');
            assert.equal(result[1][0], 5000000, 'Advisors share should be on the same array position.');
        }).then(function (tx) {
            return unilotAdvisors.add(advisors[0], 5000000);
        }).then(function (tx) {
            return unilotAdvisors.getAdvisers.call();
        }).then(function (result) {
            // Despite that 2 tests before is user is added it was returned to the same array index
            // But if you'll see comments of previous test it will be clear that if test passes
            // index 0 will be in use by another user. In this case advisor that was referenced by
            // index 0 can not be turned back. In this case new advisor should be added in the end
            // of the list
            assert.equal(result[0].length, 4, 'The should still be 3 advisors in the list.');
            assert.equal(result[0][3], advisors[0], 'Advisor should appear on the same array position.');
            assert.equal(result[1][3], 5000000, 'Advisors share should be on the same array position.');
        });
    });

    it('Method update', function () {
        var unilotAdvisors;
        var advisors = [
            accounts[index++],
            accounts[index++]
        ];

        return UnilotAdvisors.new([], []).then(function (instance) {
            unilotAdvisors = instance;

            return unilotAdvisors.add(advisors[0], 20000000);
        }).then(function (tx) {
            return unilotAdvisors.update(advisors[1], 10000000);
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted,
                'Transaction should be reverted. Updating advisor that doesn\'t exist should not be possible.');
        }).then(function () {
            return unilotAdvisors.update(advisors[0], 0);
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted,
                'Transaction should be reverted. Updating advisors share to 0 should not be possible.');
        }).then(function () {
            return unilotAdvisors.update(advisors[0], -1);
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted,
                'Transaction should be reverted. Updating advisors share to value less then 0 should not be possible.');
        }).then(function () {
            return unilotAdvisors.add(advisors[1], 70000000);
        }).then(function() {
            return unilotAdvisors.update(advisors[0], 40000000);
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted,
                'Transaction should be reverted. Updating share that goes out of token distribution should not be possible.');
        });
    });

    it('Method remove', function () {
        var unilotAdvisors;
        var advisors = [
            accounts[index++],
            accounts[index++],
            accounts[index++],
            accounts[index++]
        ];

        return UnilotAdvisors.new([], []).then(function (instance) {
            unilotAdvisors = instance;

            return unilotAdvisors.add(advisors[0], 20000000);
        }).then(function (tx) {
            return unilotAdvisors.add(advisors[1], 20000000);
        }).then(function (tx) {
            return unilotAdvisors.add(advisors[2], 20000000);
        }).then(function (tx) {
            return unilotAdvisors.remove(advisors[3]);
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted,
                'Transaction should be reverted. Deleting advisor that was not added should not be possible.');
        }).then(function () {
            return unilotAdvisors.remove(advisors[1]);
        }).then(function (tx) {
            return unilotAdvisors.getAdvisers.call();
        }).then(function (result) {
            assert.equal(result[0].length, result[0].length, 'Array of address and share should be of same length.');
            assert.equal(result[0].length, 3, 'Number of rows should be 3');
            assert.equal(result[0][1], EMPTY_ADDRESS, 'Address of deleted user should be empty.');
            assert.equal(result[1][1], 0, 'Share of deleted user should be 0.');
        }).then(function() {
            return unilotAdvisors.remove(advisors[1]);
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should be reverted. Adviser can not be removed twice.');
        });
    })
});
