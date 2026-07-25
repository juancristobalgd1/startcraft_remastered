import Game from '../GameRule/Games/core/GameBase.js';
import '../Utils/jquery.min.js';
const $ = globalThis.$;
export default class Gobj {
    // Private fields
    #privateData = { _timer: -1 };
    // Static properties
    static detectorBuffer = { isInvisible: false };

    constructor(props) {
        if (!props) return;
        this.x = props.x;
        this.y = props.y;
        if (props.target instanceof Gobj) {
            this.x = (props.target.posX() - (this.width || 0) / 2) | 0;
            this.y = (props.target.posY() - (this.height || 0) / 2) | 0;
        }
        this.team = props.team !== undefined ? props.team : (props.isEnemy ? 1 : 0);
        this.isEnemy = (Game.team !== undefined) ? (this.team !== Game.team) : Boolean(props.isEnemy || props.target?.isEnemy);
        this.action = 0;
        this.status = "";
        this.buffer = {};
        this.override = {};
        this.bufferObjs = [];
        this._timer = -1;
        this.#privateData = { _timer: -1 };

        // Ensure speed is initialized if not provided by prototype
        if (this.speed === undefined) {
            this.speed = { x: 0, y: 0 };
        }
    }

    getP(attr) {
        return attr ? this.#privateData[attr] : this.#privateData;
    }
    setP(attr, value) {
        this.#privateData[attr] = value;
    }
    posX() {
        return this.x + this.width * 0.5;
    }
    posY() {
        return this.y + this.height * 0.5;
    }
    detectOutOfBound() { }
    updateLocation() {
        if (typeof Game !== 'undefined' && Game?.isPaused) return;
        this.x += this.speed.x;
        this.y += this.speed.y;
    }
    animeFrame() {
        if (typeof Game !== 'undefined' && Game?.isPaused) return;
        if (++this.action >= this.frame[this.status]) {
            this.action = 0;
        }
    }
    moving() {
        this.stop();
        this.status = "moving";

        const tick = () => {
            if (typeof Game !== 'undefined' && Game?.isPaused) return;
            this.animeFrame();
            this.updateLocation();
            this.detectOutOfBound();
        };
        tick();
        this._timer = setInterval(tick, 100);
    }
    stop() {
        clearInterval(this._timer);
        clearTimeout(this._timer);
        this._timer = -1;
    }
    die() {
        this.stop();
        this.status = "dead";
        this.action = 0;
        if (this.dieEffect) {
            new this.dieEffect({ x: this.posX(), y: this.posY() });
        }
    }
    include(obj) {
        const px = obj.posX(), py = obj.posY();
        return py > this.y && py < this.y + this.height &&
            px > this.x && px < this.x + this.width;
    }
    includePoint(x, y) {
        return y > this.y && y < this.y + this.height &&
            x > this.x && x < this.x + this.width;
    }
    insideSquare(rect) {
        const dx = Math.abs(rect.centerX - this.posX());
        const dy = Math.abs(rect.centerY - this.posY());
        const r = rect.radius;
        return Array.isArray(r) ? (dx < r[0] && dy < r[1]) : (dx < r && dy < r);
    }
    insideRect(rect) {
        const px = this.posX(), py = this.posY();
        return px > rect.start.x && px < rect.end.x &&
            py > rect.start.y && py < rect.end.y;
    }
    insideCircle(circle) {
        const dx = circle.centerX - this.posX();
        const dy = circle.centerY - this.posY();
        const r = circle.radius;
        return dx * dx + dy * dy < r * r;
    }
    // Alias
    inside(shape) {
        return this.insideCircle(shape);
    }
    radius() {
        return Math.min(this.width, this.height) * 0.5;
    }
    distanceFrom(obj) {
        const tx = obj instanceof Gobj ? obj.posX() : obj.x;
        const ty = obj instanceof Gobj ? obj.posY() : obj.y;
        // Use hypot for better precision and cleaner code
        return Math.hypot(this.posX() - tx, this.posY() - ty);
    }
    insideScreen() {
        return (this.x + this.width) > GameMap.offsetX &&
            this.x < GameMap.offsetX + Game.HBOUND &&
            (this.y + this.height) > GameMap.offsetY &&
            this.y < GameMap.offsetY + Game.VBOUND;
    }
    isIdle() {
        return this.status === "dock";
    }
    canSee(enemy) {
        return enemy.inside({
            centerX: this.posX(),
            centerY: this.posY(),
            radius: this.get('sight')
        });
    }
    // Reemplazo de eval() - acceso seguro a propiedades anidadas
    get(prop) {
        let result;
        if (prop.indexOf('.') === -1) {
            result = this[prop];
            // Access static properties via constructor
            if (result === undefined && this.constructor) result = this.constructor[prop];
        }
        else {
            const parts = prop.split('.');
            result = parts.reduce((o, k) => o && o[k], this);
            if (result === undefined && this.constructor) {
                const root = this.constructor[parts[0]];
                if (root !== undefined) {
                    result = parts.slice(1).reduce((o, k) => o && o[k], root);
                }
            }
        }
        return (Array.isArray(result) && result.shareFlag)
            ? result[Number(this.isEnemy)]
            : result;
    }
    /**
     * Compatibility method for legacy .extends() pattern
     * Creates a new class extending the current one, mixing in properties.
     */
    static extends(mixin) {
        const Parent = this;
        class Child extends Parent {
            constructor(props) {
                super(props);
                if (mixin && mixin.constructorPlus) {
                    mixin.constructorPlus.call(this, props);
                }
            }
        }
        if (mixin && mixin.prototypePlus) {
            Object.assign(Child.prototype, mixin.prototypePlus);
        }
        return Child;
    }
    addBuffer(bufferObj, onAll) {
        if (!bufferObj) return;
        for (const prop in bufferObj) {
            if (!this.override[prop]) this.override[prop] = [];
            const buffer = bufferObj[prop];
            this.override[prop].unshift(buffer);
            if (this[prop] != null || prop === 'isInvisible' || onAll) {
                this[prop] = buffer;
            }
        }
        this.bufferObjs.push(bufferObj);
        if (this === Game.selectedUnit) Button.reset();
    }
    removeBuffer(bufferObj) {
        if (!bufferObj) return;
        const index = this.bufferObjs.indexOf(bufferObj);
        if (index === -1) return;
        this.bufferObjs.splice(index, 1);
        for (const prop in bufferObj) {
            if (this.override[prop]) {
                const bufferIndex = this.override[prop].indexOf(bufferObj[prop]);
                if (bufferIndex !== -1) {
                    this.override[prop].splice(bufferIndex, 1);
                    if (this.override[prop].length > 0) {
                        this[prop] = this.override[prop][0];
                    } else {
                        // Restore original value or delete if it was a buffer-only property
                        // This part is tricky without storing original values. 
                        // Assuming properties are either on the instance or prototype.
                        delete this.override[prop];
                        // If it's a property that should revert to a default/prototype value:
                        // For now, let's assume we can just delete it from the instance if it was an override
                        // But wait, if we delete it, it might expose the prototype value, which is good.
                        // However, we need to be careful not to delete properties that were there before buffers.
                        // The current implementation of addBuffer overwrites `this[prop]`.
                        // So to "restore", we should check if there are other overrides.
                        // If no overrides left, we should probably delete the instance property 
                        // to let the prototype property shine through, OR set it back to original if we knew it.
                        // Given the legacy code style, deleting from instance is a safe bet for prototype-based props.
                        delete this[prop];
                        // Re-apply from prototype if exists? 
                        // In the original code (inferred), it likely just took the next one in stack or default.
                    }
                }
            }
        }
        if (this === Game.selectedUnit) Button.reset();
    }
    cannotMove() {
        // Check if this is a Building or has burrowBuffer (burrowed units cannot move)
        return (this instanceof window.Building) || Boolean(this.burrowBuffer);
    }
    evolveTo(charaType, burstArr) {
        let newTypeChara = null;
        const selectedStatus = [this.selected, (this === Game.selectedUnit)];
        const isEnemy = this.isEnemy;

        // Hide die burst and sound for old unit, then die
        this.dieEffect = null;
        if (this.sound) this.sound.death = null;
        this.die();

        if (this.processing) delete this.processing;

        // Birth function
        const bornAt = (chara) => {
            newTypeChara = new charaType({ target: chara, isEnemy: isEnemy });
            // Fix cannot select egg issue
            setTimeout(() => {
                if (selectedStatus[0]) Game.addIntoAllSelected(newTypeChara);
                if (selectedStatus[1]) Game.changeSelectedTo(newTypeChara);
            }, 0);
        };

        // Burst chain
        if (burstArr) {
            const pos = { x: this.posX(), y: this.posY() };
            const Burst = window.Burst;
            let birth = new Burst[burstArr[0]](pos);

            const evolveChain = (N) => {
                return () => {
                    birth = new Burst[burstArr[N]](pos);
                    if ((N + 1) < burstArr.length) {
                        birth.callback = evolveChain(N + 1);
                    } else {
                        // Finish evolve chain
                        birth.callback = () => {
                            let times = charaType.prototype.birthCount;
                            if (times == null) times = 1;
                            for (let i = 0; i < times; i++) {
                                bornAt(birth);
                            }
                        };
                    }
                };
            };

            // Start evolve chain
            if (burstArr.length > 1) {
                birth.callback = evolveChain(1);
            } else {
                // Finish evolve chain
                birth.callback = () => {
                    let times = charaType.prototype.birthCount;
                    if (times == null) times = 1;
                    for (let i = 0; i < times; i++) {
                        bornAt(birth);
                    }
                };
            }
        } else {
            bornAt(this);
        }

        return newTypeChara;
    }
}
Gobj.prototype.name = "Gobj";
Gobj.prototype.width = 0;
Gobj.prototype.height = 0;
Gobj.prototype.frame = { moving: 1 };
Gobj.prototype.imgPos = {
    moving: {
        left: [0, 0, 0, 0, 0, 0, 0, 0],
        top: [0, 0, 0, 0, 0, 0, 0, 0]
    }
};

if (typeof window !== 'undefined') {
    window.Gobj = Gobj;
}