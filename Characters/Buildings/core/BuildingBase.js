import Gobj from '../../Gobj.js';
import Unit from '../../Units/core/UnitBase.js';
import Game from '../../../GameRule/Games/core/GameBase.js';
import GameMap from '../../Map.js';
import Burst from '../../Bursts/core/BurstBase.js';
import _$ from '../../../Utils/gFrame/core.js';
import { GasSmoke } from '../../Bursts/zerg/ZergEffects1.js';

class Building extends Gobj {
    static allBuildings = [];
    static ourBuildings = [];
    static enemyBuildings = [];


    constructor(props) {
        super(props);
        if (!props) return;

        // Ensure name is available for ES6 classes
        if (this.name === "Building" && this.constructor.name !== "Building") {
            this.name = this.constructor.name;
        }

        this.id = Unit.currentID++;
        this.isEnemy = Boolean(props.isEnemy || props.target?.isEnemy);
        this.life = this.get('HP');

        if (this.SP) this.shield = this.get('SP');
        if (this.MP) this.magic = 50;

        this.selected = false;
        this.isFlying = false;
        this.commandQueue = [];
        this.cargo = [];
        this.injuryAnimations = [];
        this.cargoCapacity = props.cargoCapacity || this.constructor.prototype.cargoCapacity || 0;


        // Gas smoke capping logic: cap the underlying geyser's smoke
        if (['Refinery', 'Extractor', 'Assimilator'].includes(this.name)) {
            // Find Vespene Geyser underneath this building and destroy its gas smoke
            const geyser = Unit.allUnits.find(u => {
                if (u.status === 'dead' || !u.name || !/Geyser/i.test(u.name)) return false;
                return Math.hypot(u.x - this.x, u.y - this.y) < 10;
            });
            if (geyser && geyser.gasSmoke && geyser.gasSmoke.status !== 'dead') {
                geyser.gasSmoke.die();
            }
        }

        GameMap.markExplored(this.posX(), this.posY(), this.get('sight'));

        // Synchronous registration
        Building.allBuildings.push(this);
        if (this.isEnemy) Building.enemyBuildings.push(this);
        else Building.ourBuildings.push(this);
        this.dock();
    }

    animeFrame() {
        this.action++;
        const status = this.status || "dock";
        if (!this.imgPos || !this.imgPos[status]) return;

        const arrLimit = (Array.isArray(this.imgPos[status].left)) ? (this.imgPos[status].left.length) : 1;
        if (this.action >= (this.frame[status] || arrLimit) || this.action >= arrLimit) this.action = 0;

        // Dynamic construction step and HP update
        if (this.processing && this.processing.time > 0) {
            // Protoss power check
            if (this.requiresPower && typeof this.isPowered === 'function' && !this.isPowered()) {
                this.processing.startTime += 100; // Pause by shifting startTime
                return;
            }
            const now = new Date().getTime();
            const elapsed = now - this.processing.startTime;
            const progress = Math.min(1, elapsed / (this.processing.time * 100));

            // Visual steps for Terran Construction and Zerg Mutation
            if (this.name == 'Construction') {
                if (progress < 0.33) this.imgPos.dock = this.imgPos.step1;
                else if (progress < 0.66) this.imgPos.dock = this.imgPos.step2;
                else this.imgPos.dock = this.imgPos.step3;
            } else if (this.name == 'Mutation') {
                // Use the correct mutation size based on target building height
                const targetHP = this.get('HP');
                if (targetHP <= 400) this.imgPos.dock = ZergBuilding.MutationS.prototype.imgPos.dock;
                else if (targetHP <= 800) this.imgPos.dock = ZergBuilding.MutationM.prototype.imgPos.dock;
                else this.imgPos.dock = ZergBuilding.MutationL.prototype.imgPos.dock;
            } else if (this.name == 'Egg') {
                // Handle Egg animation step
                const arrLimit = this.imgPos.dock.left.length;
                this.action = Math.floor(progress * (arrLimit - 1));
            }

            // HP Growth during construction
            const targetHP = this.get('HP');
            const startHP = targetHP * 0.1; // Start at 10%
            this.life = startHP + (targetHP - startHP) * progress;
        }

        if (this.imgPos[status].left[this.action] == -1) this.action = 0;
    }

    dock() {
        this.stop();
        this.status = "dock";
        this._timer = setInterval(() => {
            this.animeFrame();
        }, 100);
    }

    moving() {
        if (this.isFlying) {
            this.stop();
            this.status = "moving";
            this._timer = setInterval(() => {
                if (typeof Game !== 'undefined' && Game?.isPaused) return;
                this.animeFrame();
                this.updateLocation();
                this.detectOutOfBound();
            }, 100);
        }
    }

    moveTo(clickX, clickY, range, callback) {
        if (!this.isFlying) return;
        this.destination = { x: clickX, y: clickY };

        const routingFrame = () => {
            if (typeof Game !== 'undefined' && Game?.isPaused) return;

            this.animeFrame();
            this.updateLocation();
            this.detectOutOfBound();

            const dx = this.destination.x - this.posX();
            const dy = this.destination.y - this.posY();
            const dist = Math.hypot(dx, dy);

            if (dist < (range || 5)) {
                this.dock();
                if (callback) callback();
            } else {
                this.speed = {
                    x: (dx / dist) * 2,
                    y: (dy / dist) * 2
                };
            }
        };

        this.stop();
        this.status = "moving";
        this.action = 0;
        this._timer = setInterval(routingFrame, 100);
    }

    moveToward(target, range, callback) {
        if (!this.isFlying) return;

        const routingFrame = () => {
            if (typeof Game !== 'undefined' && Game?.isPaused) return;

            this.animeFrame();
            this.updateLocation();
            this.detectOutOfBound();

            const dx = target.posX() - this.posX();
            const dy = target.posY() - this.posY();
            const dist = Math.hypot(dx, dy);

            if (dist < (range || 5)) {
                this.dock();
                if (callback) callback();
            } else {
                this.speed = {
                    x: (dx / dist) * 2,
                    y: (dy / dist) * 2
                };
            }
        };

        this.stop();
        this.status = "moving";
        this.action = 0;
        this._timer = setInterval(routingFrame, 100);
    }

    stop() {
        super.stop();
        if (this.isIdle() && this.commandQueue?.length > 0) {
            this.executeNextCommand();
        }
    }

    executeNextCommand() {
        if (this.status == "dead" || !this.commandQueue?.length) return;
        const cmd = this.commandQueue.shift();
        switch (cmd.type) {
            case 'move':
                this.moveTo(cmd.x, cmd.y);
                break;
            case 'attack':
                if (this.attack) this.attack(cmd.target);
                break;
            case 'patrol':
                this.destination = { x: cmd.x, y: cmd.y };
                this.destination.next = { x: this.posX(), y: this.posY(), next: this.destination };
                this.moveTo(cmd.x, cmd.y);
                break;
        }
    }

    run() {
        this.moving();
        if (this.isIdle() && this.commandQueue?.length > 0) {
            this.executeNextCommand();
        }
    }

    die() {
        if (this.injuryAnimations) {
            this.injuryAnimations.forEach(anime => anime.die());
            this.injuryAnimations = [];
        }
        super.die();
        this.life = 0;

        // Remove from static lists
        const remove = (arr, item) => {
            const idx = arr.indexOf(item);
            if (idx !== -1) arr.splice(idx, 1);
        };
        remove(Building.allBuildings, this);
        remove(Building.enemyBuildings, this);
        remove(Building.ourBuildings, this);

        if (['Refinery', 'Extractor', 'Assimilator'].includes(this.name)) {
            // Re-enable Vespene Geyser's smoke if it was built over
            const geyser = Unit.allUnits.find(u => {
                if (u.status === 'dead' || !u.name || !/Geyser/i.test(u.name)) return false;
                return Math.hypot(u.x - this.x, u.y - this.y) < 10;
            });
            if (geyser) {
                if (!geyser.gasSmoke || geyser.gasSmoke.status === 'dead') {
                    geyser.gasSmoke = new GasSmoke({ target: geyser, above: true, scale: 1.6, duration: -1 });
                }
            }
        }
        if (this.gasSmoke && this.gasSmoke.status != "dead") {
            this.gasSmoke.die();
        }
        if (this.sound?.death && this.insideScreen()) {
            this.sound.death.play();
        }

        // Release cargo
        if (this.cargo && this.cargo.length > 0) {
            this.cargo.forEach(passenger => {
                passenger.status = "dock";
                passenger.x = this.x;
                passenger.y = this.y;
                Unit.allUnits.push(passenger);
                if (passenger.isEnemy) Unit.ourGroundUnits.push(passenger); // Wait, if the building is ours, units are ours?
                else Unit.ourGroundUnits.push(passenger);
                // Correct logic for isEnemy
                if (passenger.isEnemy) {
                    const idx = Unit.allUnits.indexOf(passenger); // Already pushed above? 
                    // Let's just use the same logic as UnitBase
                }
            });
            // Let's use the identical logic from UnitBase.js to be safe
        }

    }

    evolveTo(buildType) {
        const building = new buildType({ x: this.x, y: this.y, isEnemy: this.isEnemy });

        // Transfer selection
        if (this.selected) {
            if (typeof Game !== 'undefined' && Game.changeSelectedTo) {
                setTimeout(() => Game.changeSelectedTo(building), 0);
            }
        }

        // Silent removal of the placeholder
        this.status = "dead";
        this.life = 0;
        this.stop();

        // Remove from static lists
        const remove = (arr, item) => {
            const idx = arr.indexOf(item);
            if (idx !== -1) arr.splice(idx, 1);
        };
        remove(Building.allBuildings, this);
        remove(Building.enemyBuildings, this);
        remove(Building.ourBuildings, this);

        return building;
    }

    reactionWhenAttackedBy(enemy, amount) {
        // Will die immediately if life <= 0
        if (this.life <= 0) {
            this.life = 0;
            this.die();
            // Killed by enemy
            if (enemy instanceof Gobj) {
                // Add kill count
                if (enemy.kill != null) enemy.kill++;
            }
        }
    }

    calculateDamageBy(enemyObj) {
        let damage = 0;
        if (enemyObj instanceof Gobj) {
            let enemyAttackType = enemyObj.attackType || 0; // Default to NORMAL_ATTACK
            if (enemyObj.attackMode) {
                enemyAttackType = (this.isFlying) ? enemyObj.attackMode.flying.attackType : enemyObj.attackMode.ground.attackType;
            }
            if (enemyAttackType === undefined) enemyAttackType = 0;

            // Buildings are typically BIG (2)
            const myUnitType = (this.unitType !== undefined) ? this.unitType : Unit.BIG;

            damage = enemyObj.get('damage') * Unit.attackMatrix[enemyAttackType][myUnitType];
        }
        else damage = enemyObj;
        return damage;
    }

    getDamageBy(enemy, percent = 1) {
        let damage = 0;
        let rawDamage = this.calculateDamageBy(enemy);
        if (isNaN(rawDamage)) rawDamage = 0;

        if (this.shield > 0) {
            damage = ((rawDamage - (this.get('plasma') || 0)) * percent) >> 0;
            if (damage < 1) damage = 1;
            this.shield -= damage;
            if (this.shield < 0) {
                this.life += (this.shield);
                this.shield = 0;
            }
        }
        else {
            damage = ((rawDamage - (this.get('armor') || 0)) * percent) >> 0;
            if (damage < 1) damage = 1;
            this.life -= damage;
        }

        if (typeof Game !== 'undefined' && Game.raiseUnderAttack && enemy && enemy.isEnemy !== this.isEnemy) {
            Game.raiseUnderAttack(this);
        }

        const now = (window.performance && performance.now) ? performance.now() : Date.now();
        this._hitFlashUntil = now + 120;
        this._lifeBarUntil = now + 4000;

        if (this.life <= 0) {
            if (this.status != "dead") {
                this.die();
                if (enemy && typeof enemy.kill === 'number') enemy.kill++;
            }
        }
    }

    lifeStatus() {
        const lifeRatio = this.life / this.get('HP');
        return ((lifeRatio > 0.7) ? "green" : (lifeRatio > 0.3) ? "yellow" : "red");
    }

    static verifyBuildLocation(name, x, y, isEnemy) {
        // Find race of the building
        let race = "";
        if (window.ZergBuilding && window.ZergBuilding[name]) race = "Zerg";
        else if (window.ProtossBuilding && window.ProtossBuilding[name]) race = "Protoss";
        else if (window.TerranBuilding && window.TerranBuilding[name]) race = "Terran";

        // Fallback for names if not yet registered
        if (!race) {
            if (["Hatchery", "Extractor", "SpawningPool", "CreepColony"].includes(name)) race = "Zerg";
            if (["Nexus", "Pylon", "Assimilator", "Gateway"].includes(name)) race = "Protoss";
        }

        if (race === "Zerg") {
            // Zerg: Need Creep unless it's a Hatchery or Extractor
            if (name !== "Hatchery" && name !== "Extractor") {
                if (window.GameMap && !window.GameMap.hasCreep(x, y)) {
                    if (window.Game.showMessage) window.Game.showMessage("Must build on Creep");
                    return false;
                }
            }
        }
        if (race === "Protoss") {
            // Protoss: Need Pylon Aura unless it's Nexus, Pylon, or Assimilator
            if (name !== "Nexus" && name !== "Pylon" && name !== "Assimilator") {
                const hasPylon = Building.ourBuildings.some(b =>
                    b.name === "Pylon" && b.status !== "dead" &&
                    Math.hypot(b.posX() - x, b.posY() - y) < 400
                );
                if (!hasPylon) {
                    if (window.Game.showMessage) window.Game.showMessage("Must build near a Pylon");
                    return false;
                }
            }
        }
        return true;
    }
}
Building.prototype.name = "Building";
Building.prototype.isBuilding = true;
Building.prototype.armor = 0;
Building.prototype.sight = 385;

// Global assignment for legacy compatibility
if (typeof window !== 'undefined') {
    window.Building = Building;
}


export default Building;
