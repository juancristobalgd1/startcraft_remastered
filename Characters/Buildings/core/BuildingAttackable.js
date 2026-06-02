import AttackableUnit from '../../Units/core/AttackableUnitBase.js';
import Unit from '../../Units/core/UnitBase.js';
import Building from './BuildingBase.js';
import Referee from '../../../GameRule/Referees/core/RefereeBase.js';
import Gobj from '../../Gobj.js';
import Game from '../../../GameRule/Games/core/GameBase.js';

// Mixin function returning a class
export const AttackableMixin = (Base) => class extends Base {
    constructor(props) {
        super(props);
        this.attackTimer = 0;
        this.bullet = {};
        this.kill = 0;
        this.target = {};
        this.targetLock = false;
        this.coolDown = true;
    }

    // Proxy methods to AttackableUnit prototype
    isInAttackRange(enemy) { return AttackableUnit.prototype.isInAttackRange.call(this, enemy); }
    matchAttackLimit(enemy) { return AttackableUnit.prototype.matchAttackLimit.call(this, enemy); }
    stopAttack() { return AttackableUnit.prototype.stopAttack.call(this); }
    highestPriorityTarget() { return AttackableUnit.prototype.highestPriorityTarget.call(this); }
    isAttacking() { return AttackableUnit.prototype.isAttacking.call(this); }
    isMissingTarget() { return AttackableUnit.prototype.isMissingTarget.call(this); }
    isReloaded() { return AttackableUnit.prototype.isReloaded.call(this); }

    attack(enemy) {
        if ((enemy.isInvisible && !enemy.isEnemy) || !(this.matchAttackLimit(enemy))) {
            Referee.voice.pError.play();
            this.stopAttack();
            return;
        }
        if (enemy instanceof Gobj && enemy.status != "dead") {
            this.stopAttack();
            this.dock();
            this.target = enemy;
            const attackFrame = () => {
                if (Game && Game.isPaused) return;
                if (enemy.status == "dead" || (enemy.isInvisible && !enemy.isEnemy) || this.isMissingTarget()) {
                    this.stopAttack();
                    this.dock();
                }
                else {
                    if (this.isReloaded()) {
                        this.coolDown = false;
                        const now = (window.performance && performance.now) ? performance.now() : Date.now();
                        this._lastAttackAt = now;
                        Game.commandTimeout(() => {
                            this.coolDown = true;
                        }, this.get('attackInterval'));
                        let enemies;
                        if (this.AOE) {
                            if (this.isEnemy) {
                                enemies = (this.attackLimit) ? ((this.attackLimit == "flying") ?
                                    Unit.ourFlyingUnits : Unit.ourGroundUnits.concat(Building.ourBuildings))
                                    : (Unit.allOurUnits().concat(Building.ourBuildings));
                            }
                            else {
                                enemies = (this.attackLimit) ? ((this.attackLimit == "flying") ?
                                    Unit.enemyFlyingUnits : Unit.enemyGroundUnits.concat(Building.enemyBuildings))
                                    : (Unit.allEnemyUnits().concat(Building.enemyBuildings));
                            }
                            switch (this.AOE.type) {
                                case "LINE":
                                    {
                                        const N = Math.ceil(this.distanceFrom(enemy) / (this.AOE.radius));
                                        enemies = enemies.filter((chara) => {
                                            for (let n = 1; n <= N; n++) {
                                                const X = this.posX() + n * (enemy.posX() - this.posX()) / N;
                                                const Y = this.posY() + n * (enemy.posY() - this.posY()) / N;
                                                if (chara.insideCircle({ centerX: X >> 0, centerY: Y >> 0, radius: this.AOE.radius }) && !(chara.isInvisible && !chara.isEnemy)) {
                                                    return true;
                                                }
                                            }
                                            return false;
                                        });
                                        break;
                                    }
                                case "CIRCLE":
                                default:
                                    enemies = enemies.filter((chara) => {
                                        return chara.insideCircle(
                                            { centerX: enemy.posX(), centerY: enemy.posY(), radius: this.AOE.radius })
                                            && !(chara.isInvisible && !chara.isEnemy);
                                    });
                            }
                        }
                        if (this.imgPos.attack) {
                            this.action = 0;
                            this.status = "attack";
                            Game.commandTimeout(() => {
                                if (this.status == "attack") {
                                    this.status = "dock";
                                    this.action = 0;
                                }
                            }, this.frame.attack * 100);
                        }
                        if (this.Bullet) {
                            if (this.continuousAttack) {
                                this.bullet = [];
                                for (let N = 0; N < this.continuousAttack.count; N++) {
                                    const bullet = new this.Bullet({
                                        from: this,
                                        to: enemy
                                    });
                                    if (this.continuousAttack.layout) this.continuousAttack.layout(bullet, N);
                                    if (this.continuousAttack.onlyOnce && N != 0) {
                                        bullet.noDamage = true;
                                    }
                                    bullet.fire();
                                    this.bullet.push(bullet);
                                }
                            }
                            else {
                                this.bullet = new this.Bullet({
                                    from: this,
                                    to: enemy
                                });
                                this.bullet.fire();
                            }
                        }
                        else {
                            if (this.AOE) {
                                enemies.forEach((chara) => {
                                    chara.getDamageBy(this);
                                    chara.reactionWhenAttackedBy(this);
                                })
                            }
                            else {
                                Game.commandTimeout(() => {
                                    enemy.getDamageBy(this);
                                    enemy.reactionWhenAttackedBy(this);
                                }, this.frame.attack * 100);
                            }
                        }
                        if (this.attackEffect) {
                            if (this.AOE && this.AOE.hasEffect) {
                                enemies.forEach((chara) => {
                                    new this.attackEffect({ x: chara.posX(), y: chara.posY() });
                                })
                            }
                            else {
                                new this.attackEffect({ x: enemy.posX(), y: enemy.posY() });
                            }
                        }
                        if (!this.Bullet && this.insideScreen()) this.sound.attack.play();
                    }
                }
            };
            attackFrame();
            this.attackTimer = setInterval(attackFrame, 100);
        }
    }

    findNearbyTargets() {
        let units;
        let buildings;
        let results = [];
        if (this.isEnemy) {
            units = Unit.allOurUnits();
            buildings = Building.ourBuildings;
        }
        else {
            units = Unit.allEnemyUnits();
            buildings = Building.enemyBuildings;
        }
        [units, buildings].forEach((charas) => {
            const myX = this.posX();
            const myY = this.posY();
            charas = charas.filter((chara) => {
                return !(chara.isInvisible && !chara.isEnemy) && !chara.isResource && this.isInAttackRange(chara) && this.matchAttackLimit(chara);
            }).sort((chara1, chara2) => {
                const X1 = chara1.posX(), Y1 = chara1.posY(), X2 = chara2.posX(), Y2 = chara1.posY();
                return (X1 - myX) * (X1 - myX) + (Y1 - myY) * (Y1 - myY) - (X2 - myX) * (X2 - myX) - (Y2 - myY) * (Y2 - myY);
            });
            results = results.concat(charas);
        });
        const _priority = (chara) => {
            let p = 0;
            if (chara instanceof Unit) p += 20;
            if (['SCV', 'Drone', 'Probe'].indexOf(chara.name) != -1) p += 50;
            if (chara.attack && chara.target === this) p += 30;
            return p;
        };
        results.sort((chara1, chara2) => {
            const p1 = _priority(chara1);
            const p2 = _priority(chara2);
            if (p1 != p2) return p2 - p1;
            const X1 = chara1.posX() - this.posX(), Y1 = chara1.posY() - this.posY();
            const X2 = chara2.posX() - this.posX(), Y2 = chara2.posY() - this.posY();
            return X1 * X1 + Y1 * Y1 - (X2 * X2 + Y2 * Y2);
        });
        return results;
    }

    AI() {
        if (this.status == 'dead') return;
        if (this instanceof Building.ProtossBuilding && this.requiresPower && !this.isPowered()) {
            if (this.isAttacking()) this.stopAttack();
            return;
        }
        if (this.isAttacking()) {
            if (this.cannotReachTarget()) {
                this.stopAttack();
                this.targetLock = false;
            }
        }
        else {
            const enemy = this.highestPriorityTarget();
            if (enemy) this.attack(enemy);
        }
    }

    cannotReachTarget() {
        return !(this.isInAttackRange(this.target));
    }

    die() {
        super.die();
        this.stopAttack();
        this.selected = false;
    }
};

// Default class for standalone usage (if any)
export class AttackableBuilding extends AttackableMixin(Building) {
    name = "AttackableBuilding";
}

// Legacy object for Gobj.extends() compatibility
Building.Attackable = {
    constructorPlus: function (props) {
        this.attackTimer = 0;
        this.bullet = {};
        this.kill = 0;
        this.target = {};
        this.targetLock = false;
        this.coolDown = true;
    },
    prototypePlus: {
        name: "AttackableBuilding",
        
        isInAttackRange: AttackableUnit.prototype.isInAttackRange,
        matchAttackLimit: AttackableUnit.prototype.matchAttackLimit,
        stopAttack: AttackableUnit.prototype.stopAttack,
        highestPriorityTarget: AttackableUnit.prototype.highestPriorityTarget,
        isAttacking: AttackableUnit.prototype.isAttacking,
        isMissingTarget: AttackableUnit.prototype.isMissingTarget,
        isReloaded: AttackableUnit.prototype.isReloaded,

        // Custom methods
        attack: AttackableBuilding.prototype.attack,
        findNearbyTargets: AttackableBuilding.prototype.findNearbyTargets,
        AI: AttackableBuilding.prototype.AI,
        cannotReachTarget: AttackableBuilding.prototype.cannotReachTarget,

        die: function () {
            Building.prototype.die.call(this);
            this.stopAttack();
            this.selected = false;
        }
    }
};

export default Building.Attackable;
