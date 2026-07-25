import Gobj from '../../Gobj.js';
import _$ from '../../../Utils/gFrame/core.js';
import '../../../Utils/gFrame/utils.js';
import Game from '../../../GameRule/Games/core/GameBase.js';
// Circular dependency note: Building imports Unit, so we might need to handle this carefully.
// We rely on window.Building or dynamic import if needed, but for now we'll try to import it.
// To avoid circular dependency issues during module evaluation, we might access Building from window or wait.
// However, let's try to import it as it is used in methods, not at top level execution.
import Building from '../../Buildings/core/BuildingBase.js';

// Define unit which has HP/direction and be selectable, unattackable unit
export default class Unit extends Gobj {
    static currentID = 0;
    static moveRange = 20;
    static selectRange = 20;
    static meleeRange = 25; // 50
    static speedMatrix = [
        { x: 0, y: -1 },
        { x: 0.7, y: -0.7 },
        { x: 1, y: 0 },
        { x: 0.7, y: 0.7 },
        { x: 0, y: 1 },
        { x: -0.7, y: 0.7 },
        { x: -1, y: 0 },
        { x: -0.7, y: -0.7 }
    ];
    static sight = 300;
    static attackMatrix = [
        [1, 1, 1],
        [0.5, 0.75, 1],
        [1, 0.5, 0.25]
    ];
    static SMALL = 0;
    static MIDDLE = 1;
    static BIG = 2;
    static allUnits = [];
    static ourFlyingUnits = [];
    static ourGroundUnits = [];
    static enemyFlyingUnits = [];
    static enemyGroundUnits = [];

    // Static methods from UnitStatics.js
    static getSpeedMatrixBy(speed) {
        const speedMatrix = _$.clone(Unit.speedMatrix);
        _$.matrixOperation(speedMatrix, (N) => {
            return N * speed;
        });
        return speedMatrix;
    }

    static allOurUnits() {
        return Unit.ourFlyingUnits.concat(Unit.ourGroundUnits);
    }

    static allEnemyUnits() {
        return Unit.enemyFlyingUnits.concat(Unit.enemyGroundUnits);
    }

    static allFlyingUnits() {
        return Unit.ourFlyingUnits.concat(Unit.enemyFlyingUnits);
    }

    static allGroundUnits() {
        return Unit.ourGroundUnits.concat(Unit.enemyGroundUnits);
    }

    static count() {
        const count = { ours: 0, enemy: 0 };
        Unit.allUnits.forEach((chara) => {
            if (chara.isEnemy) count.enemy++;
            else count.ours++;
        });
        return count;
    }

    static sortAllUnits() {
        Unit.allUnits.sort((unit1, unit2) => (unit1.isFlying ? 1 : 0) - (unit2.isFlying ? 1 : 0));
    }

    static sortUnits(units) {
        units.sort((unit1, unit2) => {
            return (unit1.isFlying ? 1 : 0) - (unit2.isFlying ? 1 : 0);
        });
    }

    // Static methods from UnitDockActions.js (Mixins)
    static turnAround() {
        //Inherited dock from Unit.js
        Unit.prototype.dock.call(this);
        //Add in new things
        if (this.dockTimer) clearInterval(this.dockTimer);
        this.dockTimer = setInterval(() => {
            if (Game && Game.isPaused) return;
            //Look around animation
            if (this.status == "dock") {
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
            const direction = (Game.random() * 8) >> 0;//Math.floor
            //Walk around, for all critters to use
            if (this.status == "dock") {
                this.moveTo(this.posX() + this.get('speed')[direction].x * 6, this.posY() + this.get('speed')[direction].y * 6);
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
            if (this.status == "dock") {
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

    static walkAroundLarva() {
        //Inherited dock from Unit.js
        Unit.prototype.dock.call(this);
        //Add in new things
        if (this.dockTimer) clearInterval(this.dockTimer);
        this.dockTimer = setInterval(() => {
            if (Game && Game.isPaused) return;
            const direction = (this.direction + 1) % 8;//Math.floor
            //Walk around, for all critters to use
            if (this.status == "dock") {
                Unit.prototype.moveTo.call(this, this.posX() + this.get('speed')[direction].x * 6, this.posY() + this.get('speed')[direction].y * 6);
            }
            else {
                clearInterval(this.dockTimer);
            }
        }, 2000);
    }


    constructor(props) {
        super(props);
        if (!props) return;

        // Ensure name is available for ES6 classes
        if (this.name === "Unit" && this.constructor.name !== "Unit") {
            this.name = this.constructor.name;
        }

        this.id = Unit.currentID++;
        if (props.direction !== undefined) {
            this.direction = props.direction;
        } else {
            this.direction = (Game.random() * 8) >> 0;
        }
        this.team = props.team !== undefined ? props.team : (props.isEnemy ? 1 : 0);
        this.isEnemy = (Game.team !== undefined) ? (this.team !== Game.team) : Boolean(props.isEnemy || props.target?.isEnemy);
        this.life = this.get('HP');
        if (this.SP) this.shield = this.get('SP');
        if (this.MP) this.magic = 50;
        this.selected = false;
        this.routingTimer = 0;
        if (typeof GameMap !== 'undefined') {
            GameMap.markExplored(this.posX(), this.posY(), this.get('sight'));
        }
        this.sound = {};
        this.commandQueue = [];
        this.cargo = [];
        this.cargoCapacity = props.cargoCapacity || this.constructor.prototype.cargoCapacity || 0;

        // Synchronous initialization and registration
        if (this.name !== 'Unit') {
            this.sound.selected = _$.lazyAudio('bgm/' + this.name + '.selected.wav');
            this.sound.moving = _$.lazyAudio('bgm/' + this.name + '.moving.wav');
            this.sound.death = _$.lazyAudio('bgm/' + this.name + '.death.wav');
        }

        Unit.allUnits.push(this);
        if (this.isFlying) {
            if (this.isEnemy) Unit.enemyFlyingUnits.push(this);
            else Unit.ourFlyingUnits.push(this);
        }
        else {
            if (this.isEnemy) Unit.enemyGroundUnits.push(this);
            else Unit.ourGroundUnits.push(this);
        }
        Unit.sortAllUnits();
        this.dock();
    }

    animeFrame() {
        if (typeof Game !== 'undefined' && Game && Game.isPaused) return;
        const statusPos = this.imgPos && this.imgPos[this.status];
        if (!statusPos || !statusPos.left) return;
        this.action++;
        // Support hidden frames and correct limits like original
        const arrLimit = (statusPos.left[0] instanceof Array) ? (statusPos.left[0].length) : 1;
        if (this.action >= (this.frame[this.status] || arrLimit)) {
            this.action = 0;
        }
        if (statusPos.left[0][this.action] == -1) this.action = 0;
    }

    cannotMove() {
        return false;
    }

    detectOutOfBound() {
        if (typeof GameMap === 'undefined') return;
        const map = GameMap.getCurrentMap();
        if (!map || !map.width || !map.height) return;
        const boundX = map.width - this.width;
        const boundY = map.height - this.height;
        if (this.x > boundX) {
            this.x = boundX;
        }
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.y > boundY) {
            this.y = boundY;
        }
        if (this.y < 0) {
            this.y = 0;
        }
    }

    updateLocation() {
        if (this.get('speed') instanceof Array) {
            this.x += this.get('speed')[this.direction].x;
            this.y += this.get('speed')[this.direction].y;
        }
        else {
            this.x += this.get('speed').x;
            this.y += this.get('speed').y;
        }
    }

    turnTo(direction) {
        this.direction = direction;
    }

    dock() {
        this.stop();
        this.status = "dock";
        this.action = 0;
        clearInterval(this.routingTimer);
        if (typeof Game !== 'undefined' && Game.pathfinding) Game.pathfinding.cancel(this);
        this.routingTimer = 0;
        this._timer = setInterval(() => {
            this.animeFrame();
        }, 100);
        delete this._routingTarget;
        if (this.commandQueue && this.commandQueue.length > 0) {
            setTimeout(() => {
                if (this.status === 'dock') this.executeNextCommand();
            }, 0);
        }
        else {
            if (this._patrolRoute && !this.destination) {
                this.destination = this._patrolRoute;
            }
        }
    }

    executeNextCommand() {
        if (!this.commandQueue || this.commandQueue.length === 0) return;
        const cmd = this.commandQueue.shift();
        if (cmd.type != 'patrol') delete this._patrolRoute;
        switch (cmd.type) {
            case 'move':
                this.moveTo(cmd.x, cmd.y);
                break;
            case 'attack':
                if (this.attack) this.attack(cmd.target);
                break;
            case 'gather':
                if (this.gather) this.gather(cmd.target);
                break;
            case 'patrol':
                if (this.patrol) this.patrol({ x: cmd.x, y: cmd.y });
                break;
        }
    }

    stand() {
        this.dock();
    }

    stopMoving() {
        this.dock();
    }

    moving() {
        //Clear old timer
        this.stop();
        //Launch new moving timer
        this.status = "moving";
        const myself = this;
        const movingFrame = () => {
            if (typeof Game !== 'undefined' && Game?.isPaused) return;
            myself.animeFrame();
            //Relocate character
            myself.updateLocation();
            //Detect OutOfBound
            myself.detectOutOfBound();
        };
        movingFrame();//Add one missing frame
        this._timer = setInterval(movingFrame, 100);
    }

    run() {
        this.moving();
    }

    // Methods from UnitNavigation.js
    navigateTo(clickX, clickY, range) {
        if (!range) range = Unit.moveRange;//Smallest limit by default
        //Center position
        const charaX = this.posX();
        const charaY = this.posY();
        //Already at check point
        if (this.insideCircle({ centerX: clickX, centerY: clickY, radius: range })) {
            this.dock();
            //Stop routing
            clearInterval(this.routingTimer);
            this.routingTimer = 0;
            if (typeof Game !== 'undefined' && Game.pathfinding) Game.pathfinding.cancel(this);
            //Reach destination flag
            return true;
        }
        //Need move
        else {
            let direction = 0;
            //Already in same X
            if (this.insideSquare({ centerX: clickX, centerY: charaY, radius: range * 0.7 >> 0 })) {
                direction = (clickY > charaY) ? 4 : 0;
            }
            else {
                //Already in same Y
                if (this.insideSquare({ centerX: charaX, centerY: clickY, radius: range * 0.7 >> 0 })) {
                    direction = (clickX > charaX) ? 2 : 6;
                }
                //Need move by oblique path
                else {
                    direction = (clickX > charaX) ? (clickY > charaY ? 3 : 1) : (clickY > charaY ? 5 : 7);
                }
            }
            this.turnTo(direction);
            if (this.collision) {
                const directionLeft = (direction - 1 + 8) % 8;
                const speedLeft = (this.get('speed') instanceof Array) ? this.get('speed')[directionLeft] : this.get('speed');
                const nextStepLeft = { x: this.posX() + speedLeft.x, y: this.posY() + speedLeft.y };
                const directionRight = (direction + 1) % 8;
                const speedRight = (this.get('speed') instanceof Array) ? this.get('speed')[directionRight] : this.get('speed');
                const nextStepRight = { x: this.posX() + speedRight.x, y: this.posY() + speedRight.y };
                direction = (this.collision.distanceFrom(nextStepLeft) > this.collision.distanceFrom(nextStepRight))
                    ? directionLeft : directionRight;
                this.turnTo(direction);
                this.collision = undefined;
            }
        }
    }

    faceTo(target, preventAction) {
        //Below angle represents direction toward target
        let angle;
        //Unit or Building
        if (target instanceof Gobj) {
            angle = Math.atan((this.posY() - target.posY()) / (target.posX() - this.posX()));
        }
        else {
            //Location={x:1,y:2}
            angle = Math.atan((this.posY() - target.y) / (target.x - this.posX()));
        }
        if (target.posX() < this.posX()) angle += Math.PI;
        //Wrap out nearest direction
        const direction = (angle < -Math.PI * 3 / 8) ? 4 : (angle < -Math.PI / 8) ? 3 : (angle < Math.PI / 8) ? 2 : (angle < Math.PI * 3 / 8) ? 1 :
            (angle < Math.PI * 5 / 8) ? 0 : (angle < Math.PI * 7 / 8) ? 7 : (angle < Math.PI * 9 / 8) ? 6 : (angle < Math.PI * 11 / 8) ? 5 : 4;
        if (!preventAction) this.turnTo(direction);
        return direction;
    }

    escapeFrom(enemy) {
        //Add to fix holding issue
        if (this.hold || this.cannotMove()) return;
        const escapeDirection = this.faceTo(enemy, true);//Fix escape from attackable building issue
        const speeds = this.get('speed');
        // Safety check for speed array (buildings or specific units might not have it)
        if (!(speeds instanceof Array)) return;
        const escapeSpeed = speeds[escapeDirection];
        if (!escapeSpeed) return;
        const escapeSteps = 100 / (Math.abs(escapeSpeed.x) + Math.abs(escapeSpeed.y));
        //Escape by multiple steps
        this.moveTo(this.posX() + escapeSpeed.x * escapeSteps, this.posY() + escapeSpeed.y * escapeSteps);
    }

    moveTo(clickX, clickY, range, callback) {
        if (!range) range = Unit.moveRange;//Smallest limit by default
        const hasScheduledRouting = (typeof Game !== 'undefined' && Game.pathfinding && Game.pathfinding.has && Game.pathfinding.has(this));
        if (this._routingTarget && (this.routingTimer || hasScheduledRouting) &&
            Math.abs(this._routingTarget.x - clickX) < 2 && Math.abs(this._routingTarget.y - clickY) < 2 &&
            Math.abs(this._routingTarget.range - range) < 1) {
            return;
        }
        //If already routing
        if (this.routingTimer) {
            clearInterval(this.routingTimer);//then break routing
        }
        this._routingTarget = { x: clickX, y: clickY, range: range };
        if (typeof Game !== 'undefined' && Game.pathfinding) {
            if (this.navigateTo(clickX, clickY, range)) {
                if (typeof (callback) == 'function') callback();
                callback = null;
            }
            Game.pathfinding.schedulePoint(this, clickX, clickY, range, callback);
        }
        else {
            const routingFrame = () => {
                if (this.navigateTo(clickX, clickY, range)) {
                    if (typeof (callback) == 'function') callback();
                    return true;
                }
            };
            if (routingFrame()) callback = null;
            const interval = (this.insideScreen && this.insideScreen()) ? 100 : 200;
            this.routingTimer = setInterval(routingFrame, interval);
        }
        //Start moving
        this.run();
    }

    moveToward(target, range, callback) {
        if (!range) range = Unit.moveRange;//Smallest limit by default
        //If already routing
        if (this.routingTimer) {
            clearInterval(this.routingTimer);//then break routing
        }
        if (typeof Game !== 'undefined' && Game.pathfinding) {
            if (target && target.status != 'dead') {
                if (this.navigateTo(target.posX(), target.posY(), range)) {
                    if (typeof (callback) == 'function') callback();
                    callback = null;
                }
                Game.pathfinding.scheduleFollow(this, target, range, callback);
            }
            else {
                this.dock();
            }
        }
        else {
            const routingFrame = () => {
                if (target.status != 'dead') {
                    if (this.navigateTo(target.posX(), target.posY(), range)) {
                        if (typeof (callback) == 'function') callback();
                        return true;
                    }
                }
                else {
                    clearInterval(this.routingTimer);
                    this.dock();
                }
            };
            if (routingFrame()) callback = null;
            const interval = (this.insideScreen && this.insideScreen()) ? 100 : 200;
            this.routingTimer = setInterval(routingFrame, interval);
        }
        //Start moving
        this.run();
    }

    // Methods from UnitCombat.js
    die() {
        //Old behavior
        super.die();
        this.life = 0;

        // Remove from static lists
        const remove = (arr, item) => {
            const idx = arr.indexOf(item);
            if (idx !== -1) arr.splice(idx, 1);
        };
        remove(Unit.allUnits, this);
        remove(Unit.enemyFlyingUnits, this);
        remove(Unit.ourFlyingUnits, this);
        remove(Unit.enemyGroundUnits, this);
        remove(Unit.ourGroundUnits, this);

        // Release cargo if any
        if (this.cargo && this.cargo.length > 0) {
            this.cargo.forEach(passenger => {
                passenger.status = "dock";
                passenger.x = this.x;
                passenger.y = this.y;
                Unit.allUnits.push(passenger);
                if (passenger.isFlying) {
                    if (passenger.isEnemy) Unit.enemyFlyingUnits.push(passenger);
                    else Unit.ourFlyingUnits.push(passenger);
                } else {
                    if (passenger.isEnemy) Unit.enemyGroundUnits.push(passenger);
                    else Unit.ourGroundUnits.push(passenger);
                }
            });
            this.cargo = [];
        }

        //Stop routing
        clearInterval(this.routingTimer);
        if (typeof Game !== 'undefined' && Game.pathfinding) Game.pathfinding.cancel(this);
        //If has sound effect
        if (this.sound.death && this.insideScreen()) {
            this.sound.death.play();
        }
    }

    reactionWhenAttackedBy(enemy) {
        if (this.status == "dead") return;
        // Default behavior: escape if not attackable or holding
        if (!this.attack && !this.hold) {
            this.escapeFrom(enemy);
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

            // Default unitType to SMALL if not defined
            const myType = (this.unitType !== undefined) ? this.unitType : Unit.SMALL;
            const rawDamage = enemyObj.get('damage') || 0;

            // ORIGINAL LOGIC: dmg * matrix[attackType][unitSize]
            damage = rawDamage * Unit.attackMatrix[enemyAttackType][myType];
        }
        else damage = enemyObj;
        return damage;
    }

    getDamageBy(enemy, percent) {
        if (percent == undefined) percent = 1;//100% by default
        let damage = 0;
        let rawDamage = this.calculateDamageBy(enemy);
        if (isNaN(rawDamage)) rawDamage = 0;

        //If has SP and shield remain
        if (this.shield > 0) {
            damage = ((rawDamage - (this.get('plasma') || 0)) * percent) >> 0;
            if (damage < 1) damage = 0.5;
            this.shield -= damage;
            if (this.shield < 0) {
                //Inherit damage
                this.life += (this.shield);
                this.shield = 0;
            }
        }
        else {
            damage = ((rawDamage - (this.get('armor') || 0)) * percent) >> 0;
            if (damage < 1) damage = 0.5;
            this.life -= damage;
        }

        // Raise under attack event
        if (typeof Game !== 'undefined' && Game.raiseUnderAttack && enemy && enemy.isEnemy !== this.isEnemy) {
            Game.raiseUnderAttack(this);
        }

        // Hit flash effect
        const now = (window.performance && performance.now) ? performance.now() : Date.now();
        // Show hit flash
        this._hitFlashUntil = now + 100;
        this._lifeBarUntil = now + 4000;

        // Play alert sound if we are attacked (cooldown 10s)
        if (!this.isEnemy && (!Game._lastAlertAt || now - Game._lastAlertAt > 10000)) {
            Game._lastAlertAt = now;
            const alertSound = new Audio(`bgm/${Game.race.selected}Alert.wav`);
            alertSound.volume = 0.5;
            alertSound.play().catch(() => { });
        }

        // Blood/Spark effect
        const HydraSpark = (window.Animation && window.Animation.HydraSpark);
        if (this.status != 'dead' && HydraSpark) {
            new HydraSpark({ target: this, autoSize: 'MIN' });
        }

        if (this.life <= 0) {
            if (this.status != "dead") {
                this.die();
                if (enemy && typeof enemy.kill === 'number') enemy.kill++;
            }
            return;
        }
        //If is selected, show status in info box
        if (this.selected) {
            if (typeof Game !== 'undefined' && Game.refreshInfoBox) Game.refreshInfoBox();
        }
    }

    attackGround(position, loop) {
        //Convert to array
        const positions = new Array().concat(position);
        if (this.attack) this.stopAttack();
        //Move to first position
        this.moveTo(positions[0].x, positions[0].y);
        this.targetLock = false;
        let checkpoint = this.destination = positions[0];
        positions.slice(1).forEach((pos) => {
            checkpoint.next = pos;
            checkpoint = checkpoint.next;
        });
        if (loop) checkpoint.next = this.destination;
    }

    patrol(position, addHere) {
        //Convert to array
        const positions = new Array().concat(position);
        if (addHere) positions.push({ x: this.posX(), y: this.posY() });
        this.attackGround(positions, true);
        this._patrolRoute = this.destination;
    }

    isMachine() {
        return ["SCV", "Vulture", "Tank", "Goliath", "Wraith", "Dropship", "Vessel", "BattleCruiser", "Valkyrie",
            "Probe", "Dragoon", "Shuttle", "Reaver", "Observer", "Scout", "Carrier", "Arbiter", "Corsair", "HeroCruiser"]
            .indexOf(this.name) != -1;
    }

    lifeStatus() {
        const lifeRatio = this.life / this.get('HP');
        return ((lifeRatio > 0.7) ? "green" : (lifeRatio > 0.3) ? "yellow" : "red");
    }

    _findGatherCenter() {
        if (typeof Building === 'undefined') return null;
        let names;
        if (this.name == 'SCV') names = ['CommandCenter'];
        else if (this.name == 'Drone') names = ['Hatchery', 'Lair', 'Hive', 'OvermindI', 'OvermindII'];
        else if (this.name == 'Probe') names = ['Nexus'];
        else names = ['CommandCenter', 'Hatchery', 'Lair', 'Hive', 'OvermindI', 'OvermindII', 'Nexus'];
        let centers = Building.ourBuildings.filter((b) => {
            return b && b.status != 'dead' && names.indexOf(b.name) != -1;
        });
        centers.sort((a, b) => {
            const dxA = a.posX() - this.posX(), dyA = a.posY() - this.posY();
            const dxB = b.posX() - this.posX(), dyB = b.posY() - this.posY();
            return (dxA * dxA + dyA * dyA) - (dxB * dxB + dyB * dyB);
        });
        if (centers[0]) return centers[0];
        centers = Building.ourBuildings.filter((b) => {
            return b && b.status != 'dead' && b.manPlus >= 10;
        });
        centers.sort((a, b) => {
            const dxA = a.posX() - this.posX(), dyA = a.posY() - this.posY();
            const dxB = b.posX() - this.posX(), dyB = b.posY() - this.posY();
            return (dxA * dxA + dyA * dyA) - (dxB * dxB + dyB * dyB);
        });
        return centers[0];
    }

    gather(target) {
        if (!target) return;
        if (this.status == 'dead') return;
        if (this.isEnemy) return;
        if (!(this.name == 'SCV' || this.name == 'Drone' || this.name == 'Probe')) return;
        if (this.cannotMove && this.cannotMove()) return;
        if (this.gatherTimer) clearInterval(this.gatherTimer);
        this.gatherTimer = 0;
        if (this._gather) delete this._gather;
        delete this._patrolRoute;
        if (this.stopAttack) this.stopAttack();
        if (this.destination) {
            if (this.destination.next) this.destination.next = null;
            delete this.destination;
        }
        let type = null;
        // Use global Neutral if available
        if (typeof Neutral !== 'undefined' && target instanceof Neutral.Mineral) type = 'mine';
        if ((target instanceof Building) && (['Refinery', 'Extractor', 'Assimilator'].indexOf(target.name) != -1)) type = 'gas';
        if (!type) return;
        if (type == 'mine' && typeof Game !== 'undefined' && Game.getInRangeOnes) {
            const minerals = Game.getInRangeOnes(this.posX(), this.posY(), 180, false, true, false, (chara) => {
                return (typeof Neutral !== 'undefined' && chara instanceof Neutral.Mineral);
            });
            if (minerals && minerals.length) {
                minerals.sort((a, b) => {
                    const ga = (a._gatherers && a._gatherers.length) ? a._gatherers.length : 0;
                    const gb = (b._gatherers && b._gatherers.length) ? b._gatherers.length : 0;
                    if (ga !== gb) return ga - gb;
                    const dax = a.posX() - this.posX(), day = a.posY() - this.posY();
                    const dbx = b.posX() - this.posX(), dby = b.posY() - this.posY();
                    return dax * dax + day * day - (dbx * dbx + dby * dby);
                });
                target = minerals[0];
            }
        }
        if (this._gather && this._gather.target && this._gather.target._gatherers) {
            const prev = this._gather.target._gatherers;
            const pidx = prev.indexOf(this);
            if (pidx !== -1) prev.splice(pidx, 1);
            if (prev.length === 0) delete this._gather.target._gatherers;
        }
        if (target._gatherers && target._gatherers.length) {
            target._gatherers = target._gatherers.filter((w) => {
                return w && w.status != 'dead' && w._gather && w._gather.target === target;
            });
            if (!target._gatherers.length) delete target._gatherers;
        }
        const gatherers = target._gatherers || (target._gatherers = []);
        if (gatherers.indexOf(this) === -1) gatherers.push(this);
        const detachGatherer = () => {
            const list = target._gatherers;
            if (!list) return;
            const idx = list.indexOf(this);
            if (idx !== -1) list.splice(idx, 1);
            if (list.length === 0) delete target._gatherers;
        };
        const state = {
            target: target,
            type: type,
            carrying: 0,
            harvesting: false
        };
        this._gather = state;
        const takeAmount = (type == 'mine') ? 8 : 4;
        let harvestMs = (type == 'mine') ? 2000 : 2400;
        const saturation = (target && target._gatherers && target._gatherers.length) ? target._gatherers.length : 1;
        const penalty = Math.max(1, saturation / 3);
        harvestMs = Math.max(400, (harvestMs * penalty) >> 0);
        const baseTargetRadius = (type == 'mine') ? 45 : 80;
        const workerRadius = (typeof this.radius == 'function') ? this.radius() : (Math.min(this.width, this.height) * 0.5);
        const targetObjRadius = (target && typeof target.radius == 'function') ? target.radius() : (Math.min(target.width || 0, target.height || 0) * 0.5);
        const targetRadius = Math.max(baseTargetRadius, workerRadius + targetObjRadius + 6);
        const tick = () => {
            if (Game && Game.isPaused) return;
            if (this.status == 'dead') {
                clearInterval(this.gatherTimer);
                this.gatherTimer = 0;
                if (this._gather) delete this._gather;
                detachGatherer();
                return;
            }
            if (!this._gather || this._gather !== state) {
                clearInterval(this.gatherTimer);
                this.gatherTimer = 0;
                detachGatherer();
                return;
            }
            const t = state.target;
            if (!t || t.status == 'dead') {
                clearInterval(this.gatherTimer);
                this.gatherTimer = 0;
                delete this._gather;
                this.dock();
                detachGatherer();
                return;
            }
            if (!state.carrying) {
                if (this.insideCircle({ centerX: t.posX(), centerY: t.posY(), radius: targetRadius })) {
                    if (!state.harvesting) {
                        state.harvesting = true;
                        this.dock();
                        Game.commandTimeout(() => {
                            if (this.status == 'dead') return;
                            if (!this._gather || this._gather !== state) return;
                            if (!state.harvesting) return;
                            if (state.type == 'mine') {
                                if (t.value == null) t.value = 0;
                                if (t.value <= 0) {
                                    t.die();
                                    state.harvesting = false;
                                    detachGatherer();
                                    return;
                                }
                                const got = Math.min(takeAmount, t.value);
                                t.value -= got;
                                state.carrying = got;
                                state.harvesting = false;
                                if (t.value <= 0) t.die();
                            }
                            else {
                                if (t.gas == null) t.gas = 2500;
                                if (t.gas <= 0) {
                                    state.harvesting = false;
                                    clearInterval(this.gatherTimer);
                                    this.gatherTimer = 0;
                                    delete this._gather;
                                    this.dock();
                                    detachGatherer();
                                    return;
                                }
                                const got = Math.min(takeAmount, t.gas);
                                t.gas -= got;
                                state.carrying = got;
                                state.harvesting = false;
                            }
                        }, harvestMs);
                    }
                }
                else {
                    this.moveTo(t.posX(), t.posY(), targetRadius);
                }
            }
            else {
                const center = this._findGatherCenter();
                if (!center) {
                    clearInterval(this.gatherTimer);
                    this.gatherTimer = 0;
                    delete this._gather;
                    this.dock();
                    detachGatherer();
                    return;
                }
                const centerRadius = Math.max(110, workerRadius + ((typeof center.radius == 'function') ? center.radius() : (Math.min(center.width || 0, center.height || 0) * 0.5)) + 10);
                if (this.insideCircle({ centerX: center.posX(), centerY: center.posY(), radius: centerRadius })) {
                    if (state.type == 'mine' && typeof Resource !== 'undefined') Resource[this.team].mine += state.carrying;
                    else if (typeof Resource !== 'undefined') Resource[this.team].gas += state.carrying;
                    state.carrying = 0;
                    state.harvesting = false;
                }
                else {
                    this.moveTo(center.posX(), center.posY(), centerRadius);
                }
            }
        };
        tick();
        this.gatherTimer = setInterval(tick, 300);
    }
}
Unit.prototype.name = "Unit";
Unit.prototype.isFlying = false;
Unit.prototype.unitType = 0; // Default to SMALL

// Global assignment for legacy compatibility
if (typeof window !== 'undefined') {
    window.Unit = Unit;
}

