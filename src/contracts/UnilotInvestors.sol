pragma solidity ^0.4.18;

import "contracts/interfaces/InvestorsPool.sol";


contract UnilotInvestors is InvestorsPool {
    enum InvestorState {
        ANONYMOUS,  //Basically default value
        REGISTERED, //Can invest
        APPROVED,   //Can play (KYC)
        BANNED,     //Mostly for abuse cases
        FROZEN      //Request from user or legal reasons
    }

    struct InvestorCard {
        InvestorState state;
        address referrer;
        uint referrence_level;
    }

    mapping (address => InvestorCard) internal investors;
    address[] internal investorsList;
    address internal administrator;

    event InvestorAdded(address investor, InvestorState state, address referrer);
    event InvestorStateChanged(address investor, InvestorState newState);

    modifier onlyAdministrator() {
        require(msg.sender == administrator);
        _;
    }


    modifier notAdministrator(address investor) {
        require(investor != administrator);
        _;
    }

    modifier validState(uint _state) {
        //State should fit our enum
        require( _state <= uint(InvestorState.FROZEN) );
        //We can't submit anonymous investor
        require( _state > uint(InvestorState.ANONYMOUS) );
        _;
    }

    function UnilotInvestors()
        public
    {
        administrator = msg.sender;
    }

    function getAdministrator()
        public
        view
        returns(address)
    {
        return administrator;
    }

    function isCanInvest(address investor)
        public
        view
        returns (bool)
    {
        InvestorState investorState = investors[investor].state;

        return (investorState == InvestorState.REGISTERED
                || investorState == InvestorState.APPROVED);
    }

    function isApproved(address investor)
        public
        view
        returns (bool)
    {
        return investors[investor].state == InvestorState.APPROVED;
    }

    function getReferrer(address investor)
        public
        view
        returns(address)
    {
        return investors[investor].referrer;
    }

    function getReferrersList(address investor, uint max_depth)
        public
        view
        returns(address[5] memory referrers)
    {
        uint depth = getReferanceLevel(investor);

        if ( max_depth > 0  && depth > max_depth ) {
            depth = max_depth;
        }

        if ( depth > referrers.length ) {
            depth = referrers.length;
        }

        address last_referrer = investor;

        for (uint i = 0; i < depth; i++) {
            last_referrer = referrers[i] = investors[last_referrer].referrer;
        }
    }

    function getReferanceLevel(address investor)
        public
        view
        returns(uint level)
    {
        level = investors[investor].referrence_level;
    }

    function getInvestors()
        public
        view
        returns(address[])
    {
        return investorsList;
    }

    function getInvestor(address investor)
        public
        view
        returns(uint, address, uint)
    {
        InvestorCard memory card = investors[investor];

        return (uint(card.state), card.referrer, card.referrence_level);
    }

    function add(address investor, uint _state, address referrer)
        public
        onlyAdministrator
        validState(_state)
        notAdministrator(investor)
    {
        //We shouldn't know this investor before
        require( investors[investor].state == InvestorState.ANONYMOUS );
        //Referrer should be registered investor if provided
        require( referrer == address(0) || investors[referrer].state != InvestorState.ANONYMOUS );

        investors[investor].state = InvestorState(_state);
        investorsList.push(investor);

        //Record referrer if he was provided
        if ( referrer != address(0) ) {
            investors[investor].referrer = referrer;
            investors[investor].referrence_level = investors[referrer].referrence_level + 1;
        }

        InvestorAdded(investor, investors[investor].state, referrer);
    }

    function changeState(address investor, uint _state)
        public
        onlyAdministrator
        validState(_state)
        notAdministrator(investor)
    {
        //Investor should be in list
        require( investors[investor].state != InvestorState.ANONYMOUS
            && investors[investor].state != InvestorState(_state) );

        investors[investor].state = InvestorState(_state);
        InvestorStateChanged(investor, investors[investor].state);
    }
}
