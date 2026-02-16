//One animation period which only play for a while and die
class Burst extends Gobj {
    constructor(props) {
        super(props);
        if (!props) return;
        if (props.target) {
            this.target = props.target;
            if (props.above) this.above = true;
            if (props.autoSize) this.autoSize = true;
            var times = this.scale ? (this.scale) : 1;
            if (this.autoSize != null) {
                switch (this.autoSize) {
                    case 'MAX':
                        this.scale = Math.max(this.target.width, this.target.height) * 2 * times / (this.width + this.height);
                        break;
                    case 'MIN':
                        this.scale = Math.min(this.target.width, this.target.height) * 2 * times / (this.width + this.height);
                        break;
                    default:
                        this.scale = (this.target.width + this.target.height) * times / (this.width + this.height);
                }
                times = this.scale;
            }
            this.x = (this.target.posX() - this.width * times / 2) >> 0;
            this.y = (this.target.posY() - this.height * times / 2) >> 0;
        }
        else {
            var times = this.scale ? (this.scale) : 1;
            this.x = props.x - this.width * times / 2;
            this.y = props.y - this.height * times / 2;
        }
        if (this.forever) this.duration = -1;
        if (props.duration != null) this.duration = props.duration;
        if (props.scale) this.scale = props.scale;
        if (props.callback) this.callback = props.callback;
        this.burst();
        Burst.allEffects.push(this);
    }

    animeFrame() {
        this.action++;
        var arrLimit = (this.imgPos[this.status].left instanceof Array) ? (this.imgPos[this.status].left.length) : 1;
        if (this.action == this.frame[this.status] || this.action == arrLimit) {
            this.action = 0;
        }
        if (this.above && this.target) {
            var times = this.scale ? (this.scale) : 1;
            this.x = (this.target.posX() - this.width * times / 2) >> 0;
            this.y = (this.target.posY() - this.height * times / 2) >> 0;
        }
    }

    burst() {
        this.status = "burst";
        this._timer = setInterval(() => {
            this.animeFrame();
        }, 100);
        var duration = this.duration ? this.duration : (this.frame['burst'] * 100);
        if (duration > 0) {
            setTimeout(() => {
                this.die();
            }, duration);
        }
    }

    die() {
        if (this.callback) this.callback();
        Gobj.prototype.die.call(this);
    }
}

Burst.allEffects = [];
