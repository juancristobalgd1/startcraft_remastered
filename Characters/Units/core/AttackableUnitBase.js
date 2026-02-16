class AttackableUnit extends Unit {
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
        this.sound.attack = new Audio('bgm/' + this.name + '.attack.wav');
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
        if (enemy.isInvisible || !(this.matchAttackLimit(enemy))) {
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
            var range = this.get('attackRange');
            if (this.tracing) {
                range = Math.max(this.get('attackRange') - 50, this.radius() + enemy.radius());
                delete this.tracing;
            }
            if (!this.hold) this.moveToward(enemy, range);
            var attackFrame = () => {
                if (enemy.status == "dead" || enemy.isInvisible || this.isMissingTarget()) {
                    this.stopAttack();
                    this.dock();
                }
                else {
                    if (!this.meleeAttack && enemy.meleeAttack && !this.isReloaded() && !this.hold) {
                        var now = (window.performance && performance.now) ? performance.now() : Date.now();
                        if (!this._lastKiteAt || now - this._lastKiteAt > 200) {
                            var kiteRadius = Math.max(this.get('attackRange') * 0.7, enemy.radius() + this.radius());
                            if (this.insideCircle({ centerX: enemy.posX(), centerY: enemy.posY(), radius: kiteRadius })) {
                                this._lastKiteAt = now;
                                this.escapeFrom(enemy);
                            }
                        }
                    }
                    if (this.isReloaded() && this.isInAttackRange(enemy) && this.status == "dock") {
                        this.coolDown = false;
                        setTimeout(() => {
                            this.coolDown = true;
                        }, this.get('attackInterval'));
                        var enemies;
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
                                    var N = Math.ceil(this.distanceFrom(enemy) / (this.AOE.radius));
                                    enemies = enemies.filter((chara) => {
                                        for (var n = 1; n <= N; n++) {
                                            var X = this.posX() + n * (enemy.posX() - this.posX()) / N;
                                            var Y = this.posY() + n * (enemy.posY() - this.posY()) / N;
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
                            }
                        }
                        this.faceTo(enemy);
                        if (this.imgPos.attack) {
                            this.action = 0;
                            this.status = "attack";
                            setTimeout(() => {
                                if (this.status == "attack") {
                                    this.status = "dock";
                                    this.action = 0;
                                }
                            }, this.frame.attack * 100);
                        }
                        if (this.Bullet) {
                            if (this.continuousAttack) {
                                this.bullet = new Array();
                                for (var N = 0; N < this.continuousAttack.count; N++) {
                                    var bullet = new this.Bullet({
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
                                setTimeout(() => {
                                    enemy.getDamageBy(this);
                                    enemy.reactionWhenAttackedBy(this);
                                }, this.frame.attack * 100);
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
                        if (!this.Bullet && this.insideScreen()) this.sound.attack.play();
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
}

AttackableUnit.prototype.name = "AttackableUnit";
