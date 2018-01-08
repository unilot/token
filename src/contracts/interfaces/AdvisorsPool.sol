pragma solidity ^0.4.18;


interface AdvisorsPool {
    //Returns mapping address => %of advisers fund to send (in form of 2 arrays)
    //For instance advisors fund is 100ETH
    function getAdvisers() public view returns(address[], uint[]);
    function getAdvisorShare(address) public view returns(uint);
}
