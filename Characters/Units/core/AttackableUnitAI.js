AttackableUnit.prototype.findNearbyTargets = function () {
    //Initial
    var units, buildings, results = [];
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
    var myself = this;
    [units, buildings].forEach((charas) => {
        var myX = myself.posX();
        var myY = myself.posY();
        charas = charas.filter((chara) => {
            return !chara.isInvisible && !chara.isResource && myself.canSee(chara) && myself.matchAttackLimit(chara);
        }).sort((chara1, chara2) => {
            var X1 = chara1.posX(), Y1 = chara1.posY(), X2 = chara2.posX(), Y2 = chara1.posY();
            return (X1 - myX) * (X1 - myX) + (Y1 - myY) * (Y1 - myY) - (X2 - myX) * (X2 - myX) - (Y2 - myY) * (Y2 - myY);
        });
        results = results.concat(charas);
    });
    //Calculate order delay, reverse to priority
    var _getDelay = function (chara) {
        var delay = 0;
        if (chara.attack) {
            //Measure delay by attack times needed to kill enemy
            if (chara.matchAttackLimit(myself))
                delay += ((chara.life + (chara.SP ? chara.shield : 0)) / chara.calculateDamageBy(myself));
            else delay += 32;
        }
        else delay += 64;
        return delay;
    };
    var _priority = function (chara) {
        var p = 0;
        if (chara instanceof Unit) p += 20;
        if (['SCV', 'Drone', 'Probe'].indexOf(chara.name) != -1) p += 50;
        if (chara.attack && chara.target === myself) p += 30;
        return p;
    };
    results.sort(function (chara1, chara2) {
        var p1 = _priority(chara1);
        var p2 = _priority(chara2);
        if (p1 != p2) return p2 - p1;
        var d1 = _getDelay(chara1);
        var d2 = _getDelay(chara2);
        if (d1 != d2) return d1 - d2;
        var X1 = chara1.posX() - myself.posX(), Y1 = chara1.posY() - myself.posY();
        var X2 = chara2.posX() - myself.posX(), Y2 = chara2.posY() - myself.posY();
        return X1 * X1 + Y1 * Y1 - (X2 * X2 + Y2 * Y2);
    });
    //Take near>>unit>>attackable>>killtimes as priority, will attracted if be attacked
    return results;
};
AttackableUnit.prototype.highestPriorityTarget = function () {
    return this.findNearbyTargets()[0];
};
AttackableUnit.prototype.AI = function () {
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
        var enemy = this.highestPriorityTarget();
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
};
//Override
AttackableUnit.prototype.reactionWhenAttackedBy = function (enemy, onlyDamage) {
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
};
AttackableUnit.prototype.isAttacking = function () {
    //Has target
    return (this.target instanceof Gobj);
};
AttackableUnit.prototype.followEnemy = function () {
    //Remind to attack again
    this.attack(this.target);
    //Filter out building target
    if (this.target instanceof Unit) this.tracing = true;
};
AttackableUnit.prototype.isTracing = function () {
    return this.isAttacking() && this.status == "moving";
};
AttackableUnit.prototype.isFiring = function () {
    //May out of range and cannot fire, don't follow when attack status
    return this.isAttacking() && this.status == "dock";
};
//Override
AttackableUnit.prototype.isIdle = function () {
    //Not moving or attacking
    return !this.isAttacking() && this.status == "dock";
};
AttackableUnit.prototype.cannotReachTarget = function () {
    //Found target outside attack range after once firing, need follow once
    return this.isFiring() && !(this.isInAttackRange(this.target));
};
AttackableUnit.prototype.isMissingTarget = function () {
    //Lock on target has global sight, lock off (attackGround) use its own sight
    return !this.targetLock && this.isAttacking() && !(this.canSee(this.target));
};
AttackableUnit.prototype.isReloaded = function () {
    //Add for newly reloaded yamato, two kinds of bullet conflict, ignore bullet array
    if ((this.bullet instanceof Gobj) && this.bullet.status != 'dead') return false;
    return this.coolDown;
};
//Override for attackable unit
AttackableUnit.prototype.die = function () {
    //Old behavior
    Unit.prototype.die.call(this);
    //Recursion, if inherited will stack overflow
    //(this.inherited.die).call(this);
    //Clear new timer for unit
    this.stopAttack();
    this.selected = false;
};
