pragma solidity ^0.4.18;


interface TokenStagesManager {
    function isDebug() public constant returns(bool);
    function setToken(address tokenAddress) public;
    function getPool() public constant returns (uint96);
    function getBonus() public constant returns (uint8);
    function isFreezeTimeout() public constant returns (bool);
    function isTimeout() public constant returns (bool);
    function isICO() public view returns(bool);
    function isCanList() public view returns (bool);
    function calculateBonus(uint96 amount) public view returns (uint88);
    function delegateFromPool(uint96 amount) public;
    function delegateFromBonus(uint88 amount) public;
    function delegateFromReferral(uint88 amount) public;

    function getBonusPool() public constant returns(uint88);
    function getReferralPool() public constant returns(uint88);
}
