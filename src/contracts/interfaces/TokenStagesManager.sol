pragma solidity ^0.4.18;


interface TokenStagesManager {
    function isDebug() public constant returns(bool);
    function setToken(address tokenAddress) public;
    function getPool() public constant returns (uint96);
    function getBonus() public constant returns (uint96);
    function isTimeout() public constant returns (bool);
    function isICO() public view returns(bool);
    function isCanList() public view returns (bool);
    function delegateFromPool(uint96 amount);
}
