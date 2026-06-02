import Gobj from '../../Gobj.js';
import Unit from '../../Units/core/UnitBase.js';
import Building from '../../Buildings/core/BuildingBase.js';

class Bullets extends Gobj {
    constructor(props) {
        super(props);
        if (!props) return;
        
        // Defer complete initialization to next tick so that subclasses' fields 
        // (like width, height, duration, forbidRotate) are fully initialized before use.
        setTimeout(() => {
            this.owner = props.from;
            const ownerX = (this.owner instanceof Gobj) ? (this.owner.posX()) : (this.owner.x);
            const ownerY = (this.owner instanceof Gobj) ? (this.owner.posY()) : (this.owner.y);
            this.target = props.to;
            const targetX = (this.target instanceof Gobj) ? (this.target.posX()) : (this.target.x);
            const targetY = (this.target instanceof Gobj) ? (this.target.posY()) : (this.target.y);
            
            this.x = ownerX - (this.width || 0) / 2;
            this.y = ownerY - (this.height || 0) / 2;
            
            const duration = this.duration || 100;
            this.speed = {
                x: (targetX - ownerX) / (duration / 100),
                y: (targetY - ownerY) / (duration / 100)
            };
            if (this.forbidRotate) this.angle = 0;
            else {
                this.angle = Math.atan((ownerY - targetY) / (targetX - ownerX));
                if (targetX < ownerX) this.angle += Math.PI;
            }
            this.status = "dead";
            if (props.damage != null) this.damage = props.damage;
            this.ticksRemaining = Math.max(1, (duration / 100) >> 0);
            
            // Start the movement if fire was already called
            if (this._fired) {
                this.moving();
            }
        }, 0);
    }

    updateLocation() {
        this.x += this.speed.x;
        this.y += this.speed.y;
        
        // Custom damage delay ticks check for subclasses (e.g. Interceptor)
        if (this.damageDelayTicks && this.ticksRemaining === this.damageDelayTicks) {
            if (this.onDamageDelay) this.onDamageDelay();
        }

        if (this.ticksRemaining > 0) {
            this.ticksRemaining--;
            if (this.ticksRemaining === 0) {
                this.burst();
                if (this.fireCallback) this.fireCallback();
            }
        }
    }

    burst() {
        const owner = this.owner;
        const target = this.target;
        this.die();
        if (!(target instanceof Gobj)) return;
        let targets;
        if (owner.AOE) {
            if (owner.isEnemy) {
                targets = (owner.attackLimit) ? ((owner.attackLimit == "flying") ?
                    Unit.ourFlyingUnits : Unit.ourGroundUnits.concat(Building.ourBuildings))
                    : (Unit.allOurUnits().concat(Building.ourBuildings));
            }
            else {
                targets = (owner.attackLimit) ? ((owner.attackLimit == "flying") ?
                    Unit.enemyFlyingUnits : Unit.enemyGroundUnits.concat(Building.enemyBuildings))
                    : (Unit.allEnemyUnits().concat(Building.enemyBuildings));
            }
            switch (owner.AOE.type) {
                case "LINE":
                    {
                        const N = Math.ceil(owner.distanceFrom(target) / (owner.AOE.radius));
                        targets = targets.filter((chara) => {
                            for (let n = 1; n <= N; n++) {
                                const X = owner.posX() + n * (target.posX() - owner.posX()) / N;
                                const Y = owner.posY() + n * (target.posY() - owner.posY()) / N;
                                if (chara.insideCircle({ centerX: X >> 0, centerY: Y >> 0, radius: owner.AOE.radius }) && !chara.isInvisible) {
                                    return true;
                                }
                            }
                            return false;
                        });
                        break;
                    }
                case "CIRCLE":
                default:
                    targets = targets.filter((chara) => {
                        return chara.insideCircle(
                            { centerX: target.posX(), centerY: target.posY(), radius: owner.AOE.radius })
                            && !chara.isInvisible;
                    });
            }
        }
        if (this.burstEffect) {
            if (owner.AOE && owner.AOE.hasEffect) {
                const burstEffect = this.burstEffect;
                targets.forEach((chara) => {
                    new burstEffect({ target: chara, above: true });
                })
            }
            else {
                new this.burstEffect({ target: target, above: true });
            }
        }
        if (!this.noDamage) {
            if (owner.AOE) {
                targets.forEach((chara) => {
                    if (this.damage != null) chara.getDamageBy(this.damage);
                    else chara.getDamageBy(owner);
                    chara.reactionWhenAttackedBy(owner);
                })
            }
            else {
                if (this.damage != null) target.getDamageBy(this.damage);
                else target.getDamageBy(owner);
                target.reactionWhenAttackedBy(owner);
            }
        }
    }

    fire(callback) {
        this.fireCallback = callback;
        this._fired = true;
        // If already initialized (timeout ran)
        if (this.ticksRemaining !== undefined) {
            this.moving();
        }
    }
}

if (typeof window !== 'undefined') {
    window.Bullets = Bullets;
}

export default Bullets;
