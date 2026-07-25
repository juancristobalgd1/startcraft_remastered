import '../Utils/jquery.min.js';
import Game from '../GameRule/Games/core/GameBase.js';
import GameMap from '../Characters/Map.js';
import Button from '../Characters/Buttons/core/ButtonBase.js';
import Resource from '../GameRule/Resource.js';
import Gobj from '../Characters/Gobj.js';
import Unit from '../Characters/Units/core/UnitBase.js';
import Building from '../Characters/Buildings/core/BuildingBase.js';
import Burst from '../Characters/Bursts/core/BurstBase.js';
import keyController from './keyController.js';

const $ = globalThis.$;

var mouseController = {
    down: false,
    drag: false,
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 0, y: 0 },
    _frontOffset: null,
    _updateFrontOffset: function () {
        var off = $('#frontCanvas').offset();
        mouseController._frontOffset = off || { left: 0, top: 0 };
        return mouseController._frontOffset;
    },
    _frontOffsetAt: function () {
        return mouseController._frontOffset || mouseController._updateFrontOffset();
    },
    _touch: {
        id: null,
        down: false,
        drag: false,
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 0, y: 0 },
        longPressTimer: null,
        lastTapAt: 0,
        lastTapPos: null
    },
    isMultiSelect: function () {
        return keyController.shift;
    },
    isJoinTeam: function () {
        return keyController.ctrl;
    },
    _clientPos: null,
    edgeScrollTick: function () {
        if (window.Game && Game.isPaused) return;
        if (mouseController.down || mouseController.drag) return;
        if (GameMap.needRefresh) return;
        if (!mouseController._clientPos) return;
        var canvas = $('#frontCanvas')[0];
        if (!canvas || !canvas.getBoundingClientRect) return;
        var rect = canvas.getBoundingClientRect();
        var x = mouseController._clientPos.x - rect.left;
        var y = mouseController._clientPos.y - rect.top;
        var viewH = Game.VBOUND - Game.infoBox.height + 5;
        if (x < 0 || y < 0 || x > Game.HBOUND || y > viewH) {
            GameMap._dynamicSpeed = undefined;
            return;
        }

        var m = GameMap.triggerMargin;
        var left = x;
        var right = Game.HBOUND - x;
        var top = y;
        var bottom = viewH - y;
        var minDist = Math.min(left, right, top, bottom);
        if (minDist >= m) {
            GameMap._dynamicSpeed = undefined;
            return;
        }

        var ratio = (m - minDist) / m;
        GameMap._dynamicSpeed = (10 + ratio * 30) >> 0;
        if (minDist === left) GameMap.needRefresh = "LEFT";
        else if (minDist === right) GameMap.needRefresh = "RIGHT";
        else if (minDist === top) GameMap.needRefresh = "TOP";
        else GameMap.needRefresh = "BOTTOM";
    },
    leftClick: function (event) {
        if (window.Game && Game.isPaused) return;
        if (window.Game && Game.metrics) Game.metrics._lastInputAt = (window.performance && performance.now) ? performance.now() : Date.now();
        //Mouse at (clickX,clickY)
        var offset = mouseController._frontOffsetAt();
        var clickX = event.pageX - offset.left;
        var clickY = event.pageY - offset.top;
        //Intercept event inside infoBox
        if (clickY > Game.infoBox.y) return;
        //Selection mode
        if (Button.callback == null) {
            //Find selected one, convert position
            var selectedOne = Game.getSelectedOne(clickX + GameMap.offsetX, clickY + GameMap.offsetY);
            //Cannot select enemy invisible unit
            if (selectedOne && selectedOne.isInvisible && selectedOne.isEnemy) return;
            //Single select will unselect all units and only choose selected one
            //Multi select will keep selected status and do nothing
            if (!mouseController.isMultiSelect())
                Game.unselectAll();
            //If has selected one
            if (selectedOne instanceof Gobj) {
                //Sound effect
                selectedOne.sound.selected.play();
                if (Game.hapticsEnabled && navigator.vibrate) navigator.vibrate(10);
                //Cannot multiSelect with enemy
                if (selectedOne.isEnemy || (Game.selectedUnit && Game.selectedUnit.isEnemy))
                    Game.unselectAll();
                //Only selected one to show portrait
                Game.changeSelectedTo(selectedOne);
                //Add into allSelected if not included
                Game.addIntoAllSelected(selectedOne);
            }
            else {
                //Click null
                Game.changeSelectedTo({});
                Game.unselectAll();
            }
        }
        //Button mode
        else {
            //Callback
            Button.execute(event);
        }
    },
    rightClick: function (event, unlock) {
        if (window.Game && Game.isPaused) return;
        if (window.Game && Game.replayFlag) return;
        if (window.Game && Game.metrics) Game.metrics._lastInputAt = (window.performance && performance.now) ? performance.now() : Date.now();
        //Mouse at (clickX,clickY)
        var offset = mouseController._frontOffsetAt();
        var clickX = event.pageX - offset.left;
        var clickY = event.pageY - offset.top;
        //Intercept event inside infoBox
        if (clickY > Game.infoBox.y) return;

        var uids = [];
        Unit.allOurUnits().concat(Building.ourBuildings).forEach(function (chara) {
            if (chara.status != "dead" && chara.selected) {
                uids.push(chara.id);
            }
        });
        if (globalThis.Multiplayer && !Game.replayFlag && uids.length > 0) {
            var mx = clickX + GameMap.offsetX;
            var my = clickY + GameMap.offsetY;
            var cmd = {
                type: 'rightClick',
                uids: uids,
                pos: { x: mx, y: my },
                unlock: unlock,
                btn: Button.callback
            };
            if (globalThis.Multiplayer.ON) {
                globalThis.Multiplayer.sendLocalCommand(cmd);
                new Burst.RightClickCursor({ x: clickX + GameMap.offsetX, y: clickY + GameMap.offsetY });
                if (Game.hapticsEnabled && navigator.vibrate) navigator.vibrate(15);
                return;
            } else {
                if (!Game.replay.cmds[Game._clock]) Game.replay.cmds[Game._clock] = [];
                Game.replay.cmds[Game._clock].push(JSON.stringify(cmd));
            }
        }

        //Show right click cursor
        new Burst.RightClickCursor({ x: clickX + GameMap.offsetX, y: clickY + GameMap.offsetY });
        if (Game.hapticsEnabled && navigator.vibrate) navigator.vibrate(15);
        //Find selected one or nothing
        var selectedTarget = Game.getSelectedOne(clickX + GameMap.offsetX, clickY + GameMap.offsetY, true);//isEnemy
        var hasSelectedWorker = Unit.allOurUnits().some(function (u) {
            return u && u.selected && (u.name == 'SCV' || u.name == 'Drone' || u.name == 'Probe');
        });
        if (!(selectedTarget instanceof Gobj) && hasSelectedWorker) {
            var mx = clickX + GameMap.offsetX;
            var my = clickY + GameMap.offsetY;
            var minerals = Game.getInRangeOnes(mx, my, 55, false, true, false, function (chara) {
                return chara instanceof Neutral.Mineral;
            });
            if (minerals && minerals.length) {
                minerals.sort(function (a, b) {
                    var dax = mx - a.posX(), day = my - a.posY();
                    var dbx = mx - b.posX(), dby = my - b.posY();
                    return dax * dax + day * day - (dbx * dbx + dby * dby);
                });
                selectedTarget = minerals[0];
            }
            else {
                if (GameMap && GameMap._spawnMineralNear) {
                    var spawned = GameMap._spawnMineralNear(mx, my);
                    if (spawned) selectedTarget = spawned;
                }
            }
        }
        if (!(selectedTarget instanceof Gobj)) {
            selectedTarget = Game.getSelectedOne(clickX + GameMap.offsetX, clickY + GameMap.offsetY, false, false, null, function (chara) {
                return (chara instanceof Building) && (['Refinery', 'Extractor', 'Assimilator'].indexOf(chara.name) !== -1);
            });
        }
        Unit.allOurUnits().concat(Building.ourBuildings).forEach(function (chara) {
            //Cannot control dead man
            if (chara.status == "dead") return;
            //Control chara moving if it's selected
            if (chara.selected) {
                //Sound effect
                if (chara.sound && chara.sound.moving) chara.sound.moving.play();
                var isShift = keyController.shift;
                if (!isShift && chara.commandQueue) chara.commandQueue = [];
                var isBusy = (chara.status !== 'dock' || chara.routingTimer || (chara.attack && chara.target && chara.target.status !== 'dead') || chara.gatherTimer);
                var detachGather = function () {
                    if (chara._gather && chara._gather.target && chara._gather.target._gatherers) {
                        var list = chara._gather.target._gatherers;
                        var idx = list.indexOf(chara);
                        if (idx !== -1) list.splice(idx, 1);
                        if (list.length === 0) delete chara._gather.target._gatherers;
                    }
                };
                //Cancel possible hold
                if (chara.hold) {
                    delete chara.AI;
                    delete chara.findNearbyTargets;
                    delete chara.hold;
                    Button.reset();
                }
                if (chara instanceof Building && !chara.isEnemy && chara.items) {
                    var canRally = Object.keys(chara.items).some(function (k) {
                        return chara.items[k] && chara.items[k].name == 'SetRallyPoint';
                    });
                    if (canRally && !(selectedTarget && selectedTarget.isEnemy)) {
                        var rx = clickX + GameMap.offsetX;
                        var ry = clickY + GameMap.offsetY;
                        if (selectedTarget instanceof Gobj && !selectedTarget.isEnemy) {
                            rx = selectedTarget.posX();
                            ry = selectedTarget.posY();
                        }
                        if (isShift && chara.rallyPoint) {
                            var tail = chara.rallyPoint;
                            while (tail.next) tail = tail.next;
                            tail.next = { x: rx, y: ry };
                        }
                        else {
                            chara.rallyPoint = { x: rx, y: ry };
                        }
                        return;
                    }
                }
                //Gather mode (priority over attack)
                if ((selectedTarget instanceof Neutral.Mineral ||
                    ((selectedTarget instanceof Building) && (['Refinery', 'Extractor', 'Assimilator'].indexOf(selectedTarget.name) !== -1)))
                    && (chara.name == 'SCV' || chara.name == 'Drone' || chara.name == 'Probe')) {
                    delete chara._patrolRoute;
                    if (isShift && isBusy) {
                        chara.commandQueue.push({ type: 'gather', target: selectedTarget });
                    }
                    else {
                        if (chara.gather) chara.gather(selectedTarget);
                    }
                    return;
                }
                //Unit cannot attack will always choose move mode
                var attackOrMove = (chara.attack) ? (selectedTarget instanceof Gobj && selectedTarget.isEnemy) : false;
                //Attack mode
                if (attackOrMove) {
                    delete chara._patrolRoute;
                    if (isShift && isBusy) {
                        chara.commandQueue.push({ type: 'attack', target: selectedTarget });
                    }
                    else {
                        if (chara.gatherTimer) {
                            clearInterval(chara.gatherTimer);
                            chara.gatherTimer = 0;
                            detachGather();
                            if (chara._gather) delete chara._gather;
                        }

                        //Intercept invisible enemy
                        if (selectedTarget.isInvisible && !selectedTarget.isEnemy) {
                            Referee.voice.pError.play();
                            return;
                        }
                        chara.targetLock = true;
                        chara.attack(selectedTarget);
                    }
                }
                //Move mode
                else {
                    var mx = clickX + GameMap.offsetX;
                    var my = clickY + GameMap.offsetY;
                    if (isShift && isBusy) {
                        if (Button.callback != 'patrol') delete chara._patrolRoute;
                        var type = (Button.callback == 'patrol') ? 'patrol' : 'move';
                        chara.commandQueue.push({ type: type, x: mx, y: my });
                    }
                    else {
                        if (chara.gatherTimer) {
                            clearInterval(chara.gatherTimer);
                            chara.gatherTimer = 0;
                            detachGather();
                            if (chara._gather) delete chara._gather;
                        }
                        if (chara.cannotMove()) return;
                        //Only attackable units can stop attack
                        if (chara.attack) chara.stopAttack();
                        //Lock destination by default
                        chara.targetLock = !unlock;
                        chara.moveTo(mx, my);
                        //Record destination
                        if (Button.callback == 'attack') {
                            delete chara._patrolRoute;
                            chara.destination = { x: mx, y: my };
                        }
                        if (Button.callback == 'patrol') {
                            //Patrol dead lock
                            var loop = { x: mx, y: my };
                            loop.next = { x: chara.posX(), y: chara.posY(), next: loop };
                            chara.destination = loop;
                            chara._patrolRoute = loop;
                        }
                        if (Button.callback != 'patrol' && Button.callback != 'attack') delete chara._patrolRoute;
                    }
                }
            }
        });
    },
    dblClick: function (event) {
        if (window.Game && Game.isPaused) return;
        if (window.Game && Game.metrics) Game.metrics._lastInputAt = (window.performance && performance.now) ? performance.now() : Date.now();
        if (Button.callback != null) return;
        var unit = null;
        if (event && event.pageX != null && event.pageY != null) {
            var offset = mouseController._frontOffsetAt();
            var clickX = event.pageX - offset.left;
            var clickY = event.pageY - offset.top;
            unit = Game.getSelectedOne(clickX + GameMap.offsetX, clickY + GameMap.offsetY, false, true);
        }
        if (!(unit instanceof Unit)) unit = Game.selectedUnit;
        if (!(unit instanceof Unit) || unit.isEnemy || unit.status === 'dead') return;

        var sameType = Unit.allOurUnits().filter(function (chara) {
            return chara.status !== 'dead' && chara.name === unit.name && chara.insideScreen();
        });
        if (!sameType.length) return;

        if (!mouseController.isMultiSelect()) Game.unselectAll();
        Game.addIntoAllSelected(sameType);
        Game.changeSelectedTo(sameType[0]);
        if (sameType[0].sound && sameType[0].sound.selected) sameType[0].sound.selected.play();
    },
    //Can control all units
    toControlAll: function () {
        mouseController._updateFrontOffset();
        //Mouse left click
        $('#frontCanvas')[0].onclick = function (event) {
            if (event && event.cancelable && event.preventDefault) event.preventDefault();
            if (mouseController.drag) {
                //End drag, onclick triggered after onmouseup, don't do default left click action
                mouseController.drag = false;
            }
            else {
                mouseController.leftClick(event);
            }
        };
        //Mouse right click
        $('#frontCanvas')[0].oncontextmenu = function (event) {
            //Prevent context menu show
            if (event && event.cancelable && event.preventDefault) event.preventDefault();
            mouseController.rightClick(event);
            //Cancel pointer
            $('div.GameLayer').removeAttr('status');
            //Cancel callback
            Button.callback = null;
            //Cancel credit bill
            if (Game.allSelected) {
                Game.allSelected.forEach(function (chara) {
                    if (chara.creditBill) delete chara.creditBill;
                });
            }
        };
        //Double click
        $('#frontCanvas').on('dblclick', function (event) {
            if (event && event.cancelable && event.preventDefault) event.preventDefault();
            mouseController.dblClick(event);
        });
        //Mouse click start
        $('#frontCanvas')[0].onmousedown = function (event) {
            if (event && event.cancelable && event.preventDefault) event.preventDefault();
            if (!mouseController.down) {
                //Mouse at (clickX,clickY)
                var offset = mouseController._frontOffsetAt();
                var clickX = event.pageX - offset.left;
                var clickY = event.pageY - offset.top;
                mouseController.startPoint = { x: clickX, y: clickY };
                mouseController.down = true;
            }
        };
        //Mouse drag
        $('#frontCanvas')[0].onmousemove = function (event) {
            if (event && event.cancelable && event.preventDefault) event.preventDefault();
            //Mouse at (clickX,clickY)
            var offset = mouseController._frontOffsetAt();
            var clickX = event.pageX - offset.left;
            var clickY = event.pageY - offset.top;
            if (mouseController.down) {
                mouseController.endPoint = { x: clickX, y: clickY };
                if (Math.abs(clickX - mouseController.startPoint.x) > 5 &&
                    Math.abs(clickY - mouseController.startPoint.y) > 5) {
                    mouseController.drag = true;
                }
            }
        };
        //Global client refresh map
        window.onmousemove = function (event) {
            if (event && event.cancelable && event.preventDefault) event.preventDefault();
            if (window.Game && Game.isPaused) return;
            mouseController._clientPos = { x: event.clientX, y: event.clientY };
        };
        //Mouse click end
        $('#frontCanvas')[0].onmouseup = function (event) {
            if (event && event.cancelable && event.preventDefault) event.preventDefault();
            mouseController.down = false;
            if (mouseController.drag) {
                //Multi select inside rect
                Game.multiSelectInRect();
            }
        };
        //For mobile
        $('#frontCanvas')[0].ontouchstart = function (event) {
            if (event && event.cancelable && event.preventDefault) event.preventDefault();
            if (window.Game && Game.isPaused) return;
            if (!event.touches || event.touches.length == 0) return;
            if (event.touches.length > 1) {
                $('#frontCanvas')[0].onclick = undefined;
                $('#frontCanvas')[0].oncontextmenu = undefined;
                mouseController.rightClick(event.touches[0]);
                return;
            }
            var touch = event.touches[0];
            var offset = mouseController._frontOffsetAt();
            var clickX = touch.pageX - offset.left;
            var clickY = touch.pageY - offset.top;
            mouseController.startPoint = { x: clickX, y: clickY };
            mouseController.endPoint = { x: clickX, y: clickY };
            mouseController.down = true;
            mouseController._touch.id = touch.identifier;
            mouseController._touch.down = true;
            mouseController._touch.drag = false;
            mouseController._touch.startPoint = { x: clickX, y: clickY };
            mouseController._touch.endPoint = { x: clickX, y: clickY };
            if (mouseController._touch.longPressTimer) clearTimeout(mouseController._touch.longPressTimer);
            mouseController._touch.longPressTimer = setTimeout(function () {
                if (mouseController._touch.down && !mouseController._touch.drag) {
                    mouseController._touch.down = false;
                    $('#frontCanvas')[0].onclick = undefined;
                    $('#frontCanvas')[0].oncontextmenu = undefined;
                    mouseController.rightClick(touch);
                }
            }, 350);
        };
        $('#frontCanvas')[0].ontouchmove = function (event) {
            if (event && event.cancelable && event.preventDefault) event.preventDefault();
            if (window.Game && Game.isPaused) return;
            if (!mouseController._touch.down) return;
            var touch = null;
            for (var i = 0; i < event.touches.length; i++) {
                if (event.touches[i].identifier === mouseController._touch.id) {
                    touch = event.touches[i];
                    break;
                }
            }
            if (!touch) return;
            var offset = mouseController._frontOffsetAt();
            var clickX = touch.pageX - offset.left;
            var clickY = touch.pageY - offset.top;
            mouseController.startPoint = mouseController._touch.startPoint;
            mouseController.endPoint = { x: clickX, y: clickY };
            mouseController._touch.endPoint = { x: clickX, y: clickY };
            if (Math.abs(clickX - mouseController._touch.startPoint.x) > 8 ||
                Math.abs(clickY - mouseController._touch.startPoint.y) > 8) {
                mouseController._touch.drag = true;
                mouseController.drag = true;
                if (mouseController._touch.longPressTimer) {
                    clearTimeout(mouseController._touch.longPressTimer);
                    mouseController._touch.longPressTimer = null;
                }
            }
        };
        $('#frontCanvas')[0].ontouchend = function (event) {
            //Prevent context menu show
            if (event && event.cancelable && event.preventDefault) event.preventDefault();
            if (window.Game && Game.isPaused) return;
            if (mouseController._touch.longPressTimer) {
                clearTimeout(mouseController._touch.longPressTimer);
                mouseController._touch.longPressTimer = null;
            }
            var touch = (event.changedTouches && event.changedTouches[0]) ? event.changedTouches[0] : null;
            mouseController._touch.down = false;
            mouseController.down = false;
            mouseController.drag = mouseController._touch.drag;
            if (!touch) return;
            var offset = mouseController._frontOffsetAt();
            var clickX = touch.pageX - offset.left;
            var clickY = touch.pageY - offset.top;
            mouseController.endPoint = { x: clickX, y: clickY };
            if (mouseController._touch.drag) {
                mouseController._touch.drag = false;
                mouseController.drag = false;
                Game.multiSelectInRect();
                return;
            }
            var now = (window.performance && performance.now) ? performance.now() : Date.now();
            var last = mouseController._touch.lastTapAt;
            var lastPos = mouseController._touch.lastTapPos;
            mouseController._touch.lastTapAt = now;
            mouseController._touch.lastTapPos = { x: clickX, y: clickY };
            if (last && (now - last) < 250 && lastPos &&
                Math.abs(clickX - lastPos.x) < 20 && Math.abs(clickY - lastPos.y) < 20) {
                var selectedOne = Game.getSelectedOne(clickX + GameMap.offsetX, clickY + GameMap.offsetY);
                if (selectedOne instanceof Gobj) {
                    mouseController.leftClick(touch);
                    mouseController.dblClick();
                    GameMap.relocateAt(selectedOne.posX(), selectedOne.posY());
                }
                else {
                    GameMap.relocateAt(clickX + GameMap.offsetX, clickY + GameMap.offsetY);
                }
                return;
            }
            $('#frontCanvas')[0].onclick = undefined;
            mouseController.leftClick(touch);
        };

        $('div#GamePlay div').on('contextmenu', function (event) {
            if (event && event.cancelable && event.preventDefault) event.preventDefault();
        });
        $('canvas[name="mini_map"]').on('click', function (event) {
            if (event && event.cancelable && event.preventDefault) event.preventDefault();
            GameMap.clickHandler(event);
        });
        $('canvas[name="mini_map"]').on('contextmenu', function (event) {
            if (event && event.cancelable && event.preventDefault) event.preventDefault();
            GameMap.dblClickHandler(event);
        });
    }
};

// Global assignment for legacy compatibility
if (typeof window !== 'undefined') {
    window.mouseController = mouseController;
}

export default mouseController;
