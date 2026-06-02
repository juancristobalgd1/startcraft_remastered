import Protoss from '../core/ProtossBase.js';
import Unit from '../../Units/core/UnitBase.js';
import AttackableUnit from '../../Units/core/AttackableUnitBase.js';
import { recover } from '../core/ProtossHelper.js';
import { SmallBlueExplode } from '../../Bursts/buildings/BuildingBursts.js';
import { ProbeSpark } from '../../Bursts/protoss/ProtossEffects1.js';

export class Probe extends AttackableUnit {
    constructor(props) {
        super(props);
        this.imgPos.dock = this.imgPos.moving;
        this.frame.dock = this.frame.moving;
    }

    name = "Probe";
    imgPos = {
        moving: {
            left: [0, 64, 128, 192, 256, 64, 128, 192],
            top: [0, 0, 0, 0, 0, 32, 32, 32]
        },
        attack: {
            left: [0, 64, 128, 192, 256, 64, 128, 192],
            top: [0, 0, 0, 0, 0, 32, 32, 32]
        }
    };
    width = 32;//N-1
    height = 32;//N-1
    frame = {
        moving: 1
    };
    speed = Unit.getSpeedMatrixBy(12);
    HP = 20;
    SP = 20;
    damage = 5;
    armor = 0;
    plasma = 0;
    sight = 280;
    meleeAttack = true;
    attackInterval = 2200;
    portraitOffset = {x:0,y:112};
    dieEffect = SmallBlueExplode;
    attackEffect = ProbeSpark;
    isFlying = false;
    attackLimit = "ground";
    unitType = Unit.SMALL;
    attackType = AttackableUnit.NORMAL_ATTACK;
    cost = {
        mine:50,
        man:1,
        time:200
    };
    upgrade = ['UpgradeGroundArmor','UpgradePlasmaShields'];
    items = {
        '4':undefined,
        '5':{name:'gather'},
        '7':{name:'BasicStructure'},
        '8':{name:'AdvancedStructure'}
    };

    recover = recover;

    gather(target) {
        return Unit.prototype.gather.call(this, target);
    }
}
Protoss.Probe = Probe;
