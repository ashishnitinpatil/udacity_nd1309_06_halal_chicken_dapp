pragma solidity ^0.4.24;


/// Provides basic authorization control
contract Ownable {
    address private origOwner;

    event OwnershipTransfered(address indexed oldOwner, address indexed newOwner);

    /// Assign the contract to an owner
    constructor() internal {
        origOwner = msg.sender;
        emit OwnershipTransfered(address(0), origOwner);
    }

    /// Look up the address of the owner
    function owner() public view returns (address) {
        return origOwner;
    }

    /// Check if the calling address is the owner of the contract
    function isOwner() public view returns (bool) {
        return msg.sender == origOwner;
    }

    modifier onlyOwner() {
        require(isOwner());
        _;
    }

    function renounceOwnership() public onlyOwner {
        emit OwnershipTransfered(origOwner, address(0));
        origOwner = address(0);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal {
        require(newOwner != address(0));
        emit OwnershipTransfered(origOwner, newOwner);
        origOwner = newOwner;
    }
}
