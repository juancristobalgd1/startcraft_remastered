import { ZergBuilding } from '../core/BuildingRaces.js';
import { ZergBuildingBurst } from '../../Bursts/buildings/BuildingBursts.js';
import { EggDeath, SmallZergFlyingDeath } from '../../Bursts/zerg/ZergDeaths.js';

export class Egg extends ZergBuilding {
    name = "Egg";
    source = "Larva";
    portrait = "Egg";
    noMud = true;
    imgPos = {
        dock: {
            left: [2, 38, 74, 110, 146, 182, 218, 254, 290, 326, 362, 398, -1, 2, 38, 74, 110, -1, 291, 329, 367, 405, 442, 480],
            top: [213, 213, 213, 213, 213, 213, 213, 213, 213, 213, 213, 213, -1, 173, 173, 173, 173, -1, 372, 372, 372, 372, 372, 372]
        }
    };
    width = 36;
    height = 40;
    frame = {
        dock: 12
    };
    HP = 200;
    armor = 10;
    sight = 35;
    dieEffect = EggDeath;

    constructor(props) {
        super(props);
        this.sound = {
            selected: new Audio('bgm/Egg.selected.wav'),
            death: new Audio('bgm/Egg.death.wav')
        };
        this.action = 13;
    }
}
ZergBuilding.Egg = Egg;

export class Cocoon extends ZergBuilding {
    name = "Cocoon";
    source = "Larva";
    portrait = "Cocoon";
    noMud = true;
    imgPos = {
        dock: {
            left: [0, 63, 126, 189, 252, 315, 378, 441, 504, -1, 0, 63, 126, 189, 252, 315],
            top: [1105, 1105, 1105, 1105, 1105, 1105, 1105, 1105, 1105, -1, 1060, 1060, 1060, 1060, 1060, 1060]
        }
    };
    width = 62;
    height = 45;
    frame = {
        dock: 9
    };
    HP = 200;
    armor = 10;
    sight = 35;
    dieEffect = SmallZergFlyingDeath;

    constructor(props) {
        super(props);
        this.sound = {
            selected: new Audio('bgm/Cocoon.selected.wav'),
            death: new Audio('bgm/Mutalisk.death.wav')
        };
        this.isFlying = true;
        this.action = 10;
    }
}
ZergBuilding.Cocoon = Cocoon;

export class LurkerCocoon extends ZergBuilding {
    name = "Cocoon";
    source = "Hydralisk";
    portrait = "Cocoon";
    noMud = true;
    imgPos = {
        dock: {
            left: [0, 63, 126, 189, 252, 315, 378, 441, 504, -1, 0, 63, 126, 189, 252, 315],
            top: [1105, 1105, 1105, 1105, 1105, 1105, 1105, 1105, 1105, -1, 1060, 1060, 1060, 1060, 1060, 1060]
        }
    };
    width = 62;
    height = 45;
    frame = {
        dock: 9
    };
    HP = 200;
    armor = 10;
    sight = 35;
    dieEffect = SmallZergFlyingDeath;

    constructor(props) {
        super(props);
        this.sound = {
            selected: new Audio('bgm/Cocoon.selected.wav'),
            death: new Audio('bgm/Mutalisk.death.wav')
        };
        this.isFlying = false;
        this.action = 10;
    }
}
ZergBuilding.LurkerCocoon = LurkerCocoon;

export class MutationS extends ZergBuilding {
    name = "Mutation";
    dieEffect = ZergBuildingBurst;
    imgPos = {
        dock: {
            left: [356, 516, 676, 836, 996, 1156, -1, 36, 36, 196, 196],
            top: [962, 962, 962, 962, 962, 962, -1, 962, 962, 962, 962]
        }
    };
    width = 88;
    height = 84;
    frame = {
        dock: 6
    };
    HP = 200;
    armor = 0;
    sight = 350;

    constructor(props) {
        super(props);
        this.action = 7;
    }
}
ZergBuilding.MutationS = MutationS;

export class MutationM extends ZergBuilding {
    name = "Mutation";
    dieEffect = ZergBuildingBurst;
    imgPos = {
        dock: {
            left: [20, 180, 340, 500, 660, 820],
            top: [1048, 1048, 1048, 1048, 1048, 1048]
        }
    };
    width = 120;
    height = 112;
    frame = {
        dock: 6
    };
    HP = 400;
    armor = 0;
    sight = 350;

    constructor(props) {
        super(props);
        //Nothing
    }
}
ZergBuilding.MutationM = MutationM;

export class MutationL extends ZergBuilding {
    name = "Mutation";
    dieEffect = ZergBuildingBurst;
    imgPos = {
        dock: {
            left: [0, 160, 320, 480, 640, 800],
            top: [1160, 1160, 1160, 1160, 1160, 1160]
        }
    };
    width = 160;
    height = 150;
    frame = {
        dock: 6
    };
    HP = 600;
    armor = 0;
    sight = 350;

    constructor(props) {
        super(props);
        //Nothing
    }
}
ZergBuilding.MutationL = MutationL;

