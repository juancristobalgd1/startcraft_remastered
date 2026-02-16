class Bullets extends Gobj {
    constructor(props) {
        super(props);
        if (!props) return;
        this.owner = props.from;
        var ownerX = (this.owner instanceof Gobj) ? (this.owner.posX()) : (this.owner.x);
        var ownerY = (this.owner instanceof Gobj) ? (this.owner.posY()) : (this.owner.y);
        this.target = props.to;
        var targetX = (this.target instanceof Gobj) ? (this.target.posX()) : (this.target.x);
        var targetY = (this.target instanceof Gobj) ? (this.target.posY()) : (this.target.y);
        this.x = ownerX - this.width / 2;
        this.y = ownerY - this.height / 2;
        this.speed = {
            x: (targetX - ownerX) / (this.duration / 100),
            y: (targetY - ownerY) / (this.duration / 100)
        };
        if (this.forbidRotate) this.angle = 0;
        else {
            this.angle = Math.atan((ownerY - targetY) / (targetX - ownerX));
            if (targetX < ownerX) this.angle += Math.PI;
        }
        this.status = "dead";
        if (props.damage != null) this.damage = props.damage;
    }

    updateLocation() {
        this.x += this.speed.x;
        this.y += this.speed.y;
    }

    burst() {
        var owner = this.owner;
        var target = this.target;
        this.die();
        if (!(target instanceof Gobj)) return;
        var targets;
        if (owner.AOE) {
            if (owner.isEnemy) {
                targets = (owner.attackLimit) ? ((owner.attackLimit == "flying") ?
                    Unit.ourFlyingUnits : Unit.ourGroundUnits.concat(Building.ourBuildings))
                    : (Unit.allOurUnits().concat(Building.ourBuildings));
            }
            else {
                targets = (owner.attackLimit) ? ((owner.attackLimit == "flying") ?
                    Unit.enemyFlyingUnits : Unit.enemyGroundUnits.concat(Building.enemyBuildings))
                    : (Unit.allEnemyUnits().concat(Building.enemyBuildings));
            }
            switch (owner.AOE.type) {
                case "LINE":
                    var N = Math.ceil(owner.distanceFrom(target) / (owner.AOE.radius));
                    targets = targets.filter((chara) => {
                        for (var n = 1; n <= N; n++) {
                            var X = owner.posX() + n * (target.posX() - owner.posX()) / N;
                            var Y = owner.posY() + n * (target.posY() - owner.posY()) / N;
                            if (chara.insideCircle({ centerX: X >> 0, centerY: Y >> 0, radius: owner.AOE.radius }) && !chara.isInvisible) {
                                return true;
                            }
                        }
                        return false;
                    });
                    break;
                case "CIRCLE":
                default:
                    targets = targets.filter((chara) => {
                        return chara.insideCircle(
                            { centerX: target.posX(), centerY: target.posY(), radius: owner.AOE.radius })
                            && !chara.isInvisible;
                    });
            }
        }
        if (this.burstEffect) {
            if (owner.AOE && owner.AOE.hasEffect) {
                var burstEffect = this.burstEffect;
                targets.forEach((chara) => {
                    new burstEffect({ target: chara, above: true });
                })
            }
            else {
                new this.burstEffect({ target: target, above: true });
            }
        }
        if (!this.noDamage) {
            if (owner.AOE) {
                targets.forEach((chara) => {
                    if (this.damage != null) target.getDamageBy(this.damage);
                    else target.getDamageBy(owner);
                    chara.reactionWhenAttackedBy(owner);
                })
            }
            else {
                if (this.damage != null) target.getDamageBy(this.damage);
                else target.getDamageBy(owner);
                target.reactionWhenAttackedBy(owner);
            }
        }
    }

    fire(callback) {
        this.moving();
        if (this.insideScreen() && this.owner.sound.attack) this.owner.sound.attack.play();
        setTimeout(() => {
            this.burst();
            if (callback) callback();
        }, this.duration);
    }
}

Bullets.prototype.duration = 500;
