Building.TerranBuilding.ComstatStation = Building.TerranBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "ComstatStation",
        imgPos: {
            dock: {
                left: 0,
                top: 122
            }
        },
        width: 68,
        height: 62,
        frame: {
            dock: 1
        },
        HP: 750,
        MP: 200,
        cost: {
            mine: 50,
            gas: 50,
            time: 400
        },
        items: {
            '1': { name: 'ScannerSweep' }
        }
    }
});
Building.TerranBuilding.NuclearSilo = Building.TerranBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "NuclearSilo",
        imgPos: {
            dock: {
                left: 282,
                top: 124
            }
        },
        width: 64,
        height: 60,
        frame: {
            dock: 1
        },
        HP: 600,
        cost: {
            mine: 100,
            gas: 100,
            time: 800
        },
        items: {
            '1': { name: 'ArmNuclearSilo' }
        }
    }
});
Building.TerranBuilding.MachineShop = Building.TerranBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "MachineShop",
        imgPos: {
            dock: {
                left: 208,
                top: 112
            }
        },
        width: 74,
        height: 72,
        frame: {
            dock: 1
        },
        HP: 750,
        cost: {
            mine: 50,
            gas: 50,
            time: 400
        },
        items: {
            '1': { name: 'ResearchIonThrusters' },
            '2': { name: 'ResearchSpiderMines' },
            '3': { name: 'ResearchSiegeTech' },
            '4': { name: 'ResearchCharonBoosters' }
        }
    }
});
Building.TerranBuilding.ControlTower = Building.TerranBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "ControlTower",
        imgPos: {
            dock: {
                left: 68,
                top: 120
            }
        },
        width: 72,
        height: 64,
        frame: {
            dock: 1
        },
        HP: 750,
        cost: {
            mine: 50,
            gas: 50,
            time: 400
        },
        items: {
            '1': { name: 'ResearchCloakingField' },
            '2': { name: 'ResearchApolloReactor' }
        }
    }
});
Building.TerranBuilding.PhysicsLab = Building.TerranBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "PhysicsLab",
        imgPos: {
            dock: {
                left: 348,
                top: 120
            }
        },
        width: 66,
        height: 64,
        frame: {
            dock: 1
        },
        HP: 600,
        cost: {
            mine: 50,
            gas: 50,
            time: 400
        },
        items: {
            '1': { name: 'ResearchYamatoGun' },
            '2': { name: 'ResearchColossusReactor' }
        }
    }
});
Building.TerranBuilding.ConvertOps = Building.TerranBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "ConvertOps",
        imgPos: {
            dock: {
                left: 140,
                top: 132
            }
        },
        width: 68,
        height: 52,
        frame: {
            dock: 1
        },
        HP: 750,
        cost: {
            mine: 50,
            gas: 50,
            time: 400
        },
        items: {
            '1': { name: 'ResearchLockdown' },
            '2': { name: 'ResearchPersonalCloaking' },
            '4': { name: 'ResearchOcularImplants' },
            '5': { name: 'ResearchMoebiusReactor' }
        }
    }
});
