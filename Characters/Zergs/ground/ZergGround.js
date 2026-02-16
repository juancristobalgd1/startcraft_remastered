Zerg.Zergling=AttackableUnit.extends({
    constructorPlus:function(props){
        this.sound.burrow=new Audio('bgm/Zerg.burrow.wav');
        this.sound.unburrow=new Audio('bgm/Zerg.unburrow.wav');
    },
    prototypePlus: {
        //Add basic unit info
        name: "Zergling",
        imgPos: {
            moving: {
                left: [
                    [0, 0, 0, 0, 0, 0, 0],
                    [86, 86, 86, 86, 86, 86, 86],
                    [172, 172, 172, 172, 172, 172, 172],
                    [258, 258, 258, 258, 258, 258, 258],
                    [344, 344, 344, 344, 344, 344, 344],
                    [473, 473, 473, 473, 473, 473, 473],
                    [559, 559, 559, 559, 559, 559, 559],
                    [645, 645, 645, 645, 645, 645, 645]
                ],
                top: [
                    [0, 42, 84, 126, 168, 210, 252],
                    [0, 42, 84, 126, 168, 210, 252],
                    [0, 42, 84, 126, 168, 210, 252],
                    [0, 42, 84, 126, 168, 210, 252],
                    [0, 42, 84, 126, 168, 210, 252],
                    [0, 42, 84, 126, 168, 210, 252],
                    [0, 42, 84, 126, 168, 210, 252],
                    [0, 42, 84, 126, 168, 210, 252]
                ]
            },
            dock: {
                left: [0, 86, 172, 258, 344, 473, 559, 645],
                top: [0, 0, 0, 0, 0, 0, 0, 0]
            },
            attack: {
                left: [
                    [0, 0, 0, 0, 0],
                    [86, 86, 86, 86, 86],
                    [172, 172, 172, 172, 172],
                    [258, 258, 258, 258, 258],
                    [344, 344, 344, 344, 344],
                    [473, 473, 473, 473, 473],
                    [559, 559, 559, 559, 559],
                    [645, 645, 645, 645, 645]
                ],
                top: [
                    [294, 336, 378, 420, 462],
                    [294, 336, 378, 420, 462],
                    [294, 336, 378, 420, 462],
                    [294, 336, 378, 420, 462],
                    [294, 336, 378, 420, 462],
                    [294, 336, 378, 420, 462],
                    [294, 336, 378, 420, 462],
                    [294, 336, 378, 420, 462]
                ]
            },
            burrow: {
                left: [
                    [678, -1, 504, 546, 592, 636],
                    [678, -1, 504, 546, 592, 636],
                    [678, -1, 504, 546, 592, 636],
                    [678, -1, 504, 546, 592, 636],
                    [678, -1, 504, 546, 592, 636],
                    [678, -1, 504, 546, 592, 636],
                    [678, -1, 504, 546, 592, 636],
                    [678, -1, 504, 546, 592, 636]
                ],
                top: [
                    [512, -1, 512, 512, 512, 512],
                    [512, -1, 512, 512, 512, 512],
                    [512, -1, 512, 512, 512, 512],
                    [512, -1, 512, 512, 512, 512],
                    [512, -1, 512, 512, 512, 512],
                    [512, -1, 512, 512, 512, 512],
                    [512, -1, 512, 512, 512, 512],
                    [512, -1, 512, 512, 512, 512]
                ]
            },
            unburrow: {
                left: [
                    [636, 592, 546, 504, 504, 504],
                    [636, 592, 546, 504, 504, 504],
                    [636, 592, 546, 504, 504, 504],
                    [636, 592, 546, 504, 504, 504],
                    [636, 592, 546, 504, 504, 504],
                    [636, 592, 546, 504, 504, 504],
                    [636, 592, 546, 504, 504, 504],
                    [636, 592, 546, 504, 504, 504]
                ],
                top: [
                    [512, 512, 512, 512, 512, 512],
                    [512, 512, 512, 512, 512, 512],
                    [512, 512, 512, 512, 512, 512],
                    [512, 512, 512, 512, 512, 512],
                    [512, 512, 512, 512, 512, 512],
                    [512, 512, 512, 512, 512, 512],
                    [512, 512, 512, 512, 512, 512],
                    [512, 512, 512, 512, 512, 512]
                ]
            }
        },
        width: 43,//43N-43
        height: 42,//42N-42
        frame: {
            moving: 7,
            dock: 1,
            attack: 5,
            burrow: 1,
            unburrow: 6
        },
        //Only for moving status, override
        speed:Unit.getSpeedMatrixBy(13),
        HP: 35,
        damage: 5,
        armor:0,
        sight:175,
        meleeAttack: true,
        attackInterval: 800,
        portraitOffset: {x:60,y:0},
        dieEffect:Burst.ZerglingDeath,
        isFlying:false,
        attackLimit:"ground",
        unitType:Unit.SMALL,
        attackType:AttackableUnit.NORMAL_ATTACK,
        recover:Building.ZergBuilding.prototype.recover,
        cost:{
            mine:25,
            man:0.5,
            time:140
        },
        birthCount:2,
        upgrade:['UpgradeMeleeAttacks','EvolveCarapace'],
        items:{
            '9':{name:'Burrow',condition:function(){
                return Magic.Burrow.enabled
            }}
        }
    }
});
Zerg.Hydralisk=AttackableUnit.extends({
    constructorPlus:function(props){
        this.sound.burrow=new Audio('bgm/Zerg.burrow.wav');
        this.sound.unburrow=new Audio('bgm/Zerg.unburrow.wav');
        this.direction=3;
    },
    prototypePlus: {
        //Add basic unit info
        name: "Hydralisk",
        imgPos: {
            moving: {
                left: [
                    [0, 0, 0, 0, 0, 0, 0],
                    [90, 90, 90, 90, 90, 90, 90],
                    [180, 180, 180, 180, 180, 180, 180],
                    [270, 270, 270, 270, 270, 270, 270],
                    [360, 360, 360, 360, 360, 360, 360],
                    [495, 495, 495, 495, 495, 495, 495],
                    [585, 585, 585, 585, 585, 585, 585],
                    [675, 675, 675, 675, 675, 675, 675]
                ],
                top: [
                    [0, 58, 116, 174, 232, 290, 348],
                    [0, 58, 116, 174, 232, 290, 348],
                    [0, 58, 116, 174, 232, 290, 348],
                    [0, 58, 116, 174, 232, 290, 348],
                    [0, 58, 116, 174, 232, 290, 348],
                    [0, 58, 116, 174, 232, 290, 348],
                    [0, 58, 116, 174, 232, 290, 348],
                    [0, 58, 116, 174, 232, 290, 348]
                ]
            },
            dock: {
                left: [0, 90, 180, 270, 360, 495, 585, 675],
                top: [0, 0, 0, 0, 0, 0, 0, 0]
            },
            attack: {
                left: [
                    [0, 0, 0, 0, 0],
                    [90, 90, 90, 90, 90],
                    [180, 180, 180, 180, 180],
                    [270, 270, 270, 270, 270],
                    [360, 360, 360, 360, 360],
                    [495, 495, 495, 495, 495],
                    [585, 585, 585, 585, 585],
                    [675, 675, 675, 675, 675]
                ],
                top: [
                    [406, 464, 522, 580, 638],
                    [406, 464, 522, 580, 638],
                    [406, 464, 522, 580, 638],
                    [406, 464, 522, 580, 638],
                    [406, 464, 522, 580, 638],
                    [406, 464, 522, 580, 638],
                    [406, 464, 522, 580, 638],
                    [406, 464, 522, 580, 638]
                ]
            },
            burrow: {
                left: [
                    [464, -1, 280, 326, 374, 418],
                    [464, -1, 280, 326, 374, 418],
                    [464, -1, 280, 326, 374, 418],
                    [464, -1, 280, 326, 374, 418],
                    [464, -1, 280, 326, 374, 418],
                    [464, -1, 280, 326, 374, 418],
                    [464, -1, 280, 326, 374, 418],
                    [464, -1, 280, 326, 374, 418]
                ],
                top: [
                    [758, -1, 758, 758, 758, 758],
                    [758, -1, 758, 758, 758, 758],
                    [758, -1, 758, 758, 758, 758],
                    [758, -1, 758, 758, 758, 758],
                    [758, -1, 758, 758, 758, 758],
                    [758, -1, 758, 758, 758, 758],
                    [758, -1, 758, 758, 758, 758],
                    [758, -1, 758, 758, 758, 758]
                ]
            },
            unburrow: {
                left: [
                    [418, 374, 326, 280, 280, 280],
                    [418, 374, 326, 280, 280, 280],
                    [418, 374, 326, 280, 280, 280],
                    [418, 374, 326, 280, 280, 280],
                    [418, 374, 326, 280, 280, 280],
                    [418, 374, 326, 280, 280, 280],
                    [418, 374, 326, 280, 280, 280],
                    [418, 374, 326, 280, 280, 280]
                ],
                top: [
                    [758, 758, 758, 758, 758, 758],
                    [758, 758, 758, 758, 758, 758],
                    [758, 758, 758, 758, 758, 758],
                    [758, 758, 758, 758, 758, 758],
                    [758, 758, 758, 758, 758, 758],
                    [758, 758, 758, 758, 758, 758],
                    [758, 758, 758, 758, 758, 758],
                    [758, 758, 758, 758, 758, 758]
                ]
            }
        },
        width: 45,//45(N-1)
        height: 58,//58(N-1)
        frame: {
            moving: 7,
            dock: 1,
            attack: 5,
            burrow: 1,
            unburrow: 6
        },
        //Only for moving status, override
        speed:Unit.getSpeedMatrixBy(9),
        HP: 80,
        damage: 10,
        armor:0,
        sight:210,
        attackRange: 140,
        attackInterval: 1500,
        portraitOffset: {x:180,y:0},
        dieEffect:Burst.HydraliskDeath,
        isFlying:false,
        unitType:Unit.MIDDLE,
        attackType:AttackableUnit.BURST_ATTACK,
        recover:Building.ZergBuilding.prototype.recover,
        cost:{
            mine:75,
            gas:25,
            man:1,
            time:280
        },
        upgrade:['UpgradeMissileAttacks','EvolveCarapace'],
        items:{
            '7':{name:'Lurker',condition:function(){
                return Magic.Lurker.enabled
            }},
            '9':{name:'Burrow',condition:function(){
                return Magic.Burrow.enabled
            }}
        },
        //Override
        dock:function(){
            //Use the same behavior
            AttackableUnit.turnAround.call(this);
        }
    }
});
Zerg.Lurker=Unit.extends({
    constructorPlus:function(props){
        //Same as attackable unit
        this.attackTimer=0;
        this.bullet={};
        this.kill=0;
        this.target={};
        //Idle by default
        this.targetLock=false;
        //Can fire by default
        this.coolDown=true;
        //Add attack sound for AttackableUnit
        this.sound.attack=new Audio('bgm/Lurker.attack.wav');
        this.sound.burrow=new Audio('bgm/Lurker.burrow.wav');
        this.sound.unburrow=new Audio('bgm/Zerg.unburrow.wav');
        this.direction=3;
    },
    prototypePlus: {
        //Add basic unit info
        name: "Lurker",
        imgPos: {
            moving: {
                left: [
                    [0, 0, 0, 0, 0, 0, 0],
                    [144, 144, 144, 144, 144, 144, 144],
                    [288, 288, 288, 288, 288, 288, 288],
                    [432, 432, 432, 432, 432, 432, 432],
                    [576, 576, 576, 576, 576, 576, 576],
                    [792, 792, 792, 792, 792, 792, 792],
                    [936, 936, 936, 936, 936, 936, 936],
                    [1080, 1080, 1080, 1080, 1080, 1080, 1080]
                ],
                top: [
                    [1, 68, 135, 202, 269, 336, 403],
                    [1, 68, 135, 202, 269, 336, 403],
                    [1, 68, 135, 202, 269, 336, 403],
                    [1, 68, 135, 202, 269, 336, 403],
                    [1, 68, 135, 202, 269, 336, 403],
                    [1, 68, 135, 202, 269, 336, 403],
                    [1, 68, 135, 202, 269, 336, 403],
                    [1, 68, 135, 202, 269, 336, 403]
                ]
            },
            dock: {
                left: [0,144,288,432,576,792,936,1080],
                top: [1,1,1,1,1,1,1,1]
            },
            burrow: {
                left: [
                    [502, -1, 2, 66, 130, 192, 256, 2, 66, 130, 192, 256, 318, 380 ,444],
                    [502, -1, 2, 66, 130, 192, 256, 2, 66, 130, 192, 256, 318, 380 ,444],
                    [502, -1, 2, 66, 130, 192, 256, 2, 66, 130, 192, 256, 318, 380 ,444],
                    [502, -1, 2, 66, 130, 192, 256, 2, 66, 130, 192, 256, 318, 380 ,444],
                    [502, -1, 2, 66, 130, 192, 256, 2, 66, 130, 192, 256, 318, 380 ,444],
                    [502, -1, 2, 66, 130, 192, 256, 2, 66, 130, 192, 256, 318, 380 ,444],
                    [502, -1, 2, 66, 130, 192, 256, 2, 66, 130, 192, 256, 318, 380 ,444],
                    [502, -1, 2, 66, 130, 192, 256, 2, 66, 130, 192, 256, 318, 380 ,444]
                ],
                top: [
                    [482, -1, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482],
                    [482, -1, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482],
                    [482, -1, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482],
                    [482, -1, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482],
                    [482, -1, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482],
                    [482, -1, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482],
                    [482, -1, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482],
                    [482, -1, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482, 482]
                ]
            },
            unburrow: {
                left: [
                    [450, 510, 570, 632, 700, 764, 764, 764],
                    [450, 510, 570, 632, 700, 764, 764, 764],
                    [450, 510, 570, 632, 700, 764, 764, 764],
                    [450, 510, 570, 632, 700, 764, 764, 764],
                    [450, 510, 570, 632, 700, 764, 764, 764],
                    [450, 510, 570, 632, 700, 764, 764, 764],
                    [450, 510, 570, 632, 700, 764, 764, 764],
                    [450, 510, 570, 632, 700, 764, 764, 764]
                ],
                top: [
                    [570, 570, 570, 570, 570, 570, 570, 570],
                    [570, 570, 570, 570, 570, 570, 570, 570],
                    [570, 570, 570, 570, 570, 570, 570, 570],
                    [570, 570, 570, 570, 570, 570, 570, 570],
                    [570, 570, 570, 570, 570, 570, 570, 570],
                    [570, 570, 570, 570, 570, 570, 570, 570],
                    [570, 570, 570, 570, 570, 570, 570, 570],
                    [570, 570, 570, 570, 570, 570, 570, 570]
                ]
            }
        },
        width: 72,//72N-72
        height: 67,//67N-66
        frame: {
            moving: 7,
            dock: 1,
            burrow: 1,
            unburrow: 8
        },
        //Only for moving status, override
        speed:Unit.getSpeedMatrixBy(14),
        HP: 125,
        damage: 20,
        armor:0,
        sight:280,
        attackRange: 210,
        attackInterval: 3700,
        continuousAttack:{
            count:3,
            layout:function(bullet,num){
                //Reassign location
                bullet.x+=bullet.speed.x*(num);
                bullet.y+=bullet.speed.y*(num);
                //Reassign each action
                bullet.action=(bullet.action+num)%(bullet.frame.moving);
            },
            onlyOnce:true
        },
        portraitOffset: {x:240,y:0},
        dieEffect:Burst.LurkerDeath,
        isFlying:false,
        attackLimit:"ground",
        unitType:Unit.MIDDLE,
        attackType:AttackableUnit.NORMAL_ATTACK,
        recover:Building.ZergBuilding.prototype.recover,
        AOE:{
            type:"LINE",
            hasEffect:false,
            radius:35
        },
        cost:{
            mine:50,
            gas:100,
            man:2,
            time:400
        },
        upgrade:['UpgradeMissileAttacks','EvolveCarapace'],
        items:{
            '9':{name:'Burrow'}
        },
        //Override
        dock:function(){
            //Use the same behavior
            AttackableUnit.turnAround.call(this);
        }
    }
});
Zerg.Broodling=AttackableUnit.extends({
    constructorPlus:function(props){
        //Nothing
    },
    prototypePlus: {
        //Add basic unit info
        name: "Broodling",
        imgPos: {
            moving: {
                left: [
                    [5, 5, 5, 5, 5, 5, 5],
                    [101, 101, 101, 101, 101, 101, 101],
                    [197, 197, 197, 197, 197, 197, 197],
                    [293, 293, 293, 293, 293, 293, 293],
                    [389, 389, 389, 389, 389, 389, 389],
                    [533, 533, 533, 533, 533, 533, 533],
                    [629, 629, 629, 629, 629, 629, 629],
                    [725, 725, 725, 725, 725, 725, 725]
                ],
                top: [
                    [5, 53, 101, 149, 197, 245, 293],
                    [5, 53, 101, 149, 197, 245, 293],
                    [5, 53, 101, 149, 197, 245, 293],
                    [5, 53, 101, 149, 197, 245, 293],
                    [5, 53, 101, 149, 197, 245, 293],
                    [5, 53, 101, 149, 197, 245, 293],
                    [5, 53, 101, 149, 197, 245, 293],
                    [5, 53, 101, 149, 197, 245, 293]
                ]
            },
            dock: {
                left: [5, 101, 197, 293, 389, 533, 629, 725],
                top: [5, 5, 5, 5, 5, 5, 5, 5]
            },
            attack: {
                left: [
                    [5, 5, 5, 5, 5],
                    [101, 101, 101, 101, 101],
                    [197, 197, 197, 197, 197],
                    [293, 293, 293, 293, 293],
                    [389, 389, 389, 389, 389],
                    [533, 533, 533, 533, 533],
                    [629, 629, 629, 629, 629],
                    [725, 725, 725, 725, 725]
                ],
                top: [
                    [341, 389, 437, 485, 533],
                    [341, 389, 437, 485, 533],
                    [341, 389, 437, 485, 533],
                    [341, 389, 437, 485, 533],
                    [341, 389, 437, 485, 533],
                    [341, 389, 437, 485, 533],
                    [341, 389, 437, 485, 533],
                    [341, 389, 437, 485, 533]
                ]
            }
        },
        width: 38,//48N-43
        height: 38,
        frame: {
            moving: 7,
            dock: 1,
            attack: 5
        },
        //Only for moving status, override
        speed:Unit.getSpeedMatrixBy(6),
        HP: 30,
        damage: 4,
        armor:0,
        sight:175,
        meleeAttack: true,
        attackInterval: 1500,
        portraitOffset: {x:720,y:0},
        dieEffect:Burst.BroodlingDeath,
        isFlying:false,
        attackLimit:"ground",
        unitType:Unit.SMALL,
        recover:Building.ZergBuilding.prototype.recover,
        upgrade:['UpgradeMeleeAttacks','EvolveCarapace'],
        attackType:AttackableUnit.NORMAL_ATTACK,
        //Override
        dock:function(){
            //Use the same behavior
            AttackableUnit.walkAround.call(this);
        }
    }
});
Zerg.Ultralisk=AttackableUnit.extends({
    constructorPlus:function(props){
        this.direction=3;
    },
    prototypePlus: {
        //Add basic unit info
        name: "Ultralisk",
        imgPos: {
            moving: {
                left: [
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [202, 202, 202, 202, 202, 202, 202, 202, 202],
                    [404, 404, 404, 404, 404, 404, 404, 404, 404],
                    [707, 707, 707, 707, 707, 707, 707, 707, 707],
                    [909, 909, 909, 909, 909, 909, 909, 909, 909],
                    [1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212],
                    [1414, 1414, 1414, 1414, 1414, 1414, 1414, 1414, 1414],
                    [1717, 1717, 1717, 1717, 1717, 1717, 1717, 1717, 1717]
                ],
                top: [
                    [0, 108, 216, 324, 432, 540, 648, 756, 864],
                    [0, 108, 216, 324, 432, 540, 648, 756, 864],
                    [0, 108, 216, 324, 432, 540, 648, 756, 864],
                    [0, 108, 216, 324, 432, 540, 648, 756, 864],
                    [0, 108, 216, 324, 432, 540, 648, 756, 864],
                    [0, 108, 216, 324, 432, 540, 648, 756, 864],
                    [0, 108, 216, 324, 432, 540, 648, 756, 864],
                    [0, 108, 216, 324, 432, 540, 648, 756, 864]
                ]
            },
            dock: {
                left: [0, 202, 404, 707, 909, 1212, 1414, 1717],
                top: [0, 0, 0, 0, 0, 0, 0, 0]
            },
            attack: {
                left: [
                    [0, 0, 0, 0, 0, 0],
                    [202, 202, 202, 202, 202, 202],
                    [404, 404, 404, 404, 404, 404],
                    [707, 707, 707, 707, 707, 707],
                    [909, 909, 909, 909, 909, 909],
                    [1212, 1212, 1212, 1212, 1212, 1212],
                    [1414, 1414, 1414, 1414, 1414, 1414],
                    [1717, 1717, 1717, 1717, 1717, 1717]
                ],
                top: [
                    [972, 1080, 1188, 1296, 1404, 1512],
                    [972, 1080, 1188, 1296, 1404, 1512],
                    [972, 1080, 1188, 1296, 1404, 1512],
                    [972, 1080, 1188, 1296, 1404, 1512],
                    [972, 1080, 1188, 1296, 1404, 1512],
                    [972, 1080, 1188, 1296, 1404, 1512],
                    [972, 1080, 1188, 1296, 1404, 1512],
                    [972, 1080, 1188, 1296, 1404, 1512]
                ]
            }
        },
        width: 101,//(N-1)
        height: 108,//(N-1)
        frame: {
            moving: 9,
            dock: 1,
            attack: 6
        },
        //Only for moving status, override
        speed:Unit.getSpeedMatrixBy(12),
        HP: 400,
        damage: 20,
        armor:1,
        sight:245,
        meleeAttack: true,
        attackInterval: 1500,
        portraitOffset: {x:600,y:0},
        dieEffect:Burst.UltraliskDeath,
        isFlying:false,
        attackLimit:"ground",
        unitType:Unit.BIG,
        attackType:AttackableUnit.NORMAL_ATTACK,
        recover:Building.ZergBuilding.prototype.recover,
        cost:{
            mine:200,
            gas:200,
            man:6,
            time:600
        },
        upgrade:['UpgradeMeleeAttacks','EvolveCarapace']
    }
});
Zerg.InfestedTerran=AttackableUnit.extends({
    constructorPlus:function(props){
        this.sound.burrow=new Audio('bgm/Zerg.burrow.wav');
        this.sound.unburrow=new Audio('bgm/Zerg.unburrow.wav');
    },
    prototypePlus: {
        //Add basic unit info
        name: "InfestedTerran",
        imgPos: {
            moving: {
                left: [
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [82, 82, 82, 82, 82, 82, 82, 82],
                    [164, 164, 164, 164, 164, 164, 164, 164],
                    [246, 246, 246, 246, 246, 246, 246, 246],
                    [328, 328, 328, 328, 328, 328, 328, 328],
                    [451, 451, 451, 451, 451, 451, 451, 451],
                    [533, 533, 533, 533, 533, 533, 533, 533],
                    [615, 615, 615, 615, 615, 615, 615, 615]
                ],
                top: [
                    [0, 54, 108, 162, 216, 270, 324, 378],
                    [0, 54, 108, 162, 216, 270, 324, 378],
                    [0, 54, 108, 162, 216, 270, 324, 378],
                    [0, 54, 108, 162, 216, 270, 324, 378],
                    [0, 54, 108, 162, 216, 270, 324, 378],
                    [0, 54, 108, 162, 216, 270, 324, 378],
                    [0, 54, 108, 162, 216, 270, 324, 378],
                    [0, 54, 108, 162, 216, 270, 324, 378]
                ]
            },
            dock: {
                left: [0, 82, 164, 246, 328, 451, 533, 615],
                top: [0, 0, 0, 0, 0, 0, 0, 0]
            },
            burrow: {
                left: [
                    [616, -1, 410, 452, 494, 535, 576],
                    [616, -1, 410, 452, 494, 535, 576],
                    [616, -1, 410, 452, 494, 535, 576],
                    [616, -1, 410, 452, 494, 535, 576],
                    [616, -1, 410, 452, 494, 535, 576],
                    [616, -1, 410, 452, 494, 535, 576],
                    [616, -1, 410, 452, 494, 535, 576],
                    [616, -1, 410, 452, 494, 535, 576]
                ],
                top: [
                    [436, -1, 436, 436, 436, 436, 436],
                    [436, -1, 436, 436, 436, 436, 436],
                    [436, -1, 436, 436, 436, 436, 436],
                    [436, -1, 436, 436, 436, 436, 436],
                    [436, -1, 436, 436, 436, 436, 436],
                    [436, -1, 436, 436, 436, 436, 436],
                    [436, -1, 436, 436, 436, 436, 436],
                    [436, -1, 436, 436, 436, 436, 436]
                ]
            },
            unburrow: {
                left: [
                    [576, 535, 494, 452, 410, 410, 410],
                    [576, 535, 494, 452, 410, 410, 410],
                    [576, 535, 494, 452, 410, 410, 410],
                    [576, 535, 494, 452, 410, 410, 410],
                    [576, 535, 494, 452, 410, 410, 410],
                    [576, 535, 494, 452, 410, 410, 410],
                    [576, 535, 494, 452, 410, 410, 410],
                    [576, 535, 494, 452, 410, 410, 410]
                ],
                top: [
                    [436, 436, 436, 436, 436, 436, 436],
                    [436, 436, 436, 436, 436, 436, 436],
                    [436, 436, 436, 436, 436, 436, 436],
                    [436, 436, 436, 436, 436, 436, 436],
                    [436, 436, 436, 436, 436, 436, 436],
                    [436, 436, 436, 436, 436, 436, 436],
                    [436, 436, 436, 436, 436, 436, 436],
                    [436, 436, 436, 436, 436, 436, 436]
                ]
            }
        },
        width: 41,//41(N-1)
        height: 44,//54(N-1)
        frame: {
            moving: 8,
            dock: 1,
            burrow: 1,
            unburrow: 7
        },
        //Only for moving status, override
        speed:Unit.getSpeedMatrixBy(10),
        HP: 60,
        damage: 500,//Suicide
        armor:0,
        sight:175,
        meleeAttack: true,
        attackRange:35,
        attackInterval: 1000,//Suicide
        portraitOffset: {x:780,y:0},
        dieEffect:Burst.HumanDeath,
        attackEffect:Burst.InfestedBomb,
        isFlying:false,
        attackLimit:"ground",
        suicide:true,
        unitType:Unit.SMALL,
        attackType:AttackableUnit.NORMAL_ATTACK,
        recover:Building.ZergBuilding.prototype.recover,
        AOE:{
            hasEffect:false,
            radius:80
        },
        cost:{
            mine:100,
            gas:50,
            man:1,
            time:400
        },
        upgrade:['EvolveCarapace'],
        items:{
            '9':{name:'Burrow',condition:function(){
                return Magic.Burrow.enabled
            }}
        },
        //Override
        dock:function(){
            //Use the same behavior
            AttackableUnit.turnAround.call(this);
        }
    }
});
