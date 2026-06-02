import { ZergBuilding } from '../core/BuildingRaces.js';
import { ZergBuildingBurst } from '../../Bursts/buildings/BuildingBursts.js';
import Building from '../core/BuildingBase.js';
import { AttackableMixin } from '../core/BuildingAttackable.js';
import { Sunken } from '../../Bursts/zerg/ZergEffects1.js';
import AttackableUnit from '../../Units/core/AttackableUnitBase.js';

export class Hatchery extends ZergBuilding {
    dieEffect = ZergBuildingBurst;
    imgPos = {
        dock: {
            left: 20,
            top: 44
        }
    };
    width = 128;
    height = 94;
    frame = {
        dock: 1
    };
    HP = 1250;
    manPlus = 10;
    produceLarva = true;
    requiresCreep = false;
    cost = {
        mine: 300,
        time: 1200
    };
    items = {
        '1': { name: 'SelectLarva' },
        '2': { name: 'SetRallyPoint' },
        '3': { name: 'EvolveBurrow' },
        '7': {
            name: 'Lair', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'SpawningPool';
                })
            },
            run: function () {
                import('../../Zergs/core/ZergEvolveLogic.js').then(Logic => Logic.default.mutate(this, 'Lair'));
            }
        }
    };

    constructor(props) {
        super(props);
        this.larvas = [];
    }
}
ZergBuilding.Hatchery = Hatchery;
export class Lair extends ZergBuilding {
    dieEffect = ZergBuildingBurst;
    imgPos = {
        dock: {
            left: 22,
            top: 172
        }
    };
    width = 136;
    height = 114;
    frame = {
        dock: 1
    };
    HP = 1800;
    manPlus = 10;
    produceLarva = true;
    cost = {
        mine: 150,
        gas: 100,
        time: 1000
    };
    items = {
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
            },
            run: function () {
                import('../../Zergs/core/ZergEvolveLogic.js').then(Logic => Logic.default.mutate(this, 'Hive'));
            }
        }
    };

    constructor(props) {
        super(props);
        this.larvas = [];
    }
}
ZergBuilding.Lair = Lair;
export class Hive extends ZergBuilding {
    dieEffect = ZergBuildingBurst;
    imgPos = {
        dock: {
            left: 26,
            top: 300
        }
    };
    width = 130;
    height = 132;
    frame = {
        dock: 1
    };
    HP = 2500;
    manPlus = 10;
    produceLarva = true;
    cost = {
        mine: 200,
        gas: 150,
        time: 1200
    };
    items = {
        '1': { name: 'SelectLarva' },
        '2': { name: 'SetRallyPoint' },
        '3': { name: 'EvolveBurrow' },
        '4': { name: 'EvolveVentralSacs' },
        '5': { name: 'EvolveAntennas' },
        '6': { name: 'EvolvePneumatizedCarapace' }
    };

    constructor(props) {
        super(props);
        this.larvas = [];
    }
}
ZergBuilding.Hive = Hive;
export class CreepColony extends ZergBuilding {
    dieEffect = ZergBuildingBurst;
    imgPos = {
        dock: {
            left: 924,
            top: 544
        }
    };
    width = 72;
    height = 66;
    frame = {
        dock: 1
    };
    HP = 400;
    cost = {
        mine: 75,
        time: 200
    };
    items = {
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
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
ZergBuilding.CreepColony = CreepColony;

export class SunkenColony extends AttackableMixin(ZergBuilding) {
    dieEffect = ZergBuildingBurst;
    imgPos = {
        dock: {
            left: 916,
            top: 714
        },
        attack: {
            left: [20, 116, 212, 308, 404, 500, 596, 692, 788, 884],
            top: [802, 802, 802, 802, 802, 802, 802, 802, 802, 802]
        }
    };
    width = 84;
    height = 66;
    frame = {
        dock: 10
    };
    HP = 300;
    cost = {
        mine: 50,
        time: 200
    };
    damage = 40;
    attackRange = 245;
    attackInterval = 2200;
    attackLimit = "ground";
    attackEffect = Sunken;
    attackType = AttackableUnit.BURST_ATTACK;

    constructor(props) {
        super(props);
        if (!this.sound) this.sound = {};
        this.sound.attack = new Audio('bgm/Zerg/Colony.attack.wav');
    }
}
ZergBuilding.SunkenColony = SunkenColony;
export class SporeColony extends AttackableMixin(ZergBuilding) {
    dieEffect = ZergBuildingBurst;
    imgPos = {
        dock: {
            left: 924,
            top: 618
        }
    };
    width = 70;
    height = 80;
    frame = {
        dock: 1
    };
    HP = 400;
    detector = Gobj.detectorBuffer;
    cost = {
        mine: 50,
        time: 200
    };
    damage = 15;
    attackRange = 245;
    attackInterval = 1500;
    attackLimit = "flying";
    attackType = AttackableUnit.NORMAL_ATTACK;

    constructor(props) {
        super(props);
        this.imgPos.attack = this.imgPos.dock;
        this.frame.attack = this.frame.dock;
        if (!this.sound) this.sound = {};
        this.sound.attack = new Audio('bgm/Zerg/Colony.attack.wav');
    }
}
ZergBuilding.SporeColony = SporeColony;

export class Extractor extends ZergBuilding {
    dieEffect = ZergBuildingBurst;
    imgPos = {
        dock: {
            left: 768,
            top: 26
        }
    };
    width = 128;
    height = 116;
    frame = {
        dock: 1
    };
    HP = 750;
    requiresCreep = false;
    cost = {
        mine: 50,
        time: 400
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
ZergBuilding.Extractor = Extractor;

export class SpawningPool extends ZergBuilding {
    dieEffect = ZergBuildingBurst;
    imgPos = {
        dock: {
            left: 784,
            top: 210
        }
    };
    width = 100;
    height = 78;
    frame = {
        dock: 1
    };
    HP = 750;
    cost = {
        mine: 150,
        time: 800
    };
    items = {
        '1': { name: 'EvolveMetabolicBoost' },
        '2': { name: 'EvolveAdrenalGlands' }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
ZergBuilding.SpawningPool = SpawningPool;

Hatchery.prototype.name = "Hatchery";
Lair.prototype.name = "Lair";
Hive.prototype.name = "Hive";
CreepColony.prototype.name = "CreepColony";
SunkenColony.prototype.name = "SunkenColony";
SporeColony.prototype.name = "SporeColony";
Extractor.prototype.name = "Extractor";
SpawningPool.prototype.name = "SpawningPool";
