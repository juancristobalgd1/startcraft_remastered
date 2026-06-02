import { TerranBuilding } from '../core/BuildingRaces.js';
import { TerranBuildingBurst } from '../../Bursts/buildings/BuildingBursts.js';

export class ComstatStation extends TerranBuilding {
    name = "ComstatStation";
    dieEffect = TerranBuildingBurst;
    imgPos = {
        dock: {
            left: 0,
            top: 122
        }
    };
    width = 68;
    height = 62;
    frame = {
        dock: 1
    };
    HP = 750;
    MP = 200;
    cost = {
        mine: 50,
        gas: 50,
        time: 400
    };
    items = {
        '1': { name: 'ScannerSweep' }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
TerranBuilding.ComstatStation = ComstatStation;

export class NuclearSilo extends TerranBuilding {
    name = "NuclearSilo";
    dieEffect = TerranBuildingBurst;
    imgPos = {
        dock: {
            left: 282,
            top: 124
        }
    };
    width = 64;
    height = 60;
    frame = {
        dock: 1
    };
    HP = 600;
    cost = {
        mine: 100,
        gas: 100,
        time: 800
    };
    items = {
        '1': { name: 'ArmNuclearSilo' }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
TerranBuilding.NuclearSilo = NuclearSilo;

export class MachineShop extends TerranBuilding {
    name = "MachineShop";
    dieEffect = TerranBuildingBurst;
    imgPos = {
        dock: {
            left: 208,
            top: 112
        }
    };
    width = 74;
    height = 72;
    frame = {
        dock: 1
    };
    HP = 750;
    cost = {
        mine: 50,
        gas: 50,
        time: 400
    };
    items = {
        '1': { name: 'ResearchIonThrusters' },
        '2': { name: 'ResearchSpiderMines' },
        '3': { name: 'ResearchSiegeTech' },
        '4': { name: 'ResearchCharonBoosters' }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
TerranBuilding.MachineShop = MachineShop;

export class ControlTower extends TerranBuilding {
    name = "ControlTower";
    dieEffect = TerranBuildingBurst;
    imgPos = {
        dock: {
            left: 68,
            top: 120
        }
    };
    width = 72;
    height = 64;
    frame = {
        dock: 1
    };
    HP = 750;
    cost = {
        mine: 50,
        gas: 50,
        time: 400
    };
    items = {
        '1': { name: 'ResearchCloakingField' },
        '2': { name: 'ResearchApolloReactor' }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
TerranBuilding.ControlTower = ControlTower;

export class PhysicsLab extends TerranBuilding {
    name = "PhysicsLab";
    dieEffect = TerranBuildingBurst;
    imgPos = {
        dock: {
            left: 348,
            top: 120
        }
    };
    width = 66;
    height = 64;
    frame = {
        dock: 1
    };
    HP = 600;
    cost = {
        mine: 50,
        gas: 50,
        time: 400
    };
    items = {
        '1': { name: 'ResearchYamatoGun' },
        '2': { name: 'ResearchColossusReactor' }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
TerranBuilding.PhysicsLab = PhysicsLab;

export class ConvertOps extends TerranBuilding {
    name = "ConvertOps";
    dieEffect = TerranBuildingBurst;
    imgPos = {
        dock: {
            left: 140,
            top: 132
        }
    };
    width = 68;
    height = 52;
    frame = {
        dock: 1
    };
    HP = 750;
    cost = {
        mine: 50,
        gas: 50,
        time: 400
    };
    items = {
        '1': { name: 'ResearchLockdown' },
        '2': { name: 'ResearchPersonalCloaking' },
        '4': { name: 'ResearchOcularImplants' },
        '5': { name: 'ResearchMoebiusReactor' }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
TerranBuilding.ConvertOps = ConvertOps;
