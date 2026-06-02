import { ZergBuilding } from '../core/BuildingRaces.js';
import { ZergBuildingBurst } from '../../Bursts/buildings/BuildingBursts.js';
import Building from '../core/BuildingBase.js';

export class EvolutionChamber extends ZergBuilding {
    name = "EvolutionChamber";
    dieEffect = ZergBuildingBurst;
    imgPos = {
        dock: {
            left: 1468,
            top: 684
        }
    };
    width = 100;
    height = 94;
    frame = {
        dock: 1
    };
    HP = 750;
    cost = {
        mine: 75,
        time: 400
    };
    items = {
        '1': { name: 'UpgradeMeleeAttacks' },
        '2': { name: 'UpgradeMissileAttacks' },
        '3': { name: 'EvolveCarapace' }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
ZergBuilding.EvolutionChamber = EvolutionChamber;

export class HydraliskDen extends ZergBuilding {
    name = "HydraliskDen";
    dieEffect = ZergBuildingBurst;
    imgPos = {
        dock: {
            left: 1472,
            top: 8
        }
    };
    width = 96;
    height = 104;
    frame = {
        dock: 1
    };
    HP = 850;
    cost = {
        mine: 100,
        gas: 50,
        time: 400
    };
    items = {
        '1': { name: 'EvolveMuscularAugments' },
        '2': { name: 'EvolveGroovedSpines' },
        '4': { name: 'EvolveLurkerAspect' }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
ZergBuilding.HydraliskDen = HydraliskDen;

export class Spire extends ZergBuilding {
    name = "Spire";
    dieEffect = ZergBuildingBurst;
    imgPos = {
        dock: {
            left: 1486,
            top: 444
        }
    };
    width = 68;
    height = 102;
    frame = {
        dock: 1
    };
    HP = 600;
    cost = {
        mine: 200,
        gas: 150,
        time: 1200
    };
    items = {
        '1': { name: 'UpgradeFlyerAttacks' },
        '2': { name: 'UpgradeFlyerCarapace' },
        '7': {
            name: 'GreaterSpire', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'Hive';
                })
            },
            run: function () {
                import('../../Zergs/core/ZergEvolveLogic.js').then(Logic => Logic.default.mutate(this, 'GreaterSpire'));
            }
        }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
ZergBuilding.Spire = Spire;

export class GreaterSpire extends ZergBuilding {
    name = "GreaterSpire";
    dieEffect = ZergBuildingBurst;
    imgPos = {
        dock: {
            left: 1484,
            top: 558
        }
    };
    width = 78;
    height = 102;
    frame = {
        dock: 1
    };
    HP = 1000;
    cost = {
        mine: 100,
        gas: 150,
        time: 1200
    };
    items = {
        '1': { name: 'UpgradeFlyerAttacks' },
        '2': { name: 'UpgradeFlyerCarapace' }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
ZergBuilding.GreaterSpire = GreaterSpire;

export class QueenNest extends ZergBuilding {
    name = "QueenNest";
    dieEffect = ZergBuildingBurst;
    imgPos = {
        dock: {
            left: 1462,
            top: 236
        }
    };
    width = 84;
    height = 90;
    frame = {
        dock: 1
    };
    HP = 850;
    cost = {
        mine: 150,
        gas: 100,
        time: 600
    };
    items = {
        '1': { name: 'EvolveSpawnBroodling' },
        '2': { name: 'EvolveEnsnare' },
        '3': { name: 'EvolveGameteMeiosis' }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
ZergBuilding.QueenNest = QueenNest;

export class NydusCanal extends ZergBuilding {
    name = "NydusCanal";
    dieEffect = ZergBuildingBurst;
    imgPos = {
        dock: {
            left: 908,
            top: 444
        }
    };
    width = 72;
    height = 76;
    frame = {
        dock: 1
    };
    HP = 250;
    cost = {
        mine: 150,
        time: 400
    };
    items = {
        '1': { name: 'NydusCanal' }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
ZergBuilding.NydusCanal = NydusCanal;

export class UltraliskCavern extends ZergBuilding {
    name = "UltraliskCavern";
    dieEffect = ZergBuildingBurst;
    imgPos = {
        dock: {
            left: 1468,
            top: 122
        }
    };
    width = 102;
    height = 98;
    frame = {
        dock: 1
    };
    HP = 600;
    cost = {
        mine: 150,
        gas: 200,
        time: 800
    };
    items = {
        '1': { name: 'EvolveAnabolicSynthesis' },
        '2': { name: 'EvolveChitinousPlating' }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
ZergBuilding.UltraliskCavern = UltraliskCavern;

export class DefilerMound extends ZergBuilding {
    name = "DefilerMound";
    dieEffect = ZergBuildingBurst;
    imgPos = {
        dock: {
            left: 1458,
            top: 344
        }
    };
    width = 118;
    height = 90;
    frame = {
        dock: 1
    };
    HP = 850;
    cost = {
        mine: 100,
        gas: 100,
        time: 600
    };
    items = {
        '1': { name: 'EvolvePlague' },
        '2': { name: 'EvolveConsume' },
        '3': { name: 'EvolveMetasynapticNode' }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
ZergBuilding.DefilerMound = DefilerMound;
export class InfestedBase extends ZergBuilding {
    name = "InfestedBase";
    noMud = true;
    dieEffect = ZergBuildingBurst;
    imgPos = {
        dock: {
            left: 1160,
            top: 328
        }
    };
    width = 134;
    height = 108;
    frame = {
        dock: 1
    };
    HP = 1500;
    items = {
        '1': { name: 'InfestedTerran' }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
ZergBuilding.InfestedBase = InfestedBase;
