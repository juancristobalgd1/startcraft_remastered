import Burst from '../core/BurstBase.js';

export class SmallZergFlyingDeath extends Burst {
    constructor(props) {
        super(props);
    }

    //Add basic unit info
    name = "Mutalisk";
    imgPos = {
        burst: {
            left: [71, 143, 215, 283, 355, 432, 502],
            top: [372, 372, 372, 372, 372, 372, 372]
        }
    };
    width = 64;
    height = 62;
    frame = {
        burst: 7
    };
}
Burst.SmallZergFlyingDeath = SmallZergFlyingDeath;

export class BigZergFlyingDeath extends Burst {
    constructor(props) {
        super(props);
    }

    //Add basic unit info
    name = "Devourer";
    imgPos = {
        burst: {
            left: [0, 114, 228, 342, 456, 570, 684, 798],
            top: [860, 860, 860, 860, 860, 860, 860, 860]
        }
    };
    width = 114;
    height = 102;
    frame = {
        burst: 8
    };
}
Burst.BigZergFlyingDeath = BigZergFlyingDeath;

export class DroneDeath extends Burst {
    constructor(props) {
        super(props);
    }

    //Add basic unit info
    name = "Drone";
    imgPos = {
        burst: {
            left: [0, 128, 256, 384, 512, 640, 768, 896],
            top: [1280, 1280, 1280, 1280, 1280, 1280, 1280, 1280]
        }
    };
    width = 128;
    height = 128;
    frame = {
        burst: 8
    };
}
Burst.DroneDeath = DroneDeath;

export class ZerglingDeath extends Burst {
    constructor(props) {
        super(props);
    }

    //Add basic unit info
    name = "Zergling";
    imgPos = {
        burst: {
            left: [0, 68, 136, 204, 272, 340, 408],
            top: [506, 506, 506, 506, 506, 506, 506]
        }
    };
    width = 68;
    height = 55;
    frame = {
        burst: 7
    };
}
Burst.ZerglingDeath = ZerglingDeath;

export class HydraliskDeath extends Burst {
    constructor(props) {
        super(props);
    }

    //Add basic unit info
    name = "Hydralisk";
    imgPos = {
        burst: {
            left: [0, 66, 132, 198, 264, 330, 396, 462, 528, 594, 660, 726],
            top: [704, 704, 704, 704, 704, 704, 704, 704, 704, 704, 704, 704]
        }
    };
    width = 66;
    height = 50;
    frame = {
        burst: 12
    };
}
Burst.HydraliskDeath = HydraliskDeath;

export class LurkerDeath extends Burst {
    constructor(props) {
        super(props);
    }

    //Add basic unit info
    name = "Lurker";
    imgPos = {
        burst: {
            left: [85, 170, 255, 340, 0, 85, 170, 255, 340],
            top: [582, 582, 582, 582, 646, 646, 646, 646, 646]
        }
    };
    width = 85;
    height = 64;
    frame = {
        burst: 9
    };
}
Burst.LurkerDeath = LurkerDeath;

export class UltraliskDeath extends Burst {
    constructor(props) {
        super(props);
    }

    //Add basic unit info
    name = "Ultralisk";
    imgPos = {
        burst: {
            left: [0, 101, 202, 303, 404, 505, 606, 707, 808, 909],
            top: [1620, 1620, 1620, 1620, 1620, 1620, 1620, 1620, 1620, 1620]
        }
    };
    width = 101;
    height = 108;
    frame = {
        burst: 10
    };
}
Burst.UltraliskDeath = UltraliskDeath;

export class DefilerDeath extends Burst {
    constructor(props) {
        super(props);
    }

    //Add basic unit info
    name = "Defiler";
    imgPos = {
        burst: {
            left: [0, 70, 140, 210, 280, 350, 420, 490, 560, 630],
            top: [558, 558, 558, 558, 558, 558, 558, 558, 558, 558]
        }
    };
    width = 70;
    height = 46;
    frame = {
        burst: 10
    };
}
Burst.DefilerDeath = DefilerDeath;

export class BroodlingDeath extends Burst {
    constructor(props) {
        super(props);
    }

    //Add basic unit info
    name = "Queen";
    imgPos = {
        burst: {
            left: [0, 40, 80, 120, 160],
            top: [782, 782, 782, 782, 782]
        }
    };
    width = 40;
    height = 22;
    frame = {
        burst: 5
    };
}
Burst.BroodlingDeath = BroodlingDeath;

export class LarvaDeath extends Burst {
    constructor(props) {
        super(props);
    }

    //Add basic unit info
    name = "Larva";
    imgPos = {
        burst: {
            left: [0, 50, 100, 150, 200, 250, 300, 350, 400],
            top: [146, 146, 146, 146, 146, 146, 146, 146, 146]
        }
    };
    width = 50;
    height = 26;
    frame = {
        burst: 9
    };
}
Burst.LarvaDeath = LarvaDeath;

export class EggDeath extends Burst {
    constructor(props) {
        super(props);
    }

    //Add basic unit info
    name = "Larva";
    imgPos = {
        burst: {
            left: [0, 70, 140, 210, 280, 350, 0, 70, 140, 210, 280, 350],
            top: [254, 254, 254, 254, 254, 254, 312, 312, 312, 312, 312, 312]
        }
    };
    width = 70;
    height = 59;
    frame = {
        burst: 12
    };
}
Burst.EggDeath = EggDeath;
