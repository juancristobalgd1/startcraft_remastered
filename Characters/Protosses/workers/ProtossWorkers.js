Protoss.Probe=AttackableUnit.extends({
    constructorPlus:function(props){
        //Same action mapping
        this.imgPos.dock=this.imgPos.moving;
        this.frame.dock=this.frame.moving;
    },
    prototypePlus: {
        //Add basic unit info
        name: "Probe",
        imgPos: {
            moving: {
                left: [0, 64, 128, 192, 256, 64, 128, 192],
                top: [0, 0, 0, 0, 0, 32, 32, 32]
            },
            attack: {
                left: [0, 64, 128, 192, 256, 64, 128, 192],
                top: [0, 0, 0, 0, 0, 32, 32, 32]
            }
        },
        width: 32,//N-1
        height: 32,//N-1
        frame: {
            moving: 1
        },
        //Only for moving status, override
        speed:Unit.getSpeedMatrixBy(12),
        HP: 20,
        SP: 20,
        damage: 5,
        armor:0,
        plasma:0,
        sight:280,
        meleeAttack: true,
        attackInterval: 2200,
        portraitOffset: {x:0,y:112},
        dieEffect:Burst.SmallBlueExplode,
        attackEffect:Burst.ProbeSpark,
        isFlying:false,
        attackLimit:"ground",
        unitType:Unit.SMALL,
        attackType:AttackableUnit.NORMAL_ATTACK,
        recover:Building.ProtossBuilding.prototype.recover,
        cost:{
            mine:50,
            man:1,
            time:200
        },
        upgrade:['UpgradeGroundArmor','UpgradePlasmaShields'],
        items:{'4':undefined,
            '5':{name:'gather'},
            '7':{name:'BasicStructure'},
            '8':{name:'AdvancedStructure'}
        },
        gather:function(target){
            return Unit.prototype.gather.call(this,target);
        }
    }
});
