Building.TerranBuilding.CommandCenter = Building.TerranBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "CommandCenter",
        imgPos: {
            dock: {
                left: 0,
                top: 6
            }
        },
        width: 129,
        height: 106,
        frame: {
            dock: 1
        },
        HP: 1500,
        manPlus: 10,
        requiresPower: false,
        cost: {
            mine: 400,
            time: 1200
        },
        items: {
            '1': { name: 'SCV' },
            '6': { name: 'SetRallyPoint' },
            '7': {
                name: 'ComstatStation', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Academy';
                    })
                }
            },
            '8': {
                name: 'NuclearSilo', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'ConvertOps';
                    })
                }
            },
            '9': { name: 'LiftOff' }
        }
    }
});
Building.TerranBuilding.SupplyDepot = Building.TerranBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "SupplyDepot",
        imgPos: {
            dock: {
                left: [0, 95, 190, 285, 380],
                top: [292, 292, 292, 292, 292]
            }
        },
        width: 96,
        height: 76,
        frame: {
            dock: 5
        },
        HP: 500,
        manPlus: 8,
        cost: {
            mine: 100,
            time: 400
        }
    }
});
Building.TerranBuilding.Refinery = Building.TerranBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "Refinery",
        imgPos: {
            dock: {
                left: 256,
                top: 16
            }
        },
        width: 124,
        height: 96,
        frame: {
            dock: 1
        },
        HP: 500,
        cost: {
            mine: 100,
            time: 400
        }
    }
});
Building.TerranBuilding.Barracks = Building.TerranBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "Barracks",
        imgPos: {
            dock: {
                left: 128,
                top: 0
            }
        },
        width: 126,
        height: 110,
        frame: {
            dock: 1
        },
        HP: 1000,
        cost: {
            mine: 150,
            time: 800
        },
        items: {
            '1': { name: 'Marine' },
            '2': {
                name: 'Firebat', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Academy';
                    })
                }
            },
            '3': {
                name: 'Ghost', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'ScienceFacility';
                    }) && Building.ourBuildings.some(function (chara) {
                        return chara.name == 'ConvertOps';
                    })
                }
            },
            '4': {
                name: 'Medic', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Academy';
                    })
                }
            },
            '6': { name: 'SetRallyPoint' },
            '9': { name: 'LiftOff' }
        }
    }
});
Building.TerranBuilding.EngineeringBay = Building.TerranBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "EngineeringBay",
        imgPos: {
            dock: {
                left: 380,
                top: 14
            }
        },
        width: 144,
        height: 98,
        frame: {
            dock: 1
        },
        HP: 850,
        cost: {
            mine: 125,
            time: 600
        },
        items: {
            '1': { name: 'UpgradeInfantryWeapons' },
            '2': { name: 'UpgradeInfantryArmors' }
        }
    }
});
Building.TerranBuilding.MissileTurret = Building.TerranBuilding.extends(Building.Attackable).extends({
    constructorPlus: function (props) {
        this.imgPos.attack = this.imgPos.dock;
        this.frame.attack = this.frame.dock;
        this.sound.attack = new Audio('bgm/Wraith.attackF.wav');
    },
    prototypePlus: {
        name: "MissileTurret",
        imgPos: {
            dock: {
                left: [0, 44, 88, 132, 176, 220, 264, 308, 352, 396,
                    440, 484, 528, 572, 616, 660, 704, 748, 792],
                top: [368, 368, 368, 368, 368, 368, 368, 368, 368, 368,
                    368, 368, 368, 368, 368, 368, 368, 368, 368]
            }
        },
        width: 44,
        height: 56,
        frame: {
            dock: 19
        },
        HP: 200,
        detector: Gobj.detectorBuffer,
        cost: {
            mine: 100,
            time: 300
        },
        damage: 20,
        attackRange: 245,
        attackInterval: 1500,
        attackLimit: "flying",
        attackType: AttackableUnit.BURST_ATTACK
    }
});
Building.TerranBuilding.Academy = Building.TerranBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "Academy",
        imgPos: {
            dock: {
                left: 526,
                top: 16
            }
        },
        width: 92,
        height: 96,
        frame: {
            dock: 1
        },
        HP: 600,
        cost: {
            mine: 150,
            time: 800
        },
        items: {
            '1': { name: 'ResearchU238Shells' },
            '2': { name: 'ResearchStimPackTech' },
            '4': { name: 'ResearchRestoration' },
            '5': { name: 'ResearchOpticalFlare' },
            '6': { name: 'ResearchCaduceusReactor' }
        }
    }
});
Building.TerranBuilding.Bunker = Building.TerranBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "Bunker",
        imgPos: {
            dock: {
                left: 620,
                top: 50
            }
        },
        width: 96,
        height: 62,
        frame: {
            dock: 1
        },
        HP: 350,
        cost: {
            mine: 100,
            time: 300
        },
        items: {
            '8': { name: 'Load' }
        }
    }
});
