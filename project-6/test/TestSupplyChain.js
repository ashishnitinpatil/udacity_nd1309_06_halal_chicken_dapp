// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
const SupplyChain = artifacts.require("../halalBase/SupplyChain.sol");
const truffleAssert = require("truffle-assertions");


contract("SupplyChain", async accounts => {
    const owner = accounts[0];
    const upc = 1;
    const skuPoultry = "P001";
    const skuSlaughterHouse = "S001";
    const poultryID = accounts[1];
    const poultryName = "KFC";
    const poultryLatitude = "-38.239770";
    const poultryLongitude = "144.341490";
    const slaughterHouseID = accounts[2];
    const consumerID = accounts[3];
    const poultryPrice = web3.utils.toWei("0.6", "ether");
    const lessThanPoultryPrice = web3.utils.toWei("0.4", "ether");
    const slaughterHousePrice = web3.utils.toWei("1", "ether");
    const lessThanSlaughterHousePrice = web3.utils.toWei("0.8", "ether");
    const emptyAddress = "0x0000000000000000000000000000000000000000";

    ///Available Accounts
    ///==================
    ///(0) 0x27d8d15cbc94527cadf5ec14b69519ae23288b95
    ///(1) 0x018c2dabef4904ecbd7118350a0c54dbeae3549a
    ///(2) 0xce5144391b4ab80668965f2cc4f2cc102380ef0a
    ///(3) 0x460c31107dd048e34971e57da2f99f659add4f02
    ///(4) 0xd37b7b8c62be2fdde8daa9816483aebdbd356088
    ///(5) 0x27f184bdc0e7a931b507ddd689d76dba10514bcb
    ///(6) 0xfe0df793060c49edca5ac9c104dd8e3375349978
    ///(7) 0xbd58a85c96cc6727859d853086fe8560bc137632
    ///(8) 0xe07b5ee5f738b2f87f88b99aac9c64ff1e0c7917
    ///(9) 0xbd3ff2e3aded055244d66544c9c059fa0851da44

    console.log("ganache-cli accounts used here...");
    console.log("Contract Owner: accounts[0] ", owner);
    console.log("Poultry: accounts[1] ", poultryID);
    console.log("Slaughter House: accounts[2] ", slaughterHouseID);
    console.log("Consumer: accounts[3] ", consumerID);

    it("hatch chicken", async () => {
        const halalChain = await SupplyChain.deployed({from: owner});
        await halalChain.addPoultry(poultryID);
        await halalChain.addSlaughterHouse(slaughterHouseID);
        await halalChain.addConsumer(consumerID);

        await truffleAssert.reverts(
            halalChain.hatchChicken(
                web3.utils.fromAscii(skuPoultry),
                web3.utils.fromAscii(poultryName),
                web3.utils.fromAscii(poultryLatitude),
                web3.utils.fromAscii(poultryLongitude),
                {from: slaughterHouseID}
            )
        );

        truffleAssert.eventEmitted(
            await halalChain.hatchChicken(
                web3.utils.fromAscii(skuPoultry),
                web3.utils.fromAscii(poultryName),
                web3.utils.fromAscii(poultryLatitude),
                web3.utils.fromAscii(poultryLongitude),
                {from: poultryID}
            ),
            "Hatched",
            (ev) => {return ev.upc == upc;},
            "Hatched event not emitted"
        );

        const chicken = await halalChain.fetchChicken(upc);

        assert.equal(chicken[0], 0, "Error: Invalid chicken state");
        assert.equal(web3.utils.toUtf8(chicken[1]), skuPoultry, "Error: Invalid skuPoultry");
        assert.equal(web3.utils.toUtf8(chicken[2]), "", "Error: Invalid skuSlaughterHouse");
        assert.equal(chicken[3], poultryID, "Error: Invalid ownerID");
        assert.equal(chicken[4], poultryID, "Error: Invalid originPoultryID");
        assert.equal(web3.utils.toUtf8(chicken[5]), poultryName, "Error: Invalid originPoultryName");
        assert.equal(web3.utils.toUtf8(chicken[6]), poultryLatitude, "Error: Invalid originPoultryLatitude");
        assert.equal(web3.utils.toUtf8(chicken[7]), poultryLongitude, "Error: Invalid originPoultryLongitude");
        assert.equal(chicken[8], 0, "Error: Invalid price");
        assert.equal(chicken[9], emptyAddress, "Error: Invalid slaughterHouseID");
        assert.equal(chicken[10], emptyAddress, "Error: Invalid consumerID");
    });

    it("raise chicken", async () => {
        const halalChain = await SupplyChain.deployed({from: owner});

        await truffleAssert.reverts(
            halalChain.raiseChicken(upc, {from: slaughterHouseID})
        );

        let tx = await halalChain.raiseChicken(upc, {from: poultryID});
        truffleAssert.eventEmitted(
            tx,
            "Raised",
            (ev) => {return ev.upc == upc;},
            "Raised event not emitted"
        );

        const chicken = await halalChain.fetchChicken(1);

        assert.equal(chicken[0], 1, "Error: Invalid chicken state");
    });

    it("sell chicken for slaughter", async () => {
        const halalChain = await SupplyChain.deployed({from: owner});

        await truffleAssert.reverts(
            halalChain.sellForSlaughter(upc, poultryPrice, {from: slaughterHouseID})
        );

        let tx = await halalChain.sellForSlaughter(
            upc, poultryPrice, {from: poultryID}
        );
        truffleAssert.eventEmitted(
            tx,
            "SoldForSlaughter",
            (ev) => {return ev.upc == upc;},
            "SoldForSlaughter event not emitted"
        );

        const chicken = await halalChain.fetchChicken(1);

        assert.equal(chicken[0], 2, "Error: Invalid chicken state");
        assert.equal(chicken[8], poultryPrice, "Error: Invalid price");
    });

    it("purchase healthy chicken", async () => {
        const halalChain = await SupplyChain.deployed({from: owner});

        await truffleAssert.reverts(
            halalChain.purchaseHealthy(
                upc, web3.utils.fromAscii(skuSlaughterHouse),
                {from: poultryID, value: poultryPrice}
            )
        );

        // not paid enough
        await truffleAssert.reverts(
            halalChain.purchaseHealthy(
                upc, web3.utils.fromAscii(skuSlaughterHouse),
                {from: slaughterHouseID, value: lessThanPoultryPrice}
            )
        );

        let tx = await halalChain.purchaseHealthy(
            upc, web3.utils.fromAscii(skuSlaughterHouse),
            {from: slaughterHouseID, value: poultryPrice}
        );
        truffleAssert.eventEmitted(
            tx,
            "PurchasedHealthy",
            (ev) => {return ev.upc == upc;},
            "PurchasedHealthy event not emitted"
        );

        const chicken = await halalChain.fetchChicken(1);

        assert.equal(chicken[0], 3, "Error: Invalid chicken state");
        assert.equal(web3.utils.toUtf8(chicken[2]), skuSlaughterHouse, "Error: Invalid skuSlaughterHouse");
        assert.equal(chicken[3], slaughterHouseID, "Error: Invalid ownerID");
        assert.equal(chicken[9], slaughterHouseID, "Error: Invalid slaughterHouseID");
    });

    it("slaughter chicken", async () => {
        const halalChain = await SupplyChain.deployed({from: owner});

        await truffleAssert.reverts(
            halalChain.slaughter(upc, {from: poultryID})
        );

        let tx = await halalChain.slaughter(
            upc, {from: slaughterHouseID}
        );
        truffleAssert.eventEmitted(
            tx,
            "Slaughtered",
            (ev) => {return ev.upc == upc;},
            "Slaughtered event not emitted"
        );

        const chicken = await halalChain.fetchChicken(1);

        assert.equal(chicken[0], 4, "Error: Invalid chicken state");
    });

    it("sell chicken retail", async () => {
        const halalChain = await SupplyChain.deployed({from: owner});

        await truffleAssert.reverts(
            halalChain.sellRetail(upc, slaughterHousePrice, {from: consumerID})
        );

        let tx = await halalChain.sellRetail(
            upc, slaughterHousePrice, {from: slaughterHouseID}
        );
        truffleAssert.eventEmitted(
            tx,
            "SoldRetail",
            (ev) => {return ev.upc == upc;},
            "SoldRetail event not emitted"
        );

        const chicken = await halalChain.fetchChicken(1);

        assert.equal(chicken[0], 5, "Error: Invalid chicken state");
        assert.equal(chicken[8], slaughterHousePrice, "Error: Invalid price");
    });

    it("buy retail chicken", async () => {
        const halalChain = await SupplyChain.deployed({from: owner});

        await truffleAssert.reverts(
            halalChain.buyRetail(
                upc, {from: slaughterHouseID, value: slaughterHousePrice}
            )
        );

        // not paid enough
        await truffleAssert.reverts(
            halalChain.buyRetail(
                upc, {from: consumerID, value: lessThanSlaughterHousePrice}
            )
        );

        let tx = await halalChain.buyRetail(
            upc, {from: consumerID, value: slaughterHousePrice}
        );
        truffleAssert.eventEmitted(
            tx,
            "BoughtRetail",
            (ev) => {return ev.upc == upc;},
            "BoughtRetail event not emitted"
        );

        const chicken = await halalChain.fetchChicken(1);

        assert.equal(chicken[0], 6, "Error: Invalid chicken state");
        assert.equal(chicken[3], consumerID, "Error: Invalid ownerID");
        assert.equal(chicken[10], consumerID, "Error: Invalid consumerID");
    });

    it("hatch chicken again", async () => {
        const nextUpc = upc + 1;
        const halalChain = await SupplyChain.deployed({from: owner});

        truffleAssert.eventEmitted(
            await halalChain.hatchChicken(
                web3.utils.fromAscii(skuPoultry),
                web3.utils.fromAscii(poultryName),
                web3.utils.fromAscii(poultryLatitude),
                web3.utils.fromAscii(poultryLongitude),
                {from: poultryID}
            ),
            "Hatched",
            (ev) => {return ev.upc == nextUpc;},
            "Hatched event not emitted with incremented UPC"
        );

        const chicken = await halalChain.fetchChicken(nextUpc);

        assert.equal(chicken[0], 0, "Error: Invalid chicken state");
    });
});
