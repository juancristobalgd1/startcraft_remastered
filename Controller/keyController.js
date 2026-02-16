var keyController={
	shift:false,
    ctrl:false,
    disable:false,
    _lastTeamNum:null,
    _lastTeamAt:0,
    hotkeys:{
        move:77,
        stop:83,
        attack:65,
        patrol:80,
        hold:72,
        pause:27,
        cheat:13,
        mapLeft:37,
        mapUp:38,
        mapRight:39,
        mapDown:40
    },
    keymap:{},
    _applyHotkeys:function(){
        const map={};
        Object.keys(keyController.hotkeys).forEach(function(action){
            const code=keyController.hotkeys[action];
            if (typeof code=='number') map[code]=action;
        });
        keyController.keymap=map;
    },
    loadHotkeys:function(){
        try{
            const raw=localStorage.getItem('sc_hotkeys');
            if (raw){
                const obj=JSON.parse(raw);
                if (obj && typeof obj=='object'){
                    Object.keys(keyController.hotkeys).forEach(function(k){
                        if (typeof obj[k]=='number') keyController.hotkeys[k]=obj[k];
                    });
                }
            }
        }
        catch(e){}
        keyController._applyHotkeys();
    },
    setHotkeys:function(obj){
        if (!obj || typeof obj!='object') return;
        Object.keys(keyController.hotkeys).forEach(function(k){
            if (typeof obj[k]=='number') keyController.hotkeys[k]=obj[k];
        });
        try{
            localStorage.setItem('sc_hotkeys',JSON.stringify(keyController.hotkeys));
        }
        catch(e){}
        keyController._applyHotkeys();
    },
    start:function(){
        keyController.loadHotkeys();
        //Keyboard settings
        window.onkeydown=function(event){
            //Will not switch page by Ctrl+N,cannot debug
            //event.preventDefault();
            //Sometimes need to disable shortcut key
            if (keyController.disable && event.keyCode!=13 && event.keyCode!=27) return;
            if (event.keyCode==16){
                keyController.shift=true;
                return;
            }
            if (event.keyCode==17){
                keyController.ctrl=true;
                return;
            }
            if (event.keyCode>=48 && event.keyCode<=57){
                const teamNum=String.fromCharCode(event.keyCode);
                if (keyController.ctrl || keyController.shift) {
                    Game.addSelectedIntoTeam(teamNum, keyController.shift);
                    keyController._lastTeamNum=null;
                    keyController._lastTeamAt=0;
                }
                else {
                    const now=(window.performance && performance.now)?performance.now():Date.now();
                    const isDouble=(keyController._lastTeamNum===teamNum) && ((now-keyController._lastTeamAt)<=350);
                    Game.callTeam(teamNum,isDouble);
                    keyController._lastTeamNum=teamNum;
                    keyController._lastTeamAt=now;
                }
                return;
            }
            const action=keyController.keymap[event.keyCode];
            if (!action) return;
            switch(action){
                case 'mapLeft':
                    GameMap.needRefresh="LEFT";
                    break;
                case 'mapUp':
                    GameMap.needRefresh="TOP";
                    break;
                case 'mapRight':
                    GameMap.needRefresh="RIGHT";
                    break;
                case 'mapDown':
                    GameMap.needRefresh="BOTTOM";
                    break;
                case 'move':
                    if ($.makeArray($('div.panel_Control button')).some((btn) => btn.className=='move')) Button.moveHandler();
                    break;
                case 'stop':
                    if ($.makeArray($('div.panel_Control button')).some((btn) => btn.className=='stop')) Button.stopHandler();
                    break;
                case 'attack':
                    if ($.makeArray($('div.panel_Control button')).some((btn) => btn.className=='attack')) Button.attackHandler();
                    break;
                case 'patrol':
                    if ($.makeArray($('div.panel_Control button')).some((btn) => btn.className=='patrol')) Button.patrolHandler();
                    break;
                case 'hold':
                    if ($.makeArray($('div.panel_Control button')).some((btn) => btn.className=='hold')) Button.holdHandler();
                    break;
                case 'cheat':
                    Cheat.handler();
                    break;
                case 'pause':
                    if (window.Game && Game.togglePause) Game.togglePause();
                    break;
            }
        };
        window.onkeyup=function(){
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
