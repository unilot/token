pragma solidity ^0.4.18;

import './BasicWhitelist.sol';


contract UNITTransferWhiteList is BasicWhitelist {
    function UNITTransferWhiteList()
        public
    {
        setAdministrator(tx.origin);

        add(0x77660795BD361Cd43c3627eAdad44dDc2026aD17); //Advisors
        add(0x794EF9c680bDD0bEf48Bef46bA68471e449D67Fb); //BountyWe accept different cryptocurrencies. You should have ETH wallet to get UNIT Tokens

        //Team
        add(0x40e3D8fFc46d73Ab5DF878C751D813a4cB7B388D);
        add(0x5E065a80f6635B6a46323e3383057cE6051aAcA0);
        add(0x0cF3585FbAB2a1299F8347a9B87CF7B4fcdCE599);
        add(0x5fDd3BA5B6Ff349d31eB0a72A953E454C99494aC);
        add(0xC9be9818eE1B2cCf2E4f669d24eB0798390Ffb54);
        add(0xd13289203889bD898d49e31a1500388441C03663);
    }
}
