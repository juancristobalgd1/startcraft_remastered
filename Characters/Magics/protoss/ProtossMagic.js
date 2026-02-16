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
            this.moveTo(location.x,location.y,this.get('sight'),() => {
                if (Resource.payCreditBill.call(this)){
                    //PsionicStorm animation
                    const anime=new Animation.PsionicStorm({x:location.x,y:location.y});
                    //PsionicStorm sound
                    if (anime.insideScreen()) new Audio('bgm/Magic.PsionicStorm.wav').play();
                    //PsionicStorm effect
                    let targets=[];
                    Magic.PsionicStorm.speller=this;
                    //Psionic storm wave
                    const stormWave=() => {
                        targets=[];
                        //Check if any psionic storm exist
                        const psionicStorms=Burst.allEffects.filter((effect) => effect instanceof Animation.PsionicStorm);
                        if (psionicStorms.length) {
                            //Get targets inside all of swarms
                            psionicStorms.forEach((storm) => {
                                //Update buffer on enemy units inside storm
                                targets=targets.concat(Game.getInRangeOnes(storm.posX(),storm.posY(),[94*1.2>>0,76*1.2>>0],null,true));
                            });
                            targets = [...new Set(targets)];
                            //Effect
                            targets.forEach((chara) => {
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
            const target=Game.getSelectedOne(location.x,location.y,null,true);
            if (target instanceof Gobj){
                this.targetLock=true;
                //Move toward target to create 2 hallucinations
                this.moveToward(target,245,() => {
                    if (Resource.payCreditBill.call(this)){
                        //Hallucination effect
                        const anime=new Animation.Hallucination({target:target});
                        //Hallucination sound
                        if (anime.insideScreen()) new Audio('bgm/Magic.Hallucination.wav').play();
                        //Initial
                        let halluDamage;
                        let halluAttackMode;
                        const Hallucinations=[];
                        if (target.attack!=null) {
                            if (target.attackMode){
                                halluAttackMode=_$.clone(target.attackMode);
                                halluAttackMode.flying.damage=0;
                                halluAttackMode.ground.damage=0;
                            }
                            else halluDamage=0;
                        }
                        //Combine temp constructor for hallucination
                        const halluConstructor=target.constructor.extends({
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
                        for (let n=0;n<2;n++){
                            const hallucination=new halluConstructor({x:target.posX(),y:target.posY()});
                            Hallucinations.push(hallucination);
                        }
                        //Will disappear after 180 seconds
                        setTimeout(() => {
                            Hallucinations.forEach((chara) => {
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
            const target=Game.getSelectedOne(location.x,location.y,true,true,null,(chara) => {
                return chara.MP;
            });
            if (target instanceof Gobj){
                this.targetLock=true;
                //Move toward target to spell Feedback
                this.moveToward(target,300,() => {
                    if (Resource.payCreditBill.call(this)){
                        //Feedback effect
                        const anime=new Animation.Feedback({target:target});
                        //Feedback sound
                        if (anime.insideScreen()) new Audio('bgm/Magic.Feedback.wav').play();
                        //Deal damage same as its magic, lose all magic
                        target.getDamageBy(target.magic);
                        target.reactionWhenAttackedBy(this);
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
            const target=Game.getSelectedOne(location.x,location.y,true);
            if (target instanceof Gobj){
                this.targetLock=true;
                //Move toward target to mind control it
                this.moveToward(target,280,() => {
                    if (Resource.payCreditBill.call(this)){
                        //Mind control animation
                        const anime=new Animation.MindControl({target:target});
                        //MindControl sound
                        if (anime.insideScreen()) new Audio('bgm/Magic.MindControl.wav').play();
                        //Control and tame enemy
                        target.isEnemy=false;
                        //Order ours not to attack it anymore
                        Unit.allOurUnits().concat(Building.ourBuildings).forEach((chara) => {
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
            this.moveTo(location.x,location.y,this.get('sight'),() => {
                if (Resource.payCreditBill.call(this)){
                    //MaelStorm spell animation
                    const anime=new Animation.MaelStormSpell({x:location.x,y:location.y,callback:() => {
                        //Get in range enemy units, animal
                        const targets=Game.getInRangeOnes(location.x,location.y,[64*1.2>>0,64*1.2>>0],true,true,null,(chara) => {
                            return !(chara.isMachine()) && !chara.buffer.MaelStorm;
                        });
                        //Freeze target
                        const bufferObj={
                            moveTo:function(){},
                            moveToward:function(){},
                            attack:function(){}
                        };
                        //Effect
                        targets.forEach((target) => {
                            target.dock();
                            if (target.stopAttack) target.stopAttack();
                            target.addBuffer(bufferObj);
                            //Buffer flag
                            target.buffer.MaelStorm=true;
                            //Mael storm effect
                            new Animation.MaelStorm({target:target,callback:() => {
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
            if (Resource.payCreditBill.call(this)){
                //Recall animation
                const anime=new Animation.Recall({x:location.x,y:location.y,callback:() => {
                    //Get in range our units
                    const targets=Game.getInRangeOnes(location.x,location.y,50*1.2>>0,false,true);
                    //Recall animation again
                    const animeII=new Animation.Recall({x:this.posX(),y:this.posY()});
                    //Recall sound
                    if (animeII.insideScreen()) new Audio('bgm/Magic.Recall.wav').play();
                    //Effect
                    targets.forEach((chara) => {
                        //Relocate targets
                        chara.x=this.x;
                        chara.y=this.y;
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
            this.moveTo(location.x,location.y,this.get('sight'),() => {
                if (Resource.payCreditBill.call(this)){
                    //Spell StasisField animation
                    const anime=new Animation.StasisFieldSpell({x:location.x,y:location.y,callback:() => {
                        //Get in range units
                        const targets=Game.getInRangeOnes(location.x,location.y,64*1.2>>0,null,true);
                        //Effect:Freeze target
                        const bufferObj={
                            moveTo:function(){},
                            moveToward:function(){},
                            attack:function(){},
                            getDamageBy:function(){}
                        };
                        targets.forEach((target) => {
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
                                new Animation.StasisField({target:target,callback:() => {
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
            this.moveTo(location.x,location.y,this.get('sight'),() => {
                if (Resource.payCreditBill.call(this)){
                    //DisruptionWeb animation
                    const anime=new Animation.DisruptionWeb({x:location.x,y:location.y});
                    //DisruptionWeb sound
                    if (anime.insideScreen()) new Audio('bgm/Magic.DisruptionWeb.wav').play();
                    //Dynamic update targets every 1 second
                    let targets=[];
                    //Effect:Disable target attack
                    const bufferObj={
                        attack:function(){}
                    };
                    //Disruption web wave
                    const disruptionWeb=() => {
                        //Clear old units buffer
                        targets.forEach((chara) => {
                            chara.removeBuffer(bufferObj);
                        });
                        targets=[];
                        const disruptionWebs=Burst.allEffects.filter((effect) => effect instanceof Animation.DisruptionWeb);
                        //Check if any disruption web exist
                        if (disruptionWebs.length) {
                            //Get targets inside all of webs
                            disruptionWebs.forEach((web) => {
                                //Update buffer on enemy ground units inside web
                                targets=targets.concat(Game.getInRangeOnes(web.posX(),web.posY(),[76*1.2>>0,56*1.2>>0],true,true,false));
                            });
                            targets = [...new Set(targets)];
                            //Effect
                            targets.forEach((chara) => {
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
            //Restore our units, have shield and in sight
            const target=Game.getSelectedOne(location.x,location.y,false,true,null,(chara) => {
                return chara.SP && this.canSee(chara);
            });
            if (target instanceof Gobj){
                //Recharge shield animation
                const anime=new Animation.RechargeShields({target:target});
                //Recharge shield sound
                if (anime.insideScreen()) new Audio('bgm/Magic.RechargeShields.wav').play();
                const hurt=target.get('SP')-target.shield;
                const needMagic=(hurt/2+0.5)>>0;
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
