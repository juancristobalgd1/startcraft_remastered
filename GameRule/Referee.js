var Referee={
    ourDetectedUnits:[],
    enemyDetectedUnits:[],
    ourUnderArbiterUnits:[],
    enemyUnderArbiterUnits:[],
    _pos:[[-1,0],[1,0],[0,-1],[0,1]],
    unique: (arr) => [...new Set(arr)],
    voice:{
        pError:_$.lazyAudio('bgm/PointError.wav'),
        button:_$.lazyAudio('bgm/Button.wav'),
        resource:{
            Zerg:{
                mine:_$.lazyAudio('bgm/mine.Zerg.wav'),
                gas:_$.lazyAudio('bgm/gas.Zerg.wav'),
                man:_$.lazyAudio('bgm/man.Zerg.wav'),
                magic:_$.lazyAudio('bgm/magic.Zerg.wav')
            },
            Terran:{
                mine:_$.lazyAudio('bgm/mine.Terran.wav'),
                gas:_$.lazyAudio('bgm/gas.Terran.wav'),
                man:_$.lazyAudio('bgm/man.Terran.wav'),
                magic:_$.lazyAudio('bgm/magic.Terran.wav')
            },
            Protoss:{
                mine:_$.lazyAudio('bgm/mine.Protoss.wav'),
                gas:_$.lazyAudio('bgm/gas.Protoss.wav'),
                man:_$.lazyAudio('bgm/man.Protoss.wav'),
                magic:_$.lazyAudio('bgm/magic.Protoss.wav')
            }
        },
        upgrade:{
            Zerg:_$.lazyAudio('bgm/upgrade.Zerg.wav'),
            Terran:_$.lazyAudio('bgm/upgrade.Terran.wav'),
            Protoss:_$.lazyAudio('bgm/upgrade.Protoss.wav')
        }
    },
    winCondition: () => {
        return (Unit.allEnemyUnits().length == 0 && Building.enemyBuildings.length == 0);
    },
    loseCondition: () => {
        return (Unit.allOurUnits().length == 0 && Building.ourBuildings.length == 0);
    },
    judgeArbiter: function () {
        if (Game._clock % 4 == 0) {
            const arbiterBuffer = Protoss.Arbiter.prototype.bufferObj;
            const myArbiters = Unit.ourFlyingUnits.filter((chara) => chara.name == "Arbiter");
            const enemyArbiters = Unit.enemyFlyingUnits.filter((chara) => chara.name == "Arbiter");
            Referee.ourUnderArbiterUnits.concat(Referee.enemyUnderArbiterUnits).forEach((chara) => {
                chara.removeBuffer(arbiterBuffer);
            });
            Referee.ourUnderArbiterUnits = [];
            Referee.enemyUnderArbiterUnits = [];
            myArbiters.forEach((arbiter) => {
                const targets = Game.getInRangeOnes(arbiter.posX(), arbiter.posY(), arbiter.get('sight'), false, true, null, (chara) => myArbiters.indexOf(chara) == -1);
                Referee.ourUnderArbiterUnits = Referee.ourUnderArbiterUnits.concat(targets);
            });
            Referee.ourUnderArbiterUnits = Referee.unique(Referee.ourUnderArbiterUnits);
            enemyArbiters.forEach((arbiter) => {
                const targets = Game.getInRangeOnes(arbiter.posX(), arbiter.posY(), arbiter.get('sight'), true, true, null, (chara) => enemyArbiters.indexOf(chara) == -1);
                Referee.enemyUnderArbiterUnits = Referee.enemyUnderArbiterUnits.concat(targets);
            });
            Referee.enemyUnderArbiterUnits = Referee.unique(Referee.enemyUnderArbiterUnits);
            Referee.ourUnderArbiterUnits.concat(Referee.enemyUnderArbiterUnits).forEach((chara) => {
                chara.addBuffer(arbiterBuffer);
            });
        }
    },
    //detectorBuffer are reverse of arbiterBuffer
    judgeDetect:function(){
        //Every 0.4 sec
        if (Game._clock%4==0){
            //Same detector buffer reference
            var detectorBuffer=Gobj.detectorBuffer;
            var ourDetectors=Unit.allOurUnits().concat(Building.ourBuildings).filter(function(chara){
                return chara.detector;
            });
            const enemyDetectors = Unit.allEnemyUnits().concat(Building.enemyBuildings).filter((chara) => chara.detector);
            Referee.ourDetectedUnits.concat(Referee.enemyDetectedUnits).forEach((chara) => {
                chara.removeBuffer(detectorBuffer);
            });
            Referee.ourDetectedUnits = [];
            Referee.enemyDetectedUnits = [];
            ourDetectors.forEach((detector) => {
                const targets = Game.getInRangeOnes(detector.posX(), detector.posY(), detector.get('sight'), true, true, null, (chara) => chara.isInvisible);
                Referee.ourDetectedUnits = Referee.ourDetectedUnits.concat(targets);
            });
            Referee.ourDetectedUnits = Referee.unique(Referee.ourDetectedUnits);
            enemyDetectors.forEach((detector) => {
                const targets = Game.getInRangeOnes(detector.posX(), detector.posY(), detector.get('sight'), false, true, null, (chara) => chara.isInvisible);
                Referee.enemyDetectedUnits = Referee.enemyDetectedUnits.concat(targets);
            });
            Referee.enemyDetectedUnits = Referee.unique(Referee.enemyDetectedUnits);
            Referee.ourDetectedUnits.concat(Referee.enemyDetectedUnits).forEach((chara) => {
                chara.addBuffer(detectorBuffer);
            });
        }
    },
    judgeReachDestination: function (chara) {
        if (chara.isIdle() && chara.destination) {
            if (chara.insideSquare({ centerX: chara.destination.x, centerY: chara.destination.y, radius: Unit.moveRange })) {
                if (chara.destination.next) {
                    chara.destination = chara.destination.next;
                    chara.moveTo(chara.destination.x, chara.destination.y);
                    chara.targetLock = false;
                }
                else {
                    delete chara.destination;
                }
            }
            else {
                chara.moveTo(chara.destination.x, chara.destination.y);
                chara.targetLock = false;
            }
        }
    },
    judgeRecover: function () {
        if (Game._clock % 10 == 0) {
            Unit.allUnits.concat(Building.allBuildings).forEach((chara) => {
                if (chara.recover) chara.recover();
            });
        }
    },
    judgeDying:function(){
        //Kill die survivor every 1 sec
        if (Game._clock%10==0){
            Unit.allUnits.concat(Building.allBuildings).filter(function(chara){
                return chara.life<=0 && chara.status!='dead';
            }).forEach(function(chara){
                chara.die();
            });
        }
    },
    //Avoid collision
    judgeCollision:function(){
        var collideGround=function(chara1,chara2){
            if (chara1._isMapResource || chara2._isMapResource) return;
            var dist=chara1.distanceFrom(chara2);
            var distLimit;
            if (chara2 instanceof Unit){
                distLimit=(chara1.radius()+chara2.radius())*0.5;
                if (distLimit<Unit.meleeRange) distLimit=Unit.meleeRange;
            }
            else{
                distLimit=(chara1.radius()+chara2.radius())*0.8;
            }
            if (dist==0) {
                var colPos=Referee._pos[Math.random()*4>>0];
                if (chara1 instanceof Unit){
                    chara1.x+=colPos[0];
                    chara1.y+=colPos[1];
                    dist=1;
                }
                else {
                    if (chara2 instanceof Unit){
                        chara2.x+=colPos[0];
                        chara2.y+=colPos[1];
                        dist=1;
                    }
                }
            }
            if (dist<distLimit) {
                chara1.collision=chara2;
                chara2.collision=chara1;
                var K=(distLimit-dist)/dist/2;
                var adjustX=K*(chara1.x-chara2.x)>>0;
                var adjustY=K*(chara1.y-chara2.y)>>0;
                var interactRatio1=0;
                var interactRatio2=0;
                if (chara1 instanceof Building){
                    interactRatio1=0;
                    if (chara2 instanceof Unit) interactRatio2=2;
                    else interactRatio2=0;
                }
                else {
                    if (chara2 instanceof Unit) {
                        if (chara1.status=="moving"){
                            if (chara2.status=="moving"){
                                interactRatio1=1;
                                interactRatio2=1;
                            }
                            else {
                                interactRatio1=2;
                                interactRatio2=0;
                            }
                        }
                        else {
                            if (chara2.status=="moving"){
                                interactRatio1=0;
                                interactRatio2=2;
                            }
                            else {
                                interactRatio1=1;
                                interactRatio2=1;
                            }
                        }
                    }
                    else {
                        interactRatio1=2;
                        interactRatio2=0;
                    }
                }
                chara1.x+=interactRatio1*adjustX;
                chara1.y+=interactRatio1*adjustY;
                chara2.x-=interactRatio2*adjustX;
                chara2.y-=interactRatio2*adjustY;
            }
        };
        var collideFlying=function(chara1,chara2){
            var dist=chara1.distanceFrom(chara2);
            var distLimit=Unit.meleeRange;
            if (dist==0) {
                var colPos=Referee._pos[Math.random()*4>>0];
                chara1.x+=colPos[0];
                chara1.y+=colPos[1];
                dist=1;
            }
            if (dist<distLimit) {
                var K=(distLimit-dist)/dist/2;
                var adjustX=K*(chara1.x-chara2.x)>>0;
                var adjustY=K*(chara1.y-chara2.y)>>0;
                chara1.x+=adjustX;
                chara1.y+=adjustY;
                chara2.x-=adjustX;
                chara2.y-=adjustY;
            }
        };
        var runSpatial=function(list,collide){
            if (list.length<60){
                for(var N=0;N<list.length;N++) {
                    var chara1 = list[N];
                    for(var M=N+1;M<list.length;M++) {
                        collide(chara1,list[M]);
                    }
                }
                return;
            }
            var cellSize=Unit.meleeRange*3;
            var grid={};
            for(var i=0;i<list.length;i++){
                var c=list[i];
                var cx=(c.x/cellSize)>>0;
                var cy=(c.y/cellSize)>>0;
                var key=cx+","+cy;
                (grid[key]||(grid[key]=[])).push(c);
            }
            for(var i=0;i<list.length;i++){
                var chara1=list[i];
                var cx=(chara1.x/cellSize)>>0;
                var cy=(chara1.y/cellSize)>>0;
                for(var dx=-1;dx<=1;dx++){
                    for(var dy=-1;dy<=1;dy++){
                        var bucket=grid[(cx+dx)+","+(cy+dy)];
                        if (!bucket) continue;
                        for(var j=0;j<bucket.length;j++){
                            var chara2=bucket[j];
                            if (chara2.id<=chara1.id) continue;
                            collide(chara1,chara2);
                        }
                    }
                }
            }
        };
        runSpatial(Unit.allGroundUnits().concat(Building.allBuildings),collideGround);
        runSpatial(Unit.allFlyingUnits(),collideFlying);
    },
    monitorMiniMap: () => {
        if (Game._clock % 10 == 0) {
            GameMap.refreshMiniMap();
        }
    },
    coverFog: () => {
        GameMap.drawFog();
    },
    alterSelectionMode: function () {
        $.extend([], Game.allSelected).forEach((chara) => {
            if (chara.status == 'dead' || (chara.isInvisible && chara.isEnemy))
                Game.allSelected.splice(Game.allSelected.indexOf(chara), 1);
        });
        if (Game.allSelected.length > 1) {
            if (_$.arrayEqual(Game.allSelected, Game._oldAllSelected)) {
                Game.refreshMultiSelectBox();
            }
            else {
                Game.drawMultiSelectBox();
                Game._oldAllSelected = _$.mixin([], Game.allSelected);
            }
            $('div.override').show();
            $('div.override div.multiSelection').show();
        }
        else {
            $('div.override').hide();
            $('div.override div.multiSelection').hide();
        }
    },
    addLarva: () => {
        if (Game._clock % 200 == 0) {
            Building.allBuildings.filter((chara) => chara.produceLarva).forEach((chara) => {
                for (let N = 0; N < 3; N++) {
                    if (chara.larvas[N] == null || chara.larvas[N].status == "dead") {
                        chara.larvas[N] = new Zerg.Larva({ x: (chara.x + N * 48), y: (chara.y + chara.height), isEnemy: chara.isEnemy });
                        break;
                    }
                }
            });
        }
    },
    judgeMan: function () {
        let curMan = 0, totalMan = 0;
        Unit.allOurUnits().concat(Building.ourBuildings).forEach((chara) => {
            if (chara.cost && chara.cost.man) curMan += chara.cost.man;
            if (chara.manPlus) totalMan += chara.manPlus;
        });
        Resource[0].curMan = curMan;
        Resource[0].totalMan = totalMan;
        curMan = 0;
        totalMan = 0;
        Unit.allEnemyUnits().concat(Building.enemyBuildings).forEach((chara) => {
            if (chara.cost) curMan += chara.cost.man;
            if (chara.manPlus) totalMan += chara.manPlus;
        });
        Resource[1].curMan = curMan;
        Resource[1].totalMan=totalMan;
    },
    judgeWinLose:function(){
        if (Referee.loseCondition())
            Game.lose();
        if (Referee.winCondition())
            Game.win();
    }
};
