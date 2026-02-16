Terran.Vulture = AttackableUnit.extends({
    constructorPlus: function (props) {
        this.imgPos.attack = this.imgPos.dock = this.imgPos.moving;
        this.frame.attack = this.frame.dock = this.frame.moving;
        this.spiderMines = 3;
    },
    prototypePlus: {
        name: "Vulture",
        imgPos: {
            moving: {
                left: [10, 210, 410, 610, 810, 210, 410, 610],
                top: [10, 10, 10, 10, 10, 110, 110, 110]
            }
        },
        width: 80,
        height: 80,
        frame: {
            moving: 1
        },
        speed: Unit.getSpeedMatrixBy(16),
        HP: 80,
        damage: 20,
        armor: 0,
        sight: 280,
        attackRange: 175,
        attackInterval: 3000,
        portraitOffset: { x: 300, y: 56 },
        dieEffect: Burst.MiddleExplode,
        isFlying: false,
        attackLimit: "ground",
        unitType: Unit.MIDDLE,
        attackType: AttackableUnit.WAVE_ATTACK,
        recover: Building.TerranBuilding.prototype.recover,
        cost: {
            mine: 75,
            man: 2,
            time: 300
        },
        upgrade: ['UpgradeVehicleWeapons', 'UpgradeVehicleArmors'],
        items: {
            '7': {
                name: 'SpiderMines', condition: function () {
                    return Magic.SpiderMines.enabled
                }
            }
        }
    }
});
Terran.Tank = AttackableUnit.extends({
    constructorPlus: function (props) {
        this.imgPos.attack = this.imgPos.dock;
        this.frame.attack = this.frame.dock;
    },
    prototypePlus: {
        name: "Tank",
        imgPos: {
            moving: {
                left: [
                    [24, 24, 24],
                    [280, 280, 280],
                    [536, 536, 536],
                    [792, 792, 792],
                    [1048, 1048, 1048],
                    [1432, 1432, 1432],
                    [1688, 1688, 1688],
                    [1944, 1944, 1944]
                ],
                top: [
                    [24, 152, 280],
                    [24, 152, 280],
                    [24, 152, 280],
                    [24, 152, 280],
                    [24, 152, 280],
                    [24, 152, 280],
                    [24, 152, 280],
                    [24, 152, 280]
                ]
            },
            dock: {
                left: [24, 280, 536, 792, 1048, 1432, 1688, 1944],
                top: [24, 24, 24, 24, 24, 24, 24, 24]
            }
        },
        width: 80,
        height: 80,
        frame: {
            moving: 3,
            dock: 1
        },
        speed: Unit.getSpeedMatrixBy(10),
        HP: 150,
        damage: 30,
        armor: 1,
        sight: 350,
        attackRange: 210,
        attackInterval: 3700,
        portraitOffset: { x: 360, y: 56 },
        dieEffect: Burst.BigExplode,
        attackEffect: Burst.FireSpark,
        isFlying: false,
        attackLimit: "ground",
        unitType: Unit.BIG,
        attackType: AttackableUnit.BURST_ATTACK,
        recover: Building.TerranBuilding.prototype.recover,
        cost: {
            mine: 150,
            gas: 100,
            man: 2,
            time: 500
        },
        upgrade: ['UpgradeVehicleWeapons', 'UpgradeVehicleArmors'],
        items: {
            '7': {
                name: 'SeigeMode', condition: function () {
                    return Magic.SeigeMode.enabled
                }
            }
        }
    }
});
Terran.Goliath = AttackableUnit.extends({
    constructorPlus: function (props) {
        this.sound.attackG = new Audio('bgm/' + this.name + '.attack.wav');
        this.sound.attackF = new Audio('bgm/' + this.name + '.attackF.wav');
    },
    prototypePlus: {
        name: "Goliath",
        imgPos: {
            moving: {
                left: [
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [152, 152, 152, 152, 152, 152, 152, 152, 152, 152],
                    [304, 304, 304, 304, 304, 304, 304, 304, 304, 304],
                    [456, 456, 456, 456, 456, 456, 456, 456, 456, 456],
                    [608, 608, 608, 608, 608, 608, 608, 608, 608, 608],
                    [836, 836, 836, 836, 836, 836, 836, 836, 836, 836],
                    [988, 988, 988, 988, 988, 988, 988, 988, 988, 988],
                    [1140, 1140, 1140, 1140, 1140, 1140, 1140, 1140, 1140, 1140]
                ],
                top: [
                    [0, 76, 152, 228, 304, 380, 456, 532, 608, 684],
                    [0, 76, 152, 228, 304, 380, 456, 532, 608, 684],
                    [0, 76, 152, 228, 304, 380, 456, 532, 608, 684],
                    [0, 76, 152, 228, 304, 380, 456, 532, 608, 684],
                    [0, 76, 152, 228, 304, 380, 456, 532, 608, 684],
                    [0, 76, 152, 228, 304, 380, 456, 532, 608, 684],
                    [0, 76, 152, 228, 304, 380, 456, 532, 608, 684],
                    [0, 76, 152, 228, 304, 380, 456, 532, 608, 684]
                ]
            },
            attack: {
                left: [
                    [0, 0],
                    [152, 152],
                    [304, 304],
                    [456, 456],
                    [608, 608],
                    [836, 836],
                    [988, 988],
                    [1140, 1140]
                ],
                top: [
                    [684, 760],
                    [684, 760],
                    [684, 760],
                    [684, 760],
                    [684, 760],
                    [684, 760],
                    [684, 760],
                    [684, 760]
                ]
            },
            dock: {
                left: [0, 152, 304, 456, 608, 836, 988, 1140],
                top: [228, 228, 228, 228, 228, 228, 228, 228]
            }
        },
        width: 76,
        height: 76,
        frame: {
            moving: 10,
            dock: 1,
            attack: 2
        },
        speed: Unit.getSpeedMatrixBy(11),
        HP: 125,
        attackMode: {
            flying: {
                attackRange: 175,
                attackInterval: 2200,
                damage: 20,
                attackType: AttackableUnit.BURST_ATTACK
            },
            ground: {
                attackRange: 175,
                attackEffect: Burst.ShootSpark,
                attackInterval: 2200,
                damage: 12,
                attackType: AttackableUnit.NORMAL_ATTACK
            },
            status: false
        },
        damage: 12,
        armor: 1,
        sight: 280,
        attackRange: 175,
        portraitOffset: { x: 420, y: 56 },
        dieEffect: Burst.MiddleExplode,
        isFlying: false,
        unitType: Unit.BIG,
        recover: Building.TerranBuilding.prototype.recover,
        cost: {
            mine: 100,
            gas: 50,
            man: 2,
            time: 400
        },
        upgrade: ['UpgradeVehicleWeapons', 'UpgradeVehicleArmors']
    }
});
