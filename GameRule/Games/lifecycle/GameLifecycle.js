Game.init = function () {
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
};
Game.start = function () {
    Game.layerSwitchTo("GameStart");
    $('.levelSelectionBg').html('');
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
};
Game.play = function () {
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
};
Game.loadGameplayAssets = function (callback) {
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
};
Game.preloadCurrentLevelAssets = function (callback) {
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
};
Game.restartLevel = function () {
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
};
Game.win = function () {
    Game.stop(Unit.allUnits);
    $('div#GamePlay').fadeOut(3000);
    setTimeout(function () {
        Game.layerSwitchTo("GameWin");
        new Audio('bgm/GameWin.wav').play();
    }, 3000);
};
Game.lose = function () {
    Game.stop(Unit.allUnits);
    $('div#GamePlay').fadeOut(3000);
    setTimeout(function () {
        Game.layerSwitchTo("GameLose");
        new Audio('bgm/GameLose.wav').play();
    }, 3000);
};
Game.showWarning = function (msg, interval) {
    if (!interval) interval = 3000;
    $('div.warning_Box').html(msg).show();
    setTimeout(function () {
        $('div.warning_Box').html('').hide();
    }, interval);
};
Game.raiseUnderAttack = function (chara) {
    if (!chara || chara.isEnemy) return;
    var now = (window.performance && performance.now) ? performance.now() : Date.now();
    var lastAt = (Game.ui && Game.ui.lastAlerts) ? Game.ui.lastAlerts.underAttackAt : 0;
    if (now - lastAt < 2500) return;
    if (Game.ui && Game.ui.lastAlerts) Game.ui.lastAlerts.underAttackAt = now;
    if (Game.ui && Game.ui.lastAlerts) {
        Game.ui.lastAlerts.underAttackPing = {
            x: chara.posX(),
            y: chara.posY(),
            until: now + 2000
        };
    }
    Game.showWarning('Our forces are under attack');
};
Game.showMessage = function (msg, interval) {
    if (!interval) interval = 3000;
    $('div.message_Box').html(msg).show();
    setTimeout(function () {
        $('div.message_Box').html('').hide();
    }, interval);
};
Game.resizeWindow = function () {
    Game.HBOUND = innerWidth;
    Game.VBOUND = innerHeight;
    Game.infoBox.width = Game.HBOUND - 295;
    Game.infoBox.y = Game.VBOUND - 110;
    $('#GamePlay>canvas')[0].width = Game.HBOUND;
    $('#GamePlay>canvas')[0].height = Game.VBOUND;
    GameMap.fogCanvas.width = Game.HBOUND;
    GameMap.fogCanvas.height = Game.VBOUND - Game.infoBox.height + 5;
    $('div.panel_Info')[0].style.width = ((Game.HBOUND - 295) + 'px');
    GameMap.insideStroke.width = (130 * Game.HBOUND / GameMap.getCurrentMap().width) >> 0;
    GameMap.insideStroke.height = (130 * Game.VBOUND / GameMap.getCurrentMap().height) >> 0;
    GameMap.draw();
    GameMap.refreshFog();
    if (window.mouseController && mouseController._updateFrontOffset) mouseController._updateFrontOffset();
};
