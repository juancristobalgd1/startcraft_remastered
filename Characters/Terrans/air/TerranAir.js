Terran.Wraith = AttackableUnit.extends({
    constructorPlus: function (props) {
        this.imgPos.dock = this.imgPos.moving;
        this.frame.dock = this.frame.moving;
        this.sound.attackG = new Audio('bgm/' + this.name + '.attack.wav');
        this.sound.attackF = new Audio('bgm/' + this.name + '.attackF.wav');
    },
    prototypePlus: {
        name: "Wraith",
        imgPos: {
            moving: {
                left: [5, 167, 112, 59, 5, 167, 112, 59],
                top: [43, 3, 3, 3, 3, 41, 41, 41]
            }
        },
        width: 50,
        height: 41,
        frame: {
            moving: 1
        },
        speed: Unit.getSpeedMatrixBy(16),
        HP: 120,
        armor: 0,
        MP: 200,
        sight: 245,
        attackMode: {
            flying: {
                attackRange: 175,
                attackInterval: 2200,
                damage: 20,
                attackType: AttackableUnit.BURST_ATTACK
            },
            ground: {
                attackRange: 105,
                attackInterval: 2200,
                damage: 8,
                attackType: AttackableUnit.NORMAL_ATTACK
            },
            status: false
        },
        damage: 8,
        attackRange: 105,
        portraitOffset: { x: 480, y: 56 },
        dieEffect: Burst.MiddleExplode,
        isFlying: true,
        unitType: Unit.BIG,
        recover: Building.TerranBuilding.prototype.recover,
        cost: {
            mine: 150,
            gas: 100,
            man: 2,
            time: 600
        },
        upgrade: ['UpgradeShipWeapons', 'UpgradeShipArmors'],
        items: {
            '7': {
                name: 'Cloak', condition: function () {
                    return Magic.Cloak.enabled
                }
            }
        },
        dock: function () {
            AttackableUnit.hover.call(this);
        }
    }
});
Terran.Dropship = Unit.extends({
    constructorPlus: function (props) {
        this.imgPos.dock = this.imgPos.moving;
        this.frame.dock = this.frame.moving;
    },
    prototypePlus: {
        name: "Dropship",
        imgPos: {
            moving: {
                left: [0, 60, 120, 180, 240, 60, 120, 180],
                top: [0, 0, 0, 0, 0, 60, 60, 60]
            }
        },
        width: 60,
        height: 60,
        frame: {
            moving: 1
        },
        speed: Unit.getSpeedMatrixBy(13),
        HP: 150,
        armor: 1,
        sight: 280,
        portraitOffset: { x: 540, y: 56 },
        dieEffect: Burst.MiddleExplode,
        isFlying: true,
        unitType: Unit.BIG,
        recover: Building.TerranBuilding.prototype.recover,
        cost: {
            mine: 100,
            gas: 100,
            man: 2,
            time: 500
        },
        upgrade: ['UpgradeShipArmors'],
        items: {
            '8': { name: 'Load' }
        },
        dock: function () {
            Unit.hover.call(this);
        }
    }
});
Terran.Vessel = Unit.extends({
    constructorPlus: function (props) {
        this.imgPos.dock = this.imgPos.moving;
        this.frame.dock = this.frame.moving;
    },
    prototypePlus: {
        name: "Vessel",
        imgPos: {
            moving: {
                left: [14, 14, 14, 14, 14, 14, 14, 14],
                top: [24, 24, 24, 24, 24, 24, 24, 24]
            }
        },
        width: 70,
        height: 55,
        frame: {
            moving: 1
        },
        speed: Unit.getSpeedMatrixBy(12),
        HP: 200,
        armor: 1,
        MP: 200,
        sight: 350,
        portraitOffset: { x: 600, y: 56 },
        dieEffect: Burst.BigExplode,
        isFlying: true,
        unitType: Unit.BIG,
        detector: Gobj.detectorBuffer,
        recover: Building.TerranBuilding.prototype.recover,
        cost: {
            mine: 100,
            gas: 225,
            man: 2,
            time: 800
        },
        upgrade: ['UpgradeShipArmors'],
        items: {
            '7': { name: 'DefensiveMatrix' },
            '8': {
                name: 'EMPShockwave', condition: function () {
                    return Magic.EMPShockwave.enabled
                }
            },
            '9': {
                name: 'Irradiate', condition: function () {
                    return Magic.Irradiate.enabled
                }
            }
        },
        dock: function () {
            Unit.hover.call(this);
        }
    }
});
Terran.BattleCruiser = AttackableUnit.extends({
    constructorPlus: function (props) {
        this.imgPos.dock = this.imgPos.moving;
        this.frame.dock = this.frame.moving;
    },
    prototypePlus: {
        name: "BattleCruiser",
        imgPos: {
            moving: {
                left: [0, 95, 195, 297, 0, 99, 201, 301],
                top: [81, 81, 81, 81, 0, 0, 0, 0]
            }
        },
        width: 94,
        height: 80,
        frame: {
            moving: 1
        },
        speed: Unit.getSpeedMatrixBy(6),
        HP: 500,
        damage: 25,
        armor: 3,
        MP: 200,
        sight: 385,
        attackRange: 210,
        attackInterval: 3000,
        portraitOffset: { x: 660, y: 56 },
        dieEffect: Burst.BigExplode,
        isFlying: true,
        unitType: Unit.BIG,
        attackType: AttackableUnit.NORMAL_ATTACK,
        recover: Building.TerranBuilding.prototype.recover,
        cost: {
            mine: 400,
            gas: 300,
            man: 8,
            time: 1330
        },
        upgrade: ['UpgradeShipWeapons', 'UpgradeShipArmors'],
        items: {
            '7': {
                name: 'Yamato', condition: function () {
                    return Magic.Yamato.enabled
                }
            }
        },
        dock: function () {
            AttackableUnit.hover.call(this);
        }
    }
});
Terran.Valkyrie = AttackableUnit.extends({
    constructorPlus: function (props) {
        this.imgPos.attack = this.imgPos.dock = this.imgPos.moving;
        this.frame.attack = this.frame.dock = this.frame.moving;
    },
    prototypePlus: {
        name: "Valkyrie",
        imgPos: {
            moving: {
                left: [35, 163, 291, 419, 547, 163, 291, 419],
                top: [35, 35, 35, 35, 35, 163, 163, 163]
            }
        },
        width: 58,
        height: 58,
        frame: {
            moving: 1
        },
        speed: Unit.getSpeedMatrixBy(16),
        HP: 200,
        damage: 6,
        armor: 2,
        sight: 280,
        attackRange: 210,
        attackInterval: 600,
        portraitOffset: { x: 720, y: 56 },
        dieEffect: Burst.MiddleExplode,
        isFlying: true,
        attackLimit: "flying",
        unitType: Unit.BIG,
        attackType: AttackableUnit.BURST_ATTACK,
        recover: Building.TerranBuilding.prototype.recover,
        AOE: {
            type: "LINE",
            hasEffect: true,
            radius: 50
        },
        cost: {
            mine: 250,
            gas: 125,
            man: 3,
            time: 500
        },
        upgrade: ['UpgradeShipWeapons', 'UpgradeShipArmors'],
        dock: function () {
            AttackableUnit.hover.call(this);
        }
    }
});
