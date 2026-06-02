import Burst from '../core/BurstBase.js';

export class InfestedBomb extends Burst {
    constructor(props) {
        super(props);
        //Has burst sound effect
        if (this.insideScreen()) new Audio('bgm/ReaverBomb.burst.wav').play();
    }

    //Add basic unit info
    name = "InfestedTerran";
    imgPos = {
        burst: {
            left: [0, 78, 156, 234, 312, 0, 78, 156, 234, 312],
            top: [432, 432, 432, 432, 432, 496, 496, 496, 496, 496]
        }
    };
    width = 78;
    height = 64;
    frame = {
        burst: 10
    };
}

export class ScourgeBomb extends Burst {
    constructor(props) {
        super(props);
        //Nothing
    }

    //Add basic unit info
    name = "Scourge";
    imgPos = {
        burst: {
            left: [0, 52, 104, 156, 208, 260, 312, 364, 416],
            top: [218, 218, 218, 218, 218, 218, 218, 218, 218]
        }
    };
    width = 52;
    height = 46;
    frame = {
        burst: 9
    };
}

export class RagnasaurDeath extends Burst {
    constructor(props) {
        super(props);
        //Nothing
    }

    //Add basic unit info
    name = "Ragnasaur";
    imgPos = {
        burst: {
            left: [0, 104, 208, 312, 416, 520, 624, 728],
            top: [936, 936, 936, 936, 936, 936, 936, 936]
        }
    };
    width = 128;
    height = 128;
    frame = {
        burst: 8
    };
}

export class RhynsdonDeath extends Burst {
    constructor(props) {
        super(props);
        //Nothing
    }

    //Add basic unit info
    name = "Rhynsdon";
    imgPos = {
        burst: {
            left: [0, 104, 208, 312, 416, 520, 624, 728],
            top: [1144, 1144, 1144, 1144, 1144, 1144, 1144, 1144]
        }
    };
    width = 104;
    height = 128;
    frame = {
        burst: 8
    };
}

export class UrsadonDeath extends Burst {
    constructor(props) {
        super(props);
        //Nothing
    }

    //Add basic unit info
    name = "Ursadon";
    imgPos = {
        burst: {
            left: [0, 92, 184, 276, 368, 460, 552, 644],
            top: [736, 736, 736, 736, 736, 736, 736, 736]
        }
    };
    width = 92;
    height = 92;
    frame = {
        burst: 8
    };
}

export class BengalaasDeath extends Burst {
    constructor(props) {
        super(props);
        //Nothing
    }

    //Add basic unit info
    name = "Bengalaas";
    imgPos = {
        burst: {
            left: [0, 128, 256, 384, 512, 640, 768, 896],
            top: [1536, 1536, 1536, 1536, 1536, 1536, 1536, 1536]
        }
    };
    width = 128;
    height = 128;
    frame = {
        burst: 8
    };
}

export class ScantidDeath extends Burst {
    constructor(props) {
        super(props);
        //Nothing
    }

    //Add basic unit info
    name = "Scantid";
    imgPos = {
        burst: {
            left: [0, 92, 184, 276, 368, 460, 552, 644],
            top: [1104, 1104, 1104, 1104, 1104, 1104, 1104, 1104]
        }
    };
    width = 92;
    height = 92;
    frame = {
        burst: 8
    };
}

export class KakaruDeath extends Burst {
    constructor(props) {
        super(props);
        //Nothing
    }

    //Add basic unit info
    name = "Kakaru";
    imgPos = {
        burst: {
            left: [0, 92, 184, 276, 368, 460, 552, 644],
            top: [1104, 1104, 1104, 1104, 1104, 1104, 1104, 1104]
        }
    };
    width = 92;
    height = 92;
    frame = {
        burst: 8
    };
}
