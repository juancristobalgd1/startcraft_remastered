import _$ from '../../../Utils/gFrame/core.js';

const Referee = {
    ourDetectedUnits: [],
    enemyDetectedUnits: [],
    ourUnderArbiterUnits: [],
    enemyUnderArbiterUnits: [],
    _pos: [[-1, 0], [1, 0], [0, -1], [0, 1]],
    unique: (arr) => [...new Set(arr)],
    voice: {
        pError: _$.lazyAudio('bgm/PointError.wav'),
        button: _$.lazyAudio('bgm/Button.wav'),
        resource: {
            Zerg: {
                mine: _$.lazyAudio('bgm/mine.Zerg.wav'),
                gas: _$.lazyAudio('bgm/gas.Zerg.wav'),
                man: _$.lazyAudio('bgm/man.Zerg.wav'),
                magic: _$.lazyAudio('bgm/magic.Zerg.wav')
            },
            Terran: {
                mine: _$.lazyAudio('bgm/mine.Terran.wav'),
                gas: _$.lazyAudio('bgm/gas.Terran.wav'),
                man: _$.lazyAudio('bgm/man.Terran.wav'),
                magic: _$.lazyAudio('bgm/magic.Terran.wav')
            },
            Protoss: {
                mine: _$.lazyAudio('bgm/mine.Protoss.wav'),
                gas: _$.lazyAudio('bgm/gas.Protoss.wav'),
                man: _$.lazyAudio('bgm/man.Protoss.wav'),
                magic: _$.lazyAudio('bgm/magic.Protoss.wav')
            }
        },
        upgrade: {
            Zerg: _$.lazyAudio('bgm/upgrade.Zerg.wav'),
            Terran: _$.lazyAudio('bgm/upgrade.Terran.wav'),
            Protoss: _$.lazyAudio('bgm/upgrade.Protoss.wav')
        }
    },
    winCondition: () => {
        return (Unit.allEnemyUnits().length == 0 && Building.enemyBuildings.length == 0);
    },
    loseCondition: () => {
        return (Unit.allOurUnits().length == 0 && Building.ourBuildings.length == 0);
    },
    // detectorBuffer are reverse of arbiterBuffer
    judgeDetect: function () {
        // Every 0.4 sec
        if (Game._clock % 4 == 0) {
            // Same detector buffer reference
            const detectorBuffer = Gobj.detectorBuffer;
            const ourDetectors = Unit.allOurUnits().concat(Building.ourBuildings).filter((chara) => {
                return chara.detector && chara.status != "dead";
            });
            const enemyDetectors = Unit.allEnemyUnits().concat(Building.enemyBuildings).filter((chara) => {
                return chara.detector && chara.status != "dead";
            });
            // Clear old units detected buffer
            Referee.ourDetectedUnits.concat(Referee.enemyDetectedUnits).forEach((chara) => {
                chara.removeBuffer(detectorBuffer);
            });
            Referee.ourDetectedUnits = [];
            Referee.enemyDetectedUnits = [];
            // Find new detected units
            ourDetectors.forEach((detector) => {
                // Find targets: enemy invisible units inside my detector sight
                const targets = Game.getInRangeOnes(detector.posX(), detector.posY(), detector.get('sight'), true, true, null, (chara) => {
                    return chara.isInvisible;
                });
                Referee.ourDetectedUnits = Referee.ourDetectedUnits.concat(targets);
            });
            Referee.ourDetectedUnits = Referee.unique(Referee.ourDetectedUnits);

            enemyDetectors.forEach((detector) => {
                // Find targets: our invisible units inside enemy detector sight
                const targets = Game.getInRangeOnes(detector.posX(), detector.posY(), detector.get('sight'), false, true, null, (chara) => {
                    return chara.isInvisible;
                });
                Referee.enemyDetectedUnits = Referee.enemyDetectedUnits.concat(targets);
            });
            Referee.enemyDetectedUnits = Referee.unique(Referee.enemyDetectedUnits);

            // Detector buffer effect on these units
            Referee.ourDetectedUnits.concat(Referee.enemyDetectedUnits).forEach((chara) => {
                chara.addBuffer(detectorBuffer);
            });
        }
    },
    judgeArbiter: function () {
        // Every 0.4 sec
        if (Game._clock % 4 == 0) {
            const arbiterBuffer = (window.Protoss && window.Protoss.Arbiter) ? window.Protoss.Arbiter.prototype.bufferObj : { isInvisible: true };
            const myArbiters = Unit.ourFlyingUnits.filter(chara => chara.name == "Arbiter" && chara.status != "dead");
            const enemyArbiters = Unit.enemyFlyingUnits.filter(chara => chara.name == "Arbiter" && chara.status != "dead");

            Referee.ourUnderArbiterUnits.concat(Referee.enemyUnderArbiterUnits).forEach(chara => chara.removeBuffer(arbiterBuffer));
            Referee.ourUnderArbiterUnits = [];
            Referee.enemyUnderArbiterUnits = [];

            myArbiters.forEach(arbiter => {
                const targets = Game.getInRangeOnes(arbiter.posX(), arbiter.posY(), arbiter.get('sight'), false, true, null, chara => myArbiters.indexOf(chara) == -1);
                Referee.ourUnderArbiterUnits = Referee.ourUnderArbiterUnits.concat(targets);
            });
            Referee.ourUnderArbiterUnits = Referee.unique(Referee.ourUnderArbiterUnits);

            enemyArbiters.forEach(arbiter => {
                const targets = Game.getInRangeOnes(arbiter.posX(), arbiter.posY(), arbiter.get('sight'), true, true, null, chara => enemyArbiters.indexOf(chara) == -1);
                Referee.enemyUnderArbiterUnits = Referee.enemyUnderArbiterUnits.concat(targets);
            });
            Referee.enemyUnderArbiterUnits = Referee.unique(Referee.enemyUnderArbiterUnits);

            Referee.ourUnderArbiterUnits.concat(Referee.enemyUnderArbiterUnits).forEach(chara => chara.addBuffer(arbiterBuffer));
        }
    },
    judgeCollision: function () {
        // Avoid collision: Ground units and Buildings
        let units = Unit.allGroundUnits().concat(Building.allBuildings);
        for (let N = 0; N < units.length; N++) {
            const chara1 = units[N];
            if (chara1.status == "dead") continue;
            for (let M = N + 1; M < units.length; M++) {
                const chara2 = units[M];
                if (chara2.status == "dead") continue;
                let dist = chara1.distanceFrom(chara2);
                // Ground unit collision limit
                let distLimit;
                if (chara2 instanceof Unit) {
                    distLimit = (chara1.radius() + chara2.radius()) * 0.5;
                    if (distLimit < Unit.meleeRange) distLimit = Unit.meleeRange;
                }
                // Collision with Building
                else {
                    distLimit = (chara1.radius() + chara2.radius()) * 0.8;
                }
                // Separate overlapping ones
                if (dist == 0) {
                    const colPos = Referee._pos[Math.random() * 4 >> 0];
                    if (chara1 instanceof Unit) {
                        chara1.x += colPos[0];
                        chara1.y += colPos[1];
                        dist = 1;
                    } else if (chara2 instanceof Unit) {
                        chara2.x += colPos[0];
                        chara2.y += colPos[1];
                        dist = 1;
                    }
                }
                if (dist < distLimit) {
                    // Collision flag for pathfinding assistance
                    chara1.collision = chara2;
                    chara2.collision = chara1;
                    // Adjust ratio
                    const K = (distLimit - dist) / dist / 2;
                    const adjustX = K * (chara1.x - chara2.x) >> 0;
                    const adjustY = K * (chara1.y - chara2.y) >> 0;
                    // Adjust location
                    let interactRatio1 = 0;
                    let interactRatio2 = 0;
                    if (chara1 instanceof Building) {
                        interactRatio1 = 0;
                        if (chara2 instanceof Unit) interactRatio2 = 2;
                        else interactRatio2 = 0;
                    } else {
                        if (chara2 instanceof Unit) {
                            if (chara1.status == "moving") {
                                if (chara2.status == "moving") {
                                    interactRatio1 = 1;
                                    interactRatio2 = 1;
                                } else {
                                    interactRatio1 = 2;
                                    interactRatio2 = 0;
                                }
                            } else {
                                if (chara2.status == "moving") {
                                    interactRatio1 = 0;
                                    interactRatio2 = 2;
                                } else {
                                    interactRatio1 = 1;
                                    interactRatio2 = 1;
                                }
                            }
                        } else {
                            interactRatio1 = 2;
                            interactRatio2 = 0;
                        }
                    }
                    chara1.x += interactRatio1 * adjustX;
                    chara1.y += interactRatio1 * adjustY;
                    chara2.x -= interactRatio2 * adjustX;
                    chara2.y -= interactRatio2 * adjustY;
                }
            }
        }
        // Avoid collision: Flying units
        units = Unit.allFlyingUnits();
        for (let N = 0; N < units.length; N++) {
            const chara1 = units[N];
            if (chara1.status == "dead") continue;
            for (let M = N + 1; M < units.length; M++) {
                const chara2 = units[M];
                if (chara2.status == "dead") continue;
                let dist = chara1.distanceFrom(chara2);
                const distLimit = Unit.meleeRange;
                if (dist == 0) {
                    const colPos = Referee._pos[Math.random() * 4 >> 0];
                    chara1.x += colPos[0];
                    chara1.y += colPos[1];
                    dist = 1;
                }
                if (dist < distLimit) {
                    const K = (distLimit - dist) / dist / 2;
                    const adjustX = K * (chara1.x - chara2.x) >> 0;
                    const adjustY = K * (chara1.y - chara2.y) >> 0;
                    chara1.x += adjustX;
                    chara1.y += adjustY;
                    chara2.x -= adjustX;
                    chara2.y -= adjustY;
                }
            }
        }
    },
    judgeRecover: function () {
        if (Game._clock % 10 == 0) { // Every 1 second
            Unit.allUnits.concat(Building.allBuildings).forEach(chara => {
                if (chara.status != 'dead' && chara.recover) chara.recover();
            });
        }
    },
    judgeDying: function () {
        if (Game._clock % 10 == 0) {
            Unit.allUnits.concat(Building.allBuildings).filter(chara => chara.life <= 0 && chara.status != 'dead').forEach(chara => chara.die());
        }
    },
    // These methods are defined as stubs here and overridden by RefereeWorld.js
    // with properly matching original game implementations.
    judgeMan: function () { },
    addLarva: function () { },
    monitorMiniMap: function () { },
    coverFog: function () { },
    alterSelectionMode: function () { },
    judgeWinLose: function () { },
    judgeReachDestination: function (chara) {
        if (chara.isIdle && chara.isIdle() && chara.destination) {
            if (chara.insideSquare({ centerX: chara.destination.x, centerY: chara.destination.y, radius: Unit.moveRange })) {
                if (chara.destination.next) {
                    chara.destination = chara.destination.next;
                    chara.moveTo(chara.destination.x, chara.destination.y);
                    chara.targetLock = false;
                } else {
                    delete chara.destination;
                }
            } else {
                chara.moveTo(chara.destination.x, chara.destination.y);
                chara.targetLock = false;
            }
        }
    }
};

window.Referee = Referee;
export default Referee;
