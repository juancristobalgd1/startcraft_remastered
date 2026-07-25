import Button from './ButtonBase.js';
import GameMap from '../../Map.js';
import { ZergBuilding, TerranBuilding, ProtossBuilding } from '../../Buildings/core/BuildingRaces.js';
import { Egg, Cocoon, LurkerCocoon } from '../../Buildings/zerg/ZergEvolve.js';
import Unit from '../../Units/core/UnitBase.js';
import Building from '../../Buildings/core/BuildingBase.js';
import Game from '../../../GameRule/Games/core/GameBase.js';
import Referee from '../../../GameRule/Referees/core/RefereeBase.js';
import Resource from '../../../GameRule/Resource.js';
import Cheat from '../../../GameRule/Cheat.js';
import Upgrade from '../../Upgrades/core/UpgradeBase.js';
import Magic from '../../Magics/core/MagicBase.js';
import Zerg from '../../Zergs/core/ZergBase.js';
import Terran from '../../Terrans/core/TerranBase.js';
import Protoss from '../../Protosses/core/ProtossBase.js';
import Gobj from '../../Gobj.js';

Button.equipButtonsFor = function (chara) {
    $('div.panel_Control button').removeAttr('class').removeAttr('disabled').removeAttr('style').off('click').off('mouseover').off('mouseout').html('').hide();
    if (chara.isEnemy || chara == {}) return;

    // Helper function to show tooltip
    var showTooltip = function (btn, itemName) {
        var costObj = Resource.getCost(itemName);
        if (costObj && (costObj.mine || costObj.gas || costObj.man || costObj.magic)) {
            var tooltipBox = $('div.tooltip_Box');
            tooltipBox.css({
                left: $(btn).offset().left + 50,
                top: $(btn).offset().top
            });
            tooltipBox.find('.itemName').text(itemName);
            if (costObj.mine) {
                tooltipBox.find('.mineNum').text(costObj.mine).parent().show();
            } else {
                tooltipBox.find('.mineNum').parent().hide();
            }
            if (costObj.gas) {
                tooltipBox.find('.gasNum').text(costObj.gas).parent().show();
            } else {
                tooltipBox.find('.gasNum').parent().hide();
            }
            if (costObj.man) {
                tooltipBox.find('.manNum').text(costObj.man).parent().show();
            } else {
                tooltipBox.find('.manNum').parent().hide();
            }
            if (costObj.magic) {
                tooltipBox.find('.magicNum').text(costObj.magic).parent().show();
            } else {
                tooltipBox.find('.magicNum').parent().hide();
            }
            tooltipBox.show();
        }
    };

    // Helper function to hide tooltip
    var hideTooltip = function () {
        $('div.tooltip_Box').hide();
    };
    $('div.panel_Control button').on('click', () => {
        Referee.voice.button.play();
    });
    if (chara instanceof Unit) {
        $('button[num="1"]').attr('class', 'move').show();
        $('button[num="2"]').attr('class', 'stop').show();
        $('button[num="4"]').attr('class', 'patrol').show();
        $('button[num="5"]').attr('class', 'hold').show();
        if (Game.selectedUnit.hold) $('button.hold').css('border-color', 'red');
        $('button.move').on('click', Button.moveHandler);
        $('button.stop').on('click', Button.stopHandler);
        $('button.patrol').on('click', Button.patrolHandler);
        $('button.hold').on('click', Button.holdHandler);
    }
    if (chara.attack) {
        $('button[num="3"]').attr('class', 'attack').show();
        $('button.attack').on('click', Button.attackHandler);
    }
    if (chara.items) {
        for (var N in chara.items) {
            if (chara.items[N] != null) {
                var btn = $('button[num="' + N + '"]');
                btn.off('click').attr('class', chara.items[N].name).show();
                if (chara.items[N].condition && chara.items[N].condition() == false)
                    btn.attr('disabled', true);
                else btn.removeAttr('disabled');
                switch (chara.items[N].name) {
                    case 'SpiderMines':
                        btn[0].innerHTML = chara.spiderMines;
                        break;
                    case 'Scarab':
                        btn[0].innerHTML = chara.scarabNum;
                        break;
                    case 'Interceptor':
                        btn[0].innerHTML = chara.continuousAttack.count;
                        break;
                }
                // Add tooltip events
                (function (itemName) {
                    btn.on('mouseover', function () {
                        showTooltip(this, itemName);
                    }).on('mouseout', hideTooltip);
                })(chara.items[N].name);
            }
            else {
                $('button[num="' + N + '"]').removeAttr('class').hide();
            }
        }
        if (chara instanceof Unit) {
            $('button.gather').on('click', Button.gatherHandler);
        }
        if (chara instanceof Building) {
            var canRally = false;
            for (var k in chara.items) {
                var it = chara.items[k];
                if (!it || !it.name) continue;
                if ((typeof Terran === 'object' && Terran[it.name]) || (typeof Protoss === 'object' && Protoss[it.name])) {
                    canRally = true;
                    break;
                }
            }
            if (canRally) {
                var slot = null;
                for (var s = 9; s >= 1; s--) {
                    var key = String(s);
                    if (!chara.items[key]) { slot = key; break; }
                }
                if (slot) {
                    $('button[num="' + slot + '"]').off('click').removeAttr('disabled').attr('class', 'SetRallyPoint').html('R').show();
                }
            }
        }
        $('button.Cancel').on('click', function () {
            Button.reset();
        });
        $('button.SelectLarva').on('click', function () {
            var larvas = Game.selectedUnit.larvas;
            if (larvas) {
                larvas = larvas.filter(function (chara) {
                    return chara.status != 'dead';
                });
                if (larvas.length) {
                    Game.unselectAll();
                    Game.addIntoAllSelected(larvas, true);
                    if (larvas[0] instanceof Gobj) {
                        Game.changeSelectedTo(larvas[0]);
                        larvas[0].sound.selected.play();
                    }
                }
            }
        });
        $('button.BasicMutation').on('click', function () {
            Button.equipButtonsFor(Button.basicZergMutations);
        });
        $('button.AdvancedMutation').on('click', function () {
            Button.equipButtonsFor(Button.advancedZergMutations);
        });
        $('button.BasicBuilding').on('click', function () {
            Button.equipButtonsFor(Button.basicTerranBuildings);
        });
        $('button.AdvancedBuilding').on('click', function () {
            Button.equipButtonsFor(Button.advancedTerranBuildings);
        });
        $('button.BasicStructure').on('click', function () {
            Button.equipButtonsFor(Button.basicProtossStructures);
        });
        $('button.AdvancedStructure').on('click', function () {
            Button.equipButtonsFor(Button.advancedProtossStructures);
        });
        var upgrades = new Array();
        for (var grade in Upgrade) {
            upgrades.push(grade);
        }
        upgrades.forEach(function (grade) {
            $('button.' + grade).on('click', function () {
                if (globalThis.Multiplayer && globalThis.Multiplayer.ON) {
                    var duration = (Resource.getCost(grade) && Resource.getCost(grade).time) ? Resource.getCost(grade).time : 0;
                    globalThis.Multiplayer.sendLocalCommand({
                        type: 'upgrade',
                        uids: [Game.selectedUnit.id],
                        name: grade,
                        duration: duration,
                        team: Game.team
                    });
                    Button.reset();
                    return;
                }
                if (Resource.paypal.call(Game.selectedUnit, Resource.getCost(grade))) {
                    if (Resource.getCost(grade) && Resource.getCost(grade).time) {
                        var owner = Game.selectedUnit;
                        var duration = Resource.getCost(grade).time;
                        if (Cheat.cwal) duration = 0;
                        if (duration) {
                            Button.queueJob(owner, {
                                name: grade,
                                time: duration,
                                run: function () {
                                    if (Upgrade[grade] && Upgrade[grade].effect) {
                                        Upgrade[grade].effect();
                                    }
                                    if (Referee.voice && Referee.voice.upgrade && Referee.voice.upgrade[Game.race.selected]) {
                                        Referee.voice.upgrade[Game.race.selected].play();
                                    }
                                    Button.reset();
                                    Game.showMessage('Upgrade complete');
                                }
                            });
                            if (globalThis.Multiplayer && !Game.replayFlag) {
                                var cmd = {
                                    type: 'upgrade',
                                    uids: [owner.id],
                                    name: grade,
                                    duration: duration,
                                    team: Game.team
                                };
                                if (!Game.replay.cmds[Game._clock]) Game.replay.cmds[Game._clock] = [];
                                Game.replay.cmds[Game._clock].push(JSON.stringify(cmd));
                            }
                        }
                    }
                    else {
                        Upgrade[grade].effect();
                        if (globalThis.Multiplayer && !Game.replayFlag) {
                            var cmd = {
                                type: 'upgrade',
                                uids: [Game.selectedUnit.id],
                                name: grade,
                                team: Game.team
                            };
                            if (!Game.replay.cmds[Game._clock]) Game.replay.cmds[Game._clock] = [];
                            Game.replay.cmds[Game._clock].push(JSON.stringify(cmd));
                        }
                    }
                }
            });
        });
        var magics = [];
        for (var magic in Magic) {
            magics.push(magic);
        }
        var hasMagic = function (chara, magic) {
            if (chara.items) {
                for (var attr in chara.items) {
                    if (chara.items[attr] && chara.items[attr].name == magic) {
                        if (chara.items[attr].condition) {
                            if (chara.items[attr].condition()) return true;
                        }
                        else return true;
                    }
                }
            }
            return false;
        };
        magics.forEach(function (magic) {
            $('button.' + magic).on('click', function () {
                Unit.allOurUnits().concat(Building.ourBuildings).filter(function (chara) {
                    return (chara.selected && hasMagic(chara, magic));
                }).forEach(function (chara) {
                    var duration = Resource.getCost(magic) ? (Resource.getCost(magic).time) : 0;
                    if (globalThis.Multiplayer && globalThis.Multiplayer.ON) {
                        if (duration) {
                            globalThis.Multiplayer.sendLocalCommand({
                                type: 'magic',
                                uids: [chara.id],
                                name: magic,
                                duration: duration
                            });
                            Button.reset();
                            return;
                        } else {
                            if (Magic[magic].credit) chara.creditBill = Resource.getCost(magic);
                            Magic[magic].spell.call(chara);
                            if (Button.callback) {
                                var originalCallback = Button.callback;
                                Button.callback = function (location) {
                                    globalThis.Multiplayer.sendLocalCommand({
                                        type: 'magic',
                                        uids: [chara.id],
                                        name: magic,
                                        pos: location,
                                        creditBill: chara.creditBill
                                    });
                                    Button.buildType = null;
                                    $('div.GameLayer').removeAttr('status');
                                    Button.callback = null;
                                };
                            } else {
                                globalThis.Multiplayer.sendLocalCommand({
                                    type: 'magic',
                                    uids: [chara.id],
                                    name: magic
                                });
                            }
                            return;
                        }
                    }
                    if (duration) {
                        if (chara.processing) return;
                        if (Resource.paypal.call(chara, Resource.getCost(magic))) {
                            if (Cheat.cwal) duration = 0;
                            Game.commandTimeout(function () {
                                Magic[magic].spell.call(chara);
                                delete chara.processing;
                            }, duration * 100);
                            chara.processing = {
                                name: magic,
                                startTime: Game._clock,
                                time: duration
                            };
                            if (globalThis.Multiplayer && !Game.replayFlag) {
                                var cmd = {
                                    type: 'magic',
                                    uids: [chara.id],
                                    name: magic,
                                    duration: duration
                                };
                                if (!Game.replay.cmds[Game._clock]) Game.replay.cmds[Game._clock] = [];
                                Game.replay.cmds[Game._clock].push(JSON.stringify(cmd));
                            }
                        }
                    }
                    else {
                        if (Magic[magic].credit) chara.creditBill = Resource.getCost(magic);
                        if (Resource.paypal.call(chara, Resource.getCost(magic))) {
                            Magic[magic].spell.call(chara);
                            if (Button.callback) {
                                var originalCallback = Button.callback;
                                Button.callback = function (location) {
                                    originalCallback(location);
                                    if (globalThis.Multiplayer && !Game.replayFlag) {
                                        var cmd = {
                                            type: 'magic',
                                            uids: [chara.id],
                                            name: magic,
                                            pos: location,
                                            creditBill: chara.creditBill
                                        };
                                        if (!Game.replay.cmds[Game._clock]) Game.replay.cmds[Game._clock] = [];
                                        Game.replay.cmds[Game._clock].push(JSON.stringify(cmd));
                                    }
                                };
                            } else {
                                if (globalThis.Multiplayer && !Game.replayFlag) {
                                    var cmd = {
                                        type: 'magic',
                                        uids: [chara.id],
                                        name: magic
                                    };
                                    if (!Game.replay.cmds[Game._clock]) Game.replay.cmds[Game._clock] = [];
                                    Game.replay.cmds[Game._clock].push(JSON.stringify(cmd));
                                }
                            }
                        }
                    }
                });
            });
        });
        var unitTypes = [];
        for (var unitType in Zerg) {
            unitTypes.push(unitType);
        }
        var exceptions = ['Lurker', 'Guardian', 'Devourer'];
        unitTypes.forEach(function (unitType) {
            $('button.' + unitType).on('click', function () {
                Unit.allOurUnits().filter(function (chara) {
                    return (chara.selected && chara.name == Game.selectedUnit.name);
                }).forEach(function (chara) {
                    if (chara.processing) return;
                    if (globalThis.Multiplayer && globalThis.Multiplayer.ON) {
                        var duration = Resource.getCost(unitType).time;
                        globalThis.Multiplayer.sendLocalCommand({
                            type: 'unit',
                            uids: [chara.id],
                            name: unitType,
                            duration: duration,
                            evolve: 'zerg'
                        });
                        return;
                    }
                    if (Resource.paypal.call(chara, Resource.getCost(unitType))) {
                        var egg;
                        if (unitType == 'Lurker') {
                            egg = chara.evolveTo(LurkerCocoon);
                        }
                        else if (unitType == 'Guardian' || unitType == 'Devourer') {
                            egg = chara.evolveTo(Cocoon);
                        }
                        else {
                            egg = chara.evolveTo(Egg);
                        }
                        var duration = Resource.getCost(unitType).time;
                        if (Cheat.cwal) duration = 0;
                        Game.commandTimeout(function () {
                            if (egg.status != 'dead') {
                                if (unitType == 'Lurker') {
                                    egg.evolveTo(Zerg[unitType], ['LurkerBirth']);
                                }
                                else if (unitType == 'Guardian' || unitType == 'Devourer') {
                                    egg.evolveTo(Zerg[unitType], [unitType + 'Birth']);
                                }
                                else {
                                    egg.evolveTo(Zerg[unitType], ['EggBirth', unitType + 'Birth']);
                                }
                            }
                        }, duration * 100);
                        egg.processing = {
                            name: unitType,
                            startTime: Game._clock,
                            time: duration
                        };
                        if (globalThis.Multiplayer && !Game.replayFlag) {
                            var cmd = {
                                type: 'unit',
                                uids: [chara.id],
                                name: unitType,
                                duration: duration,
                                evolve: 'zerg'
                            };
                            if (!Game.replay.cmds[Game._clock]) Game.replay.cmds[Game._clock] = [];
                            Game.replay.cmds[Game._clock].push(JSON.stringify(cmd));
                        }
                    }
                });
            });
        });
        [Terran, Protoss].forEach(function (Race) {
            var unitTypes = [];
            for (var unitType in Race) {
                unitTypes.push(unitType);
            }
            var exceptions = ['Lurker', 'Guardian', 'Devourer', 'Archon', 'DarkArchon'];
            unitTypes.forEach(function (unitType) {
                if (exceptions.indexOf(unitType) == -1) {
                    $('button.' + unitType).on('click', function () {
                        if (globalThis.Multiplayer && globalThis.Multiplayer.ON) {
                            var owner = Game.selectedUnit;
                            var duration = Resource.getCost(unitType).time;
                            globalThis.Multiplayer.sendLocalCommand({
                                type: 'unit',
                                uids: [owner.id],
                                name: unitType,
                                duration: duration
                            });
                            return;
                        }
                        if (Resource.paypal.call(Game.selectedUnit, Resource.getCost(unitType))) {
                            if (Resource.getCost(unitType) && Resource.getCost(unitType).time) {
                                var owner = Game.selectedUnit;
                                var duration = Resource.getCost(unitType).time;
                                if (Cheat.cwal) duration = 0;
                                Button.queueJob(owner, {
                                    name: unitType,
                                    time: duration,
                                    run: function () {
                                        var unit;
                                        if (Race[unitType].prototype.isFlying)
                                            unit = new Race[unitType]({ x: owner.x, y: owner.y, isEnemy: owner.isEnemy });
                                        else
                                            unit = new Race[unitType]({ x: owner.x, y: owner.y + owner.height, isEnemy: owner.isEnemy });
                                        return unit;
                                    }
                                });
                                if (globalThis.Multiplayer && !Game.replayFlag) {
                                    var cmd = {
                                        type: 'unit',
                                        uids: [owner.id],
                                        name: unitType,
                                        duration: duration
                                    };
                                    if (!Game.replay.cmds[Game._clock]) Game.replay.cmds[Game._clock] = [];
                                    Game.replay.cmds[Game._clock].push(JSON.stringify(cmd));
                                }
                            }
                        }
                    });
                }
                else {
                    if (unitType == 'Archon' || unitType == 'DarkArchon') {
                        $('button.' + unitType).on('click', function () {
                            var selectedTemplars = Unit.allOurUnits().filter(function (chara) {
                                return (chara.selected && chara.name == Game.selectedUnit.name && !chara.processing);
                            });
                            if (selectedTemplars.length < 2) {
                                if (Referee && Referee.voice && Referee.voice.pError) Referee.voice.pError.play();
                                if (Game && Game.showMessage) Game.showMessage("Need at least 2 templars to merge!");
                                return;
                            }
                            if (globalThis.Multiplayer && globalThis.Multiplayer.ON) {
                                for (var i = 0; i < selectedTemplars.length - 1; i += 2) {
                                    var chara1 = selectedTemplars[i];
                                    var duration = Resource.getCost(unitType).time;
                                    globalThis.Multiplayer.sendLocalCommand({
                                        type: 'unit',
                                        uids: [chara1.id],
                                        name: unitType,
                                        duration: duration,
                                        evolve: 'archon'
                                    });
                                }
                                Button.reset();
                                return;
                            }
                            // Merge in pairs
                            for (var i = 0; i < selectedTemplars.length - 1; i += 2) {
                                var chara1 = selectedTemplars[i];
                                var chara2 = selectedTemplars[i + 1];
                                var baseCost = Resource.getCost(unitType);
                                var cost = Object.assign({}, baseCost);
                                cost.man = 0; // Net supply change is 0.
                                if (Resource.paypal.call(chara1, cost)) {
                                    var midX = (chara1.x + chara2.x) / 2;
                                    var midY = (chara1.y + chara2.y) / 2;
                                    var isEnemy = chara1.isEnemy;

                                    var wasSelected = chara1.selected || chara2.selected;
                                    var wasSelectedUnit = (Game.selectedUnit === chara1 || Game.selectedUnit === chara2);

                                    // Clean up the two templars
                                    chara1.dieEffect = chara1.sound.death = null;
                                    chara1.die();
                                    chara2.dieEffect = chara2.sound.death = null;
                                    chara2.die();

                                    // Clean up from selection array immediately
                                    if (chara1.selected) {
                                        var idx1 = Game.allSelected.indexOf(chara1);
                                        if (idx1 !== -1) Game.allSelected.splice(idx1, 1);
                                    }
                                    if (chara2.selected) {
                                        var idx2 = Game.allSelected.indexOf(chara2);
                                        if (idx2 !== -1) Game.allSelected.splice(idx2, 1);
                                    }

                                    // Create cocoon/rift at the midpoint
                                    var cocoon = new ProtossBuilding[unitType]({ x: midX, y: midY, isEnemy: isEnemy });

                                    // Select cocoon
                                    if (wasSelected) Game.allSelected.push(cocoon);
                                    if (wasSelectedUnit) Game.selectedUnit = cocoon;

                                    var duration = baseCost.time;
                                    if (Cheat.cwal) duration = 0;

                                    (function (c, ut, r) {
                                        Game.commandTimeout(function () {
                                            if (c.status != 'dead') {
                                                c.evolveTo(r[ut], [ut + 'Birth']);
                                            }
                                        }, duration * 100);
                                    })(cocoon, unitType, Race);

                                    cocoon.processing = {
                                        name: unitType,
                                        startTime: Game._clock,
                                        time: duration
                                    };
                                    if (globalThis.Multiplayer && !Game.replayFlag) {
                                        var cmd = {
                                            type: 'unit',
                                            uids: [chara1.id],
                                            name: unitType,
                                            duration: duration,
                                            evolve: 'archon'
                                        };
                                        if (!Game.replay.cmds[Game._clock]) Game.replay.cmds[Game._clock] = [];
                                        Game.replay.cmds[Game._clock].push(JSON.stringify(cmd));
                                    }
                                } else {
                                    // Payment failed, stop merging further pairs
                                    break;
                                }
                            }
                            // Refresh UI
                            setTimeout(Button.reset, 0);
                        });
                    }
                    else {
                        $('button.' + unitType).on('click', function () {
                            Unit.allOurUnits().filter(function (chara) {
                                return (chara.selected && chara.name == Game.selectedUnit.name);
                            }).forEach(function (chara) {
                                if (chara.processing) return;
                                if (Resource.paypal.call(chara, Resource.getCost(unitType))) {
                                    if (Resource.getCost(unitType) && Resource.getCost(unitType).time) {
                                        var duration = Resource.getCost(unitType).time;
                                        if (Cheat.cwal) duration = 0;
                                        Game.commandTimeout(function () {
                                            var evolved = new Race[unitType]({ x: chara.x, y: chara.y, isEnemy: chara.isEnemy });
                                            if (chara.selected) Game.addIntoAllSelected(evolved);
                                            if (chara == Game.selectedUnit) Game.changeSelectedTo(evolved);
                                            chara.dieEffect = chara.sound.death = null;
                                            chara.die();
                                            delete chara.processing;
                                        }, duration * 100);
                                        chara.processing = {
                                            name: unitType,
                                            startTime: Game._clock,
                                            time: duration
                                        };
                                        if (globalThis.Multiplayer && !Game.replayFlag) {
                                            var cmd = {
                                                type: 'unit',
                                                uids: [chara.id],
                                                name: unitType,
                                                duration: duration
                                            };
                                            if (!Game.replay.cmds[Game._clock]) Game.replay.cmds[Game._clock] = [];
                                            Game.replay.cmds[Game._clock].push(JSON.stringify(cmd));
                                        }
                                    }
                                }
                            });
                        });
                    }
                }
            });
        });
        [ZergBuilding, TerranBuilding, ProtossBuilding].forEach(function (Build) {
            var buildNames = [];
            for (var buildName in Build) {
                if (buildName != 'inherited' && buildName != 'super' && buildName != 'extends') {
                    buildNames.push(buildName);
                }
            }
            buildNames.forEach(function (buildName) {
                $('button.' + buildName).on('click', function () {
                    var owner = Game.selectedUnit;
                    if (!owner || owner.status == 'dead') return;
                    var cost = Resource.getCost(buildName);
                    var hasTime = cost && cost.time != null;
                    var duration = hasTime ? cost.time : 0;
                    if (Cheat.cwal) duration = 0;
                    var isZergMorph = (Build === ZergBuilding)
                        && (owner instanceof ZergBuilding)
                        && owner.items
                        && Object.keys(owner.items).some(function (k) {
                            return owner.items[k] && owner.items[k].name === buildName;
                        });
                    var buildType = Build[buildName];
                    if (isZergMorph) {
                        if (globalThis.Multiplayer && globalThis.Multiplayer.ON) {
                            globalThis.Multiplayer.sendLocalCommand({
                                type: 'build',
                                uids: [owner.id],
                                name: buildName,
                                buildType: 'Morph'
                            });
                            Button.reset();
                            return;
                        }
                        if (Resource.paypal.call(owner, cost)) {
                            //Zerg morph - uses queueJob for progress tracking
                            var egg = owner.evolveTo(Egg);
                            Button.queueJob(egg, {
                                name: buildName,
                                time: duration,
                                run: function () {
                                    return egg.evolveTo(buildType);
                                }
                            });
                            if (globalThis.Multiplayer && !Game.replayFlag) {
                                var cmd = {
                                    type: 'build',
                                    uids: [owner.id],
                                    name: buildName,
                                    buildType: 'Morph'
                                };
                                if (!Game.replay.cmds[Game._clock]) Game.replay.cmds[Game._clock] = [];
                                Game.replay.cmds[Game._clock].push(JSON.stringify(cmd));
                            }
                        }
                    }
                    else {
                        //Terran & Protoss build
                        if (owner instanceof Unit) {
                            $('div.GameLayer').attr('status', 'button');
                            Button.buildType = buildType;
                            Button.callback = function (location) {
                                var rect = Button._buildRectFor(buildType, location);
                                if (globalThis.Multiplayer && globalThis.Multiplayer.ON) {
                                    globalThis.Multiplayer.sendLocalCommand({
                                        type: 'build',
                                        uids: [owner.id],
                                        name: buildName,
                                        pos: { x: rect.x, y: rect.y },
                                        buildType: Build === ZergBuilding ? 'Zerg' : 
                                                   Build === TerranBuilding ? 'Terran' : 
                                                   Build === ProtossBuilding ? 'Protoss' : ''
                                    });
                                    Button.buildType = null;
                                    $('div.GameLayer').removeAttr('status');
                                    Button.callback = null;
                                    return;
                                }
                                Button._issueWorkerBuildOrder(owner, Build, buildType, buildName, rect, duration, cost);
                                Button.buildType = null;
                                if (globalThis.Multiplayer && !Game.replayFlag) {
                                    var cmd = {
                                        type: 'build',
                                        uids: [owner.id],
                                        name: buildName,
                                        pos: { x: rect.x, y: rect.y },
                                        buildType: Build === ZergBuilding ? 'Zerg' : 
                                                   Build === TerranBuilding ? 'Terran' : 
                                                   Build === ProtossBuilding ? 'Protoss' : ''
                                    };
                                    if (!Game.replay.cmds[Game._clock]) Game.replay.cmds[Game._clock] = [];
                                    Game.replay.cmds[Game._clock].push(JSON.stringify(cmd));
                                }
                            };
                        }
                        else {
                            if (globalThis.Multiplayer && globalThis.Multiplayer.ON) {
                                globalThis.Multiplayer.sendLocalCommand({
                                    type: 'build',
                                    uids: [owner.id],
                                    name: buildName,
                                    buildType: 'Morph'
                                });
                                Button.reset();
                                return;
                            }
                            Button.queueJob(owner, {
                                name: buildName,
                                time: duration,
                                run: function () {
                                    // Instantiate the unit/building at the owner's location
                                    let posX = owner.x + (owner.width - buildType.prototype.width) / 2;
                                    let posY = owner.y + (owner.height - buildType.prototype.height) / 2;
                                    if (Button._isTerranAddon && Button._isTerranAddon(buildName)) {
                                        const addonRect = Button._addonRectFor(owner, buildType);
                                        posX = addonRect.x;
                                        posY = addonRect.y;
                                    }
                                    return new buildType({
                                        x: posX,
                                        y: posY,
                                        isEnemy: owner.isEnemy
                                    });
                                }
                            });
                            if (globalThis.Multiplayer && !Game.replayFlag) {
                                var cmd = {
                                    type: 'build',
                                    uids: [owner.id],
                                    name: buildName,
                                    buildType: 'Morph'
                                };
                                if (!Game.replay.cmds[Game._clock]) Game.replay.cmds[Game._clock] = [];
                                Game.replay.cmds[Game._clock].push(JSON.stringify(cmd));
                            }
                        }
                    }
                });
            });
        });
    }
};
