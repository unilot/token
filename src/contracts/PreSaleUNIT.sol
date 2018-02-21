pragma solidity ^0.4.18;

import "./UnilotToken.sol";
import "./ERC20Contract.sol";
import "./ExternalCurrencyPrice.sol";

contract PreSaleUNIT is ERC20Contract {
    ERC20[3] internal tokens;

    ExternalCurrencyPrice externalCurrencyProcessor;

    uint88 pool = 24000000000000000000000000; //24 mln tokens

    uint32 internal endDate = 1519326000;  //22 February 2018 19:00 UTC

    uint8 internal discount = 40;          //40%

    address internal owner;

    event AddToken(address NewToken, uint8 index);
    event BuyTokensDirect(address buyer, uint72 eth_amount, uint88 paid_amount, uint88 bonus_amount);
    event BuyTokensExternal(address buyer, string currency, uint72 amount, uint88 paid_amount, uint88 bonus_amount);
    event ChangeDate(uint32 new_date);
    event ChangeDiscount(uint8 new_discount);
    event ChangePool(uint88 new_pool);

    modifier onlyAdministrator() {
        require(tx.origin == owner);
        _;
    }

    modifier notAdministrator() {
        require(tx.origin != owner);
        _;
    }

    modifier poolIsNotEmpty() {
        require(pool > 0);
        _;
    }

    modifier didntRanOutOfTime() {
        require(uint32(now) <= endDate);
        _;
    }

    function PreSaleUNIT(ERC20 _token)
        public
    {
        tokens[0] = _token;
        owner = tx.origin;
    }

    function getOwner()
        public
        constant
        returns (address)
    {
        return owner;
    }

    function getTokens()
        public
        constant
        returns(ERC20[3])
    {
        return tokens;
    }

    function getPool()
        public
        constant
        returns(uint88)
    {
        return pool;
    }

    function getBaseToken()
        public
        constant
        returns(UnilotToken _token)
    {
        _token = UnilotToken(tokens[0]);
    }

    function getExternalCurrencyProcessor()
        public
        onlyAdministrator
        returns(ExternalCurrencyPrice)
    {
        return externalCurrencyProcessor;
    }

    //Admin fns
    function addToken(ERC20 _token)
        public
        onlyAdministrator
    {
        require(_token != address(0));

        for(uint8 i = 0; i < tokens.length; i++) {
            if (tokens[i] == _token) {
                break;
            } else if (tokens[i] == address(0)) {
                tokens[i] = _token;
                AddToken(_token, i);
                break;
            }
        }
    }

    function changeEndDate(uint32 _endDate)
        public
        onlyAdministrator
    {
        endDate = _endDate;
        ChangeDate(endDate);
    }

    function changeDiscount(uint8 _discount)
        public
        onlyAdministrator
    {
        discount = _discount;
        ChangeDiscount(discount);
    }

    function changePool(uint88 _pool)
        public
        onlyAdministrator
    {
        pool = _pool;
        ChangePool(pool);
    }

    function setExternalCurrencyProcessor(ExternalCurrencyPrice processor)
        public
        onlyAdministrator
    {
        externalCurrencyProcessor = processor;
    }

    function paymentWithCurrency(address buyer, string currency, uint64 value, string transactionId)
        public
        onlyAdministrator
        poolIsNotEmpty
        didntRanOutOfTime
    {
        require(buyer != owner);

        ExternalCurrencyPrice processor = getExternalCurrencyProcessor();
        uint88 paid_tokens = processor.calculateAmount(currency, value);
        uint88 bonus_tokens = uint88((paid_tokens * discount) / 100);
        uint88 refund_amount = 0;

        if((paid_tokens + bonus_tokens) > pool) {
            paid_tokens = uint88( pool / ( ( 100 + discount ) / 100 ) );
            bonus_tokens = uint88( pool - paid_tokens );
            refund_amount = ( value - processor.calculatePrice(currency, paid_tokens) );
        }

        balances[buyer] += uint96(paid_tokens + bonus_tokens);

        BuyTokensExternal(buyer, currency, value, paid_tokens, bonus_tokens);

        uint processorTransactionId = processor.addTransaction(currency, value, transactionId);

        if ( refund_amount > 0 ) {
            processor.addRefundTransaction(processorTransactionId, refund_amount);
        }
    }
    //END Admin fns

    //ERC20
    function totalSupply()
        public
        constant
        returns (uint)
    {
        return uint(tokens[0].totalSupply());
    }

    function balanceOf(address _owner)
        public
        constant
        returns (uint balance)
    {
        balance = super.balanceOf(_owner);

        for ( uint8 i = 0; i < tokens.length; i++ ) {
            if (tokens[i] == address(0)) {
                break;
            }

            balance += uint96(tokens[i].balanceOf(_owner));
        }
    }

    function transfer(address _to, uint _amount)
        public
        returns (bool success)
    {
        success = false;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    )
        public
        returns (bool success)
    {
        success = false;
    }

    function approve(address _spender, uint _amount)
        public
        returns (bool success)
    {
        success = false;
    }

    function allowance(address _owner, address _spender)
        public
        constant
        returns (uint remaining)
    {
        remaining = 0;
    }
    //END ERC20

    function()
        public
        payable
        notAdministrator
        poolIsNotEmpty
        didntRanOutOfTime
    {
        UnilotToken baseToken = getBaseToken();

        address storageWallet = baseToken.STORAGE_WALLET();
        uint48 price = uint48(baseToken.price());
        uint72 eth_amount = uint72(msg.value);
        uint64 accuracy = uint64( baseToken.accuracy() );
        uint88 paid_tokens = uint88( ( uint(eth_amount) * accuracy / price ) );
        uint88 bonus_tokens = uint88((paid_tokens * discount) / 100);

        if((paid_tokens + bonus_tokens) > pool) {
            paid_tokens = uint88( pool / ( ( 100 + discount ) / 100 ) );
            bonus_tokens = uint88( pool - paid_tokens );
            eth_amount = uint72( (paid_tokens / accuracy) * price );
            msg.sender.transfer( msg.value - eth_amount );
        }

        BuyTokensDirect(msg.sender, eth_amount, paid_tokens, bonus_tokens);

        balances[msg.sender] += uint96(paid_tokens + bonus_tokens);

        storageWallet.transfer(this.balance);
    }
}
