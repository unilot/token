pragma solidity ^0.4.18;

import "contracts/interfaces/ERC20.sol";
import "contracts/interfaces/InvestorsPool.sol";

contract UnilotToken is ERC20 {
    struct TokenStage {
        string name;
        uint numCoinsStart;
        uint coinsAvailable;
        uint bonus;
        uint startsAt;
        uint endsAt;
        uint balance; //Amount of ether sent during this stage
    }

    //Token symbol
    string public constant symbol = "UNIT";
    //Token name
    string public constant name = "Unilot token";
    //It can be reeeealy small
    uint8 public constant decimals = 18;

    //This one duplicates the above but will have to use it because of
    //solidity bug with power operation
    uint public constant accuracy = 1000000000000000000;

    //500 mln tokens
    uint256 internal _totalSupply = 500 * (10**6) * accuracy;

    //Public investor can buy tokens for 30 ether at maximum
    uint256 public constant singleInvestorCap = 30 ether; //30 ether

    //Distribution units
    uint public constant DST_ICO     = 62; //62%
    uint public constant DST_RESERVE = 10; //10%
    uint public constant DST_BOUNTY  = 3;  //3%
    //Referral and Bonus Program
    uint public constant DST_R_N_B_PROGRAM = 10; //10%
    uint public constant DST_ADVISERS      = 5;  //5%
    uint public constant DST_TEAM          = 10; //10%

    //Referral Bonuses
    uint public constant REFERRAL_BONUS_LEVEL1 = 5; //5%
    uint public constant REFERRAL_BONUS_LEVEL2 = 4; //4%
    uint public constant REFERRAL_BONUS_LEVEL3 = 3; //3%
    uint public constant REFERRAL_BONUS_LEVEL4 = 2; //2%
    uint public constant REFERRAL_BONUS_LEVEL5 = 1; //1%

    //Token amount
    //25 mln tokens
    uint public constant TOKEN_AMOUNT_PRE_ICO = 25 * (10**6) * accuracy;
    //5 mln tokens
    uint public constant TOKEN_AMOUNT_ICO_STAGE1_PRE_SALE1 = 5 * (10**6) * accuracy;
    //5 mln tokens
    uint public constant TOKEN_AMOUNT_ICO_STAGE1_PRE_SALE2 = 5 * (10**6) * accuracy;
    //5 mln tokens
    uint public constant TOKEN_AMOUNT_ICO_STAGE1_PRE_SALE3 = 5 * (10**6) * accuracy;
    //5 mln tokens
    uint public constant TOKEN_AMOUNT_ICO_STAGE1_PRE_SALE4 = 5 * (10**6) * accuracy;
    //265 mln tokens
    uint public constant TOKEN_AMOUNT_ICO_STAGE2 = 265 * (10**6) * accuracy;

    uint public constant BONUS_PRE_ICO = 40; //40%
    uint public constant BONUS_ICO_STAGE1_PRE_SALE1 = 35; //35%
    uint public constant BONUS_ICO_STAGE1_PRE_SALE2 = 30; //30%
    uint public constant BONUS_ICO_STAGE1_PRE_SALE3 = 25; //25%
    uint public constant BONUS_ICO_STAGE1_PRE_SALE4 = 20; //20%
    uint public constant BONUS_ICO_STAGE2 = 0; //No bonus

    //Token Price on Coin Offer
    uint256 public constant price = 79 szabo; //0.000079 ETH

    // Owner of this contract
    address public administrator;

    // Balances for each account
    mapping(address => uint256) balances;

    // Owner of account approves the transfer of an amount to another account
    mapping(address => mapping (address => uint256)) allowed;

    //Mostly needed for internal use
    uint256 internal totalCoinsAvailable;

    //All token stages. Total 6 stages
    TokenStage[6] stages;

    //Index of current stage in stage array
    uint currentStage;

    //Contract the implements interface of InvestorsPool
    InvestorsPool internal investorsPool;

    //Enables or disables debug mode. Debug mode is set only in constructor.
    bool isDebug = false;

    event StageUpdated(string from, string to);

    // Functions with this modifier can only be executed by the owner
    modifier onlyAdministrator() {
        require(msg.sender == administrator);
        _;
    }

    modifier notAdministrator() {
        require(msg.sender != administrator);
        _;
    }

    modifier onlyDuringICO() {
        require(currentStage < stages.length);
        _;
    }

    modifier onlyAfterICO(){
        require(currentStage >= stages.length);
        _;
    }

    modifier meetTheCap() {
        require(msg.value >= price); // At least one token

        require( ( ( ( balanceOf(msg.sender) / accuracy ) * price ) + msg.value ) <= singleInvestorCap);
        _;
    }

    modifier canInvest() {
        require(investorsPool.isCanInvest(msg.sender));
        _;
    }

    // Constructor
    function UnilotToken(InvestorsPool _investorsPool, bool _isDebug)
        public
    {
        administrator = msg.sender;
        totalCoinsAvailable = _totalSupply;
        investorsPool = _investorsPool;
        isDebug = _isDebug;

        _setupStages();
        _proceedStage();
    }

    function _setupStages()
        internal
    {
        //Presale stage
        stages[0].name = 'Presale stage';
        stages[0].numCoinsStart = totalCoinsAvailable;
        stages[0].coinsAvailable = TOKEN_AMOUNT_PRE_ICO;
        stages[0].bonus = BONUS_PRE_ICO;

        if (isDebug) {
            stages[0].startsAt = now;
            stages[0].endsAt = stages[0].startsAt + 30 seconds;
        } else {
            stages[0].startsAt = 1515600000; //10th of January 2018 at 16:00UTC
            stages[0].endsAt = stages[0].startsAt + 31 days; //10th of February 2018 at 16:00UTC
        }

        //ICO Stage 1 pre-sale 1
        stages[1].name = 'ICO Stage 1 pre-sale 1';
        stages[1].coinsAvailable = TOKEN_AMOUNT_ICO_STAGE1_PRE_SALE1;
        stages[1].bonus = BONUS_ICO_STAGE1_PRE_SALE1;

        if (isDebug) {
            stages[1].startsAt = stages[0].endsAt;
            stages[1].endsAt = stages[1].startsAt + 30 seconds;
        } else {
            stages[1].startsAt = 1518710400; //15th of February 2018 at 16:00UTC
            stages[1].endsAt = stages[0].startsAt + 28 days; //15th of March 2018 at 16:00UTC
        }

        //ICO Stage 1 pre-sale 2
        stages[2].name = 'ICO Stage 1 pre-sale 2';
        stages[2].coinsAvailable = TOKEN_AMOUNT_ICO_STAGE1_PRE_SALE2;
        stages[2].bonus = BONUS_ICO_STAGE1_PRE_SALE2;

        stages[2].startsAt = stages[1].startsAt;
        stages[2].endsAt = stages[1].endsAt;

        //ICO Stage 1 pre-sale 3
        stages[3].name = 'ICO Stage 1 pre-sale 3';
        stages[3].coinsAvailable = TOKEN_AMOUNT_ICO_STAGE1_PRE_SALE3;
        stages[3].bonus = BONUS_ICO_STAGE1_PRE_SALE3;

        stages[3].startsAt = stages[1].startsAt;
        stages[3].endsAt = stages[1].endsAt;

        //ICO Stage 1 pre-sale 4
        stages[4].name = 'ICO Stage 1 pre-sale 4';
        stages[4].coinsAvailable = TOKEN_AMOUNT_ICO_STAGE1_PRE_SALE4;
        stages[4].bonus = BONUS_ICO_STAGE1_PRE_SALE4;

        stages[4].startsAt = stages[1].startsAt;
        stages[4].endsAt = stages[1].endsAt;

        //ICO Stage 2
        stages[5].name = 'ICO Stage 2';
        stages[5].coinsAvailable = TOKEN_AMOUNT_ICO_STAGE2;
        stages[5].bonus = BONUS_ICO_STAGE2;

        if (isDebug) {
            stages[5].startsAt = stages[4].endsAt;
            stages[5].endsAt = stages[5].startsAt + 30 seconds;
        } else {
            stages[5].startsAt = 1524240000; //20th of April 2018 at 16:00UTC
            stages[5].endsAt = stages[5].startsAt + 30 days;
        }
    }

    function _proceedStage()
        internal
    {
        while (true) {
            if ( currentStage < stages.length
            && (now >= stages[currentStage].endsAt || getAvailableCoinsForCurrentStage() == 0) ) {
                currentStage++;

                if (currentStage >= stages.length) {
                    uint totalTokensForSale = TOKEN_AMOUNT_PRE_ICO
                                    + TOKEN_AMOUNT_ICO_STAGE1_PRE_SALE1
                                    + TOKEN_AMOUNT_ICO_STAGE1_PRE_SALE2
                                    + TOKEN_AMOUNT_ICO_STAGE1_PRE_SALE3
                                    + TOKEN_AMOUNT_ICO_STAGE1_PRE_SALE4
                                    + TOKEN_AMOUNT_ICO_STAGE2;

                    //Burning all unsold tokens and proportionally other for deligation
                    _totalSupply = ( ( ( totalTokensForSale - stages[(stages.length - 1)].coinsAvailable )
                    * 100 ) / DST_ICO );
                    totalCoinsAvailable = 0;
                    break; //ICO ended
                }

                stages[currentStage].numCoinsStart = totalCoinsAvailable;

                if ( currentStage > 0 ) {
                    //Move all left tokens to last stage
                    stages[(stages.length - 1)].coinsAvailable += stages[ (currentStage - 1 ) ].coinsAvailable;
                    StageUpdated(stages[currentStage - 1].name, stages[currentStage].name);
                }
            } else {
                break;
            }
        }
    }

    function getAvailableCoinsForCurrentStage()
        public
        view
        returns(uint)
    {
        TokenStage memory stage = stages[currentStage];

        return stage.coinsAvailable;
    }

    //------------- ERC20 methods -------------//
    function totalSupply()
        public
        constant
        returns (uint256)
    {
        return _totalSupply;
    }


    // What is the balance of a particular account?
    function balanceOf(address _owner)
        public
        constant
        returns (uint256 balance)
    {
        return balances[_owner];
    }


    // Transfer the balance from owner's account to another account
    function transfer(address _to, uint256 _amount)
        public
        onlyAfterICO
        returns (bool success)
    {
        if (balances[msg.sender] >= _amount
            && _amount > 0
            && balances[_to] + _amount > balances[_to]) {
            balances[msg.sender] -= _amount;
            balances[_to] += _amount;
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
        onlyAfterICO
        returns (bool success)
    {
        if (balances[_from] >= _amount
            && allowed[_from][msg.sender] >= _amount
            && _amount > 0
            && balances[_to] + _amount > balances[_to]) {
            balances[_from] -= _amount;
            allowed[_from][msg.sender] -= _amount;
            balances[_to] += _amount;
            Transfer(_from, _to, _amount);
            return true;
        } else {
            return false;
        }
    }


    // Allow _spender to withdraw from your account, multiple times, up to the _value amount.
    // If this function is called again it overwrites the current allowance with _value.
    function approve(address _spender, uint256 _amount)
        public
        onlyAfterICO
        returns (bool success)
    {
        allowed[msg.sender][_spender] = _amount;
        Approval(msg.sender, _spender, _amount);
        return true;
    }


    function allowance(address _owner, address _spender)
        public
        constant
        onlyAfterICO
        returns (uint256 remaining)
    {
        return allowed[_owner][_spender];
    }
    //------------- ERC20 Methods END -------------//

    //Returns bonus for certain level of reference
    function calculateReferralBonus(uint amount, uint level)
        public
        pure
        returns (uint bonus)
    {
        bonus = 0;

        if ( level == 1 ) {
            bonus = ( ( amount * REFERRAL_BONUS_LEVEL1 ) / 100 );
        } else if (level == 2) {
            bonus = ( ( amount * REFERRAL_BONUS_LEVEL2 ) / 100 );
        } else if (level == 3) {
            bonus = ( ( amount * REFERRAL_BONUS_LEVEL3 ) / 100 );
        } else if (level == 4) {
            bonus = ( ( amount * REFERRAL_BONUS_LEVEL4 ) / 100 );
        } else if (level == 5) {
            bonus = ( ( amount * REFERRAL_BONUS_LEVEL5 ) / 100 );
        }
    }

    function calculateBonus(uint amountOfTokens)
        public
        view
        returns (uint)
    {
        return ( ( stages[currentStage].bonus * amountOfTokens ) / 100 );
    }

    function getInvestorsPool()
        public
        view
        returns (InvestorsPool)
    {
        return investorsPool;
    }

    function setInvestorsPool(InvestorsPool _newPool)
        public
    {
        investorsPool = _newPool;
    }

    event TokenPurchased(string stage, uint valueSubmitted, uint valueRefunded, uint tokensPurchased);

    function ()
        public
        payable
        notAdministrator
        onlyDuringICO
        meetTheCap
        canInvest
    {
        _proceedStage();
        require(currentStage < stages.length);
        require(stages[currentStage].startsAt <= now && now < stages[currentStage].endsAt);
        require(getAvailableCoinsForCurrentStage() > 0);

        uint requestedAmountOfTokens = ( ( msg.value * accuracy ) / price );
        uint amountToBuy = requestedAmountOfTokens;
        uint refund = 0;

        if ( amountToBuy > getAvailableCoinsForCurrentStage() ) {
            amountToBuy = getAvailableCoinsForCurrentStage();
            refund = ( ( (requestedAmountOfTokens - amountToBuy) / accuracy ) * price );

            // Returning ETH
            msg.sender.transfer( refund );
        }

        TokenPurchased(stages[currentStage].name, msg.value, refund, amountToBuy);
        stages[currentStage].coinsAvailable -= amountToBuy;
        stages[currentStage].balance += (msg.value - refund);

        uint amountDelivered = amountToBuy + calculateBonus(amountToBuy);

        balances[msg.sender] += amountDelivered;
        totalCoinsAvailable -= amountDelivered;

        if ( getAvailableCoinsForCurrentStage() == 0 ) {
            _proceedStage();
        }

        //Calculate bonuses
        address[5] memory referrers = investorsPool.getReferrersList(msg.sender, 5);

        for (uint i = 0; i < 5; i++) {
            if (referrers[i] == address(0) ) {
                break;
            }

            balances[ referrers[ i ] ] += calculateReferralBonus( amountToBuy, ( i + 1 ) );
        }
    }

    //It doesn't really close the stage
    //It just needed to push transaction to update stage and update block.now
    function closeStage()
        public
        onlyAdministrator
    {
        _proceedStage();
    }
}
