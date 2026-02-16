Button.moveHandler = function () {
    if (Button.callback == null) {
        Button.callback = 'move';
        $('div.GameLayer').attr('status', 'button');
    }
    else {
        $('div.GameLayer').removeAttr('status');
        Button.callback = null;
    }
};
Button.stopHandler = function () {
    Unit.allOurUnits().filter(function (chara) {
        return chara.selected;
    }).forEach(function (chara) {
        if (chara.attack) chara.stopAttack();
        chara.dock();
        delete chara._patrolRoute;
        if (chara.destination) {
            if (chara.destination.next) chara.destination.next = undefined;
            delete chara.destination;
        }
    });
};
Button.attackHandler = function () {
    if (Button.callback == null) {
        Button.callback = 'attack';
        $('div.GameLayer').attr('status', 'button');
    }
    else {
        $('div.GameLayer').removeAttr('status');
        Button.callback = null;
    }
};
Button.patrolHandler = function () {
    if (Button.callback == null) {
        Button.callback = 'patrol';
        $('div.GameLayer').attr('status', 'button');
    }
    else {
        $('div.GameLayer').removeAttr('status');
        Button.callback = null;
    }
};
Button.gatherHandler = function () {
    if (Button.callback == null) {
        Button.callback = function (location) {
            var target;
            var mx = location.x;
            var my = location.y;
            var minerals = Game.getInRangeOnes(mx, my, 55, false, true, false, function (chara) {
                return (typeof Neutral !== 'undefined' && chara instanceof Neutral.Mineral);
            });
            if ((!minerals || !minerals.length) && Game.getInRangeOnes) {
                minerals = Game.getInRangeOnes(mx, my, 180, false, true, false, function (chara) {
                    return (typeof Neutral !== 'undefined' && chara instanceof Neutral.Mineral);
                });
            }
            if (minerals && minerals.length) {
                minerals.sort(function (a, b) {
                    var dax = mx - a.posX(), day = my - a.posY();
                    var dbx = mx - b.posX(), dby = my - b.posY();
                    return dax * dax + day * day - (dbx * dbx + dby * dby);
                });
                target = minerals[0];
            }
            else {
                if (GameMap && GameMap._spawnMineralNear) {
                    var spawned = GameMap._spawnMineralNear(mx, my);
                    if (spawned) target = spawned;
                }
            }
            if (!(target instanceof Gobj) && Game.getInRangeOnes) {
                var gasBuildings = Game.getInRangeOnes(mx, my, 120, false, false, null, function (chara) {
                    return (chara instanceof Building) && !chara.isEnemy &&
                        (['Refinery', 'Extractor', 'Assimilator'].indexOf(chara.name) !== -1);
                });
                if (gasBuildings && gasBuildings.length) {
                    gasBuildings.sort(function (a, b) {
                        var dax = mx - a.posX(), day = my - a.posY();
                        var dbx = mx - b.posX(), dby = my - b.posY();
                        return dax * dax + day * day - (dbx * dbx + dby * dby);
                    });
                    target = gasBuildings[0];
                }
            }
            if (!(target instanceof Gobj)) {
                target = Game.getSelectedOne(location.x, location.y, null, null, null, function (chara) {
                    return (chara instanceof Building) && (['Refinery', 'Extractor', 'Assimilator'].indexOf(chara.name) !== -1);
                });
            }
            if (!(target instanceof Gobj)) {
                if (Referee && Referee.voice && Referee.voice.pError) Referee.voice.pError.play();
                return;
            }
            Unit.allOurUnits().filter(function (chara) {
                return chara.selected && (chara.name == 'SCV' || chara.name == 'Drone' || chara.name == 'Probe');
            }).forEach(function (worker) {
                var isShift = keyController && keyController.shift;
                var isBusy = (worker.status !== 'dock' || worker.routingTimer || (worker.attack && worker.target && worker.target.status !== 'dead') || worker.gatherTimer);
                if (isShift && isBusy && worker.commandQueue) {
                    worker.commandQueue.push({ type: 'gather', target: target });
                }
                else {
                    if (worker.gather) worker.gather(target);
                }
            });
        };
        $('div.GameLayer').attr('status', 'button');
    }
    else {
        $('div.GameLayer').removeAttr('status');
        Button.callback = null;
    }
};
Button.holdHandler = function () {
    Button.stopHandler();
    Unit.allOurUnits().filter(function (chara) {
        return chara.selected;
    }).forEach(function (chara) {
        if (chara.hold) {
            delete chara.AI;
            delete chara.findNearbyTargets;
            delete chara.hold;
            Button.reset();
        }
        else {
            chara.AI = Building.Attackable.prototypePlus.AI;
            chara.findNearbyTargets = Building.Attackable.prototypePlus.findNearbyTargets;
            chara.dock();
            chara.hold = true;
            Button.reset();
        }
    });
};
Button.execute = function (event) {
    switch (Button.callback) {
        case 'move':
            mouseController.rightClick(event);
            break;
        case 'attack':
            mouseController.rightClick(event, true);
            break;
        case 'patrol':
            mouseController.rightClick(event, true);
            break;
        default:
            if (typeof (Button.callback) == 'function') {
                var offset = $('#frontCanvas').offset();
                var clickX = event.pageX - offset.left;
                var clickY = event.pageY - offset.top;
                var location = { x: clickX + GameMap.offsetX, y: clickY + GameMap.offsetY };
                new Burst.RightClickCursor(location);
                Button.callback(location);
            }
    }
    $('div.GameLayer').removeAttr('status');
    Button.callback = null;
};
