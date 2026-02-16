Button.basicZergMutations = {
    items: {
        '1': { name: 'Hatchery' },
        '2': {
            name: 'CreepColony', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Hatchery' || chara.name == 'Lair' || chara.name == 'Hive';
                })
            }
        },
        '3': {
            name: 'Extractor', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Hatchery' || chara.name == 'Lair' || chara.name == 'Hive';
                })
            }
        },
        '4': {
            name: 'SpawningPool', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Hatchery' || chara.name == 'Lair' || chara.name == 'Hive';
                })
            }
        },
        '5': {
            name: 'EvolutionChamber', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Hatchery' || chara.name == 'Lair' || chara.name == 'Hive';
                })
            }
        },
        '7': {
            name: 'HydraliskDen', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'SpawningPool';
                })
            }
        },
        '9': { name: 'Cancel' }
    }
};
Button.advancedZergMutations = {
    items: {
        '1': {
            name: 'Spire', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Lair' || chara.name == 'Hive';
                })
            }
        },
        '2': {
            name: 'QueenNest', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Lair' || chara.name == 'Hive';
                })
            }
        },
        '3': {
            name: 'NydusCanal', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Hive';
                })
            }
        },
        '4': {
            name: 'UltraliskCavern', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Hive';
                })
            }
        },
        '5': {
            name: 'DefilerMound', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Hive';
                })
            }
        },
        '9': { name: 'Cancel' }
    }
};
Button.basicTerranBuildings = {
    items: {
        '1': { name: 'CommandCenter' },
        '2': {
            name: 'SupplyDepot', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'CommandCenter';
                })
            }
        },
        '3': {
            name: 'Refinery', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'CommandCenter';
                })
            }
        },
        '4': {
            name: 'Barracks', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'CommandCenter';
                })
            }
        },
        '5': {
            name: 'EngineeringBay', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'CommandCenter';
                })
            }
        },
        '6': {
            name: 'MissileTurret', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'EngineeringBay';
                })
            }
        },
        '7': {
            name: 'Academy', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Barracks';
                })
            }
        },
        '8': {
            name: 'Bunker', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Barracks';
                })
            }
        },
        '9': { name: 'Cancel' }
    }
};
Button.advancedTerranBuildings = {
    items: {
        '1': {
            name: 'Factory', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Barracks';
                })
            }
        },
        '2': {
            name: 'Starport', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Factory';
                })
            }
        },
        '3': {
            name: 'ScienceFacility', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Starport';
                })
            }
        },
        '4': {
            name: 'Armory', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Factory';
                })
            }
        },
        '9': { name: 'Cancel' }
    }
};
Button.basicProtossStructures = {
    items: {
        '1': { name: 'Nexus' },
        '2': {
            name: 'Pylon', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Nexus';
                })
            }
        },
        '3': {
            name: 'Assimilator', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Nexus';
                })
            }
        },
        '4': {
            name: 'Gateway', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Nexus';
                })
            }
        },
        '5': {
            name: 'Forge', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Nexus';
                })
            }
        },
        '6': {
            name: 'PhotonCannon', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Forge';
                })
            }
        },
        '7': {
            name: 'CyberneticsCore', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Gateway';
                })
            }
        },
        '8': {
            name: 'ShieldBattery', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Gateway';
                })
            }
        },
        '9': { name: 'Cancel' }
    }
};
Button.advancedProtossStructures = {
    items: {
        '1': {
            name: 'RoboticsFacility', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'CyberneticsCore';
                })
            }
        },
        '2': {
            name: 'StarGate', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'CyberneticsCore';
                })
            }
        },
        '3': {
            name: 'CitadelOfAdun', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'CyberneticsCore';
                })
            }
        },
        '4': {
            name: 'RoboticsSupportBay', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'RoboticsFacility';
                })
            }
        },
        '5': {
            name: 'FleetBeacon', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'StarGate';
                })
            }
        },
        '6': {
            name: 'TemplarArchives', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'CitadelOfAdun';
                })
            }
        },
        '7': {
            name: 'Observatory', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'RoboticsFacility';
                })
            }
        },
        '8': {
            name: 'ArbiterTribunal', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'StarGate';
                })
            }
        },
        '9': { name: 'Cancel' }
    }
};
