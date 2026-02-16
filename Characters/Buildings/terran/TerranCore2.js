Building.TerranBuilding.Factory = Building.TerranBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "Factory",
        imgPos: {
            dock: {
                left: 716,
                top: 0
            }
        },
        width: 114,
        height: 112,
        frame: {
            dock: 1
        },
        HP: 1250,
        cost: {
            mine: 200,
            gas: 100,
            time: 800
        },
        items: {
            '1': { name: 'Vulture' },
            '2': {
                name: 'Tank', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'MachineShop';
                    })
                }
            },
            '3': {
                name: 'Goliath', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Armory';
                    })
                }
            },
            '6': { name: 'SetRallyPoint' },
            '7': { name: 'MachineShop' },
            '9': { name: 'LiftOff' }
        }
    }
});
Building.TerranBuilding.Starport = Building.TerranBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "Starport",
        imgPos: {
            dock: {
                left: 830,
                top: 4
            }
        },
        width: 108,
        height: 108,
        frame: {
            dock: 1
        },
        HP: 1300,
        cost: {
            mine: 150,
            gas: 100,
            time: 700
        },
        items: {
            '1': { name: 'Wraith' },
            '2': {
                name: 'Dropship', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'ControlTower';
                    })
                }
            },
            '3': {
                name: 'Vessel', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'ControlTower';
                    }) && Building.ourBuildings.some(function (chara) {
                        return chara.name == 'ScienceFacility';
                    })
                }
            },
            '4': {
                name: 'BattleCruiser', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'ControlTower';
                    }) && Building.ourBuildings.some(function (chara) {
                        return chara.name == 'ScienceFacility';
                    }) && Building.ourBuildings.some(function (chara) {
                        return chara.name == 'PhysicsLab';
                    })
                }
            },
            '5': {
                name: 'Valkyrie', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'ControlTower';
                    }) && Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Armory';
                    })
                }
            },
            '6': { name: 'SetRallyPoint' },
            '7': { name: 'ControlTower' },
            '9': { name: 'LiftOff' }
        }
    }
});
Building.TerranBuilding.ScienceFacility = Building.TerranBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "ScienceFacility",
        imgPos: {
            dock: {
                left: 1042,
                top: 20
            }
        },
        width: 108,
        height: 92,
        frame: {
            dock: 1
        },
        HP: 850,
        cost: {
            mine: 100,
            gas: 150,
            time: 600
        },
        items: {
            '1': { name: 'ResearchEMPShockwaves' },
            '2': { name: 'ResearchIrradiate' },
            '3': { name: 'ResearchTitanReactor' },
            '7': { name: 'PhysicsLab' },
            '8': { name: 'ConvertOps' },
            '9': { name: 'LiftOff' }
        }
    }
});
Building.TerranBuilding.Armory = Building.TerranBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "Armory",
        imgPos: {
            dock: {
                left: 938,
                top: 14
            }
        },
        width: 102,
        height: 98,
        frame: {
            dock: 1
        },
        HP: 750,
        cost: {
            mine: 100,
            gas: 50,
            time: 800
        },
        items: {
            '1': { name: 'UpgradeVehicleWeapons' },
            '2': { name: 'UpgradeShipWeapons' },
            '4': { name: 'UpgradeVehicleArmors' },
            '5': { name: 'UpgradeShipArmors' }
        }
    }
});
