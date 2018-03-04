pragma solidity ^0.4.18;


contract Administrated {
    address public administrator;

    modifier onlyAdministrator() {
        require(administrator == tx.origin);
        _;
    }

    modifier notAdministrator() {
        require(administrator != tx.origin);
        _;
    }

    function setAdministrator(address _administrator)
        internal
    {
        administrator = _administrator;
    }
}
