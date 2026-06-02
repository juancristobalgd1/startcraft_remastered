import Bullets from '../core/BulletsBase.js';
import Burst from '../../Bursts/core/BurstBase.js';
import Unit from '../../Units/core/UnitBase.js';
import Game from '../../../GameRule/Games/core/GameBase.js';
import { 
    GreenFog, 
    HydraSpark, 
    Parasite as ParasiteBurst, 
    Spore as SporeBurst, 
    GreenBallBroken, 
    PurpleCloudSpread,
    PurpleFog
} from '../../Bursts/zerg/ZergEffects1.js';

export class Spooge extends Bullets {
    constructor(props) {
        super(props);
    }
    //Add basic unit info
    name = "Hydralisk";
    duration = 400;
    imgPos = {
        moving: {
            left: [14, 72, 136, 204],
            top: [758, 758, 758, 758]
        }
    };
    width = 56;
    height = 28;
    frame = {
        moving: 4
    };
    burstEffect = HydraSpark;
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.Spooge = Spooge;
}

export class Thorn extends Bullets {
    constructor(props) {
        super(props);
    }
    //Add basic unit info
    name = "Lurker";
    duration = 600;
    imgPos = {
        moving: {
            left: [61, 88, 117, 144, 117, 88],
            top: [711, 711, 711, 711, 711, 711]
        }
    };
    width = 28;
    height = 35;
    frame = {
        moving: 6
    };
    forbidRotate = true;
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.Thorn = Thorn;
}

export class Darts extends Bullets {
    constructor(props) {
        super(props);
        this.life = this.traceTimes;
    }
    //Add basic unit info
    name = "Burst";
    duration = 400;
    imgPos = {
        moving: {
            left: [0, 36, 72, 108, 144, 180, 216, 252, 288, 324],
            top: [1051, 1051, 1051, 1051, 1051, 1051, 1051, 1051, 1051, 1051]
        }
    };
    width = 36;
    height = 36;
    frame = {
        moving: 10
    };
    burstEffect = GreenFog;
    //Chain tracing attack
    traceTimes = 3;
    traceRadius = 100;
    //Override
    noDamage = true;
    die() {
        const target = this.target;
        const owner = this.owner;
        //Interrupt tracing if target is dead first
        if (target.status == "dead") {
            //Former behavior before override
            super.die();
            return;
        }
        //Override damage, damage reduce
        target.getDamageBy(owner, this.life / this.traceTimes);
        target.reactionWhenAttackedBy(owner);
        //Bullet reduce
        this.life--;
        let traceEnemies;
        //Get all possible enemies
        if (owner.isEnemy) {
            traceEnemies = (owner.attackLimit) ? ((owner.attackLimit == "flying") ?
                Unit.ourFlyingUnits : Unit.ourGroundUnits) : Unit.allOurUnits();
        }
        else {
            traceEnemies = (owner.attackLimit) ? ((owner.attackLimit == "flying") ?
                Unit.enemyFlyingUnits : Unit.enemyGroundUnits) : Unit.allEnemyUnits();
        }
        //Filter out trace-able enemies
        traceEnemies = traceEnemies.filter((chara) => {
            return (chara != this.target) &&
                chara.insideCircle({ centerX: this.posX(), centerY: this.posY(), radius: this.traceRadius });
        });
        //Attack trace enemy
        if (traceEnemies.length > 0 && this.life > 0) {
            //Initial position again before jumping
            this.x = target.posX() - this.width / 2;
            this.y = target.posY() - this.height / 2;
            this.target = traceEnemies[0];
            const targetX = this.target.posX();
            const targetY = this.target.posY();
            const myX = this.posX();
            const myY = this.posY();
            //Update bullet speed
            this.speed = {
                x: (targetX - myX) / (this.duration / 100),
                y: (targetY - myY) / (this.duration / 100)
            };
            //Update bullet angle
            if (this.forbidRotate) this.angle = 0;
            else {
                //Below angle represents direction toward target
                this.angle = Math.atan((myY - targetY) / (targetX - myX));
                if (targetX < myX) this.angle += Math.PI;
            }
            //Reset ticks remaining for the next jump
            this.ticksRemaining = Math.max(1, (this.duration / 100) >> 0);
        }
        else {
            //Former behavior before override
            super.die();
        }
    }
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.Darts = Darts;
}

export class Parasite extends Bullets {
    constructor(props) {
        super(props);
    }
    //Add basic unit info
    name = "Burst";
    duration = 600;
    imgPos = {
        moving: {
            left: 152,
            top: 0
        }
    };
    width = 10;
    height = 34;
    frame = {
        moving: 1
    };
    burstEffect = ParasiteBurst;
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.Parasite = Parasite;
}

export class GreenBall extends Bullets {
    constructor(props) {
        super(props);
    }
    //Add basic unit info
    name = "Guardian";
    duration = 800;
    imgPos = {
        moving: {
            left: 32,
            top: 520
        }
    };
    width = 20;
    height = 20;
    frame = {
        moving: 1
    };
    forbidRotate = true;
    burstEffect = GreenBallBroken;
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.GreenBall = GreenBall;
}

export class PurpleCloud extends Bullets {
    constructor(props) {
        super(props);
    }
    //Add basic unit info
    name = "Devourer";
    duration = 900;
    imgPos = {
        moving: {
            left: 8,
            top: 973
        }
    };
    width = 70;
    height = 32;
    frame = {
        moving: 1
    };
    burstEffect = PurpleCloudSpread;
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.PurpleCloud = PurpleCloud;
}

export class Spore extends Bullets {
    constructor(props) {
        super(props);
    }
    //Add basic unit info
    name = "Burst";
    duration = 500;
    imgPos = {
        moving: {
            left: 522,
            top: 6
        }
    };
    width = 28;
    height = 40;
    frame = {
        moving: 6
    };
    burstEffect = SporeBurst;
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.Spore = Spore;
}

export class DevilBall extends Darts {
    constructor(props) {
        super(props);
    }
    //Add basic unit info
    name = "Mutalisk";
    duration = 300;
    imgPos = {
        moving: {
            left: 352,
            top: 442
        }
    };
    width = 20;
    height = 20;
    frame = {
        moving: 1
    };
    burstEffect = PurpleFog;
    //Chain tracing attack
    traceTimes = 4;
    traceRadius = 200;
    //Override
    noDamage = true;

    fire() {
        const delay = this.owner.fireDelay || 0;
        Game.commandTimeout(() => {
            super.fire();
        }, delay);
    }
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.DevilBall = DevilBall;
}
