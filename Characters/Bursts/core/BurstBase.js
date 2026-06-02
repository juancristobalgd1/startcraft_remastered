import Gobj from '../../Gobj.js';

//One animation period which only play for a while and die
class Burst extends Gobj {
    static allEffects = [];

    constructor(props) {
        super(props);
        if (!props) return;
        
        // Defer complete initialization to next tick so that subclasses' fields 
        // (like width, height, frame, imgPos) are fully initialized before use.
        setTimeout(() => {
            if (props.target) {
                this.target = props.target;
                if (props.above) this.above = true;
                if (props.autoSize) this.autoSize = true;
                let times = this.scale ? (this.scale) : 1;
                if (this.autoSize != null) {
                    switch (this.autoSize) {
                        case 'MAX':
                            this.scale = Math.max(this.target.width, this.target.height) * 2 * times / ((this.width || 0) + (this.height || 0));
                            break;
                        case 'MIN':
                            this.scale = Math.min(this.target.width, this.target.height) * 2 * times / ((this.width || 0) + (this.height || 0));
                            break;
                        default:
                            this.scale = (this.target.width + this.target.height) * times / ((this.width || 0) + (this.height || 0));
                    }
                    times = this.scale;
                }
                this.x = (this.target.posX() - (this.width || 0) * times / 2) >> 0;
                this.y = (this.target.posY() - (this.height || 0) * times / 2) >> 0;
            }
            else {
                let times = this.scale ? (this.scale) : 1;
                this.x = props.x - (this.width || 0) * times / 2;
                this.y = props.y - (this.height || 0) * times / 2;
            }
            if (this.forever) this.duration = -1;
            if (props.duration != null) this.duration = props.duration;
            if (props.scale) this.scale = props.scale;
            if (props.callback) this.callback = props.callback;
            this.burst();
            Burst.allEffects.push(this);
        }, 0);
    }

    animeFrame() {
        if (typeof Game !== 'undefined' && Game?.isPaused) return;
        if (this.target && this.target.status == 'dead' && !this.target.isResource) {
            this.die();
            return;
        }
        this.action++;
        if (!this.imgPos || !this.imgPos[this.status]) return;
        const arrLimit = (this.imgPos[this.status].left instanceof Array) ? (this.imgPos[this.status].left.length) : 1;
        if (this.action == this.frame[this.status] || this.action == arrLimit) {
            this.action = 0;
        }
        if (this.above && this.target) {
            const times = this.scale ? (this.scale) : 1;
            this.x = (this.target.posX() - this.width * times / 2) >> 0;
            this.y = (this.target.posY() - this.height * times / 2) >> 0;
        }
        if (this.ticksRemaining > 0) {
            this.ticksRemaining--;
            if (this.ticksRemaining === 0) {
                this.die();
            }
        }
    }

    burst() {
        this.status = "burst";
        const duration = this.duration ? this.duration : (this.frame['burst'] * 100);
        if (duration > 0) {
            this.ticksRemaining = Math.max(1, (duration / 100) >> 0);
        } else {
            this.ticksRemaining = -1; // Forever/until killed
        }
        this._timer = setInterval(() => {
            this.animeFrame();
        }, 100);
    }

    die() {
        if (this.callback) this.callback();
        super.die();
    }
}

if (typeof window !== 'undefined') {
    window.Burst = Burst;
}

export default Burst;
