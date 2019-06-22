pragma solidity ^0.4.24;

import "./Roles.sol";


contract SlaughterHouseRole {
    using Roles for Roles.Role;

    event SlaughterHouseAdded(address indexed account);
    event SlaughterHouseRemoved(address indexed account);

    Roles.Role private slaughterHouses;

    // make the address that deploys this contract the 1st SlaughterHouse
    constructor() public {
        _addSlaughterHouse(msg.sender);
    }

    modifier onlySlaughterHouse() {
        require(isSlaughterHouse(msg.sender));
        _;
    }

    function isSlaughterHouse(address account)
        public
        view
        returns (bool)
    {
        return slaughterHouses.has(account);
    }

    function addSlaughterHouse(address account)
        public
        onlySlaughterHouse
    {
        _addSlaughterHouse(account);
    }

    function renounceSlaughterHouse()
        public
    {
        _removeSlaughterHouse(msg.sender);
    }

    function _addSlaughterHouse(address account)
        internal
    {
        slaughterHouses.add(account);
        emit SlaughterHouseAdded(account);
    }

    function _removeSlaughterHouse(address account)
        internal
    {
        slaughterHouses.remove(account);
        emit SlaughterHouseRemoved(account);
    }
}
