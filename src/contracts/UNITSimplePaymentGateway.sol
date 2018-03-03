pragma solidity ^0.4.18;

import './interfaces/PaymentGateway.sol';
import './interfaces/TokenStagesManager.sol';
import './Administrated.sol';
import './UNITv2.sol';


contract UNITSimplePaymentGateway is PaymentGateway, Administrated {
    UNITv2 public token;

    bool public locked = false;

    uint48 public constant PRICE = 79 szabo;

    address public storageAddress = 0x1b5DE6153c86F92a63A680896e9F088943c0Ead8;

    event Payment(address indexed payer, uint amount, uint refund, uint96 numTokens);

    function UNITSimplePaymentGateway(address _token)
        public
    {
        token = UNITv2(_token);
        setAdministrator(tx.origin);
    }

    function ()
        public
        payable
    {
        require(locked == false);

        TokenStagesManager stagesManager = token.stagesManager();

        uint maxAmount = uint( ( uint(stagesManager.getPool()) * PRICE ) / (10**18) );
        uint refund = 0;

        if ( maxAmount < msg.value ) {
            refund = msg.value - maxAmount;
        }

        uint96 numTokens = uint96( ( ( msg.value - refund ) * (10**18) ) / PRICE );

        Payment(msg.sender, msg.value, refund, numTokens);

        token.delegateTokens(msg.sender, numTokens);

        msg.sender.transfer(refund);
        storageAddress.transfer(this.balance);
    }

    function lock()
        public
        onlyAdministrator
    {
        locked = true;
    }

    function unlock()
        public
        onlyAdministrator
    {
        locked = false;
    }
}
