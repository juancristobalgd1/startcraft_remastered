Magic.Burrow={
    name:"Burrow",
    enabled:false,
    spell:function(){
        this.dock();
        if (this.stopAttack) this.stopAttack();
        this.status="burrow";
        this.action=2;
        //Effect:Freeze target
        var bufferObj={
            moveTo:function(){},
            moveToward:function(){},
            dock:function(){}
        };
        if (this.attack) bufferObj.attack=function(){};
        //Lurker has same behavior as attackable building
        if (this.name=="Lurker") {
            var mixin=$.extend({},Building.Attackable.prototypePlus);
            delete mixin.name;
            delete mixin.die;
            $.extend(bufferObj,mixin);
        }
        //Freeze immediately
        this.addBuffer(bufferObj,(this.name=="Lurker"));//onAll for Lurker
        this.burrowBuffer=[bufferObj];
        //Sound effect
        if (this.insideScreen()) this.sound.burrow.play();
        //Forbid actions
        var itemsBackup=this.items;
        this.items={'1':undefined,'2':undefined,'3':undefined,'4':undefined,'5':undefined,
            '6':undefined,'7':undefined,'8':undefined,'9':undefined};
        Button.reset();
        //Finish burrow
        var myself=this;
        setTimeout(function(){
            //Invisible when finish burrow
            var bufferObjII={isInvisible:true};
            myself.addBuffer(bufferObjII);
            myself.burrowBuffer.push(bufferObjII);
            myself.buffer.Burrow=true;
            //Change icon when finish burrow
            var items=_$.clone(itemsBackup);
            for (var N in items){
                if (items[N] && items[N].name=="Burrow") items[N].name="Unburrow";
            }
            myself.items=items;
            //Apply callback
            Button.reset();
        },this.imgPos.burrow.left[0].length*100-200);
    }
};
Magic.Unburrow={
    name:"Unburrow",
    enabled:false,
    spell:function(){
        this.status="unburrow";
        this.action=0;
        //Show unit immediately
        this.removeBuffer(this.burrowBuffer.pop());
        //Sound effect
        if (this.insideScreen()) this.sound.unburrow.play();
        //Forbid actions
        this.items={'1':undefined,'2':undefined,'3':undefined,'4':undefined,'5':undefined,
            '6':undefined,'7':undefined,'8':undefined,'9':undefined};
        Button.reset();
        //Finish unburrow
        var myself=this;
        delete myself.buffer.Burrow;//Restore shadow immediately
        setTimeout(function(){
            if (myself.burrowBuffer) {
                //Release freeze
                if (myself.removeBuffer(myself.burrowBuffer.pop())) {
                    delete myself.burrowBuffer;
                }
            }
            //Recover icons and apply callbacks
            delete myself.items;
            Button.reset();
            myself.dock();
            myself.direction=(myself.name=="Hydralisk" || myself.name=="Lurker")?2:3;
        },this.frame.unburrow*100-200);//margin
    }
};
Magic.Load={
    name:"Load",
    enabled:false,
    spell:function(location){}
};
Magic.UnloadAll={
    name:"UnloadAll",
    enabled:false,
    spell:function(location){}
};
Magic.Lurker={
    name:"Lurker",
    enabled:false,
    cost:{
        mine:50,
        gas:100,
        man:2,
        time:400
    },
    spell:function(){}
};
Magic.InfestTerranCommandCenter={
    name:"InfestTerranCommandCenter",
    enabled:true,
    spell:function(location){}
};
Magic.Parasite={
    name:"Parasite",
    cost:{magic:75},
    credit:true,
    enabled:true,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            //Target enemy unit
            var target=Game.getSelectedOne(location.x,location.y,true,true);
            if (target instanceof Gobj){
                var myself=this;
                this.targetLock=true;
                //Move toward target to fire parasite
                this.moveToward(target,this.get('sight'),function(){
                    if (Resource.payCreditBill.call(myself)){
                        //Fire parasite
                        var bullet=new Bullets.Parasite({
                            from:myself,
                            to:target,
                            damage:0
                        });
                        myself.bullet=bullet;
                        bullet.fire(function(){
                            //Effect:should steal target sight
                            target.buffer.Parasite=true;
                        });
                    }
                });
            }
            else delete Resource.creditBill;
        }
        //If missing location info, mark Button.callback, mouseController will call back with location
        else {
            Button.callback=_$.hitch(arguments.callee,this);
            $('div.GameLayer').attr('status','button');
        }
    }
};
Magic.SpawnBroodlings={
    name:"SpawnBroodlings",
    cost:{magic:150},
    credit:true,
    enabled:false,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            //Kill enemy unit ground
            var target=Game.getSelectedOne(location.x,location.y,true,true,false);
            if (target instanceof Gobj){
                var myself=this;
                this.targetLock=true;
                //Move toward target to fire SpawnBroodlings
                this.moveToward(target,this.get('sight'),function(){
                    if (Resource.payCreditBill.call(myself)){
                        //Fire SpawnBroodlings to kill that enemy immediately
                        var bullet=new Bullets.Parasite({
                            from:myself,
                            to:target,
                            damage:99999
                        });
                        myself.bullet=bullet;
                        //Effect
                        bullet.fire(function(){
                            for (var n=0;n<2;n++){
                                new Zerg.Broodling({x:target.posX(),y:target.posY()});
                            }
                        });
                    }
                });
            }
            //Empty object {}, cannot spell
            else delete Resource.creditBill;
        }
        //If missing location info, mark Button.callback, mouseController will call back with location
        else {
            Button.callback=_$.hitch(arguments.callee,this);
            $('div.GameLayer').attr('status','button');
        }
    }
};
Magic.Ensnare={
    name:"Ensnare",
    cost:{magic:75},
    credit:true,
    enabled:false,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            //Move toward target to fire Ensnare
            this.targetLock=true;
            var myself=this;
            this.moveTo(location.x,location.y,this.get('sight'),function(){
                if (Resource.payCreditBill.call(myself)){
                    //Fire Ensnare
                    var bullet=new Bullets.Parasite({
                        from:myself,
                        to:{x:location.x,y:location.y}
                    });
                    myself.bullet=bullet;
                    //Fire Ensnare bullet with callback
                    bullet.fire(function(){
                        //Ensnare animation and sound
                        var anime=new Animation.Ensnare({x:location.x,y:location.y});
                        if (anime.insideScreen()) new Audio('bgm/Magic.Ensnare.wav').play();
                        //Get in range enemy units
                        var targets=Game.getInRangeOnes(location.x,location.y,[76*1.2>>0,62*1.2>>0],true,true);
                        //Slow moving speed
                        const bufferObj = {
                            speed: Unit.getSpeedMatrixBy(2)
                        };
                        targets.forEach((chara) => {
                            if (chara.buffer.Ensnare) return;
                            chara.buffer.Ensnare = true;
                            chara.addBuffer(bufferObj);
                            new Animation.GreenEffect({ target: chara, callback: () => {
                                if (chara.status != 'dead' && chara.buffer.Ensnare) {
                                    if (chara.removeBuffer(bufferObj)) delete chara.buffer.Ensnare;
                                }
                            } });
                        });
                    });
                }
            });
        }
        //If missing location info, mark Button.callback, mouseController will call back with location
        else {
            Button.callback=_$.hitch(arguments.callee,this);
            $('div.GameLayer').attr('status','button');
        }
    }
};
Magic.Consume={
    name:"Consume",
    enabled:false,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            //Kill our unit ground
            var target=Game.getSelectedOne(location.x,location.y,false,true,false);
            if (target instanceof Gobj){
                var myself=this;
                this.targetLock=true;
                //Move toward target to consume
                this.moveToward(target,70,function(){
                    //Effect
                    var anime=new Animation.Consume({target:target,callback:function(){
                        //Consume sound
                        if (anime.insideScreen()) new Audio('bgm/Magic.Consume.wav').play();
                        //Consume animation missing
                        target.die();
                        myself.magic+=50;
                        if (myself.magic>myself.get('MP')) myself.magic=myself.get('MP');
                    }});
                });
            }
        }
        //If missing location info, mark Button.callback, mouseController will call back with location
        else {
            Button.callback=_$.hitch(arguments.callee,this);
            $('div.GameLayer').attr('status','button');
        }
    }
};
Magic.DarkSwarm={
    name:"DarkSwarm",
    cost:{magic:100},
    credit:true,
    _timer:0,
    enabled:true,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            //Move toward target to fire DarkSwarm
            this.targetLock=true;
            var myself=this;
            this.moveTo(location.x,location.y,this.get('sight'),function(){
                if (Resource.payCreditBill.call(myself)){
                    //DarkSwarm animation, play hidden frames at first
                    new Animation.DarkSwarm({x:location.x,y:location.y}).action=6;
                    //Dynamic update targets every 1 second
                    var targets=[];
                    //Full guard from distance
                    var bufferObj={
                        //Full guard from distance
                        calculateDamageBy:function(enemyObj,percent){
                            if (enemyObj.meleeAttack){
                                var enemyAttackType=enemyObj.attackType;
                                if (!enemyAttackType && enemyObj.attackMode){
                                    enemyAttackType=(this.isFlying)?enemyObj.attackMode.flying.attackType:enemyObj.attackMode.ground.attackType;
                                }
                                return enemyObj.get('damage')*Unit.attackMatrix[enemyAttackType][this.unitType];
                            }
                            //Full guard
                            else return 0;
                        }
                    };
                    //Dark swarm wave
                    var darkSwarm=function(){
                        targets.forEach((chara) => {
                            chara.removeBuffer(bufferObj);
                        });
                        targets = [];
                        const darkSwarms = Burst.allEffects.filter((effect) => effect instanceof Animation.DarkSwarm);
                        if (darkSwarms.length) {
                            darkSwarms.forEach((swarm) => {
                                targets = targets.concat(Game.getInRangeOnes(swarm.posX(), swarm.posY(), [126 * 1.2 >> 0, 94 * 1.2 >> 0], false, true, false));
                            });
                            targets = [...new Set(targets)];
                            targets.forEach((chara) => {
                                chara.addBuffer(bufferObj);
                            });
                            Magic.DarkSwarm._timer = setTimeout(darkSwarm, 1000);
                        }
                        else Magic.DarkSwarm._timer = 0;
                    };
                    if (!Magic.DarkSwarm._timer) darkSwarm();
                }
            });
        }
        //If missing location info, mark Button.callback, mouseController will call back with location
        else {
            Button.callback=_$.hitch(arguments.callee,this);
            $('div.GameLayer').attr('status','button');
        }
    }
};
Magic.Plague={
    name:"Plague",
    cost:{magic:150},
    credit:true,
    enabled:false,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            //Move toward target to fire Plague
            this.targetLock=true;
            var myself=this;
            this.moveTo(location.x,location.y,this.get('sight'),function(){
                if (Resource.payCreditBill.call(myself)){
                    //Plague animation and sound
                    var anime=new Animation.Plague({x:location.x,y:location.y});
                    if (anime.insideScreen()) new Audio('bgm/Magic.Ensnare.wav').play();
                    //Get in range enemy units
                    var targets=Game.getInRangeOnes(location.x,location.y,[64*1.2>>0,64*1.2>>0],true,true);
                    //Effect:HP losing every seconds
                    var bufferObj={
                        recover:function(){
                            if (this.life>0) this.life-=25;//Refresh every 1 seconds
                            if (this.life<=0) this.life=1;
                        }
                    };
                    targets.forEach(function(chara){
                        //Buffer flag
                        if (chara.buffer.Plague) return;//Not again
                        chara.buffer.Plague=true;
                        //HP losing every seconds
                        chara.addBuffer(bufferObj);
                        //Green effect
                        new Animation.RedEffect({target:chara,callback:function(){
                            if (chara.status!='dead' && chara.buffer.Plague){
                                //Restore
                                if (chara.removeBuffer(bufferObj)) delete chara.buffer.Plague;
                            }
                        }});
                    });
                }
            });
        }
        //If missing location info, mark Button.callback, mouseController will call back with location
        else {
            Button.callback=_$.hitch(arguments.callee,this);
            $('div.GameLayer').attr('status','button');
        }
    }
};
