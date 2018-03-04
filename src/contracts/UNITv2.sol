pragma solidity ^0.4.18;

import './UNIT.sol';
import './ERC20Contract.sol';
import './interfaces/TokenStagesManager.sol';
import './interfaces/Whitelist.sol';
import './interfaces/PaymentGateway.sol';
import './Administrated.sol';


contract UNITv2 is ERC20Contract,Administrated {
    //Token symbol
    string public constant symbol = "UNIT";
    //Token name
    string public constant name = "Unilot token";
    //It can be reeeealy small
    uint8 public constant decimals = 18;

    //Total supply 500mln in the start
    uint96 public _totalSupply = uint96(500000000 * (10**18));

    UnilotToken public sourceToken;

    Whitelist public transferWhiteList;

    Whitelist public paymentGateways;

    TokenStagesManager public stagesManager;

    bool public unlocked = false;

    bool public burned = false;

    //tokenImport[tokenHolder][sourceToken] = true/false;
    mapping ( address => mapping ( address => bool ) ) public tokenImport;

    event TokensImported(address indexed tokenHolder, uint96 amount, address indexed source);
    event TokensDelegated(address indexed tokenHolder, uint96 amount, address indexed source);
    event Unlocked();
    event Burned(uint96 amount);

    modifier isLocked() {
        require(unlocked == false);
        _;
    }

    modifier isNotBurned() {
        require(burned == false);
        _;
    }

    modifier isTransferAllowed(address _from, address _to) {
        if ( sourceToken.RESERVE_WALLET() == _from ) {
            require( stagesManager.isFreezeTimeout() );
        }
        require(unlocked
                || ( stagesManager != address(0) && stagesManager.isCanList() )
                || ( transferWhiteList != address(0) && ( transferWhiteList.isInList(_from) || transferWhiteList.isInList(_to) ) )
        );
        _;
    }

    function UNITv2(address _sourceToken)
        public
    {
        setAdministrator(tx.origin);
        sourceToken = UnilotToken(_sourceToken);

        /*Transactions:
        0x99c28675adbd0d0cb7bd783ae197492078d4063f40c11139dd07c015a543ffcc
        0x86038d11ee8da46703309d2fb45d150f1dc4e2bba6d0a8fee158016111104ff1
        0x0340a8a2fb89513c0086a345973470b7bc33424e818ca6a32dcf9ad66bf9d75c
        */
        balances[0xd13289203889bD898d49e31a1500388441C03663] += 1400000000000000000 * 3;
        markAsImported(0xdBF98dF5DAd9077f457e1dcf85Aa9420BcA8B761, 0xd13289203889bD898d49e31a1500388441C03663);

        //Tx: 0xec9b7b4c0f1435282e2e98a66efbd7610de7eacce3b2448cd5f503d70a64a895
        balances[0xE33305B2EFbcB302DA513C38671D01646651a868] += 1400000000000000000;
        markAsImported(0xdBF98dF5DAd9077f457e1dcf85Aa9420BcA8B761, 0xE33305B2EFbcB302DA513C38671D01646651a868);

        //Assigning bounty
        balances[0x794EF9c680bDD0bEf48Bef46bA68471e449D67Fb] += uint96(
            ( uint(_totalSupply) * uint8( sourceToken.DST_BOUNTY() ) ) / 100
        );

        //Don't import bounty and R&B tokens
        markAsImported(0xdBF98dF5DAd9077f457e1dcf85Aa9420BcA8B761, 0x794EF9c680bDD0bEf48Bef46bA68471e449D67Fb);
        markAsImported(sourceToken, 0x794EF9c680bDD0bEf48Bef46bA68471e449D67Fb);

        markAsImported(0xdBF98dF5DAd9077f457e1dcf85Aa9420BcA8B761, 0x91D740D87A8AeED1fc3EA3C346843173c529D63e);
    }

    function setTransferWhitelist(address whiteListAddress)
        public
        onlyAdministrator
        isNotBurned
    {
        transferWhiteList = Whitelist(whiteListAddress);
    }

    function disableTransferWhitelist()
        public
        onlyAdministrator
        isNotBurned
    {
        transferWhiteList = Whitelist(address(0));
    }

    function setStagesManager(address stagesManagerContract)
        public
        onlyAdministrator
        isNotBurned
    {
        stagesManager = TokenStagesManager(stagesManagerContract);
    }

    function setPaymentGatewayList(address paymentGatewayListContract)
        public
        onlyAdministrator
        isNotBurned
    {
        paymentGateways = Whitelist(paymentGatewayListContract);
    }

    //START Import related methods
    function isImported(address _sourceToken, address _tokenHolder)
        internal
        constant
        returns (bool)
    {
        return tokenImport[_tokenHolder][_sourceToken];
    }

    function markAsImported(address _sourceToken, address _tokenHolder)
        internal
    {
        tokenImport[_tokenHolder][_sourceToken] = true;
    }

    function importFromSource(ERC20 _sourceToken, address _tokenHolder)
        internal
    {
        if ( !isImported(_sourceToken, _tokenHolder) ) {
            uint96 oldBalance = uint96(_sourceToken.balanceOf(_tokenHolder));
            balances[_tokenHolder] += oldBalance;
            markAsImported(_sourceToken, _tokenHolder);

            TokensImported(_tokenHolder, oldBalance, _sourceToken);
        }
    }

    //Imports from source token
    function importTokensFromSourceToken(address _tokenHolder)
        internal
    {
        importFromSource(ERC20(sourceToken), _tokenHolder);
    }

    function importFromExternal(ERC20 _sourceToken, address _tokenHolder)
        public
        onlyAdministrator
        isNotBurned
    {
        return importFromSource(_sourceToken, _tokenHolder);
    }

    //Imports from provided token
    function importTokensSourceBulk(ERC20 _sourceToken, address[] _tokenHolders)
        public
        onlyAdministrator
        isNotBurned
    {
        require(_tokenHolders.length <= 256);

        for (uint8 i = 0; i < _tokenHolders.length; i++) {
            importFromSource(_sourceToken, _tokenHolders[i]);
        }
    }
    //END Import related methods

    //START ERC20
    function totalSupply()
        public
        constant
        returns (uint)
    {
        return uint(_totalSupply);
    }

    function balanceOf(address _owner)
        public
        constant
        returns (uint balance)
    {
        balance = super.balanceOf(_owner);

        if (!isImported(sourceToken, _owner)) {
            balance += sourceToken.balanceOf(_owner);
        }
    }

    function transfer(address _to, uint _amount)
        public
        isTransferAllowed(msg.sender, _to)
        returns (bool success)
    {
        return super.transfer(_to, _amount);
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    )
        public
        isTransferAllowed(_from, _to)
        returns (bool success)
    {
        return super.transferFrom(_from, _to, _amount);
    }

    function approve(address _spender, uint _amount)
        public
        isTransferAllowed(msg.sender, _spender)
        returns (bool success)
    {
        return super.approve(_spender, _amount);
    }
    //END ERC20

    function delegateTokens(address tokenHolder, uint96 amount)
        public
        isNotBurned
    {
        require(paymentGateways.isInList(msg.sender));
        require(stagesManager.isICO());
        require(stagesManager.getPool() >= amount);

        uint88 bonus = stagesManager.calculateBonus(amount);
        stagesManager.delegateFromPool(amount);

        balances[tokenHolder] += amount + uint96(bonus);

        TokensDelegated(tokenHolder, amount, msg.sender);
    }

    function delegateBonusTokens(address tokenHolder, uint88 amount)
        public
        isNotBurned
    {
        require(paymentGateways.isInList(msg.sender) || tx.origin == administrator);
        require(stagesManager.getBonusPool() >= amount);

        stagesManager.delegateFromBonus(amount);

        balances[tokenHolder] += amount;

        TokensDelegated(tokenHolder, uint96(amount), msg.sender);
    }

    function delegateReferalTokens(address tokenHolder, uint88 amount)
        public
        isNotBurned
    {
        require(paymentGateways.isInList(msg.sender) || tx.origin == administrator);
        require(stagesManager.getReferralPool() >= amount);

        stagesManager.delegateFromReferral(amount);

        balances[tokenHolder] += amount;

        TokensDelegated(tokenHolder, amount, msg.sender);
    }

    function delegateReferralTokensBulk(address[] tokenHolders, uint88[] amounts)
        public
        isNotBurned
    {
        require(paymentGateways.isInList(msg.sender) || tx.origin == administrator);
        require(tokenHolders.length <= 256);
        require(tokenHolders.length == amounts.length);

        for ( uint8 i = 0; i < tokenHolders.length; i++ ) {
            delegateReferalTokens(tokenHolders[i], amounts[i]);
        }
    }

    function unlock()
        public
        isLocked
        onlyAdministrator
    {
        unlocked = true;
        Unlocked();
    }

    function burn()
        public
        onlyAdministrator
    {
        require(!stagesManager.isICO());

        uint96 burnAmount = stagesManager.getPool()
                        + stagesManager.getBonusPool()
                        + stagesManager.getReferralPool();

        _totalSupply -= burnAmount;
        burned = true;
        Burned(burnAmount);
    }
}
