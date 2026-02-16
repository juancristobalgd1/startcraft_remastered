Zerg.Overlord=Unit.extends({
    constructorPlus:function(props){
        this.direction=3;
        this.y-=12;//(OverlordBirth.height-Overlord.height)/2
    },
    prototypePlus: {
        //Add basic unit info
        name: "Overlord",
        imgPos: {
            moving: {
                left: [
                    [8, 8, 92, 92, 174, 174, 260, 260],
                    [8, 8, 92, 92, 174, 174, 260, 260],
                    [8, 8, 92, 92, 174, 174, 260, 260],
                    [8, 8, 92, 92, 174, 174, 260, 260],
                    [8, 8, 92, 92, 174, 174, 260, 260],
                    [620, 620, 536, 536, 450, 450, 366, 366],
                    [620, 620, 536, 536, 450, 450, 366, 366],
                    [620, 620, 536, 536, 450, 450, 366, 366]
                ],
                top: [
                    [12, 12, 12, 12, 12, 12, 12, 12],
                    [180, 180, 180, 180, 180, 180, 180, 180],
                    [344, 344, 344, 344, 344, 344, 428, 428],
                    [508, 508, 508, 508, 508, 508, 508, 508],
                    [676, 676, 676, 676, 676, 676, 676, 676],
                    [508, 508, 508, 508, 508, 508, 508, 508],
                    [344, 344, 344, 344, 344, 344, 428, 428],
                    [180, 180, 180, 180, 180, 180, 180, 180]
                ]
            },
            dock: {
                left: [8, 8, 8, 8, 8, 620, 620, 620],
                top: [12, 180, 344, 508, 676, 508, 344, 180]
            }
        },
        width: 68,
        height: 72,
        frame: {
            moving: 8,
            dock: 1
        },
        //Only for moving status, override
        speed:Unit.getSpeedMatrixBy(2),
        HP: 200,
        armor:0,
        sight:315,
        portraitOffset: {x:120,y:0},
        dieEffect:Burst.BigZergFlyingDeath,
        isFlying:true,
        unitType:Unit.BIG,
        detector:Gobj.detectorBuffer,
        recover:Building.ZergBuilding.prototype.recover,
        cost:{
            mine:100,
            time:400
        },
        upgrade:['UpgradeFlyerCarapace'],
        manPlus:8,
        items:{
            '8':{name:'Load',condition:function(){
                return Magic.Load.enabled
            }}
        },
        //Override
        dock:function(){
            //Use the same behavior
            Unit.hover.call(this);
        }
    }
});
Zerg.Queen=Unit.extends({
    constructorPlus:function(props){
        //Same action mapping
        this.imgPos.dock=this.imgPos.moving;
        this.frame.dock=this.frame.moving;
        this.direction=3;
        //Adjust for multi frames
        this.y-=16;
    },
    prototypePlus: {
        //Add basic unit info
        name: "Queen",
        imgPos: {
            moving: {
                left: [
                    [0, 0, 0, 0, 0],
                    [156, 156, 156, 156, 156],
                    [312, 312, 312, 312, 312],
                    [468, 468, 468, 468, 468],
                    [624, 624, 624, 624, 624],
                    [858, 858, 858, 858, 858],
                    [1014, 1014, 1014, 1014, 1014],
                    [1170, 1170, 1170, 1170, 1170]
                ],
                top: [
                    [0, 71, 142, 213, 284],
                    [0, 71, 142, 213, 284],
                    [0, 71, 142, 213, 284],
                    [0, 71, 142, 213, 284],
                    [0, 71, 142, 213, 284],
                    [0, 71, 142, 213, 284],
                    [0, 71, 142, 213, 284],
                    [0, 71, 142, 213, 284]
                ]
            }
        },
        width: 78,//(N-1)
        height: 71,//(N-1)
        frame: {
            moving: 5
            //attack: 6//Reserved
        },
        //Only for moving status, override
        speed:Unit.getSpeedMatrixBy(16),
        HP: 120,
        armor:0,
        MP: 200,
        sight:350,
        portraitOffset: {x:540,y:0},
        dieEffect:Burst.BigZergFlyingDeath,
        isFlying:true,
        unitType:Unit.MIDDLE,
        recover:Building.ZergBuilding.prototype.recover,
        cost:{
            mine:100,
            gas:150,
            man:2,
            time:500
        },
        upgrade:['UpgradeFlyerCarapace'],
        items:{
            '6':{name:'InfestTerranCommandCenter'},
            '7':{name:'Parasite'},
            '8':{name:'SpawnBroodlings',condition:function(){
                return Magic.SpawnBroodlings.enabled
            }},
            '9':{name:'Ensnare',condition:function(){
                return Magic.Ensnare.enabled
            }}
        },
        //Override
        dock:function(){
            //Use the same behavior
            Unit.hover.call(this);
        }
    }
});
Zerg.Defiler=Unit.extends({
    constructorPlus:function(props){
        //Same action mapping
        this.imgPos.dock=this.imgPos.moving;
        this.frame.dock=this.frame.moving;
        this.sound.burrow=new Audio('bgm/Zerg.burrow.wav');
        this.sound.unburrow=new Audio('bgm/Zerg.unburrow.wav');
        this.direction=3;
    },
    prototypePlus: {
        //Add basic unit info
        name: "Defiler",
        imgPos: {
            moving: {
                left: [
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [144, 144, 144, 144, 144, 144, 144, 144],
                    [288, 288, 288, 288, 288, 288, 288, 288],
                    [432, 432, 432, 432, 432, 432, 432, 432],
                    [576, 576, 576, 576, 576, 576, 576, 576],
                    [792, 792, 792, 792, 792, 792, 792, 792],
                    [936, 936, 936, 936, 936, 936, 936, 936],
                    [1080, 1080, 1080, 1080, 1080, 1080, 1080, 1080]
                ],
                top: [
                    [0, 62, 124, 186, 248, 310, 372, 434],
                    [0, 62, 124, 186, 248, 310, 372, 434],
                    [0, 62, 124, 186, 248, 310, 372, 434],
                    [0, 62, 124, 186, 248, 310, 372, 434],
                    [0, 62, 124, 186, 248, 310, 372, 434],
                    [0, 62, 124, 186, 248, 310, 372, 434],
                    [0, 62, 124, 186, 248, 310, 372, 434],
                    [0, 62, 124, 186, 248, 310, 372, 434]
                ]
            },
            burrow: {
                left: [
                    [288, -1, 0, 72, 144, 216],
                    [288, -1, 0, 72, 144, 216],
                    [288, -1, 0, 72, 144, 216],
                    [288, -1, 0, 72, 144, 216],
                    [288, -1, 0, 72, 144, 216],
                    [288, -1, 0, 72, 144, 216],
                    [288, -1, 0, 72, 144, 216],
                    [288, -1, 0, 72, 144, 216]
                ],
                top: [
                    [496, -1, 496, 496, 496, 496],
                    [496, -1, 496, 496, 496, 496],
                    [496, -1, 496, 496, 496, 496],
                    [496, -1, 496, 496, 496, 496],
                    [496, -1, 496, 496, 496, 496],
                    [496, -1, 496, 496, 496, 496],
                    [496, -1, 496, 496, 496, 496],
                    [496, -1, 496, 496, 496, 496]
                ]
            },
            unburrow: {
                left: [
                    [216, 144, 72, 0, 0, 0],
                    [216, 144, 72, 0, 0, 0],
                    [216, 144, 72, 0, 0, 0],
                    [216, 144, 72, 0, 0, 0],
                    [216, 144, 72, 0, 0, 0],
                    [216, 144, 72, 0, 0, 0],
                    [216, 144, 72, 0, 0, 0],
                    [216, 144, 72, 0, 0, 0]
                ],
                top: [
                    [496, 496, 496, 496, 496, 496],
                    [496, 496, 496, 496, 496, 496],
                    [496, 496, 496, 496, 496, 496],
                    [496, 496, 496, 496, 496, 496],
                    [496, 496, 496, 496, 496, 496],
                    [496, 496, 496, 496, 496, 496],
                    [496, 496, 496, 496, 496, 496],
                    [496, 496, 496, 496, 496, 496]
                ]
            }
        },
        width: 72,//(N-1)
        height: 62,//(N-1)
        frame: {
            moving: 8,
            burrow: 1,
            unburrow: 6
        },
        //Only for moving status, override
        speed:Unit.getSpeedMatrixBy(10),
        HP: 80,
        armor:1,
        MP: 200,
        sight:350,
        portraitOffset: {x:660,y:0},
        dieEffect:Burst.DefilerDeath,
        isFlying:false,
        unitType:Unit.MIDDLE,
        recover:Building.ZergBuilding.prototype.recover,
        cost:{
            mine:50,
            gas:150,
            man:2,
            time:500
        },
        upgrade:['EvolveCarapace'],
        items:{
            '6':{name:'Consume',condition:function(){
                return Magic.Consume.enabled
            }},
            '7':{name:'DarkSwarm'},
            '8':{name:'Plague',condition:function(){
                return Magic.Plague.enabled
            }},
            '9':{name:'Burrow',condition:function(){
                return Magic.Burrow.enabled
            }}
        }
    }
});
Zerg.Larva=Unit.extends({
    constructorPlus:function(props){
        this.imgPos.dock=this.imgPos.moving;
        this.direction=2;
    },
    prototypePlus: {
        //Add basic unit info
        name: "Larva",
        imgPos: {
            moving: {
                left: [
                    [1, 1, 1, 1, 1],
                    [67, 67, 67, 67, 67],
                    [133, 133, 133, 133, 133],
                    [199, 199, 199, 199, 199],
                    [265, 265, 265, 265, 265],
                    [331, 331, 331, 331, 331],
                    [397, 397, 397, 397, 397],
                    [463, 463, 463, 463, 463]
                ],
                top: [
                    [1, 30, 59, 88, 117],
                    [1, 30, 59, 88, 117],
                    [1, 30, 59, 88, 117],
                    [1, 30, 59, 88, 117],
                    [1, 30, 59, 88, 117],
                    [1, 30, 59, 88, 117],
                    [1, 30, 59, 88, 117],
                    [1, 30, 59, 88, 117]
                ]
            }
        },
        width: 32,//33X+1
        height: 28,//29X+1
        frame: {
            moving: 5,
            dock: 1
        },
        //Only for moving status, override
        speed:Unit.getSpeedMatrixBy(4),
        HP: 25,
        armor:10,
        sight:70,
        portraitOffset: {x:900,y:0},
        dieEffect:Burst.LarvaDeath,
        unitType:Unit.SMALL,
        isFlying:false,
        recover:Building.ZergBuilding.prototype.recover,
        upgrade:['EvolveCarapace'],
        items:{
            '1':{name:'Drone'},
            '2':{name:'Zergling',condition:function(){
                return Building.ourBuildings.some(function(chara){
                    return chara.name=='SpawningPool';
                })
            }},
            '3':{name:'Overlord'},
            '4':{name:'Hydralisk',condition:function(){
                return Building.ourBuildings.some(function(chara){
                    return chara.name=='HydraliskDen';
                })
            }},
            '5':{name:'Mutalisk',condition:function(){
                return Building.ourBuildings.some(function(chara){
                    return chara.name=='Spire' || chara.name=='GreaterSpire';
                })
            }},
            '6':{name:'Scourge',condition:function(){
                return Building.ourBuildings.some(function(chara){
                    return chara.name=='Spire' || chara.name=='GreaterSpire';
                })
            }},
            '7':{name:'Queen',condition:function(){
                return Building.ourBuildings.some(function(chara){
                    return chara.name=='QueenNest';
                })
            }},
            '8':{name:'Ultralisk',condition:function(){
                return Building.ourBuildings.some(function(chara){
                    return chara.name=='UltraliskCavern';
                })
            }},
            '9':{name:'Defiler',condition:function(){
                return Building.ourBuildings.some(function(chara){
                    return chara.name=='DefilerMound';
                })
            }}
        },
        //Prevent user control moving
        moveTo:function(){},
        moveToward:function(){},
        //Override
        dock:function(){
            Unit.walkAroundLarva.call(this);
        }
    }
});
