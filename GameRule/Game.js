var Game = {
    level: 1,
    HBOUND: innerWidth,
    VBOUND: innerHeight,
    infoBox: {
        x: 145,
        y: innerHeight - 110,
        width: innerWidth - 295,
        height: 110
    },
    teams: {},
    cxt: $('#middleCanvas')[0].getContext('2d'),
    frontCxt: $('#frontCanvas')[0].getContext('2d'),
    backCxt: $('#backCanvas')[0].getContext('2d'),
    fogCxt: null, // Will be initialized
    _timer: -1,
    _loop: null,
    _frameInterval: 100,
    _clock: 0,
    isPaused: false,
    hapticsEnabled: false,
    reducedMotion: false,
    ui: {
        lastResource: { mine: null, gas: null, curMan: null, totalMan: null, manColor: null, supplyBlocked: null, supplyWarnAt: 0 },
        lastSelected: { life: null, shield: null, magic: null, kill: null, lifeColor: null },
        lastProcessing: { name: null, percent: null, visible: null, queueText: null },
        lastMetrics: { fps: null, inputMs: null, visible: false }
    },
    metrics: {
        enabled: false,
        _lastFrameAt: 0,
        _fps: 0,
        _lastInputAt: 0
    },
    perf: {
        cullMargin: 60,
        aiNearMargin: 180
    },
    uiScale: 'normal',
    fontScale: 'normal',
    pathfinding: {
        _tasks: {},
        _order: [],
        _maxPerTick: 80,
        _keyOf: function (unit) {
            return unit && unit.id != null ? String(unit.id) : null;
        },
        has: function (unit) {
            var key = Game.pathfinding._keyOf(unit);
            if (!key) return false;
            return Boolean(Game.pathfinding._tasks[key]);
        },
        _intervalTicksFor: function (unit) {
            if (!unit) return 2;
            if (unit.selected) return 1;
            if (Game._isVisible(unit, Game.perf.aiNearMargin)) return 1;
            var cx = GameMap.offsetX + (Game.HBOUND * 0.5);
            var cy = GameMap.offsetY + (Game.VBOUND * 0.5);
            var dx = Math.abs(unit.posX() - cx);
            var dy = Math.abs(unit.posY() - cy);
            if (dx > Game.HBOUND * 1.5 || dy > Game.VBOUND * 1.5) return 6;
            return 3;
        },
        reset: function () {
            Game.pathfinding._tasks = {};
            Game.pathfinding._order = [];
        },
        _cancelByKey: function (key) {
            if (!key) return;
            if (!Game.pathfinding._tasks[key]) return;
            delete Game.pathfinding._tasks[key];
            var idx = Game.pathfinding._order.indexOf(key);
            if (idx !== -1) Game.pathfinding._order.splice(idx, 1);
        },
        cancel: function (unit) {
            var key = Game.pathfinding._keyOf(unit);
            if (!key) return;
            if (!Game.pathfinding._tasks[key]) return;
            Game.pathfinding._cancelByKey(key);
            if (unit) unit.routingTimer = 0;
        },
        schedulePoint: function (unit, x, y, range, callback) {
            var key = Game.pathfinding._keyOf(unit);
            if (!key) return;
            var task = Game.pathfinding._tasks[key];
            if (!task) {
                task = { unit: unit };
                Game.pathfinding._tasks[key] = task;
                Game.pathfinding._order.push(key);
            }
            task.mode = 'point';
            task.x = x;
            task.y = y;
            task.range = range;
            task.callback = callback;
            task.nextAt = Game._clock;
            task.intervalTicks = Game.pathfinding._intervalTicksFor(unit);
            task._stuckCount = 0;
        },
        scheduleFollow: function (unit, target, range, callback) {
            var key = Game.pathfinding._keyOf(unit);
            if (!key) return;
            var task = Game.pathfinding._tasks[key];
            if (!task) {
                task = { unit: unit };
                Game.pathfinding._tasks[key] = task;
                Game.pathfinding._order.push(key);
            }
            task.mode = 'follow';
            task.target = target;
            task.range = range;
            task.callback = callback;
            task.nextAt = Game._clock;
            task.intervalTicks = Game.pathfinding._intervalTicksFor(unit);
            task._stuckCount = 0;
        },
        tick: function () {
            var now = Game._clock;
            var processed = 0;
            for (var i = 0; i < Game.pathfinding._order.length; i++) {
                if (processed >= Game.pathfinding._maxPerTick) break;
                var key = Game.pathfinding._order[i];
                var task = Game.pathfinding._tasks[key];
                if (!task) continue;
                var unit = task.unit;
                if (!unit || unit.status === 'dead') {
                    Game.pathfinding._cancelByKey(key);
                    i--;
                    continue;
                }
                if (task.nextAt != null && now < task.nextAt) continue;
                task.intervalTicks = Game.pathfinding._intervalTicksFor(unit);
                var tx = task.x, ty = task.y;
                if (task.mode === 'follow') {
                    if (!task.target || task.target.status === 'dead') {
                        Game.pathfinding._cancelByKey(key);
                        if (unit.dock) unit.dock();
                        i--;
                        continue;
                    }
                    tx = task.target.posX();
                    ty = task.target.posY();
                }
                if (unit.cannotMove && unit.cannotMove()) {
                    task.nextAt = now + task.intervalTicks;
                    processed++;
                    continue;
                }
                if (task.mode === 'point') {
                    if (task._lastUx == null) {
                        task._lastUx = unit.x;
                        task._lastUy = unit.y;
                        task._stuckCount = 0;
                    } else {
                        var dxu = Math.abs(unit.x - task._lastUx);
                        var dyu = Math.abs(unit.y - task._lastUy);
                        task._lastUx = unit.x;
                        task._lastUy = unit.y;
                        if (unit.status === 'moving' && dxu < 1 && dyu < 1) task._stuckCount++;
                        else task._stuckCount = 0;
                    }
                    if (task._stuckCount >= 6) {
                        tx = tx + ((Math.random() * 96) - 48);
                        ty = ty + ((Math.random() * 96) - 48);
                        task._stuckCount = 0;
                    }
                }
                var reached = unit.navigateTo(tx, ty, task.range);
                if (reached) {
                    var cb = task.callback;
                    Game.pathfinding._cancelByKey(key);
                    i--;
                    if (typeof cb === 'function') cb();
                } else {
                    task.nextAt = now + task.intervalTicks;
                }
                processed++;
            }
        }
    },
    selectedUnit: {},
    allSelected: [],
    _oldAllSelected: [],
    addIntoAllSelected: function (chara, override) {
        if (chara instanceof Gobj) {
            if (Game.allSelected.indexOf(chara) == -1) {
                if (override) Game.allSelected = [chara];
                else Game.allSelected.push(chara);
                chara.selected = true;
            }
        }
        if (chara instanceof Array) {
            if (override) Game.allSelected = chara;
            else chara.forEach(function (char) {
                if (Game.allSelected.indexOf(char) == -1) Game.allSelected.push(char);
            });
            chara.forEach((char) => {
                char.selected = true;
            });
        }
        Game.allSelected.sort((chara1, chara2) => {
            const name1 = (chara1 instanceof Building) ? (chara1.inherited.name + '.' + chara1.name) : chara1.name;
            const name2 = (chara2 instanceof Building) ? (chara2.inherited.name + '.' + chara2.name) : chara2.name;
            return ([name1, name2].sort()[0] != name1) ? 1 : -1;
        });
        Referee.alterSelectionMode();
    },
    race: {
        selected: 'Terran',//Terran race by default
        choose: function (race) {
            this.selected = race;
            $('div#GamePlay').attr('race', race);
        }
    },
    layerSwitchTo: function (layerName) {
        $('div.GameLayer').hide();
        $('#' + layerName).show(); //show('slow')
    },
    togglePause: function () {
        if (Game.isPaused) Game.resume();
        else Game.pause();
    },
    pause: function () {
        Game.isPaused = true;
        keyController.disable = true;
        if (window._$ && _$.pauseAllAudio) _$.pauseAllAudio();
        Game.stopAnimation();
        var menu = document.getElementById('PauseMenu');
        if (menu) {
            menu.style.display = 'block';
            menu.setAttribute('aria-hidden', 'false');
        }
        var btn = document.getElementById('PauseButton');
        if (btn) btn.textContent = 'Resume';
        Game._syncPauseMenuOptions();
    },
    resume: function () {
        Game.isPaused = false;
        keyController.disable = false;
        if (window._$ && _$.resumeAllAudio) _$.resumeAllAudio();
        if (!Game._rafId && typeof Game._loop === 'function') {
            Game.metrics._lastFrameAt = 0;
            Game._lastLoopTime = 0;
            Game._rafId = requestAnimationFrame(Game._loop);
        }
        var menu = document.getElementById('PauseMenu');
        if (menu) {
            menu.style.display = 'none';
            menu.setAttribute('aria-hidden', 'true');
        }
        var btn = document.getElementById('PauseButton');
        if (btn) btn.textContent = 'Pause';
        Game._syncPauseMenuOptions();
    },
    setUiScale: function (scale) {
        if (!scale) return;
        Game.uiScale = scale;
        var gp = document.getElementById('GamePlay');
        if (gp) gp.setAttribute('data-ui-scale', scale);
        Game._syncPauseMenuOptions();
    },
    setFontScale: function (scale) {
        if (!scale) return;
        Game.fontScale = scale;
        var gp = document.getElementById('GamePlay');
        if (gp) gp.setAttribute('data-font-scale', scale);
        Game._syncPauseMenuOptions();
    },
    setReducedMotion: function (enabled) {
        Game.reducedMotion = Boolean(enabled);
        var gp = document.getElementById('GamePlay');
        if (gp) gp.setAttribute('data-reduced-motion', Game.reducedMotion ? 'true' : 'false');
        if (document && document.body) document.body.setAttribute('data-reduced-motion', Game.reducedMotion ? 'true' : 'false');
        Game._syncPauseMenuOptions();
    },
    _syncPauseMenuOptions: function () {
        var metricsBtn = document.getElementById('PauseToggleMetrics');
        if (metricsBtn) metricsBtn.textContent = 'FPS/Input: ' + (Game.metrics.enabled ? 'On' : 'Off');
        var hapticsBtn = document.getElementById('PauseToggleHaptics');
        if (hapticsBtn) hapticsBtn.textContent = 'Haptics: ' + (Game.hapticsEnabled ? 'On' : 'Off');
        var uiBtn = document.getElementById('PauseUiScale');
        if (uiBtn) {
            var label = Game.uiScale === 'large' ? 'Large' : (Game.uiScale === 'xlarge' ? 'XL' : 'Normal');
            uiBtn.textContent = 'UI Size: ' + label;
        }
        var motionBtn = document.getElementById('PauseReducedMotion');
        if (motionBtn) motionBtn.textContent = 'Reduced Motion: ' + (Game.reducedMotion ? 'On' : 'Off');
        var fontBtn = document.getElementById('PauseFontScale');
        if (fontBtn) {
            var flabel = Game.fontScale === 'large' ? 'Large' : (Game.fontScale === 'xlarge' ? 'XL' : 'Normal');
            fontBtn.textContent = 'Font Size: ' + flabel;
        }
    },
    restartLevel: function () {
        Game.resume();
        Game.stopAnimation();
        if (Game.pathfinding) Game.pathfinding.reset();
        var all = Unit.allUnits.concat(Building.allBuildings);
        all.forEach(function (chara) {
            if (!chara) return;
            if (chara.routingTimer) clearInterval(chara.routingTimer);
            if (chara.attackTimer) clearInterval(chara.attackTimer);
            if (chara._timer) {
                clearInterval(chara._timer);
                clearTimeout(chara._timer);
            }
            if (chara.stop) chara.stop();
            chara.status = 'dead';
        });
        Unit.allUnits.length = 0;
        Unit.ourFlyingUnits.length = 0;
        Unit.ourGroundUnits.length = 0;
        Unit.enemyFlyingUnits.length = 0;
        Unit.enemyGroundUnits.length = 0;
        Building.allBuildings.length = 0;
        Building.ourBuildings.length = 0;
        Building.enemyBuildings.length = 0;
        Burst.allEffects.length = 0;
        Game.unselectAll();
        Game.changeSelectedTo({});
        Game._clock = 0;
        Resource.init();
        Levels[Game.level - 1].load();
        setTimeout(function () {
            Game.resizeWindow();
            mouseController.toControlAll();
            Game.animation();
        }, 0);
    },
    _isVisible: function (chara, margin) {
        if (!chara || chara.status === 'dead') return false;
        if (margin == null) margin = 0;
        var left = GameMap.offsetX - margin;
        var top = GameMap.offsetY - margin;
        var right = GameMap.offsetX + Game.HBOUND + margin;
        var bottom = GameMap.offsetY + Game.VBOUND + margin;
        return (chara.x + chara.width) > left && chara.x < right && (chara.y + chara.height) > top && chara.y < bottom;
    },
    _anyVisibleBullet: function (bulletOrArray) {
        if (!bulletOrArray) return false;
        if (bulletOrArray instanceof Array) {
            for (var i = 0; i < bulletOrArray.length; i++) {
                var b = bulletOrArray[i];
                if (b && b.status !== 'dead' && Game._isVisible(b, Game.perf.cullMargin)) return true;
            }
            return false;
        }
        return bulletOrArray.status !== 'dead' && Game._isVisible(bulletOrArray, Game.perf.cullMargin);
    },
    _shouldRunAI: function (chara, inView) {
        if (!chara || !chara.AI) return false;
        if (chara.selected) return true;
        var interval = 1;
        if (!inView) {
            var cx = GameMap.offsetX + (Game.HBOUND * 0.5);
            var cy = GameMap.offsetY + (Game.VBOUND * 0.5);
            var dx = Math.abs(chara.posX() - cx);
            var dy = Math.abs(chara.posY() - cy);
            interval = (dx > Game.HBOUND * 1.5 || dy > Game.VBOUND * 1.5) ? 10 : 4;
        }
        if (!chara._lastAIClock) chara._lastAIClock = 0;
        if ((Game._clock - chara._lastAIClock) >= interval) {
            chara._lastAIClock = Game._clock;
            return true;
        }
        return false;
    },
    init: function () {
        $('div.GameLayer').on("selectstart", (event) => {
            event.preventDefault();
        });
        window.onresize = Game.resizeWindow;
        Game.layerSwitchTo("GameLoading");
        Game._loadAsset = function (type, src, id) {
            if (sourceLoader.sources[id]) return;
            sourceLoader.load(type, src, id);
        };
        Game._assetSrc = {
            Map_Switchback: "img/Maps/(2)Switchback.jpg",
            Map_Volcanis: "img/Maps/(2)Volcanis.jpg",
            Map_TrenchWars: "img/Maps/(3)Trench%20wars.jpg",
            Map_BloodBath: "img/Maps/(4)Blood%20Bath.jpg",
            Map_OrbitalRelay: "img/Maps/(4)Orbital%20Relay.jpg",
            Map_ThinIce: "img/Maps/(6)Thin%20Ice.jpg",
            Map_BigGameHunters: "img/Maps/(8)BigGameHunters.jpg",
            Map_TheHunters: "img/Maps/(8)TheHunters.jpg",
            Map_Turbo: "img/Maps/(8)Turbo.jpg",
            Map_Grass: "img/Maps/Map_Grass.jpg"
        };
        Game.ensureAsset = function (id) {
            if (!id || sourceLoader.sources[id]) return true;
            var src = Game._assetSrc[id];
            if (!src && id.indexOf('Map_') === 0) return false;
            if (!src) src = "img/Charas/" + id + ".png";
            Game._loadAsset("img", src, id);
            return false;
        };

        [
            ["img", "img/Bg/GameStart.jpg", "GameStart"],
            ["img", "img/Bg/GamePlay.jpg", "GamePlay"],
            ["img", "img/Bg/GameWin.jpg", "GameWin"],
            ["img", "img/Bg/GameLose.jpg", "GameLose"],
            ["img", "img/Menu/ControlPanel.png", "ControlPanel"]
        ].forEach(function (asset) {
            Game._loadAsset(asset[0], asset[1], asset[2]);
        });

        sourceLoader.allOnLoad(() => {
            $('#GameStart').prepend(sourceLoader.sources['GameStart']);
            $('#GameWin').prepend(sourceLoader.sources['GameWin']);
            $('#GameLose').prepend(sourceLoader.sources['GameLose']);
            $('#GamePlay>canvas').attr('width', Game.HBOUND);
            $('#GamePlay>canvas').attr('height', Game.VBOUND);
            for (let N = 1; N <= 9; N++) {
                $('div.panel_Control').append("<button num='" + N + "'></button>");
            }
            var pauseBtn = document.getElementById('PauseButton');
            if (pauseBtn) pauseBtn.onclick = function (event) {
                event.preventDefault();
                Game.togglePause();
            };
            var resumeBtn = document.getElementById('PauseResume');
            if (resumeBtn) resumeBtn.onclick = function (event) {
                event.preventDefault();
                Game.resume();
            };
            var restartBtn = document.getElementById('PauseRestart');
            if (restartBtn) restartBtn.onclick = function (event) {
                event.preventDefault();
                Game.restartLevel();
            };
            var toggleMetricsBtn = document.getElementById('PauseToggleMetrics');
            if (toggleMetricsBtn) toggleMetricsBtn.onclick = function (event) {
                event.preventDefault();
                Game.metrics.enabled = !Game.metrics.enabled;
                if (!Game.metrics.enabled) {
                    var hud = document.getElementById('GameHUD');
                    if (hud) hud.style.display = 'none';
                    Game.ui.lastMetrics.visible = false;
                }
                Game._syncPauseMenuOptions();
            };
            var toggleHapticsBtn = document.getElementById('PauseToggleHaptics');
            if (toggleHapticsBtn) toggleHapticsBtn.onclick = function (event) {
                event.preventDefault();
                Game.hapticsEnabled = !Game.hapticsEnabled;
                Game._syncPauseMenuOptions();
            };
            var uiScaleBtn = document.getElementById('PauseUiScale');
            if (uiScaleBtn) uiScaleBtn.onclick = function (event) {
                event.preventDefault();
                var next = (Game.uiScale === 'normal') ? 'large' : (Game.uiScale === 'large') ? 'xlarge' : 'normal';
                Game.setUiScale(next);
            };
            var reducedMotionBtn = document.getElementById('PauseReducedMotion');
            if (reducedMotionBtn) reducedMotionBtn.onclick = function (event) {
                event.preventDefault();
                Game.setReducedMotion(!Game.reducedMotion);
            };
            var fontScaleBtn = document.getElementById('PauseFontScale');
            if (fontScaleBtn) fontScaleBtn.onclick = function (event) {
                event.preventDefault();
                var next = (Game.fontScale === 'normal') ? 'large' : (Game.fontScale === 'large') ? 'xlarge' : 'normal';
                Game.setFontScale(next);
            };
            Game.setUiScale(Game.uiScale);
            Game.setFontScale(Game.fontScale);
            Game.setReducedMotion(Game.reducedMotion);
            Game._syncPauseMenuOptions();
            Game.start();
        });
    },
    start: function () {
        //Game start
        Game.layerSwitchTo("GameStart");

        //Clear existing items
        $('.levelSelectionBg').html('');

        //Init level selector
        for (var level = 1; level <= Levels.length; level++) {
            var levelLabel = Levels[level - 1].label ? Levels[level - 1].label : "Level " + level;
            var item = $('<div class="levelItem" data-level="' + level + '">' + levelLabel + '</div>');
            item.on('click', function () {
                var lvl = parseInt($(this).data('level'));
                if (lvl) {
                    $('.levelItem').css('background-color', 'blue');
                    $(this).css('background-color', 'green');
                    Game.level = lvl;
                    Game.play();
                }
            });
            $('.levelSelectionBg').append(item);
        }
    },
    play: function () {
        Game.resume();
        Game.layerSwitchTo("GameLoading");
        Game.loadGameplayAssets(function () {
            Resource.init();
            Levels[Game.level - 1].load();
            setTimeout(function () {
                Game.preloadCurrentLevelAssets(function () {
                    Game.layerSwitchTo("GamePlay");
                    Game.resizeWindow();
                    mouseController.toControlAll();
                    keyController.start();
                    Game.animation();
                });
            }, 0);
        });
    },
    loadGameplayAssets: function (callback) {
        if (Game._gameplayAssetsLoaded) {
            callback();
            return;
        }
        [
            ["img", "img/Charas/ZergBuilding.png", "ZergBuilding"],
            ["img", "img/Charas/TerranBuilding.png", "TerranBuilding"],
            ["img", "img/Charas/ProtossBuilding.png", "ProtossBuilding"],
            ["img", Game._assetSrc.Map_Switchback, "Map_Switchback"],
            ["img", Game._assetSrc.Map_Volcanis, "Map_Volcanis"],
            ["img", Game._assetSrc.Map_TrenchWars, "Map_TrenchWars"],
            ["img", Game._assetSrc.Map_BloodBath, "Map_BloodBath"],
            ["img", Game._assetSrc.Map_OrbitalRelay, "Map_OrbitalRelay"],
            ["img", Game._assetSrc.Map_ThinIce, "Map_ThinIce"],
            ["img", Game._assetSrc.Map_BigGameHunters, "Map_BigGameHunters"],
            ["img", Game._assetSrc.Map_TheHunters, "Map_TheHunters"],
            ["img", Game._assetSrc.Map_Turbo, "Map_Turbo"],
            ["img", Game._assetSrc.Map_Grass, "Map_Grass"],
            ["img", "img/Charas/Mud.png", "Mud"],
            ["img", "img/Charas/Burst.png", "Burst"],
            ["img", "img/Charas/BuildingBurst.png", "BuildingBurst"],
            ["img", "img/Charas/Portrait.png", "Portrait"],
            ["img", "img/Charas/Magic.png", "Magic"]
        ].forEach(function (asset) {
            Game._loadAsset(asset[0], asset[1], asset[2]);
        });

        sourceLoader.allOnLoad(function () {
            Game._gameplayAssetsLoaded = true;
            callback();
        });
    },
    preloadCurrentLevelAssets: function (callback) {
        var idMap = {};
        var add = function (id) {
            if (!id) return;
            idMap[id] = true;
        };
        add('Map_' + GameMap.currentMap);
        Unit.allUnits.forEach(function (u) {
            add(u.source ? u.source : u.name);
        });
        Building.allBuildings.forEach(function (b) {
            if (b.source) add(b.source);
            else add(b.attack ? b.inherited.inherited.name : b.inherited.name);
        });
        Object.keys(idMap).forEach(function (id) {
            Game.ensureAsset(id);
        });
        sourceLoader.allOnLoad(callback);
    },
    addSelectedIntoTeam: function (teamNum) {
        //Build a new team
        Game.teams[teamNum] = _$.mixin([], Game.allSelected);
    },
    callTeam: function (teamNum, centerOnGroup) {
        var team = _$.mixin([], Game.teams[teamNum]);
        //When team already exist
        if (team instanceof Array) {
            Game.unselectAll();
            //GC
            $.extend([], team).forEach(function (chara) {
                if (chara.status == 'dead') team.splice(team.indexOf(chara), 1);
            });
            Game.addIntoAllSelected(team, true);
            if (team[0] instanceof Gobj) {
                Game.changeSelectedTo(team[0]);
                //Sound effect
                team[0].sound.selected.play();
                if (centerOnGroup) {
                    GameMap.relocateAt(team[0].posX(), team[0].posY());
                }
            }
        }
    },
    unselectAll: function () {
        var units = Unit.allUnits.concat(Building.allBuildings);
        units.forEach((chara) => { chara.selected = false });
        Game.addIntoAllSelected([], true);
    },
    multiSelectInRect: function () {
        Game.unselectAll();
        var startPoint = {
            x: GameMap.offsetX + Math.min(mouseController.startPoint.x, mouseController.endPoint.x),
            y: GameMap.offsetY + Math.min(mouseController.startPoint.y, mouseController.endPoint.y)
        };
        var endPoint = {
            x: GameMap.offsetX + Math.max(mouseController.startPoint.x, mouseController.endPoint.x),
            y: GameMap.offsetY + Math.max(mouseController.startPoint.y, mouseController.endPoint.y)
        };
        var inRectUnits = Unit.allOurUnits().filter((chara) => {
            return chara.insideRect({ start: (startPoint), end: (endPoint) })
        });
        if (inRectUnits.length > 0) Game.changeSelectedTo(inRectUnits[0]);
        else Game.changeSelectedTo({});
        Game.addIntoAllSelected(inRectUnits, true);
    },
    getSelectedOne: function (clickX, clickY, isEnemyFilter, unitBuildingFilter, isFlyingFilter, customFilter) {
        const distance = (chara) => {
            return (clickX - chara.posX()) * (clickX - chara.posX()) + (clickY - chara.posY()) * (clickY - chara.posY());
        };
        var selectedOne = {}, charas = [];
        if (isEnemyFilter == null) {
            if (unitBuildingFilter == null) charas = Unit.allUnits.concat(Building.allBuildings);
            else if (unitBuildingFilter) charas = Unit.allUnits;
            else charas = Building.allBuildings;
        }
        else if (isEnemyFilter) {
            if (unitBuildingFilter == null) charas = Unit.allEnemyUnits().concat(Building.enemyBuildings);
            else if (unitBuildingFilter) charas = Unit.allEnemyUnits();
            else charas = Building.enemyBuildings;
        }
        else {
            if (unitBuildingFilter == null) charas = Unit.allOurUnits().concat(Building.ourBuildings);
            else if (unitBuildingFilter) charas = Unit.allOurUnits();
            else charas = Building.ourBuildings;
        }
        if (isFlyingFilter != null) {
            charas = charas.filter((chara) => {
                return chara.isFlying == isFlyingFilter;
            });
        }
        if (customFilter != null) {
            charas = charas.filter(customFilter);
        }
        selectedOne = charas.filter((chara) => {
            return chara.status != 'dead' && chara.includePoint(clickX, clickY);
        }).sort((chara1, chara2) => {
            return distance(chara1) - distance(chara2);
        })[0];
        if (!selectedOne) selectedOne = {};
        return selectedOne;
    },
    getInRangeOnes: function (clickX, clickY, range, isEnemyFilter, unitBuildingFilter, isFlyingFilter, customFilter) {
        var selectedOnes = [], charas = [];
        if (isEnemyFilter == null) {
            if (unitBuildingFilter == null) charas = Unit.allUnits.concat(Building.allBuildings);
            else if (unitBuildingFilter) charas = Unit.allUnits;
            else charas = Building.allBuildings;
        }
        else if (isEnemyFilter) {
            if (unitBuildingFilter == null) charas = Unit.allEnemyUnits().concat(Building.enemyBuildings);
            else if (unitBuildingFilter) charas = Unit.allEnemyUnits();
            else charas = Building.enemyBuildings;
        }
        else {
            if (unitBuildingFilter == null) charas = Unit.allOurUnits().concat(Building.ourBuildings);
            else if (unitBuildingFilter) charas = Unit.allOurUnits();
            else charas = Building.ourBuildings;
        }
        if (isFlyingFilter != null) {
            charas = charas.filter((chara) => {
                return chara.isFlying == isFlyingFilter;
            });
        }
        if (customFilter != null) {
            charas = charas.filter(customFilter);
        }
        selectedOnes = charas.filter((chara) => {
            return chara.status != 'dead' && chara.insideSquare({ centerX: clickX, centerY: clickY, radius: range });
        });
        return selectedOnes;
    },
    //For test use
    getSelected: function () {
        return Unit.allUnits.concat(Building.allBuildings).filter((chara) => {
            return chara.selected;
        });
    },
    //Sort units from nearest to far away
    getNearbyOnes: function (clickX, clickY, isEnemyFilter) {
        var units = [];
        if (isEnemyFilter == undefined) units = Unit.allUnits.concat(Building.allBuildings);
        else {
            if (isEnemyFilter) units = Unit.allEnemyUnits().concat(Building.enemyBuildings);
            else units = Unit.allOurUnits().concat(Building.ourBuildings);
        }
        units.sort((unit1, unit2) => {
            return (unit1.posX() - clickX) * (unit1.posX() - clickX) + (unit1.posY() - clickY) * (unit1.posY() - clickY)
                - (unit2.posX() - clickX) * (unit2.posX() - clickX) - (unit2.posY() - clickY) * (unit2.posY() - clickY);
        });
        return units;
    },
    getNearestOne: function (clickX, clickY, isEnemyFilter) {
        return Game.getNearbyOnes(clickX, clickY, isEnemyFilter)[0];
    },
    changeSelectedTo: function (chara) {
        Game.selectedUnit = chara;
        Button.equipButtonsFor(chara);
        if (chara instanceof Gobj) {
            chara.selected = true;
        }
        //Show selected living unit info
        if (Game.selectedUnit instanceof Gobj && Game.selectedUnit.status != "dead") {
            //Display info
            $('div.panel_Info>div[class*="info"]').show();
            //Draw selected unit portrait
            if (chara.portrait) $('div.infoLeft div[name="portrait"]')[0].className = chara.portrait;//Override portrait
            else {
                if (Game.selectedUnit instanceof Unit)
                    $('div.infoLeft div[name="portrait"]')[0].className = Game.selectedUnit.name;
                if (Game.selectedUnit instanceof Building)
                    $('div.infoLeft div[name="portrait"]')[0].className =
                        Game.selectedUnit.attack ? Game.selectedUnit.inherited.inherited.name : Game.selectedUnit.inherited.name;
            }
            //Show selected unit HP,SP and MP
            $('div.infoLeft span._Health')[0].style.color = Game.selectedUnit.lifeStatus();
            $('div.infoLeft span.life')[0].innerHTML = Game.selectedUnit.life >> 0;
            $('div.infoLeft span.HP')[0].innerHTML = Game.selectedUnit.get('HP');
            if (Game.selectedUnit.SP) {
                $('div.infoLeft span.shield')[0].innerHTML = Game.selectedUnit.shield >> 0;
                $('div.infoLeft span.SP')[0].innerHTML = Game.selectedUnit.get('SP');
                $('div.infoLeft span._Shield').show();
            }
            else {
                $('div.infoLeft span._Shield').hide();
            }
            if (Game.selectedUnit.MP) {
                $('div.infoLeft span.magic')[0].innerHTML = Game.selectedUnit.magic >> 0;
                $('div.infoLeft span.MP')[0].innerHTML = Game.selectedUnit.get('MP');
                $('div.infoLeft span._Magic').show();
            }
            else {
                $('div.infoLeft span._Magic').hide();
            }
            //Draw selected unit name,kill,damage,armor and shield
            $('div.infoCenter h3.name')[0].innerHTML = Game.selectedUnit.name;
            if (Game.selectedUnit.detector) {
                $('div.infoCenter p.detector').show();
            }
            else {
                $('div.infoCenter p.detector').hide();
            }
            if (Game.selectedUnit.attack) {
                $('div.infoCenter p.kill span')[0].innerHTML = Game.selectedUnit.kill;
                if (Game.selectedUnit.attackMode) {
                    $('div.infoCenter p.damage span')[0].innerHTML = (Game.selectedUnit.get('attackMode.ground.damage') + '/' + Game.selectedUnit.get('attackMode.flying.damage'));
                }
                else {
                    $('div.infoCenter p.damage span')[0].innerHTML = (Game.selectedUnit.get('damage') + (Game.selectedUnit.suicide ? ' (1)' : ''));
                }
                //Show kill and damage
                $('div.infoCenter p.kill').show();
                $('div.infoCenter p.damage').show();
            }
            else {
                //Hide kill and damage
                $('div.infoCenter p.kill').hide();
                $('div.infoCenter p.damage').hide();
            }
            $('div.infoCenter p.armor span')[0].innerHTML = Game.selectedUnit.get('armor');
            if (Game.selectedUnit.get('plasma') != undefined) {
                $('div.infoCenter p.plasma span')[0].innerHTML = Game.selectedUnit.get('plasma');
                $('div.infoCenter p.plasma').show();
            }
            else {
                $('div.infoCenter p.plasma').hide();
            }
            //Draw upgraded
            var upgraded = Game.selectedUnit.upgrade;
            var team = Number(Boolean(Game.selectedUnit.isEnemy));
            if (upgraded) {
                for (var N = 0; N < 3; N++) {
                    var upgradeIcon = $('div.upgraded div[name="icon"]')[N];
                    upgradeIcon.innerHTML = '';
                    upgradeIcon.style.display = 'none';
                    if (N < upgraded.length) {
                        upgradeIcon.className = upgradeIcon.title = upgraded[N];
                        upgradeIcon.innerHTML = Upgrade[upgraded[N]].level[team];
                        if (Upgrade[upgraded[N]].level[team]) {
                            upgradeIcon.setAttribute('disabled', 'false');
                            upgradeIcon.style.color = 'aqua';
                        }
                        else {
                            upgradeIcon.setAttribute('disabled', 'true');
                            upgradeIcon.style.color = 'red';
                        }
                        upgradeIcon.style.display = 'inline-block';
                    }
                }
                $('div.upgraded').show();
            }
            else {
                //$('div.upgraded div[name="icon"]').html('').removeAttr('title').hide();
                $('div.upgraded').hide();
            }
        }
        else {
            //Hide info
            $('div.panel_Info>div').hide();
        }
    },
    draw: function (chara) {
        //Can draw units and no-rotate bullets
        if (!(chara instanceof Gobj)) return;//Will only show Gobj
        if (chara.status == "dead") return;//Will not show dead
        //Won't draw units outside screen
        if (!chara.insideScreen()) return;
        if (chara.noRender) return;
        //Choose context
        var cxt = ((chara instanceof Unit) || (chara instanceof Building)) ? Game.cxt : Game.frontCxt;
        //Shadows disabled for performance - canvas shadows are extremely expensive
        //as they force double-rendering of every sprite
        var needRestore = false;
        //Draw invisible
        if (chara.isInvisible != undefined) {
            cxt.save();
            needRestore = true;
            cxt.globalAlpha = (chara.isEnemy && chara.isInvisible) ? 0 : 0.5;
            if (chara.burrowBuffer && !chara.isEnemy) cxt.globalAlpha = 1;
        }
        //Draw unit or building
        var imgSrc;
        var assetId;
        if (chara instanceof Building) {
            if (chara.source) {
                assetId = chara.source;
                imgSrc = sourceLoader.sources[assetId];
            }
            else {
                assetId = chara.attack ? chara.inherited.inherited.name : chara.inherited.name;
                imgSrc = sourceLoader.sources[assetId];
            }
        }
        //Unit, not building
        else {
            assetId = chara.source ? chara.source : chara.name;
            imgSrc = sourceLoader.sources[assetId];
        }
        if (!imgSrc) {
            Game.ensureAsset(assetId);
            return;
        }
        //Convert position
        var charaX = (chara.x - GameMap.offsetX) >> 0;
        var charaY = (chara.y - GameMap.offsetY) >> 0;
        //Same image in different directions
        if (chara.direction == undefined) {
            var _left = chara.imgPos[chara.status].left;
            var _top = chara.imgPos[chara.status].top;
            //Multiple actions status
            if (_left instanceof Array || _top instanceof Array) {
                cxt.drawImage(imgSrc,
                    _left[chara.action], _top[chara.action], chara.width, chara.height,
                    charaX, charaY, chara.width, chara.height);
            }
            //One action status
            else {
                cxt.drawImage(imgSrc,
                    _left, _top, chara.width, chara.height,
                    charaX, charaY, chara.width, chara.height);
            }
        }
        //Different image in different directions
        else {
            if (!chara.imgPos || !chara.imgPos[chara.status]) {
                return;
            }
            var _left = chara.imgPos[chara.status].left[chara.direction];
            var _top = chara.imgPos[chara.status].top[chara.direction];
            //Multiple actions status
            if (_left instanceof Array || _top instanceof Array) {
                cxt.drawImage(imgSrc,
                    _left[chara.action], _top[chara.action], chara.width, chara.height,
                    charaX, charaY, chara.width, chara.height);
            }
            //One action status
            else {
                cxt.drawImage(imgSrc,
                    _left, _top, chara.width, chara.height,
                    charaX, charaY, chara.width, chara.height);
            }
        }
        //Restore context if modified
        if (needRestore) cxt.restore();
        //Draw HP if has selected and is true
        if (chara.selected == true) {
            cxt = Game.frontCxt;
            //Draw selected circle
            cxt.strokeStyle = (chara.isEnemy) ? "red" : "green";//Distinguish enemy
            cxt.lineWidth = 2;//Cannot see 1px width circle clearly
            cxt.beginPath();
            cxt.arc(chara.posX() - GameMap.offsetX, chara.posY() - GameMap.offsetY, chara.radius(), 0, 2 * Math.PI);
            cxt.stroke();
            //Draw HP bar and SP bar and magic bar
            cxt.globalAlpha = 1;
            cxt.lineWidth = 1;
            var offsetY = -6 - (chara.MP ? 5 : 0) - (chara.SP ? 5 : 0);
            var lifeRatio = chara.life / chara.get('HP');
            cxt.strokeStyle = "black";
            if (chara.SP) {
                //Draw HP and SP
                cxt.fillStyle = "blue";
                cxt.fillRect(chara.x - GameMap.offsetX, chara.y - GameMap.offsetY + offsetY, chara.width * chara.shield / chara.get('SP'), 5);
                cxt.strokeRect(chara.x - GameMap.offsetX, chara.y - GameMap.offsetY + offsetY, chara.width, 5);
                cxt.fillStyle = (lifeRatio > 0.7) ? "green" : (lifeRatio > 0.3) ? "yellow" : "red";//Distinguish life
                cxt.fillRect(chara.x - GameMap.offsetX, chara.y - GameMap.offsetY + offsetY + 5, chara.width * lifeRatio, 5);
                cxt.strokeRect(chara.x - GameMap.offsetX, chara.y - GameMap.offsetY + offsetY + 5, chara.width, 5);
            }
            else {
                //Only draw HP
                cxt.fillStyle = (lifeRatio > 0.7) ? "green" : (lifeRatio > 0.3) ? "yellow" : "red";//Distinguish life
                cxt.fillRect(chara.x - GameMap.offsetX, chara.y - GameMap.offsetY + offsetY, chara.width * lifeRatio, 5);
                cxt.strokeRect(chara.x - GameMap.offsetX, chara.y - GameMap.offsetY + offsetY, chara.width, 5);
            }
            if (chara.MP) {
                //Draw MP
                cxt.fillStyle = "darkviolet";
                cxt.fillRect(chara.x - GameMap.offsetX, chara.y - GameMap.offsetY + offsetY + (chara.SP ? 10 : 5), chara.width * chara.magic / chara.get('MP'), 5);
                cxt.strokeRect(chara.x - GameMap.offsetX, chara.y - GameMap.offsetY + offsetY + (chara.SP ? 10 : 5), chara.width, 5);
            }
        }
    },
    drawEffect: function (chara) {
        //Can draw units and no-rotate bullets
        if (!(chara instanceof Burst)) return;//Will only show Burst
        if (chara.status == "dead") return;//Will not show dead
        //Won't draw units outside screen
        if (!chara.insideScreen()) return;
        //Choose context
        var cxt = Game.frontCxt;
        //Shadows disabled for performance
        var imgSrc = sourceLoader.sources[chara.name];
        if (!imgSrc) {
            Game.ensureAsset(chara.name);
            return;
        }
        //Convert position
        var charaX = (chara.x - GameMap.offsetX) >> 0;
        var charaY = (chara.y - GameMap.offsetY) >> 0;
        var _left = chara.imgPos[chara.status].left;
        var _top = chara.imgPos[chara.status].top;
        //Will stretch effect if scale
        var times = chara.scale ? chara.scale : 1;
        //Multiple actions status
        if (_left instanceof Array || _top instanceof Array) {
            cxt.drawImage(imgSrc,
                _left[chara.action], _top[chara.action], chara.width, chara.height,
                charaX, charaY, chara.width * times >> 0, chara.height * times >> 0);
        }
        //One action status
        else {
            cxt.drawImage(imgSrc,
                _left, _top, chara.width, chara.height,
                charaX, charaY, chara.width * times >> 0, chara.height * times >> 0);
        }
    },
    drawBullet: function (chara) {
        //Bullet array
        if (chara instanceof Array) {
            chara.forEach(function (bullet) {
                Game.drawBullet(bullet);
            });
        }
        //Can draw bullets need rotate
        if (!(chara instanceof Bullets)) return;//Will only show bullet
        if (chara.status == "dead") return;//Will not show dead
        //Won't draw bullets outside screen
        if (!chara.insideScreen()) return;
        //Draw unit
        var imgSrc = sourceLoader.sources[chara.name];
        if (!imgSrc) {
            Game.ensureAsset(chara.name);
            return;
        }
        var _left = chara.imgPos[chara.status].left;
        var _top = chara.imgPos[chara.status].top;
        //Convert position
        var centerX = (chara.posX() - GameMap.offsetX) >> 0;
        var centerY = (chara.posY() - GameMap.offsetY) >> 0;
        //Rotate canvas
        Game.frontCxt.save();
        //Rotate to draw bullet
        Game.frontCxt.translate(centerX, centerY);
        Game.frontCxt.rotate(-chara.angle);
        //Shadows disabled for performance
        //Multiple actions status
        if (_left instanceof Array || _top instanceof Array) {
            Game.frontCxt.drawImage(imgSrc,
                _left[chara.action], _top[chara.action], chara.width, chara.height,
                -chara.width / 2 >> 0, -chara.height / 2 >> 0, chara.width, chara.height);
        }
        //One action status
        else {
            Game.frontCxt.drawImage(imgSrc,
                _left, _top, chara.width, chara.height,
                -chara.width / 2 >> 0, -chara.height / 2 >> 0, chara.width, chara.height);
        }
        //Rotate canvas back and remove shadow
        Game.frontCxt.restore();
        //Below 2 separated steps might cause mess
        //Game.frontCxt.translate(-centerX,-centerY);
        //Game.frontCxt.rotate(chara.angle);
    },
    _domCache: null,
    _ensureDomCache: function () {
        if (Game._domCache) return;
        Game._domCache = {
            healthColor: $('div.infoLeft span._Health')[0],
            life: $('div.infoLeft span.life')[0],
            shield: $('div.infoLeft span.shield')[0],
            magic: $('div.infoLeft span.magic')[0],
            kill: $('div.infoCenter p.kill span')[0],
            mineNum: $('div.resource_Box span.mineNum')[0],
            gasNum: $('div.resource_Box span.gasNum')[0],
            manSpans: $('div.resource_Box span.manNum>span'),
            manNum: $('div.resource_Box span.manNum')[0]
        };
    },
    drawInfoBox: function () {
        //Update selected unit active info which need refresh
        if (Game.selectedUnit instanceof Gobj && Game.selectedUnit.status != "dead") {
            Game._ensureDomCache();
            var dc = Game._domCache;
            //Update selected unit life,shield and magic
            var lifeRatio = Game.selectedUnit.life / Game.selectedUnit.get('HP');
            var lifeColor = ((lifeRatio > 0.7) ? "green" : (lifeRatio > 0.3) ? "yellow" : "red");
            if (Game.ui.lastSelected.lifeColor !== lifeColor) {
                dc.healthColor.style.color = lifeColor;
                Game.ui.lastSelected.lifeColor = lifeColor;
            }
            var life = Game.selectedUnit.life >> 0;
            if (Game.ui.lastSelected.life !== life) {
                dc.life.innerHTML = life;
                Game.ui.lastSelected.life = life;
            }
            if (Game.selectedUnit.SP) {
                var shield = Game.selectedUnit.shield >> 0;
                if (Game.ui.lastSelected.shield !== shield) {
                    dc.shield.innerHTML = shield;
                    Game.ui.lastSelected.shield = shield;
                }
            }
            if (Game.selectedUnit.MP) {
                var magic = Game.selectedUnit.magic >> 0;
                if (Game.ui.lastSelected.magic !== magic) {
                    dc.magic.innerHTML = magic;
                    Game.ui.lastSelected.magic = magic;
                }
            }
            //Update selected unit kill
            if (Game.selectedUnit.kill != null) {
                if (Game.ui.lastSelected.kill !== Game.selectedUnit.kill) {
                    dc.kill.innerHTML = Game.selectedUnit.kill;
                    Game.ui.lastSelected.kill = Game.selectedUnit.kill;
                }
            }
        }
    },
    drawSourceBox: function () {
        Game._ensureDomCache();
        var dc = Game._domCache;
        //Update min, gas, curMan and totalMan
        if (Game.ui.lastResource.mine !== Resource[0].mine) {
            dc.mineNum.innerHTML = Resource[0].mine;
            Game.ui.lastResource.mine = Resource[0].mine;
        }
        if (Game.ui.lastResource.gas !== Resource[0].gas) {
            dc.gasNum.innerHTML = Resource[0].gas;
            Game.ui.lastResource.gas = Resource[0].gas;
        }
        if (Game.ui.lastResource.curMan !== Resource[0].curMan) {
            dc.manSpans[0].innerHTML = Resource[0].curMan;
            Game.ui.lastResource.curMan = Resource[0].curMan;
        }
        if (Game.ui.lastResource.totalMan !== Resource[0].totalMan) {
            dc.manSpans[1].innerHTML = Resource[0].totalMan;
            Game.ui.lastResource.totalMan = Resource[0].totalMan;
        }
        var manColor = (Resource[0].curMan > Resource[0].totalMan) ? "red" : (Resource[0].curMan === Resource[0].totalMan) ? "yellow" : "#00ff00";
        if (Game.ui.lastResource.manColor !== manColor) {
            dc.manNum.style.color = manColor;
            Game.ui.lastResource.manColor = manColor;
        }
        var supplyBlocked = Resource[0].totalMan > 0 && Resource[0].curMan >= Resource[0].totalMan;
        if (Game.ui.lastResource.supplyBlocked !== supplyBlocked) {
            Game.ui.lastResource.supplyBlocked = supplyBlocked;
            if (supplyBlocked) {
                var now = (window.performance && performance.now) ? performance.now() : Date.now();
                if (!Game.ui.lastResource.supplyWarnAt || (now - Game.ui.lastResource.supplyWarnAt) > 2500) {
                    var msg = (Game.race.selected === 'Zerg') ? 'Supply blocked: create more Overlords'
                        : (Game.race.selected === 'Protoss') ? 'Supply blocked: build more Pylons'
                            : 'Supply blocked: build more Supply Depots';
                    Game.ui.lastResource.supplyWarnAt = now;
                    Game.showWarning(msg);
                }
            }
        }
    },
    drawProcessingBox: function () {
        //Show processing box if it's processing
        var processing = Game.selectedUnit.processing;
        if (processing) {
            var percent = ((new Date().getTime() - processing.startTime) / (processing.time) + 0.5) >> 0;
            //var percent=((Game._clock-processing.startTime)*100/(processing.time)+0.5)>>0;
            if (Game.ui.lastProcessing.name !== processing.name) {
                $('div.upgrading div[name="icon"]')[0].className = processing.name;
                $('div.upgrading').attr('title', processing.name);
                Game.ui.lastProcessing.name = processing.name;
            }
            if (Game.ui.lastProcessing.percent !== percent) {
                $('div.upgrading div[name="processing"] span')[0].innerHTML = percent;
                $('div.upgrading div[name="processing"] div.processedBar')[0].style.width = percent + '%';
                Game.ui.lastProcessing.percent = percent;
            }
            var queue = Game.selectedUnit.productionQueue;
            var queueText = '';
            if (processing && processing.name) {
                queueText = 'Now: ' + processing.name;
            }
            if (queue && queue.length) {
                var shown = queue.slice(0, 4).map(function (j) { return j.name; });
                var more = queue.length - shown.length;
                queueText += (queueText ? ' | ' : '') + 'Next: ' + shown.join(', ') + (more > 0 ? (' +' + more) : '');
            }
            if (Game.ui.lastProcessing.queueText !== queueText) {
                $('div.upgrading div[name="processing"] div.queue')[0].textContent = queueText;
                Game.ui.lastProcessing.queueText = queueText;
            }
            if (Game.ui.lastProcessing.visible !== true) {
                $('div.upgrading').show();
                Game.ui.lastProcessing.visible = true;
            }
            /*$('div.upgrading div[name="icon"]')[0].setAttribute('title',processing.name);
            $('div.upgrading')[0].style.display='block';*/
        }
        else {
            if (Game.ui.lastProcessing.visible !== false) {
                $('div.upgrading').removeAttr('title').hide();
                Game.ui.lastProcessing.visible = false;
            }
            if (Game.ui.lastProcessing.queueText !== '') {
                $('div.upgrading div[name="processing"] div.queue')[0].textContent = '';
                Game.ui.lastProcessing.queueText = '';
            }
            /*delete $('div.upgrading div[name="icon"]')[0].title;
            $('div.upgrading')[0].style.display='none';*/
        }
    },
    drawMetrics: function () {
        if (!Game.metrics.enabled) return;
        var now = (window.performance && performance.now) ? performance.now() : Date.now();
        if (Game.metrics._lastFrameAt) {
            var dt = now - Game.metrics._lastFrameAt;
            if (dt > 0) {
                var fps = 1000 / dt;
                Game.metrics._fps = Game.metrics._fps ? (Game.metrics._fps * 0.9 + fps * 0.1) : fps;
            }
        }
        Game.metrics._lastFrameAt = now;
        var hud = document.getElementById('GameHUD');
        if (!hud) return;
        if (!Game.ui.lastMetrics.visible) {
            hud.style.display = 'block';
            Game.ui.lastMetrics.visible = true;
        }
        var fpsText = (Game.metrics._fps || 0).toFixed(0);
        var inputMs = Game.metrics._lastInputAt ? Math.max(0, ((now - Game.metrics._lastInputAt) >> 0)) : 0;
        if (Game.ui.lastMetrics.fps !== fpsText || Game.ui.lastMetrics.inputMs !== inputMs) {
            hud.textContent = 'FPS ' + fpsText + ' | Input ' + inputMs + 'ms';
            Game.ui.lastMetrics.fps = fpsText;
            Game.ui.lastMetrics.inputMs = inputMs;
        }
    },
    refreshMultiSelectBox: function () {
        var divs = $('div.override div.multiSelection div');
        //Only refresh border color on current multiSelect box
        for (var n = 0; n < divs.length; n++) {
            divs[n].style.borderColor = Game.allSelected[n].lifeStatus();
        }
    },
    drawMultiSelectBox: function () {
        //Clear old icons
        $('div.override div.multiSelection')[0].innerHTML = '';
        //Redraw all icons
        Game.allSelected.forEach(function (chara, N) {
            var node = document.createElement('div');
            node.setAttribute('name', 'portrait');
            //Override portrait
            if (chara.portrait) node.className = chara.portrait;
            else node.className = (chara instanceof Building) ? (chara.attack ? chara.inherited.inherited.name : chara.inherited.name) : chara.name;
            node.title = chara.name;
            node.style.borderColor = chara.lifeStatus();
            node.onclick = function () {
                //Selection execute
                Game.unselectAll();
                Game.changeSelectedTo(chara);
                //Single selection mode
                $('div.override').hide();
                $('div.override div.multiSelection').hide();
            };
            $('div.override div.multiSelection')[0].appendChild(node);
        });
        var iconNum = $('div.override div.multiSelection div').length;
        //Adjust width if unit icon space overflow
        $('div.override div.multiSelection').css('width', (iconNum > 12 ? Math.ceil(iconNum / 2) * 55 : 330) + 'px');
        //Adjust background position after added into DOM, nth starts from 1st(no 0th)
        for (var n = 1; n <= iconNum; n++) {
            var bgPosition = $('div.override div.multiSelection div:nth-child(' + n + ')').css('background-position');
            bgPosition = bgPosition.split(' ').map(function (pos) {
                return parseInt(pos) * 0.75 + 'px';
            }).join(' ');
            $('div.override div.multiSelection div:nth-child(' + n + ')').css('background-position', bgPosition);
        }
    },
    animation: function () {
        var loop = function () {
            if (Game.isPaused) return;
            // Throttle game logic to _frameInterval pace using rAF
            var now = performance.now();
            if (Game._lastLoopTime && (now - Game._lastLoopTime) < Game._frameInterval) {
                Game._rafId = requestAnimationFrame(Game._loop);
                return;
            }
            Game._lastLoopTime = now;
            var cullMargin = Game.perf.cullMargin;
            var aiMargin = Game.perf.aiNearMargin;
            //Clear all canvas
            Game.cxt.clearRect(0, 0, Game.HBOUND, Game.VBOUND);
            Game.frontCxt.clearRect(0, 0, Game.HBOUND, Game.VBOUND);
            //Layer0: Refresh map if needed
            if (GameMap.needRefresh) {
                GameMap.refresh(GameMap.needRefresh);
                GameMap.needRefresh = false;
            }
            if (Game.pathfinding) Game.pathfinding.tick();
            //Layer1: Show all buildings - GC with reverse sweep
            for (var N = Building.allBuildings.length - 1; N >= 0; N--) {
                var build = Building.allBuildings[N];
                if (build.status == "dead") {
                    var subArr = build.isEnemy ? Building.enemyBuildings : Building.ourBuildings;
                    var index = subArr.indexOf(build);
                    if (index !== -1) subArr.splice(index, 1);
                    Building.allBuildings.splice(N, 1);
                    continue;
                }
            }
            for (var N = 0; N < Building.allBuildings.length; N++) {
                var build = Building.allBuildings[N];
                var inView = Game._isVisible(build, cullMargin);
                if (inView) Game.draw(build);
                if (build.bullet && (inView || Game._anyVisibleBullet(build.bullet))) Game.drawBullet(build.bullet);
                if (build.AI && Game._shouldRunAI(build, Game._isVisible(build, aiMargin))) build.AI();
            }
            //Layer2: Show all existed units - GC with reverse sweep
            for (var N = Unit.allUnits.length - 1; N >= 0; N--) {
                var chara = Unit.allUnits[N];
                if (chara.status == "dead") {
                    var subArr = chara.isFlying
                        ? (chara.isEnemy ? Unit.enemyFlyingUnits : Unit.ourFlyingUnits)
                        : (chara.isEnemy ? Unit.enemyGroundUnits : Unit.ourGroundUnits);
                    var index = subArr.indexOf(chara);
                    if (index !== -1) subArr.splice(index, 1);
                    Unit.allUnits.splice(N, 1);
                }
            }
            for (var N = 0; N < Unit.allUnits.length; N++) {
                var chara = Unit.allUnits[N];
                var inView = Game._isVisible(chara, cullMargin);
                if (inView) Game.draw(chara);
                if (chara.bullet && (inView || Game._anyVisibleBullet(chara.bullet))) Game.drawBullet(chara.bullet);
                if (chara.attack && chara.AI && Game._shouldRunAI(chara, Game._isVisible(chara, aiMargin))) chara.AI();
                if (inView || (Game._clock % 5 === 0)) Referee.judgeReachDestination(chara);
            }
            //Layer3: Draw effects above units - GC with reverse sweep
            for (var N = Burst.allEffects.length - 1; N >= 0; N--) {
                var effect = Burst.allEffects[N];
                if (effect.status == "dead" || (effect.target && effect.target.status == "dead")) {
                    Burst.allEffects.splice(N, 1);
                }
            }
            for (var N = 0; N < Burst.allEffects.length; N++) {
                if (Game._isVisible(Burst.allEffects[N], cullMargin)) Game.drawEffect(Burst.allEffects[N]);
            }
            //Layer4: Draw drag rect
            if (mouseController.drag) {
                Game.cxt.lineWidth = 3;
                Game.cxt.strokeStyle = "green";
                Game.cxt.strokeRect(mouseController.startPoint.x, mouseController.startPoint.y,
                    mouseController.endPoint.x - mouseController.startPoint.x,
                    mouseController.endPoint.y - mouseController.startPoint.y);
            }
            //LayerBottom: Draw info box and resource box
            Game.drawInfoBox();
            Game.drawSourceBox();
            Game.drawProcessingBox();
            Game.drawMetrics();
            //Release selected unit when unit died or is invisible enemy
            if (Game.selectedUnit.status == "dead" || (Game.selectedUnit.isInvisible && Game.selectedUnit.isEnemy)) {
                Game.selectedUnit.selected = false;
                Game.changeSelectedTo({});
            }
            //Mr.Referee will judge Arbiter's effect
            Referee.judgeArbiter();
            //Mr.Referee will judge detector: override Arbiter effect
            Referee.judgeDetect();
            //Adjust location for collision (throttle to every 2 ticks)
            if (Game._clock % 2 === 0) Referee.judgeCollision();
            //Mr.Referee will recover charas when needed
            Referee.judgeRecover();
            //Mr.Referee will kill die survivor
            Referee.judgeDying();
            //Update man data (throttle to every 5 ticks instead of every tick)
            if (Game._clock % 5 === 0) Referee.judgeMan();
            //Mr.Referee will help add larvas
            Referee.addLarva();
            //Mr.Referee will monitor mini map every 1 sec
            Referee.monitorMiniMap();
            //Mr.Referee will cover fogs on maps every 1 sec
            Referee.coverFog();
            //Mr.Referee will alter info box mode every 1 sec
            Referee.alterSelectionMode();
            //Mr.Referee will judge win/lose once each loop
            Referee.judgeWinLose();
            //Clock ticking
            Game._clock++;
            //Schedule next frame
            Game._rafId = requestAnimationFrame(Game._loop);
        };
        Game._loop = loop;
        Game._lastLoopTime = 0;
        Game.stopAnimation();
        Game._rafId = requestAnimationFrame(Game._loop);
    },
    stopAnimation: function () {
        if (Game._rafId) {
            cancelAnimationFrame(Game._rafId);
            Game._rafId = 0;
        }
        // Legacy fallback cleanup
        if (Game._timer !== -1) {
            clearInterval(Game._timer);
            Game._timer = -1;
        }
    },
    stop: function (charas) {
        charas.forEach(function (chara) {
            chara.stop();
        });
        Game.stopAnimation();
    },
    win: function () {
        Game.stop(Unit.allUnits);
        $('div#GamePlay').fadeOut(3000);
        setTimeout(function () {
            Game.layerSwitchTo("GameWin");
            //Sound effect
            new Audio('bgm/GameWin.wav').play();
        }, 3000);
    },
    lose: function () {
        Game.stop(Unit.allUnits);
        $('div#GamePlay').fadeOut(3000);
        setTimeout(function () {
            Game.layerSwitchTo("GameLose");
            //Sound effect
            new Audio('bgm/GameLose.wav').play();
        }, 3000);
    },
    showWarning: function (msg, interval) {
        //Default interval
        if (!interval) interval = 3000;
        //Show message for a period
        $('div.warning_Box').html(msg).show();
        //Hide message after a period
        setTimeout(function () {
            $('div.warning_Box').html('').hide();
        }, interval);
    },
    showMessage: function (msg, interval) {
        //Default interval
        if (!interval) interval = 3000;
        //Show message for a period
        $('div.message_Box').html(msg).show();
        //Hide message after a period
        setTimeout(function () {
            $('div.message_Box').html('').hide();
        }, interval);
    },
    resizeWindow: function () {
        //Update parameters
        Game.HBOUND = innerWidth;//$('body')[0].scrollWidth
        Game.VBOUND = innerHeight;//$('body')[0].scrollHeight
        Game.infoBox.width = Game.HBOUND - 295;
        Game.infoBox.y = Game.VBOUND - 110;
        //Resize canvas
        $('#GamePlay>canvas')[0].width = Game.HBOUND;
        $('#GamePlay>canvas')[0].height = Game.VBOUND;
        GameMap.fogCanvas.width = Game.HBOUND;
        GameMap.fogCanvas.height = Game.VBOUND - Game.infoBox.height + 5;
        //Resize panel_Info
        $('div.panel_Info')[0].style.width = ((Game.HBOUND - 295) + 'px');
        //Update map inside-stroke size
        GameMap.insideStroke.width = (130 * Game.HBOUND / GameMap.getCurrentMap().width) >> 0;
        GameMap.insideStroke.height = (130 * Game.VBOUND / GameMap.getCurrentMap().height) >> 0;
        //Redraw map
        GameMap.draw();
        //Need re-calculate fog immediately
        GameMap.refreshFog();
        if (window.mouseController && mouseController._updateFrontOffset) mouseController._updateFrontOffset();
    }
};
