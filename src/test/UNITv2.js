var PreSaleUNIT = artifacts.require('PreSaleUNIT');
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

    it('Token transfer', function() {
        // var token =
    })
});