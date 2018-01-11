pragma solidity ^0.4.18;

interface InvestorsPool {
    function isCanInvest(address investor) public view returns (bool);
    function isApproved(address investor) public view returns (bool);
    function getReferrer(address investor) public view returns(address);
    function getReferrersList(address investor, uint max_depth) public view returns(address[5] memory);
    function getReferanceLevel(address investor) public view returns(uint);
    function getInvestors() public view returns(address[]);
    function getInvestor(address investor) public view returns(uint, address, uint);
}