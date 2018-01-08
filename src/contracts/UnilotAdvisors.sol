pragma solidity ^0.4.18;

import "contracts/interfaces/AdvisorsPool.sol";

contract UnilotAdvisors is AdvisorsPool {
    address[] internal advisors;
    uint[] internal shares;
    mapping(address => uint) advisorsIndex;

    uint constant ACCURACY = 6;

    //This var is done to track total shares
    //Should be equal to 100000000 (100.000000%)
    //when calling getAdvisors method
    uint internal totalDistribution;

    address internal administrator;

    modifier onlyAdministrator() {
        require(msg.sender == administrator);
        _;
    }

    modifier onlyExistingAdvisor(address _advisor) {
        require( advisors.length > 0 && advisors[advisorsIndex[_advisor]] == _advisor ); //Adviser exists in list
        require( shares[advisorsIndex[_advisor]] > 0 );
        _;
    }

    modifier shareIsMoreThanZero(uint _share) {
        require( _share > 0 );
        _;
    }

    modifier validAdvisor(address _advisor) {
        require(_advisor != address(0));
        _;
    }

    function UnilotAdvisors(address[] _advisors, uint[] _shares)
        public
    {
        require(_advisors.length == _shares.length);

        administrator = msg.sender;

        for ( uint i = 0; i < _advisors.length; i++ ) {
            add(_advisors[i], _shares[i]);
        }
    }

    function getAdministrator()
        public
        view
        returns (address)
    {
        return administrator;
    }

    function getTotalDistribution()
        public
        view
        returns (uint)
    {
        return totalDistribution;
    }

    function add(address _advisor, uint _share)
        public
        onlyAdministrator
        shareIsMoreThanZero(_share)
        validAdvisor(_advisor)
    {
        require( advisors.length == 0 || advisors[advisorsIndex[_advisor]] != _advisor ); //Adviser is new
        require( totalDistribution + _share <= ( 100 * ( 10**ACCURACY ) ) );

        advisors.push(_advisor);
        shares.push(_share);
        advisorsIndex[_advisor] = (advisors.length - 1);
        totalDistribution += _share;
    }

    function update(address _advisor, uint _share)
        public
        onlyAdministrator
        shareIsMoreThanZero(_share)
        validAdvisor(_advisor)
        onlyExistingAdvisor(_advisor)
    {
        uint index = advisorsIndex[_advisor];

        require( ( totalDistribution - shares[index] ) + _share <= ( 100 * ( 10**ACCURACY ) ) );

        totalDistribution += ( _share - shares[index] );

        shares[index] = _share;
    }

    function remove(address _advisor)
        public
        onlyAdministrator
        validAdvisor(_advisor)
        onlyExistingAdvisor(_advisor)
    {
        uint index = advisorsIndex[_advisor];

        totalDistribution -= shares[index];

        delete advisors[index];
        delete shares[index];
        delete advisorsIndex[_advisor];
    }

    function getAdvisers()
        public
        view
        returns(address[], uint[])
    {
        return (advisors, shares);
    }

    function getAdvisorShare(address _advisor)
        public
        view
        onlyExistingAdvisor(_advisor)
        returns(uint)
    {
        return shares[advisorsIndex[_advisor]];
    }
}
