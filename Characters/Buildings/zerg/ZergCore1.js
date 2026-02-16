Building.ZergBuilding.Hatchery = Building.ZergBuilding.extends({
    constructorPlus: function (props) {
        this.larvas = [];
    },
    prototypePlus: {
        name: "Hatchery",
        imgPos: {
            dock: {
                left: 20,
                top: 44
            }
        },
        width: 128,
        height: 94,
        frame: {
            dock: 1
        },
        HP: 1250,
        manPlus: 10,
        produceLarva: true,
        requiresCreep: false,
        cost: {
            mine: 300,
            time: 1200
        },
        items: {
            '1': { name: 'SelectLarva' },
            '2': { name: 'SetRallyPoint' },
            '3': { name: 'EvolveBurrow' },
            '7': {
                name: 'Lair', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'SpawningPool';
                    })
                }
            }
        }
    }
});
Building.ZergBuilding.Lair = Building.ZergBuilding.extends({
    constructorPlus: function (props) {
        this.larvas = [];
    },
    prototypePlus: {
        name: "Lair",
        imgPos: {
            dock: {
                left: 22,
                top: 172
            }
        },
        width: 136,
        height: 114,
        frame: {
            dock: 1
        },
        HP: 1800,
        manPlus: 10,
        produceLarva: true,
        cost: {
            mine: 150,
            gas: 100,
            time: 1000
        },
        items: {
            '1': { name: 'SelectLarva' },
            '2': { name: 'SetRallyPoint' },
            '3': { name: 'EvolveBurrow' },
            '4': { name: 'EvolveVentralSacs' },
            '5': { name: 'EvolveAntennas' },
            '6': { name: 'EvolvePneumatizedCarapace' },
            '7': {
                name: 'Hive', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'QueenNest';
                    })
                }
            }
        }
    }
});
Building.ZergBuilding.Hive = Building.ZergBuilding.extends({
    constructorPlus: function (props) {
        this.larvas = [];
    },
    prototypePlus: {
        name: "Hive",
        imgPos: {
            dock: {
                left: 26,
                top: 300
            }
        },
        width: 130,
        height: 132,
        frame: {
            dock: 1
        },
        HP: 2500,
        manPlus: 10,
        produceLarva: true,
        cost: {
            mine: 200,
            gas: 150,
            time: 1200
        },
        items: {
            '1': { name: 'SelectLarva' },
            '2': { name: 'SetRallyPoint' },
            '3': { name: 'EvolveBurrow' },
            '4': { name: 'EvolveVentralSacs' },
            '5': { name: 'EvolveAntennas' },
            '6': { name: 'EvolvePneumatizedCarapace' }
        }
    }
});
Building.ZergBuilding.CreepColony = Building.ZergBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "CreepColony",
        imgPos: {
            dock: {
                left: 924,
                top: 544
            }
        },
        width: 72,
        height: 66,
        frame: {
            dock: 1
        },
        HP: 400,
        cost: {
            mine: 75,
            time: 200
        },
        items: {
            '7': {
                name: 'SporeColony', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'EvolutionChamber';
                    })
                }
            },
            '8': {
                name: 'SunkenColony', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'SpawningPool';
                    })
                }
            }
        }
    }
});
Building.ZergBuilding.SunkenColony = Building.ZergBuilding.extends(Building.Attackable).extends({
    constructorPlus: function (props) {
        this.sound.attack = new Audio('bgm/Colony.attack.wav');
    },
    prototypePlus: {
        name: "SunkenColony",
        imgPos: {
            dock: {
                left: 916,
                top: 714
            },
            attack: {
                left: [20, 116, 212, 308, 404, 500, 596, 692, 788, 884],
                top: [802, 802, 802, 802, 802, 802, 802, 802, 802, 802]
            }
        },
        width: 84,
        height: 66,
        frame: {
            dock: 10
        },
        HP: 300,
        cost: {
            mine: 50,
            time: 200
        },
        damage: 40,
        attackRange: 245,
        attackInterval: 2200,
        attackLimit: "ground",
        attackEffect: Burst.Sunken,
        attackType: AttackableUnit.BURST_ATTACK
    }
});
Building.ZergBuilding.SporeColony = Building.ZergBuilding.extends(Building.Attackable).extends({
    constructorPlus: function (props) {
        this.imgPos.attack = this.imgPos.dock;
        this.frame.attack = this.frame.dock;
        this.sound.attack = new Audio('bgm/Colony.attack.wav');
    },
    prototypePlus: {
        name: "SporeColony",
        imgPos: {
            dock: {
                left: 924,
                top: 618
            }
        },
        width: 70,
        height: 80,
        frame: {
            dock: 1
        },
        HP: 400,
        detector: Gobj.detectorBuffer,
        cost: {
            mine: 50,
            time: 200
        },
        damage: 15,
        attackRange: 245,
        attackInterval: 1500,
        attackLimit: "flying",
        attackType: AttackableUnit.NORMAL_ATTACK
    }
});
Building.ZergBuilding.Extractor = Building.ZergBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "Extractor",
        imgPos: {
            dock: {
                left: 768,
                top: 26
            }
        },
        width: 128,
        height: 116,
        frame: {
            dock: 1
        },
        HP: 750,
        requiresCreep: false,
        cost: {
            mine: 50,
            time: 400
        }
    }
});
Building.ZergBuilding.SpawningPool = Building.ZergBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "SpawningPool",
        imgPos: {
            dock: {
                left: 784,
                top: 210
            }
        },
        width: 100,
        height: 78,
        frame: {
            dock: 1
        },
        HP: 750,
        cost: {
            mine: 150,
            time: 800
        },
        items: {
            '1': { name: 'EvolveMetabolicBoost' },
            '2': { name: 'EvolveAdrenalGlands' }
        }
    }
});
