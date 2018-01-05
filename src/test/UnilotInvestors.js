var UnilotInvestors = artifacts.require('UnilotInvestors');

contract('UnilotInvestors', function(accounts) {
    var EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
    var coinbase = web3.eth.coinbase;
    var accounts = web3.eth.accounts;
    var investorIndex = 0;
    var state = {
        ANONYMOUS: 0,
        REGISTERED: 1,
        APPROVED: 2,
        BANNED: 3,
        FROZEN: 4
    };

    if (accounts[investorIndex] !== coinbase) {
        for (var i in accounts) {
            if ( !accounts.hasOwnProperty(i) ) {
                continue;
            }

            if ( accounts[i] === coinbase ) {
                investorIndex = i;
                break;
            }
        }
    }

    it('Deployer becomes admin automatically.', function() {
        return UnilotInvestors.deployed().then(function(instance){
            return instance.getAdministrator.call()
        }).then(function(administrator) {
            assert.equal(administrator, coinbase, "That's odd. One who created is not admin?");
        });
    });

    it('Can not add anonymous investor', function() {
        var investorsPool;
        var investor = accounts[investorIndex + 1];

        return UnilotInvestors.deployed().then(function(instance){
            investorsPool = instance;

            return investorsPool.add(investor, state.ANONYMOUS, 0);
        }).catch(function(error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction with attempt to add anonymous investor should be reverted');
        }).then(function(){
            investorsPool.add(investor, state.REGISTERED, 0);
            return investorsPool.changeState(investor, state.ANONYMOUS);
        }).catch(function(error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction with attempt to change investor to anonymous should be reverted');
        });
    });

    it('Validate correct state processing', function() {
        var investorsPool;
        var registeredInvestor = accounts[investorIndex+2];
        var approvedInvestor = accounts[investorIndex+3];
        var bannedInvestor = accounts[investorIndex+4];
        var frozenInvestor = accounts[investorIndex+5];
        var reabilitatedInvestor = accounts[investorIndex + 6];
        var badInvestor = accounts[investorIndex + 7]; //Underaged investor for instance

        return UnilotInvestors.deployed().then(function(instance){
            investorsPool = instance;

            //Adding registerd investor
            return instance.add(registeredInvestor, state.REGISTERED, 0);
        }).then(function(result){
            return investorsPool.getInvestor.call(registeredInvestor);
        }).then(function(result) {
            assert.equal(result[0].valueOf(), state.REGISTERED, 'State should be "registered".');
        }).then(function () {
            //Checking investment ability of registerd investor
            return investorsPool.isCanInvest.call(registeredInvestor);
        }).then(function (result) {
            assert(result.valueOf(), 'Registerd investor can invest');
        }).then(function(){
            //Adding approved investor
            return investorsPool.add(approvedInvestor, state.APPROVED, 0);
        }).then(function(result){
            return investorsPool.getInvestor.call(approvedInvestor);
        }).then(function(result){
            assert.equal(result[0].valueOf(), state.APPROVED, 'State should be "approved"');
        }).then(function () {
            //Checking investment ability
            return investorsPool.isCanInvest.call(approvedInvestor);
        }).then(function (result) {
            assert(result.valueOf(), 'Approved investor can invest');
        }).then(function(){
            //Adding banned investor
            return investorsPool.add(bannedInvestor, state.BANNED, 0);
        }).then(function(result){
            return investorsPool.getInvestor.call(bannedInvestor);
        }).then(function(result){
            assert.equal(result[0].valueOf(), state.BANNED, 'State should be "banned"');
        }).then(function () {
            //Checking investment ability
            return investorsPool.isCanInvest.call(bannedInvestor);
        }).then(function (result) {
            assert(!result.valueOf(), 'Banned investor can not invest');
        }).then(function(){
            //Adding frozen investor
            return investorsPool.add(frozenInvestor, state.FROZEN, 0);
        }).then(function(result){
            return investorsPool.getInvestor.call(frozenInvestor);
        }).then(function(result){
            assert.equal(result[0].valueOf(), state.FROZEN, 'State should be "frozen"');
        }).then(function () {
            //Checking investment ability
            return investorsPool.isCanInvest.call(frozenInvestor);
        }).then(function (result) {
            assert(!result.valueOf(), 'Frozen investor can not invest');
        }).then(function(){
            return investorsPool.add(reabilitatedInvestor, state.BANNED, 0);
        }).then(function(result){
            //Checking that state change is working right (banned -> registered)
            return investorsPool.changeState(reabilitatedInvestor, state.REGISTERED);
        }).then(function(result){
            return investorsPool.getInvestor.call(reabilitatedInvestor);
        }).then(function(result){
            assert.equal(result[0].valueOf(), state.REGISTERED, 'State should be registered');
        }).then(function () {
            //Checking investment ability
            return investorsPool.isCanInvest.call(reabilitatedInvestor);
        }).then(function (result) {
            assert(result.valueOf(), 'After changing state to registerd investor can invest.');
        }).then(function(result){
            //Approving investor
            return investorsPool.changeState(reabilitatedInvestor, state.APPROVED);
        }).then(function(result) {
            return investorsPool.getInvestor.call(reabilitatedInvestor);
        }).then(function(result){
            assert.equal(result[0].valueOf(), state.APPROVED, 'State should be approved');
        }).then(function(){
            //Checking if transaction will fail if invalid state is submitted
            return investorsPool.add(badInvestor, -1, 0);
        }).catch(function(error){
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Attempt to create investor with state -1 should fail');
        }).then(function(){
            //And from another end
            return investorsPool.add(badInvestor, state.FROZEN + 1, 0);
        }).catch(function(error){
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Attempt to create investor with state ' + (state.FROZEN + 1) + ' should fail');
        }).then(function() {
            //Adding investor
            return investorsPool.add(badInvestor, state.REGISTERED, 0);
        }).then(function(result) {
            //Then banning him
            return investorsPool.changeState(badInvestor, state.BANNED);
        }).then(function(result){
            return investorsPool.getInvestor.call(badInvestor);
        }).then(function(result){
            assert.equal(result[0].valueOf(), state.BANNED, 'Investor should be banned.');
        }).then(function () {
            //Checking investment ability
            return investorsPool.isCanInvest.call(badInvestor);
        }).then(function (result) {
            assert(!result.valueOf(), 'After banning investor investment should be impossible.');
        });
    });

    it('Validate permissions', function(){
        var investorsPool;
        var investor = accounts[investorIndex + 8];
        var investorMember = accounts[investorIndex + 9];
        var investorHacker = accounts[investorIndex + 10];
        
        return UnilotInvestors.deployed().then(function(instance){
            investorsPool = instance;

            //Checking if not admin can add himself
            return investorsPool.add(investorHacker, state.REGISTERED, 0, {from: investorHacker});
        }).catch(function(error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should fail. None member none admin shouldn\'t be able to add himself as investor.');
        }).then(function(){
            //Checking if not admin can add investor (not himself)
            return investorsPool.add(investor, state.REGISTERED, 0, {from:investorHacker});
        }).catch(function(error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should fail. None member none admin shouldn\'t be able to add another investor.');
        }).then(function(){
            //Checking if not admin can change not existing investor
            return investorsPool.changeState(investor, state.REGISTERED, {from:investorHacker});
        }).catch(function(error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should fail. None member none admin shouldn\'t be able to change none-existing investors state.');
        }).then(function(){
            //Adding investor as admin
            return investorsPool.add(investorMember, state.REGISTERED, 0);
        }).then(function(){
            //Checking if not admin can change state for existing investor
            return investorsPool.changeState(investorMember, state.APPROVED, {from:investorHacker});
        }).catch(function(error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should fail. None member none admin shouldn\'t be able to change investors state.');
        }).then(function(){
            //Adding potential hacker to investors list
            return investorsPool.add(investorHacker, state.REGISTERED, 0);
        }).then(function(result){
            //Checking if not admin member can add another member
            return investorsPool.add(investor, state.REGISTERED, 0, {from:investorHacker});
        }).catch(function(error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should fail. Member none admin shouldn\'t be able to add another investor.');
        }).then(function(result){
            //Checking if not admin member can change investor that is not on the list
            return investorsPool.changeState(investor, state.REGISTERED, {from:investorHacker});
        }).catch(function(error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should fail. Member none admin shouldn\'t be able to change none-existing investors state.');
        }).then(function(result){
            //Checking if not admin member can change existing investor
            return investorsPool.changeState(investorMember, state.REGISTERED, {from:investorHacker});
        }).catch(function(error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should fail. Member none admin shouldn\'t be able to change existing investors state.');
        }).then(function(result){
            //Checking if not admin member can change himself
            return investorsPool.changeState(investorHacker, state.APPROVED, {from:investorHacker});
        }).catch(function(error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should fail. Member none admin shouldn\'t be able to change state for himself.');
        }).then(function(){
            //Checking that admin can normally change existing investors state
            return investorsPool.changeState(investorMember, state.APPROVED, {from:coinbase});
        }).then(function () {
            //Trying to add admin as investor
            return investorsPool.add(coinbase, state.REGISTERED, 0);
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should fail. Admin is not allowed to be investor.');
        }).then(function () {
            //Traying to change state. Tricky way to add (should not work in any case)
            return investorsPool.changeState(coinbase, state.REGISTERED);
        }).catch(function (error) {
            var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
            assert(reverted, 'Transaction should fail. Admin is not allowed to be investor.');
        });
    });

    it('Referal system check', function(){
        var investorsPool;
        var referrers = [
            accounts[investorIndex + 11],
            accounts[investorIndex + 12],
            accounts[investorIndex + 13],
            accounts[investorIndex + 14],
            accounts[investorIndex + 15],
            accounts[investorIndex + 16]
        ];
        var referrals = [];

        for (var i = 1; i <= 3; i++) {
            referrals.push(accounts[investorIndex + 16 + i]);
        }

        return UnilotInvestors.deployed().then(function(instance) {
            investorsPool = instance;

            return investorsPool.add(referrers[0], state.REGISTERED, 0);
        }).then(function(result){
            //Checking normal adding with referrer
            return investorsPool.add(referrals[0], state.REGISTERED, referrers[0]);
        }).then(function(result){
            return investorsPool.getReferrer.call(referrals[0]);
        }).then(function(result){
            assert.equal(result.valueOf(), referrers[0],
                'Get referrer should return referrer that was set in add method.');
        }).then(function(){
            return investorsPool.add(referrals[1], state.REGISTERED, 0);
        }).then(function(result){
            return investorsPool.getReferrer.call(referrals[1])
        }).then(function(result){
            assert.equal(result.valueOf(), EMPTY_ADDRESS,
                'Should return empty/null address if no referrer was provided to add function');
        }).then(function () {
            //Testing how levels work
            return investorsPool.add(referrers[1], state.REGISTERED, referrers[0]);
        }).then(function () {
            return investorsPool.getReferanceLevel.call(referrers[0]);
        }).then(function (result) {
            assert.equal(result.valueOf(), 0, 'Investors without referrers shoud be of 0 level referrence.');
        }).then(function(){
            return investorsPool.getReferanceLevel.call(referrers[1]);
        }).then(function (result) {
            assert.equal(result.valueOf(), 1, 'Investors with 1 referrer in the line should have 1 level referrence');
        }).then(function () {
            return investorsPool.add(referrers[2], state.REGISTERED, referrers[1]); //Level 2
        }).then(function (result) {
            return investorsPool.getReferanceLevel.call(referrers[2]);
        }).then(function (result) {
            assert.equal(result.valueOf(), 2, 'Referral of level 1 referrer should be level 2');
        }).then(function(result){
            return investorsPool.add(referrers[3], state.REGISTERED, referrers[2]); //Level 3
        }).then(function(result){
            return investorsPool.add(referrers[4], state.REGISTERED, referrers[3]); //Level 4
        }).then(function(result){
            return investorsPool.add(referrers[5], state.REGISTERED, referrers[4]); //Level 5
        }).then(function(result){
            return investorsPool.add(referrals[2], state.REGISTERED, referrers[5]); //Level 6
        }).then(function (result) {
            return investorsPool.getReferanceLevel.call(referrals[2]);
        }).then(function (result) {
            //Testing getReferanceLevel function
            assert.equal(result.valueOf(), 6, 'Referral level should be 6');
        }).then(function () {
            return investorsPool.getReferrersList.call(referrals[2], 0);
        }).then(function (result) {
            var knownReferrers = [
                referrers[5],
                referrers[4],
                referrers[3],
                referrers[2],
                referrers[1],
                referrers[0]
            ];

            assert.equal(result.length, knownReferrers.length, 'Referers chain should have 6 referrers.');

            for (var i = 0; i < 6; i++){
                assert.equal(result[i].valueOf(), knownReferrers[i],
                    'Referrer at level ' + (i+1) + ' should be "' + knownReferrers[i] + '"');
            }
        });
    });

    it('Checking public methods', function() {
        var investorsPool;
        var investors = [
            accounts[investorIndex + 1],
            accounts[investorIndex + 2],
            accounts[investorIndex + 3],
            accounts[investorIndex + 4],
            accounts[investorIndex + 5]
        ];

        return UnilotInvestors.new({from: coinbase}).then(function (instance) {
            investorsPool = instance;

            return investorsPool.getInvestors.call();
        }).then(function (result) {
            assert.equal(result.length, 0, 'Should return empty list before adding new investor');
        }).then(function () {
            return investorsPool.getInvestors.call({from:investors[0]});
        }).then(function (result) {
            assert.equal(result.length, 0, 'Should return same result for public user.');
        }).then(function () {
            return investorsPool.add(investors[0], state.REGISTERED, 0);
        }).then(function (result) {
            return investorsPool.getInvestors.call({from:investors[0]});
        }).then(function(result){
            assert.equal(result.length, 1, 'Should show full list to registered investor')
        }).then(function (result) {
            return investorsPool.getInvestors.call({from:investors[1]});
        }).then(function(result){
            assert.equal(result.length, 1, 'Should show full list to public user');
        }).then(function () {
            return investorsPool.getInvestor.call(investors[0], {from: investors[0]});
        }).then(function (result) {
            assert.equal(result[0].valueOf(), state.REGISTERED,
                'Should return correct state to registerd not-admin investor');
            assert.equal(result[1].valueOf(), EMPTY_ADDRESS,
                'Should return correct referrer address (empty) to registerd not-admin investor');
            assert.equal(result[2].valueOf(), 0,
                'Should return correct referrance level (0) to registerd not-admin investor');
        }).then(function () {
            return investorsPool.getInvestor.call(investors[0], {from: investors[1]});
        }).then(function (result) {
            assert.equal(result[0].valueOf(), state.REGISTERED,
                'Should return correct state to public not-admin user');
            assert.equal(result[1].valueOf(), EMPTY_ADDRESS,
                'Should return correct referrer address (empty) to public not-admin user');
            assert.equal(result[2].valueOf(), 0,
                'Should return correct referrance level (0) to public not-admin user');
        }).then(function () {
            return investorsPool.add(investors[1], state.REGISTERED, investors[0]);
        }).then(function (result) {
            return investorsPool.getInvestors.call({from:investors[1]});
        }).then(function (result) {
            assert.equal(result.length, 2, 'Should return full list to registed not admin investor');
        }).then(function (result) {
            return investorsPool.getInvestors.call({from:investors[2]});
        }).then(function (result) {
            assert.equal(result.length, 2, 'Should return full list to public not admin user');
        }).then(function (result) {
            return investorsPool.getInvestor.call(investors[1], {from:investors[1]});
        }).then(function (result) {
            assert.equal(result[0].valueOf(), state.REGISTERED,
                'Should return correct state to registerd not-admin investor');
            assert.equal(result[1].valueOf(), investors[0],
                'Should return correct referrer address ("' + investors[0] + '") to registerd not-admin investor');
            assert.equal(result[2].valueOf(), 1,
                'Should return correct referrance level (1) to registerd not-admin investor');
        }).then(function (result) {
            return investorsPool.getInvestor.call(investors[1], {from:investors[2]});
        }).then(function (result) {
            assert.equal(result[0].valueOf(), state.REGISTERED,
                'Should return correct state to public not-admin user');
            assert.equal(result[1].valueOf(), investors[0],
                'Should return correct referrer address ("' + investors[0] + '") to public not-admin user');
            assert.equal(result[2].valueOf(), 1,
                'Should return correct referrance level (1) to public not-admin user');
        }).then(function () {
            return investorsPool.isCanInvest.call(investors[0], {from: investors[0]});
        }).then(function (result) {
            assert(result, 'Should return true for registered not-admin investor');
        }).then(function () {
            return investorsPool.isCanInvest.call(investors[0], {from: investors[2]});
        }).then(function (result) {
            assert(result, 'Should return true for public not-admin user');
        }).then(function () {
            return investorsPool.getReferrer.call(investors[1], {from: investors[1]});
        }).then(function (result) {
            assert.equal(result.valueOf(), investors[0],
                'Should return "' + investors[0] + '" to registered not-admin investor' )
        }).then(function () {
            return investorsPool.getReferrer.call(investors[1], {from: investors[2]});
        }).then(function (result) {
            assert.equal(result.valueOf(), investors[0],
                'Should return "' + investors[0] + '" to public not-admin user' )
        });
    });
});
