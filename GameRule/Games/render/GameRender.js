import '../../../Utils/jquery.min.js';
import Game from '../core/GameBase.js';
import Gobj from '../../../Characters/Gobj.js';
import Unit from '../../../Characters/Units/core/UnitBase.js';
import Building from '../../../Characters/Buildings/core/BuildingBase.js';
import Bullets from '../../../Characters/Bullets/core/BulletsBase.js';
import Burst from '../../../Characters/Bursts/core/BurstBase.js';
import GameMap from '../../../Characters/Map.js';
import sourceLoader from '../../../Utils/sourceLoader.js';

const $ = globalThis.$;

if (!Game._isVisible) {
    Game._isVisible = function (chara, margin) {
        if (!chara) return false;
        var map = (typeof GameMap !== 'undefined' && GameMap) ? GameMap : { offsetX: 0, offsetY: 0 };
        var mx = map.offsetX || 0;
        var my = map.offsetY || 0;
        var x = (typeof chara.posX === 'function') ? chara.posX() : chara.x;
        var y = (typeof chara.posY === 'function') ? chara.posY() : chara.y;
        if (x == null || y == null) return false;
        var w = chara.width || 0;
        var h = chara.height || 0;
        var m = margin || 0;
        return (x + w + m >= mx) && (x - m <= mx + Game.HBOUND) && (y + h + m >= my) && (y - m <= my + Game.VBOUND);
    };
}
if (!Game._anyVisibleBullet) {
    Game._anyVisibleBullet = function (bullet) {
        if (!bullet) return false;
        if (bullet instanceof Array) {
            for (var i = 0; i < bullet.length; i++) {
                if (Game._anyVisibleBullet(bullet[i])) return true;
            }
            return false;
        }
        if (bullet.status == "dead") return false;
        return Game._isVisible(bullet, 0);
    };
}

Game.draw = function (chara) {
    if (!(chara instanceof Gobj)) return;
    if (chara.status == "dead") return;
    if (!chara.insideScreen()) return;
    if (chara.noRender) return;
    if (chara.isEnemy && GameMap.fogFlag && !GameMap.isUnitVisibleToPlayer(chara)) return;
    var cxt = ((chara instanceof Unit) || (chara instanceof Building)) ? Game.cxt : Game.frontCxt;
    cxt.save();
    cxt.globalAlpha = 1;
    var now = (window.performance && performance.now) ? performance.now() : Date.now();
    if (chara._hitFlashUntil && now < chara._hitFlashUntil) {
        cxt.filter = "brightness(1.8) contrast(1.2)";
    }
    // Shadow offsets matching original
    cxt.shadowOffsetX = (chara.isFlying) ? 5 : 3;
    cxt.shadowOffsetY = (chara.isFlying) ? 20 : 8;
    cxt.shadowColor = "rgba(0,0,0,0.4)";
    // Close shadow for burrowed
    if (chara.buffer && chara.buffer.Burrow) cxt.shadowOffsetX = cxt.shadowOffsetY = 0;
    // Draw invisible
    if (chara.isInvisible != undefined) {
        cxt.globalAlpha = (chara.isEnemy && chara.isInvisible) ? 0 : 0.5;
        if (chara.burrowBuffer && !chara.isEnemy) cxt.globalAlpha = 1;
    }
    var assetId = chara.source || chara.name;
    var imgSrc = sourceLoader.sources[assetId];

    if (!imgSrc) {
        Game.ensureAsset(assetId);
        cxt.restore();
        return;
    }
    // Fix: InvalidStateError when image is broken or still loading
    if (imgSrc instanceof HTMLImageElement) {
        if (!imgSrc.complete) {
            cxt.restore();
            return;
        }
        if (imgSrc.naturalWidth === 0) {
            cxt.restore();
            return;
        }
    }
    var charaX = (chara.x - GameMap.offsetX) >> 0;
    var charaY = (chara.y - GameMap.offsetY) >> 0;
    if (chara.direction == undefined) {
        if (!chara.imgPos || !chara.imgPos[chara.status]) {
            cxt.restore();
            return;
        }
        var _left = chara.imgPos[chara.status].left;
        var _top = chara.imgPos[chara.status].top;
        if (_left instanceof Array || _top instanceof Array) {
            cxt.drawImage(imgSrc,
                _left[chara.action], _top[chara.action], chara.width, chara.height,
                charaX, charaY, chara.width, chara.height);
        }
        else {
            cxt.drawImage(imgSrc,
                _left, _top, chara.width, chara.height,
                charaX, charaY, chara.width, chara.height);
        }
    }
    else {
        if (!chara.imgPos || !chara.imgPos[chara.status]) {
            cxt.restore();
            return;
        }
        var _left = chara.imgPos[chara.status].left[chara.direction];
        var _top = chara.imgPos[chara.status].top[chara.direction];
        if (_left instanceof Array || _top instanceof Array) {
            cxt.drawImage(imgSrc,
                _left[chara.action], _top[chara.action], chara.width, chara.height,
                charaX, charaY, chara.width, chara.height);
        }
        else {
            cxt.drawImage(imgSrc,
                _left, _top, chara.width, chara.height,
                charaX, charaY, chara.width, chara.height);
        }
    }
    cxt.restore();
    if (chara.isResource || (chara instanceof Building && ['Refinery', 'Extractor', 'Assimilator'].indexOf(chara.name) != -1)) {
        var amount = null;
        if (chara.isResource && chara.value != null) amount = chara.value;
        if (!chara.isResource && chara.gas != null) amount = chara.gas;
        if (amount != null) {
            var rcxt = Game.frontCxt;
            rcxt.save();
            rcxt.globalAlpha = 0.9;
            rcxt.font = '10px Arial';
            rcxt.fillStyle = '#bde7ff';
            rcxt.textAlign = 'center';
            rcxt.fillText((amount >> 0), chara.posX() - GameMap.offsetX, chara.y - GameMap.offsetY - 8);
            rcxt.restore();
        }
    }
    var now = (window.performance && performance.now) ? performance.now() : Date.now();
    // Hit flash white box has been replaced with modern pixel-level brightness filter above
    // Resource carrying visual for workers
    if (chara.carrying > 0) {
        var rx = (chara.posX() - GameMap.offsetX - 10) >> 0;
        var ry = (chara.posY() - GameMap.offsetY - 20) >> 0;
        var resImg = (chara.carrying == 1) ? sourceLoader.sources['img_mine'] : sourceLoader.sources['img_gas'];
        if (resImg) {
            Game.frontCxt.drawImage(resImg, 0, 0, 32, 32, rx, ry, 24, 24);
        }
    }
    if (chara.selected == true || (chara._lifeBarUntil && now < chara._lifeBarUntil) || (chara._hitFlashUntil && now < chara._hitFlashUntil)) {
        cxt = Game.frontCxt;
        // Selection circle only if selected
        if (chara.selected) {
            cxt.strokeStyle = (chara.isEnemy) ? "red" : "green";
            cxt.lineWidth = 2;
            cxt.beginPath();
            cxt.arc(chara.posX() - GameMap.offsetX, chara.posY() - GameMap.offsetY, chara.radius(), 0, 2 * Math.PI);
            cxt.stroke();
        }
        cxt.globalAlpha = 1;
        cxt.lineWidth = 1;
        var offsetY = -6 - (chara.MP ? 5 : 0) - (chara.SP ? 5 : 0);
        var lifeRatio = chara.life / chara.get('HP');
        cxt.strokeStyle = "black";
        if (chara.SP) {
            cxt.fillStyle = "blue";
            cxt.fillRect(chara.x - GameMap.offsetX, chara.y - GameMap.offsetY + offsetY, chara.width * chara.shield / chara.get('SP'), 5);
            cxt.strokeRect(chara.x - GameMap.offsetX, chara.y - GameMap.offsetY + offsetY, chara.width, 5);
            cxt.fillStyle = (lifeRatio > 0.7) ? "green" : (lifeRatio > 0.3) ? "yellow" : "red";
            cxt.fillRect(chara.x - GameMap.offsetX, chara.y - GameMap.offsetY + offsetY + 5, chara.width * lifeRatio, 5);
            cxt.strokeRect(chara.x - GameMap.offsetX, chara.y - GameMap.offsetY + offsetY + 5, chara.width, 5);
        }
        else {
            cxt.fillStyle = (lifeRatio > 0.7) ? "green" : (lifeRatio > 0.3) ? "yellow" : "red";
            cxt.fillRect(chara.x - GameMap.offsetX, chara.y - GameMap.offsetY + offsetY, chara.width * lifeRatio, 5);
            cxt.strokeRect(chara.x - GameMap.offsetX, chara.y - GameMap.offsetY + offsetY, chara.width, 5);
        }
        if (chara.MP) {
            cxt.fillStyle = "darkviolet";
            cxt.fillRect(chara.x - GameMap.offsetX, chara.y - GameMap.offsetY + offsetY + (chara.SP ? 10 : 5), chara.width * chara.magic / chara.get('MP'), 5);
            cxt.strokeRect(chara.x - GameMap.offsetX, chara.y - GameMap.offsetY + offsetY + (chara.SP ? 10 : 5), chara.width, 5);
        }
        if (chara.processing && chara.processing.time > 0) {
            const progressY = offsetY + (chara.SP ? 10 : 5) + (chara.MP ? 5 : 0) + 5;
            const now = new Date().getTime();
            const elapsed = now - chara.processing.startTime;
            const progress = Math.min(1, elapsed / (chara.processing.time * 100));
            cxt.fillStyle = "white";
            cxt.fillRect(chara.x - GameMap.offsetX, chara.y - GameMap.offsetY + progressY, chara.width * progress, 3);
            cxt.strokeRect(chara.x - GameMap.offsetX, chara.y - GameMap.offsetY + progressY, chara.width, 3);
        }
    }
};

Game.drawShadow = function (chara) {
    if (chara.status == "dead" || chara.noRender) return;
    if (chara.buffer && chara.buffer.Burrow) return;
    var cxt = Game.cxt;
    var assetId = chara.source || chara.name;
    var imgSrc = sourceLoader.sources[assetId];
    if (!imgSrc) return;

    var offsetX = chara.isFlying ? 15 : 5;
    var offsetY = chara.isFlying ? 25 : 8;
    var charaX = (chara.x - GameMap.offsetX + offsetX) >> 0;
    var charaY = (chara.y - GameMap.offsetY + offsetY) >> 0;

    cxt.save();
    cxt.globalAlpha = 0.4;
    // Apply grayscale/black filter for a real shadow look
    cxt.filter = 'brightness(0) blur(2px)';

    if (!chara.imgPos || !chara.imgPos[chara.status]) {
        cxt.restore();
        return;
    }

    // Handle direction-based sprites (units with direction property)
    if (chara.direction != undefined) {
        var _left = chara.imgPos[chara.status].left[chara.direction];
        var _top = chara.imgPos[chara.status].top[chara.direction];
        if (_left instanceof Array || _top instanceof Array) {
            cxt.drawImage(imgSrc,
                _left[chara.action], _top[chara.action], chara.width, chara.height,
                charaX, charaY, chara.width, chara.height);
        } else {
            cxt.drawImage(imgSrc,
                _left, _top, chara.width, chara.height,
                charaX, charaY, chara.width, chara.height);
        }
    } else {
        // Non-directional sprites
        if (chara.imgPos[chara.status].left instanceof Array || chara.imgPos[chara.status].top instanceof Array) {
            cxt.drawImage(imgSrc,
                chara.imgPos[chara.status].left[chara.action], chara.imgPos[chara.status].top[chara.action], chara.width, chara.height,
                charaX, charaY, chara.width, chara.height);
        } else {
            cxt.drawImage(imgSrc,
                chara.imgPos[chara.status].left, chara.imgPos[chara.status].top, chara.width, chara.height,
                charaX, charaY, chara.width, chara.height);
        }
    }
    cxt.restore();
};

Game.updatePortrait = function () {
    const chara = Game.selectedUnit;
    const $portrait = $('div[name="portrait"]');
    if (!$portrait.length) return;

    const hasSelection = chara && chara.name && chara.status != 'dead' && Object.keys(chara).length > 0;
    if (!hasSelection) {
        $portrait.hide();
        $('div.panel_Info>div.infoLeft').hide(); // Hide parent container if no selection
        return;
    }

    $portrait.show();
    $('div.panel_Info>div.infoLeft').show(); // Show parent container if there is a selection

    const portraitImg = sourceLoader.sources['Portrait'];
    if (portraitImg) {
        $portrait.css('background-image', `url(${portraitImg.src})`);
    }

    let typeName = chara.name;
    if (chara instanceof Building) {
        // Correctly identify building race for portraits
        if (chara.inherited && chara.inherited.name) typeName = chara.inherited.name;
        else if (window.ZergBuilding && chara instanceof window.ZergBuilding) typeName = "ZergBuilding";
        else if (window.TerranBuilding && chara instanceof window.TerranBuilding) typeName = "TerranBuilding";
        else if (window.ProtossBuilding && chara instanceof window.ProtossBuilding) typeName = "ProtossBuilding";
    }
    $portrait.attr('class', typeName);

    const baseOffset = chara.portraitOffset;
    if (baseOffset) {
        $portrait.css('background-position', `-${baseOffset.x}px -${baseOffset.y}px`);
    } else {
        $portrait.css('background-position', '');
    }
};

Game.drawEffect = function (chara) {
    if (!(chara instanceof Burst)) return;
    if (chara.status == "dead") return;
    if (!chara.insideScreen()) return;
    if (chara.target && chara.target.isEnemy && GameMap.fogFlag && !GameMap.isUnitVisibleToPlayer(chara.target)) return;
    var cxt = Game.frontCxt;
    cxt.save();

    // Procedural drawing of GasSmoke
    if (chara.constructor.name === "GasSmoke") {
        const cx = chara.target ? chara.target.posX() : (chara.x + chara.width / 2);
        const cy = chara.target ? chara.target.posY() : (chara.y + chara.height / 2);
        const baseClock = Game._clock;
        const scale = chara.scale || 1.0;
        for (let p = 0; p < 3; p++) {
            const lifetime = 60;
            const ageTick = (baseClock + p * 20) % lifetime;
            const age = ageTick / lifetime;
            const drift = Math.sin(age * Math.PI * 2 + p) * 12 * scale;
            const rise = -age * 30 * scale;
            const px = cx + drift - GameMap.offsetX;
            const py = cy + rise - GameMap.offsetY;
            const radius = (8 + age * 16) * scale;
            const opacity = Math.sin(age * Math.PI) * 0.22;
            const grad = cxt.createRadialGradient(px, py, radius * 0.1, px, py, radius);
            grad.addColorStop(0, `rgba(77, 220, 122, ${opacity})`);
            grad.addColorStop(0.5, `rgba(45, 180, 85, ${opacity * 0.5})`);
            grad.addColorStop(1, 'rgba(45, 180, 85, 0)');
            cxt.fillStyle = grad;
            cxt.beginPath();
            cxt.arc(px, py, radius, 0, Math.PI * 2);
            cxt.fill();
        }
        cxt.restore();
        return;
    }

    cxt.shadowOffsetX = (chara.isFlying) ? 5 : 3;
    cxt.shadowOffsetY = (chara.isFlying) ? 20 : 8;
    cxt.shadowColor = "rgba(0,0,0,0.4)";
    var imgSrc = sourceLoader.sources[chara.name];
    if (!imgSrc) {
        Game.ensureAsset(chara.name);
        cxt.restore();
        return;
    }
    if (chara.useGameClock && chara.frame && chara.frame[chara.status]) {
        chara.action = Game._clock % chara.frame[chara.status];
    }
    var charaX = (chara.x - GameMap.offsetX) >> 0;
    var charaY = (chara.y - GameMap.offsetY) >> 0;
    if (!chara.imgPos[chara.status]) {
        cxt.restore();
        return;
    }
    var _left = chara.imgPos[chara.status].left;
    var _top = chara.imgPos[chara.status].top;
    var times = chara.scale ? chara.scale : 1;
    if (_left instanceof Array || _top instanceof Array) {
        cxt.drawImage(imgSrc,
            _left[chara.action], _top[chara.action], chara.width, chara.height,
            charaX, charaY, chara.width * times >> 0, chara.height * times >> 0);
    }
    else {
        cxt.drawImage(imgSrc,
            _left, _top, chara.width, chara.height,
            charaX, charaY, chara.width * times >> 0, chara.height * times >> 0);
    }
    cxt.restore();
};
Game.drawBullet = function (chara) {
    if (chara instanceof Array) {
        chara.forEach(bullet => {
            Game.drawBullet(bullet);
        });
    }
    if (!(chara instanceof Bullets)) return;
    if (chara.status == "dead") return;
    if (!chara.insideScreen()) return;
    if (chara.owner && chara.owner.isEnemy && GameMap.fogFlag && !GameMap.isUnitVisibleToPlayer(chara.owner)) return;
    var imgSrc = sourceLoader.sources[chara.name];
    if (!imgSrc) {
        Game.ensureAsset(chara.name);
        return;
    }
    var _left = chara.imgPos[chara.status].left;
    var _top = chara.imgPos[chara.status].top;
    var centerX = (chara.posX() - GameMap.offsetX) >> 0;
    var centerY = (chara.posY() - GameMap.offsetY) >> 0;
    Game.frontCxt.save();
    Game.frontCxt.translate(centerX, centerY);
    Game.frontCxt.rotate(-chara.angle);
    Game.frontCxt.shadowOffsetX = (chara.owner.isFlying) ? 5 : 3;
    Game.frontCxt.shadowOffsetY = (chara.owner.isFlying) ? 20 : 5;
    Game.frontCxt.shadowColor = "rgba(0,0,0,0.4)";
    if (_left instanceof Array || _top instanceof Array) {
        Game.frontCxt.drawImage(imgSrc,
            _left[chara.action], _top[chara.action], chara.width, chara.height,
            -chara.width / 2 >> 0, -chara.height / 2 >> 0, chara.width, chara.height);
    }
    else {
        Game.frontCxt.drawImage(imgSrc,
            _left, _top, chara.width, chara.height,
            -chara.width / 2 >> 0, -chara.height / 2 >> 0, chara.width, chara.height);
    }
    Game.frontCxt.restore();
};
Game.animation = function () {
    var loop = function () {
        if (Game.isPaused) return;
        // Process due commands for current frame before drawing
        const commands = Game.commands[Game._clock];
        if (Array.isArray(commands)) {
            commands.forEach(func => {
                try {
                    func();
                } catch (e) {
                    console.error("Error executing commandTimeout callback:", e);
                }
            });
            delete Game.commands[Game._clock];
        }
        Game.cxt.clearRect(0, 0, Game.HBOUND, Game.VBOUND);
        Game.frontCxt.clearRect(0, 0, Game.HBOUND, Game.VBOUND);
        if (GameMap.needRefresh) {
            GameMap.refresh(GameMap.needRefresh);
            GameMap.needRefresh = false;
        }
        for (var N = 0; N < Building.allBuildings.length; N++) {
            var build = Building.allBuildings[N];
            if (build.status == "dead") {
                if (build.isEnemy) {
                    var index = $.inArray(build, Building.enemyBuildings);
                    Building.enemyBuildings.splice(index, (index == -1) ? 0 : 1);
                }
                else {
                    var index = $.inArray(build, Building.ourBuildings);
                    Building.ourBuildings.splice(index, (index == -1) ? 0 : 1);
                }
                Building.allBuildings.splice(N, 1);
                N--;
                continue;
            }
            Game.draw(build);
            if (build.bullet) Game.drawBullet(build.bullet);
            if (build.AI) build.AI();
        }
        // ORIGINAL LOGIC: Multi-pass rendering for better visual quality

        // Pass 1: Draw ALL shadows first
        Unit.allUnits.concat(Building.allBuildings).forEach(chara => {
            if (chara.status != "dead" && chara.insideScreen() && !chara.noRender) {
                if (chara.isEnemy && GameMap.fogFlag && !GameMap.isUnitVisibleToPlayer(chara)) return;
                Game.drawShadow(chara);
            }
        });

        // Pass 2: Draw Units
        // Layer2: Show all existed units
        // ORIGINAL LOGIC: Sort by Y to maintain perspective
        Unit.allUnits.sort((a, b) => (a.y + a.height) - (b.y + b.height));

        for (var N = 0; N < Unit.allUnits.length; N++) {
            var chara = Unit.allUnits[N];
            if (chara.status == "dead") {
                // ... (GC logic as before)
                if (chara.isFlying) {
                    if (chara.isEnemy) {
                        var index = $.inArray(chara, Unit.enemyFlyingUnits);
                        Unit.enemyFlyingUnits.splice(index, (index == -1) ? 0 : 1);
                    }
                    else {
                        var index = $.inArray(chara, Unit.ourFlyingUnits);
                        Unit.ourFlyingUnits.splice(index, (index == -1) ? 0 : 1);
                    }
                }
                else {
                    if (chara.isEnemy) {
                        var index = $.inArray(chara, Unit.enemyGroundUnits);
                        Unit.enemyGroundUnits.splice(index, (index == -1) ? 0 : 1);
                    }
                    else {
                        var index = $.inArray(chara, Unit.ourGroundUnits);
                        Unit.ourGroundUnits.splice(index, (index == -1) ? 0 : 1);
                    }
                }
                Unit.allUnits.splice(N, 1);
                N--;
                continue;
            }
            Game.draw(chara);
            if (chara.bullet) Game.drawBullet(chara.bullet);
            // Enhanced AI call: all with AI should execute it
            if (chara.AI) chara.AI();
            Referee.judgeReachDestination(chara);
        }
        for (var N = 0; N < Burst.allEffects.length; N++) {
            var effect = Burst.allEffects[N];
            if (effect.status == "dead" || (effect.target && effect.target.status == "dead")) {
                Burst.allEffects.splice(N, 1);
                N--;
                continue;
            }
            Game.drawEffect(effect);
        }
        // Build Ghost drawing
        if (typeof (Button.callback) == 'function' && Button.buildType) {
            const offset = mouseController._frontOffsetAt();
            const tx = mouseController._clientPos.x - offset.left;
            const ty = mouseController._clientPos.y - offset.top;
            const rect = Button._buildRectFor(Button.buildType, { x: tx + GameMap.offsetX, y: ty + GameMap.offsetY });
            const isValid = Button._isBuildRectValid(rect, null, 2, Button.buildType);

            const gCxt = Game.frontCxt;
            gCxt.save();
            gCxt.globalAlpha = 0.5;
            gCxt.fillStyle = isValid ? "rgba(0, 255, 0, 0.3)" : "rgba(255, 0, 0, 0.3)";
            gCxt.strokeStyle = isValid ? "green" : "red";
            const dx = (rect.x - GameMap.offsetX) >> 0;
            const dy = (rect.y - GameMap.offsetY) >> 0;
            gCxt.fillRect(dx, dy, rect.width, rect.height);
            gCxt.strokeRect(dx, dy, rect.width, rect.height);
            gCxt.restore();
        }
        // Update HUD
        Game.updatePortrait();

        if (window.mouseController && window.mouseController.drag) {
            Game.cxt.lineWidth = 3;
            Game.cxt.strokeStyle = "green";
            Game.cxt.strokeRect(window.mouseController.startPoint.x, window.mouseController.startPoint.y,
                window.mouseController.endPoint.x - window.mouseController.startPoint.x,
                window.mouseController.endPoint.y - window.mouseController.startPoint.y);
        }
        Game.drawInfoBox();
        Game.drawSourceBox();
        Game.drawProcessingBox();
        Game.drawMetrics();
        if (Game.selectedUnit.status == "dead" || (Game.selectedUnit.isInvisible && Game.selectedUnit.isEnemy)) {
            Game.selectedUnit.selected = false;
            Game.changeSelectedTo({});
        }
        Referee.judgeArbiter();
        Referee.judgeDetect();
        Referee.judgeCollision();
        Referee.judgeRecover();
        Referee.judgeDying();
        Referee.judgeMan();
        Referee.addLarva();
        Referee.monitorMiniMap();
        Referee.coverFog();
        Referee.alterSelectionMode();
        Referee.judgeWinLose();
        if (Referee.judgeBuildingInjury) Referee.judgeBuildingInjury();
        if (Referee.saveReplaySnapshot) Referee.saveReplaySnapshot();
        Game._clock++;
    };
    Game._loop = loop;
    Game.stopAnimation();
    Game._timer = setInterval(Game._loop, Game._frameInterval);
};
Game.stopAnimation = function () {
    if (Game._timer !== -1) {
        clearInterval(Game._timer);
        Game._timer = -1;
    }
};
Game.startAnimation = function () {
    if (Game._timer === -1 && Game._loop) {
        Game._timer = setInterval(Game._loop, Game._frameInterval);
    }
};
Game.stop = function (charas) {
    charas.forEach(function (chara) {
        chara.stop();
    });
    Game.stopAnimation();
};
