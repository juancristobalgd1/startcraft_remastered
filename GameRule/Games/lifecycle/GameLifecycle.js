import '../../../Utils/jquery.min.js';
import Game from '../core/GameBase.js';
import sourceLoader from '../../../Utils/sourceLoader.js';
import GameMap from '../../../Characters/Map.js';
import keyController from '../../../Controller/keyController.js';
import mouseController from '../../../Controller/mouseController.js';

const $ = globalThis.$;

Game.layerSwitchTo = function (layerName) {
    $('div.GameLayer').hide();
    if (layerName) {
        const target = $('#' + layerName);
        if (target.length) target.show();
    }
};

const _formatScaleLabel = function (scale) {
    if (scale === 'large') return 'Large';
    if (scale === 'xlarge') return 'XLarge';
    return 'Normal';
};

Game._syncPauseMenuOptions = function () {
    var metricsBtn = document.getElementById('PauseToggleMetrics');
    if (metricsBtn) metricsBtn.textContent = 'Toggle FPS/Input: ' + ((Game.metrics && Game.metrics.enabled) ? 'On' : 'Off');
    var hapticsBtn = document.getElementById('PauseToggleHaptics');
    if (hapticsBtn) hapticsBtn.textContent = 'Toggle Haptics: ' + (Game.hapticsEnabled ? 'On' : 'Off');
    var uiScaleBtn = document.getElementById('PauseUiScale');
    if (uiScaleBtn) uiScaleBtn.textContent = 'UI Size: ' + _formatScaleLabel(Game.uiScale);
    var reducedMotionBtn = document.getElementById('PauseReducedMotion');
    if (reducedMotionBtn) reducedMotionBtn.textContent = 'Reduced Motion: ' + (Game.reducedMotion ? 'On' : 'Off');
    var fontScaleBtn = document.getElementById('PauseFontScale');
    if (fontScaleBtn) fontScaleBtn.textContent = 'Font Size: ' + _formatScaleLabel(Game.fontScale);
};

Game.setUiScale = function (scale) {
    Game.uiScale = scale || 'normal';
    var node = document.getElementById('GamePlay');
    if (node) {
        if (Game.uiScale === 'normal') node.removeAttribute('data-ui-scale');
        else node.setAttribute('data-ui-scale', Game.uiScale);
    }
    Game._syncPauseMenuOptions();
};

Game.setFontScale = function (scale) {
    Game.fontScale = scale || 'normal';
    var node = document.getElementById('GamePlay');
    if (node) {
        if (Game.fontScale === 'normal') node.removeAttribute('data-font-scale');
        else node.setAttribute('data-font-scale', Game.fontScale);
    }
    Game._syncPauseMenuOptions();
};

Game.setReducedMotion = function (enabled) {
    Game.reducedMotion = Boolean(enabled);
    var node = document.getElementById('GamePlay');
    if (node) {
        if (Game.reducedMotion) node.setAttribute('data-reduced-motion', 'true');
        else node.removeAttribute('data-reduced-motion');
    }
    Game._syncPauseMenuOptions();
};

Game.race = Game.race || {};
Game.race.selected = Game.race.selected || 'Terran';
Game.race.choose = function (raceName) {
    if (!raceName) return;
    Game.race.selected = raceName;
    var node = document.getElementById('GamePlay');
    if (node) node.setAttribute('race', raceName);
};

Game.pause = function () {
    if (Game.isPaused) return;
    Game.isPaused = true;
    var pauseMenu = document.getElementById('PauseMenu');
    if (pauseMenu) {
        pauseMenu.style.display = 'block';
        pauseMenu.setAttribute('aria-hidden', 'false');
    }
    var pauseBtn = document.getElementById('PauseButton');
    if (pauseBtn) pauseBtn.textContent = 'Resume';
};

Game.resume = function () {
    Game.isPaused = false;
    var pauseMenu = document.getElementById('PauseMenu');
    if (pauseMenu) {
        pauseMenu.style.display = 'none';
        pauseMenu.setAttribute('aria-hidden', 'true');
    }
    var pauseBtn = document.getElementById('PauseButton');
    if (pauseBtn) pauseBtn.textContent = 'Pause';
};

Game.togglePause = function () {
    if (Game.isPaused) Game.resume();
    else Game.pause();
};

Game.init = function () {
    $('div.GameLayer').on("selectstart", (event) => {
        event.preventDefault();
    });
    window.onresize = Game.resizeWindow;
    Game.layerSwitchTo("GameLoading");
    if (typeof window !== 'undefined' && window.Resource && window.Resource.init && !window.Resource[0]) {
        window.Resource.init();
    }
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
    Game._charaFolderById = (function () {
        var map = {};
        var add = function (folder, names) {
            names.forEach(function (name) {
                map[name] = folder;
            });
        };
        add("Terran", [
            "Marine", "Firebat", "Ghost", "Medic", "SCV", "Vulture", "Tank", "Goliath", "Wraith", "Valkyrie",
            "BattleCruiser", "Dropship", "Vessel", "Civilian", "Sarah", "HeroCruiser", "Kerrigan", "TerranBuilding"
        ]);
        add("Protoss", [
            "Zealot", "Dragoon", "DragoonB", "Templar", "DarkTemplar", "Archon", "DarkArchon", "Reaver", "Scout",
            "Carrier", "Arbiter", "Corsair", "CorsairB", "Shuttle", "Observer", "Probe", "ProtossBuilding"
        ]);
        add("Zerg", [
            "Zergling", "Hydralisk", "Hydralisk_legacy", "Lurker", "Ultralisk", "Defiler", "Drone", "Overlord",
            "Queen", "Mutalisk", "Guardian", "Devourer", "Scourge", "Broodling", "Larva", "InfestedTerran",
            "ZergBuilding"
        ]);
        add("Neutral", ["Bengalaas", "Kakaru", "Ragnasaur", "Rhynsdon", "Scantid", "Ursadon"]);
        add("Effects", ["Burst", "BuildingBurst", "Magic", "Mud"]);
        add("UI", ["Portrait"]);
        return map;
    })();
    Game._resolveCharaSrc = function (id) {
        var folder = Game._charaFolderById[id];
        return folder ? ("img/Charas/" + folder + "/" + id + ".png") : ("img/Charas/" + id + ".png");
    };
    Game.ensureAsset = function (id) {
        if (!id || sourceLoader.sources[id]) return true;
        var src = Game._assetSrc[id];
        if (!src && id.indexOf('Map_') === 0) return false;
        if (!src) src = Game._resolveCharaSrc(id);
        Game._loadAsset("img", src, id);
        return false;
    };

    // Preload all unit sprites (like legacy version)
    const unitSprites = [
        // Zerg units
        "Mutalisk", "Devourer", "Guardian", "Overlord", "Drone", "Zergling", "Hydralisk",
        "Scourge", "Lurker", "Ultralisk", "Broodling", "InfestedTerran", "Queen", "Defiler", "Larva",
        // Terran units
        "BattleCruiser", "Wraith", "SCV", "Civilian", "Marine", "Firebat", "Ghost", "Vulture",
        "Tank", "Goliath", "Medic", "Dropship", "Vessel", "Valkyrie",
        // Protoss units
        "Probe", "Zealot", "Dragoon", "Templar", "DarkTemplar", "Reaver", "Archon", "DarkArchon",
        "Shuttle", "Observer", "Arbiter", "Scout", "Carrier", "Corsair",
        // Neutral
        "Ragnasaur", "Rhynsdon", "Ursadon", "Bengalaas", "Scantid", "Kakaru",
        // Heroes
        "HeroCruiser", "Sarah", "Kerrigan",
        // Buildings
        "ZergBuilding", "TerranBuilding", "ProtossBuilding"
    ];

    unitSprites.forEach(function (name) {
        var folder = Game._charaFolderById[name];
        var src = folder ? ("img/Charas/" + folder + "/" + name + ".png") : ("img/Charas/" + name + ".png");
        Game._loadAsset("img", src, name);
    });

    [
        ["img", "img/Charas/Burst.png", "Burst"],
        ["img", "img/Charas/BuildingBurst.png", "BuildingBurst"],
        ["img", "img/Charas/Portrait.png", "Portrait"],
        ["img", "img/Charas/Magic.png", "Magic"],
        ["img", "img/Charas/Mud.png", "Mud"],
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
        // Initialize canvas dimensions
        Game.resizeWindow();
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
    if (Game.level !== 12) {
        Game.replayFlag = false;
    }
    Game.loadGameplayAssets(function () {
        Resource.init();
        Levels[Game.level - 1].load();
        setTimeout(function () {
            Game.preloadCurrentLevelAssets(function () {
                Game.layerSwitchTo("GamePlay");
                Game.resizeWindow();
                mouseController.toControlAll();
                keyController.start();
                Game.initReplayRecording();
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
        ["img", Game._resolveCharaSrc("ZergBuilding"), "ZergBuilding"],
        ["img", Game._resolveCharaSrc("TerranBuilding"), "TerranBuilding"],
        ["img", Game._resolveCharaSrc("ProtossBuilding"), "ProtossBuilding"],
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
        ["img", Game._resolveCharaSrc("Mud"), "Mud"],
        ["img", Game._resolveCharaSrc("Burst"), "Burst"],
        ["img", Game._resolveCharaSrc("Mutalisk"), "Mutalisk"],
        ["img", Game._resolveCharaSrc("BuildingBurst"), "BuildingBurst"],
        ["img", Game._resolveCharaSrc("Portrait"), "Portrait"],
        ["img", Game._resolveCharaSrc("Magic"), "Magic"]
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
        if (!b) return;
        if (b.source) add(b.source);
        else if (b.inherited) {
            add(b.attack && b.inherited.inherited ? b.inherited.inherited.name : b.inherited.name);
        }
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
    Game.initReplayRecording();
    setTimeout(function () {
        Game.resizeWindow();
        mouseController.toControlAll();
        Game.animation();
    }, 0);
};
Game.win = function () {
    Game.saveReplay();
    Game.stop(Unit.allUnits);
    $('div#GamePlay').fadeOut(3000);
    setTimeout(function () {
        Game.layerSwitchTo("GameWin");
        new Audio('bgm/GameWin.wav').play();
    }, 3000);
};
Game.lose = function () {
    Game.saveReplay();
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
    const backCanvas = document.getElementById('backCanvas');
    const middleCanvas = document.getElementById('middleCanvas');
    const frontCanvas = document.getElementById('frontCanvas');
    if (backCanvas) {
        backCanvas.width = Game.HBOUND;
        backCanvas.height = Game.VBOUND;
        Game.backCxt = backCanvas.getContext('2d');
        if (!Game.mainCxt) Game.mainCxt = Game.backCxt;
    }
    if (middleCanvas) {
        middleCanvas.width = Game.HBOUND;
        middleCanvas.height = Game.VBOUND;
        Game.cxt = middleCanvas.getContext('2d');
    }
    if (frontCanvas) {
        frontCanvas.width = Game.HBOUND;
        frontCanvas.height = Game.VBOUND;
        Game.frontCxt = frontCanvas.getContext('2d');
    }

    // Update map viewport rect
    if (GameMap.rect) {
        GameMap.rect.width = Game.HBOUND;
        GameMap.rect.height = Game.VBOUND;
    }
    $('div.panel_Info')[0].style.width = ((Game.HBOUND - 295) + 'px');
    const currentMap = GameMap.getCurrentMap();
    if (currentMap) {
        GameMap.insideStroke.width = (130 * Game.HBOUND / currentMap.width) >> 0;
        GameMap.insideStroke.height = (130 * Game.VBOUND / currentMap.height) >> 0;
    } else {
        GameMap.insideStroke.width = 0;
        GameMap.insideStroke.height = 0;
    }
    if (GameMap.refresh) GameMap.refresh(1);
    if (GameMap.refreshMiniMap) GameMap.refreshMiniMap();
    if (GameMap.refreshFog) GameMap.refreshFog();
    if (mouseController && mouseController._updateFrontOffset) mouseController._updateFrontOffset();
};

Game.initReplayRecording = function () {
    if (Game.replayFlag) return;
    Game.replay = {
        level: Game.level,
        team: Game.team,
        cmds: {},
        end: 0
    };
};

Game.saveReplay = function () {
    if (Game.replayFlag) return;
    Game.replay.end = Game._clock;
    try {
        localStorage.setItem('lastReplay', JSON.stringify(Game.replay));
    } catch (e) {
        console.error("Failed to save replay to localStorage:", e);
    }
    Game.saveReplayIntoDB();
};

Game.saveReplayIntoDB = function () {
    if (Game.replayFlag) return;
    if (typeof indexedDB === 'undefined') return;
    const request = indexedDB.open("StarCraftReplays", 1);
    request.onupgradeneeded = function (event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("replays")) {
            db.createObjectStore("replays", { keyPath: "id", autoIncrement: true });
        }
    };
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(["replays"], "readwrite");
        const store = transaction.objectStore("replays");
        const replayData = Object.assign({}, Game.replay, {
            time: Date.now(),
            label: "Level " + Game.level + " - " + new Date().toLocaleString()
        });
        store.add(replayData);
    };
    request.onerror = function (event) {
        console.error("IndexedDB error saving replay:", event.target.error);
    };
};
