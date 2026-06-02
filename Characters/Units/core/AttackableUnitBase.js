import Gobj from '../../Gobj.js';
import _$ from '../../../Utils/gFrame/core.js';
import Unit from './UnitBase.js';
import Referee from '../../../GameRule/Referees/core/RefereeBase.js';
import Building from '../../Buildings/core/BuildingBase.js';
import Game from '../../../GameRule/Games/core/GameBase.js';

export default class AttackableUnit extends Unit {
    static NORMAL_ATTACK = 0;
    static BURST_ATTACK = 1;
    static WAVE_ATTACK = 2;



    constructor(props) {
        super(props);
        if (!props) return;
        this.attackTimer = 0;
        this.bullet = {};
        this.kill = 0;
        this.target = {};
        this.targetLock = false;
        this.coolDown = true;
        if (this.meleeAttack) this.attackRange = Math.max(this.radius(), 35);
        this.sound.attack = null;
        if (this.name && this.name !== 'AttackableUnit') {
            this.sound.attack = _$.lazyAudio('bgm/' + this.name + '.attack.wav');
        }
        // Avoid sharing stateful objects between instances while keeping prototype inheritance for upgrades
        if (this.attackMode) this.attackMode = Object.create(this.attackMode);
        if (this.continuousAttack) this.continuousAttack = Object.create(this.continuousAttack);
    }

    isInAttackRange(enemy) {
        return enemy.inside({ centerX: this.posX(), centerY: this.posY(), radius: this.get('attackRange') });
    }

    matchAttackLimit(enemy) {
        if (this.attackLimit) {
            if ((this.attackLimit == "flying" && !(enemy.isFlying)) ||
                (this.attackLimit == "ground" && enemy.isFlying)) return false;
        }
        return true;
    }

    attack(enemy) {
        if (enemy && enemy.isResource) {
            Referee.voice.pError.play();
            this.stopAttack();
            return;
        }
        if ((enemy.isInvisible && !enemy.isEnemy) || !(this.matchAttackLimit(enemy))) {
            Referee.voice.pError.play();
            this.stopAttack();
            return;
        }
        if (this.target == enemy) {
            if (this.cannotReachTarget()) {
                if (this.status == 'moving') return;
            }
            else return;
        }
        else delete this.tracing;
        if (enemy instanceof Gobj && enemy.status != "dead") {
            this.stopAttack();
            this.dock();
            this.target = enemy;
            if (this.meleeAttack) {
                this.attackRange = this.radius() + enemy.radius();
            }
            if (this.attackMode) {
                this.Bullet = (enemy.isFlying) ? this.attackMode.flying.Bullet : this.attackMode.ground.Bullet;
                this.attackRange = (enemy.isFlying) ? this.get('attackMode.flying.attackRange') : this.get('attackMode.ground.attackRange');
                this.attackEffect = (enemy.isFlying) ? this.attackMode.flying.attackEffect : this.attackMode.ground.attackEffect;
                this.attackInterval = (enemy.isFlying) ? this.get('attackMode.flying.attackInterval') : this.get('attackMode.ground.attackInterval');
                this.sound.attack = (enemy.isFlying) ? this.sound.attackF : this.sound.attackG;
                this.damage = (enemy.isFlying) ? this.get('attackMode.flying.damage') : this.get('attackMode.ground.damage');
                this.attackType = (enemy.isFlying) ? this.attackMode.flying.attackType : this.attackMode.ground.attackType;
                this.attackMode.status = enemy.isFlying;
            }
            let range = this.get('attackRange');
            if (this.tracing) {
                range = Math.max(this.get('attackRange') - 50, this.radius() + enemy.radius());
                delete this.tracing;
            }
            if (!this.hold) this.moveToward(enemy, range);
            const attackFrame = () => {
                if (Game && Game.isPaused) return;
                if (enemy.status == "dead" || enemy.isInvisible || this.isMissingTarget()) {
                    this.stopAttack();
                    this.dock();
                }
                else {
                    if (!this.meleeAttack && enemy.meleeAttack && !this.isReloaded() && !this.hold) {
                        const now = (window.performance && performance.now) ? performance.now() : Date.now();
                        if (!this._lastKiteAt || now - this._lastKiteAt > 200) {
                            const kiteRadius = Math.max(this.get('attackRange') * 0.7, enemy.radius() + this.radius());
                            if (this.insideCircle({ centerX: enemy.posX(), centerY: enemy.posY(), radius: kiteRadius })) {
                                this._lastKiteAt = now;
                                this.escapeFrom(enemy);
                            }
                        }
                    }
                    if (this.isReloaded() && this.isInAttackRange(enemy) && this.status == "dock") {
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
                                    const N = Math.ceil(this.distanceFrom(enemy) / (this.AOE.radius));
                                    enemies = enemies.filter((chara) => {
                                        for (let n = 1; n <= N; n++) {
                                            const X = this.posX() + n * (enemy.posX() - this.posX()) / N;
                                            const Y = this.posY() + n * (enemy.posY() - this.posY()) / N;
                                            if (chara.insideCircle({ centerX: X >> 0, centerY: Y >> 0, radius: this.AOE.radius }) && !chara.isInvisible) {
                                                return true;
                                            }
                                        }
                                        return false;
                                    });
                                    break;
                                case "CIRCLE":
                                default:
                                    enemies = enemies.filter((chara) => {
                                        return chara.insideCircle(
                                            { centerX: enemy.posX(), centerY: enemy.posY(), radius: this.AOE.radius })
                                            && !chara.isInvisible;
                                    })
                                    break;
                            }
                        }
                        this.faceTo(enemy);
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
                                const delay = (this.damageDelay !== undefined) ? this.damageDelay : (this.frame.attack * 100);
                                Game.commandTimeout(() => {
                                    enemy.getDamageBy(this);
                                    enemy.reactionWhenAttackedBy(this);
                                }, delay);
                            }
                            if (this.suicide) this.die();
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
                        if (!this.Bullet && this.insideScreen()) {
                            if (!this.sound.attack && this.name && this.name !== 'AttackableUnit') {
                                this.sound.attack = _$.lazyAudio('bgm/' + this.name + '.attack.wav');
                            }
                            if (this.sound.attack) this.sound.attack.play();
                        }
                    }
                }
            };
            attackFrame();
            this.attackTimer = setInterval(attackFrame, 100);
        }
    }

    stopAttack() {
        clearInterval(this.attackTimer);
        this.target = {};
    }

    findNearbyTargets() {
        //Initial
        let units;
        let buildings;
        let results = [];
        //Only ours
        if (this.isEnemy) {
            units = Unit.allOurUnits();
            buildings = Building.ourBuildings;
        }
        //Only enemies
        else {
            units = Unit.allEnemyUnits();
            buildings = Building.enemyBuildings;
        }
        [units, buildings].forEach((charas) => {
            const myX = this.posX();
            const myY = this.posY();
            charas = charas.filter((chara) => {
                return !chara.isInvisible && !chara.isResource && this.canSee(chara) && this.matchAttackLimit(chara);
            }).sort((chara1, chara2) => {
                const X1 = chara1.posX(), Y1 = chara1.posY(), X2 = chara2.posX(), Y2 = chara2.posY();
                return (X1 - myX) * (X1 - myX) + (Y1 - myY) * (Y1 - myY) - (X2 - myX) * (X2 - myX) - (Y2 - myY) * (Y2 - myY);
            });
            results = results.concat(charas);
        });
        //Calculate order delay, reverse to priority
        const _getDelay = (chara) => {
            let delay = 0;
            if (chara.attack) {
                //Measure delay by attack times needed to kill enemy
                if (chara.matchAttackLimit(this))
                    delay += ((chara.life + (chara.SP ? chara.shield : 0)) / chara.calculateDamageBy(this));
                else delay += 32;
            }
            else delay += 64;
            return delay;
        };
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
            const d1 = _getDelay(chara1);
            const d2 = _getDelay(chara2);
            if (d1 != d2) return d1 - d2;
            const X1 = chara1.posX() - this.posX(), Y1 = chara1.posY() - this.posY();
            const X2 = chara2.posX() - this.posX(), Y2 = chara2.posY() - this.posY();
            return X1 * X1 + Y1 * Y1 - (X2 * X2 + Y2 * Y2);
        });
        //Take near>>unit>>attackable>>killtimes as priority, will attracted if be attacked
        return results;
    }

    highestPriorityTarget() {
        return this.findNearbyTargets()[0];
    }

    AI() {
        //Dead unit doesn't have following AI
        if (this.status == 'dead') return;
        //If no mission, return it to scout status
        if (this.isIdle()) this.targetLock = false;
        //AI:Attack insight enemy automatically when alive
        //If locking target
        if (this.targetLock) {
            // target ran out of attack range
            if (this.cannotReachTarget()) {
                this.followEnemy();
            }
        }
        //If not lock target
        else {
            //Find in-range enemy by attack priority
            const enemy = this.highestPriorityTarget();
            //If not attacking but find in-range enemy
            if (!this.isAttacking() && enemy) {
                this.attack(enemy);
            }
            //If target ran outside attack range
            if (this.cannotReachTarget()) {
                //but find insight other enemy
                if (enemy && this.target != enemy) {
                    this.attack(enemy);
                }
                //No other enemy in sight
                else {
                    this.followEnemy();
                }
            }
        }
    }

    reactionWhenAttackedBy(enemy, onlyDamage) {
        //Resign and give reward to enemy if has no life before dead
        if (this.life <= 0) {
            //If multiple target, only die once and give reward
            if (this.status != "dead") {
                //Killed by enemy
                this.die();
                //Give enemy reward
                enemy.kill++;
            }
            //Already dead, cannot take following actions
            return;
        }
        //AI when attacked by enemy
        if (!onlyDamage) {
            if (this.attack && this.matchAttackLimit(enemy) && !enemy.isInvisible) {
                if (this.isIdle()) {
                    //Will hatred toward enemy
                    this.attack(enemy);
                }
                else if (!this.targetLock && this.target.target !== this) {
                    //Will be attracted by higher hatred enemy
                    this.attack(enemy);
                }
            }
            else {
                if (this.isIdle()) this.escapeFrom(enemy);
            }
        }
    }

    isAttacking() {
        //Has target
        return (this.target instanceof Gobj);
    }

    followEnemy() {
        //Remind to attack again
        this.attack(this.target);
        //Filter out building target
        if (this.target instanceof Unit) this.tracing = true;
    }

    isTracing() {
        return this.isAttacking() && this.status == "moving";
    }

    isFiring() {
        //May out of range and cannot fire, don't follow when attack status
        return this.isAttacking() && this.status == "dock";
    }

    isIdle() {
        //Not moving or attacking
        return !this.isAttacking() && this.status == "dock";
    }

    cannotReachTarget() {
        //Found target outside attack range after once firing, need follow once
        return this.isFiring() && !(this.isInAttackRange(this.target));
    }

    isMissingTarget() {
        //Lock on target has global sight, lock off (attackGround) use its own sight
        return !this.targetLock && this.isAttacking() && !(this.canSee(this.target));
    }

    isReloaded() {
        //Add for newly reloaded yamato, two kinds of bullet conflict, ignore bullet array
        if ((this.bullet instanceof Gobj) && this.bullet.status != 'dead') return false;
        return this.coolDown;
    }

    die() {
        //Old behavior
        super.die();
        //Recursion, if inherited will stack overflow
        //(this.inherited.die).call(this);
        //Clear new timer for unit
        this.stopAttack();
        this.selected = false;
    }

    // Static methods acting as mixins/actions
    static turnAround() {
        //Inherited dock from Unit.js
        Unit.prototype.dock.call(this);
        //Add in new things
        if (this.dockTimer) clearInterval(this.dockTimer);
        this.dockTimer = setInterval(() => {
            if (Game && Game.isPaused) return;
            //Look around animation
            if (this.isIdle()) {
                this.turnTo((this.direction + 1) % 8);//For all ground soldier to use
            }
            else {
                clearInterval(this.dockTimer);
            }
        }, 2000);
    }

    static walkAround() {
        //Inherited dock from Unit.js
        Unit.prototype.dock.call(this);
        //Add in new things
        if (this.dockTimer) clearInterval(this.dockTimer);
        this.dockTimer = setInterval(() => {
            if (Game && Game.isPaused) return;
            const direction = (Math.random() * 8) >> 0;//Math.floor
            //Walk around, for all critters to use
            if (this.isIdle()) {
                const speed = this.get && this.get('speed');
                if (!speed) return;
                const vec = (speed instanceof Array) ? speed[direction] : speed;
                if (!vec || typeof vec.x !== 'number' || typeof vec.y !== 'number') return;
                this.moveTo(this.posX() + vec.x * 6, this.posY() + vec.y * 6);
            }
            else {
                clearInterval(this.dockTimer);
            }
        }, 2000);
    }

    static hover() {
        //Inherited dock from Unit.js
        Unit.prototype.dock.call(this);
        //Add in new things
        if (this.dockTimer) clearInterval(this.dockTimer);
        let N = 0;
        let hoverOffset = 1;
        this.dockTimer = setInterval(() => {
            if (Game && Game.isPaused) return;
            //Hover animation
            if (this.isIdle()) {
                this.y += hoverOffset;
                if (N % 4 == 0) {
                    //myself.turnTo((myself.direction+1)%8);//For marine to use
                    hoverOffset = -hoverOffset;//Hover up and down
                }
            }
            else {
                clearInterval(this.dockTimer);
            }
            N++;
        }, 200);
    }
}
AttackableUnit.prototype.name = "AttackableUnit";

// Global assignment for legacy compatibility
if (typeof window !== 'undefined') {
    window.AttackableUnit = AttackableUnit;
}

