//Override for sound effect
Unit.prototype.die = function () {
    //Old behavior
    Gobj.prototype.die.call(this);
    this.life = 0;
    //Stop routing
    clearInterval(this.routingTimer);
    if (typeof Game !== 'undefined' && Game.pathfinding) Game.pathfinding.cancel(this);
    //If has sound effect
    if (this.sound.death && this.insideScreen()) {
        this.sound.death.play();
    }
};
//AI when attacked by enemy
Unit.prototype.reactionWhenAttackedBy = function (enemy, onlyDamage) {
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
    //Run away toward bullet direction
    if (this.status == "dock" && !onlyDamage && !this.cannotMove()) {
        this.escapeFrom(enemy);
    }
};
//Calculate damage, if enemy is damage itself, return that damage directly
Unit.prototype.calculateDamageBy = function (enemyObj) {
    var damage = 0;
    if (enemyObj instanceof Gobj) {
        var enemyAttackType = enemyObj.attackType;
        if (!enemyAttackType && enemyObj.attackMode) {
            enemyAttackType = (this.isFlying) ? enemyObj.attackMode.flying.attackType : enemyObj.attackMode.ground.attackType;
        }
        damage = enemyObj.get('damage') * Unit.attackMatrix[enemyAttackType][this.unitType];
    }
    else damage = enemyObj;
    return damage;
};
Unit.prototype.getDamageBy = function (enemy, percent) {
    if (percent == undefined) percent = 1;//100% by default
    var damage = 0;
    //If has SP and shield remain
    if (this.shield > 0) {
        damage = ((this.calculateDamageBy(enemy) - this.get('plasma')) * percent) >> 0;
        if (damage < 1) damage = 0.5;
        this.shield -= damage;
        if (this.shield < 0) {
            //Inherit damage
            this.life += (this.shield);
            this.shield = 0;
        }
    }
    else {
        damage = ((this.calculateDamageBy(enemy) - this.get('armor')) * percent) >> 0;
        if (damage < 1) damage = 0.5;
        this.life -= damage;
    }
    if (typeof Game !== 'undefined' && Game.raiseUnderAttack && enemy && enemy.isEnemy !== this.isEnemy) {
        Game.raiseUnderAttack(this);
    }
    var now = (window.performance && performance.now) ? performance.now() : Date.now();
    this._hitFlashUntil = now + 120;
};
//Attack ground action
Unit.prototype.attackGround = function (position, loop) {
    //Convert to array
    var positions = new Array().concat(position);
    if (this.attack) this.stopAttack();
    //Move to first position
    this.moveTo(positions[0].x, positions[0].y);
    this.targetLock = false;
    var checkpoint = this.destination = positions[0];
    positions.slice(1).forEach((pos) => {
        checkpoint.next = pos;
        checkpoint = checkpoint.next;
    });
    if (loop) checkpoint.next = this.destination;
};
//Patrol action
Unit.prototype.patrol = function (position, addHere) {
    //Convert to array
    var positions = new Array().concat(position);
    if (addHere) positions.push({ x: this.posX(), y: this.posY() });
    this.attackGround(positions, true);
    this._patrolRoute = this.destination;
};
Unit.prototype.isMachine = function () {
    return ["SCV", "Vulture", "Tank", "Goliath", "Wraith", "Dropship", "Vessel", "BattleCruiser", "Valkyrie",
        "Probe", "Dragoon", "Shuttle", "Reaver", "Observer", "Scout", "Carrier", "Arbiter", "Corsair", "HeroCruiser"]
        .indexOf(this.name) != -1;
};
//Life status
Unit.prototype.lifeStatus = function () {
    var lifeRatio = this.life / this.get('HP');
    return ((lifeRatio > 0.7) ? "green" : (lifeRatio > 0.3) ? "yellow" : "red");
};
Unit.prototype._findGatherCenter = function () {
    if (typeof Building === 'undefined') return null;
    var names;
    if (this.name == 'SCV') names = ['CommandCenter'];
    else if (this.name == 'Drone') names = ['Hatchery', 'Lair', 'Hive', 'OvermindI', 'OvermindII'];
    else if (this.name == 'Probe') names = ['Nexus'];
    else names = ['CommandCenter', 'Hatchery', 'Lair', 'Hive', 'OvermindI', 'OvermindII', 'Nexus'];
    var myself = this;
    var centers = Building.ourBuildings.filter(function (b) {
        return b && b.status != 'dead' && names.indexOf(b.name) != -1;
    });
    centers.sort(function (a, b) {
        var dxA = a.posX() - myself.posX(), dyA = a.posY() - myself.posY();
        var dxB = b.posX() - myself.posX(), dyB = b.posY() - myself.posY();
        return (dxA * dxA + dyA * dyA) - (dxB * dxB + dyB * dyB);
    });
    if (centers[0]) return centers[0];
    centers = Building.ourBuildings.filter(function (b) {
        return b && b.status != 'dead' && b.manPlus >= 10;
    });
    centers.sort(function (a, b) {
        var dxA = a.posX() - myself.posX(), dyA = a.posY() - myself.posY();
        var dxB = b.posX() - myself.posX(), dyB = b.posY() - myself.posY();
        return (dxA * dxA + dyA * dyA) - (dxB * dxB + dyB * dyB);
    });
    return centers[0];
};
Unit.prototype.gather = function (target) {
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
    var type = null;
    if (typeof Neutral !== 'undefined' && target instanceof Neutral.Mineral) type = 'mine';
    if ((target instanceof Building) && (['Refinery', 'Extractor', 'Assimilator'].indexOf(target.name) != -1)) type = 'gas';
    if (!type) return;
    var myself = this;
    if (type == 'mine' && typeof Game !== 'undefined' && Game.getInRangeOnes) {
        var minerals = Game.getInRangeOnes(this.posX(), this.posY(), 180, false, true, false, function (chara) {
            return (typeof Neutral !== 'undefined' && chara instanceof Neutral.Mineral);
        });
        if (minerals && minerals.length) {
            minerals.sort(function (a, b) {
                var ga = (a._gatherers && a._gatherers.length) ? a._gatherers.length : 0;
                var gb = (b._gatherers && b._gatherers.length) ? b._gatherers.length : 0;
                if (ga !== gb) return ga - gb;
                var dax = a.posX() - myself.posX(), day = a.posY() - myself.posY();
                var dbx = b.posX() - myself.posX(), dby = b.posY() - myself.posY();
                return dax * dax + day * day - (dbx * dbx + dby * dby);
            });
            target = minerals[0];
        }
    }
    if (this._gather && this._gather.target && this._gather.target._gatherers) {
        var prev = this._gather.target._gatherers;
        var pidx = prev.indexOf(this);
        if (pidx !== -1) prev.splice(pidx, 1);
        if (prev.length === 0) delete this._gather.target._gatherers;
    }
    if (target._gatherers && target._gatherers.length) {
        target._gatherers = target._gatherers.filter(function (w) {
            return w && w.status != 'dead' && w._gather && w._gather.target === target;
        });
        if (!target._gatherers.length) delete target._gatherers;
    }
    var gatherers = target._gatherers || (target._gatherers = []);
    if (gatherers.indexOf(this) === -1) gatherers.push(this);
    var detachGatherer = function () {
        var list = target._gatherers;
        if (!list) return;
        var idx = list.indexOf(myself);
        if (idx !== -1) list.splice(idx, 1);
        if (list.length === 0) delete target._gatherers;
    };
    var state = {
        target: target,
        type: type,
        carrying: 0,
        harvesting: false
    };
    this._gather = state;
    var takeAmount = (type == 'mine') ? 8 : 4;
    var harvestMs = (type == 'mine') ? 2000 : 2400;
    var saturation = (target && target._gatherers && target._gatherers.length) ? target._gatherers.length : 1;
    var penalty = Math.max(1, saturation / 3);
    harvestMs = Math.max(400, (harvestMs * penalty) >> 0);
    var baseTargetRadius = (type == 'mine') ? 45 : 80;
    var workerRadius = (typeof this.radius == 'function') ? this.radius() : (Math.min(this.width, this.height) * 0.5);
    var targetObjRadius = (target && typeof target.radius == 'function') ? target.radius() : (Math.min(target.width || 0, target.height || 0) * 0.5);
    var targetRadius = Math.max(baseTargetRadius, workerRadius + targetObjRadius + 6);
    var tick = function () {
        if (myself.status == 'dead') {
            clearInterval(myself.gatherTimer);
            myself.gatherTimer = 0;
            if (myself._gather) delete myself._gather;
            detachGatherer();
            return;
        }
        if (!myself._gather || myself._gather !== state) {
            clearInterval(myself.gatherTimer);
            myself.gatherTimer = 0;
            detachGatherer();
            return;
        }
        var t = state.target;
        if (!t || t.status == 'dead') {
            clearInterval(myself.gatherTimer);
            myself.gatherTimer = 0;
            delete myself._gather;
            myself.dock();
            detachGatherer();
            return;
        }
        if (!state.carrying) {
            if (myself.insideCircle({ centerX: t.posX(), centerY: t.posY(), radius: targetRadius })) {
                if (!state.harvesting) {
                    state.harvesting = true;
                    myself.dock();
                    setTimeout(function () {
                        if (myself.status == 'dead') return;
                        if (!myself._gather || myself._gather !== state) return;
                        if (!state.harvesting) return;
                        if (state.type == 'mine') {
                            if (t.value == null) t.value = 0;
                            if (t.value <= 0) {
                                t.die();
                                state.harvesting = false;
                                detachGatherer();
                                return;
                            }
                            var got = Math.min(takeAmount, t.value);
                            t.value -= got;
                            state.carrying = got;
                            state.harvesting = false;
                            if (t.value <= 0) t.die();
                        }
                        else {
                            if (t.gas == null) t.gas = 2500;
                            if (t.gas <= 0) {
                                state.harvesting = false;
                                clearInterval(myself.gatherTimer);
                                myself.gatherTimer = 0;
                                delete myself._gather;
                                myself.dock();
                                detachGatherer();
                                return;
                            }
                            var got = Math.min(takeAmount, t.gas);
                            t.gas -= got;
                            state.carrying = got;
                            state.harvesting = false;
                        }
                    }, harvestMs);
                }
            }
            else {
                myself.moveTo(t.posX(), t.posY(), targetRadius);
            }
        }
        else {
            var center = myself._findGatherCenter();
            if (!center) {
                clearInterval(myself.gatherTimer);
                myself.gatherTimer = 0;
                delete myself._gather;
                myself.dock();
                detachGatherer();
                return;
            }
            var centerRadius = Math.max(110, workerRadius + ((typeof center.radius == 'function') ? center.radius() : (Math.min(center.width || 0, center.height || 0) * 0.5)) + 10);
            if (myself.insideCircle({ centerX: center.posX(), centerY: center.posY(), radius: centerRadius })) {
                if (state.type == 'mine') Resource[0].mine += state.carrying;
                else Resource[0].gas += state.carrying;
                state.carrying = 0;
                state.harvesting = false;
            }
            else {
                myself.moveTo(center.posX(), center.posY(), centerRadius);
            }
        }
    };
    tick();
    this.gatherTimer = setInterval(tick, 300);
};
