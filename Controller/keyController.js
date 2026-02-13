var keyController={
	shift:false,
    ctrl:false,
    disable:false,
    _lastTeamNum:null,
    _lastTeamAt:0,
    start:function(){
        //Keyboard settings
        window.onkeydown=function(event){
            //Will not switch page by Ctrl+N,cannot debug
            //event.preventDefault();
            //Sometimes need to disable shortcut key
            if (keyController.disable && event.keyCode!=13 && event.keyCode!=27) return;
            switch (event.keyCode){
                //Press SHIFT down
                case 16:
                    keyController.shift=true;
                    break;
                //Press CTRL down
                case 17:
                    keyController.ctrl=true;
                    break;
                //Press number
                case 48:case 49:case 50:case 51:case 52:
                case 53:case 54:case 55:case 56:case 57:
                    var teamNum=String.fromCharCode(event.keyCode);
                    //Building team
                    if (keyController.ctrl) {
                        Game.addSelectedIntoTeam(teamNum);
                        keyController._lastTeamNum=null;
                        keyController._lastTeamAt=0;
                    }
                    //Call team
                    else {
                        var now=(window.performance && performance.now)?performance.now():Date.now();
                        var isDouble=(keyController._lastTeamNum===teamNum) && ((now-keyController._lastTeamAt)<=350);
                        Game.callTeam(teamNum,isDouble);
                        keyController._lastTeamNum=teamNum;
                        keyController._lastTeamAt=now;
                    }
                    break;
                //Move map
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
                //Shortcut keys:
                //Press M
                case 77:
                    if ($.makeArray($('div.panel_Control button')).some((btn) => btn.className=='move')) Button.moveHandler();
                    break;
                //Press S
                case 83:
                    if ($.makeArray($('div.panel_Control button')).some((btn) => btn.className=='stop')) Button.stopHandler();
                    break;
                //Press A
                case 65:
                    if ($.makeArray($('div.panel_Control button')).some((btn) => btn.className=='attack')) Button.attackHandler();
                    break;
                //Press P
                case 80:
                    if ($.makeArray($('div.panel_Control button')).some((btn) => btn.className=='patrol')) Button.patrolHandler();
                    break;
                //Press H
                case 72:
                    if ($.makeArray($('div.panel_Control button')).some((btn) => btn.className=='hold')) Button.holdHandler();
                    break;
                //Press ENTER
                case 13:
                    Cheat.handler();
                    break;
                //Press ESC
                case 27:
                    if (window.Game && Game.togglePause) Game.togglePause();
                    break;
            }
        };
        window.onkeyup=function(event){
            switch (event.keyCode){
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
