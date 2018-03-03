pragma solidity ^0.4.18;

import './BasicWhitelist.sol';

contract UNITPaymentGatewayList is BasicWhitelist {
    function UNITPaymentGatewayList()
        public
    {
        setAdministrator(tx.origin);
    }
}
