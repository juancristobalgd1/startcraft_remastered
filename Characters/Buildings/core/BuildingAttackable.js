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
        attack: function (enemy) {
            if (enemy.isInvisible || !(this.matchAttackLimit(enemy))) {
                Referee.voice.pError.play();
                this.stopAttack();
                return;
            }
            if (enemy instanceof Gobj && enemy.status != "dead") {
                this.stopAttack();
                this.dock();
                this.target = enemy;
                var myself = this;
                var attackFrame = function () {
                    if (enemy.status == "dead" || enemy.isInvisible || myself.isMissingTarget()) {
                        myself.stopAttack();
                        myself.dock();
                    }
                    else {
                        if (myself.isReloaded()) {
                            myself.coolDown = false;
                            setTimeout(function () {
                                myself.coolDown = true;
                            }, myself.get('attackInterval'));
                            var enemies;
                            if (myself.AOE) {
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
                                switch (myself.AOE.type) {
                                    case "LINE":
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
                                    case "CIRCLE":
                                    default:
                                        enemies = enemies.filter(function (chara) {
                                            return chara.insideCircle(
                                                { centerX: enemy.posX(), centerY: enemy.posY(), radius: myself.AOE.radius })
                                                && !chara.isInvisible;
                                        })
                                }
                            }
                            if (myself.imgPos.attack) {
                                myself.action = 0;
                                myself.status = "attack";
                                setTimeout(function () {
                                    if (myself.status == "attack") {
                                        myself.status = "dock";
                                        myself.action = 0;
                                    }
                                }, myself.frame.attack * 100);
                            }
                            if (myself.Bullet) {
                                if (myself.continuousAttack) {
                                    myself.bullet = new Array();
                                    for (var N = 0; N < myself.continuousAttack.count; N++) {
                                        var bullet = new myself.Bullet({
                                            from: myself,
                                            to: enemy
                                        });
                                        if (myself.continuousAttack.layout) myself.continuousAttack.layout(bullet, N);
                                        if (myself.continuousAttack.onlyOnce && N != 0) {
                                            bullet.noDamage = true;
                                        }
                                        bullet.fire();
                                        myself.bullet.push(bullet);
                                    }
                                }
                                else {
                                    myself.bullet = new myself.Bullet({
                                        from: myself,
                                        to: enemy
                                    });
                                    myself.bullet.fire();
                                }
                            }
                            else {
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
                attackFrame();
                this.attackTimer = setInterval(attackFrame, 100);
            }
        },
        stopAttack: AttackableUnit.prototype.stopAttack,
        findNearbyTargets: function () {
            var units, buildings, results = [];
            if (this.isEnemy) {
                units = Unit.allOurUnits();
                buildings = Building.ourBuildings;
            }
            else {
                units = Unit.allEnemyUnits();
                buildings = Building.enemyBuildings;
            }
            var myself = this;
            [units, buildings].forEach((charas) => {
                var myX = myself.posX();
                var myY = myself.posY();
                charas = charas.filter((chara) => {
                    return !chara.isInvisible && !chara.isResource && myself.isInAttackRange(chara) && myself.matchAttackLimit(chara);
                }).sort((chara1, chara2) => {
                    var X1 = chara1.posX(), Y1 = chara1.posY(), X2 = chara2.posX(), Y2 = chara1.posY();
                    return (X1 - myX) * (X1 - myX) + (Y1 - myY) * (Y1 - myY) - (X2 - myX) * (X2 - myX) - (Y2 - myY) * (Y2 - myY);
                });
                results = results.concat(charas);
            });
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
                var X1 = chara1.posX() - myself.posX(), Y1 = chara1.posY() - myself.posY();
                var X2 = chara2.posX() - myself.posX(), Y2 = chara2.posY() - myself.posY();
                return X1 * X1 + Y1 * Y1 - (X2 * X2 + Y2 * Y2);
            });
            return results;
        },
        highestPriorityTarget: AttackableUnit.prototype.highestPriorityTarget,
        AI: function () {
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
                var enemy = this.highestPriorityTarget();
                if (enemy) this.attack(enemy);
            }
        },
        isAttacking: AttackableUnit.prototype.isAttacking,
        cannotReachTarget: function () {
            return !(this.isInAttackRange(this.target));
        },
        isMissingTarget: AttackableUnit.prototype.isMissingTarget,
        isReloaded: AttackableUnit.prototype.isReloaded,
        die: function () {
            Building.prototype.die.call(this);
            this.stopAttack();
            this.selected = false;
        }
    }
};
