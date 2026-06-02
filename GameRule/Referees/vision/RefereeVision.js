Referee.judgeArbiter = function () {
    if (Game._clock % 4 == 0) {
        const arbiterBuffer = Protoss.Arbiter.prototype.bufferObj;
        const myArbiters = Unit.ourFlyingUnits.filter((chara) => chara.name == "Arbiter");
        const enemyArbiters = Unit.enemyFlyingUnits.filter((chara) => chara.name == "Arbiter");
        Referee.ourUnderArbiterUnits.concat(Referee.enemyUnderArbiterUnits).forEach((chara) => {
            if (chara.removeBuffer) chara.removeBuffer(arbiterBuffer);
        });
        Referee.ourUnderArbiterUnits = [];
        Referee.enemyUnderArbiterUnits = [];
        myArbiters.forEach((arbiter) => {
            const targets = Game.getInRangeOnes(arbiter.posX(), arbiter.posY(), arbiter.get('sight'), false, true, null, (chara) => myArbiters.indexOf(chara) == -1);
            Referee.ourUnderArbiterUnits = Referee.ourUnderArbiterUnits.concat(targets);
        });
        Referee.ourUnderArbiterUnits = Referee.unique(Referee.ourUnderArbiterUnits);
        enemyArbiters.forEach((arbiter) => {
            const targets = Game.getInRangeOnes(arbiter.posX(), arbiter.posY(), arbiter.get('sight'), true, true, null, (chara) => enemyArbiters.indexOf(chara) == -1);
            Referee.enemyUnderArbiterUnits = Referee.enemyUnderArbiterUnits.concat(targets);
        });
        Referee.enemyUnderArbiterUnits = Referee.unique(Referee.enemyUnderArbiterUnits);
        Referee.ourUnderArbiterUnits.concat(Referee.enemyUnderArbiterUnits).forEach((chara) => {
            chara.addBuffer(arbiterBuffer);
        });
    }
};
Referee.judgeDetect = function () {
    if (Game._clock % 4 == 0) {
        var detectorBuffer = Gobj.detectorBuffer;
        var ourDetectors = Unit.allOurUnits().concat(Building.ourBuildings).filter(function (chara) {
            return chara.detector;
        });
        const enemyDetectors = Unit.allEnemyUnits().concat(Building.enemyBuildings).filter((chara) => chara.detector);
        Referee.ourDetectedUnits.concat(Referee.enemyDetectedUnits).forEach((chara) => {
            if (chara.removeBuffer) chara.removeBuffer(detectorBuffer);
        });
        Referee.ourDetectedUnits = [];
        Referee.enemyDetectedUnits = [];
        ourDetectors.forEach((detector) => {
            const targets = Game.getInRangeOnes(detector.posX(), detector.posY(), detector.get('sight'), true, true, null, (chara) => chara.isInvisible);
            Referee.ourDetectedUnits = Referee.ourDetectedUnits.concat(targets);
        });
        Referee.ourDetectedUnits = Referee.unique(Referee.ourDetectedUnits);
        enemyDetectors.forEach((detector) => {
            const targets = Game.getInRangeOnes(detector.posX(), detector.posY(), detector.get('sight'), false, true, null, (chara) => chara.isInvisible);
            Referee.enemyDetectedUnits = Referee.enemyDetectedUnits.concat(targets);
        });
        Referee.enemyDetectedUnits = Referee.unique(Referee.enemyDetectedUnits);
        Referee.ourDetectedUnits.concat(Referee.enemyDetectedUnits).forEach((chara) => {
            chara.addBuffer(detectorBuffer);
        });
    }
};
