pragma solidity ^0.4.18;

import "contracts/interfaces/ERC20.sol";

contract ERC20Contract is ERC20 {
    //Token symbol
    string public constant symbol = "UNIT";

    //Token name
    string public constant name = "Unilot token";

    //It can be reeeealy small
    uint8 public constant decimals = 18;

    // Balances for each account
    mapping(address => uint96) public balances;

    // Owner of account approves the transfer of an amount to another account
    mapping(address => mapping (address => uint96)) allowed;

    function totalSupply()
        public
        constant
        returns (uint);


    // What is the balance of a particular account?
    function balanceOf(address _owner)
        public
        constant
        returns (uint balance)
    {
        return uint(balances[_owner]);
    }


    // Transfer the balance from owner's account to another account
    function transfer(address _to, uint _amount)
        public
        returns (bool success)
    {
        if (balances[msg.sender] >= _amount
            && _amount > 0
            && balances[_to] + _amount > balances[_to]) {
            balances[msg.sender] -= uint96(_amount);
            balances[_to] += uint96(_amount);
            Transfer(msg.sender, _to, _amount);

            return true;
        } else {
            return false;
        }
    }


    // Send _value amount of tokens from address _from to address _to
    // The transferFrom method is used for a withdraw workflow, allowing contracts to send
    // tokens on your behalf, for example to "deposit" to a contract address and/or to charge
    // fees in sub-currencies; the command should fail unless the _from account has
    // deliberately authorized the sender of the message via some mechanism; we propose
    // these standardized APIs for approval:
    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    )
        public
        returns (bool success)
    {
        if (balances[_from] >= _amount
            && allowed[_from][msg.sender] >= _amount
            && _amount > 0
            && balances[_to] + _amount > balances[_to]) {
            balances[_from] -= uint96(_amount);
            allowed[_from][msg.sender] -= uint96(_amount);
            balances[_to] += uint96(_amount);
            Transfer(_from, _to, _amount);
            return true;
        } else {
            return false;
        }
    }


    // Allow _spender to withdraw from your account, multiple times, up to the _value amount.
    // If this function is called again it overwrites the current allowance with _value.
    function approve(address _spender, uint _amount)
        public
        returns (bool success)
    {
        allowed[msg.sender][_spender] = uint96(_amount);
        Approval(msg.sender, _spender, _amount);
        return true;
    }


    function allowance(address _owner, address _spender)
        public
        constant
        returns (uint remaining)
    {
        return allowed[_owner][_spender];
    }
}
