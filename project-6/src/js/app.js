const emptyAddress = "0x0000000000000000000000000000000000000000";


App = {
    web3Provider: null,
    contracts: {},
    emptyAddress: emptyAddress,
    metamaskAccountID: emptyAddress,
    addPoultryID: emptyAddress,
    addSlaughterHouseID: emptyAddress,
    addConsumerID: emptyAddress,
    upcPoultry: 0,
    skuPoultry: null,
    originPoultryName: null,
    originPoultryLatitude: null,
    originPoultryLongitude: null,
    pricePoultry: 0,
    upcSlaughterHouse: 0,
    skuSlaughterHouse: null,
    priceSlaughterHouse: 0,
    upcConsumer: 0,
    priceConsumer: 0,
    upc: 0,
    detailsMapping: [
        "state",
        "skuPoultry",
        "skuSlaughterHouse",
        "ownerID",
        "originPoultryID",
        "originPoultryName",
        "originPoultryLatitude",
        "originPoultryLongitude",
        "price",
        "slaughterHouseID",
        "consumerID"
    ],

    init: async function() {
        App.readForm();
        /// Setup access to blockchain
        return await App.initWeb3();
    },

    readForm: function() {
        App.addPoultryID = $("#addPoultryID").val();
        App.addSlaughterHouseID = $("#addSlaughterHouseID").val();
        App.addConsumerID = $("#addConsumerID").val();
        App.upcPoultry = $("#upcPoultry").val();
        App.skuPoultry = $("#skuPoultry").val();
        App.originPoultryName = $("#originPoultryName").val();
        App.originPoultryLatitude = $("#originPoultryLatitude").val();
        App.originPoultryLongitude = $("#originPoultryLongitude").val();
        App.pricePoultry = $("#pricePoultry").val();
        App.upcSlaughterHouse = $("#upcSlaughterHouse").val();
        App.skuSlaughterHouse = $("#skuSlaughterHouse").val();
        App.priceSlaughterHouse = $("#priceSlaughterHouse").val();
        App.upcConsumer = $("#upcConsumer").val();
        App.priceConsumer = $("#priceConsumer").val();
        App.upc = $("#upc").val();

        console.log(
            App.addPoultryID,
            App.addSlaughterHouseID,
            App.addConsumerID,
            App.upcPoultry,
            App.skuPoultry,
            App.originPoultryName,
            App.originPoultryLatitude,
            App.originPoultryLongitude,
            App.pricePoultry,
            App.upcSlaughterHouse,
            App.skuSlaughterHouse,
            App.priceSlaughterHouse,
            App.upcConsumer,
            App.priceConsumer,
            App.upc,
        );
    },

    initWeb3: async function() {
        /// Find or Inject Web3 Provider
        /// Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider(
                'http://localhost:8545');
        }

        App.getMetaskAccountID();

        return App.initSupplyChain();
    },

    getMetaskAccountID: function() {
        web3 = new Web3(App.web3Provider);

        // Retrieving accounts
        web3.eth.getAccounts(function(err, res) {
            if (err) {
                console.log('Error:', err);
                return;
            }
            console.log('getMetaskID:', res);
            App.metamaskAccountID = res[0];

        })
    },

    initSupplyChain: function() {
        /// Source the truffle compiled smart contracts
        var jsonSupplyChain = '../../build/contracts/SupplyChain.json';

        /// JSONfy the smart contracts
        $.getJSON(jsonSupplyChain, function(data) {
            console.log('data', data);
            var SupplyChainArtifact = data;
            App.contracts.SupplyChain = TruffleContract(
                SupplyChainArtifact);
            App.contracts.SupplyChain.setProvider(App.web3Provider);
            App.contracts.SupplyChain.defaults({
                from: App.metamaskAccountID,
                gas: 4712388,
                gasPrice: 100000000000
            });

            App.updateIDs();
            App.fetchChicken();
            App.fetchEvents();
        });

        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', App.handleButtonClick);
    },

    handleButtonClick: async function(event) {
        event.preventDefault();

        App.getMetaskAccountID();

        var processId = parseInt($(event.target).data('id'));
        console.log('processId', processId);

        switch (processId) {
            case 1:
                return await App.addPoultry(event);
                break;
            case 2:
                return await App.addSlaughterHouse(event);
                break;
            case 3:
                return await App.addConsumer(event);
                break;
            case 11:
                return await App.hatchChicken(event);
                break;
            case 12:
                return await App.raiseChicken(event);
                break;
            case 13:
                return await App.sellForSlaughter(event);
                break;
            case 21:
                return await App.purchaseHealthy(event);
                break;
            case 22:
                return await App.slaughter(event);
                break;
            case 23:
                return await App.sellRetail(event);
                break;
            case 31:
                return await App.buyRetail(event);
                break;
            case 99:
                return await App.fetchChicken(event);
                break;
        }
    },

    updateIDs: function() {
        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.getOwner({
                from: App.metamaskAccountID
            });
        }).then(function(result) {
            $("#contractOwnerID").text(result);
            $("#connectedMetamaskID").text(App.metamaskAccountID);
            console.log('contractOwnerID', result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    addPoultry: function(event) {
        event.preventDefault();

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.addPoultry(App.addPoultryID);
        }).then(function(result) {
            console.log('addPoultry', result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    addSlaughterHouse: function(event) {
        event.preventDefault();

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.addSlaughterHouse(App.addSlaughterHouseID);
        }).then(function(result) {
            console.log('addSlaughterHouse', result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    addConsumer: function(event) {
        event.preventDefault();

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.addConsumer(App.addConsumerID);
        }).then(function(result) {
            console.log('addConsumer', result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    hatchChicken: function(event) {
        event.preventDefault();
        App.readForm();

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.hatchChicken(
                web3.fromAscii(App.skuPoultry),
                web3.fromAscii(App.originPoultryName),
                web3.fromAscii(App.originPoultryLatitude),
                web3.fromAscii(App.originPoultryLongitude)
            );
        }).then(function(result) {
            console.log('hatched chicken', result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    raiseChicken: function(event) {
        event.preventDefault();
        App.readForm();

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.raiseChicken(App.upcPoultry);
        }).then(function(result) {
            console.log('raised chicken', result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    sellForSlaughter: function(event) {
        event.preventDefault();
        App.readForm();

        App.contracts.SupplyChain.deployed().then(function(instance) {
            const price = web3.toWei(App.pricePoultry, "ether");
            console.log('pricePoultry', price);
            return instance.sellForSlaughter(App.upcPoultry, price);
        }).then(function(result) {
            console.log('sold chicken for slaughter', result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    purchaseHealthy: function(event) {
        event.preventDefault();
        App.readForm();

        App.contracts.SupplyChain.deployed().then(function(instance) {
            const price = web3.toWei(App.priceSlaughterHouse, "ether");
            console.log('priceSlaughterHouse', price);
            return instance.purchaseHealthy(
                App.upcSlaughterHouse,
                web3.fromAscii(App.skuSlaughterHouse), {
                    value: price
                }
            );
        }).then(function(result) {
            console.log('purchased healthy chicken', result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    slaughter: function(event) {
        event.preventDefault();
        App.readForm();

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.slaughter(App.upcSlaughterHouse);
        }).then(function(result) {
            console.log('slaughtered chicken', result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    sellRetail: function(event) {
        event.preventDefault();
        App.readForm();

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.sellRetail(
                App.upcSlaughterHouse,
                App.priceSlaughterHouse
            );
        }).then(function(result) {
            console.log('sold chicken retail', result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    buyRetail: function(event) {
        event.preventDefault();
        App.readForm();

        App.contracts.SupplyChain.deployed().then(function(instance) {
            const price = web3.toWei(App.priceConsumer, "ether");
            console.log('priceConsumer', price);
            return instance.buyRetail(App.upcConsumer, {value: price});
        }).then(function(result) {
            console.log('bought chicken retail', result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    fetchChicken: function(event) {
        if (event)
            event.preventDefault();

        App.readForm();
        console.log('upc', App.upc);

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.fetchChicken(App.upc);
        }).then(function(result) {
            console.log('fetchChicken', result);
            let details = [];
            result.forEach((val, i) => {
                details.push(App.detailsMapping[i] + " : " + val);
            });
            $("#hcd-chicken").text(details.join(" || "));
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    fetchEvents: function(event) {
        if (typeof App.contracts.SupplyChain.currentProvider.sendAsync !==
            "function") {
            App.contracts.SupplyChain.currentProvider.sendAsync = function() {
                return App.contracts.SupplyChain.currentProvider.send.apply(
                    App.contracts.SupplyChain.currentProvider,
                    arguments
                );
            };
        }

        App.contracts.SupplyChain.deployed().then(function(instance) {
            var events = instance.allEvents(function(err, log) {
                if (!err)
                    $("#hcd-events").append('<li>' + log.event +
                        ' - ' + log.transactionHash + '</li>');
            });
        }).catch(function(err) {
            console.log(err.message);
        });
    }
};

$(function() {
    $(window).load(function() {
        App.init();
    });
});
