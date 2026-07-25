Referee.judgeReachDestination = function (chara) {
    if (chara.isIdle() && chara.destination) {
        if (chara.insideSquare({ centerX: chara.destination.x, centerY: chara.destination.y, radius: Unit.moveRange })) {
            if (chara.destination.next) {
                chara.destination = chara.destination.next;
                chara.moveTo(chara.destination.x, chara.destination.y);
                chara.targetLock = false;
            }
            else {
                delete chara.destination;
            }
        }
        else {
            chara.moveTo(chara.destination.x, chara.destination.y);
            chara.targetLock = false;
        }
    }
};
Referee.judgeRecover = function () {
    if (Game._clock % 10 == 0) {
        Unit.allUnits.concat(Building.allBuildings).forEach((chara) => {
            if (chara.recover) chara.recover();
        });
    }
};
Referee.judgeDying = function () {
    if (Game._clock % 10 == 0) {
        Unit.allUnits.concat(Building.allBuildings).filter(function (chara) {
            return chara.life <= 0 && chara.status != 'dead';
        }).forEach(function (chara) {
            chara.die();
        });
    }
};
Referee.judgeCollision = function () {
    var collideGround = function (chara1, chara2) {
        if (chara1._isMapResource || chara2._isMapResource) return;
        var dist = chara1.distanceFrom(chara2);
        var distLimit;
        if (chara2 instanceof Unit) {
            distLimit = (chara1.radius() + chara2.radius()) * 0.5;
            if (distLimit < Unit.meleeRange) distLimit = Unit.meleeRange;
        }
        else {
            distLimit = (chara1.radius() + chara2.radius()) * 0.8;
        }
        if (dist == 0) {
            var colPos = Referee._pos[Game.random() * 4 >> 0];
            if (chara1 instanceof Unit) {
                chara1.x += colPos[0];
                chara1.y += colPos[1];
                dist = 1;
            }
            else {
                if (chara2 instanceof Unit) {
                    chara2.x += colPos[0];
                    chara2.y += colPos[1];
                    dist = 1;
                }
            }
        }
        if (dist < distLimit) {
            chara1.collision = chara2;
            chara2.collision = chara1;
            var K = (distLimit - dist) / dist / 2;
            var adjustX = K * (chara1.x - chara2.x) >> 0;
            var adjustY = K * (chara1.y - chara2.y) >> 0;
            var interactRatio1 = 0;
            var interactRatio2 = 0;
            if (chara1 instanceof Building) {
                interactRatio1 = 0;
                if (chara2 instanceof Unit) interactRatio2 = 2;
                else interactRatio2 = 0;
            }
            else {
                if (chara2 instanceof Unit) {
                    if (chara1.status == "moving") {
                        if (chara2.status == "moving") {
                            interactRatio1 = 1;
                            interactRatio2 = 1;
                        }
                        else {
                            interactRatio1 = 2;
                            interactRatio2 = 0;
                        }
                    }
                    else {
                        if (chara2.status == "moving") {
                            interactRatio1 = 0;
                            interactRatio2 = 2;
                        }
                        else {
                            interactRatio1 = 1;
                            interactRatio2 = 1;
                        }
                    }
                }
                else {
                    interactRatio1 = 2;
                    interactRatio2 = 0;
                }
            }
            chara1.x += interactRatio1 * adjustX;
            chara1.y += interactRatio1 * adjustY;
            chara2.x -= interactRatio2 * adjustX;
            chara2.y -= interactRatio2 * adjustY;
        }
    };
    var collideFlying = function (chara1, chara2) {
        var dist = chara1.distanceFrom(chara2);
        var distLimit = Unit.meleeRange;
        if (dist == 0) {
            var colPos = Referee._pos[Game.random() * 4 >> 0];
            chara1.x += colPos[0];
            chara1.y += colPos[1];
            dist = 1;
        }
        if (dist < distLimit) {
            var K = (distLimit - dist) / dist / 2;
            var adjustX = K * (chara1.x - chara2.x) >> 0;
            var adjustY = K * (chara1.y - chara2.y) >> 0;
            chara1.x += adjustX;
            chara1.y += adjustY;
            chara2.x -= adjustX;
            chara2.y -= adjustY;
        }
    };
    var runSpatial = function (list, collide) {
        if (list.length < 60) {
            for (var N = 0; N < list.length; N++) {
                var chara1 = list[N];
                for (var M = N + 1; M < list.length; M++) {
                    collide(chara1, list[M]);
                }
            }
            return;
        }
        var cellSize = Unit.meleeRange * 3;
        var grid = {};
        for (var i = 0; i < list.length; i++) {
            var c = list[i];
            var cx = (c.x / cellSize) >> 0;
            var cy = (c.y / cellSize) >> 0;
            var key = cx + "," + cy;
            (grid[key] || (grid[key] = [])).push(c);
        }
        for (var i = 0; i < list.length; i++) {
            var chara1 = list[i];
            var cx = (chara1.x / cellSize) >> 0;
            var cy = (chara1.y / cellSize) >> 0;
            for (var dx = -1; dx <= 1; dx++) {
                for (var dy = -1; dy <= 1; dy++) {
                    var bucket = grid[(cx + dx) + "," + (cy + dy)];
                    if (!bucket) continue;
                    for (var j = 0; j < bucket.length; j++) {
                        var chara2 = bucket[j];
                        if (chara2.id <= chara1.id) continue;
                        collide(chara1, chara2);
                    }
                }
            }
        }
    };
    runSpatial(Unit.allGroundUnits().concat(Building.allBuildings), collideGround);
    runSpatial(Unit.allFlyingUnits(), collideFlying);
};
