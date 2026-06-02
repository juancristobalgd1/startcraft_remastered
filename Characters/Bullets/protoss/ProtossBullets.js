import Bullets from '../core/BulletsBase.js';
import Burst from '../../Bursts/core/BurstBase.js';
import Button from '../../Buttons/core/ButtonBase.js';
import Game from '../../../GameRule/Games/core/GameBase.js';
import { DragoonBallBroken } from '../../Bursts/protoss/ProtossEffects1.js';
import { ReaverBurst } from '../../Bursts/protoss/ProtossEffects2.js';

export class DragoonBall extends Bullets {
    constructor(props) {
        super(props);
    }
    //Add basic unit info
    name = "Burst";
    duration = 800;//Match attack sound
    imgPos = {
        moving: {
            left: [5, 36, 70, 101, 133],
            top: [862, 862, 862, 862, 862]
        }
    };
    width = 23;
    height = 21;
    frame = {
        moving: 5
    };
    forbidRotate = true;
    burstEffect = DragoonBallBroken;
    //Delay fire for Dragoon and PhotonCannon
    fire() {
        const delay = this.owner.fireDelay || 0;
        //Inherit fire function
        Game.commandTimeout(() => {
            super.fire();
        }, delay);
    }
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.DragoonBall = DragoonBall;
}

export class ArchonLightening extends Bullets {
    constructor(props) {
        super(props);
        //Override position to hands
        this.x += this.speed.x * 6;//N/8==40/70 (ArchonRadius/AttackRange)
        this.y += this.speed.y * 6;
        //Override speed, will not move
        this.speed = { x: 0, y: 0 };
    }
    //Add basic unit info
    name = "Burst";
    duration = 800;
    imgPos = {
        moving: {
            left: [4, 192, 388, 580],
            top: [704, 704, 704, 704]
        }
    };
    width = 90;
    height = 75;
    frame = {
        moving: 4
    };
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.ArchonLightening = ArchonLightening;
}

export class ScoutMissile extends Bullets {
    constructor(props) {
        super(props);
    }
    //Add basic unit info
    name = "Burst";
    duration = 1000;
    imgPos = {
        moving: {
            left: 53,//53//580
            top: 0
        }
    };
    width = 30;//30//55
    height = 34;//34//45
    frame = {
        moving: 1
    };
    burstEffect = DragoonBallBroken;
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.ScoutMissile = ScoutMissile;
}

export class ReaverBomb extends Bullets {
    constructor(props) {
        super(props);
    }
    //Add basic unit info
    name = "Burst";
    duration = 1000;
    imgPos = {
        moving: {
            left: 350,//186
            top: 0
        }
    };
    width = 70;//62
    height = 34;
    frame = {
        moving: 1
    };
    burstEffect = ReaverBurst;
    //Override
    fire() {
        super.fire();
        //Consume scarab
        if (this.owner.scarabNum > 0) {
            this.owner.scarabNum--;
            Button.reset();
        }
    }
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.ReaverBomb = ReaverBomb;
}

export class ReaverBombII extends Bullets {
    constructor(props) {
        super(props);
    }
    //Add basic unit info
    name = "Burst";
    duration = 1000;
    imgPos = {
        moving: {
            left: 300,
            top: 0
        }
    };
    width = 40;
    height = 30;
    frame = {
        moving: 1
    };
    forbidRotate = true;
    burstEffect = ReaverBurst;
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.ReaverBombII = ReaverBombII;
}

export class Interceptor extends Bullets {
    constructor(props) {
        super(props);
        this.damageDelayTicks = 5; // 500ms
        this.onDamageDelay = () => {
            const target = this.target;
            const owner = this.owner;
            if (target && target.status !== 'dead') {
                target.getDamageBy(owner);
                target.reactionWhenAttackedBy(owner);
            }
        };
    }
    //Add basic unit info
    name = "Burst";
    duration = 1000;
    imgPos = {
        moving: {
            left: [120, 170, 220, 272, 272, 120, 120, 120, 120, 120],
            top: [582, 582, 582, 582, 582, 582, 582, 582, 582, 582]
        }
    };
    width = 44;
    height = 28;
    frame = {
        moving: 10
    };
    //Override cause damage timing
    noDamage = true;
    fire(callback) {
        super.fire(callback);
    }
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.Interceptor = Interceptor;
}
