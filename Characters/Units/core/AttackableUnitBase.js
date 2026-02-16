var AttackableUnit = Unit.extends({
    constructorPlus: function (props) {
        this.attackTimer = 0;
        this.bullet = {};
        this.kill = 0;
        this.target = {};
        //Idle by default
        this.targetLock = false;
        //Can fire by default
        this.coolDown = true;
        //Init attack range
        if (this.meleeAttack) this.attackRange = Math.max(this.radius(), 35);
        //Add attack sound for AttackableUnit
        this.sound.attack = new Audio('bgm/' + this.name + '.attack.wav');
    },
    prototypePlus: {
        //Add basic unit info
        name: "AttackableUnit",
        isInAttackRange: function (enemy) {
            return enemy.inside({ centerX: this.posX(), centerY: this.posY(), radius: this.get('attackRange') });
        },
        matchAttackLimit: function (enemy) {
            //Has attack limit
            if (this.attackLimit) {
                //Doesn't match attack limit
                if ((this.attackLimit == "flying" && !(enemy.isFlying)) ||
                    (this.attackLimit == "ground" && enemy.isFlying)) return false;
            }
            //No attack limit or match attack limit
            return true;
        },
        attack: function (enemy) {
            //Cannot attack invisible unit or unit who mismatch your attack type
            if (enemy && enemy.isResource) {
                Referee.voice.pError.play();
                this.stopAttack();
                return;
            }
            if (enemy.isInvisible || !(this.matchAttackLimit(enemy))) {
                Referee.voice.pError.play();
                this.stopAttack();
                return;
            }
            //Don't attack same target again unless miss target or tracing target
            if (this.target == enemy) {
                if (this.cannotReachTarget()) {
                    if (this.status == 'moving') return;//tracing
                }
                else return;
            }
            //Recover attack range
            else delete this.tracing;
            if (enemy instanceof Gobj && enemy.status != "dead") {
                //Stop old attack and moving
                this.stopAttack();
                this.dock();
                //New attack
                this.target = enemy;
                //Get melee attack range if melee attack unit
                if (this.meleeAttack) {
                    //Override
                    this.attackRange = this.radius() + enemy.radius();
                }
                //If separate attack mode, override
                if (this.attackMode) {
                    this.Bullet = (enemy.isFlying) ? this.attackMode.flying.Bullet : this.attackMode.ground.Bullet;
                    this.attackRange = (enemy.isFlying) ? this.get('attackMode.flying.attackRange') : this.get('attackMode.ground.attackRange');
                    this.attackEffect = (enemy.isFlying) ? this.attackMode.flying.attackEffect : this.attackMode.ground.attackEffect;
                    this.attackInterval = (enemy.isFlying) ? this.get('attackMode.flying.attackInterval') : this.get('attackMode.ground.attackInterval');
                    //Change attack bgm
                    this.sound.attack = (enemy.isFlying) ? this.sound.attackF : this.sound.attackG;
                    this.damage = (enemy.isFlying) ? this.get('attackMode.flying.damage') : this.get('attackMode.ground.damage');
                    this.attackType = (enemy.isFlying) ? this.attackMode.flying.attackType : this.attackMode.ground.attackType;
                    this.attackMode.status = enemy.isFlying;
                }
                //Move in attack range, no need to move melee
                var range = this.get('attackRange');
                if (this.tracing) {
                    //Adjust attack range for tracing
                    range = Math.max(this.get('attackRange') - 50, this.radius() + enemy.radius());
                    delete this.tracing;
                }
                //Add to fix holding issue
                if (!this.hold) this.moveToward(enemy, range);
                var myself = this;
                var attackFrame = function () {
                    //If enemy already dead or becomes invisible or we just miss enemy
                    if (enemy.status == "dead" || enemy.isInvisible || myself.isMissingTarget()) {
                        myself.stopAttack();
                        myself.dock();
                    }
                    else {
                        if (!myself.meleeAttack && enemy.meleeAttack && !myself.isReloaded() && !myself.hold) {
                            var now = (window.performance && performance.now) ? performance.now() : Date.now();
                            if (!myself._lastKiteAt || now - myself._lastKiteAt > 200) {
                                var kiteRadius = Math.max(myself.get('attackRange') * 0.7, enemy.radius() + myself.radius());
                                if (myself.insideCircle({ centerX: enemy.posX(), centerY: enemy.posY(), radius: kiteRadius })) {
                                    myself._lastKiteAt = now;
                                    myself.escapeFrom(enemy);
                                }
                            }
                        }
                        //Cannot come in until reload cool down, only dock down can finish attack animation
                        if (myself.isReloaded() && myself.isInAttackRange(enemy) && myself.status == "dock") {
                            //Load bullet
                            myself.coolDown = false;
                            //Cool down after attack interval
                            setTimeout(function () {
                                myself.coolDown = true;
                            }, myself.get('attackInterval'));
                            //If AOE, init enemies
                            var enemies;
                            if (myself.AOE) {
                                //Get possible targets
                                if (myself.isEnemy) {
                                    enemies = (myself.attackLimit) ? ((myself.attackLimit == "flying") ?
                                        Unit.ourFlyingUnits : Unit.ourGroundUnits.concat(Building.ourBuildings))
                                        : (Unit.allOurUnits().concat(Building.ourBuildings));
                                }
                                else {
                                    enemies = (myself.attackLimit) ? ((myself.attackLimit == "flying") ?
                                        Unit.enemyFlyingUnits : Unit.enemyGroundUnits.concat(Building.enemyBuildings))
                                        : (Unit.allEnemyUnits().concat(Building.enemyBuildings));
                                }
                                //Range filter
                                switch (myself.AOE.type) {
                                    case "LINE":
                                        //Calculate inter-points between enemy
                                        var N = Math.ceil(myself.distanceFrom(enemy) / (myself.AOE.radius));
                                        enemies = enemies.filter(function (chara) {
                                            for (var n = 1; n <= N; n++) {
                                                var X = myself.posX() + n * (enemy.posX() - myself.posX()) / N;
                                                var Y = myself.posY() + n * (enemy.posY() - myself.posY()) / N;
                                                if (chara.insideCircle({ centerX: X >> 0, centerY: Y >> 0, radius: myself.AOE.radius }) && !chara.isInvisible) {
                                                    return true;
                                                }
                                            }
                                            return false;
                                        });
                                        break;
                                    //Default type is CIRCLE
                                    case "CIRCLE":
                                    default:
                                        enemies = enemies.filter(function (chara) {
                                            return chara.insideCircle(
                                                { centerX: enemy.posX(), centerY: enemy.posY(), radius: myself.AOE.radius })
                                                && !chara.isInvisible;
                                        })
                                }
                            }
                            //First facing to enemy
                            myself.faceTo(enemy);
                            //Show attack animation if has
                            if (myself.imgPos.attack) {
                                myself.action = 0;
                                //Change status to show attack frame
                                myself.status = "attack";
                                //Will return to dock after attack
                                setTimeout(function () {
                                    //If still show attack
                                    if (myself.status == "attack") {
                                        myself.status = "dock";
                                        myself.action = 0;
                                    }
                                }, myself.frame.attack * 100);//attackAnimation < attackInterval
                            }
                            //If has bullet
                            if (myself.Bullet) {
                                //Will shoot multiple bullets in one time
                                if (myself.continuousAttack) {
                                    myself.bullet = new Array();
                                    for (var N = 0; N < myself.continuousAttack.count; N++) {
                                        var bullet = new myself.Bullet({
                                            from: myself,
                                            to: enemy
                                        });
                                        //Reassign bullets location
                                        if (myself.continuousAttack.layout) myself.continuousAttack.layout(bullet, N);
                                        if (myself.continuousAttack.onlyOnce && N != 0) {
                                            bullet.noDamage = true;
                                        }
                                        bullet.fire();
                                        myself.bullet.push(bullet);
                                    }
                                }
                                else {
                                    //Reload one new bullet
                                    myself.bullet = new myself.Bullet({
                                        from: myself,
                                        to: enemy
                                    });
                                    myself.bullet.fire();
                                }
                            }
                            //Else will cause damage immediately (melee attack)
                            else {
                                //Cause damage when burst appear
                                //If AOE, only enemy unit has AOE
                                if (myself.AOE) {
                                    enemies.forEach((chara) => {
                                        chara.getDamageBy(myself);
                                        chara.reactionWhenAttackedBy(myself);
                                    })
                                }
                                else {
                                    setTimeout(() => {
                                        enemy.getDamageBy(myself);
                                        enemy.reactionWhenAttackedBy(myself);
                                    }, myself.frame.attack * 100);
                                }
                                if (myself.suicide) myself.die();
                            }
                            if (myself.attackEffect) {
                                if (myself.AOE && myself.AOE.hasEffect) {
                                    enemies.forEach((chara) => {
                                        new myself.attackEffect({ x: chara.posX(), y: chara.posY() });
                                    })
                                }
                                else {
                                    new myself.attackEffect({ x: enemy.posX(), y: enemy.posY() });
                                }
                            }
                            if (!myself.Bullet && myself.insideScreen()) myself.sound.attack.play();
                        }
                    }
                };
                attackFrame();//Add one missing frame
                this.attackTimer = setInterval(attackFrame, 100);
            }
        },
        stopAttack: function () {
            //Stop attacking animation
            clearInterval(this.attackTimer);
            //Clear target
            this.target = {};
        }
    }
});
