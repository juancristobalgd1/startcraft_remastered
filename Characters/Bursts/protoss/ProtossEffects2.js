import Burst from '../core/BurstBase.js';

export class ReaverBurst extends Burst {
    constructor(props) {
        super(props);
        //Has burst sound effect
        if (this.insideScreen()) new Audio('bgm/ReaverBomb.burst.wav').play();
    }

    //Add basic unit info
    name = "Burst";
    imgPos = {
        burst: {
            left: [0, 80, 160, 240, 320, 400, 480, 560, 640, 720],
            top: [931, 931, 931, 931, 931, 931, 931, 931, 931, 931]
        }
    };
    width = 78;
    height = 64;
    frame = {
        burst: 10
    };
}
Burst.ReaverBurst = ReaverBurst;

export class SmallProtossDeath extends Burst {
    constructor(props) {
        super(props);
        //Nothing
    }

    //Add basic unit info
    name = "Zealot";
    imgPos = {
        burst: {
            left: [0, 57, 114, 171, 228, 285, 342],
            top: [575, 575, 575, 575, 575, 575, 575]
        }
    };
    width = 57;
    height = 84;
    frame = {
        burst: 7
    };
}
Burst.SmallProtossDeath = SmallProtossDeath;

export class DragoonDeath extends Burst {
    constructor(props) {
        super(props);
        //Nothing
    }

    //Add basic unit info
    name = "Dragoon";
    imgPos = {
        burst: {
            left: [15, 111, 207, 303, 399, 495, 591],
            top: [591, 591, 591, 591, 591, 591, 591]
        }
    };
    width = 57;
    height = 84;
    frame = {
        burst: 7
    };
}
Burst.DragoonDeath = DragoonDeath;

export class TemplarDeath extends Burst {
    constructor(props) {
        super(props);
        //Nothing
    }

    //Add basic unit info
    name = "Templar";
    imgPos = {
        burst: {
            left: [30, 158, 286, 414, 542, 670],
            top: [2078, 2078, 2078, 2078, 2078, 2078]
        }
    };
    width = 57;
    height = 84;
    frame = {
        burst: 6
    };
}
Burst.TemplarDeath = TemplarDeath;

export class HallucinationDeath extends Burst {
    constructor(props) {
        super(props);
        //Nothing
    }

    //Add basic unit info
    name = "Magic";
    imgPos = {
        burst: {
            left: [514, 593, 672, 514, 593, 672, 514, 593, 672, 514, 593, 672],
            top: [460, 460, 460, 526, 526, 526, 592, 592, 592, 658, 658, 658]
        }
    };
    width = 79;
    height = 66;
    frame = {
        burst: 12
    };
}
Burst.HallucinationDeath = HallucinationDeath;

export class ArchonBirth extends Burst {
    constructor(props) {
        super(props);
        //Mixin
    }

    //Add basic unit info
    name = "Archon";
    imgPos = {
        burst: {
            left: [20, 140, 260, 380, 500, 620, 740, 860, 980],
            top: [1700, 1700, 1700, 1700, 1700, 1700, 1700, 1700, 1700]
        }
    };
    width = 80;
    height = 80;
    frame = {
        burst: 9
    };
}
Burst.ArchonBirth = ArchonBirth;

export class DarkArchonBirth extends Burst {
    constructor(props) {
        super(props);
        //Mixin
    }

    //Add basic unit info
    name = "DarkArchon";
    imgPos = {
        burst: {
            left: [20, 140, 260, 380, 500, 620, 740, 860, 980],
            top: [1220, 1220, 1220, 1220, 1220, 1220, 1220, 1220, 1220]
        }
    };
    width = 80;
    height = 80;
    frame = {
        burst: 9
    };
}
Burst.DarkArchonBirth = DarkArchonBirth;
