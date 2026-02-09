var mouseController = {
    down: false,
    drag: false,
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 0, y: 0 },
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
    leftClick: function (event) {
        if (window.Game && Game.isPaused) return;
        if (window.Game && Game.metrics) Game.metrics._lastInputAt = (window.performance && performance.now) ? performance.now() : Date.now();
        //Mouse at (clickX,clickY)
        var offset = $('#frontCanvas').offset();
        var clickX = event.pageX - offset.left;
        var clickY = event.pageY - offset.top;
        //Intercept event inside infoBox
        if (clickY > Game.infoBox.y) return;
        //Selection mode
        if (Button.callback == null) {
            //Find selected one, convert position
            var selectedOne = Game.getSelectedOne(clickX + GameMap.offsetX, clickY + GameMap.offsetY);
            //Cannot select enemy invisible unit
            if (selectedOne.isInvisible && selectedOne.isEnemy) return;
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
                if (selectedOne.isEnemy || Game.selectedUnit.isEnemy)
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
        if (window.Game && Game.metrics) Game.metrics._lastInputAt = (window.performance && performance.now) ? performance.now() : Date.now();
        //Mouse at (clickX,clickY)
        var offset = $('#frontCanvas').offset();
        var clickX = event.pageX - offset.left;
        var clickY = event.pageY - offset.top;
        //Intercept event inside infoBox
        if (clickY > Game.infoBox.y) return;
        //Show right click cursor
        new Burst.RightClickCursor({ x: clickX + GameMap.offsetX, y: clickY + GameMap.offsetY });
        if (Game.hapticsEnabled && navigator.vibrate) navigator.vibrate(15);
        //Find selected one or nothing
        var selectedEnemy = Game.getSelectedOne(clickX + GameMap.offsetX, clickY + GameMap.offsetY, true);//isEnemy
        //If no enemy found, check for Neutral units (Minerals)
        if (!selectedEnemy.id) {
            selectedEnemy = Game.getSelectedOne(clickX + GameMap.offsetX, clickY + GameMap.offsetY, false, false, null, function (chara) {
                return chara instanceof Neutral.Mineral;
            });
        }
        Unit.allOurUnits().concat(Building.ourBuildings).forEach(function (chara) {
            //Cannot control dead man
            if (chara.status == "dead") return;
            //Control chara moving if it's selected
            if (chara.selected) {
                //Sound effect
                if (chara.sound.moving) chara.sound.moving.play();
                //Interrupt old destination routing
                if (chara.destination) {
                    //Break possible dead lock
                    if (chara.destination.next) chara.destination.next = null;
                    delete chara.destination;
                }
                //Cancel possible hold
                if (chara.hold) {
                    delete chara.AI;
                    delete chara.findNearbyTargets;
                    delete chara.hold;
                    Button.reset();
                }
                //Unit cannot attack will always choose move mode
                var attackOrMove = (chara.attack) ? (selectedEnemy instanceof Gobj) : false;
                //Attack mode
                if (attackOrMove) {
                    if (chara.cannotMove() && !(chara.isInAttackRange(selectedEnemy))) return;
                    //Intercept invisible enemy
                    if (selectedEnemy.isInvisible) {
                        Referee.voice.pError.play();
                        return;
                    }
                    chara.targetLock = true;
                    chara.attack(selectedEnemy);
                }
                //Gather mode
                else if (selectedEnemy instanceof Neutral.Mineral && chara.name == 'SCV') {
                    if (chara.gather) chara.gather(selectedEnemy);
                }
                //Move mode
                else {
                    if (chara.cannotMove()) return;
                    //Only attackable units can stop attack
                    if (chara.attack) chara.stopAttack();
                    //Lock destination by default
                    chara.targetLock = !unlock;
                    chara.moveTo(clickX + GameMap.offsetX, clickY + GameMap.offsetY);
                    //Record destination
                    if (Button.callback == 'attack') {
                        chara.destination = { x: clickX + GameMap.offsetX, y: clickY + GameMap.offsetY };
                    }
                    if (Button.callback == 'patrol') {
                        //Patrol dead lock
                        chara.destination = { x: clickX + GameMap.offsetX, y: clickY + GameMap.offsetY };
                        chara.destination.next = { x: chara.posX(), y: chara.posY(), next: chara.destination };
                    }
                }
            }
        });
    },
    dblClick: function () {
        if (window.Game && Game.isPaused) return;
        if (window.Game && Game.metrics) Game.metrics._lastInputAt = (window.performance && performance.now) ? performance.now() : Date.now();
        //Multi select same type units
        if (!Game.selectedUnit.isEnemy) {
            var charas = Unit.allOurUnits().filter(function (chara) {
                return (chara.insideScreen()) && (chara.name == Game.selectedUnit.name);
            });
            Game.addIntoAllSelected(charas);
        }
    },
    //Can control all units
    toControlAll: function () {
        //Mouse left click
        $('#frontCanvas')[0].onclick = function (event) {
            event.preventDefault();
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
            event.preventDefault();
            mouseController.rightClick(event);
            //Cancel pointer
            $('div.GameLayer').removeAttr('status');
            //Cancel callback
            Button.callback = null;
            //Cancel credit bill
            if (Resource.creditBill) delete Resource.creditBill;
        };
        //Double click
        $('#frontCanvas').on('dblclick', function (event) {
            event.preventDefault();
            mouseController.dblClick();
        });
        //Mouse click start
        $('#frontCanvas')[0].onmousedown = function (event) {
            event.preventDefault();
            if (!mouseController.down) {
                //Mouse at (clickX,clickY)
                var clickX = event.pageX - $('#frontCanvas').offset().left;
                var clickY = event.pageY - $('#frontCanvas').offset().top;
                mouseController.startPoint = { x: clickX, y: clickY };
                mouseController.down = true;
            }
        };
        //Mouse drag
        $('#frontCanvas')[0].onmousemove = function (event) {
            event.preventDefault();
            //Mouse at (clickX,clickY)
            var clickX = event.pageX - $('#frontCanvas').offset().left;
            var clickY = event.pageY - $('#frontCanvas').offset().top;
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
            event.preventDefault();
            if (window.Game && Game.isPaused) return;
            //Mouse at (clickX,clickY)
            var clickX = event.clientX;
            var clickY = event.clientY;
            //Refresh
            if (clickX < GameMap.triggerMargin) GameMap.needRefresh = "LEFT";
            if (clickX > (Game.HBOUND - GameMap.triggerMargin)) GameMap.needRefresh = "RIGHT";
            if (clickY < GameMap.triggerMargin) GameMap.needRefresh = "TOP";
            if (clickY > (Game.VBOUND - GameMap.triggerMargin)) GameMap.needRefresh = "BOTTOM";
        };
        //Mouse click end
        $('#frontCanvas')[0].onmouseup = function (event) {
            event.preventDefault();
            mouseController.down = false;
            if (mouseController.drag) {
                //Multi select inside rect
                Game.multiSelectInRect();
            }
        };
        //For mobile
        $('#frontCanvas')[0].ontouchstart = function (event) {
            event.preventDefault();
            if (window.Game && Game.isPaused) return;
            if (!event.touches || event.touches.length == 0) return;
            if (event.touches.length > 1) {
                $('#frontCanvas')[0].onclick = undefined;
                $('#frontCanvas')[0].oncontextmenu = undefined;
                mouseController.rightClick(event.touches[0]);
                return;
            }
            var touch = event.touches[0];
            var clickX = touch.pageX - $('#frontCanvas').offset().left;
            var clickY = touch.pageY - $('#frontCanvas').offset().top;
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
            event.preventDefault();
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
            var clickX = touch.pageX - $('#frontCanvas').offset().left;
            var clickY = touch.pageY - $('#frontCanvas').offset().top;
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
            event.preventDefault();
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
            var clickX = touch.pageX - $('#frontCanvas').offset().left;
            var clickY = touch.pageY - $('#frontCanvas').offset().top;
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
            event.preventDefault();
        });
        $('canvas[name="mini_map"]').on('click', function (event) {
            event.preventDefault();
            GameMap.clickHandler(event);
        });
        $('canvas[name="mini_map"]').on('contextmenu', function (event) {
            event.preventDefault();
            GameMap.dblClickHandler(event);
        });
    }
};
