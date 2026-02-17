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
    fogCxt: null,
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
        lastMetrics: { fps: null, inputMs: null, visible: false },
        lastAlerts: { underAttackAt: 0, underAttackPing: null }
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
    selectionCap: 12,
    _oldAllSelected: [],
    race: {
        selected: 'Terran',
        choose: function (race) {
            this.selected = race;
            $('div#GamePlay').attr('race', race);
        }
    },
    layerSwitchTo: function (layerName) {
        $('div.GameLayer').hide();
        $('#' + layerName).show();
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
        if (Game._timer === -1 && typeof Game._loop === 'function') {
            Game.metrics._lastFrameAt = 0;
            Game._timer = setInterval(Game._loop, Game._frameInterval);
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
    ensureGasSmoke: function () {
        if (typeof Burst === 'undefined' || !Burst || !Burst.GasSmoke) return;
        var ensure = function (chara, scale) {
            if (!chara || chara.status === 'dead') return;
            if (!chara.gasSmoke || chara.gasSmoke.status === 'dead') {
                chara.gasSmoke = new Burst.GasSmoke({ target: chara, above: true, scale: scale, duration: -1 });
            }
        };
        var isGasBuilding = function (b) {
            if (!b || !b.name) return false;
            return b.name === 'Refinery' || b.name === 'Extractor' || b.name === 'Assimilator' || /Geyser/i.test(b.name);
        };
        var isGasResourceUnit = function (u) {
            if (!u || !u.name) return false;
            if (/Geyser/i.test(u.name)) return true;
            if (u.isResource && u.value != null && u.value >= 3000) return true;
            return false;
        };
        if (typeof Building !== 'undefined' && Building && Building.allBuildings) {
            Building.allBuildings.forEach(function (b) {
                if (!b) return;
                if (isGasBuilding(b)) ensure(b, 1.4);
            });
        }
        if (typeof Unit !== 'undefined' && Unit && Unit.allUnits) {
            Unit.allUnits.forEach(function (u) {
                if (!u) return;
                if (isGasResourceUnit(u)) ensure(u, 1.6);
            });
        }
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
    }
};
