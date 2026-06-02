import { TerranBuilding } from '../core/BuildingRaces.js';
import { TerranBuildingBurst } from '../../Bursts/buildings/BuildingBursts.js';

export class CrashCruiser extends TerranBuilding {
    name = "CrashCruiser";
    dieEffect = TerranBuildingBurst;
    imgPos = {
        dock: {
            left: 154,
            top: 440
        }
    };
    width = 106;
    height = 108;
    frame = {
        dock: 1
    };
    HP = 250;

    constructor(props) {
        super(props);
        //Nothing
    }
}
TerranBuilding.CrashCruiser = CrashCruiser;

export class BigCannon extends TerranBuilding {
    name = "BigCannon";
    dieEffect = TerranBuildingBurst;
    imgPos = {
        dock: {
            left: 0,
            top: 423
        }
    };
    width = 152;
    height = 110;
    frame = {
        dock: 1
    };
    HP = 500;

    constructor(props) {
        super(props);
        //Nothing
    }
}
TerranBuilding.BigCannon = BigCannon;

export class ConstructionS extends TerranBuilding {
    name = "Construction";
    dieEffect = TerranBuildingBurst;
    imgPos = {
        step1: {
            left: 798,
            top: 296
        },
        step2: {
            left: 894,
            top: 296
        },
        step3: {
            left: 990,
            top: 296
        }
    };
    width = 72;
    height = 70;
    frame = {
        step1: 1,
        step2: 1,
        step3: 1,
        dock: 1
    };
    HP = 400;
    armor = 0;
    sight = 350;

    constructor(props) {
        super(props);
        this.imgPos.dock = this.imgPos.step1;
    }
}
TerranBuilding.ConstructionS = ConstructionS;

export class ConstructionM extends TerranBuilding {
    name = "Construction";
    dieEffect = TerranBuildingBurst;
    imgPos = {
        step1: {
            left: 498,
            top: 296
        },
        step2: {
            left: 594,
            top: 296
        },
        step3: {
            left: 690,
            top: 296
        }
    };
    width = 96;
    height = 70;
    frame = {
        step1: 1,
        step2: 1,
        step3: 1,
        dock: 1
    };
    HP = 400;
    armor = 0;
    sight = 350;

    constructor(props) {
        super(props);
        this.imgPos.dock = this.imgPos.step1;
    }
}
TerranBuilding.ConstructionM = ConstructionM;

export class ConstructionL extends TerranBuilding {
    name = "Construction";
    dieEffect = TerranBuildingBurst;
    imgPos = {
        step1: {
            left: 276,
            top: 442
        },
        step2: {
            left: 404,
            top: 442
        },
        step3: {
            left: 540,
            top: 442
        }
    };
    width = 124;
    height = 86;
    frame = {
        step1: 1,
        step2: 1,
        step3: 1,
        dock: 1
    };
    HP = 400;
    armor = 0;
    sight = 350;

    constructor(props) {
        super(props);
        this.imgPos.dock = this.imgPos.step1;
    }
}
TerranBuilding.ConstructionL = ConstructionL;
