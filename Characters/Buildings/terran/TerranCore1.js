import Building from '../core/BuildingBase.js';
import { TerranBuilding } from '../core/BuildingRaces.js';
import { AttackableMixin } from '../core/BuildingAttackable.js';
import AttackableUnit from '../../Units/core/AttackableUnitBase.js';
import Gobj from '../../Gobj.js';
import { TerranBuildingBurst } from '../../Bursts/buildings/BuildingBursts.js';

export class CommandCenter extends TerranBuilding {
    name = "CommandCenter";
    dieEffect = TerranBuildingBurst;
    imgPos = {
        dock: {
            left: 0,
            top: 6
        }
    };
    width = 129;
    height = 106;
    frame = {
        dock: 1
    };
    HP = 1500;
    manPlus = 10;
    requiresPower = false;
    cost = {
        mine: 400,
        time: 1200
    };
    items = {
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
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
TerranBuilding.CommandCenter = CommandCenter;

export class SupplyDepot extends TerranBuilding {
    name = "SupplyDepot";
    dieEffect = TerranBuildingBurst;
    imgPos = {
        dock: {
            left: [0, 95, 190, 285, 380],
            top: [292, 292, 292, 292, 292]
        }
    };
    width = 96;
    height = 76;
    frame = {
        dock: 5
    };
    HP = 500;
    manPlus = 8;
    cost = {
        mine: 100,
        time: 400
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
TerranBuilding.SupplyDepot = SupplyDepot;

export class Refinery extends TerranBuilding {
    name = "Refinery";
    dieEffect = TerranBuildingBurst;
    imgPos = {
        dock: {
            left: 256,
            top: 16
        }
    };
    width = 124;
    height = 96;
    frame = {
        dock: 1
    };
    HP = 500;
    cost = {
        mine: 100,
        time: 400
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
TerranBuilding.Refinery = Refinery;

export class Barracks extends TerranBuilding {
    name = "Barracks";
    dieEffect = TerranBuildingBurst;
    imgPos = {
        dock: {
            left: 128,
            top: 0
        }
    };
    width = 126;
    height = 110;
    frame = {
        dock: 1
    };
    HP = 1000;
    cost = {
        mine: 150,
        time: 800
    };
    items = {
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
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
TerranBuilding.Barracks = Barracks;

export class EngineeringBay extends TerranBuilding {
    name = "EngineeringBay";
    dieEffect = TerranBuildingBurst;
    imgPos = {
        dock: {
            left: 380,
            top: 14
        }
    };
    width = 144;
    height = 98;
    frame = {
        dock: 1
    };
    HP = 850;
    cost = {
        mine: 125,
        time: 600
    };
    items = {
        '1': { name: 'UpgradeInfantryWeapons' },
        '2': { name: 'UpgradeInfantryArmors' }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
TerranBuilding.EngineeringBay = EngineeringBay;

export class Academy extends TerranBuilding {
    name = "Academy";
    dieEffect = TerranBuildingBurst;
    imgPos = {
        dock: {
            left: 0,
            top: 0
        }
    };
    width = 96;
    height = 80;
    frame = {
        dock: 1
    };
    HP = 600;
    cost = {
        mine: 150,
        gas: 0,
        time: 800
    };
    items = {
        '1': { name: 'ResearchU238Shells' },
        '2': { name: 'ResearchStimPackTech' },
        '4': { name: 'ResearchRestoration' },
        '5': { name: 'ResearchOpticalFlare' },
        '6': { name: 'ResearchCaduceusReactor' }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
TerranBuilding.Academy = Academy;

export class Bunker extends TerranBuilding {
    name = "Bunker";
    dieEffect = TerranBuildingBurst;
    imgPos = {
        dock: {
            left: 512,
            top: 120
        }
    };
    width = 96;
    height = 80;
    frame = {
        dock: 1
    };
    HP = 350;
    cost = {
        mine: 100,
        time: 400
    };

    constructor(props) {
        super(props);
    }
}
TerranBuilding.Bunker = Bunker;

export class MissileTurret extends AttackableMixin(TerranBuilding) {
    name = "MissileTurret";
    dieEffect = TerranBuildingBurst;
    imgPos = {
        dock: {
            left: 400,
            top: 130
        }
    };
    width = 76;
    height = 96;
    frame = {
        dock: 1
    };
    HP = 200;
    detector = Gobj.detectorBuffer;
    cost = {
        mine: 75,
        time: 300
    };
    damage = 20;
    attackRange = 245;
    attackInterval = 1500;
    attackLimit = "flying";
    attackType = AttackableUnit.NORMAL_ATTACK;

    constructor(props) {
        super(props);
        this.imgPos.attack = this.imgPos.dock;
        this.frame.attack = this.frame.dock;
        if (!this.sound) this.sound = {};
        this.sound.attack = new Audio('bgm/Terran/Wraith.attackF.wav');
    }
}
TerranBuilding.MissileTurret = MissileTurret;
TerranBuilding.MissileTurret = MissileTurret;
