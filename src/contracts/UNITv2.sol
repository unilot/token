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
    uint96 public _totalSupply = uint96(500000000 * (10^18));

    UnilotToken sourceToken;

    Whitelist transferWhiteList;

    PaymentGateway[] paymentGateways;

    TokenStagesManager

    mapping(address => uint8) paymentGatewaysIndex;

    //tokenImport[tokenHolder][sourceToken] = true/false;
    mapping ( address => mapping ( address => bool ) ) tokenImport;

    event TokensImported(address tokenHolder, uint96 amount, address source);

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

        //Tx: 0xec9b7b4c0f1435282e2e98a66efbd7610de7eacce3b2448cd5f503d70a64a895
        balances[0xE33305B2EFbcB302DA513C38671D01646651a868] += 1400000000000000000;

        //Tx: 0x95fd098284132e732cefdbcae7786bf91a341ff82d1b28062fc61ec3c4ebb94e
        balances[0xf85FF2542dAF28E3fd5387F52aD63462ADAbEA77] += 7886075949367088607594;

        //Tx: 0x28ec6266322ee874a94ac8d819c0d798ffcd986c0296a75e93832ce759b2c2b3
        balances[0x979E0aA08799A3FB61146dCC1d209A36c548052d] += 2800000000000000000000;
    }

    function setTransferWhitelist(address whiteListAddress)
        public
        onlyAdministrator
    {
        transferWhiteList = Whitelist(whiteListAddress);
    }

    function disableTransferWhitelist()
        public
        onlyAdministrator
    {
        transferWhiteList = Whitelist(address(0));
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
        public
        onlyAdministrator
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

    //Imports from provided token
    function importTokensSourceBulk(ERC20 _sourceToken, address[] _tokenHolders)
        public
        onlyAdministrator
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
        returns (bool success)
    {
        if (!isImported(sourceToken, msg.sender)) {
            importTokensFromSourceToken(msg.sender);
        }

        return super.transfer(_to, _amount);
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    )
        public
        returns (bool success)
    {
        if (!isImported(sourceToken, msg.sender)) {
            importTokensFromSourceToken(msg.sender);
        }

        return super.transferFrom(_from, _to, _amount);
    }
    //END ERC20

    function delegateTokens(address tokenHolder, uint96 amount)
        public
    {

    }
}
