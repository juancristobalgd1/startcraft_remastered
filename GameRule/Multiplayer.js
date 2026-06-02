import Game from './Games/core/GameBase.js';
import Unit from '../Characters/Units/core/UnitBase.js';
import Building from '../Characters/Buildings/core/BuildingBase.js';
import mouseController from '../Controller/mouseController.js';
import Button from '../Characters/Buttons/core/ButtonBase.js';
import Magic from '../Characters/Magics/core/MagicBase.js';
import Upgrade from '../Characters/Upgrades/core/UpgradeBase.js';
import Zerg from '../Characters/Zergs/core/ZergBase.js';
import Terran from '../Characters/Terrans/core/TerranBase.js';
import Protoss from '../Characters/Protosses/core/ProtossBase.js';
import Cheat from './Cheat.js';
import Referee from './Referees/core/RefereeBase.js';
import Neutral from '../Characters/Breeds/Neutral.js';

const Multiplayer = {
    ON: false,
    cmds: [],
    
    getUnitsByUIDs(uids) {
        return Unit.allUnits.concat(Building.allBuildings).filter(chara => {
            return uids.indexOf(chara.id) !== -1 && chara.status !== 'dead';
        });
    },

    getUIDs(charas) {
        return charas.map(chara => chara.id);
    },

    parseTickCmd(msgObj) {
        if (!msgObj.cmds) return;
        if (!Game.commands[msgObj.tick]) Game.commands[msgObj.tick] = [];
        
        msgObj.cmds.forEach(cmdStr => {
            const cmd = JSON.parse(cmdStr);
            switch (cmd.type) {
                case 'rightClick':
                    Game.commands[msgObj.tick].push(() => {
                        const charas = Multiplayer.getUnitsByUIDs(cmd.uids);
                        Multiplayer.rightClickHandler(charas, cmd.pos, cmd.unlock, cmd.btn);
                    });
                    break;
                case 'stop':
                    Game.commands[msgObj.tick].push(() => {
                        const charas = Multiplayer.getUnitsByUIDs(cmd.uids);
                        Multiplayer.stopHandler(charas);
                    });
                    break;
                case 'hold':
                    Game.commands[msgObj.tick].push(() => {
                        const charas = Multiplayer.getUnitsByUIDs(cmd.uids);
                        Multiplayer.holdHandler(charas);
                    });
                    break;
                case 'magic':
                    if (cmd.duration) {
                        Game.commands[msgObj.tick].push(() => {
                            const owner = Multiplayer.getUnitsByUIDs(cmd.uids)[0];
                            if (owner && window.Resource && window.Resource.paypal.call(owner, window.Resource.getCost(cmd.name))) {
                                let duration = cmd.duration;
                                if (Cheat.cwal) duration = 0;
                                Game.commandTimeout(() => {
                                    if (Magic[cmd.name] && Magic[cmd.name].spell) {
                                        Magic[cmd.name].spell.call(owner);
                                    }
                                    delete owner.processing;
                                }, duration * 100);
                                owner.processing = {
                                    name: cmd.name,
                                    startTime: Game.mainTick,
                                    time: duration
                                };
                            }
                        });
                    } else {
                        Game.commands[msgObj.tick].push(() => {
                            const owner = Multiplayer.getUnitsByUIDs(cmd.uids)[0];
                            if (owner) {
                                if (cmd.pos) {
                                    if (cmd.creditBill && window.Resource) owner.creditBill = cmd.creditBill;
                                    if (Magic[cmd.name] && Magic[cmd.name].spell) {
                                        Magic[cmd.name].spell.call(owner, cmd.pos);
                                    }
                                } else {
                                    if (window.Resource && window.Resource.paypal.call(owner, window.Resource.getCost(cmd.name))) {
                                        if (Magic[cmd.name] && Magic[cmd.name].spell) {
                                            Magic[cmd.name].spell.call(owner);
                                        }
                                    }
                                }
                            }
                        });
                    }
                    break;
                case 'upgrade':
                    if (cmd.duration) {
                        Game.commands[msgObj.tick].push(() => {
                            const owner = Multiplayer.getUnitsByUIDs(cmd.uids)[0];
                            if (owner && window.Resource && window.Resource.paypal.call(owner, window.Resource.getCost(cmd.name))) {
                                let duration = cmd.duration;
                                if (Cheat.cwal) duration = 0;
                                Game.commandTimeout(() => {
                                    if (Upgrade[cmd.name] && Upgrade[cmd.name].effect) {
                                        Upgrade[cmd.name].effect(cmd.team);
                                    }
                                    delete owner.processing;
                                    if (cmd.team == Game.team) {
                                        if (Referee.voice && Referee.voice.upgrade && Referee.voice.upgrade[Game.race.selected]) {
                                            Referee.voice.upgrade[Game.race.selected].play();
                                        }
                                        if (Game.refreshInfo) Game.refreshInfo();
                                        if (Game.showMessage) Game.showMessage('Upgrade complete');
                                    }
                                }, duration * 100);
                                owner.processing = {
                                    name: cmd.name,
                                    startTime: Game.mainTick,
                                    time: duration
                                };
                            }
                        });
                    } else {
                        Game.commands[msgObj.tick].push(() => {
                            if (Upgrade[cmd.name] && Upgrade[cmd.name].effect) {
                                Upgrade[cmd.name].effect(cmd.team);
                            }
                        });
                    }
                    break;
                case 'unit':
                    if (cmd.evolve) {
                        switch (cmd.evolve) {
                            case 'archon':
                                Game.commands[msgObj.tick].push(() => {
                                    const chara = Multiplayer.getUnitsByUIDs(cmd.uids)[0];
                                    if (chara && window.Resource && window.Resource.paypal.call(chara, window.Resource.getCost(cmd.name))) {
                                        const evolveClass = (window.ProtossBuilding && window.ProtossBuilding[cmd.name + 'Evolve']) || 
                                                             (window.Building && window.Building.ProtossBuilding && window.Building.ProtossBuilding[cmd.name + 'Evolve']);
                                        if (evolveClass) {
                                            const evolve = chara.evolveTo(evolveClass);
                                            let duration = cmd.duration;
                                            Game.commandTimeout(() => {
                                                if (evolve.status != 'dead') {
                                                    const targetClass = window.Protoss && window.Protoss[cmd.name];
                                                    if (targetClass) {
                                                        evolve.evolveTo(targetClass);
                                                    }
                                                }
                                            }, duration * 100);
                                            evolve.processing = {
                                                name: cmd.name,
                                                startTime: Game.mainTick,
                                                time: duration
                                            };
                                        }
                                    }
                                });
                                break;
                            case 'zerg':
                                const exceptions = ['Guardian', 'Devourer'];
                                Game.commands[msgObj.tick].push(() => {
                                    const chara = Multiplayer.getUnitsByUIDs(cmd.uids)[0];
                                    if (chara && window.Resource && window.Resource.paypal.call(chara, window.Resource.getCost(cmd.name))) {
                                        const base = chara.owner;
                                        let egg;
                                        const ZergBuilding = window.ZergBuilding || (window.Building && window.Building.ZergBuilding);
                                        if (exceptions.indexOf(cmd.name) != -1) {
                                            egg = chara.evolveTo(ZergBuilding.Cocoon);
                                        } else {
                                            egg = chara.evolveTo(ZergBuilding.Egg);
                                            if (cmd.name == 'Lurker') egg.action = 18;
                                        }
                                        let duration = cmd.duration;
                                        if (Cheat.cwal) duration = 0;
                                        Game.commandTimeout(() => {
                                            if (egg.status != 'dead') {
                                                const targetClass = window.Zerg && window.Zerg[cmd.name];
                                                if (targetClass) {
                                                    egg.evolveTo(targetClass);
                                                }
                                            }
                                        }, duration * 100);
                                        egg.processing = {
                                            name: cmd.name,
                                            startTime: Game.mainTick,
                                            time: duration
                                        };
                                    }
                                });
                                break;
                        }
                    } else {
                        Game.commands[msgObj.tick].push(() => {
                            const owner = Multiplayer.getUnitsByUIDs(cmd.uids)[0];
                            if (owner && window.Resource && window.Resource.paypal.call(owner, window.Resource.getCost(cmd.name))) {
                                // Find race
                                let Race;
                                const races = [window.Zerg, window.Terran, window.Protoss, window.Hero];
                                races.forEach(r => {
                                    if (r && r[cmd.name]) Race = r;
                                });
                                if (Race && Race[cmd.name]) {
                                    let duration = cmd.duration;
                                    if (Cheat.cwal) duration = 0;
                                    Game.commandTimeout(() => {
                                        let trainedUnit;
                                        if (Race[cmd.name].prototype.isFlying) {
                                            trainedUnit = new Race[cmd.name]({ x: owner.x, y: owner.y, team: owner.team });
                                        } else {
                                            trainedUnit = new Race[cmd.name]({ x: owner.x, y: owner.y + owner.height, team: owner.team });
                                        }
                                        delete owner.processing;
                                        if (owner.rallyPoint) trainedUnit.destination = owner.rallyPoint;
                                    }, duration * 100);
                                    owner.processing = {
                                        name: cmd.name,
                                        startTime: Game.mainTick,
                                        time: duration
                                    };
                                }
                            }
                        });
                    }
                    break;
                case 'build':
                    Game.commands[msgObj.tick].push(() => {
                        const farmer = Multiplayer.getUnitsByUIDs(cmd.uids)[0];
                        if (farmer && window.Resource && window.Resource.paypal.call(farmer, window.Resource.getCost(cmd.name))) {
                            farmer.buildName = cmd.name;
                            if (cmd.pos) {
                                farmer['build' + cmd.buildType](cmd.pos);
                            } else {
                                farmer['build' + cmd.buildType]();
                            }
                        }
                    });
                    break;
            }
        });
    },

    rightClickHandler(charas, pos, unlock, btn) {
        if (!charas.length) return;
        let selectedEnemy = Game.getSelectedOne(pos.x, pos.y, true); // true for enemy
        const hasSelectedWorker = charas.some(chara => chara && (chara.name == 'SCV' || chara.name == 'Drone' || chara.name == 'Probe'));
        if (!(selectedEnemy instanceof Gobj) && hasSelectedWorker) {
            const mx = pos.x;
            const my = pos.y;
            const minerals = Game.getInRangeOnes(mx, my, 55, false, true, false, chara => {
                return (typeof Neutral !== 'undefined' && chara instanceof Neutral.Mineral) || (chara.name == 'Mineral');
            });
            if (minerals && minerals.length) {
                selectedEnemy = minerals[0];
            }
        }
        if (!(selectedEnemy instanceof Gobj)) {
            selectedEnemy = Game.getSelectedOne(pos.x, pos.y, false, false, null, chara => {
                return (chara instanceof Building) && (['Refinery', 'Extractor', 'Assimilator'].indexOf(chara.name) !== -1);
            });
        }
        charas.forEach(chara => {
            if (chara.sound && chara.sound.moving) chara.sound.moving.play();
            if (chara.destination) {
                if (chara.destination.next) chara.destination.next = null;
                delete chara.destination;
            }
            if (chara.hold) {
                delete chara.AI;
                delete chara.findNearbyTargets;
                delete chara.hold;
                if (typeof Button !== 'undefined' && Button.reset) Button.reset();
            }
            if ((selectedEnemy instanceof Gobj) && 
                ((typeof Neutral !== 'undefined' && selectedEnemy instanceof Neutral.Mineral) || 
                 selectedEnemy.name == 'Mineral' ||
                 ((selectedEnemy instanceof Building) && (['Refinery', 'Extractor', 'Assimilator'].indexOf(selectedEnemy.name) !== -1)))
                && (chara.name == 'SCV' || chara.name == 'Drone' || chara.name == 'Probe')) {
                if (chara.gather) chara.gather(selectedEnemy);
                return;
            }
            const attackOrMove = chara.attack ? (selectedEnemy instanceof Gobj && selectedEnemy.isEnemy) : false;
            if (attackOrMove) {
                if (chara.cannotMove && chara.cannotMove() && !chara.isInAttackRange(selectedEnemy)) return;
                chara.targetLock = true;
                chara.attack(selectedEnemy);
            } else {
                if (chara.cannotMove && chara.cannotMove()) return;
                if (chara.attack) chara.stopAttack();
                chara.targetLock = !unlock;
                chara.moveTo(pos.x, pos.y);
                if (btn == 'attack') {
                    chara.destination = { x: pos.x, y: pos.y };
                }
                if (btn == 'patrol') {
                    chara.destination = { x: pos.x, y: pos.y };
                    chara.destination.next = { x: chara.posX(), y: chara.posY(), next: chara.destination };
                }
            }
        });
    },

    stopHandler(charas) {
        charas.forEach(chara => {
            if (chara.attack) chara.stopAttack();
            chara.dock();
            delete chara._patrolRoute;
            if (chara.destination) {
                if (chara.destination.next) chara.destination.next = undefined;
                delete chara.destination;
            }
        });
    },

    holdHandler(charas) {
        Multiplayer.stopHandler(charas);
        charas.forEach(chara => {
            if (chara.hold) {
                delete chara.AI;
                delete chara.findNearbyTargets;
                delete chara.hold;
            } else {
                chara.AI = Building.Attackable.prototype.AI || (Building.Attackable.prototypePlus && Building.Attackable.prototypePlus.AI);
                chara.findNearbyTargets = Building.Attackable.prototype.findNearbyTargets || (Building.Attackable.prototypePlus && Building.Attackable.prototypePlus.findNearbyTargets);
                chara.dock();
                chara.hold = true;
            }
        });
        if (typeof Button !== 'undefined' && Button.reset) Button.reset();
    }
};

globalThis.Multiplayer = Multiplayer;

// Dynamic worker/building action wrappers for multiplayer/replay support
if (typeof Unit !== 'undefined' && Unit.prototype) {
    Unit.prototype.buildTerran = function (pos) {
        var buildName = this.buildName;
        var buildType = window.TerranBuilding && window.TerranBuilding[buildName];
        if (buildType) {
            var rect = Button._buildRectFor(buildType, pos);
            var cost = Resource.getCost(buildName);
            var duration = cost ? cost.time : 0;
            if (Cheat.cwal) duration = 0;
            Button._issueWorkerBuildOrder(this, window.TerranBuilding, buildType, buildName, rect, duration, cost);
        }
    };
    Unit.prototype.buildProtoss = function (pos) {
        var buildName = this.buildName;
        var buildType = window.ProtossBuilding && window.ProtossBuilding[buildName];
        if (buildType) {
            var rect = Button._buildRectFor(buildType, pos);
            var cost = Resource.getCost(buildName);
            var duration = cost ? cost.time : 0;
            if (Cheat.cwal) duration = 0;
            Button._issueWorkerBuildOrder(this, window.ProtossBuilding, buildType, buildName, rect, duration, cost);
        }
    };
    Unit.prototype.buildZerg = function (pos) {
        var buildName = this.buildName;
        var buildType = window.ZergBuilding && window.ZergBuilding[buildName];
        if (buildType) {
            var rect = Button._buildRectFor(buildType, pos);
            var cost = Resource.getCost(buildName);
            var duration = cost ? cost.time : 0;
            if (Cheat.cwal) duration = 0;
            Button._issueWorkerBuildOrder(this, window.ZergBuilding, buildType, buildName, rect, duration, cost);
        }
    };
}
if (typeof Building !== 'undefined' && Building.prototype) {
    Building.prototype.buildMorph = function () {
        var buildName = this.buildName;
        var buildType = window.ZergBuilding && window.ZergBuilding[buildName];
        if (buildType) {
            var cost = Resource.getCost(buildName);
            var duration = cost ? cost.time : 0;
            if (Cheat.cwal) duration = 0;
            var egg = this.evolveTo(window.ZergBuilding.Egg || window.Building.ZergBuilding.Egg);
            Button.queueJob(egg, {
                name: buildName,
                time: duration,
                run: function () {
                    return egg.evolveTo(buildType);
                }
            });
        }
    };
}

// Support fallback in Archon evolve class resolution
if (globalThis.Multiplayer && globalThis.Multiplayer.parseTickCmd) {
    const origParseTickCmd = globalThis.Multiplayer.parseTickCmd;
    globalThis.Multiplayer.parseTickCmd = function (msgObj) {
        if (msgObj.cmds) {
            msgObj.cmds = msgObj.cmds.map(cmdStr => {
                try {
                    let cmd = JSON.parse(cmdStr);
                    if (cmd.type === 'unit' && (cmd.name === 'Archon' || cmd.name === 'DarkArchon')) {
                        if (window.ProtossBuilding && !window.ProtossBuilding[cmd.name + 'Evolve']) {
                            window.ProtossBuilding[cmd.name + 'Evolve'] = window.ProtossBuilding[cmd.name];
                        }
                    }
                    return cmdStr;
                } catch(e) {
                    return cmdStr;
                }
            });
        }
        return origParseTickCmd(msgObj);
    };
}

export default Multiplayer;
