var PreSaleUNIT = artifacts.require('PreSaleUNIT');
var UnilotToken = artifacts.require('UnilotToken');
var ExternalCurrencyPrice = artifacts.require('ExternalCurrencyPrice');
var bigInt = require('big-integer');

contract('PreSaleUNIT', function(accounts) {
    var EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
    var coinbase = web3.eth.coinbase;
    var index = 1;

    function pause(milliseconds) {
        var dt = new Date();
        while ((new Date()) - dt <= milliseconds) { /* Do nothing */
        }
    }

    it('Checking balance inheritance', function () {
        var initialToken;
        var preSaleToken;

        var investorsTokenBalance = 0;

        return UnilotToken.deployed().then(function (instance) {
            initialToken = instance;

            return PreSaleUNIT.deployed(initialToken);
        }).then(function (instance) {
            preSaleToken = instance;

            return initialToken.sendTransaction({
                from: accounts[index],
                value: web3.toWei(1, 'ether')
            });
        }).then(function (tx) {
            return initialToken.balanceOf.call(accounts[index]);
        }).then(function (balance) {
            investorsTokenBalance = bigInt(balance.valueOf());
        }).then(function () {
            return preSaleToken.balanceOf.call(accounts[index]);
        }).then(function (balance) {
            assert.equal(investorsTokenBalance.compare(bigInt(balance.valueOf())), 0,
                'Balance of user should be inherited from main token.')
        });
    });

    it('Balance in token and pre-sale token should accumulate', function() {
        var initialToken;
        var preSaleToken;
        var tokenPrice = web3.toWei(79, 'szabo');
        var ownedTokens = 0;

        //Amount of tokens for 1 ether + 40%
        var boughtNewTokens = bigInt('17721518987341772151897');

        var investorsTokenBalance = 0;

        return UnilotToken.deployed().then(function (instance) {
            initialToken = instance;

            return PreSaleUNIT.new(initialToken.address);
        }).then(function (instance) {
            preSaleToken = instance;

            return preSaleToken.sendTransaction({
                from: accounts[index],
                value: web3.toWei(1, 'ether')
            });
        }).then(function(tx) {
            return initialToken.balanceOf.call(accounts[index]);
        }).then(function(balance) {
            ownedTokens = bigInt(balance.valueOf());
            return preSaleToken.balanceOf.call(accounts[index]);
        }).then(function (balance) {
            return assert.equal(ownedTokens.plus(boughtNewTokens).compare(bigInt(balance.valueOf())), 0,
                'Amount of tokens should be merged');
        });
    });

    it('Transfer should not work', function() {
        var initialToken;
        var preSaleToken;

        var investorsTokenBalance = 0;

        return UnilotToken.deployed().then(function (instance) {
            initialToken = instance;

            return PreSaleUNIT.deployed(initialToken);
        }).then(function (instance) {
            preSaleToken = instance;

            return preSaleToken.balanceOf.call(accounts[3]);
        }).then(function(balance) {
            investorsTokenBalance = bigInt(balance.valueOf());

            return preSaleToken
                .transfer(accounts[3], bigInt('1000000000000000000000').toString(), {
                from: accounts[1]
            });
        }).then(function (transferResult) {
            return preSaleToken.balanceOf.call(accounts[3]);
        }).then(function (balance) {
            return assert.equal( investorsTokenBalance.compare(bigInt(balance.valueOf())), 0,
                'Balance should not change after failed transfer.'
            );
        });
    });

    it('Approve should not work', function() {
        var initialToken;
        var preSaleToken;

        var donerTokenBalance = 0;
        var receiverTokenBalance = 0;

        return UnilotToken.deployed().then(function (instance) {
            initialToken = instance;

            return PreSaleUNIT.deployed(initialToken);
        }).then(function (instance) {
            preSaleToken = instance;

            return preSaleToken.balanceOf.call(accounts[1]);
        }).then(function(balance) {
            donerTokenBalance = bigInt(balance.valueOf());

            return preSaleToken.balanceOf.call(accounts[4]);
        }).then(function(balance){
            receiverTokenBalance = bigInt(balance.valueOf());

            return preSaleToken
                .approve(accounts[3], bigInt('1000000000000000000000').toString(), {
                from: accounts[1]
            });
        }).then(function (transferResult) {
            return preSaleToken.allowance.call(accounts[1], accounts[3]);
        }).then(function (allowedAmount) {
            return assert.equal( allowedAmount.valueOf(), 0,
                'Allowance method should always return 0.'
            );
        }).then(function() {
            return preSaleToken.transferFrom(accounts[1], accounts[4], bigInt('500000000000000000000').toString(), {
                from: accounts[3]
            });
        }).then(function () {
            return preSaleToken.balanceOf.call(accounts[1]);
        }).then(function (balance) {
            return assert.equal(donerTokenBalance.compare(bigInt(balance.valueOf())), 0,
                'Tokens should not transfer. Balance of all pariticpants should not change.');
        }).then(function () {
            return preSaleToken.balanceOf.call(accounts[4]);
        }).then(function (balance) {
            return assert.equal(receiverTokenBalance.compare(bigInt(balance.valueOf())), 0,
                'Tokens should not transfer. Balance of all pariticpants should not change.');
        });
    });

    it('All ether should be transfered to storage', function() {
        var initialToken;
        var preSaleToken;

        var donerTokenBalance = 0;
        var receiverTokenBalance = 0;

        return UnilotToken.deployed().then(function (instance) {
            initialToken = instance;

            return PreSaleUNIT.deployed(initialToken);
        }).then(function (instance) {
            preSaleToken = instance;

            return preSaleToken.sendTransaction({
                from: accounts[3],
                value: web3.toWei(0.1, 'ether')
            });
        }).then(function (tx) {
            var _tx = tx;
            return web3.eth.getBalance(preSaleToken.address);
        }).then(function (balance) {
            return assert.equal(0, balance.valueOf(),
                'Balance of contract after money transfer should always be 0.')
        });
    });

    it('Payment with BTC', function() {
        var initialToken;
        var preSaleToken;
        var currencyProcessor;

        var startTokenBalance = 0;

        return UnilotToken.deployed().then(function (instance) {
            initialToken = instance;

            return PreSaleUNIT.deployed(initialToken);
        }).then(function (instance) {
            preSaleToken = instance;

            return ExternalCurrencyPrice.deployed();
        }).then(function(instance) {
            currencyProcessor = instance;

            return currencyProcessor.setPrice('BTC', 7115, 8);
        }).then(function(tx){
            preSaleToken.setExternalCurrencyProcessor(currencyProcessor.address);
        }).then(function (tx) {
            return preSaleToken.balanceOf.call(accounts[4]);
        }).then(function (balance) {
            startTokenBalance = bigInt(balance.valueOf());

            return preSaleToken.paymentWithCurrency(accounts[4], 'BTC', 100000000, '123123123');
        }).then(function(tx) {
            var _tx = tx;
            return preSaleToken.balanceOf.call(accounts[4]);
        }).then(function (balance) {
            var result = bigInt(balance.valueOf());

            assert.equal(parseInt(result.minus(startTokenBalance).toString()), 19676739283204497540407,
                'Number of tokens should be 14+k');
        });
    });

    //Paying for investment with service
    it('Pay with units', function () {
        var initialToken;
        var preSaleToken;
        var currencyProcessor;
        var unitRate = bigInt('139999999999');
        var rateDecimals = 12;
        var expectedAmount = bigInt(250000 * Math.pow(10, rateDecimals));

        var startTokenBalance = 0;

        return UnilotToken.deployed().then(function (instance) {
            initialToken = instance;

            return PreSaleUNIT.deployed(initialToken);
        }).then(function (instance) {
            preSaleToken = instance;

            return ExternalCurrencyPrice.deployed();
        }).then(function(instance) {
            currencyProcessor = instance;

            return currencyProcessor.setPrice('UNIT', unitRate.toString(), rateDecimals);
        }).then(function(tx){
            preSaleToken.setExternalCurrencyProcessor(currencyProcessor.address);
        }).then(function (tx) {
            return preSaleToken.balanceOf.call(accounts[5]);
        }).then(function (balance) {
            startTokenBalance = bigInt(balance.valueOf());

            console.log(expectedAmount.toString());
            return preSaleToken.paymentWithCurrency(
                accounts[5], 'UNIT', expectedAmount.toString(),
                'UNITs for advertisement');
        }).then(function(tx) {
            return preSaleToken.balanceOf.call(accounts[5]);
        }).then(function (balance) {
            var result = bigInt(balance.valueOf());

            assert.equal(parseInt(result.minus(startTokenBalance).toString()),
                2500000000017857142857269, //250 000.0000017857142857269
                'Number of tokens should be 250 000.0000017857142857269');
        })
    });
});