import '../../../Utils/jquery.min.js';
import Game from '../core/GameBase.js';
import Button from '../../../Characters/Buttons/core/ButtonBase.js';
import Upgrade from '../../../Characters/Upgrades/core/UpgradeBase.js';
import Gobj from '../../../Characters/Gobj.js';
import Unit from '../../../Characters/Units/core/UnitBase.js';
import Building from '../../../Characters/Buildings/core/BuildingBase.js';
import Resource from '../../Resource.js';

const $ = globalThis.$;

Game.changeSelectedTo = function (chara) {
    Game.selectedUnit = chara;
    Button.equipButtonsFor(chara);
    if (chara instanceof Gobj) {
        chara.selected = true;
    }
    if (Game.selectedUnit instanceof Gobj && Game.selectedUnit.status != "dead") {
        $('div.panel_Info>div[class*="info"]').show();
        if (chara.portrait) $('div.infoLeft div[name="portrait"]')[0].className = chara.portrait;
        else {
            if (Game.selectedUnit instanceof Unit)
                $('div.infoLeft div[name="portrait"]')[0].className = Game.selectedUnit.name;
            if (Game.selectedUnit instanceof Building) {
                // Correctly identify building race for portraits
                if (Game.selectedUnit.inherited && Game.selectedUnit.inherited.name) {
                    $('div.infoLeft div[name="portrait"]')[0].className = Game.selectedUnit.inherited.name;
                } else if (window.ZergBuilding && Game.selectedUnit instanceof window.ZergBuilding) {
                    $('div.infoLeft div[name="portrait"]')[0].className = "ZergBuilding";
                } else if (window.TerranBuilding && Game.selectedUnit instanceof window.TerranBuilding) {
                    $('div.infoLeft div[name="portrait"]')[0].className = "TerranBuilding";
                } else if (window.ProtossBuilding && Game.selectedUnit instanceof window.ProtossBuilding) {
                    $('div.infoLeft div[name="portrait"]')[0].className = "ProtossBuilding";
                } else {
                    $('div.infoLeft div[name="portrait"]')[0].className = Game.selectedUnit.name;
                }
            }
        }
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
            $('div.infoCenter p.kill').show();
            $('div.infoCenter p.damage').show();
        }
        else {
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
            $('div.upgraded').hide();
        }
    }
    else {
        $('div.panel_Info>div').hide();
    }
};
Game.drawInfoBox = function () {
    if (Game.selectedUnit instanceof Gobj && Game.selectedUnit.status != "dead") {
        var lifeRatio = Game.selectedUnit.life / Game.selectedUnit.get('HP');
        var lifeColor = ((lifeRatio > 0.7) ? "green" : (lifeRatio > 0.3) ? "yellow" : "red");
        if (Game.ui.lastSelected.lifeColor !== lifeColor) {
            $('div.infoLeft span._Health')[0].style.color = lifeColor;
            Game.ui.lastSelected.lifeColor = lifeColor;
        }
        var life = Game.selectedUnit.life >> 0;
        if (Game.ui.lastSelected.life !== life) {
            $('div.infoLeft span.life')[0].innerHTML = life;
            Game.ui.lastSelected.life = life;
        }
        if (Game.selectedUnit.SP) {
            var shield = Game.selectedUnit.shield >> 0;
            if (Game.ui.lastSelected.shield !== shield) {
                $('div.infoLeft span.shield')[0].innerHTML = shield;
                Game.ui.lastSelected.shield = shield;
            }
        }
        if (Game.selectedUnit.MP) {
            var magic = Game.selectedUnit.magic >> 0;
            if (Game.ui.lastSelected.magic !== magic) {
                $('div.infoLeft span.magic')[0].innerHTML = magic;
                Game.ui.lastSelected.magic = magic;
            }
        }
        if (Game.selectedUnit.kill != null) {
            if (Game.ui.lastSelected.kill !== Game.selectedUnit.kill) {
                $('div.infoCenter p.kill span')[0].innerHTML = Game.selectedUnit.kill;
                Game.ui.lastSelected.kill = Game.selectedUnit.kill;
            }
        }
    }
};
Game.drawSourceBox = function () {
    var res = (typeof Resource !== 'undefined') ? Resource : (typeof window !== 'undefined' ? window.Resource : null);
    if (!res) return;
    if (!res[0] && res.init) res.init();
    if (!res[0]) return;
    if (!Game.ui.lastResource) Game.ui.lastResource = {};
    if (Game.ui.lastResource.mine !== res[0].mine) {
        $('div.resource_Box span.mineNum')[0].innerHTML = res[0].mine;
        Game.ui.lastResource.mine = res[0].mine;
    }
    if (Game.ui.lastResource.gas !== res[0].gas) {
        $('div.resource_Box span.gasNum')[0].innerHTML = res[0].gas;
        Game.ui.lastResource.gas = res[0].gas;
    }
    if (Game.ui.lastResource.curMan !== res[0].curMan) {
        $('div.resource_Box span.manNum>span')[0].innerHTML = res[0].curMan;
        Game.ui.lastResource.curMan = res[0].curMan;
    }
    if (Game.ui.lastResource.totalMan !== res[0].totalMan) {
        $('div.resource_Box span.manNum>span')[1].innerHTML = res[0].totalMan;
        Game.ui.lastResource.totalMan = res[0].totalMan;
    }
    var manColor = (res[0].curMan > res[0].totalMan) ? "red" : (res[0].curMan === res[0].totalMan) ? "yellow" : "#00ff00";
    if (Game.ui.lastResource.manColor !== manColor) {
        $('div.resource_Box span.manNum')[0].style.color = manColor;
        Game.ui.lastResource.manColor = manColor;
    }
    var supplyBlocked = res[0].totalMan > 0 && res[0].curMan >= res[0].totalMan;
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
};
Game.drawProcessingBox = function () {
    if (!Game.ui.lastProcessing) Game.ui.lastProcessing = {};
    if (!Game.selectedUnit) {
        if (Game.ui.lastProcessing.visible !== false) {
            $('div.upgrading').removeAttr('title').hide();
            Game.ui.lastProcessing.visible = false;
        }
        if (Game.ui.lastProcessing.queueText !== '') {
            $('div.upgrading div[name="processing"] div.queue')[0].textContent = '';
            Game.ui.lastProcessing.queueText = '';
        }
        return;
    }
    var processing = Game.selectedUnit.processing;
    if (processing) {
        let elapsed;
        if (processing.startTime > 1000000000000) {
            elapsed = new Date().getTime() - processing.startTime;
        } else {
            elapsed = (Game._clock - processing.startTime) * 100;
        }
        var percent = (elapsed / processing.time + 0.5) >> 0;
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
    }
    else {
        if (Game.replayFlag && Game.endTick > 0) {
            var percent = (Game._clock * 100 / Game.endTick + 0.5) >> 0;
            if (Game.ui.lastProcessing.name !== 'Replay') {
                $('div.upgrading div[name="icon"]')[0].className = 'Replay';
                $('div.upgrading').attr('title', 'Replay Progress');
                Game.ui.lastProcessing.name = 'Replay';
            }
            if (Game.ui.lastProcessing.percent !== percent) {
                $('div.upgrading div[name="processing"] span')[0].innerHTML = percent;
                $('div.upgrading div[name="processing"] div.processedBar')[0].style.width = percent + '%';
                Game.ui.lastProcessing.percent = percent;
            }
            if (Game.ui.lastProcessing.visible !== true) {
                $('div.upgrading').show();
                Game.ui.lastProcessing.visible = true;
            }
            if (!(Game.selectedUnit instanceof Gobj)) {
                $('div.infoRight').show();
                $('div.upgraded').hide();
            }
        } else {
            if (Game.ui.lastProcessing.visible !== false) {
                $('div.upgrading').removeAttr('title').hide();
                Game.ui.lastProcessing.visible = false;
            }
            if (Game.ui.lastProcessing.queueText !== '') {
                $('div.upgrading div[name="processing"] div.queue')[0].textContent = '';
                Game.ui.lastProcessing.queueText = '';
            }
        }
    }
};
Game.drawMetrics = function () {
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
};
Game.refreshMultiSelectBox = function () {
    var divs = $('div.override div.multiSelection div');
    for (var n = 0; n < divs.length; n++) {
        divs[n].style.borderColor = Game.allSelected[n].lifeStatus();
        var hp = divs[n].querySelector('span.hp');
        if (!hp) continue;
        var unit = Game.allSelected[n];
        var ratio = unit.get && unit.get('HP') ? (unit.life / unit.get('HP')) : 1;
        if (ratio < 0) ratio = 0;
        if (ratio > 1) ratio = 1;
        hp.style.width = ((ratio * 100) >> 0) + '%';
        hp.style.backgroundColor = (ratio > 0.7) ? '#00d12f' : (ratio > 0.3) ? '#f0d000' : '#d01818';
    }
};
Game.drawMultiSelectBox = function () {
    $('div.override div.multiSelection')[0].innerHTML = '';
    Game.allSelected.forEach(function (chara, N) {
        var node = document.createElement('div');
        node.setAttribute('name', 'portrait');
        if (chara.portrait) node.className = chara.portrait;
        else {
            if (chara instanceof Building) {
                if (chara.attack && chara.inherited && chara.inherited.inherited && chara.inherited.inherited.name) {
                    node.className = chara.inherited.inherited.name;
                } else if (chara.inherited && chara.inherited.name) {
                    node.className = chara.inherited.name;
                } else {
                    node.className = chara.name;
                }
            } else {
                node.className = chara.name;
            }
        }
        node.title = chara.name;
        node.style.borderColor = chara.lifeStatus();
        var hp = document.createElement('span');
        hp.className = 'hp';
        var ratio = chara.get && chara.get('HP') ? (chara.life / chara.get('HP')) : 1;
        if (ratio < 0) ratio = 0;
        if (ratio > 1) ratio = 1;
        hp.style.width = ((ratio * 100) >> 0) + '%';
        hp.style.backgroundColor = (ratio > 0.7) ? '#00d12f' : (ratio > 0.3) ? '#f0d000' : '#d01818';
        node.appendChild(hp);
        node.onclick = function () {
            Game.unselectAll();
            Game.changeSelectedTo(chara);
            $('div.override').hide();
            $('div.override div.multiSelection').hide();
        };
        $('div.override div.multiSelection')[0].appendChild(node);
    });
    var iconNum = $('div.override div.multiSelection div').length;
    $('div.override div.multiSelection').css('width', (iconNum > 12 ? Math.ceil(iconNum / 2) * 55 : 330) + 'px');
    for (var n = 1; n <= iconNum; n++) {
        var bgPosition = $('div.override div.multiSelection div:nth-child(' + n + ')').css('background-position');
        bgPosition = bgPosition.split(' ').map(function (pos) {
            return parseInt(pos) * 0.75 + 'px';
        }).join(' ');
        $('div.override div.multiSelection div:nth-child(' + n + ')').css('background-position', bgPosition);
    }
};
