Button.equipButtonsFor = function (chara) {
    $('div.panel_Control button').removeAttr('class').removeAttr('disabled').removeAttr('style').off('click').off('mouseover').off('mouseout').html('').hide();
    if (chara.isEnemy || chara == {}) return;
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
                $('button[num="' + N + '"]').off('click').attr('class', chara.items[N].name).show();
                if (chara.items[N].condition && chara.items[N].condition() == false)
                    $('button[num="' + N + '"]').attr('disabled', true);
                else $('button[num="' + N + '"]').removeAttr('disabled');
                switch (chara.items[N].name) {
                    case 'SpiderMines':
                        $('button[num="' + N + '"]')[0].innerHTML = chara.spiderMines;
                        break;
                    case 'Scarab':
                        $('button[num="' + N + '"]')[0].innerHTML = chara.scarabNum;
                        break;
                    case 'Interceptor':
                        $('button[num="' + N + '"]')[0].innerHTML = chara.continuousAttack.count;
                        break;
                }
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
                if (Resource.paypal(Resource.getCost(grade))) {
                    if (Resource.getCost(grade) && Resource.getCost(grade).time) {
                        var owner = Game.selectedUnit;
                        var duration = Resource.getCost(grade).time;
                        if (Cheat.cwal) duration = 0;
                        Button.queueJob(owner, {
                            name: grade,
                            time: duration,
                            run: function () {
                                Upgrade[grade].effect();
                                Referee.voice.upgrade[Game.race.selected].play();
                                Button.reset();
                                Game.showMessage('Upgrade complete');
                            }
                        });
                    }
                    else Upgrade[grade].effect();
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
                    if (duration) {
                        if (chara.processing) return;
                        if (Resource.paypal.call(chara, Resource.getCost(magic))) {
                            if (Cheat.cwal) duration = 0;
                            setTimeout(function () {
                                Magic[magic].spell.call(chara);
                                delete chara.processing;
                            }, duration * 100);
                            chara.processing = {
                                name: magic,
                                startTime: new Date().getTime(),
                                time: duration
                            };
                        }
                    }
                    else {
                        if (Magic[magic].credit) Resource.creditBill = Resource.getCost(magic);
                        if (Resource.paypal.call(chara, Resource.getCost(magic))) {
                            Magic[magic].spell.call(chara);
                        }
                    }
                });
            });
        });
        var unitTypes = [];
        for (var unitType in Zerg) {
            unitTypes.push(unitType);
        }
        var exceptions = ['Guardian', 'Devourer'];
        unitTypes.forEach(function (unitType) {
            $('button.' + unitType).on('click', function () {
                Unit.allOurUnits().filter(function (chara) {
                    return (chara.selected && chara.name == Game.selectedUnit.name);
                }).forEach(function (chara) {
                    if (Resource.paypal(Resource.getCost(unitType))) {
                        var egg;
                        if (exceptions.indexOf(unitType) != -1) {
                            egg = chara.evolveTo(Building.ZergBuilding.Cocoon);
                        }
                        else {
                            egg = chara.evolveTo(Building.ZergBuilding.Egg);
                            if (unitType == 'Lurker') egg.action = 18;
                        }
                        var duration = Resource.getCost(unitType).time;
                        if (Cheat.cwal) duration = 0;
                        setTimeout(function () {
                            if (egg.status != 'dead') {
                                if (exceptions.indexOf(unitType) != -1) {
                                    egg.evolveTo(Zerg[unitType], [unitType + 'Birth']);
                                }
                                else {
                                    egg.evolveTo(Zerg[unitType], ['EggBirth', unitType + 'Birth']);
                                }
                            }
                        }, duration * 100);
                        egg.processing = {
                            name: unitType,
                            startTime: new Date().getTime(),
                            time: duration
                        };
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
                        if (Resource.paypal(Resource.getCost(unitType))) {
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
                                            unit = new Race[unitType]({ x: owner.x, y: owner.y });
                                        else
                                            unit = new Race[unitType]({ x: owner.x, y: owner.y + owner.height });
                                        return unit;
                                    }
                                });
                            }
                        }
                    });
                }
                else {
                    $('button.' + unitType).on('click', function () {
                        Unit.allOurUnits().filter(function (chara) {
                            return (chara.selected && chara.name == Game.selectedUnit.name);
                        }).forEach(function (chara) {
                            if (chara.processing) return;
                            if (Resource.paypal(Resource.getCost(unitType))) {
                                if (Resource.getCost(unitType) && Resource.getCost(unitType).time) {
                                    var duration = Resource.getCost(unitType).time;
                                    if (Cheat.cwal) duration = 0;
                                    setTimeout(function () {
                                        var evolved = new Race[unitType]({ x: chara.x, y: chara.y });
                                        if (chara.selected) Game.addIntoAllSelected(evolved);
                                        if (chara == Game.selectedUnit) Game.changeSelectedTo(evolved);
                                        chara.dieEffect = chara.sound.death = null;
                                        chara.die();
                                        delete chara.processing;
                                    }, duration * 100);
                                    chara.processing = {
                                        name: unitType,
                                        startTime: new Date().getTime(),
                                        time: duration
                                    };
                                }
                            }
                        });
                    });
                }
            });
        });
        [Building.ZergBuilding, Building.TerranBuilding, Building.ProtossBuilding].forEach(function (Build) {
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
                    var isZergMorph = (Build === Building.ZergBuilding)
                        && (owner instanceof Building.ZergBuilding)
                        && owner.items
                        && Object.keys(owner.items).some(function (k) {
                            return owner.items[k] && owner.items[k].name === buildName;
                        });
                    var buildType = Build[buildName];
                    if (!buildType) {
                        Button._notifyError('Operación inválida');
                        Button.reset();
                        return;
                    }
                    if (isZergMorph) {
                        if (!hasTime) {
                            Button._notifyError('Operación inválida');
                            Button.reset();
                            return;
                        }
                        if (Resource.paypal(cost)) {
                            var from = owner;
                            var wasSelected = from.selected;
                            var wasMain = from === Game.selectedUnit;
                            from.dieEffect = from.sound.death = null;
                            from.die();
                            var placeholder = new Build[Button._pickZergMutation(buildType)]({ x: from.x, y: from.y });
                            setTimeout(function () {
                                if (wasSelected) Game.addIntoAllSelected(placeholder);
                                if (wasMain) Game.changeSelectedTo(placeholder);
                            }, 0);
                            if (placeholder instanceof Building.ZergBuilding) setTimeout(GameMap.drawMud, 0);
                            if (duration <= 0) {
                                var done = placeholder.evolveTo(buildType);
                                Button._spawnBuildingCompleteFx(done, buildType);
                                if (done instanceof Building.ZergBuilding) setTimeout(GameMap.drawMud, 0);
                            }
                            else {
                                Button.queueJob(placeholder, {
                                    name: buildName,
                                    time: duration,
                                    run: function () {
                                        var done = placeholder.evolveTo(buildType);
                                        Button._spawnBuildingCompleteFx(done, buildType);
                                        if (done instanceof Building.ZergBuilding) setTimeout(GameMap.drawMud, 0);
                                        return done;
                                    }
                                });
                            }
                        }
                        Button.reset();
                        return;
                    }
                    var isTerranAddon = (Build === Building.TerranBuilding)
                        && (owner instanceof Building.TerranBuilding)
                        && owner.items
                        && Object.keys(owner.items).some(function (k) {
                            return owner.items[k] && owner.items[k].name === buildName;
                        })
                        && Button._isTerranAddon(buildName);
                    if (isTerranAddon) {
                        if (!hasTime) {
                            Button._notifyError('Operación inválida');
                            Button.reset();
                            return;
                        }
                        var rect = Button._addonRectFor(owner, buildType);
                        if (!Button._isBuildRectValid(rect, null, 0, buildType)) {
                            Button._notifyError('No se puede colocar aquí');
                            Button.reset();
                            return;
                        }
                        if (Resource.paypal(cost)) {
                            var placeholder = new Build[Button._pickTerranConstruction(buildType)]({ x: rect.x, y: rect.y });
                            if (duration <= 0) {
                                placeholder.evolveTo(buildType);
                            }
                            else {
                                Button.queueJob(placeholder, {
                                    name: buildName,
                                    time: duration,
                                    run: function () {
                                        return placeholder.evolveTo(buildType);
                                    }
                                });
                            }
                        }
                        Button.reset();
                        return;
                    }
                    var isWorker = (owner instanceof Unit) && (owner.name == 'SCV' || owner.name == 'Drone' || owner.name == 'Probe');
                    if (isWorker && Button.callback == null && hasTime) {
                        var worker = owner;
                        Button.callback = function (location) {
                            if (!worker || worker.status == 'dead') return;
                            var rect = Button._buildRectFor(buildType, location);
                            if (!Button._isBuildRectValid(rect, worker, 2, buildType)) {
                                Button._notifyError('No se puede colocar aquí');
                                return;
                            }
                            Button._issueWorkerBuildOrder(worker, Build, buildType, buildName, rect, duration, cost);
                        };
                        $('div.GameLayer').attr('status', 'button');
                        Button.reset();
                        return;
                    }
                    if (Resource.paypal(cost) && hasTime) {
                        Button.queueJob(owner, {
                            name: buildName,
                            time: duration,
                            run: function () {
                                var building = new Build[buildName]({ x: owner.x, y: owner.y });
                                if (building instanceof Building.ZergBuilding) setTimeout(GameMap.drawMud, 0);
                                return building;
                            }
                        });
                    }
                    Button.reset();
                });
            });
        });
        $('button.SetRallyPoint').on('click', function () {
            if (Button.callback == null) {
                Button.callback = function (location) {
                    var buildings = Building.ourBuildings.filter(function (b) {
                        return b.selected && b.status != 'dead';
                    });
                    if (!buildings.length && (Game.selectedUnit instanceof Building) && Game.selectedUnit.status != 'dead') {
                        buildings = [Game.selectedUnit];
                    }
                    buildings.forEach(function (b) {
                        if (keyController.shift && b.rallyPoint) {
                            var tail = b.rallyPoint;
                            while (tail.next) tail = tail.next;
                            tail.next = { x: location.x, y: location.y };
                        }
                        else {
                            b.rallyPoint = { x: location.x, y: location.y };
                        }
                    });
                };
                $('div.GameLayer').attr('status', 'button');
            }
            else {
                $('div.GameLayer').removeAttr('status');
                Button.callback = null;
            }
        });
    }
    $('div.panel_Control button').on('mouseover', function (event) {
        var _name = this.className;
        $('div.tooltip_Box').css('right', innerWidth - event.clientX).css('bottom', innerHeight - event.clientY).show();
        $('div.tooltip_Box div.itemName')[0].innerHTML = _name;
        var cost = Resource.getCost(_name);
        if (cost) {
            $('div.cost').show();
            ['mine', 'gas', 'man', 'magic'].forEach(function (res) {
                if (cost[res]) {
                    $('div.cost *[class*=' + res + ']').show();
                    $('div.cost span.' + res + 'Num')[0].innerHTML = cost[res];
                }
                else $('div.cost *[class*=' + res + ']').hide();
            });
        }
    });
    $('div.panel_Control button').on('mouseout', function () {
        $('div.tooltip_Box').hide();
        $('div.tooltip_Box div.cost').hide();
        $('div.tooltip_Box div.itemName')[0].innerHTML = '';
        ['mine', 'gas', 'man', 'magic'].forEach(function (res) {
            $('div.cost span.' + res + 'Num')[0].innerHTML = '';
        });
    });
};
