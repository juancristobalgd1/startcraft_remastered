Protoss.Shuttle=Unit.extends({
    constructorPlus:function(props){
        //Same action mapping
        this.imgPos.dock=this.imgPos.moving;
        this.frame.dock=this.frame.moving;
    },
    prototypePlus: {
        //Add basic unit info
        name: "Shuttle",
        imgPos: {
            moving: {
                left: [0, 60, 120, 180, 240, 60, 120, 180],
                top: [0, 0, 0, 0, 0, 60, 60, 60]
            }
        },
        width: 60,//N-1
        height: 60,//N-1
        frame: {
            moving: 1
        },
        //Only for moving status, override
        speed:Unit.getSpeedMatrixBy(11),
        HP: 80,
        SP: 60,
        armor:1,
        plasma:0,
        sight:280,
        portraitOffset: {x:300,y:112},
        dieEffect:Burst.MiddleBlueExplode,
        isFlying:true,
        unitType:Unit.BIG,
        recover:Building.ProtossBuilding.prototype.recover,
        cost:{
            mine:200,
            man:2,
            time:600
        },
        upgrade:['UpgradeAirArmor','UpgradePlasmaShields'],
        items:{
            '8':{name:'Load'}
        },
        //Override
        dock:function(){
            //Use the same behavior
            Unit.hover.call(this);
        }
    }
});
Protoss.Observer=Unit.extends({
    constructorPlus:function(props){
        //Same action mapping
        this.imgPos.dock=this.imgPos.moving;
        this.frame.dock=this.frame.moving;
    },
    prototypePlus: {
        //Add basic unit info
        name: "Observer",
        imgPos: {
            moving: {
                left: [0, 80, 160, 240, 320, 80, 160, 240],
                top: [0, 0, 0, 0, 0, 40, 40, 40]
            }
        },
        width: 40,//N-1
        height: 40,//N-1
        frame: {
            moving: 1
        },
        //Only for moving status, override
        speed:Unit.getSpeedMatrixBy(8),
        HP: 40,
        SP: 20,
        armor:0,
        plasma:0,
        sight:315,
        portraitOffset: {x:420,y:112},
        dieEffect:Burst.SmallBlueExplode,
        isFlying:true,
        isInvisible:true,
        unitType:Unit.SMALL,
        recover:Building.ProtossBuilding.prototype.recover,
        detector:Gobj.detectorBuffer,
        cost:{
            mine:25,
            gas:75,
            man:1,
            time:400
        },
        upgrade:['UpgradeAirArmor','UpgradePlasmaShields'],
        //Override
        dock:function(){
            //Use the same behavior
            Unit.hover.call(this);
        }
    }
});
Protoss.Scout=AttackableUnit.extends({
    constructorPlus:function(props){
        //Same action mapping
        this.imgPos.dock=this.imgPos.moving;
        this.frame.dock=this.frame.moving;
        //Bind bgm
        this.sound.attackG=new Audio('bgm/'+this.name+'.attack.wav');
        this.sound.attackF=new Audio('bgm/'+this.name+'.attackF.wav');
    },
    prototypePlus: {
        //Add basic unit info
        name: "Scout",
        imgPos: {
            moving: {
                left: [8, 152, 296, 440, 584, 152, 296, 440],
                top: [8, 8, 8, 8, 8, 152, 152, 152]
            },
            attack: {
                left: [
                    [8, 8],
                    [152, 152],
                    [296, 296],
                    [440, 440],
                    [584, 584],
                    [152, 152],
                    [296, 296],
                    [440, 440]
                ],
                top: [
                    [8, 80],
                    [8, 80],
                    [8, 80],
                    [8, 80],
                    [8, 80],
                    [152, 224],
                    [152, 224],
                    [152, 224]
                ]
            }
        },
        width: 56,//72N-64
        height: 56,//72N-64
        frame: {
            moving: 1,
            attack: 2
        },
        //Only for moving status, override
        speed:Unit.getSpeedMatrixBy(12),
        HP: 150,
        SP: 100,
        attackMode:{
            flying:{
                attackRange:210,
                attackInterval: 2200,
                damage:28,
                attackType:AttackableUnit.BURST_ATTACK
            },
            ground:{
                attackRange:105,
                attackEffect:Burst.BlueShootSpark,
                attackInterval: 2200,
                damage:8,
                attackType:AttackableUnit.NORMAL_ATTACK
            },
            status:false
        },
        //Default
        damage: 8,
        armor:0,
        plasma:0,
        sight:280,
        attackRange: 105,
        portraitOffset: {x:480,y:112},
        dieEffect:Burst.MiddleBlueExplode,
        isFlying:true,
        unitType:Unit.BIG,
        recover:Building.ProtossBuilding.prototype.recover,
        cost:{
            mine:300,
            gas:150,
            man:3,
            time:800
        },
        upgrade:['UpgradeAirWeapons','UpgradeAirArmor','UpgradePlasmaShields'],
        //Override
        dock:function(){
            //Use the same behavior
            AttackableUnit.hover.call(this);
        }
    }
});
Protoss.Carrier=AttackableUnit.extends({
    constructorPlus:function(props){
        //Same action mapping
        this.imgPos.attack=this.imgPos.dock=this.imgPos.moving;
        this.frame.attack=this.frame.dock=this.frame.moving;
        //Override
        this.continuousAttack={
            count:(props.isEnemy)?(this.get('interceptorCapacity')):0,
            layout:this.continuousAttack.layout
        };
        this.isReloaded=function(){
            return this.coolDown && this.continuousAttack.count>0;
        };
    },
    prototypePlus: {
        //Add basic unit info
        name: "Carrier",
        imgPos: {
            moving: {
                left: [0, 512, 1024, 1536, 0, 512, 1024, 1536],
                top: [0, 0, 0, 0, 128, 128, 128, 128]
            }
        },
        width: 128,//N-1
        height: 128,//N-1
        frame: {
            moving: 1
        },
        //Only for moving status, override
        speed:Unit.getSpeedMatrixBy(8),
        HP: 300,
        SP: 150,
        damage: 6,
        armor:4,
        plasma:0,
        sight:385,
        attackRange: 280,
        attackInterval: 1000,
        recover:Building.ProtossBuilding.prototype.recover,
        interceptorCapacity:4,
        continuousAttack:{
            count:4,//8
            layout:function(bullet,num){
                //Reassign location, surround target
                var centerX=bullet.target.posX();
                var centerY=bullet.target.posY();
                var radius=120;
                switch (num){
                    //Left
                    case 0:
                        bullet.x=centerX-radius-bullet.width/2;
                        bullet.y=centerY-bullet.height/2;
                        bullet.speed={x:radius/4,y:0};
                        bullet.angle=0;
                        break;
                    //Right
                    case 1:
                        bullet.x=centerX+radius-bullet.width/2;
                        bullet.y=centerY-bullet.height/2;
                        bullet.speed={x:-radius/4,y:0};
                        bullet.angle=Math.PI;
                        break;
                    //Top
                    case 2:
                        bullet.x=centerX-bullet.width/2;
                        bullet.y=centerY-radius-bullet.height/2;
                        bullet.speed={x:0,y:radius/4};
                        bullet.angle=-Math.PI/2;
                        break;
                    //Bottom
                    case 3:
                        bullet.x=centerX-bullet.width/2;
                        bullet.y=centerY+radius-bullet.height/2;
                        bullet.speed={x:0,y:-radius/4};
                        bullet.angle=Math.PI/2;
                        break;
                    //Top-left
                    case 4:
                        bullet.x=centerX-radius*0.7-bullet.width/2;
                        bullet.y=centerY-radius*0.7-bullet.height/2;
                        bullet.speed={x:0.7*radius/4,y:0.7*radius/4};
                        bullet.angle=-Math.PI/4;
                        break;
                    //Top-right
                    case 5:
                        bullet.x=centerX+radius*0.7-bullet.width/2;
                        bullet.y=centerY-radius*0.7-bullet.height/2;
                        bullet.speed={x:-0.7*radius/4,y:0.7*radius/4};
                        bullet.angle=-Math.PI*3/4;
                        break;
                    //Bottom-left
                    case 6:
                        bullet.x=centerX-radius*0.7-bullet.width/2;
                        bullet.y=centerY+radius*0.7-bullet.height/2;
                        bullet.speed={x:0.7*radius/4,y:-0.7*radius/4};
                        bullet.angle=Math.PI/4;
                        break;
                    //Bottom-right
                    case 7:
                        bullet.x=centerX+radius*0.7-bullet.width/2;
                        bullet.y=centerY+radius*0.7-bullet.height/2;
                        bullet.speed={x:-0.7*radius/4,y:-0.7*radius/4};
                        bullet.angle=Math.PI*3/4;
                        break;
                }
            }
        },
        portraitOffset: {x:540,y:112},
        dieEffect:Burst.BigBlueExplode,
        isFlying:true,
        unitType:Unit.BIG,
        attackType:AttackableUnit.NORMAL_ATTACK,
        cost:{
            mine:350,
            gas:250,
            man:8,
            time:1400
        },
        upgrade:['UpgradeAirWeapons','UpgradeAirArmor','UpgradePlasmaShields'],
        items:{
            '7':{name:'Interceptor',condition:function(){
                if (!Game.selectedUnit.continuousAttack.count) $('button.attack').attr('disabled',true);
                else $('button.attack').removeAttr('disabled');
                return Game.selectedUnit.continuousAttack.count<Game.selectedUnit.get('interceptorCapacity');
            }}
        },
        //Override
        dock:function(){
            //Use the same behavior
            AttackableUnit.hover.call(this);
        }
    }
});
Protoss.Arbiter=AttackableUnit.extends({
    constructorPlus:function(props){
        //Same action mapping
        this.imgPos.dock=this.imgPos.moving;
        this.frame.dock=this.frame.moving;
    },
    prototypePlus: {
        //Add basic unit info
        name: "Arbiter",
        imgPos: {
            moving: {
                left: [0, 152, 304, 456, 608, 152, 304, 456],
                top: [0, 0, 0, 0, 0, 76, 76, 76]
            }
        },
        width: 76,//N-1
        height: 76,//N-1
        frame: {
            moving: 1
        },
        //Only for moving status, override
        speed:Unit.getSpeedMatrixBy(12),
        HP: 200,
        SP: 150,
        damage: 10,
        armor:1,
        plasma:0,
        MP: 200,
        sight:315,
        attackRange: 175,
        attackInterval: 4500,
        portraitOffset: {x:660,y:112},
        dieEffect:Burst.MiddleBlueExplode,
        isFlying:true,
        unitType:Unit.BIG,
        attackType:AttackableUnit.BURST_ATTACK,
        recover:Building.ProtossBuilding.prototype.recover,
        cost:{
            mine:100,
            gas:350,
            man:4,
            time:1600
        },
        upgrade:['UpgradeAirWeapons','UpgradeAirArmor','UpgradePlasmaShields'],
        items:{
            '7':{name:'Recall',condition:function(){
                return Magic.Recall.enabled
            }},
            '8':{name:'StasisField',condition:function(){
                return Magic.StasisField.enabled
            }}
        },
        //Special skill: make nearby units invisible
        bufferObj:{
            isInvisible:true
        },
        //Override
        dock:function(){
            //Use the same behavior
            AttackableUnit.hover.call(this);
        }
    }
});
Protoss.Corsair=AttackableUnit.extends({
    constructorPlus:function(props){
        //Same action mapping
        this.imgPos.dock=this.imgPos.moving;
        this.frame.dock=this.frame.moving;
    },
    prototypePlus: {
        //Add basic unit info
        name: "Corsair",
        imgPos: {
            moving: {
                left: [0, 60, 120, 180, 240, 360, 420, 480],
                top: [0, 0, 0, 0, 0, 0, 0, 0]
            },
            attack: {
                left: [
                    [0, 0, 0, 0, 0],
                    [60, 60, 60, 60, 60],
                    [120, 120, 120, 120, 120],
                    [180, 180, 180, 180, 180],
                    [240, 240, 240, 240, 240],
                    [360, 360, 360, 360, 360],
                    [420, 420, 420, 420, 420],
                    [480, 480, 480, 480, 480]
                ],
                top: [
                    [0, 60, 120, 180, 240],
                    [0, 60, 120, 180, 240],
                    [0, 60, 120, 180, 240],
                    [0, 60, 120, 180, 240],
                    [0, 60, 120, 180, 240],
                    [0, 60, 120, 180, 240],
                    [0, 60, 120, 180, 240],
                    [0, 60, 120, 180, 240]
                ]
            }
        },
        width: 60,//N-1
        height: 60,//N-1
        frame: {
            moving: 1,
            attack: 5
        },
        //Only for moving status, override
        speed:Unit.getSpeedMatrixBy(16),
        HP: 100,
        SP: 80,
        damage: 5,
        armor:1,
        plasma:0,
        MP: 200,
        sight:315,
        attackRange: 175,
        attackInterval: 800,
        portraitOffset: {x:720,y:112},
        dieEffect:Burst.MiddleBlueExplode,
        attackEffect:Burst.CorsairCloud,
        isFlying:true,
        attackLimit:"flying",
        unitType:Unit.MIDDLE,
        attackType:AttackableUnit.BURST_ATTACK,
        recover:Building.ProtossBuilding.prototype.recover,
        cost:{
            mine:150,
            gas:100,
            man:2,
            time:400
        },
        upgrade:['UpgradeAirWeapons','UpgradeAirArmor','UpgradePlasmaShields'],
        items:{
            '7':{name:'DisruptionWeb',condition:function(){
                return Magic.DisruptionWeb.enabled
            }}
        },
        AOE:{
            hasEffect:true,
            radius:100
        },
        //Override
        dock:function(){
            //Use the same behavior
            AttackableUnit.hover.call(this);
        }
    }
});
