//Assign current ID to each newly born unit
Unit.currentID = 0;
//Smallest range for move precision
Unit.moveRange = 20;
//Range for mouse select
Unit.selectRange = 20;
//Range for melee attack
Unit.meleeRange = 25;//50
//Speed matrix, 2^0.5=>0.7
Unit.speedMatrix = [
    { x: 0, y: -1 },
    { x: 0.7, y: -0.7 },
    { x: 1, y: 0 },
    { x: 0.7, y: 0.7 },
    { x: 0, y: 1 },
    { x: -0.7, y: 0.7 },
    { x: -1, y: 0 },
    { x: -0.7, y: -0.7 }
];
//Get speed matrix by unit speed
Unit.getSpeedMatrixBy = function (speed) {
    const speedMatrix = _$.clone(Unit.speedMatrix);
    _$.matrixOperation(speedMatrix, (N) => {
        return N * speed;
    });
    return speedMatrix;
};
//All units' sight
Unit.sight = 300;
//Attack type matrix
Unit.attackMatrix = [
    [1, 1, 1],
    [0.5, 0.75, 1],
    [1, 0.5, 0.25]
];
//Unit type
Unit.SMALL = 0;
Unit.MIDDLE = 1;
Unit.BIG = 2;
//All existed units, class property
Unit.allUnits = [];
Unit.ourFlyingUnits = [];
Unit.ourGroundUnits = [];
Unit.enemyFlyingUnits = [];
Unit.enemyGroundUnits = [];
Unit.allOurUnits = function () {
    return Unit.ourFlyingUnits.concat(Unit.ourGroundUnits);
};
Unit.allEnemyUnits = function () {
    return Unit.enemyFlyingUnits.concat(Unit.enemyGroundUnits);
};
Unit.allFlyingUnits = function () {
    return Unit.ourFlyingUnits.concat(Unit.enemyFlyingUnits);
};
Unit.allGroundUnits = function () {
    return Unit.ourGroundUnits.concat(Unit.enemyGroundUnits);
};
//Get all units count
Unit.count = function () {
    const count = { ours: 0, enemy: 0 };
    Unit.allUnits.forEach((chara) => {
        if (chara.isEnemy) count.enemy++;
        else count.ours++;
    });
    return count;
};
Unit.sortAllUnits = function () {
    Unit.allUnits.sort((unit1, unit2) => (unit1.isFlying ? 1 : 0) - (unit2.isFlying ? 1 : 0));
};
//Sort units
Unit.sortUnits = function (units) {
    units.sort((unit1, unit2) => {
        return (unit1.isFlying ? 1 : 0) - (unit2.isFlying ? 1 : 0);
    });
};
