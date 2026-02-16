Magic.PsionicStorm={
    name:"PsionicStorm",
    cost:{magic:75},
    credit:true,
    _timer:0,
    speller:{},
    enabled:false,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            //Move toward target to fire PsionicStorm
            this.targetLock=true;
            var myself=this;
            this.moveTo(location.x,location.y,this.get('sight'),function(){
                if (Resource.payCreditBill.call(myself)){
                    //PsionicStorm animation
                    var anime=new Animation.PsionicStorm({x:location.x,y:location.y});
                    //PsionicStorm sound
                    if (anime.insideScreen()) new Audio('bgm/Magic.PsionicStorm.wav').play();
                    //PsionicStorm effect
                    var targets=[];
                    Magic.PsionicStorm.speller=this;
                    //Psionic storm wave
                    var stormWave=function(){
                        targets=[];
                        //Check if any psionic storm exist
                        var psionicStorms=Burst.allEffects.filter(function(effect){
                            return effect instanceof Animation.PsionicStorm;
                        });
                        if (psionicStorms.length) {
                            //Get targets inside all of swarms
                            psionicStorms.forEach(function(storm){
                                //Update buffer on enemy units inside storm
                                targets=targets.concat(Game.getInRangeOnes(storm.posX(),storm.posY(),[94*1.2>>0,76*1.2>>0],null,true));
                            });
                            targets = [...new Set(targets)];
                            //Effect
                            targets.forEach(function(chara){
                                //Deal damage
                                chara.getDamageBy(16);
                                //Don't move, but will die if no life
                                chara.reactionWhenAttackedBy(Magic.PsionicStorm.speller,true);
                            });
                            Magic.PsionicStorm._timer=setTimeout(stormWave,1000);
                        }
                        else Magic.PsionicStorm._timer=0;
                    };
                    //If not calculating, execute
                    if (!Magic.PsionicStorm._timer) stormWave();
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
Magic.Hallucination={
    name:"Hallucination",
    cost:{magic:100},
    credit:true,
    enabled:false,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            //Target all units
            var target=Game.getSelectedOne(location.x,location.y,null,true);
            if (target instanceof Gobj){
                var myself=this;
                this.targetLock=true;
                //Move toward target to create 2 hallucinations
                this.moveToward(target,245,function(){
                    if (Resource.payCreditBill.call(myself)){
                        //Hallucination effect
                        var anime=new Animation.Hallucination({target:target});
                        //Hallucination sound
                        if (anime.insideScreen()) new Audio('bgm/Magic.Hallucination.wav').play();
                        //Initial
                        var halluDamage, halluAttackMode, Hallucinations=[];
                        if (target.attack!=null) {
                            if (target.attackMode){
                                halluAttackMode=_$.clone(target.attackMode);
                                halluAttackMode.flying.damage=0;
                                halluAttackMode.ground.damage=0;
                            }
                            else halluDamage=0;
                        }
                        //Combine temp constructor for hallucination
                        var halluConstructor=target.constructor.extends({
                            constructorPlus:function(props){},
                            prototypePlus:{
                                //Override
                                damage:halluDamage,//Might be undefined
                                attackMode:halluAttackMode,//Might be undefined
                                cost:{man:0},
                                items:null,
                                dieEffect:Burst.HallucinationDeath
                            }
                        });
                        for (var n=0;n<2;n++){
                            var hallucination=new halluConstructor({x:target.posX(),y:target.posY()});
                            Hallucinations.push(hallucination);
                        }
                        //Will disappear after 180 seconds
                        setTimeout(function(){
                            Hallucinations.forEach(function(chara){
                                chara.die();
                            });
                        },180000);
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
Magic.Feedback={
    name:"Feedback",//ManaBurn
    cost:{magic:50},
    credit:true,
    enabled:true,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            //Target enemy unit, magician
            var target=Game.getSelectedOne(location.x,location.y,true,true,null,function(chara){
                return chara.MP;
            });
            if (target instanceof Gobj){
                var myself=this;
                this.targetLock=true;
                //Move toward target to spell Feedback
                this.moveToward(target,300,function(){
                    if (Resource.payCreditBill.call(myself)){
                        //Feedback effect
                        var anime=new Animation.Feedback({target:target});
                        //Feedback sound
                        if (anime.insideScreen()) new Audio('bgm/Magic.Feedback.wav').play();
                        //Deal damage same as its magic, lose all magic
                        target.getDamageBy(target.magic);
                        target.reactionWhenAttackedBy(myself);
                        target.magic=0;
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
Magic.MindControl={
    name:"MindControl",
    cost:{magic:150},
    credit:true,
    enabled:false,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            //Can control all enemy
            var target=Game.getSelectedOne(location.x,location.y,true);
            if (target instanceof Gobj){
                var myself=this;
                this.targetLock=true;
                //Move toward target to mind control it
                this.moveToward(target,280,function(){
                    if (Resource.payCreditBill.call(myself)){
                        //Mind control animation
                        var anime=new Animation.MindControl({target:target});
                        //MindControl sound
                        if (anime.insideScreen()) new Audio('bgm/Magic.MindControl.wav').play();
                        //Control and tame enemy
                        target.isEnemy=false;
                        //Order ours not to attack it anymore
                        Unit.allOurUnits().concat(Building.ourBuildings).forEach(function(chara){
                            if (chara.target==target) chara.stopAttack();
                        });
                        //Rearrange side: code piece from unit constructor
                        if (target.isFlying) {
                            Unit.enemyFlyingUnits.splice(Unit.enemyFlyingUnits.indexOf(target),1);
                            Unit.ourFlyingUnits.push(target);
                        }
                        else {
                            Unit.enemyGroundUnits.splice(Unit.enemyGroundUnits.indexOf(target),1);
                            Unit.ourGroundUnits.push(target);
                        }
                        //Freeze target
                        if (target.stopAttack) target.stopAttack();
                        target.dock();
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
Magic.MaelStorm={
    name:"MaelStorm",
    cost:{magic:100},
    credit:true,
    enabled:false,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            //Move toward target to fire MaelStorm
            this.targetLock=true;
            var myself=this;
            this.moveTo(location.x,location.y,this.get('sight'),function(){
                if (Resource.payCreditBill.call(myself)){
                    //MaelStorm spell animation
                    var anime=new Animation.MaelStormSpell({x:location.x,y:location.y,callback:function(){
                        //Get in range enemy units, animal
                        var targets=Game.getInRangeOnes(location.x,location.y,[64*1.2>>0,64*1.2>>0],true,true,null,function(chara){
                            return !(chara.isMachine()) && !chara.buffer.MaelStorm;
                        });
                        //Freeze target
                        var bufferObj={
                            moveTo:function(){},
                            moveToward:function(){},
                            attack:function(){}
                        };
                        //Effect
                        targets.forEach(function(target){
                            target.dock();
                            if (target.stopAttack) target.stopAttack();
                            target.addBuffer(bufferObj);
                            //Buffer flag
                            target.buffer.MaelStorm=true;
                            //Mael storm effect
                            new Animation.MaelStorm({target:target,callback:function(){
                                //Restore in 18 seconds
                                if (target.status!='dead' && target.buffer.MaelStorm){
                                    if (target.removeBuffer(bufferObj)) delete target.buffer.MaelStorm;
                                }
                            }});
                        });
                        //MaelStorm sound
                        if (anime.insideScreen()) new Audio('bgm/Magic.MaelStorm.wav').play();
                    }});
                    //MaelStormSpell sound
                    if (anime.insideScreen()) new Audio('bgm/Magic.StasisField.wav').play();
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
Magic.Scarab={
    name:"Scarab",
    enabled:true,
    cost:{
        mine:15,
        time:70
    },
    spell:function(){
        this.scarabNum++;
        //Refresh to disabled
        Button.reset();
    }
};
Magic.Interceptor={
    name:"Interceptor",
    enabled:true,
    cost:{
        mine:25,
        time:200
    },
    spell:function(){
        //Build interceptor
        this.continuousAttack.count++;
        //Refresh to disabled
        Button.reset();
    }
};
Magic.Recall={
    name:"Recall",
    cost:{magic:150},
    credit:true,
    enabled:false,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            var myself=this;
            if (Resource.payCreditBill.call(myself)){
                //Recall animation
                var anime=new Animation.Recall({x:location.x,y:location.y,callback:function(){
                    //Get in range our units
                    var targets=Game.getInRangeOnes(location.x,location.y,50*1.2>>0,false,true);
                    //Recall animation again
                    var animeII=new Animation.Recall({x:myself.posX(),y:myself.posY()});
                    //Recall sound
                    if (animeII.insideScreen()) new Audio('bgm/Magic.Recall.wav').play();
                    //Effect
                    targets.forEach(function(chara){
                        //Relocate targets
                        chara.x=myself.x;
                        chara.y=myself.y;
                    });
                }});
                //Recall sound
                if (anime.insideScreen()) new Audio('bgm/Magic.Recall.wav').play();
            }
        }
        //If missing location info, mark Button.callback, mouseController will call back with location
        else {
            Button.callback=_$.hitch(arguments.callee,this);
            $('div.GameLayer').attr('status','button');
        }
    }
};
Magic.StasisField={
    name:"StasisField",
    cost:{magic:100},
    credit:true,
    enabled:false,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            //Move toward target to fire StasisField
            this.targetLock=true;
            var myself=this;
            this.moveTo(location.x,location.y,this.get('sight'),function(){
                if (Resource.payCreditBill.call(myself)){
                    //Spell StasisField animation
                    var anime=new Animation.StasisFieldSpell({x:location.x,y:location.y,callback:function(){
                        //Get in range units
                        var targets=Game.getInRangeOnes(location.x,location.y,64*1.2>>0,null,true);
                        //Effect:Freeze target
                        var bufferObj={
                            moveTo:function(){},
                            moveToward:function(){},
                            attack:function(){},
                            getDamageBy:function(){}
                        };
                        targets.forEach(function(target){
                            if (target.status!='dead'){
                                //Buffer flag
                                if (target.buffer.StasisField) return;//Not again
                                target.buffer.StasisField=true;
                                //Effect
                                target.dock();
                                if (target.stopAttack) target.stopAttack();
                                //Freeze target
                                target.addBuffer(bufferObj);
                                //Stasis status
                                target.stop();
                                clearInterval(target.dockTimer);
                                //Stasis field animation
                                new Animation.StasisField({target:target,callback:function(){
                                    //Restore in 30 seconds
                                    if (target.status!='dead' && target.buffer.StasisField){
                                        if (target.removeBuffer(bufferObj)) {
                                            delete target.buffer.StasisField;
                                            target.dock();
                                        }
                                    }
                                }});
                            }
                        });
                    }});
                    //StasisField sound
                    if (anime.insideScreen()) new Audio('bgm/Magic.StasisField.wav').play();
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
Magic.DisruptionWeb={
    name:"DisruptionWeb",
    cost:{magic:125},
    credit:true,
    _timer:0,
    enabled:false,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            //Move toward target to fire DisruptionWeb
            this.targetLock=true;
            var myself=this;
            this.moveTo(location.x,location.y,this.get('sight'),function(){
                if (Resource.payCreditBill.call(myself)){
                    //DisruptionWeb animation
                    var anime=new Animation.DisruptionWeb({x:location.x,y:location.y});
                    //DisruptionWeb sound
                    if (anime.insideScreen()) new Audio('bgm/Magic.DisruptionWeb.wav').play();
                    //Dynamic update targets every 1 second
                    var targets=[];
                    //Effect:Disable target attack
                    var bufferObj={
                        attack:function(){}
                    };
                    //Disruption web wave
                    var disruptionWeb=function(){
                        //Clear old units buffer
                        targets.forEach(function(chara){
                            chara.removeBuffer(bufferObj);
                        });
                        targets=[];
                        var disruptionWebs=Burst.allEffects.filter(function(effect){
                            return effect instanceof Animation.DisruptionWeb;
                        });
                        //Check if any disruption web exist
                        if (disruptionWebs.length) {
                            //Get targets inside all of webs
                            disruptionWebs.forEach(function(web){
                                //Update buffer on enemy ground units inside web
                                targets=targets.concat(Game.getInRangeOnes(web.posX(),web.posY(),[76*1.2>>0,56*1.2>>0],true,true,false));
                            });
                            targets = [...new Set(targets)];
                            //Effect
                            targets.forEach(function(chara){
                                //Cannot attack
                                if (chara.attack) {
                                    chara.stopAttack();
                                    chara.addBuffer(bufferObj);
                                }
                            });
                            Magic.DisruptionWeb._timer=setTimeout(disruptionWeb,1000);
                        }
                        else Magic.DisruptionWeb._timer=0;
                    };
                    //If not calculating, execute
                    if (!Magic.DisruptionWeb._timer) disruptionWeb();
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
Magic.RechargeShields={
    name:"RechargeShields",
    enabled:true,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            var myself=this;
            //Restore our units, have shield and in sight
            var target=Game.getSelectedOne(location.x,location.y,false,true,null,function(chara){
                return chara.SP && myself.canSee(chara);
            });
            if (target instanceof Gobj){
                //Recharge shield animation
                var anime=new Animation.RechargeShields({target:target});
                //Recharge shield sound
                if (anime.insideScreen()) new Audio('bgm/Magic.RechargeShields.wav').play();
                var hurt=target.get('SP')-target.shield;
                var needMagic=(hurt/2+0.5)>>0;
                //Remaining magic is sufficient
                if (this.magic>needMagic) {
                    //Full recover
                    target.shield=target.get('SP');
                    this.magic-=needMagic;
                }
                //Remaining magic is not enough
                else {
                    //Use all remaining magic
                    target.shield+=(this.magic*2);
                    this.magic=0;
                }
            }
            else {
                //Cannot reach target, pError
            }
        }
        //If missing location info, mark Button.callback, mouseController will call back with location
        else {
            Button.callback=_$.hitch(arguments.callee,this);
            $('div.GameLayer').attr('status','button');
        }
    }
};
