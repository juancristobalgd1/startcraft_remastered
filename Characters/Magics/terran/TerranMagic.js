Magic.StimPacks={
    name:"StimPacks",
    enabled:false,
    spell:function(){
        //Rage flag for units to decide stim or not
        if (!this.buffer.Stim) {
            //Cause damage
            this.life-=10;
            if (this.life<1) this.life=1;
            //Stim sound
            if (this.insideScreen()) new Audio('bgm/Magic.StimPacks.wav').play();
            //Effect
            var bufferObj={
                attackInterval:800,
                speed:Unit.getSpeedMatrixBy(14)
            };
            this.addBuffer(bufferObj);
            this.buffer.Stim=true;
            //Will only be stim for 15sec
            var myself=this;
            setTimeout(function(){
                if (myself.status!='dead' && myself.buffer.Stim){
                    //Special effect is over
                    if (myself.removeBuffer(bufferObj)) delete myself.buffer.Stim;
                }
            },15000);
        }
    }
};
Magic.PersonalCloak={
    name:"PersonalCloak",
    cost:{magic:25},
    enabled:false,
    spell:function(){
        //Will only be invisible when having magic
        if (!this.cloakBuffer) {
            var bufferObj={
                isInvisible:true,
                //Magic losing every seconds
                recover:function(){
                    if (this.magic>0 && !Cheat.gathering) this.magic--;
                    if (this.magic<=0) {
                        //Might be negative float
                        this.magic=0;
                        //Special effect is over
                        if (this.removeBuffer(bufferObj)) {
                            delete this.buffer.Cloak;
                            delete this.cloakBuffer;
                            //Recover icons and apply callbacks
                            delete this.items;
                            Button.reset();
                        }
                    }
                }
            };
            //Effect
            this.buffer.Cloak=true;
            this.addBuffer(bufferObj);
            this.cloakBuffer=bufferObj;
        }
        //Change icon
        var items=_$.clone(this.items);
        for (var N in items){
            if (items[N].name=="Cloak") items[N].name="Decloak";
        }
        this.items=items;
        //Apply callback
        Button.reset();
    }
};
Magic.Decloak={
    name:"Decloak",
    enabled:true,
    spell:function(){
        if (this.cloakBuffer) {
            //Special effect is over
            if (this.removeBuffer(this.cloakBuffer)) {
                delete this.buffer.Cloak;
                delete this.cloakBuffer;
            }
        }
        //Recover icons and apply callbacks
        delete this.items;
        Button.reset();
    }
};
Magic.Lockdown={
    name:"Lockdown",
    cost:{magic:100},
    credit:true,
    enabled:false,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            //Target enemy unit, machine unit
            var target=Game.getSelectedOne(location.x,location.y,true,true,null,function(chara){
                return chara.isMachine() && !chara.buffer.Lockdown;
            });
            if (target instanceof Gobj){
                var myself=this;
                this.targetLock=true;
                //Move toward target to fire lockdown
                this.moveToward(target,300,function(){
                    if (Resource.payCreditBill.call(myself)){
                        //Fire lockdown missile
                        var bullet=new Bullets.SingleMissile({
                            from:myself,
                            to:target,
                            damage:0
                        });
                        myself.bullet=bullet;
                        bullet.fire(function(){
                            //Lockdown effect
                            if (target.status!='dead'){
                                //Stop target
                                target.dock();
                                var bufferObj={
                                    moveTo:function(){},
                                    moveToward:function(){},
                                    attack:function(){}
                                };
                                //Freeze status
                                target.addBuffer(bufferObj);
                                target.stop();
                                clearInterval(target.dockTimer);
                                //Flag
                                target.buffer.Lockdown=true;
                                //Lockdown animation, show hidden frames first
                                var anime=new Animation.Lockdown({target:target,callback:function(){
                                    //Restore after 60 seconds
                                    if (target.status!='dead' && target.buffer.Lockdown){
                                        if (target.removeBuffer(bufferObj)) delete target.buffer.Lockdown;
                                        target.dock();
                                    }
                                }});
                                anime.action=7;
                                //Lockdown sound
                                if (anime.insideScreen()) new Audio('bgm/Magic.Lockdown.wav').play();
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
Magic.NuclearStrike={
    name:"NuclearStrike",
    enabled:1,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            //Move toward target to fire Nuclear bomb
            this.targetLock=true;
            var myself=this;
            this.moveTo(location.x,location.y,this.get('sight'),function(){
                //Fire Nuclear bomb
                var bullet=new Bullets.NuclearBomb({
                    from:{x:location.x,y:location.y-250},
                    to:{x:location.x,y:location.y}
                });
                myself.bullet=bullet;
                //Fire Nuclear bomb with callback
                bullet.fire(function(){
                    //Nuclear bomb effect, should earlier than bomb animation draw
                    //Get in range charas, no matter ours or enemies
                    var targets=Game.getInRangeOnes(location.x,location.y,175);
                    targets.forEach(function(chara){
                        //Cause 500 damage
                        chara.life-=500;
                        if (chara.life<=0) chara.die();
                    });
                    //Nuclear animation
                    var anime=new Animation.NuclearStrike({x:location.x,y:location.y});
                    //Nuclear sound
                    if (anime.insideScreen()) new Audio('bgm/Magic.NuclearStrike.wav').play();
                    //Use one bomb
                    if (Magic.NuclearStrike.enabled>0) {
                        Magic.NuclearStrike.enabled--;
                        Button.reset();
                    }
                });
            });
        }
        //If missing location info, mark Button.callback, mouseController will call back with location
        else {
            Button.callback=_$.hitch(arguments.callee,this);
            $('div.GameLayer').attr('status','button');
        }
    }
};
Magic.Heal={
    name:"Heal",
    cost:{magic:1},
    credit:true,
    enabled:true,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            var myself=this;
            //Heal our units on ground, animal unit
            var target=Game.getSelectedOne(location.x,location.y,false,true,false,function(chara){
                return !(chara.isMachine());
            });
            if (target instanceof Gobj){
                this.targetLock=true;
                //Move toward target to heal him
                this.moveToward(target,70,function(){
                    //Heal target until becoming healthy
                    var healTimer=setInterval(function(){
                        //Medic has magic and target is injured
                        if (myself.magic && target.life<target.get('HP')) {
                            //Heal target
                            target.life+=10;
                            if (target.life>target.get('HP')) target.life=target.get('HP');
                            myself.magic-=5;
                            //Heal action and sound
                            if (myself.insideScreen()) new Audio('bgm/Magic.Heal.wav').play();
                        }
                        else clearInterval(healTimer);
                    },500);
                });
            }
            delete Resource.creditBill;//else
        }
        //If missing location info, mark Button.callback, mouseController will call back with location
        else {
            Button.callback=_$.hitch(arguments.callee,this);
            $('div.GameLayer').attr('status','button');
        }
    }
};
Magic.Restoration={
    name:"Restoration",
    cost:{magic:50},
    credit:true,
    enabled:false,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            //Restore all units
            var target=Game.getSelectedOne(location.x,location.y,null,true);
            if (target instanceof Gobj){
                var myself=this;
                this.targetLock=true;
                //Move toward target to restore unit
                this.moveToward(target,140,function(){
                    if (Resource.payCreditBill.call(myself)){
                        //Restore effect
                        var anime=new Animation.Restoration({target:target});
                        //Restore sound
                        if (anime.insideScreen()) new Audio('bgm/Magic.Restoration.wav').play();
                        //Remove all bufferObjs
                        $.extend([],target.bufferObjs).forEach(function(bufferObj){
                            target.removeBuffer(bufferObj);
                        });
                        //Remove remaining buffer
                        if (target.cloakBuffer) delete target.cloakBuffer;
                        if (target.purpleBuffer) delete target.purpleBuffer;
                        //Delete all buffer animations on target
                        var bufferAnimations=['StasisField','Lockdown','Plague','Ensnare','PurpleEffect','RedEffect','GreenEffect','DefensiveMatrix','MaelStorm','Irradiate'];
                        $.extend([],Burst.allEffects).forEach(function(effect){
                            if (effect.target==target && bufferAnimations.some(function(name){return (effect instanceof Animation[name]);}))
                                Burst.allEffects.splice(Burst.allEffects.indexOf(effect),1);
                        });
                        //Delete all buffers, some cannot delete
                        if (target.buffer.Hallucination) target.buffer={Hallucination:true};
                        else target.buffer={};
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
Magic.OpticalFlare={
    name:"OpticalFlare",
    cost:{magic:75},
    credit:true,
    enabled:false,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            //Shoot enemy unit
            var target=Game.getSelectedOne(location.x,location.y,true,true);
            if (target instanceof Gobj){
                var myself=this;
                this.targetLock=true;
                //Move toward target to fire optical flare
                this.moveToward(target,this.get('sight'),function(){
                    if (Resource.payCreditBill.call(myself)){
                        //Fire optical flare
                        var bullet=new Bullets.VultureBall({
                            from:myself,
                            to:target,
                            damage:0
                        });
                        myself.bullet=bullet;
                        bullet.fire(function(){
                            //Effect
                            var bufferObj={
                                sight:target.radius()
                            };
                            if (target.status!='dead') target.addBuffer(bufferObj);
                            //Buffer flag
                            target.buffer.Blind=true;
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
Magic.SpiderMines={
    name:"SpiderMines",
    enabled:false,
    spell:function(location){}
};
Magic.SeigeMode={
    name:"SeigeMode",
    enabled:false,
    spell:function(){}
};
Magic.Cloak={
    name:"Cloak",
    cost:{magic:25},
    enabled:false,
    spell:function(){
        Magic.PersonalCloak.spell.call(this);
    }
};
Magic.DefensiveMatrix={
    name:"DefensiveMatrix",
    cost:{magic:100},
    credit:true,
    enabled:true,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            //Restore our units
            var target=Game.getSelectedOne(location.x,location.y,false,true,null,function(chara){
                return !chara.buffer.DefensiveMatrix;//Not again
            });
            if (target instanceof Gobj){
                var myself=this;
                this.targetLock=true;
                //Move toward target to activate defensive matrix
                this.moveToward(target,250,function(){
                    if (Resource.payCreditBill.call(myself)){
                        //Defensive matrix animation
                        var anime=new Animation.DefensiveMatrix({target:target,callback:function(){
                            //Restore after 60 seconds, if no restoration executed, or interrupted by enemy attack
                            if (target.status!='dead' && anime.status!='dead' && target.buffer.DefensiveMatrix){
                                if (target.removeBuffer(bufferObj)) delete target.buffer.DefensiveMatrix;
                            }
                        }});
                        //DefensiveMatrix sound
                        if (anime.insideScreen()) new Audio('bgm/Magic.DefensiveMatrix.wav').play();
                        //Defensive matrix effect: absorb 250 damage
                        var matrixHP=250;
                        var bufferObj={
                            calculateDamageBy:function(enemyObj){
                                var damage;
                                if (enemyObj instanceof Gobj){
                                    var enemyAttackType=enemyObj.attackType;
                                    if (!enemyAttackType && enemyObj.attackMode){
                                        enemyAttackType=(this.isFlying)?enemyObj.attackMode.flying.attackType:enemyObj.attackMode.ground.attackType;
                                    }
                                    damage=enemyObj.get('damage')*Unit.attackMatrix[enemyAttackType][this.unitType];
                                }
                                else damage=enemyObj;
                                //Consume matrixHP
                                matrixHP-=damage;
                                //Fully absorb damage if matrixHP still remain
                                if (matrixHP>0) return 0;
                                else {
                                    anime.die();
                                    //Release remaining damage
                                    return -matrixHP;
                                }
                            }
                        };
                        //Apply effect
                        target.addBuffer(bufferObj);
                        //Buffer flag
                        target.buffer.DefensiveMatrix=true;
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
Magic.EMPShockwave={
    name:"EMPShockwave",
    cost:{magic:100},
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
                    //Fire EMPShockwave
                    var bullet=new Bullets.SingleMissile({
                        from:myself,
                        to:{x:location.x,y:location.y}
                    });
                    myself.bullet=bullet;
                    //Fire EMPShockwave bullet with callback
                    bullet.fire(function(){
                        //EMP shockwave animation
                        var anime=new Animation.EMPShockwave({x:location.x,y:location.y});
                        //EMPShockwave sound
                        if (anime.insideScreen()) new Audio('bgm/Magic.EMPShockwave.wav').play();
                        //Get in range enemies
                        var targets=Game.getInRangeOnes(location.x,location.y,[90*1.2>>0,74*1.2>>0],true);
                        //Effect
                        targets.forEach(function(chara){
                            //Losing all shield and magic
                            if (chara.shield) chara.shield=0;
                            if (chara.magic) chara.magic=0;
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
Magic.Irradiate={
    name:"Irradiate",
    cost:{magic:75},
    credit:true,
    enabled:false,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            //Target enemy unit, animal unit
            var target=Game.getSelectedOne(location.x,location.y,true,true,null,function(chara){
                return !(chara.isMachine()) && !chara.buffer.Irradiate;
            });
            if (target instanceof Gobj){
                var myself=this;
                this.targetLock=true;
                var irradiate=function(chara){
                    //Irradiate effect
                    var anime=new Animation.Irradiate({target:chara,callback:function(){
                        //Restore after 25 seconds, dealing 250 damage
                        if (chara.status!='dead' && chara.buffer.Irradiate){
                            if (chara.removeBuffer(bufferObj)) delete chara.buffer.Irradiate;
                            clearInterval(chara.dockTimer);
                            chara.dock();
                        }
                    }});
                    //Irradiate sound
                    if (anime.insideScreen()) new Audio('bgm/Magic.Irradiate.wav').play();
                    //Losing life over time and walk around
                    chara.buffer.Irradiate=true;//Flag
                    var bufferObj={
                        recover:function(){
                            //Get in range enemies and infect
                            Game.getInRangeOnes(chara.posX(),chara.posY(),50,true,true,null,function(chara){
                                return !(chara.isMachine()) && !chara.buffer.Irradiate;
                            }).forEach(function(chara){
                                irradiate(chara);
                            });
                            if (this.life>0) this.life-=10;//Refresh every 1 seconds
                            if (this.life<=0) this.die();
                        },
                        dock:Neutral.Bengalaas.prototype.dock
                    };
                    chara.addBuffer(bufferObj);
                    chara.dock();
                };
                //Move toward target to spell Irradiate
                this.moveToward(target,300,function(){
                    if (Resource.payCreditBill.call(myself)){
                        irradiate(target);
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
Magic.Yamato={
    name:"Yamato",
    cost:{magic:150},
    credit:true,
    enabled:false,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            //Shoot all enemy
            var target=Game.getSelectedOne(location.x,location.y,true);
            if (target instanceof Gobj){
                var myself=this;
                this.targetLock=true;
                //Move toward target to fire yamato
                this.moveToward(target,this.get('sight'),function(){
                    if (Resource.payCreditBill.call(myself)){
                        //Fire yamato
                        var bullet=new Bullets.Yamato({
                            from:myself,
                            to:target,
                            damage:250
                        });
                        myself.bullet=bullet;
                        bullet.fire();
                        if (myself.insideScreen()) new Audio('bgm/HeroCruiser.attack.wav').play();
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
Magic.ScannerSweep={
    name:"ScannerSweep",
    cost:{magic:50},
    credit:true,
    enabled:true,
    spell:function(location){
        //Has location callback info or nothing
        if (location){
            if (Resource.payCreditBill.call(this)){
                //ScannerSweep animation
                var anime=new Animation.ScannerSweep({x:location.x,y:location.y});
                //ScannerSweep sound
                if (anime.insideScreen()) new Audio('bgm/Magic.ScannerSweep.wav').play();
            }
        }
        //If missing location info, mark Button.callback, mouseController will call back with location
        else {
            Button.callback=_$.hitch(arguments.callee,this);
            $('div.GameLayer').attr('status','button');
        }
    }
};
Magic.ArmNuclearSilo={
    name:"ArmNuclearSilo",
    cost:{mine:200,gas:200,man:8},
    enabled:true,
    spell:function(){
        Magic.NuclearStrike.enabled++;
    }
};
Magic.LiftOff={
    name:"LiftOff",
    enabled:false,
    spell:function(){}
};
Magic.Land={
    name:"Land",
    enabled:false,
    spell:function(location){}
};
