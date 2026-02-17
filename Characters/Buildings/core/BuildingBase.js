class Building extends Gobj {
    constructor(props) {
        super(props);
        if (!props) return;
        this.id = Unit.currentID++;
        this.isEnemy = Boolean(props.isEnemy);
        this.life = this.get('HP');
        if (this.SP) this.shield = this.get('SP');
        if (this.MP) this.magic = 50;
        this.selected = false;
        this.isFlying = false;
        this.commandQueue = [];
        if (['Refinery', 'Extractor', 'Assimilator'].indexOf(this.name) !== -1) {
            this.gasSmoke = new Burst.GasSmoke({ target: this, above: true, scale: 1.4, duration: -1 });
        }
        GameMap.markExplored(this.posX(), this.posY(), this.get('sight'));
        setTimeout(() => {
            Building.allBuildings.push(this);
            if (this.isEnemy) Building.enemyBuildings.push(this);
            else Building.ourBuildings.push(this);
            this.dock();
        }, 0);
    }

    animeFrame() {
        this.action++;
        var arrLimit = (this.imgPos[this.status].left instanceof Array) ? (this.imgPos[this.status].left.length) : 1;
        if (this.action == this.frame[this.status] || this.action >= arrLimit) this.action = 0;
        if (this.imgPos[this.status].left[this.action] == -1) this.action = 0;
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
                if (typeof Game !== 'undefined' && Game && Game.isPaused) return;
                this.animeFrame();
                this.updateLocation();
                this.detectOutOfBound();
            }, 100);
        }
    }

    moveTo(clickX, clickY, range, callback) {
        if (!this.isFlying) return;
        this.destination = { x: clickX, y: clickY };
        var routingFrame = () => {
            if (typeof Game !== 'undefined' && Game && Game.isPaused) return;
            var dx = this.destination.x - this.posX();
            var dy = this.destination.y - this.posY();
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < (range || 5)) {
                this.dock();
                if (callback) callback();
            } else {
                this.speed = {
                    x: (dx / dist) * 2,
                    y: (dy / dist) * 2
                };
                this.run();
            }
        };
        this.routingTimer = setInterval(routingFrame, 100);
        this.run();
    }

    moveToward(target, range, callback) {
        if (!this.isFlying) return;
        var routingFrame = () => {
            if (typeof Game !== 'undefined' && Game && Game.isPaused) return;
            var dx = target.posX() - this.posX();
            var dy = target.posY() - this.posY();
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < (range || 5)) {
                this.dock();
                if (callback) callback();
            } else {
                this.speed = {
                    x: (dx / dist) * 2,
                    y: (dy / dist) * 2
                };
                this.run();
            }
        };
        this.routingTimer = setInterval(routingFrame, 100);
        this.run();
    }

    stop() {
        Gobj.prototype.stop.call(this);
        if (this.routingTimer) {
            clearInterval(this.routingTimer);
            this.routingTimer = 0;
        }
        if (this.isIdle() && this.commandQueue && this.commandQueue.length > 0) {
            this.executeNextCommand();
        }
    }

    executeNextCommand() {
        if (this.status == "dead" || !this.commandQueue || this.commandQueue.length == 0) return;
        var cmd = this.commandQueue.shift();
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
        if (this.isIdle() && this.commandQueue && this.commandQueue.length > 0) {
            this.executeNextCommand();
        }
    }

    die() {
        Gobj.prototype.die.call(this);
        this.life = 0;
        if (this.gasSmoke && this.gasSmoke.status != "dead") {
            this.gasSmoke.die();
        }
        if (this.sound.death && this.insideScreen()) {
            this.sound.death.play();
        }
    }

    reactionWhenAttackedBy(enemy) {
        if (this.life <= 0) {
            if (this.status != "dead") {
                this.die();
                enemy.kill++;
            }
        }
    }

    calculateDamageBy(enemyObj) {
        return (enemyObj instanceof Gobj) ? enemyObj.get('damage') : enemyObj;
    }

    getDamageBy(enemy, percent) {
        if (percent == undefined) percent = 1;
        var damage = 0;
        if (this.shield > 0) {
            damage = ((this.calculateDamageBy(enemy) - this.get('plasma')) * percent) >> 0;
            if (damage < 1) damage = 1;
            this.shield -= damage;
            if (this.shield < 0) {
                this.life += (this.shield);
                this.shield = 0;
            }
        }
        else {
            damage = ((enemy.get('damage') - this.get('armor')) * percent) >> 0;
            if (damage < 1) damage = 1;
            this.life -= damage;
        }
        if (typeof Game !== 'undefined' && Game.raiseUnderAttack && enemy && enemy.isEnemy !== this.isEnemy) {
            Game.raiseUnderAttack(this);
        }
        var now = (window.performance && performance.now) ? performance.now() : Date.now();
        this._hitFlashUntil = now + 120;
    }

    lifeStatus() {
        var lifeRatio = this.life / this.get('HP');
        return ((lifeRatio > 0.7) ? "green" : (lifeRatio > 0.3) ? "yellow" : "red");
    }
}

Building.prototype.name = "Building";
Building.prototype.isBuilding = true;
Building.prototype.armor = 0;
Building.prototype.sight = 385;
Building.allBuildings = [];
Building.ourBuildings = [];
Building.enemyBuildings = [];
