var ExternalCurrencyPrice = artifacts.require('ExternalCurrencyPrice');
var bigInt = require('big-integer');

contract('ExternalCurrencyPrice', function(accounts) {
    var EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
    var coinbase = web3.eth.coinbase;
    var index = 1;

    it('Adding currency', function () {
        var externalCurrencyPrice;
        var decimals = 8;
        var price = 7115;

        return ExternalCurrencyPrice.deployed().then(function (instance) {
            externalCurrencyPrice = instance;

            return externalCurrencyPrice.setPrice("BTC", price, decimals);
        }).then(function (tx) {
            return externalCurrencyPrice.getPrice.call("BTC");
        }).then(function (_price) {
            var _value = _price[0];
            var _decimals = _price[1];

            assert.equal(price, _value.valueOf(),
                'Price should be: ' + (price / (10^decimals)) + ' BTC');
            assert.equal(decimals, _decimals.valueOf(),
                'Accuracy should be ' + decimals + ' decimals.')
        });
    });

    it('Testing amount calculation', function () {
        var externalCurrencyPrice;
        var decimals = 8;
        var price = 7115;
        var targetAmount = bigInt('14054813773717498243148');

        return ExternalCurrencyPrice.deployed().then(function (instance) {
            externalCurrencyPrice = instance;

            return externalCurrencyPrice.setPrice("BTC", price, decimals);
        }).then(function (tx) {
            //1 BTC
            return externalCurrencyPrice.calculateAmount.call(
                "BTC", bigInt( Math.pow(10, decimals) ).toString() );
        }).then(function (amount) {
            return assert.equal(targetAmount.compare(bigInt(amount.valueOf())), 0,
                'Price should be: ' + (price / (10^decimals)) + ' BTC');
        });
    });

    it('Add transaction', function () {
        var externalCurrencyPrice;
        var decimals = 8;
        var price = 7115;
        var transactionId = '123123123123';
        var currency = 'BTC';
        var transactionValue = bigInt( Math.pow(10, decimals) );

        return ExternalCurrencyPrice.deployed().then(function (instance) {
            externalCurrencyPrice = instance;

            return externalCurrencyPrice.setPrice(currency, price, decimals);
        }).then(function (tx) {
            //1 BTC
            return externalCurrencyPrice.addTransaction(
                currency, transactionValue.toString(), transactionId );
        }).then(function(tx) {
            return externalCurrencyPrice.setPrice(currency, price + 10, decimals);
        }).then(function (tx) {
            return externalCurrencyPrice.getNumTransactions.call();
        }).then(function (numTransactions) {
            return externalCurrencyPrice
                .transactions.call(parseInt(numTransactions.valueOf()) - 1);
        }).then(function (transaction) {
            var tCurrency = transaction[0].valueOf();
            var tValue = bigInt(transaction[1].valueOf());
            var tTransactionId = transaction[2].valueOf();
            var tPrice = transaction[3].valueOf();
            var tDecimals = transaction[4].valueOf();

            assert.equal(currency, tCurrency, 'Currency was BTC at transaction point');
            assert.equal(transactionValue.compare(tValue), 0, 'Value was 1 BTC');
            assert.equal(transactionId, tTransactionId, 'Transaction ID should match');
            assert.equal(price, parseInt(tPrice), 'Price should not change');
            assert.equal(decimals, parseInt(tDecimals), 'Price should be 8 decimals');
        });
    });

    it('Add refund transaction', function () {
        var externalCurrencyPrice;
        var decimals = 8;
        var price = 7115;
        var transactionId = '123123123123';
        var currency = 'BTC';
        var transactionValue = bigInt( Math.pow(10, decimals) );
        var sourceTransaction;

        return ExternalCurrencyPrice.deployed().then(function (instance) {
            externalCurrencyPrice = instance;

            return externalCurrencyPrice.setPrice(currency, price, decimals);
        }).then(function (tx) {
            //1 BTC
            return externalCurrencyPrice.addTransaction(
                currency, transactionValue.toString(), transactionId );
        }).then(function (tx) {
            return externalCurrencyPrice.getNumTransactions.call();
        }).then(function(numTransactions) {
            sourceTransaction = parseInt(numTransactions.valueOf()) - 1;

            //Refund 50%
            return externalCurrencyPrice
                .addRefundTransaction(sourceTransaction,
                    transactionValue.multiply(50).divide(100).toString());
        }).then(function () {
            return externalCurrencyPrice.getNumRefundTransactions.call();
        }).then(function (numRefundTransactions) {
            return externalCurrencyPrice.refundTransactions.call(
                ( parseInt(numRefundTransactions.valueOf()) - 1 )
            );
        }).then(function (transaction) {
            var tSourceTransaction = parseInt(transaction[0].valueOf());
            var tValue = bigInt(transaction[1].valueOf());

            assert.equal( sourceTransaction, tSourceTransaction, 'Refund should point at correct initial transaction');
            assert.equal(transactionValue.multiply(50).divide(100).compare(tValue), 0,
                'Is valid refund amount')
        });
    });
});