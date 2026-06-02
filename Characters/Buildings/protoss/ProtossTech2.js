import { ProtossBuilding } from '../core/BuildingRaces.js';
import { BigBlueExplode, MiddleBlueExplode, SmallBlueExplode } from '../../Bursts/buildings/BuildingBursts.js';

export class Observatory extends ProtossBuilding {
    name = "Observatory";
    dieEffect = MiddleBlueExplode;
    imgPos = {
        dock: {
            left: 0,
            top: 302
        }
    };
    width = 96;
    height = 82;
    frame = {
        dock: 1
    };
    HP = 250;
    SP = 250;
    cost = {
        mine: 50,
        gas: 100,
        time: 300
    };
    requiresPower = true;
    items = {
        '1': { name: 'DevelopGraviticBooster' },
        '2': { name: 'DevelopSensorArray' }
    };

    constructor(props) {
        super(props);
    }
}
ProtossBuilding.Observatory = Observatory;

export class ArbiterTribunal extends ProtossBuilding {
    name = "ArbiterTribunal";
    dieEffect = MiddleBlueExplode;
    imgPos = {
        dock: {
            left: 408,
            top: 176
        }
    };
    width = 94;
    height = 80;
    frame = {
        dock: 1
    };
    HP = 500;
    SP = 500;
    cost = {
        mine: 200,
        gas: 150,
        time: 600
    };
    requiresPower = true;
    items = {
        '1': { name: 'DevelopRecall' },
        '2': { name: 'DevelopStasisField' },
        '3': { name: 'DevelopKhaydarinCore' }
    };

    constructor(props) {
        super(props);
    }
}
ProtossBuilding.ArbiterTribunal = ArbiterTribunal;

export class TeleportGate extends ProtossBuilding {
    name = "TeleportGate";
    dieEffect = BigBlueExplode;
    imgPos = {
        dock: {
            left: 602,
            top: 132
        }
    };
    width = 126;
    height = 148;
    frame = {
        dock: 1
    };
    HP = 500;
    SP = 500;
    requiresPower = true;

    constructor(props) {
        super(props);
    }
}
ProtossBuilding.TeleportGate = TeleportGate;

export class Pyramid extends ProtossBuilding {
    name = "Pyramid";
    dieEffect = BigBlueExplode;
    imgPos = {
        dock: {
            left: 620,
            top: 284
        }
    };
    width = 128;
    height = 120;
    frame = {
        dock: 1
    };
    HP = 1500;
    SP = 1500;
    requiresPower = true;

    constructor(props) {
        super(props);
    }
}
ProtossBuilding.Pyramid = Pyramid;

export class TeleportPoint extends ProtossBuilding {
    name = "TeleportPoint";
    dieEffect = MiddleBlueExplode;
    imgPos = {
        dock: {
            left: 516,
            top: 320
        }
    };
    width = 100;
    height = 64;
    frame = {
        dock: 1
    };
    HP = 100;
    SP = 100;
    requiresPower = true;

    constructor(props) {
        super(props);
    }
}
ProtossBuilding.TeleportPoint = TeleportPoint;
