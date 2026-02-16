Building.ProtossBuilding.RoboticsFacility = Building.ProtossBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "RoboticsFacility",
        imgPos: {
            dock: {
                left: 504,
                top: 166
            }
        },
        width: 96,
        height: 92,
        frame: {
            dock: 1
        },
        HP: 500,
        SP: 500,
        cost: {
            mine: 200,
            gas: 200,
            time: 800
        },
        items: {
            '1': { name: 'Shuttle' },
            '2': {
                name: 'Reaver', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'RoboticsSupportBay';
                    })
                }
            },
            '3': {
                name: 'Observer', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Observatory';
                    })
                }
            },
            '6': { name: 'SetRallyPoint' }
        }
    }
});
Building.ProtossBuilding.StarGate = Building.ProtossBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "StarGate",
        imgPos: {
            dock: {
                left: 708,
                top: 10
            }
        },
        width: 124,
        height: 116,
        frame: {
            dock: 1
        },
        HP: 600,
        SP: 600,
        cost: {
            mine: 150,
            gas: 150,
            time: 700
        },
        items: {
            '1': { name: 'Scout' },
            '2': {
                name: 'Carrier', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'FleetBeacon';
                    })
                }
            },
            '3': {
                name: 'Arbiter', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'ArbiterTribunal';
                    })
                }
            },
            '4': { name: 'Corsair' },
            '6': { name: 'SetRallyPoint' }
        }
    }
});
Building.ProtossBuilding.CitadelOfAdun = Building.ProtossBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "CitadelOfAdun",
        imgPos: {
            dock: {
                left: 114,
                top: 172
            }
        },
        width: 98,
        height: 86,
        frame: {
            dock: 1
        },
        HP: 450,
        SP: 450,
        cost: {
            mine: 150,
            gas: 100,
            time: 600
        },
        items: {
            '1': { name: 'DevelopLegEnhancements' }
        }
    }
});
Building.ProtossBuilding.RoboticsSupportBay = Building.ProtossBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "RoboticsSupportBay",
        imgPos: {
            dock: {
                left: 6,
                top: 168
            }
        },
        width: 100,
        height: 88,
        frame: {
            dock: 1
        },
        HP: 450,
        SP: 450,
        cost: {
            mine: 150,
            gas: 100,
            time: 300
        },
        items: {
            '1': { name: 'UpgradeScarabDamage' },
            '2': { name: 'IncreaseReaverCapacity' },
            '3': { name: 'DevelopGraviticDrive' }
        }
    }
});
Building.ProtossBuilding.FleetBeacon = Building.ProtossBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "FleetBeacon",
        imgPos: {
            dock: {
                left: 440,
                top: 26
            }
        },
        width: 136,
        height: 100,
        frame: {
            dock: 1
        },
        HP: 500,
        SP: 500,
        cost: {
            mine: 300,
            gas: 200,
            time: 600
        },
        items: {
            '1': { name: 'DevelopApialSensors' },
            '2': { name: 'DevelopGraviticThrusters' },
            '3': { name: 'IncreaseCarrierCapacity' },
            '4': { name: 'DevelopDistruptionWeb' },
            '5': { name: 'DevelopArgusJewel' }
        }
    }
});
Building.ProtossBuilding.TemplarArchives = Building.ProtossBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "TemplarArchives",
        imgPos: {
            dock: {
                left: 180,
                top: 24
            }
        },
        width: 114,
        height: 104,
        frame: {
            dock: 1
        },
        HP: 500,
        SP: 500,
        cost: {
            mine: 150,
            gas: 200,
            time: 600
        },
        items: {
            '1': { name: 'DevelopPsionicStorm' },
            '2': { name: 'DevelopHallucination' },
            '3': { name: 'DevelopKhaydarinAmulet' },
            '4': { name: 'DevelopMindControl' },
            '5': { name: 'DevelopMaelStorm' },
            '6': { name: 'DevelopArgusTalisman' }
        }
    }
});
