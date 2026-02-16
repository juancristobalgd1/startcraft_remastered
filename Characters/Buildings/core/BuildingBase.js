var Building = Gobj.extends({
    constructorPlus: function (props) {
        //Add id for building
        this.id = Unit.currentID++;
        this.isEnemy = Boolean(props.isEnemy);//false by default
        this.life = this.get('HP');
        if (this.SP) this.shield = this.get('SP');
        if (this.MP) this.magic = 50;
        this.selected = false;
        this.isFlying = false;
        this.commandQueue = [];
        // Fog of War: mark initial position as seen
        GameMap.markExplored(this.posX(), this.posY(), this.get('sight'));
        // Finish below after fully constructed, postpone
        var myself = this;
        setTimeout(function () {
            //Add this unit into Game
            Building.allBuildings.push(myself);
            if (myself.isEnemy) Building.enemyBuildings.push(myself);
            else Building.ourBuildings.push(myself);
            //Show unit
            myself.dock();
        }, 0);

    },
    prototypePlus: {
        name: "Building",
        isBuilding: true,
        armor: 0,
        sight: 385,
        //Override to support multiple hidden frames
        animeFrame: function () {
            //Animation play
            this.action++;
            //Override Gobj here, building doesn't have direction
            var arrLimit = (this.imgPos[this.status].left instanceof Array) ? (this.imgPos[this.status].left.length) : 1;
            if (this.action == this.frame[this.status] || this.action >= arrLimit) this.action = 0;
            //Multiple hidden frames support
            if (this.imgPos[this.status].left[this.action] == -1) this.action = 0;
        },
        //Dock means stop moving but keep animation
        dock: function () {
            //Clear old timer
            this.stop();
            //Launch new dock timer
            this.status = "dock";
            var myself = this;
            this._timer = setInterval(function () {
                //Only play animation, will not move
                myself.animeFrame();
            }, 100);
        },
        //Support movement when flying
        moving: function () {
            if (this.isFlying) {
                this.stop();
                this.status = "moving";
                var myself = this;
                this._timer = setInterval(function () {
                    if (typeof Game !== 'undefined' && Game && Game.isPaused) return;
                    myself.animeFrame();
                    myself.updateLocation();
                    myself.detectOutOfBound();
                }, 100);
            }
        },
        moveTo: function (clickX, clickY, range, callback) {
            if (!this.isFlying) return;
            // Simplified movement logic for flying buildings
            this.destination = { x: clickX, y: clickY };
            var myself = this;
            var routingFrame = function () {
                if (typeof Game !== 'undefined' && Game && Game.isPaused) return;
                var dx = myself.destination.x - myself.posX();
                var dy = myself.destination.y - myself.posY();
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < (range || 5)) {
                    myself.dock();
                    if (callback) callback();
                } else {
                    myself.speed = {
                        x: (dx / dist) * 2,
                        y: (dy / dist) * 2
                    };
                    myself.run();
                }
            };
            this.routingTimer = setInterval(routingFrame, 100);
            this.run();
        },
        moveToward: function (target, range, callback) {
            if (!this.isFlying) return;
            var myself = this;
            var routingFrame = function () {
                if (typeof Game !== 'undefined' && Game && Game.isPaused) return;
                var dx = target.posX() - myself.posX();
                var dy = target.posY() - myself.posY();
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < (range || 5)) {
                    myself.dock();
                    if (callback) callback();
                } else {
                    myself.speed = {
                        x: (dx / dist) * 2,
                        y: (dy / dist) * 2
                    };
                    myself.run();
                }
            };
            this.routingTimer = setInterval(routingFrame, 100);
            this.run();
        },
        run: function () {
            this.moving();
        },
        stop: function () {
            Gobj.prototype.stop.call(this);
            if (this.routingTimer) {
                clearInterval(this.routingTimer);
                this.routingTimer = 0;
            }
            if (this.isIdle() && this.commandQueue && this.commandQueue.length > 0) {
                this.executeNextCommand();
            }
        },
        executeNextCommand: function () {
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
        },
        run: function () {
            this.moving();
            if (this.isIdle() && this.commandQueue && this.commandQueue.length > 0) {
                this.executeNextCommand();
            }
        },
        //Override for sound effect
        die: function () {
            //Old behavior
            Gobj.prototype.die.call(this);
            this.life = 0;
            //If has sound effect
            if (this.sound.death && this.insideScreen()) {
                this.sound.death.play();
            }
        },
        reactionWhenAttackedBy: function (enemy) {
            //Cannot fight back or escape
            //Resign and give reward to enemy if has no life before dead
            if (this.life <= 0) {
                //If multiple target, only die once and give reward
                if (this.status != "dead") {
                    //Killed by enemy
                    this.die();
                    //Give enemy reward
                    enemy.kill++;
                }
            }
        },
        //Fix bug, for consistent, cause 100% damage on building
        calculateDamageBy: function (enemyObj) {
            return (enemyObj instanceof Gobj) ? enemyObj.get('damage') : enemyObj;
        },
        //Calculate damage, for consistence
        getDamageBy: function (enemy, percent) {
            if (percent == undefined) percent = 1;//100% by default
            var damage = 0;
            //If has SP and shield remain
            if (this.shield > 0) {
                damage = ((this.calculateDamageBy(enemy) - this.get('plasma')) * percent) >> 0;
                if (damage < 1) damage = 1;
                this.shield -= damage;
                if (this.shield < 0) {
                    //Inherit damage
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
        },
        //Life status
        lifeStatus: function () {
            var lifeRatio = this.life / this.get('HP');
            return ((lifeRatio > 0.7) ? "green" : (lifeRatio > 0.3) ? "yellow" : "red");
        }
    }
});
Building.allBuildings = [];
Building.ourBuildings = [];
Building.enemyBuildings = [];
