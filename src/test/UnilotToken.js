var UnilotInvestors = artifacts.require('UnilotInvestors');
var UnilotToken = artifacts.require('UnilotToken');

contract('UnilotToken', function(accounts) {
    var EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
    var RESERVE_ADDRES = '0x731B47847352fA2cFf83D5251FD6a5266f90878d';
    var coinbase = web3.eth.coinbase;
    var investorIndex = 0;
    var index = 1;
    var state = {
        ANONYMOUS: 0,
        REGISTERED: 1,
        APPROVED: 2,
        BANNED: 3,
        FROZEN: 4
    };

    function pause(milliseconds) {
        var dt = new Date();
        while ((new Date()) - dt <= milliseconds) { /* Do nothing */ }
    }

    it('Check starting token supply', function() {
        var token;
        var investorsPool;

        return UnilotInvestors.deployed().then(function (instance) {
            investorsPool = instance;

            return UnilotToken.new(investorsPool.address, true);
        }).then(function (instance) {
            token = instance;

            return token.getTotalCoinsAvailable.call();
         });//.then(function (totalAvailable) {
    //         return assert.equal(totalAvailable.valueOf(), 375000000000000000000000000,
    //             'Total available coins should be 375 mln');
    //     }).then(function () {
    //         return token.balanceOf.call('0x40e3D8fFc46d73Ab5DF878C751D813a4cB7B388D');
    //     }).then(function(balance) {
    //         return assert.equal(balance.valueOf(), 32142857142857142857142857, '')
    //     }).then(function () {
    //         return token.balanceOf.call('0x731B47847352fA2cFf83D5251FD6a5266f90878d');
    //     }).then(function(balance) {
    //         return assert.equal(balance.valueOf(), 50000000000000000000000000, '')
    //     }).then(function () {
    //         return token.balanceOf.call('0xd13289203889bD898d49e31a1500388441C03663');
    //     }).then(function(balance) {
    //         return assert.equal(balance.valueOf(), 7142857142857142857142858, '')
    //     }).then(function () {
    //         return token.balanceOf.call('0x5E065a80f6635B6a46323e3383057cE6051aAcA0');
    //     }).then(function(balance) {
    //         return assert.equal(balance.valueOf(), 7142857142857142857142857, '')
    //     }).then(function () {
    //         return token.balanceOf.call('0x0cF3585FbAB2a1299F8347a9B87CF7B4fcdCE599');
    //     }).then(function(balance) {
    //         return assert.equal(balance.valueOf(), 7142857142857142857142857, '')
    //     }).then(function () {
    //         return token.balanceOf.call('0x5fDd3BA5B6Ff349d31eB0a72A953E454C99494aC');
    //     }).then(function(balance) {
    //         return assert.equal(balance.valueOf(), 7142857142857142857142857, '')
    //     }).then(function () {
    //         return token.balanceOf.call('0xC9be9818eE1B2cCf2E4f669d24eB0798390Ffb54');
    //     }).then(function(balance) {
    //         return assert.equal(balance.valueOf(), 7142857142857142857142857, '')
    //     }).then(function () {
    //         return token.balanceOf.call('0x77660795BD361Cd43c3627eAdad44dDc2026aD17');
    //     }).then(function(balance) {
    //         return assert.equal(balance.valueOf(), 7142857142857142857142857, '')
    //     });
    // });
    //
    // it('Simple buy on stage 1', function () {
    //     var token;
    //     var investorsPool;
    //     var investors = [
    //         accounts[index++]
    //     ];
    //
    //     return UnilotInvestors.deployed().then(function (instance) {
    //         investorsPool = instance;
    //
    //         return UnilotToken.new(investorsPool.address, true);
    //     }).then(function (instance) {
    //         token = instance;
    //
    //         return investorsPool.add(investors[0], state.REGISTERED, 0);
    //     }).then(function () {
    //         return token.sendTransaction({
    //             from: investors[0],
    //             value: web3.toWei(1, 'ether')
    //         });
    //     }).then(function(tx) {
    //         return token.balanceOf.call(investors[0]);
    //     }).then(function(balance) {
    //         return assert.equal(balance.valueOf(), 17721518987341772400000,
    //             'Total number of tokens should be 17721.518987341772400000 UNIT');
    //     }).then(function() {
    //         return investorsPool.changeState(investors[0], state.APPROVED);
    //     }).then(function (tx) {
    //         return token.sendTransaction({
    //             from: investors[0],
    //             value: web3.toWei(30, 'ether')
    //         });
    //     });
    // });
    //
    // it('Testing invalid payments', function () {
    //     var token;
    //     var investorsPool;
    //     var investors = [
    //         accounts[index++],
    //         accounts[index++]
    //     ];
    //
    //     return UnilotInvestors.deployed().then(function (instance) {
    //         investorsPool = instance;
    //
    //         return UnilotToken.new(investorsPool.address, true);
    //     }).then(function (instance) {
    //         token = instance;
    //
    //         return token.getAvailableCoinsForCurrentStage.call();
    //     }).then(function (result) {
    //         return assert.equal(result.valueOf(), 25000000000000000000000000,
    //             '25 mln tokens should be available for sale.');
    //     }).then(function () {
    //         return investorsPool.add(investors[0], state.REGISTERED, 0);
    //     }).then(function () {
    //         return token.sendTransaction({
    //             from: investors[1],
    //             value: web3.toWei(1, 'ether')
    //         });
    //     }).catch(function(error) {
    //         var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
    //         return assert(reverted, 'Transaction should be reverted. Investor is not registered.');
    //     }).then(function () {
    //         return token.sendTransaction({
    //             from: investors[0],
    //             value: web3.toWei(78, 'szabo') //Less then one token
    //         });
    //     }).catch(function (error) {
    //         var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
    //         return assert(reverted, 'Transaction should be reverted. Value is too low.');
    //     }).then(function () {
    //         return token.sendTransaction({
    //             from: investors[0],
    //             value: web3.toWei(30, 'ether')
    //         });
    //     }).then(function (tx) {
    //         return token.sendTransaction({
    //             from: investors[0],
    //             value: web3.toWei(1, 'wei')
    //         });
    //     }).catch(function (error) {
    //         var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
    //         return assert(reverted, 'Transaction should be reverted. Total investment is more than 30ETH.');
    //     }).then(function () {
    //         return investorsPool.add(investors[1], state.REGISTERED, 0);
    //     }).then(function (tx) {
    //         return token.sendTransaction({
    //             from: investors[1],
    //             value: web3.toWei(30, 'ether')
    //         })
    //     });
    // });
    //
    //
    // it('Testing stages', function() {
    //     var token;
    //     var investorsPool;
    //     var investors = [];
    //     var startTime;
    //     var balances = [];
    //
    //     return UnilotInvestors.deployed().then(function (instance) {
    //         investorsPool = instance;
    //         var result;
    //
    //         for (var i = 0; i < 70; i++) {
    //             investors.push(accounts[index++]);
    //
    //             investorsPool.add(
    //                 investors[(investors.length - 1)], state.REGISTERED, 0);
    //         }
    //     }).then(function () {
    //         return UnilotToken.new(investorsPool.address, true);
    //     }).then(function (instance) {
    //         token = instance;      //Remembering contract
    //         startTime = Date.now();//Remembering time when contract was created
    //
    //         return token.getAvailableCoinsForCurrentStage.call();
    //     }).then(function (result) {
    //         return assert.equal(result.valueOf(), 25000000000000000000000000,
    //             '25 mln tokens should be available for sale.');
    //     }).then(function () {
    //         return token.calculateBonus.call(100);
    //     }).then(function (bonus) {
    //         return assert.equal(bonus.valueOf(), 40, 'Pre-ICO bonus is 40%');
    //     }).then(function() {
    //         var time = Date.now();
    //         pause(30000 - (time - startTime)); //Waiting for next stage
    //
    //         return token.sendTransaction({
    //             from: investors[(investors.length - 1)],
    //             value: web3.toWei(79, 'szabo')
    //         });
    //     }).then(function() {
    //         return token.getAvailableCoinsForCurrentStage.call();
    //     }).then(function (result) {
    //         //Means that contract have successfully switched to stage 1 pre-sale 1
    //         return assert.equal(result.valueOf(), 4999999000000000000000000,
    //             '5 mln - 1 tokens should be available for sale.');
    //     }).then(function () {
    //         return token.calculateBonus.call(100);
    //     }).then(function (bonus) {
    //         return assert.equal(bonus.valueOf(), 35,
    //             'Stage 1 pre-sale 1 bonus is 35%');
    //     }).then(function(){
    //         return token.balanceOf.call(investors[(investors.length - 1)])
    //     }).then(function(balance) {
    //         return assert.equal(balance.valueOf(), 1350000000000000000, 'Investors balance should be 1.35 tokens');
    //     }).then(function () {
    //         var result;
    //
    //         for (var i = 0; i < 14; i++) {
    //             result = token.sendTransaction({
    //                 from: investors[i],
    //                 value: web3.toWei(30, 'ether')
    //             });
    //         }
    //
    //         return result;
    //     }).then(function (tx) {
    //         return token.transfer(investors[1], 1000000000000000000, {from:investors[0]}); //1 token
    //     }).catch(function (error) {
    //         var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
    //         return assert(reverted, 'Transaction should be reverted. Transfer of tokens during ICO should not possible.');
    //     }).then(function() {
    //         return token.sendTransaction({
    //                 from: investors[14],
    //                 value: web3.toWei(79, 'szabo')
    //             });
    //     }).then(function (tx) {
    //         return token.getAvailableCoinsForCurrentStage.call();
    //     }).then(function (result) {
    //         //Means that contract have successfully switched to stage 1 pre-sale 2
    //         return assert.equal(result.valueOf(), 4999999000000000000000000,
    //             '5 mln - 1 token should be available for sale.');
    //     }).then(function () {
    //         return token.calculateBonus.call(100);
    //     }).then(function (bonus) {
    //         return assert.equal(bonus.valueOf(), 30,
    //             'Stage 1 pre-sale 2 bonus is 30%');
    //     }).then(function() {
    //         return token.balanceOf.call(investors[14])
    //     }).then(function(balance) {
    //         return assert.equal(balance.valueOf(), 1300000000000000000, 'Investors balance should be 1.30 tokens')
    //     }).then(function () {
    //         var result;
    //
    //         for (var i = 0; i < 14; i++) {
    //             result = token.sendTransaction({
    //                 from: investors[14 + i],
    //                 value: ( i > 0
    //                     ? web3.toWei(30, 'ether')
    //                     : ( web3.toWei(30, 'ether') - web3.toWei(79, 'szabo') ) )
    //             });
    //         }
    //
    //         return result;
    //     }).then(function(tx) {
    //         return token.sendTransaction({
    //                 from: investors[28],
    //                 value: web3.toWei(79, 'szabo')
    //             });
    //     }).then(function (tx) {
    //         return token.getAvailableCoinsForCurrentStage.call();
    //     }).then(function (result) {
    //         //Means that contract have successfully switched to stage 1 pre-sale 3
    //         return assert.equal(result.valueOf(), 4999999000000000000000000,
    //             '5 mln should be available for sale.');
    //     }).then(function () {
    //         return token.calculateBonus.call(100);
    //     }).then(function (bonus) {
    //         return assert.equal(bonus.valueOf(), 25,
    //             'Stage 1 pre-sale 3 bonus is 25%');
    //     }).then(function() {
    //         return token.balanceOf.call(investors[28])
    //     }).then(function(balance) {
    //         return assert.equal(balance.valueOf(), 1250000000000000000, 'Investors balance should be 1.25 tokens')
    //     }).then(function () {
    //         var result;
    //
    //         for (var i = 0; i < 14; i++) {
    //             result = token.sendTransaction({
    //                 from: investors[28 + i],
    //                 value: ( i > 0
    //                     ? web3.toWei(30, 'ether')
    //                     : ( web3.toWei(30, 'ether') - web3.toWei(79, 'szabo') ) )
    //             });
    //         }
    //
    //         return result;
    //     }).then(function(tx) {
    //         return token.sendTransaction({
    //                 from: investors[42],
    //                 value: web3.toWei(79, 'szabo')
    //             });
    //     }).then(function (tx) {
    //         return token.getAvailableCoinsForCurrentStage.call();
    //     }).then(function (result) {
    //         //Means that contract have successfully switched to stage 1 pre-sale 4
    //         return assert.equal(result.valueOf(), 4999999000000000000000000,
    //             '5 mln should be available for sale.');
    //     }).then(function () {
    //         return token.calculateBonus.call(100);
    //     }).then(function (bonus) {
    //         return assert.equal(bonus.valueOf(), 20,
    //             'Stage 1 pre-sale 4 bonus is 20%');
    //     }).then(function() {
    //         return token.balanceOf.call(investors[42])
    //     }).then(function(balance) {
    //         return assert.equal(balance.valueOf(), 1200000000000000000, 'Investors balance should be 1.20 tokens')
    //     }).then(function () {
    //         var result;
    //
    //         for (var i = 0; i < 14; i++) {
    //             result = token.sendTransaction({
    //                 from: investors[42 + i],
    //                 value: ( i > 0
    //                     ? web3.toWei(30, 'ether')
    //                     : ( web3.toWei(30, 'ether') - web3.toWei(79, 'szabo') ) )
    //             });
    //         }
    //
    //         return result;
    //     }).then(function() {
    //         pause((2*30000) - (startTime - Date.now()));
    //         return token.sendTransaction({
    //                 from: investors[56],
    //                 value: web3.toWei(79, 'szabo')
    //             });
    //     }).then(function() {
    //         return token.getAvailableCoinsForCurrentStage.call();
    //     }).then(function (result) {
    //         return assert.equal(result.valueOf(), 289999999000000000000000000,
    //             '290 mln (265 + 25 from pre-ico stage) tokens should be available for sale.');
    //     }).then(function () {
    //         return token.calculateBonus.call(100);
    //     }).then(function (bonus) {
    //         return assert.equal(bonus.valueOf(), 0, 'Stage 2 offers tokens without bonus.');
    //     }).then(function() {
    //         pause((3*30000) - (startTime - Date.now()));
    //
    //         return token.sendTransaction({
    //                 from: investors[56],
    //                 value: web3.toWei(79, 'szabo')
    //             });
    //     }).catch(function(error) {
    //         var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
    //         return assert(reverted,
    //             'Transaction should be reverted. New stage didn\'t start yet. Previous error was: ' + error);
    //     }).then(function () {
    //         return token.closeStage();
    //     }).then(function (tx) {
    //         return token.transfer(investors[1], 1000000000000000000, {from:investors[0]}); //1 token
    //     }).then(function(tx) {
    //         return token.approve(investors[0], 1000000000000000000, {from: investors[1]});
    //     }).then(function (tx) {
    //         return token.allowance(investors[1], investors[0]);
    //     }).then(function(remaining) {
    //         return assert.equal(remaining.valueOf(), 1000000000000000000, 'One token should be allowed to spend');
    //     }).then(function() {
    //         return token.transferFrom(investors[1], investors[0], 500000000000000000, {from: investors[0]}); //0.5 token
    //     }).then(function (tx) {
    //         return token.allowance(investors[1], investors[0]);
    //     }).then(function(remaining) {
    //         return assert.equal(remaining.valueOf(), 500000000000000000, '0.5 token should be allowed to spend');
    //     }).then(function () {
    //         return token.balanceOf.call(investors[1]);
    //     }).then(function(balance) {
    //         balances[investors[1]] = balance.valueOf();
    //
    //         return token.transferFrom(investors[1], investors[2], 700000000000000000, {from: investors[0]}); //0.7 token
    //     }).then(function () {
    //         return token.balanceOf.call(investors[1])
    //     }).then(function(balance) {
    //         return assert.equal(balance.valueOf(), balances[investors[1]], 'Transfer should fail. To much tokens to send.');
    //     }).then(function() {
    //         return token.transferFrom(investors[1], investors[2], 500000000000000000, {from: investors[0]}); //0.5 token
    //     }).then(function() {
    //         return token.allowance(investors[1], investors[0]);
    //     }).then(function(remaining) {
    //         return assert.equal(remaining.valueOf(), 0, '0 token should be allowed to spend');
    //     }).then(function () {
    //         return token.transfer.call(investors[1], 1000000000000000000,  {from: RESERVE_ADDRES});
    //     }).catch(function (error) {
    //         var reverted = error.message.search('VM Exception while processing transaction: revert') >= 0;
    //         return assert(reverted,
    //             'Transaction should be reverted. Can\'t use reserve now.');
    //     }).then(function (tx) {
    //         return token.totalSupply.call();
    //     }).then(function(totalSupply) {
    //         return assert.equal(totalSupply.valueOf(), 272300000130000000000000000,
    //             'After burning of unsold tokens total supply should be 272300000.130000000000000000 tokens');
    //     });
    // });
    //
    // it('Test referalls bonus', function() {
    //     var unilotInvestors;
    //     var token;
    //     var investors = [
    //         accounts[index++],
    //         accounts[index++],
    //         accounts[index++],
    //         accounts[index++],
    //         accounts[index++],
    //         accounts[index++],
    //         accounts[index++]
    //     ];
    //
    //     return UnilotInvestors.new().then(function(instance) {
    //         unilotInvestors = instance;
    //
    //         return unilotInvestors.add(investors[0], state.REGISTERED, 0);
    //     }).then(function(tx) {
    //         return unilotInvestors.add(investors[1], state.REGISTERED, investors[0]);
    //     }).then(function(tx) {
    //         return unilotInvestors.add(investors[2], state.REGISTERED, investors[1]);
    //     }).then(function(tx) {
    //         return unilotInvestors.add(investors[3], state.REGISTERED, investors[2]);
    //     }).then(function(tx) {
    //         return unilotInvestors.add(investors[4], state.REGISTERED, investors[3]);
    //     }).then(function(tx) {
    //         return unilotInvestors.add(investors[5], state.REGISTERED, investors[4]);
    //     }).then(function(tx) {
    //         return unilotInvestors.add(investors[6], state.REGISTERED, investors[5]);
    //     }).then(function (tx) {
    //         return UnilotToken.new(unilotInvestors.address, true);
    //     }).then(function (instance) {
    //         token = instance;
    //
    //         return token.sendTransaction({
    //             from: investors[6],
    //             value: web3.toWei(1, 'ether')
    //         });
    //     }).then(function (tx) {
    //         return token.balanceOf.call(investors[5]);
    //     }).then(function(balance) {
    //         return assert.equal(balance.valueOf(), 632911392405063300000,
    //             'Level 1 referrer should receive bonus equal to 5% of bought tokens');
    //     }).then(function (tx) {
    //         return token.balanceOf.call(investors[4]);
    //     }).then(function(balance) {
    //         return assert.equal(balance.valueOf(), 506329113924050640000,
    //             'Level 2 referrer should receive bonus equal to 4% of bought tokens');
    //     }).then(function (tx) {
    //         return token.balanceOf.call(investors[3]);
    //     }).then(function(balance) {
    //         return assert.equal(balance.valueOf(), 379746835443037980000,
    //             'Level 3 referrer should  receive bonus equal to 3% of bought tokens');
    //     }).then(function (tx) {
    //         return token.balanceOf.call(investors[2]);
    //     }).then(function(balance) {
    //         return assert.equal(balance.valueOf(), 253164556962025320000,
    //             'Level 4 referrer should receive bonus equal to 2% of bought tokens');
    //     }).then(function (tx) {
    //         return token.balanceOf.call(investors[1]);
    //     }).then(function(balance) {
    //         return assert.equal(balance.valueOf(), 126582278481012660000,
    //             'Level 5 referrer should receive bonus equal to 1% of bought tokens');
    //     }).then(function (tx) {
    //         return token.balanceOf.call(investors[0]);
    //     }).then(function(balance) {
    //         return assert.equal(balance.valueOf(), 0,
    //             'Referrer of level > 5 should have no bonus');
    //     });
    });
});