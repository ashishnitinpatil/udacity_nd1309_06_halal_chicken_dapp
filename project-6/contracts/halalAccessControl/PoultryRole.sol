pragma solidity ^0.4.24;

import "./Roles.sol";


contract PoultryRole {
    using Roles for Roles.Role;

    event PoultryAdded(address indexed account);
    event PoultryRemoved(address indexed account);

    Roles.Role private poultries;

    // make the address that deploys this contract the 1st Poultry
    constructor() public {
        _addPoultry(msg.sender);
    }

    modifier onlyPoultry() {
        require(isPoultry(msg.sender));
        _;
    }

    function isPoultry(address account)
        public
        view
        returns (bool)
    {
        return poultries.has(account);
    }

    function addPoultry(address account)
        public
        onlyPoultry
    {
        _addPoultry(account);
    }

    function renouncePoultry()
        public
    {
        _removePoultry(msg.sender);
    }

    function _addPoultry(address account)
        internal
    {
        poultries.add(account);
        emit PoultryAdded(account);
    }

    function _removePoultry(address account)
        internal
    {
        poultries.remove(account);
        emit PoultryRemoved(account);
    }
}
