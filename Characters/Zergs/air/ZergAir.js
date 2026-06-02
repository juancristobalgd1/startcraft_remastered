import Zerg from '../core/ZergBase.js';
import AttackableUnit from '../../Units/core/AttackableUnitBase.js';
import Unit from '../../Units/core/UnitBase.js';
import { ZergBuilding } from '../../Buildings/core/BuildingRaces.js';
import { recover } from '../core/ZergHelper.js';
import { SmallZergFlyingDeath, BigZergFlyingDeath } from '../../Bursts/zerg/ZergDeaths.js';
import { ScourgeBomb } from '../../Bursts/neutral/NeutralBursts.js';

export const Mutalisk=AttackableUnit.extends({
    constructorPlus:function(props){
        //Same action mapping
        this.imgPos.dock=this.imgPos.moving;
        this.frame.dock=this.frame.moving;
        this.direction=3;
        //Adjust for multi frames
        this.y-=12;
    },
    prototypePlus: {
        //Add basic unit info
        name: "Mutalisk",
        imgPos: {
            moving: {
                left: [
                    [0, 0, 0, 0, 0],
                    [134, 134, 134, 134, 134],
                    [268, 268, 268, 268, 268],
                    [401, 401, 401, 401, 401],
                    [535, 535, 535, 535, 535],
                    [669, 669, 669, 669, 669],
                    [802, 802, 802, 802, 802],
                    [936, 936, 936, 936, 936]
                ],
                top: [
                    [0, 75, 150, 225, 300],
                    [0, 75, 150, 225, 300],
                    [0, 75, 150, 225, 300],
                    [0, 75, 150, 225, 300],
                    [0, 75, 150, 225, 300],
                    [0, 75, 150, 225, 300],
                    [0, 75, 150, 225, 300],
                    [0, 75, 150, 225, 300]
                ]
            }
        },
        width: 66,
        height: 75,
        frame: {
            moving: 5
        },
        //Only for moving status, override
        speed:Unit.getSpeedMatrixBy(16),
        HP: 120,
        damage: 9,
        armor:0,
        sight:245,
        attackRange: 105,
        attackInterval: 2200,//3000
        portraitOffset: {x:300,y:0},
        dieEffect:SmallZergFlyingDeath,
        isFlying:true,
        unitType:Unit.SMALL,
        attackType:AttackableUnit.NORMAL_ATTACK,
        recover:recover,
        cost:{
            mine:100,
            gas:100,
            man:2,
            time:400
        },
        upgrade:['UpgradeFlyerAttacks','UpgradeFlyerCarapace'],
        items:{
            '7':{name:'Guardian',condition:function(){
                return ZergBuilding.ourBuildings.some(function(chara){
                    return chara.name=='GreaterSpire';
                })
            }},
            '8':{name:'Devourer',condition:function(){
                return ZergBuilding.ourBuildings.some(function(chara){
                    return chara.name=='GreaterSpire';
                })
            }}
        }
    }
});
export const Guardian=AttackableUnit.extends({
    constructorPlus:function(props){
        //Same action mapping
        this.imgPos.dock=this.imgPos.moving;
        this.frame.dock=this.frame.moving;
        this.direction=3;
    },
    prototypePlus: {
        //Add basic unit info
        name: "Guardian",
        imgPos: {
            moving: {
                left: [
                    [0, 0, 0, 0, 0, 0, 0],
                    [162, 162, 162, 162, 162, 162, 162],
                    [324, 324, 324, 324, 324, 324, 324],
                    [486, 486, 486, 486, 486, 486, 486],
                    [648, 648, 648, 648, 648, 648, 648],
                    [891, 891, 891, 891, 891, 891, 891],
                    [1053, 1053, 1053, 1053, 1053, 1053, 1053],
                    [1215, 1215, 1215, 1215, 1215, 1215, 1215]
                ],
                top: [
                    [0, 74, 148, 222, 296, 370, 444],
                    [0, 74, 148, 222, 296, 370, 444],
                    [0, 74, 148, 222, 296, 370, 444],
                    [0, 74, 148, 222, 296, 370, 444],
                    [0, 74, 148, 222, 296, 370, 444],
                    [0, 74, 148, 222, 296, 370, 444],
                    [0, 74, 148, 222, 296, 370, 444],
                    [0, 74, 148, 222, 296, 370, 444]
                ]
            }
        },
        width: 81,//(N-1)
        height: 74,//(N-1)
        frame: {
            moving: 7
        },
        //Only for moving status, override
        speed:Unit.getSpeedMatrixBy(6),
        HP: 150,
        damage: 20,
        armor:2,
        sight:385,
        attackRange: 280,
        attackInterval: 3000,
        portraitOffset: {x:360,y:0},
        dieEffect:BigZergFlyingDeath,
        isFlying:true,
        attackLimit:"ground",
        unitType:Unit.BIG,
        attackType:AttackableUnit.NORMAL_ATTACK,
        recover:recover,
        cost:{
            mine:50,
            gas:100,
            man:2,
            time:400
        },
        upgrade:['UpgradeFlyerAttacks','UpgradeFlyerCarapace'],
        //Override
        dock:function(){
            //Use the same behavior
            AttackableUnit.hover.call(this);
        }
    }
});
export const Devourer=AttackableUnit.extends({
    constructorPlus:function(props){
        //Same action mapping
        this.imgPos.dock=this.imgPos.moving;
        this.frame.dock=this.frame.moving;
        this.direction=3;
    },
    prototypePlus: {
        //Add basic unit info
        name: "Devourer",
        imgPos: {
            moving: {
                left: [
                    [0,0,0,0,0,0],
                    [146,146,146,146,146,146],
                    [292,292,292,292,292,292],
                    [438,438,438,438,438,438],
                    [584,584,584,584,584,584],
                    [803,803,803,803,803,803],
                    [949,949,949,949,949,949],
                    [1095,1095,1095,1095,1095,1095]
                ],
                top: [
                    [0,86,172,258,344,430],
                    [0,86,172,258,344,430],
                    [0,86,172,258,344,430],
                    [0,86,172,258,344,430],
                    [0,86,172,258,344,430],
                    [0,86,172,258,344,430],
                    [0,86,172,258,344,430],
                    [0,86,172,258,344,430]
                ]
            },
            attack: {
                left: [
                    [0,0,0,0,0,0,0,0],
                    [146,146,146,146,146,146,146,146],
                    [292,292,292,292,292,292,292,292],
                    [438,438,438,438,438,438,438,438],
                    [584,584,584,584,584,584,584,584],
                    [803,803,803,803,803,803,803,803],
                    [949,949,949,949,949,949,949,949],
                    [1095,1095,1095,1095,1095,1095,1095,1095]
                ],
                top: [
                    [516, 516, 602, 602, 688, 688, 774, 774],
                    [516, 516, 602, 602, 688, 688, 774, 774],
                    [516, 516, 602, 602, 688, 688, 774, 774],
                    [516, 516, 602, 602, 688, 688, 774, 774],
                    [516, 516, 602, 602, 688, 688, 774, 774],
                    [516, 516, 602, 602, 688, 688, 774, 774],
                    [516, 516, 602, 602, 688, 688, 774, 774],
                    [516, 516, 602, 602, 688, 688, 774, 774]
                ]
            }
        },
        width: 73,//(N-1)
        height: 86,//(N-1)
        frame: {
            moving: 6,
            attack: 8
        },
        //Only for moving status, override
        speed:Unit.getSpeedMatrixBy(12),
        HP: 250,
        damage: 25,
        armor:2,
        sight:350,
        attackRange: 175,//210
        attackInterval: 5000,//10000
        portraitOffset: {x:420,y:0},
        dieEffect:BigZergFlyingDeath,
        isFlying:true,
        attackLimit:"flying",
        unitType:Unit.BIG,
        attackType:AttackableUnit.BURST_ATTACK,
        recover:recover,
        AOE:{
            hasEffect:true,
            radius:60
        },
        cost:{
            mine:150,
            gas:50,
            man:2,
            time:400
        },
        upgrade:['UpgradeFlyerAttacks','UpgradeFlyerCarapace'],
        //Override
        dock:function(){
            //Use the same behavior
            AttackableUnit.hover.call(this);
        }
    }
});
export const Scourge=AttackableUnit.extends({
    constructorPlus:function(props){
        //Same action mapping
        this.imgPos.attack=this.imgPos.dock=this.imgPos.moving;
        this.frame.attack=this.frame.dock=this.frame.moving;
        this.direction=0;
        //Adjust for multi frames
        this.y-=20;
    },
    prototypePlus: {
        //Add basic unit info
        name: "Scourge",
        imgPos: {
            moving: {
                left: [
                    [0, 0, 0, 0, 0],
                    [68, 68, 68, 68, 68],
                    [136, 136, 136, 136, 136],
                    [204, 204, 204, 204, 204],
                    [272, 272, 272, 272, 272],
                    [374, 374, 374, 374, 374],
                    [442, 442, 442, 442, 442],
                    [510, 510, 510, 510, 510]
                ],
                top: [
                    [0, 30, 60, 90, 120],
                    [0, 30, 60, 90, 120],
                    [0, 30, 60, 90, 120],
                    [0, 30, 60, 90, 120],
                    [0, 30, 60, 90, 120],
                    [0, 30, 60, 90, 120],
                    [0, 30, 60, 90, 120],
                    [0, 30, 60, 90, 120]
                ]
            }
        },
        width: 34,//34(N-1)
        height: 30,//30(N-1)
        frame: {
            moving: 5
        },
        //Only for moving status, override
        speed:Unit.getSpeedMatrixBy(16),
        HP: 25,
        damage: 110,//Suicide
        armor:0,
        sight:175,
        meleeAttack: true,
        attackRange:35,
        attackInterval: 1000,//Suicide
        portraitOffset: {x:480,y:0},
        dieEffect:SmallZergFlyingDeath,
        attackEffect:ScourgeBomb,
        isFlying:true,
        attackLimit:"flying",
        suicide:true,
        unitType:Unit.SMALL,
        attackType:AttackableUnit.NORMAL_ATTACK,
        recover:recover,
        cost:{
            mine:15,
            gas:35,
            man:0.5,
            time:150
        },
        birthCount:2,
        upgrade:['UpgradeFlyerCarapace'],
        //Override
        dock:function(){
            //Use the same behavior
            AttackableUnit.hover.call(this);
        }
    }
});
Zerg.Mutalisk = Mutalisk;
Zerg.Guardian = Guardian;
Zerg.Devourer = Devourer;
Zerg.Scourge = Scourge;
