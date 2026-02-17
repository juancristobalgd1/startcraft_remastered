Game.draw = function (chara) {
    if (!(chara instanceof Gobj)) return;
    if (chara.status == "dead") return;
    if (!chara.insideScreen()) return;
    if (chara.noRender) return;
    var cxt = ((chara instanceof Unit) || (chara instanceof Building)) ? Game.cxt : Game.frontCxt;
    cxt.save();
    cxt.shadowOffsetX = (chara.isFlying) ? 5 : 3;
    cxt.shadowOffsetY = (chara.isFlying) ? 20 : 8;
    cxt.shadowColor = "rgba(0,0,0,0.4)";
    if (chara.buffer.Burrow) cxt.shadowOffsetX = cxt.shadowOffsetY = 0;
    if (chara.isInvisible != undefined) {
        cxt.globalAlpha = (chara.isEnemy && chara.isInvisible) ? 0 : 0.5;
        if (chara.burrowBuffer && !chara.isEnemy) cxt.globalAlpha = 1;
    }
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
    else {
        assetId = chara.source ? chara.source : chara.name;
        imgSrc = sourceLoader.sources[assetId];
    }
    if (!imgSrc) {
        Game.ensureAsset(assetId);
        return;
    }
    var charaX = (chara.x - GameMap.offsetX) >> 0;
    var charaY = (chara.y - GameMap.offsetY) >> 0;
    if (chara.direction == undefined) {
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
    if (chara._hitFlashUntil && now < chara._hitFlashUntil) {
        var fx = Game.frontCxt;
        fx.save();
        fx.strokeStyle = 'rgba(255,60,60,0.8)';
        fx.lineWidth = 2;
        fx.strokeRect(charaX, charaY, chara.width, chara.height);
        fx.restore();
    }
    if (chara.selected == true) {
        cxt = Game.frontCxt;
        cxt.strokeStyle = (chara.isEnemy) ? "red" : "green";
        cxt.lineWidth = 2;
        cxt.beginPath();
        cxt.arc(chara.posX() - GameMap.offsetX, chara.posY() - GameMap.offsetY, chara.radius(), 0, 2 * Math.PI);
        cxt.stroke();
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
    }
};
Game.drawEffect = function (chara) {
    if (!(chara instanceof Burst)) return;
    if (chara.status == "dead") return;
    if (!chara.insideScreen()) return;
    var cxt = Game.frontCxt;
    cxt.save();
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
        chara.forEach(function (bullet) {
            Game.drawBullet(bullet);
        });
    }
    if (!(chara instanceof Bullets)) return;
    if (chara.status == "dead") return;
    if (!chara.insideScreen()) return;
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
        var cullMargin = Game.perf.cullMargin;
        var aiMargin = Game.perf.aiNearMargin;
        Game.cxt.clearRect(0, 0, Game.HBOUND, Game.VBOUND);
        Game.frontCxt.clearRect(0, 0, Game.HBOUND, Game.VBOUND);
        if (typeof Game.ensureGasSmoke === 'function') Game.ensureGasSmoke();
        if (window.mouseController && typeof mouseController.edgeScrollTick === 'function') {
            mouseController.edgeScrollTick();
        }
        if (GameMap.needRefresh) {
            GameMap.refresh(GameMap.needRefresh);
            GameMap.needRefresh = false;
        }
        if (Game.pathfinding) Game.pathfinding.tick();
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
            var inView = Game._isVisible(build, cullMargin);
            if (inView) Game.draw(build);
            if (build.bullet && (inView || Game._anyVisibleBullet(build.bullet))) Game.drawBullet(build.bullet);
            if (build.AI && Game._shouldRunAI(build, Game._isVisible(build, aiMargin))) build.AI();
        }
        for (var N = 0; N < Unit.allUnits.length; N++) {
            var chara = Unit.allUnits[N];
            if (chara.status == "dead") {
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
            var inView = Game._isVisible(chara, cullMargin);
            if (inView) Game.draw(chara);
            if (chara.bullet && (inView || Game._anyVisibleBullet(chara.bullet))) Game.drawBullet(chara.bullet);
            if (chara.attack && chara.AI && Game._shouldRunAI(chara, Game._isVisible(chara, aiMargin))) chara.AI();
            if (inView || (Game._clock % 5 === 0)) Referee.judgeReachDestination(chara);
        }
        for (var N = 0; N < Burst.allEffects.length; N++) {
            var effect = Burst.allEffects[N];
            if (effect.status == "dead" || (effect.target && effect.target.status == "dead")) {
                Burst.allEffects.splice(N, 1);
                N--;
                continue;
            }
            if (Game._isVisible(effect, cullMargin)) Game.drawEffect(effect);
        }
        if (mouseController.drag) {
            Game.cxt.lineWidth = 3;
            Game.cxt.strokeStyle = "green";
            Game.cxt.strokeRect(mouseController.startPoint.x, mouseController.startPoint.y,
                mouseController.endPoint.x - mouseController.startPoint.x,
                mouseController.endPoint.y - mouseController.startPoint.y);
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
Game.stop = function (charas) {
    charas.forEach(function (chara) {
        chara.stop();
    });
    Game.stopAnimation();
};
