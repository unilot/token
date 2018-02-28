var UNITTransferWhiteList = artifacts.require('UNITTransferWhiteList');

contract('UNITTransferWhiteList', function(accounts) {
    var defaultWhitelist = [
        '0x77660795BD361Cd43c3627eAdad44dDc2026aD17',
        '0x794EF9c680bDD0bEf48Bef46bA68471e449D67Fb',
        '0x40e3D8fFc46d73Ab5DF878C751D813a4cB7B388D',
        '0x5E065a80f6635B6a46323e3383057cE6051aAcA0',
        '0x0cF3585FbAB2a1299F8347a9B87CF7B4fcdCE599',
        '0x5fDd3BA5B6Ff349d31eB0a72A953E454C99494aC',
        '0xC9be9818eE1B2cCf2E4f669d24eB0798390Ffb54',
        '0xd13289203889bD898d49e31a1500388441C03663'
    ];

    it('Check add method', function() {
        var Whitelist;

        return UNITTransferWhiteList.new().then(function (instance) {
            Whitelist = instance;

            return Whitelist.add(accounts[1]);
        }).then(function (tx) {
            return Whitelist.isInList.call(accounts[1]);
        }).then(function (isInList) {
            return assert.equal(isInList.valueOf(), true, 'Added user should be identified');
        })
    });

    it('Check remove method', function() {
        var Whitelist;

        return UNITTransferWhiteList.new().then(function (instance) {
            Whitelist = instance;

            return Whitelist.add(accounts[1]);
        }).then(function (tx) {
            return Whitelist.add(accounts[2]);
        }).then(function (tx) {
            return Whitelist.add(accounts[3]);
        }).then(function (tx) {
            return Whitelist.remove(accounts[2]);
        }).then(function (tx) {
            return Whitelist.isInList.call(accounts[1]);
        }).then(function (isInList) {
            return assert.equal(isInList.valueOf(), true, 'Added user should be identified');
        }).then(function (tx) {
            return Whitelist.isInList.call(accounts[2]);
        }).then(function (isInList) {
            return assert.equal(isInList.valueOf(), false, 'Removed user should not be in list');
        }).then(function (tx) {
            return Whitelist.isInList.call(accounts[3]);
        }).then(function (isInList) {
            return assert.equal(isInList.valueOf(), true, 'Added user should be identified');
        })
    });

    it('Check getAll method', function() {
        var Whitelist;

        return UNITTransferWhiteList.new().then(function (instance) {
            Whitelist = instance;

            return Whitelist.add(accounts[1]);
        }).then(function (tx) {
            return Whitelist.add(accounts[2]);
        }).then(function (tx) {
            return Whitelist.add(accounts[3]);
        }).then(function (tx) {
            return Whitelist.getAll.call();
        }).then(function (whitelist) {
            assert.equal(whitelist.length, (defaultWhitelist.length + 3), 'Number of users in whitelist should be 11');
            assert.equal(whitelist[defaultWhitelist.length + 2], accounts[3], 'Added account ' + accounts[3] + ' should be in list');
            assert.equal(whitelist[defaultWhitelist.length + 1], accounts[2], 'Added accounts ' + accounts[2] + ' should be in list');
            assert.equal(whitelist[defaultWhitelist.length], accounts[1], 'Added accounts ' + accounts[1] + ' should be in list');
        })
    });

    it('Check addBulk method', function() {
        var Whitelist;

        return UNITTransferWhiteList.new().then(function (instance) {
            Whitelist = instance;

            //Adding 3 wallets
            return Whitelist.addBulk([accounts[1], accounts[2], accounts[3]]);
        }).then(function (tx) {
            return Whitelist.isInList.call(accounts[1]);
        }).then(function (isInList) {
            return assert.equal(isInList.valueOf(), true, 'Added user should be identified');
        }).then(function (tx) {
            return Whitelist.isInList.call(accounts[2]);
        }).then(function (isInList) {
            return assert.equal(isInList.valueOf(), true, 'Added user should be identified');
        }).then(function (tx) {
            return Whitelist.isInList.call(accounts[3]);
        }).then(function (isInList) {
            return assert.equal(isInList.valueOf(), true, 'Added user should be identified');
        })
    });

    it('Check removeBulk method', function() {
        var Whitelist;

        return UNITTransferWhiteList.new().then(function (instance) {
            Whitelist = instance;

            //Adding 3 wallets
            return Whitelist.addBulk(
                [accounts[1], accounts[2], accounts[3], accounts[4], accounts[5]]);
        }).then(function (tx) {
            return Whitelist.removeBulk([accounts[2], accounts[3]]);
        }).then(function (tx) {
            return Whitelist.isInList.call(accounts[1]);
        }).then(function (isInList) {
            return assert.equal(isInList.valueOf(), true, 'Added user should be identified');
        }).then(function (tx) {
            return Whitelist.isInList.call(accounts[4]);
        }).then(function (isInList) {
            return assert.equal(isInList.valueOf(), true, 'Added user should be identified');
        }).then(function (tx) {
            return Whitelist.isInList.call(accounts[5]);
        }).then(function (isInList) {
            return assert.equal(isInList.valueOf(), true, 'Added user should be identified');
        }).then(function (tx) {
            return Whitelist.isInList.call(accounts[2]);
        }).then(function (isInList) {
            return assert.equal(isInList.valueOf(), false, 'Removed user should not be in list');
        }).then(function (tx) {
            return Whitelist.isInList.call(accounts[3]);
        }).then(function (isInList) {
            return assert.equal(isInList.valueOf(), false, 'Removed user should not be in list');
        });
    });

    it('Check default wallets', function() {
        var Whitelist;

        return UNITTransferWhiteList.new().then(function (instance) {
            Whitelist = instance;

            //Adding 3 wallets
            return Whitelist.getAll.call();
        }).then(function (whitelist) {
            for ( var i in defaultWhitelist ) {
                if ( !defaultWhitelist.hasOwnProperty(i) ) {
                    continue;
                }

                assert.equal(
                    whitelist[i].valueOf().toLowerCase(), defaultWhitelist[i].toLowerCase(), 'Wallet should be ' + defaultWhitelist[i]);
            }
        })
    });
});