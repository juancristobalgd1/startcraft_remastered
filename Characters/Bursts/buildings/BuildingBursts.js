import Burst from '../core/BurstBase.js';
import GameMap from '../../Map.js';

export class SmallExplode extends Burst {
    constructor(props) {
        super(props);
        //Nothing
    }

    //Add basic unit info
    name = "BuildingBurst";
    imgPos = {
        burst: {
            left: [56, 156, 256, 360],
            top: [1686, 1686, 1686, 1686]
        }
    };
    width = 80;
    height = 60;
    frame = {
        burst: 4
    };
}

export class MiddleExplode extends Burst {
    constructor(props) {
        super(props);
        //Nothing
    }

    //Add basic unit info
    name = "BuildingBurst";
    imgPos = {
        burst: {
            left: [44, 192, 342, 498],
            top: [1754, 1754, 1754, 1754]
        }
    };
    width = 120;
    height = 90;
    frame = {
        burst: 4
    };
}

export class BigExplode extends Burst {
    constructor(props) {
        super(props);
        //Nothing
    }

    //Add basic unit info
    name = "BuildingBurst";
    imgPos = {
        burst: {
            left: [26, 226, 424, 632],
            top: [1846, 1846, 1846, 1846]
        }
    };
    width = 160;
    height = 120;
    frame = {
        burst: 4
    };
}

export class SmallBlueExplode extends Burst {
    constructor(props) {
        super(props);
        //Nothing
    }

    //Add basic unit info
    name = "BuildingBurst";
    imgPos = {
        burst: {
            left: [50, 150, 250, 356],
            top: [1424, 1424, 1424, 1424]
        }
    };
    width = 80;
    height = 60;
    frame = {
        burst: 4
    };
}

export class MiddleBlueExplode extends Burst {
    constructor(props) {
        super(props);
        //Nothing
    }

    //Add basic unit info
    name = "BuildingBurst";
    imgPos = {
        burst: {
            left: [36, 184, 338, 494],
            top: [1484, 1484, 1484, 1484]
        }
    };
    width = 120;
    height = 90;
    frame = {
        burst: 4
    };
}

export class BigBlueExplode extends Burst {
    constructor(props) {
        super(props);
        //Nothing
    }

    //Add basic unit info
    name = "BuildingBurst";
    imgPos = {
        burst: {
            left: [22, 222, 420, 632],
            top: [1566, 1566, 1566, 1566]
        }
    };
    width = 160;
    height = 120;
    frame = {
        burst: 4
    };
}

export class ZergBuildingBurst extends Burst {
    constructor(props) {
        super(props);
        //Need clear mud when ZergBuildingBurst finished
        this.callback = function () {
            GameMap.needRefresh = "MAP";
        };
    }

    //Add basic unit info
    name = "BuildingBurst";
    imgPos = {
        burst: {
            left: [0, 200, 400, 600, 800, 0, 200, 400, 600, 800, 0, 200, 400, 400, 600, 600, 800, 800],
            top: [0, 0, 0, 0, 0, 200, 200, 200, 200, 200, 400, 400, 400, 400, 400, 400, 400, 400]
        }
    };
    width = 200;
    height = 200;
    frame = {
        burst: 18
    };
}

export class TerranBuildingBurst extends Burst {
    constructor(props) {
        super(props);
        //Nothing
    }

    //Add basic unit info
    name = "BuildingBurst";
    imgPos = {
        burst: {
            left: [0, 0, 200, 200, 400, 400, 600, 600, 800, 800, 0, 0, 200, 200, 400, 400, 600, 600],
            top: [600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 800, 800, 800, 800, 800, 800, 800, 800]
        }
    };
    width = 200;
    height = 200;
    frame = {
        burst: 18
    };
}

export class ProtossBuildingBurst extends Burst {
    constructor(props) {
        super(props);
        //Nothing
    }

    //Add basic unit info
    name = "BuildingBurst";
    imgPos = {
        burst: {
            left: [0, 0, 200, 200, 400, 400, 600, 600, 800, 800, 0, 0, 200, 200, 400, 400, 600, 600],
            top: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200]
        }
    };
    width = 200;
    height = 200;
    frame = {
        burst: 18
    };
}
