import Terran from '../core/TerranBase.js';
import AttackableUnit from '../../Units/core/AttackableUnitBase.js';
import Unit from '../../Units/core/UnitBase.js';
import Building from '../../Buildings/core/BuildingBase.js';
import { recover } from '../core/TerranHelper.js';
import Magic from '../../Magics/core/MagicBase.js';
import { HumanDeath, FireSpark, MedicDeath } from '../../Bursts/terran/TerranEffects.js';
import { ShootSpark } from '../../Bursts/protoss/ProtossEffects1.js';
import { SmallExplode } from '../../Bursts/buildings/BuildingBursts.js';

Terran.Marine = AttackableUnit.extends({
    constructorPlus: function (props) {
    },
    prototypePlus: {
        name: "Marine",
        imgPos: {
            moving: {
                left: [
                    [10, 10, 10, 10, 10, 10, 10, 10, 10],
                    [138, 138, 138, 138, 138, 138, 138, 138, 138],
                    [266, 266, 266, 266, 266, 266, 266, 266, 266],
                    [394, 394, 394, 394, 394, 394, 394, 394, 394],
                    [522, 522, 522, 522, 522, 522, 522, 522, 522],
                    [714, 714, 714, 714, 714, 714, 714, 714, 714],
                    [842, 842, 842, 842, 842, 842, 842, 842, 842],
                    [970, 970, 970, 970, 970, 970, 970, 970, 970]
                ],
                top: [
                    [266, 330, 394, 458, 522, 586, 650, 714, 778],
                    [266, 330, 394, 458, 522, 586, 650, 714, 778],
                    [266, 330, 394, 458, 522, 586, 650, 714, 778],
                    [266, 330, 394, 458, 522, 586, 650, 714, 778],
                    [266, 330, 394, 458, 522, 586, 650, 714, 778],
                    [266, 330, 394, 458, 522, 586, 650, 714, 778],
                    [266, 330, 394, 458, 522, 586, 650, 714, 778],
                    [266, 330, 394, 458, 522, 586, 650, 714, 778]
                ]
            },
            attack: {
                left: [
                    [10, 10, 10, 10, 10, 10, 10],
                    [138, 138, 138, 138, 138, 138, 138],
                    [266, 266, 266, 266, 266, 266, 266],
                    [394, 394, 394, 394, 394, 394, 394],
                    [522, 522, 522, 522, 522, 522, 522],
                    [714, 714, 714, 714, 714, 714, 714],
                    [842, 842, 842, 842, 842, 842, 842],
                    [970, 970, 970, 970, 970, 970, 970]
                ],
                top: [
                    [74, 138, 202, 138, 202, 138, 202],
                    [74, 138, 202, 138, 202, 138, 202],
                    [74, 138, 202, 138, 202, 138, 202],
                    [74, 138, 202, 138, 202, 138, 202],
                    [74, 138, 202, 138, 202, 138, 202],
                    [74, 138, 202, 138, 202, 138, 202],
                    [74, 138, 202, 138, 202, 138, 202],
                    [74, 138, 202, 138, 202, 138, 202]
                ]
            },
            dock: {
                left: [10, 138, 266, 394, 522, 714, 842, 970],
                top: [10, 10, 10, 10, 10, 10, 10, 10]
            }
        },
        width: 44,
        height: 44,
        frame: {
            moving: 9,
            dock: 1,
            attack: 7
        },
        speed: Unit.getSpeedMatrixBy(10),
        HP: 40,
        damage: 6,
        armor: 0,
        sight: 245,
        attackRange: 140,
        attackInterval: 1500,
        damageDelay: 100,
        portraitOffset: { x: 60, y: 56 },
        dieEffect: HumanDeath,
        attackEffect: ShootSpark,
        isFlying: false,
        unitType: Unit.SMALL,
        attackType: AttackableUnit.NORMAL_ATTACK,
        recover: recover,
        cost: {
            mine: 50,
            man: 1,
            time: 240
        },
        upgrade: ['UpgradeInfantryWeapons', 'UpgradeInfantryArmors'],
        items: {
            '7': {
                name: 'StimPacks', condition: function () {
                    return Magic.StimPacks.enabled
                }
            }
        },
        dock: function () {
            AttackableUnit.turnAround.call(this);
        }
    }
});
Terran.Firebat = AttackableUnit.extends({
    constructorPlus: function (props) {
    },
    prototypePlus: {
        name: "Firebat",
        imgPos: {
            moving: {
                left: [
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [64, 64, 64, 64, 64, 64, 64, 64],
                    [128, 128, 128, 128, 128, 128, 128, 128],
                    [192, 192, 192, 192, 192, 192, 192, 192],
                    [256, 256, 256, 256, 256, 256, 256, 256],
                    [352, 352, 352, 352, 352, 352, 352, 352],
                    [416, 416, 416, 416, 416, 416, 416, 416],
                    [480, 480, 480, 480, 480, 480, 480, 480]
                ],
                top: [
                    [64, 96, 128, 160, 192, 224, 256, 288],
                    [64, 96, 128, 160, 192, 224, 256, 288],
                    [64, 96, 128, 160, 192, 224, 256, 288],
                    [64, 96, 128, 160, 192, 224, 256, 288],
                    [64, 96, 128, 160, 192, 224, 256, 288],
                    [64, 96, 128, 160, 192, 224, 256, 288],
                    [64, 96, 128, 160, 192, 224, 256, 288],
                    [64, 96, 128, 160, 192, 224, 256, 288]
                ]
            },
            dock: {
                left: [0, 64, 128, 192, 256, 352, 416, 480],
                top: [64, 64, 64, 64, 64, 64, 64, 64]
            },
            attack: {
                left: [
                    [0, 0, 0, 0, 0, 0],
                    [64, 64, 64, 64, 64, 64],
                    [128, 128, 128, 128, 128, 128],
                    [192, 192, 192, 192, 192, 192],
                    [256, 256, 256, 256, 256, 256],
                    [352, 352, 352, 352, 352, 352],
                    [416, 416, 416, 416, 416, 416],
                    [480, 480, 480, 480, 480, 480]
                ],
                top: [
                    [0, 32, 32, 32, 32, 32],
                    [0, 32, 32, 32, 32, 32],
                    [0, 32, 32, 32, 32, 32],
                    [0, 32, 32, 32, 32, 32],
                    [0, 32, 32, 32, 32, 32],
                    [0, 32, 32, 32, 32, 32],
                    [0, 32, 32, 32, 32, 32],
                    [0, 32, 32, 32, 32, 32]
                ]
            }
        },
        width: 32,
        height: 32,
        frame: {
            moving: 8,
            dock: 1,
            attack: 6
        },
        speed: Unit.getSpeedMatrixBy(10),
        HP: 50,
        damage: 16,
        armor: 1,
        sight: 245,
        attackRange: 70,
        attackInterval: 2200,
        damageDelay: 100,
        portraitOffset: { x: 120, y: 56 },
        dieEffect: SmallExplode,
        isFlying: false,
        attackLimit: "ground",
        unitType: Unit.SMALL,
        attackType: AttackableUnit.WAVE_ATTACK,
        recover: recover,
        AOE: {
            type: "LINE",
            hasEffect: false,
            radius: 35
        },
        cost: {
            mine: 50,
            gas: 25,
            man: 1,
            time: 240
        },
        upgrade: ['UpgradeInfantryWeapons', 'UpgradeInfantryArmors'],
        items: {
            '7': {
                name: 'StimPacks', condition: function () {
                    return Magic.StimPacks.enabled
                }
            }
        },
        dock: function () {
            AttackableUnit.turnAround.call(this);
        }
    }
});
Terran.Ghost = AttackableUnit.extends({
    constructorPlus: function (props) {
    },
    prototypePlus: {
        name: "Ghost",
        imgPos: {
            moving: {
                left: [
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [86, 86, 86, 86, 86, 86, 86, 86, 86],
                    [172, 172, 172, 172, 172, 172, 172, 172, 172],
                    [258, 258, 258, 258, 258, 258, 258, 258, 258],
                    [344, 344, 344, 344, 344, 344, 344, 344, 344],
                    [473, 473, 473, 473, 473, 473, 473, 473, 473],
                    [559, 559, 559, 559, 559, 559, 559, 559, 559],
                    [645, 645, 645, 645, 645, 645, 645, 645, 645]
                ],
                top: [
                    [0, 39, 78, 117, 156, 195, 234, 273, 312],
                    [0, 39, 78, 117, 156, 195, 234, 273, 312],
                    [0, 39, 78, 117, 156, 195, 234, 273, 312],
                    [0, 39, 78, 117, 156, 195, 234, 273, 312],
                    [0, 39, 78, 117, 156, 195, 234, 273, 312],
                    [0, 39, 78, 117, 156, 195, 234, 273, 312],
                    [0, 39, 78, 117, 156, 195, 234, 273, 312],
                    [0, 39, 78, 117, 156, 195, 234, 273, 312]
                ]
            },
            attack: {
                left: [
                    [0, 0, 0, 0],
                    [86, 86, 86, 86],
                    [172, 172, 172, 172],
                    [258, 258, 258, 258],
                    [344, 344, 344, 344],
                    [473, 473, 473, 473],
                    [559, 559, 559, 559],
                    [645, 645, 645, 645]
                ],
                top: [
                    [351, 390, 429, 468],
                    [351, 390, 429, 468],
                    [351, 390, 429, 468],
                    [351, 390, 429, 468],
                    [351, 390, 429, 468],
                    [351, 390, 429, 468],
                    [351, 390, 429, 468],
                    [351, 390, 429, 468]
                ]
            },
            dock: {
                left: [0, 86, 172, 258, 344, 473, 559, 645],
                top: [0, 0, 0, 0, 0, 0, 0, 0]
            }
        },
        width: 43,
        height: 39,
        frame: {
            moving: 9,
            dock: 1,
            attack: 4
        },
        speed: Unit.getSpeedMatrixBy(10),
        HP: 45,
        damage: 10,
        armor: 0,
        MP: 200,
        sight: 315,
        attackRange: 210,
        attackInterval: 2200,
        damageDelay: 100,
        portraitOffset: { x: 180, y: 56 },
        dieEffect: HumanDeath,
        attackEffect: FireSpark,
        isFlying: false,
        unitType: Unit.SMALL,
        attackType: AttackableUnit.WAVE_ATTACK,
        recover: recover,
        cost: {
            mine: 25,
            gas: 75,
            man: 1,
            time: 500
        },
        upgrade: ['UpgradeInfantryWeapons', 'UpgradeInfantryArmors'],
        items: {
            '7': {
                name: 'Cloak', condition: function () {
                    return Magic.PersonalCloak.enabled
                }
            },
            '8': {
                name: 'Lockdown', condition: function () {
                    return Magic.Lockdown.enabled
                }
            },
            '9': {
                name: 'NuclearStrike', condition: function () {
                    return Magic.NuclearStrike.enabled
                }
            }
        },
        dock: function () {
            AttackableUnit.turnAround.call(this);
        }
    }
});
Terran.Medic = Unit.extends({
    constructorPlus: function (props) {
    },
    prototypePlus: {
        name: "Medic",
        imgPos: {
            moving: {
                left: [
                    [16, 16, 16, 16, 16, 16, 16],
                    [144, 144, 144, 144, 144, 144, 144],
                    [272, 272, 272, 272, 272, 272, 272],
                    [400, 400, 400, 400, 400, 400, 400],
                    [528, 528, 528, 528, 528, 528, 528],
                    [720, 720, 720, 720, 720, 720, 720],
                    [848, 848, 848, 848, 848, 848, 848],
                    [976, 976, 976, 976, 976, 976, 976]
                ],
                top: [
                    [400, 464, 528, 592, 656, 720, 784],
                    [400, 464, 528, 592, 656, 720, 784],
                    [400, 464, 528, 592, 656, 720, 784],
                    [400, 464, 528, 592, 656, 720, 784],
                    [400, 464, 528, 592, 656, 720, 784],
                    [400, 464, 528, 592, 656, 720, 784],
                    [400, 464, 528, 592, 656, 720, 784],
                    [400, 464, 528, 592, 656, 720, 784]
                ]
            },
            dock: {
                left: [16, 144, 272, 400, 528, 720, 848, 976],
                top: [400, 400, 400, 400, 400, 400, 400, 400]
            },
            attack: {
                left: [
                    [16, 16, 16, 16, 16, 16],
                    [144, 144, 144, 144, 144, 144],
                    [272, 272, 272, 272, 272, 272],
                    [400, 400, 400, 400, 400, 400],
                    [528, 528, 528, 528, 528, 528],
                    [720, 720, 720, 720, 720, 720],
                    [848, 848, 848, 848, 848, 848],
                    [976, 976, 976, 976, 976, 976, 976]
                ],
                top: [
                    [16, 80, 144, 208, 272, 336],
                    [16, 80, 144, 208, 272, 336],
                    [16, 80, 144, 208, 272, 336],
                    [16, 80, 144, 208, 272, 336],
                    [16, 80, 144, 208, 272, 336],
                    [16, 80, 144, 208, 272, 336],
                    [16, 80, 144, 208, 272, 336],
                    [16, 80, 144, 208, 272, 336]
                ]
            }
        },
        width: 32,
        height: 32,
        frame: {
            moving: 7,
            dock: 1,
            attack: 6
        },
        speed: Unit.getSpeedMatrixBy(10),
        HP: 60,
        armor: 1,
        MP: 200,
        sight: 315,
        portraitOffset: { x: 240, y: 56 },
        dieEffect: MedicDeath,
        isFlying: false,
        unitType: Unit.SMALL,
        recover: recover,
        cost: {
            mine: 50,
            gas: 25,
            man: 1,
            time: 300
        },
        upgrade: ['UpgradeInfantryArmors'],
        items: {
            '7': { name: 'Heal' },
            '8': {
                name: 'Restoration', condition: function () {
                    return Magic.Restoration.enabled
                }
            },
            '9': {
                name: 'OpticalFlare', condition: function () {
                    return Magic.OpticalFlare.enabled
                }
            }
        },
        dock: function () {
            Unit.turnAround.call(this);
        }
    }
});
Terran.Civilian = Unit.extends({
    constructorPlus: function (props) {
        this.imgPos.dock = this.imgPos.moving;
    },
    prototypePlus: {
        name: "Civilian",
        imgPos: {
            moving: {
                left: [
                    [11, 11, 11, 11, 11, 11, 11, 11],
                    [60, 60, 60, 60, 60, 60, 60, 60],
                    [108, 108, 108, 108, 108, 108, 108, 108],
                    [154, 154, 154, 154, 154, 154, 154, 154],
                    [200, 200, 200, 200, 200, 200, 200, 200],
                    [248, 248, 248, 248, 248, 248, 248, 248],
                    [293, 293, 293, 293, 293, 293, 293, 293],
                    [342, 342, 342, 342, 342, 342, 342, 342]
                ],
                top: [
                    [246, 0, 37, 70, 105, 142, 176, 211],
                    [246, 0, 37, 70, 105, 142, 176, 211],
                    [246, 0, 37, 70, 105, 142, 176, 211],
                    [246, 0, 37, 70, 105, 142, 176, 211],
                    [246, 0, 37, 70, 105, 142, 176, 211],
                    [246, 0, 37, 70, 105, 142, 176, 211],
                    [246, 0, 37, 70, 105, 142, 176, 211],
                    [246, 0, 37, 70, 105, 142, 176, 211]
                ]
            }
        },
        width: 21,
        height: 31,
        frame: {
            moving: 8,
            dock: 1
        },
        speed: Unit.getSpeedMatrixBy(6),
        HP: 60,
        armor: 0,
        sight: 245,
        portraitOffset: { x: 900, y: 56 },
        dieEffect: HumanDeath,
        isFlying: false,
        unitType: Unit.SMALL,
        recover: recover,
        upgrade: ['UpgradeInfantryArmors'],
        dock: function () {
            Unit.turnAround.call(this);
        }
    }
});
