import { ZergBuilding } from '../core/BuildingRaces.js';
import { ZergBuildingBurst } from '../../Bursts/buildings/BuildingBursts.js';

export class OvermindI extends ZergBuilding {
    name = "OvermindI";
    dieEffect = ZergBuildingBurst;
    imgPos = {
        dock: {
            left: 6,
            top: 476
        }
    };
    width = 208;
    height = 122;
    frame = {
        dock: 1
    };
    HP = 3000;

    constructor(props) {
        super(props);
        //Nothing
    }
}
ZergBuilding.OvermindI = OvermindI;

export class OvermindII extends ZergBuilding {
    name = "OvermindII";
    dieEffect = ZergBuildingBurst;
    imgPos = {
        dock: {
            left: 6,
            top: 626
        }
    };
    width = 208;
    height = 136;
    frame = {
        dock: 1
    };
    HP = 3000;

    constructor(props) {
        super(props);
        //Nothing
    }
}
ZergBuilding.OvermindII = OvermindII;

