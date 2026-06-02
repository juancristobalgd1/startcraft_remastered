import Bullets from '../core/BulletsBase.js';
import Burst from '../../Bursts/core/BurstBase.js';
import { FireSparkSound, LaserSpark, VultureSpark } from '../../Bursts/terran/TerranEffects.js';
import { SmallExplode, MiddleExplode } from '../../Bursts/buildings/BuildingBursts.js';

export class Flame extends Bullets {
    constructor(props) {
        super(props);
    }
    //Add basic unit info
    name = "Burst";
    duration = 300;
    imgPos = {
        moving: {
            left: [15, 15, 80, 80, 170, 170],
            top: [86, 86, 86, 86, 86, 86]
        }
    };
    width = 76;
    height = 40;
    frame = {
        moving: 6
    };
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.Flame = Flame;
}

export class VultureBall extends Bullets {
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
    burstEffect = VultureSpark;
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.VultureBall = VultureBall;
}

export class Missile extends Bullets {
    constructor(props) {
        super(props);
    }
    //Add basic unit info
    name = "Wraith";
    duration = 1000;//Match attack sound
    imgPos = {
        moving: {
            left: 8,
            top: 90
        }
    };
    width = 16;
    height = 32;
    frame = {
        moving: 1
    };
    burstEffect = FireSparkSound;
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.Missile = Missile;
}

export class LongMissile extends Bullets {
    constructor(props) {
        super(props);
    }
    //Add basic unit info
    name = "Burst";
    duration = 600;//Match unit
    imgPos = {
        moving: {
            left: 0,
            top: 0
        }
    };
    width = 35;
    height = 30;
    frame = {
        moving: 1
    };
    burstEffect = FireSparkSound;
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.LongMissile = LongMissile;
}

export class SingleMissile extends Bullets {
    constructor(props) {
        super(props);
    }
    //Add basic unit info
    name = "Burst";
    duration = 600;//Match unit
    imgPos = {
        moving: {
            left: 0,
            top: 0
        }
    };
    width = 35;
    height = 15;
    frame = {
        moving: 1
    };
    burstEffect = FireSparkSound;
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.SingleMissile = SingleMissile;
}

export class MultipleMissile extends Bullets {
    constructor(props) {
        super(props);
    }
    //Add basic unit info
    name = "Burst";
    duration = 600;//Match unit
    imgPos = {
        moving: {
            left: 304,
            top: 56
        }
    };
    width = 94;
    height = 50;
    frame = {
        moving: 1
    };
    burstEffect = FireSparkSound;
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.MultipleMissile = MultipleMissile;
}

export class Laser extends Bullets {
    constructor(props) {
        super(props);
    }
    //Add basic unit info
    name = "BattleCruiser";
    duration = 300;//Match attack sound
    imgPos = {
        moving: {
            left: 16,
            top: 170
        }
    };
    width = 68;
    height = 12;
    frame = {
        moving: 1
    };
    burstEffect = LaserSpark;
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.Laser = Laser;
}

export class SmallLaser extends Bullets {
    constructor(props) {
        super(props);
    }
    //Add basic unit info
    name = "BattleCruiser";
    duration = 300;//Match attack sound
    imgPos = {
        moving: {
            left: 20,
            top: 170
        }
    };
    width = 22;
    height = 12;
    frame = {
        moving: 1
    };
    burstEffect = LaserSpark;
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.SmallLaser = SmallLaser;
}

export class HeatLaser extends Bullets {
    constructor(props) {
        super(props);
    }
    //Add basic unit info
    name = "HeroCruiser";
    duration = 300;//Match attack sound
    imgPos = {
        moving: {
            left: 16,
            top: 170
        }
    };
    width = 68;
    height = 12;
    frame = {
        moving: 1
    };
    burstEffect = SmallExplode;
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.HeatLaser = HeatLaser;
}

export class Yamato extends Bullets {
    constructor(props) {
        super(props);
    }
    //Add basic unit info
    name = "Burst";
    duration = 500;//Match attack sound
    imgPos = {
        moving: {
            left: [288, 192, 96, 0],
            top: [1195, 1195, 1195, 1195]
        }
    };
    width = 96;
    height = 96;
    frame = {
        moving: 4
    };
    burstEffect = MiddleExplode;
}
if (typeof window !== 'undefined') {
    window.Bullets = window.Bullets || {};
    window.Bullets.Yamato = Yamato;
}
