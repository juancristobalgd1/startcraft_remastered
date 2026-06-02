import { ProtossBuilding } from '../core/BuildingRaces.js';
import { AttackableMixin } from '../core/BuildingAttackable.js';
import AttackableUnit from '../../Units/core/AttackableUnitBase.js';
import Gobj from '../../Gobj.js';
import Building from '../core/BuildingBase.js';
import { DragoonBall } from '../../Bullets/protoss/ProtossBullets.js';
import { BigBlueExplode, MiddleBlueExplode, SmallBlueExplode } from '../../Bursts/buildings/BuildingBursts.js';

export class Nexus extends ProtossBuilding {
    name = "Nexus";
    dieEffect = BigBlueExplode;
    imgPos = {
        dock: {
            left: 24,
            top: 12
        }
    };
    width = 146;
    height = 136;
    frame = {
        dock: 1
    };
    HP = 750;
    SP = 750;
    manPlus = 10;
    cost = {
        mine: 400,
        time: 1200
    };
    items = {
        '1': { name: 'Probe' },
        '6': { name: 'SetRallyPoint' }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
ProtossBuilding.Nexus = Nexus;

export class Pylon extends ProtossBuilding {
    name = "Pylon";
    dieEffect = SmallBlueExplode;
    imgPos = {
        dock: {
            left: 454,
            top: 314
        }
    };
    width = 60;
    height = 68;
    frame = {
        dock: 1
    };
    HP = 300;
    SP = 300;
    manPlus = 8;
    cost = {
        mine: 100,
        time: 300
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
ProtossBuilding.Pylon = Pylon;

export class Assimilator extends ProtossBuilding {
    name = "Assimilator";
    dieEffect = MiddleBlueExplode;
    imgPos = {
        dock: {
            left: 300,
            top: 36
        }
    };
    width = 126;
    height = 100;
    frame = {
        dock: 1
    };
    HP = 450;
    SP = 450;
    cost = {
        mine: 100,
        time: 400
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
ProtossBuilding.Assimilator = Assimilator;

export class Gateway extends ProtossBuilding {
    name = "Gateway";
    dieEffect = BigBlueExplode;
    imgPos = {
        dock: {
            left: 580,
            top: 20
        }
    };
    width = 128;
    height = 110;
    frame = {
        dock: 1
    };
    HP = 500;
    SP = 500;
    requiresPower = true;
    cost = {
        mine: 150,
        time: 600
    };
    items = {
        '1': { name: 'Zealot' },
        '2': {
            name: 'Dragoon', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'CyberneticsCore';
                })
            }
        },
        '3': {
            name: 'Templar', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'TemplarArchives';
                })
            }
        },
        '4': {
            name: 'DarkTemplar', condition: function () {
                return Building.ourBuildings.some(function (chara) {
                    return chara.name == 'TemplarArchives';
                })
            }
        },
        '6': { name: 'SetRallyPoint' }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
ProtossBuilding.Gateway = Gateway;

export class Forge extends ProtossBuilding {
    name = "Forge";
    dieEffect = MiddleBlueExplode;
    imgPos = {
        dock: {
            left: 210,
            top: 178
        }
    };
    width = 102;
    height = 80;
    frame = {
        dock: 1
    };
    HP = 550;
    SP = 550;
    requiresPower = true;
    cost = {
        mine: 150,
        time: 400
    };
    items = {
        '1': { name: 'UpgradeGroundWeapons' },
        '2': { name: 'UpgradeGroundArmor' },
        '3': { name: 'UpgradePlasmaShields' }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
ProtossBuilding.Forge = Forge;

export class PhotonCannon extends AttackableMixin(ProtossBuilding) {
    name = "PhotonCannon";
    dieEffect = MiddleBlueExplode;
    imgPos = {
        dock: {
            left: [98, 162, 226, 290, 290, 290, 290, 290, 290],
            top: [320, 320, 320, 320, 320, 320, 320, 320, 320]
        }
    };
    width = 62;
    height = 54;
    frame = {
        dock: 1,
        attack: 9
    };
    requiresPower = true;
    HP = 100;
    SP = 100;
    detector = Gobj.detectorBuffer;
    cost = {
        mine: 150,
        time: 500
    };
    damage = 20;
    attackRange = 245;
    attackInterval = 2200;
    attackType = AttackableUnit.NORMAL_ATTACK;
    fireDelay = 400;
    Bullet = DragoonBall;

    constructor(props) {
        super(props);
        this.imgPos.attack = this.imgPos.dock;
        if (!this.sound) this.sound = {};
        this.sound.attack = new Audio('bgm/Protoss/Dragoon.attack.wav');
    }
}
ProtossBuilding.PhotonCannon = PhotonCannon;

export class CyberneticsCore extends ProtossBuilding {
    name = "CyberneticsCore";
    dieEffect = MiddleBlueExplode;
    imgPos = {
        dock: {
            left: 314,
            top: 168
        }
    };
    width = 90;
    height = 88;
    frame = {
        dock: 1
    };
    HP = 500;
    SP = 500;
    requiresPower = true;
    cost = {
        mine: 200,
        time: 600
    };
    items = {
        '1': { name: 'UpgradeAirWeapons' },
        '2': { name: 'UpgradeAirArmor' },
        '3': { name: 'DevelopSingularityCharge' }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
ProtossBuilding.CyberneticsCore = CyberneticsCore;

export class ShieldBattery extends ProtossBuilding {
    name = "ShieldBattery";
    dieEffect = MiddleBlueExplode;
    imgPos = {
        dock: {
            left: 360,
            top: 318
        }
    };
    width = 90;
    height = 64;
    frame = {
        dock: 1
    };
    HP = 200;
    SP = 200;
    MP = 200;
    requiresPower = true;
    cost = {
        mine: 100,
        time: 300
    };
    items = {
        '1': { name: 'RechargeShields' }
    };

    constructor(props) {
        super(props);
        //Nothing
    }
}
ProtossBuilding.ShieldBattery = ShieldBattery;
