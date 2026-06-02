import Protoss from '../core/ProtossBase.js';
import Unit from '../../Units/core/UnitBase.js';
import AttackableUnit from '../../Units/core/AttackableUnitBase.js';
import { recover } from '../core/ProtossHelper.js';
import Magic from '../../Magics/core/MagicBase.js';
import Game from '../../../GameRule/Games/core/GameBase.js';
import '../../../Utils/jquery.min.js';

import { SmallProtossDeath, DragoonDeath, TemplarDeath } from '../../Bursts/protoss/ProtossEffects2.js';
import { ArchonBurst } from '../../Bursts/protoss/ProtossEffects1.js';
import { BigBlueExplode } from '../../Bursts/buildings/BuildingBursts.js';
import { FireSpark } from '../../Bursts/terran/TerranEffects.js';

const $ = globalThis.$;

export class Zealot extends AttackableUnit {
    constructor(props) {
        super(props);
    }

    name = "Zealot";
    imgPos = {
        moving: {
            left: [
                [0, 0, 0, 0, 0, 0, 0, 0],
                [84, 84, 84, 84, 84, 84, 84, 84],
                [168, 168, 168, 168, 168, 168, 168, 168],
                [252, 252, 252, 252, 252, 252, 252, 252],
                [336, 336, 336, 336, 336, 336, 336, 336],
                [462, 462, 462, 462, 462, 462, 462, 462],
                [546, 546, 546, 546, 546, 546, 546, 546],
                [630, 630, 630, 630, 630, 630, 630, 630]
            ],
            top: [
                [0, 44, 88, 132, 176, 220, 264, 308],
                [0, 44, 88, 132, 176, 220, 264, 308],
                [0, 44, 88, 132, 176, 220, 264, 308],
                [0, 44, 88, 132, 176, 220, 264, 308],
                [0, 44, 88, 132, 176, 220, 264, 308],
                [0, 44, 88, 132, 176, 220, 264, 308],
                [0, 44, 88, 132, 176, 220, 264, 308],
                [0, 44, 88, 132, 176, 220, 264, 308]
            ]
        },
        dock: {
            left: [0, 84, 168, 252, 336, 462, 546, 630],
            top: [0, 0, 0, 0, 0, 0, 0, 0]
        },
        attack:{
            left: [
                [0, 0, 0, 0, 0],
                [84, 84, 84, 84, 84],
                [168, 168, 168, 168, 168],
                [252, 252, 252, 252, 252],
                [336, 336, 336, 336, 336],
                [462, 462, 462, 462, 462],
                [546, 546, 546, 546, 546],
                [630, 630, 630, 630, 630]
            ],
            top: [
                [352, 396, 440, 484, 528],
                [352, 396, 440, 484, 528],
                [352, 396, 440, 484, 528],
                [352, 396, 440, 484, 528],
                [352, 396, 440, 484, 528],
                [352, 396, 440, 484, 528],
                [352, 396, 440, 484, 528],
                [352, 396, 440, 484, 528]
            ]
        }
    };
    width = 42;//N-1
    height = 44;//N-1
    frame = {
        moving: 8,
        dock: 1,
        attack: 5
    };
    speed = Unit.getSpeedMatrixBy(10);
    HP = 80;
    SP = 80;
    damage = 16;
    armor = 1;
    plasma = 0;
    sight = 245;
    meleeAttack = true;
    attackInterval = 2200;
    damageDelay = 300;
    portraitOffset = {x:60,y:112};
    dieEffect = SmallProtossDeath;
    isFlying = false;
    attackLimit = "ground";
    unitType = Unit.SMALL;
    attackType = AttackableUnit.NORMAL_ATTACK;
    cost = {
        mine:100,
        man:2,
        time:400
    };
    upgrade = ['UpgradeGroundWeapons','UpgradeGroundArmor','UpgradePlasmaShields'];

    recover = recover;
}
Protoss.Zealot = Zealot;

export class Dragoon extends AttackableUnit {
    constructor(props) {
        super(props);
    }

    name = "Dragoon";
    imgPos = {
        moving: {
            left: [
                [15, 111, 207, 303, 399, 495, 591, 687],
                [15, 111, 207, 303, 399, 495, 591, 687],
                [15, 111, 207, 303, 399, 495, 591, 687],
                [15, 111, 207, 303, 399, 495, 591, 687],
                [15, 111, 207, 303, 399, 495, 591, 687],
                [687, 591, 495, 399, 303, 207, 111, 15],
                [687, 591, 495, 399, 303, 207, 111, 15],
                [687, 591, 495, 399, 303, 207, 111, 15]
            ],
            top: [
                [111, 111, 111, 111, 111, 111, 111, 111],
                [207, 207, 207, 207, 207, 207, 207, 207],
                [207, 207, 207, 207, 207, 207, 207, 207],
                [207, 207, 207, 207, 207, 207, 207, 207],
                [399, 399, 399, 399, 399, 399, 399, 399],
                [303, 303, 303, 303, 303, 303, 303, 303],
                [303, 303, 303, 303, 303, 303, 303, 303],
                [303, 303, 303, 303, 303, 303, 303, 303]
            ]
        },
        dock: {
            left: [
                [15, 111, 207, 303, 399, 495, 591, 687],
                [15, 111, 207, 303, 399, 495, 591, 687],
                [15, 111, 207, 303, 399, 495, 591, 687],
                [15, 111, 207, 303, 399, 495, 591, 687],
                [15, 111, 207, 303, 399, 495, 591, 687],
                [15, 111, 207, 303, 399, 495, 591, 687],
                [15, 111, 207, 303, 399, 495, 591, 687],
                [15, 111, 207, 303, 399, 495, 591, 687]
            ],
            top: [
                [15, 15, 15, 15, 15, 15, 15, 15],
                [15, 15, 15, 15, 15, 15, 15, 15],
                [15, 15, 15, 15, 15, 15, 15, 15],
                [15, 15, 15, 15, 15, 15, 15, 15],
                [15, 15, 15, 15, 15, 15, 15, 15],
                [15, 15, 15, 15, 15, 15, 15, 15],
                [15, 15, 15, 15, 15, 15, 15, 15],
                [15, 15, 15, 15, 15, 15, 15, 15]
            ]
        },
        attack: {
            left: [
                [15, 111, 207, 303, 399, 495, 591, 687, 495, 495, 495, 495],
                [15, 111, 207, 303, 399, 495, 591, 687, 495, 495, 495, 495],
                [15, 111, 207, 303, 399, 495, 591, 687, 495, 495, 495, 495],
                [15, 111, 207, 303, 399, 495, 591, 687, 495, 495, 495, 495],
                [15, 111, 207, 303, 399, 495, 591, 687, 495, 495, 495, 495],
                [15, 111, 207, 303, 399, 495, 591, 687, 495, 495, 495, 495],
                [15, 111, 207, 303, 399, 495, 591, 687, 495, 495, 495, 495],
                [15, 111, 207, 303, 399, 495, 591, 687, 495, 495, 495, 495]
            ],
            top: [
                [495, 495, 495, 495, 495, 495, 495, 495, 495, 495, 495, 495],
                [495, 495, 495, 495, 495, 495, 495, 495, 495, 495, 495, 495],
                [495, 495, 495, 495, 495, 495, 495, 495, 495, 495, 495, 495],
                [495, 495, 495, 495, 495, 495, 495, 495, 495, 495, 495, 495],
                [495, 495, 495, 495, 495, 495, 495, 495, 495, 495, 495, 495],
                [495, 495, 495, 495, 495, 495, 495, 495, 495, 495, 495, 495],
                [495, 495, 495, 495, 495, 495, 495, 495, 495, 495, 495, 495],
                [495, 495, 495, 495, 495, 495, 495, 495, 495, 495, 495, 495]
            ]
        }
    };
    width = 66;//96N-81
    height = 66;//96N-81
    frame = {
        moving: 8,
        dock: 8,
        attack: 12
    };
    speed = Unit.getSpeedMatrixBy(12);
    HP = 100;
    SP = 80;
    damage = 20;
    armor = 1;
    plasma = 0;
    sight = 280;
    attackRange = 140;
    attackInterval = 3000;
    fireDelay = 800;
    portraitOffset = {x:120,y:112};
    dieEffect = DragoonDeath;
    isFlying = false;
    unitType = Unit.BIG;
    attackType = AttackableUnit.BURST_ATTACK;
    cost = {
        mine:125,
        gas:50,
        man:2,
        time:500
    };
    upgrade = ['UpgradeGroundWeapons','UpgradeGroundArmor','UpgradePlasmaShields'];

    recover = recover;
}
Protoss.Dragoon = Dragoon;

export class Templar extends AttackableUnit {
    constructor(props) {
        super(props);
    }

    name = "Templar";
    imgPos = {
        moving: {
            left: [
                [30, 30, 30, 30],
                [286, 286, 286, 286],
                [542, 542, 542, 542],
                [798, 798, 798, 798],
                [1054, 1054, 1054, 1054],
                [1438, 1438, 1438, 1438],
                [1694, 1694, 1694, 1694],
                [1950, 1950, 1950, 1950]
            ],
            top: [
                [1694, 1822, 1950, 670],
                [1694, 1822, 1950, 670],
                [1694, 1822, 1950, 670],
                [1694, 1822, 1950, 670],
                [1694, 1822, 1950, 670],
                [1694, 1822, 1950, 670],
                [1694, 1822, 1950, 670],
                [1694, 1822, 1950, 670]
            ]
        },
        dock: {
            left: [
                [30, 30, 30, 30, 30, 30, 30],
                [286, 286, 286, 286, 286, 286, 286],
                [542, 542, 542, 542, 542, 542, 542],
                [798, 798, 798, 798, 798, 798, 798],
                [1054, 1054, 1054, 1054, 1054, 1054, 1054],
                [1438, 1438, 1438, 1438, 1438, 1438, 1438],
                [1694, 1694, 1694, 1694, 1694, 1694, 1694],
                [1950, 1950, 1950, 1950, 1950, 1950, 1950]
            ],
            top: [
                [798, 926, 1054, 1182, 1310, 1438, 1566],
                [798, 926, 1054, 1182, 1310, 1438, 1566],
                [798, 926, 1054, 1182, 1310, 1438, 1566],
                [798, 926, 1054, 1182, 1310, 1438, 1566],
                [798, 926, 1054, 1182, 1310, 1438, 1566],
                [798, 926, 1054, 1182, 1310, 1438, 1566],
                [798, 926, 1054, 1182, 1310, 1438, 1566],
                [798, 926, 1054, 1182, 1310, 1438, 1566]
            ]
        },
        attack: {
            left: [
                [30, 30, 30, 30, 30],
                [286, 286, 286, 286, 286],
                [542, 542, 542, 542, 542],
                [798, 798, 798, 798, 798],
                [1054, 1054, 1054, 1054, 1054],
                [1438, 1438, 1438, 1438, 1438],
                [1694, 1694, 1694, 1694, 1694],
                [1950, 1950, 1950, 1950, 1950]
            ],
            top: [
                [30, 158, 286, 414, 542],
                [30, 158, 286, 414, 542],
                [30, 158, 286, 414, 542],
                [30, 158, 286, 414, 542],
                [30, 158, 286, 414, 542],
                [30, 158, 286, 414, 542],
                [30, 158, 286, 414, 542],
                [30, 158, 286, 414, 542]
            ]
        }
    };
    width = 68;//128N-98
    height = 68;//128N-98
    frame = {
        moving: 4,//3 or 4
        dock: 7,//7 or 8
        attack: 5
    };
    speed = Unit.getSpeedMatrixBy(8);
    HP = 40;
    SP = 40;
    damage = 10;
    armor = 0;
    plasma = 0;
    MP = 200;
    sight = 245;
    attackRange = 100;
    attackInterval = 2000;
    portraitOffset = {x:180,y:112};
    dieEffect = TemplarDeath;
    attackEffect = FireSpark;
    isFlying = false;
    unitType = Unit.SMALL;
    attackType = AttackableUnit.WAVE_ATTACK;
    cost = {
        mine:50,
        gas:150,
        man:2,
        time:500
    };
    upgrade = ['UpgradeGroundWeapons','UpgradeGroundArmor','UpgradePlasmaShields'];
    items = {
        '7':{name:'PsionicStorm',condition:function(){
            return Magic.PsionicStorm.enabled
        }},
        '8':{name:'Hallucination',condition:function(){
            return Magic.Hallucination.enabled
        }},
        '9':{name:'Archon'}
    };

    recover = recover;
}
Protoss.Templar = Templar;

export class DarkTemplar extends AttackableUnit {
    constructor(props) {
        super(props);
    }

    name = "DarkTemplar";
    imgPos = {
        moving: {
            left: [
                [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
                [117, 117, 117, 117, 117, 117, 117, 117, 117, 117, 117],
                [231, 231, 231, 231, 231, 231, 231, 231, 231, 231, 231],
                [345, 345, 345, 345, 345, 345, 345, 345, 345, 345, 345],
                [459, 459, 459, 459, 459, 459, 459, 459, 459, 459, 459],
                [630, 630, 630, 630, 630, 630, 630, 630, 630, 630, 630],
                [744, 744, 744, 744, 744, 744, 744, 744, 744, 744, 744],
                [858, 858, 858, 858, 858, 858, 858, 858, 858, 858, 858]
            ],
            top: [
                [0, 62, 124, 186, 248, 310, 372, 434, 496, 558, 620],
                [0, 62, 124, 186, 248, 310, 372, 434, 496, 558, 620],
                [0, 62, 124, 186, 248, 310, 372, 434, 496, 558, 620],
                [0, 62, 124, 186, 248, 310, 372, 434, 496, 558, 620],
                [0, 62, 124, 186, 248, 310, 372, 434, 496, 558, 620],
                [0, 62, 124, 186, 248, 310, 372, 434, 496, 558, 620],
                [0, 62, 124, 186, 248, 310, 372, 434, 496, 558, 620],
                [0, 62, 124, 186, 248, 310, 372, 434, 496, 558, 620]
            ]
        },
        dock: {
            left: [3, 117, 231, 345, 459, 630, 744, 858],
            top: [248, 248, 248, 248, 248, 248, 248, 248]
        },
        attack: {
            left: [
                [3, 3, 3, 3, 3, 3, 3],
                [117, 117, 117, 117, 117, 117, 117],
                [231, 231, 231, 231, 231, 231, 231],
                [345, 345, 345, 345, 345, 345, 345],
                [459, 459, 459, 459, 459, 459, 459],
                [630, 630, 630, 630, 630, 630, 630],
                [744, 744, 744, 744, 744, 744, 744],
                [858, 858, 858, 858, 858, 858, 858]
            ],
            top: [
                [682, 744, 806, 868, 930, 992, 1054],
                [682, 744, 806, 868, 930, 992, 1054],
                [682, 744, 806, 868, 930, 992, 1054],
                [682, 744, 806, 868, 930, 992, 1054],
                [682, 744, 806, 868, 930, 992, 1054],
                [682, 744, 806, 868, 930, 992, 1054],
                [682, 744, 806, 868, 930, 992, 1054],
                [682, 744, 806, 868, 930, 992, 1054]
            ]
        }
    };
    width = 57;//57N-54
    height = 62;//62N-62
    frame = {
        moving: 11,
        dock: 1,
        attack: 7
    };
    speed = Unit.getSpeedMatrixBy(12);
    HP = 80;
    SP = 40;
    damage = 40;
    armor = 1;
    plasma = 0;
    sight = 245;
    meleeAttack = true;
    attackInterval = 3000;
    portraitOffset = {x:240,y:112};
    dieEffect = SmallProtossDeath;
    isFlying = false;
    isInvisible = true;
    attackLimit = "ground";
    unitType = Unit.SMALL;
    attackType = AttackableUnit.NORMAL_ATTACK;
    cost = {
        mine:125,
        gas:100,
        man:2,
        time:500
    };
    upgrade = ['UpgradeGroundWeapons','UpgradeGroundArmor','UpgradePlasmaShields'];
    items = {
        '9':{name:'DarkArchon'}
    };

    recover = recover;
}
Protoss.DarkTemplar = DarkTemplar;

export class Archon extends AttackableUnit {
    constructor(props) {
        super(props);
        this.imgPos.dock = this.imgPos.moving;
        this.frame.dock = this.frame.moving;
        this.direction = 3;
    }

    name = "Archon";
    imgPos = {
        moving: {
            left: [
                [2060,2060,2060,2060],
                [260,260,260,260],
                [500,500,500,500],
                [740,740,740,740],
                [980,980,980,980],
                [1340,1340,1340,1340],
                [1580,1580,1580,1580],
                [1820,1820,1820,1820]
            ],
            top: [
                [1220,1340,1460,1580],
                [1220,1340,1460,1580],
                [1220,1340,1460,1580],
                [1220,1340,1460,1580],
                [1220,1340,1460,1580],
                [1220,1340,1460,1580],
                [1220,1340,1460,1580],
                [1220,1340,1460,1580]
            ]
        },
        attack: {
            left: [
                [2060, 2060, 2060, 2060, 2060, 2060, 2060, 2060, 2060, 2060],
                [260, 260, 260, 260, 260, 260, 260, 260, 260, 260],
                [500, 500, 500, 500, 500, 500, 500, 500, 500, 500],
                [740, 740, 740, 740, 740, 740, 740, 740, 740, 740],
                [980, 980, 980, 980, 980, 980, 980, 980, 980, 980],
                [1340, 1340, 1340, 1340, 1340, 1340, 1340, 1340, 1340, 1340],
                [1580, 1580, 1580, 1580, 1580, 1580, 1580, 1580, 1580, 1580],
                [1820, 1820, 1820, 1820, 1820, 1820, 1820, 1820, 1820, 1820]
            ],
            top: [
                [20, 140, 260, 380, 500, 620, 740, 860, 980, 1100],
                [20, 140, 260, 380, 500, 620, 740, 860, 980, 1100],
                [20, 140, 260, 380, 500, 620, 740, 860, 980, 1100],
                [20, 140, 260, 380, 500, 620, 740, 860, 980, 1100],
                [20, 140, 260, 380, 500, 620, 740, 860, 980, 1100],
                [20, 140, 260, 380, 500, 620, 740, 860, 980, 1100],
                [20, 140, 260, 380, 500, 620, 740, 860, 980, 1100],
                [20, 140, 260, 380, 500, 620, 740, 860, 980, 1100]
            ]
        }
    };
    width = 80;//120N-100
    height = 80;//120N-100
    frame = {
        moving: 4,
        attack: 10
    };
    speed = Unit.getSpeedMatrixBy(12);
    HP = 10;
    SP = 350;
    damage = 30;
    armor = 0;
    plasma = 0;
    sight = 280;
    attackRange = 70;
    attackInterval = 1000;
    attackEffect = ArchonBurst;
    portraitOffset = {x:780,y:112};
    dieEffect = BigBlueExplode;
    isFlying = false;
    unitType = Unit.BIG;
    attackType = AttackableUnit.NORMAL_ATTACK;
    cost = {
        mine:50,
        gas:150,
        man:4,
        time:200
    };
    upgrade = ['UpgradeGroundWeapons','UpgradeGroundArmor','UpgradePlasmaShields'];
    AOE = {
        hasEffect:false,
        radius:20
    };

    recover = recover;
}
Protoss.Archon = Archon;

export class DarkArchon extends Unit {
    constructor(props) {
        super(props);
        this.imgPos.dock = this.imgPos.moving;
        this.frame.dock = this.frame.moving;
        this.direction = 3;
    }

    name = "DarkArchon";
    imgPos = {
        moving: {
            left: [
                [20,20,20,20,20,20,20,20,20,20],
                [260,260,260,260,260,260,260,260,260,260],
                [500,500,500,500,500,500,500,500,500,500],
                [740,740,740,740,740,740,740,740,740,740],
                [980,980,980,980,980,980,980,980,980,980],
                [1340,1340,1340,1340,1340,1340,1340,1340,1340,1340],
                [1580,1580,1580,1580,1580,1580,1580,1580,1580,1580],
                [1820,1820,1820,1820,1820,1820,1820,1820,1820,1820]
            ],
            top: [
                [20,140,260,380,500,620,740,860,980,1100],
                [20,140,260,380,500,620,740,860,980,1100],
                [20,140,260,380,500,620,740,860,980,1100],
                [20,140,260,380,500,620,740,860,980,1100],
                [20,140,260,380,500,620,740,860,980,1100],
                [20,140,260,380,500,620,740,860,980,1100],
                [20,140,260,380,500,620,740,860,980,1100],
                [20,140,260,380,500,620,740,860,980,1100]
            ]
        }
    };
    width = 80;//120N-100
    height = 80;//120N-100
    frame = {
        moving: 10
    };
    speed = Unit.getSpeedMatrixBy(12);
    HP = 25;
    SP = 200;
    armor = 1;
    plasma = 0;
    MP = 200;
    sight = 350;
    portraitOffset = {x:840,y:112};
    dieEffect = BigBlueExplode;
    isFlying = false;
    unitType = Unit.BIG;
    cost = {
        mine:125,
        gas:100,
        man:4,
        time:200
    };
    upgrade = ['UpgradeGroundArmor','UpgradePlasmaShields'];
    items = {
        '7':{name:'Feedback'},
        '8':{name:'MindControl',condition:function(){
            return Magic.MindControl.enabled
        }},
        '9':{name:'MaelStorm',condition:function(){
            return Magic.MaelStorm.enabled
        }}
    };

    recover = recover;
}
Protoss.DarkArchon = DarkArchon;

export class Reaver extends AttackableUnit {
    constructor(props) {
        super(props);
        this.imgPos.attack = this.imgPos.dock;
        this.frame.attack = this.frame.dock;
        this.scarabNum = (props.isEnemy) ? 999 : 0;
    }

    isReloaded() {
        return this.coolDown && this.scarabNum > 0;
    }

    name = "Reaver";
    imgPos = {
        moving: {
            left: [
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [168, 168, 168, 168, 168, 168, 168, 168, 168],
                [336, 336, 336, 336, 336, 336, 336, 336, 336],
                [504, 504, 504, 504, 504, 504, 504, 504, 504],
                [672, 672, 672, 672, 672, 672, 672, 672, 672],
                [924, 924, 924, 924, 924, 924, 924, 924, 924],
                [1092, 1092, 1092, 1092, 1092, 1092, 1092, 1092, 1092],
                [1260, 1260, 1260, 1260, 1260, 1260, 1260, 1260, 1260]
            ],
            top: [
                [0, 84, 168, 252, 336, 420, 504, 588, 672],
                [0, 84, 168, 252, 336, 420, 504, 588, 672],
                [0, 84, 168, 252, 336, 420, 504, 588, 672],
                [0, 84, 168, 252, 336, 420, 504, 588, 672],
                [0, 84, 168, 252, 336, 420, 504, 588, 672],
                [0, 84, 168, 252, 336, 420, 504, 588, 672],
                [0, 84, 168, 252, 336, 420, 504, 588, 672],
                [0, 84, 168, 252, 336, 420, 504, 588, 672]
            ]
        },
        dock: {
            left: [0, 168, 336, 504, 672, 924, 1092, 1260],
            top: [0, 0, 0, 0, 0, 0, 0, 0]
        }
    };
    width = 84;//N-1
    height = 84;//N-1
    frame = {
        moving: 9,
        dock: 1
    };
    speed = Unit.getSpeedMatrixBy(4);
    HP = 100;
    SP = 80;
    damage = 100;
    armor = 0;
    plasma = 0;
    sight = 350;
    attackRange = 280;
    attackInterval = 6000;
    portraitOffset = {x:360,y:112};
    dieEffect = BigBlueExplode;
    isFlying = false;
    attackLimit = "ground";
    unitType = Unit.BIG;
    attackType = AttackableUnit.NORMAL_ATTACK;
    scarabCapacity = 5;
    cost = {
        mine:200,
        gas:100,
        man:4,
        time:700
    };
    upgrade = ['UpgradeGroundArmor','UpgradePlasmaShields'];
    items = {
        '7':{name:'Scarab',condition:function(){
            if (!Game.selectedUnit.scarabNum) $('button.attack').attr('disabled',true);
            else $('button.attack').removeAttr('disabled');
            return Game.selectedUnit.scarabNum<Game.selectedUnit.get('scarabCapacity');
        }}
    };
    AOE = {
        hasEffect:false,
        radius:80
    };

    recover = recover;
}
Protoss.Reaver = Reaver;
