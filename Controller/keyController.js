import '../Utils/jquery.min.js';
import Game from '../GameRule/Games/core/GameBase.js';
import Button from '../Characters/Buttons/core/ButtonBase.js';
import Cheat from '../GameRule/Cheat.js';
import GameMap from '../Characters/Map.js';

const $ = globalThis.$;

var keyController={
	shift:false,
    ctrl:false,
    disable:false,
    start:function(){
        window.onkeydown=function(event){
            const e = event || window.event;
            if (!e) return;
            if (keyController.disable && e.keyCode!=13) return;
            switch (e.keyCode){
                case 16:
                    keyController.shift=true;
                    break;
                case 17:
                    keyController.ctrl=true;
                    break;
                case 48:case 49:case 50:case 51:case 52:
                case 53:case 54:case 55:case 56:case 57:
                    var teamNum=String.fromCharCode(e.keyCode);
                    if (keyController.ctrl) {
                        Game.addSelectedIntoTeam(teamNum);
                    }
                    else {
                        Game.callTeam(teamNum);
                    }
                    break;
                case 37:
                    GameMap.needRefresh="LEFT";
                    break;
                case 38:
                    GameMap.needRefresh="TOP";
                    break;
                case 39:
                    GameMap.needRefresh="RIGHT";
                    break;
                case 40:
                    GameMap.needRefresh="BOTTOM";
                    break;
                case 77:
                    if ($.makeArray($('div.panel_Control button')).some((btn) => btn.className=='move')) Button.moveHandler();
                    break;
                case 83:
                    if ($.makeArray($('div.panel_Control button')).some((btn) => btn.className=='stop')) Button.stopHandler();
                    break;
                case 65:
                    if ($.makeArray($('div.panel_Control button')).some((btn) => btn.className=='attack')) Button.attackHandler();
                    break;
                case 80:
                    if ($.makeArray($('div.panel_Control button')).some((btn) => btn.className=='patrol')) Button.patrolHandler();
                    break;
                case 72:
                    if ($.makeArray($('div.panel_Control button')).some((btn) => btn.className=='hold')) Button.holdHandler();
                    break;
                // Replay speed control
                case 107:
                case 33:
                    // Speed up + or pageUp
                    if (typeof Button.speedUpHandler === 'function') Button.speedUpHandler();
                    break;
                case 109:
                case 34:
                    // Slow down - or pageDown
                    if (typeof Button.slowDownHandler === 'function') Button.slowDownHandler();
                    break;
                case 13:
                    Cheat.handler();
                    break;
            }
        };
        window.onkeyup=function(event){
            const e = event || window.event;
            if (!e) return;
            switch (e.keyCode){
                //Press SHIFT up
                case 16:
                    keyController.shift=false;
                    break;
                //Press CTRL up
                case 17:
                    keyController.ctrl=false;
                    break;
            }
        };
    }
};

export default keyController;
