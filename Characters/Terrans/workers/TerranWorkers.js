Terran.SCV = AttackableUnit.extends({
    constructorPlus: function (props) {
        this.imgPos.dock = this.imgPos.moving;
        this.frame.dock = this.frame.moving;
    },
    prototypePlus: {
        name: "SCV",
        imgPos: {
            moving: {
                left: [2, 54, 107, 154, 202, 252, 296, 344],
                top: [1, 1, 1, 1, 1, 1, 1, 1]
            },
            attack: {
                left: [[2, 2, 2, 2, 2], [54, 54, 54, 54, 54], [107, 107, 107, 107, 107], [154, 154, 154, 154, 154],
                [202, 202, 202, 202, 202], [252, 252, 252, 252, 252], [296, 296, 296, 296, 296], [344, 344, 344, 344, 344]],
                top: [[55, 55, 105, 105, 105], [55, 55, 105, 105, 105], [55, 55, 105, 105, 105], [55, 55, 105, 105, 105],
                [55, 55, 105, 105, 105], [55, 55, 105, 105, 105], [55, 55, 105, 105, 105], [55, 55, 105, 105, 105]]
            }
        },
        width: 40,
        height: 44,
        frame: {
            moving: 1,
            attack: 5
        },
        speed: Unit.getSpeedMatrixBy(12),
        HP: 60,
        damage: 5,
        armor: 0,
        sight: 245,
        meleeAttack: true,
        attackInterval: 1500,
        portraitOffset: { x: 0, y: 56 },
        dieEffect: Burst.SmallExplode,
        attackEffect: Burst.SCVSpark,
        isFlying: false,
        attackLimit: "ground",
        unitType: Unit.SMALL,
        attackType: AttackableUnit.NORMAL_ATTACK,
        recover: Building.TerranBuilding.prototype.recover,
        cost: {
            mine: 50,
            man: 1,
            time: 200
        },
        upgrade: ['UpgradeInfantryArmors'],
        items: {
            '4': { name: 'repair' },
            '5': { name: 'gather' },
            '7': { name: 'BasicBuilding' },
            '8': { name: 'AdvancedBuilding' }
        },
        gather: function (target) {
            return Unit.prototype.gather.call(this, target);
        }
    }
}
);
