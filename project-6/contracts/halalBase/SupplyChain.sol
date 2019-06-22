pragma solidity ^0.4.24;

import "../halalCore/Ownable.sol";
import "../halalAccessControl/PoultryRole.sol";
import "../halalAccessControl/SlaughterHouseRole.sol";
import "../halalAccessControl/ConsumerRole.sol";


contract SupplyChain is Ownable, PoultryRole, SlaughterHouseRole, ConsumerRole {
    address public owner;
    uint private upc;

    mapping(uint => Chicken) private chickens;

    enum State {
        Hatched,          // 0
        Raised,           // 1
        SoldForSlaughter, // 2
        PurchasedHealthy, // 3
        Slaughtered,      // 4
        SoldRetail,       // 5
        BoughtRetail      // 6
    }

    struct Chicken {
        uint upc;
        State state; // Current chicken state
        bytes32 skuPoultry;
        bytes32 skuSlaughterHouse;
        address ownerID; // Address of the chicken's current owner
        address originPoultryID; // Address of the Poultry
        string originPoultryName;
        string originPoultryInformation;
        bytes32 originPoultryLatitude;
        bytes32 originPoultryLongitude;
        uint price; // price when bought / sold at respective stage
        address slaughterHouseID; // Address of the SlaughterHouse
        address consumerID; // Address of the Consumer
    }

    event Hatched(uint upc);
    event Raised(uint upc);
    event SoldForSlaughter(uint upc);
    event PurchasedHealthy(uint upc);
    event Slaughtered(uint upc);
    event SoldRetail(uint upc);
    event BoughtRetail(uint upc);

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier returnBalance(uint _upc, bool isConsumer) {
        _;
        uint _price = chickens[_upc].price;
        uint amountToReturn = msg.value - _price;
        if (isConsumer) {
            chickens[_upc].consumerID.transfer(amountToReturn);
        } else {
            chickens[_upc].slaughterHouseID.transfer(amountToReturn);
        }
    }

    modifier hatched(uint _upc) {
        require(chickens[_upc].state == State.Hatched);
        _;
    }

    modifier raised(uint _upc) {
        require(chickens[_upc].state == State.Raised);
        _;
    }

    modifier soldForSlaughter(uint _upc) {
        require(chickens[_upc].state == State.SoldForSlaughter);
        _;
    }

    modifier purchasedHealthy(uint _upc) {
        require(chickens[_upc].state == State.PurchasedHealthy);
        _;
    }

    modifier slaughtered(uint _upc) {
        require(chickens[_upc].state == State.Slaughtered);
        _;
    }

    modifier soldRetail(uint _upc) {
        require(chickens[_upc].state == State.SoldRetail);
        _;
    }

    modifier boughtRetail(uint _upc) {
        require(chickens[_upc].state == State.BoughtRetail);
        _;
    }

    modifier isChickenOwner(uint _upc) {
        require(msg.sender == chickens[_upc].ownerID);
        _;
    }

    modifier paidEnoughForPurchase(uint _upc) {
        require(msg.value >= chickens[_upc].price);
        _;
    }

    constructor() public payable {
        owner = msg.sender;
        upc = 1;
    }

    function kill()
        public
    {
        if (msg.sender == owner) {
            selfdestruct(owner);
        }
    }

    function hatchChicken(
        bytes32 _skuPoultry,
        string _originPoultryName,
        string _originPoultryInformation,
        bytes32 _originPoultryLatitude,
        bytes32 _originPoultryLongitude
    )
        public
        onlyPoultry
    {
        chickens[upc] = Chicken({
            upc: upc,
            state: State.Hatched,
            skuPoultry: _skuPoultry,
            skuSlaughterHouse: "",
            ownerID: msg.sender,
            originPoultryID: msg.sender,
            originPoultryName: _originPoultryName,
            originPoultryInformation: _originPoultryInformation,
            originPoultryLatitude: _originPoultryLatitude,
            originPoultryLongitude: _originPoultryLongitude,
            price: 0,
            slaughterHouseID: 0,
            consumerID: 0
        });
        emit Hatched(upc);
        upc++; // keep UPC unique for next chicken
    }

    function raiseChicken(uint _upc)
        public
        hatched(_upc)
        isChickenOwner(_upc)
    {
        chickens[_upc].state = State.Raised;
        emit Raised(_upc);
    }

    function sellForSlaughter(uint _upc, uint _price)
        public
        raised(_upc)
        isChickenOwner(_upc)
    {
        chickens[_upc].state = State.SoldForSlaughter;
        chickens[_upc].price = _price;
        emit SoldForSlaughter(_upc);
    }

    function purchaseHealthy(uint _upc, bytes32 _sku)
        public
        payable
        onlySlaughterHouse
        soldForSlaughter(_upc)
        paidEnoughForPurchase(_upc)
        returnBalance(_upc, false)
    {
        chickens[_upc].state = State.PurchasedHealthy;
        chickens[_upc].ownerID = msg.sender;
        chickens[_upc].skuSlaughterHouse = _sku;
        chickens[_upc].slaughterHouseID = msg.sender;
        emit PurchasedHealthy(_upc);
    }

    function slaughter(uint _upc)
        public
        purchasedHealthy(_upc)
        isChickenOwner(_upc)
    {
        // TODO: add proof of Halal slaughter (IPFS video)
        chickens[_upc].state = State.Slaughtered;
        emit Slaughtered(_upc);
    }

    function sellRetail(uint _upc, uint _price)
        public
        slaughtered(_upc)
        isChickenOwner(_upc)
    {
        chickens[_upc].state = State.SoldRetail;
        chickens[_upc].price = _price;
        emit SoldRetail(_upc);
    }

    function buyRetail(uint _upc)
        public
        payable
        onlyConsumer
        soldRetail(_upc)
        paidEnoughForPurchase(_upc)
        returnBalance(_upc, true)
    {
        chickens[_upc].state = State.BoughtRetail;
        chickens[_upc].ownerID = msg.sender;
        chickens[_upc].consumerID = msg.sender;
        emit BoughtRetail(_upc);
    }

    function fetchChicken(uint _upc)
        public
        view
        returns (
            State state,
            bytes32 skuPoultry,
            bytes32 skuSlaughterHouse,
            address ownerID,
            address originPoultryID,
            string originPoultryName,
            string originPoultryInformation,
            bytes32 originPoultryLatitude,
            bytes32 originPoultryLongitude,
            uint price,
            address slaughterHouseID,
            address consumerID
        )
    {
        Chicken memory chicken = chickens[_upc];
        return (
            chicken.state,
            chicken.skuPoultry,
            chicken.skuSlaughterHouse,
            chicken.ownerID,
            chicken.originPoultryID,
            chicken.originPoultryName,
            chicken.originPoultryInformation,
            chicken.originPoultryLatitude,
            chicken.originPoultryLongitude,
            chicken.price,
            chicken.slaughterHouseID,
            chicken.consumerID
        );
    }
}
