import Burst from '../core/BurstBase.js';

//Define different bursts
export class GreenFog extends Burst {
    constructor(props) {
        super(props);
        //Has burst sound effect
        new Audio('bgm/GreenFog.burst.wav').play();
    }

    //Add basic unit info
    name = "Mutalisk"; //Source img inside Mutalisk.png
    imgPos = {
        burst: {
            left: [8, 68, 134, 198, 263, 8, 68, 134, 198, 263],
            top: [468, 468, 468, 468, 468, 532, 532, 532, 532, 532]
        }
    };
    width = 52;
    height = 57;
    frame = {
        burst: 10
    };
}

export class GasSmoke extends Burst {
    constructor(props) {
        super(props);
    }

    name = "GasSmoke";
    duration = -1;
    useGameClock = true;
    imgPos = {
        burst: {
            left: 0,
            top: 0
        }
    };
    width = 60;
    height = 60;
    frame = {
        burst: 1
    };
}

export class Parasite extends Burst {
    constructor(props) {
        super(props);
        //Has burst sound effect
        new Audio('bgm/Magic.Parasite.wav').play();
    }

    //Add basic unit info
    name = "Mutalisk";
    imgPos = {
        burst: {
            left: [8, 68, 134, 198, 263, 8, 68, 134, 198, 263],
            top: [468, 468, 468, 468, 468, 532, 532, 532, 532, 532]
        }
    };
    width = 52;
    height = 57;
    frame = {
        burst: 10
    };
}

export class Spore extends Burst {
    constructor(props) {
        super(props);
        //No sound
    }

    //Add basic unit info
    name = "Mutalisk";
    imgPos = {
        burst: {
            left: [8, 68, 134, 198, 263, 8, 68, 134, 198, 263],
            top: [468, 468, 468, 468, 468, 532, 532, 532, 532, 532]
        }
    };
    width = 52;
    height = 57;
    frame = {
        burst: 10
    };
}

export class GreenBallBroken extends Burst {
    constructor(props) {
        super(props);
        //Has burst sound effect
        if (this.insideScreen()) new Audio('bgm/Greenball.burst.wav').play();
    }

    //Add basic unit info
    name = "Guardian";
    imgPos = {
        burst: {
            left: [0, 56, 119, 182, 252, 322, 396, 470],
            top: [556, 556, 556, 556, 556, 556, 556, 556]
        }
    };
    width = 60;
    height = 60;
    frame = {
        burst: 8
    };
}

export class PurpleCloudSpread extends Burst {
    constructor(props) {
        super(props);
        //Has burst sound effect
        if (this.insideScreen()) new Audio('bgm/PurpleCloud.burst.wav').play();
    }

    //Add basic unit info
    name = "Devourer";
    imgPos = {
        burst: {
            left: [17, 70, 122, 174, 230, 280, 335, 390, 452],
            top: [1022, 1022, 1022, 1022, 1022, 1022, 1022, 1022, 1022]
        }
    };
    width = 50;
    height = 60;
    callback = function () {
        const chara = this.target;
        //Fix all spored issue
        if (chara.status == 'dead' || chara.status == null) return;
        //Effect:PurpleBuffer when cloud spread on target chara
        //Buffer flag, can add up
        if (chara.buffer.PurpleCloud == 9) return; //9 at max
        if (chara.buffer.PurpleCloud > 0) chara.buffer.PurpleCloud++;
        else chara.buffer.PurpleCloud = 1;
        //Decrease defense and slow down attack rate
        const bufferObj = {
            armor: chara.get('armor') - 1
        };
        if (chara.plasma != null) bufferObj.plasma = chara.get('plasma') - 1;
        if (chara.attackInterval) bufferObj.attackInterval = Math.round(chara.get('attackInterval') * 1.1);
        //Apply buffer
        chara.addBuffer(bufferObj);
        if (!chara.purpleBuffer) chara.purpleBuffer = [];
        chara.purpleBuffer.push(bufferObj);
        //Purple effect
        new Animation.PurpleEffect({
            target: chara,
            callback: function () {
                //Restore in 30 seconds, Last In First Out
                if (chara.purpleBuffer && chara.removeBuffer(chara.purpleBuffer.pop())) {
                    chara.buffer.PurpleCloud--;
                }
                //Full restore
                if (chara.buffer.PurpleCloud == 0) {
                    delete chara.buffer.PurpleCloud;
                    delete chara.purpleBuffer;
                }
            }
        });
    };
    frame = {
        burst: 9
    };
}

export class Sunken extends Burst {
    constructor(props) {
        super(props);
        //Has burst sound effect
        if (this.insideScreen()) new Audio('bgm/Sunken.burst.wav').play();
    }

    //Add basic unit info
    name = "Burst";
    imgPos = {
        burst: {
            left: [46, 174, 302, 432, 560, 688],
            top: [626, 626, 626, 626, 626, 626]
        }
    };
    width = 28;
    height = 40;
    frame = {
        burst: 6
    };
}

export class HydraSpark extends Burst {
    constructor(props) {
        super(props);
        //Nothing
    }

    //Add basic unit info
    name = "Hydralisk";
    imgPos = {
        burst: {
            left: [0, 34, 68, 102, 136, 170, 204, 238],
            top: [801, 801, 801, 801, 801, 801, 801, 801]
        }
    };
    width = 34;
    height = 35;
    frame = {
        burst: 8
    };
}
if (typeof window !== 'undefined') {
    window.Animation = window.Animation || {};
    window.Animation.HydraSpark = HydraSpark;
}

export class PurpleFog extends Burst {
    constructor(props) {
        super(props);
        if (this.insideScreen()) new Audio('bgm/ReaverBomb.burst.wav').play();
    }

    name = "Mutalisk";
    imgPos = {
        burst: {
            left: [338, 398, 464, 528, 593, 338, 398, 464, 528, 593],
            top: [468, 468, 468, 468, 468, 532, 532, 532, 532, 532]
        }
    };
    width = 52;
    height = 57;
    frame = {
        burst: 10
    };
}

if (typeof window !== 'undefined') {
    window.Burst = window.Burst || {};
    window.Burst.PurpleFog = PurpleFog;
}

export default HydraSpark;
