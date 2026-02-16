var Button = {
    callback: null,
    /***************Functions***************/
    reset: function () {
        Game.changeSelectedTo(Game.selectedUnit);
    },
    queueJob: function (owner, job) {
        if (!owner || !job) return false;
        if (!owner.productionQueue) owner.productionQueue = [];
        if (owner.processing) {
            owner.productionQueue.push(job);
            return true;
        }
        return Button._startJob(owner, job);
    },
    _startJob: function (owner, job) {
        if (!owner || !job) return false;
        owner.processing = {
            name: job.name,
            startTime: new Date().getTime(),
            time: job.time
        };
        if (owner instanceof Building && owner.name == 'Construction' && owner.imgPos && owner.imgPos.step2 && owner.imgPos.step3 && job.time > 0) {
            setTimeout(function () {
                if (!owner || owner.status == 'dead') return;
                owner.imgPos.dock = owner.imgPos.step2;
            }, job.time * 100 / 3);
            setTimeout(function () {
                if (!owner || owner.status == 'dead') return;
                owner.imgPos.dock = owner.imgPos.step3;
            }, job.time * 200 / 3);
        }
        setTimeout(function () {
            if (!owner || owner.status == 'dead') {
                if (owner) delete owner.processing;
                return;
            }
            var product;
            if (typeof (job.run) == 'function') product = job.run();
            if (product) Button._applyRally(owner, product);
            delete owner.processing;
            setTimeout(Button.reset, 0);
            if (owner.status == 'dead' && (product instanceof Building)) {
                if (owner.productionQueue && owner.productionQueue.length) {
                    product.productionQueue = owner.productionQueue;
                }
                delete owner.productionQueue;
                Button._startNext(product);
            }
            else {
                Button._startNext(owner);
            }
        }, job.time * 100);
        return true;
    },
    _cloneWaypointChain: function (node) {
        if (!node) return null;
        var copy = { x: node.x, y: node.y };
        if (node.next) copy.next = Button._cloneWaypointChain(node.next);
        return copy;
    },
    _applyRally: function (owner, product) {
        if (!owner || !owner.rallyPoint) return;
        if (!(product instanceof Unit)) return;
        if (product.status == 'dead') return;
        var dest = Button._cloneWaypointChain(owner.rallyPoint);
        if (!dest) return;
        product.destination = dest;
        setTimeout(function () {
            if (product.status == 'dead') return;
            if (!product.destination) return;
            if (typeof product.moveTo == 'function') product.moveTo(product.destination.x, product.destination.y);
        }, 0);
    },
    _startNext: function (owner) {
        if (!owner) return;
        if (owner.productionQueue && owner.productionQueue.length) {
            var next = owner.productionQueue.shift();
            Button._startJob(owner, next);
        }
        else {
            delete owner.productionQueue;
        }
    },
    _rectsOverlap: function (a, b, margin) {
        if (!a || !b) return false;
        if (margin == null) margin = 0;
        return !(
            (a.x + a.width + margin) <= b.x ||
            (b.x + b.width + margin) <= a.x ||
            (a.y + a.height + margin) <= b.y ||
            (b.y + b.height + margin) <= a.y
        );
    },
    _buildRectFor: function (buildType, location) {
        var w = buildType.prototype.width || 0;
        var h = buildType.prototype.height || 0;
        return {
            x: (location.x - w / 2) >> 0,
            y: (location.y - h / 2) >> 0,
            width: w,
            height: h
        };
    },
    _isBuildRectValid: function (rect, ignoreObj, margin, buildType) {
        if (!rect || !rect.width || !rect.height) return false;
        var map = GameMap.getCurrentMap();
        if (!map) return false;
        if (rect.x < 0 || rect.y < 0) return false;
        if ((rect.x + rect.width) > map.width) return false;
        if ((rect.y + rect.height) > map.height) return false;
        if (margin == null) margin = 2;

        //Check power and creep requirements
        if (buildType && buildType.prototype) {
            var centerX = rect.x + rect.width / 2;
            var centerY = rect.y + rect.height / 2;
            //Protoss Power
            if (buildType.prototype instanceof Building.ProtossBuilding && buildType.prototype.requiresPower) {
                var hasPower = Building.ourBuildings.some(function (b) {
                    return b.name === 'Pylon' && b.status !== 'dead' &&
                        Math.sqrt(Math.pow(b.posX() - centerX, 2) + Math.pow(b.posY() - centerY, 2)) < 350;
                });
                if (!hasPower) return false;
            }
            //Zerg Creep
            if (buildType.prototype instanceof Building.ZergBuilding && buildType.prototype.requiresCreep) {
                if (typeof GameMap.isOnCreep === 'function' && !GameMap.isOnCreep(centerX, centerY)) return false;
            }
        }

        return Unit.allUnits.concat(Building.allBuildings).every(function (chara) {
            if (!chara || chara.status == 'dead') return true;
            if (ignoreObj && chara === ignoreObj) return true;
            return !Button._rectsOverlap(rect, { x: chara.x, y: chara.y, width: chara.width, height: chara.height }, margin);
        });
    },
    _pickTerranConstruction: function (buildType) {
        var w = buildType.prototype.width || 0;
        var h = buildType.prototype.height || 0;
        var m = Math.max(w, h);
        if (m <= 90) return 'ConstructionS';
        if (m <= 120) return 'ConstructionM';
        return 'ConstructionL';
    },
    _pickZergMutation: function (buildType) {
        var w = buildType.prototype.width || 0;
        var h = buildType.prototype.height || 0;
        var m = Math.max(w, h);
        if (m <= 90) return 'MutationS';
        if (m <= 120) return 'MutationM';
        return 'MutationL';
    },
    _pickZergMutationComplete: function (buildType) {
        var w = buildType.prototype.width || 0;
        var h = buildType.prototype.height || 0;
        var m = Math.max(w, h);
        if (m <= 90) return 'SmallMutationComplete';
        if (m <= 120) return 'MiddleMutationComplete';
        return 'LargeMutationComplete';
    },
    _spawnBuildingCompleteFx: function (building, buildType) {
        if (!building || building.status == 'dead') return;
        if (typeof Animation !== 'object') return;
        if (building instanceof Building.ZergBuilding) {
            var fxName = buildType ? Button._pickZergMutationComplete(buildType) : null;
            if (fxName && Animation[fxName]) new Animation[fxName]({ x: building.posX(), y: building.posY() });
        }
        if (building instanceof Building.ProtossBuilding) {
            if (Animation.ProtossBuildingComplete) new Animation.ProtossBuildingComplete({ x: building.posX(), y: building.posY() });
        }
    },
    _notifyError: function (msg) {
        if (Referee && Referee.voice && Referee.voice.pError) Referee.voice.pError.play();
        if (msg) Game.showMessage(msg);
    },
    _issueWorkerBuildOrder: function (worker, Build, buildType, buildName, rect, duration, cost) {
        if (!worker || worker.status == 'dead') return false;
        if (!rect || !rect.width || !rect.height) return false;
        var rectCenterX = rect.x + rect.width * 0.5;
        var rectCenterY = rect.y + rect.height * 0.5;
        var workerRadius = (typeof worker.radius == 'function') ? worker.radius() : (Math.min(worker.width, worker.height) * 0.5);
        var buildRadius = Math.min(rect.width, rect.height) * 0.5;
        var approachRange = Math.max(Unit.moveRange, workerRadius + buildRadius + 10);

        var started = false;
        var beginConstruction = function () {
            if (started) return;
            started = true;
            if (!worker || worker.status == 'dead') return;
            if (!Button._isBuildRectValid(rect, worker, 2, buildType)) {
                Button._notifyError('No se puede colocar aquí');
                return;
            }
            if (!Resource.paypal(cost)) return;

            var placeholder;
            if (Build === Building.TerranBuilding) {
                placeholder = new Build[Button._pickTerranConstruction(buildType)]({ x: rect.x, y: rect.y });
                if (duration > 0) {
                    worker.processing = {
                        name: buildName,
                        startTime: new Date().getTime(),
                        time: duration
                    };
                    setTimeout(function () {
                        if (!worker || worker.status == 'dead') return;
                        if (worker.processing && worker.processing.name === buildName) delete worker.processing;
                    }, duration * 100);
                }
            }
            else if (Build === Building.ProtossBuilding) {
                placeholder = new Build.Tranfer({ x: rect.x, y: rect.y });
            }
            else if (Build === Building.ZergBuilding) {
                var wasSelected = worker.selected;
                var wasMain = worker === Game.selectedUnit;
                worker.dieEffect = worker.sound.death = null;
                worker.die();
                placeholder = new Build[Button._pickZergMutation(buildType)]({ x: rect.x, y: rect.y });
                setTimeout(function () {
                    if (wasSelected) Game.addIntoAllSelected(placeholder);
                    if (wasMain) Game.changeSelectedTo(placeholder);
                }, 0);
            }
            else {
                placeholder = new Build[buildName]({ x: rect.x, y: rect.y });
            }

            if (placeholder instanceof Building.ZergBuilding) setTimeout(GameMap.drawMud, 0);
            if (duration <= 0) {
                var done = placeholder.evolveTo(buildType);
                Button._spawnBuildingCompleteFx(done, buildType);
                if (done instanceof Building.ZergBuilding) setTimeout(GameMap.drawMud, 0);
                return;
            }
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
        };

        worker.moveTo(rectCenterX, rectCenterY, approachRange, beginConstruction);
        return true;
    },
    _isTerranAddon: function (buildName) {
        return ['MachineShop', 'ControlTower', 'ComstatStation', 'NuclearSilo', 'PhysicsLab', 'ConvertOps'].indexOf(buildName) !== -1;
    },
    _addonRectFor: function (owner, addonType) {
        var w = addonType.prototype.width || 0;
        var h = addonType.prototype.height || 0;
        return {
            x: (owner.x + owner.width) >> 0,
            y: (owner.y + owner.height - h) >> 0,
            width: w,
            height: h
        };
    },
    //Equip all buttons for unit
    equipButtonsFor: function (chara) {
        //Clear all buttons
        $('div.panel_Control button').removeAttr('class').removeAttr('disabled').removeAttr('style').off('click').off('mouseover').off('mouseout').html('').hide();
        //Filter out enemy
        if (chara.isEnemy || chara == {}) return;
        //Add button press sound
        $('div.panel_Control button').on('click', () => {
            Referee.voice.button.play();
        });
        //Show buttons
        if (chara instanceof Unit) {
            $('button[num="1"]').attr('class', 'move').show();
            $('button[num="2"]').attr('class', 'stop').show();
            $('button[num="4"]').attr('class', 'patrol').show();
            $('button[num="5"]').attr('class', 'hold').show();
            if (Game.selectedUnit.hold) $('button.hold').css('border-color', 'red');//Add for hold tag
            //Bind callbacks
            $('button.move').on('click', Button.moveHandler);
            $('button.stop').on('click', Button.stopHandler);
            $('button.patrol').on('click', Button.patrolHandler);
            $('button.hold').on('click', Button.holdHandler);
        }
        if (chara.attack) {
            $('button[num="3"]').attr('class', 'attack').show();
            $('button.attack').on('click', Button.attackHandler);
        }
        //Add items
        if (chara.items) {
            for (var N in chara.items) {
                if (chara.items[N] != null) {
                    $('button[num="' + N + '"]').off('click').attr('class', chara.items[N].name).show();
                    if (chara.items[N].condition && chara.items[N].condition() == false)
                        $('button[num="' + N + '"]').attr('disabled', true);
                    else $('button[num="' + N + '"]').removeAttr('disabled');
                    //Exceptions: need mark numbers on button
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
            //Bind basic callbacks
            $('button.Cancel').on('click', function () {
                //Reset menu by reselect unit
                Button.reset();
            });
            $('button.SelectLarva').on('click', function () {
                var larvas = Game.selectedUnit.larvas;
                if (larvas) {
                    larvas = larvas.filter(function (chara) {
                        return chara.status != 'dead';
                    });
                    //If found alive larva
                    if (larvas.length) {
                        Game.unselectAll();
                        Game.addIntoAllSelected(larvas, true);
                        if (larvas[0] instanceof Gobj) {
                            Game.changeSelectedTo(larvas[0]);
                            //Sound effect
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
            //Upgrade callbacks
            var upgrades = new Array();
            for (var grade in Upgrade) {
                upgrades.push(grade);
            }//Cannot use for-in bind together
            upgrades.forEach(function (grade) {
                $('button.' + grade).on('click', function () {
                    //Payment
                    if (Resource.paypal(Resource.getCost(grade))) {
                        if (Resource.getCost(grade) && Resource.getCost(grade).time) {
                            var owner = Game.selectedUnit;
                            var duration = Resource.getCost(grade).time;
                            //Cheat: Operation cwal
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
                        //Or will effect immediately
                        else Upgrade[grade].effect();
                    }
                });
            });
            //Magic callbacks
            var magics = [];
            for (var magic in Magic) {
                magics.push(magic);
            }//Cannot use for-in bind together
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
                        //For Scarab and Interceptor
                        if (duration) {
                            //Filter out when occupied
                            if (chara.processing) return;
                            //Payment: chara paypal cost
                            if (Resource.paypal.call(chara, Resource.getCost(magic))) {
                                //Cheat: Operation cwal
                                if (Cheat.cwal) duration = 0;
                                setTimeout(function () {
                                    Magic[magic].spell.call(chara);
                                    delete chara.processing;
                                }, duration * 100);
                                //Occupy flag
                                chara.processing = {
                                    name: magic,
                                    startTime: new Date().getTime(),//Game._clock,
                                    time: duration
                                };
                            }
                        }
                        else {
                            //Pay by credit card
                            if (Magic[magic].credit) Resource.creditBill = Resource.getCost(magic);
                            //Payment: chara paypal cost
                            if (Resource.paypal.call(chara, Resource.getCost(magic))) {
                                Magic[magic].spell.call(chara);
                            }
                        }
                    });
                });
            });

            //Unit callbacks:
            //For Zerg units
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
                        //Payment
                        if (Resource.paypal(Resource.getCost(unitType))) {
                            //Evolve as egg
                            var egg;
                            //Evolve as cocoon
                            if (exceptions.indexOf(unitType) != -1) {
                                egg = chara.evolveTo(Building.ZergBuilding.Cocoon);
                            }
                            else {
                                egg = chara.evolveTo(Building.ZergBuilding.Egg);
                                if (unitType == 'Lurker') egg.action = 18;
                            }
                            //Calculate duration
                            var duration = Resource.getCost(unitType).time;
                            //Cheat: Operation cwal
                            if (Cheat.cwal) duration = 0;
                            setTimeout(function () {
                                if (egg.status != 'dead') {
                                    //Evolve
                                    if (exceptions.indexOf(unitType) != -1) {
                                        //Cocoon
                                        egg.evolveTo(Zerg[unitType], [unitType + 'Birth']);
                                    }
                                    else {
                                        //Egg
                                        egg.evolveTo(Zerg[unitType], ['EggBirth', unitType + 'Birth']);
                                    }
                                }
                            }, duration * 100);
                            //Processing flag on egg
                            egg.processing = {
                                name: unitType,
                                startTime: new Date().getTime(),//Game._clock,
                                time: duration
                            };
                        }
                    });
                });
            });
            //For Terran and Protoss units
            [Terran, Protoss].forEach(function (Race) {
                var unitTypes = [];
                for (var unitType in Race) {
                    unitTypes.push(unitType);
                }//Cannot use for-in bind together
                var exceptions = ['Lurker', 'Guardian', 'Devourer', 'Archon', 'DarkArchon'];
                unitTypes.forEach(function (unitType) {
                    //Unit type isn't in exceptions
                    if (exceptions.indexOf(unitType) == -1) {
                        $('button.' + unitType).on('click', function () {
                            //Payment
                            if (Resource.paypal(Resource.getCost(unitType))) {
                                if (Resource.getCost(unitType) && Resource.getCost(unitType).time) {
                                    var owner = Game.selectedUnit;
                                    var duration = Resource.getCost(unitType).time;
                                    //Cheat: Operation cwal
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
                    //Exception units
                    else {
                        $('button.' + unitType).on('click', function () {
                            Unit.allOurUnits().filter(function (chara) {
                                return (chara.selected && chara.name == Game.selectedUnit.name);
                            }).forEach(function (chara) {
                                //Filter out when occupied
                                if (chara.processing) return;
                                //Payment
                                if (Resource.paypal(Resource.getCost(unitType))) {
                                    if (Resource.getCost(unitType) && Resource.getCost(unitType).time) {
                                        var duration = Resource.getCost(unitType).time;
                                        //Cheat: Operation cwal
                                        if (Cheat.cwal) duration = 0;
                                        setTimeout(function () {
                                            //Evolve
                                            var evolved = new Race[unitType]({ x: chara.x, y: chara.y });
                                            if (chara.selected) Game.addIntoAllSelected(evolved);
                                            if (chara == Game.selectedUnit) Game.changeSelectedTo(evolved);
                                            //Hide die burst and sound for old unit, then die
                                            chara.dieEffect = chara.sound.death = null;
                                            chara.die();
                                            delete chara.processing;
                                        }, duration * 100);
                                        //Occupy flag
                                        chara.processing = {
                                            name: unitType,
                                            startTime: new Date().getTime(),//Game._clock,
                                            time: duration
                                        };
                                    }
                                }
                            });
                        });
                    }
                });
            });
            //Building callbacks
            [Building.ZergBuilding, Building.TerranBuilding, Building.ProtossBuilding].forEach(function (Build) {
                var buildNames = [];
                for (var buildName in Build) {
                    //Filter out noise
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

                        //Payment
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
        //Bind tooltip callbacks
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
    },

    /***************Buttons***************/
    basicZergMutations: {
        items: {
            '1': { name: 'Hatchery' },
            '2': {
                name: 'CreepColony', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Hatchery' || chara.name == 'Lair' || chara.name == 'Hive';
                    })
                }
            },
            '3': {
                name: 'Extractor', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Hatchery' || chara.name == 'Lair' || chara.name == 'Hive';
                    })
                }
            },
            '4': {
                name: 'SpawningPool', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Hatchery' || chara.name == 'Lair' || chara.name == 'Hive';
                    })
                }
            },
            '5': {
                name: 'EvolutionChamber', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Hatchery' || chara.name == 'Lair' || chara.name == 'Hive';
                    })
                }
            },
            '7': {
                name: 'HydraliskDen', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'SpawningPool';
                    })
                }
            },
            '9': { name: 'Cancel' }
        }
    },
    advancedZergMutations: {
        items: {
            '1': {
                name: 'Spire', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Lair' || chara.name == 'Hive';
                    })
                }
            },
            '2': {
                name: 'QueenNest', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Lair' || chara.name == 'Hive';
                    })
                }
            },
            '3': {
                name: 'NydusCanal', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Hive';
                    })
                }
            },
            '4': {
                name: 'UltraliskCavern', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Hive';
                    })
                }
            },
            '5': {
                name: 'DefilerMound', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Hive';
                    })
                }
            },
            '9': { name: 'Cancel' }
        }
    },
    basicTerranBuildings: {
        items: {
            '1': { name: 'CommandCenter' },
            '2': {
                name: 'SupplyDepot', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'CommandCenter';
                    })
                }
            },
            '3': {
                name: 'Refinery', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'CommandCenter';
                    })
                }
            },
            '4': {
                name: 'Barracks', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'CommandCenter';
                    })
                }
            },
            '5': {
                name: 'EngineeringBay', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'CommandCenter';
                    })
                }
            },
            '6': {
                name: 'MissileTurret', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'EngineeringBay';
                    })
                }
            },
            '7': {
                name: 'Academy', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Barracks';
                    })
                }
            },
            '8': {
                name: 'Bunker', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Barracks';
                    })
                }
            },
            '9': { name: 'Cancel' }
        }
    },
    advancedTerranBuildings: {
        items: {
            '1': {
                name: 'Factory', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Barracks';
                    })
                }
            },
            '2': {
                name: 'Starport', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Factory';
                    })
                }
            },
            '3': {
                name: 'ScienceFacility', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Starport';
                    })
                }
            },
            '4': {
                name: 'Armory', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Factory';
                    })
                }
            },
            '9': { name: 'Cancel' }
        }
    },
    basicProtossStructures: {
        items: {
            '1': { name: 'Nexus' },
            '2': {
                name: 'Pylon', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Nexus';
                    })
                }
            },
            '3': {
                name: 'Assimilator', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Nexus';
                    })
                }
            },
            '4': {
                name: 'Gateway', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Nexus';
                    })
                }
            },
            '5': {
                name: 'Forge', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Nexus';
                    })
                }
            },
            '6': {
                name: 'PhotonCannon', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Forge';
                    })
                }
            },
            '7': {
                name: 'CyberneticsCore', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Gateway';
                    })
                }
            },
            '8': {
                name: 'ShieldBattery', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'Gateway';
                    })
                }
            },
            '9': { name: 'Cancel' }
        }
    },
    advancedProtossStructures: {
        items: {
            '1': {
                name: 'RoboticsFacility', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'CyberneticsCore';
                    })
                }
            },
            '2': {
                name: 'StarGate', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'CyberneticsCore';
                    })
                }
            },
            '3': {
                name: 'CitadelOfAdun', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'CyberneticsCore';
                    })
                }
            },
            '4': {
                name: 'RoboticsSupportBay', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'RoboticsFacility';
                    })
                }
            },
            '5': {
                name: 'FleetBeacon', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'StarGate';
                    })
                }
            },
            '6': {
                name: 'TemplarArchives', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'CitadelOfAdun';
                    })
                }
            },
            '7': {
                name: 'Observatory', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'RoboticsFacility';
                    })
                }
            },
            '8': {
                name: 'ArbiterTribunal', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'StarGate';
                    }) && Building.ourBuildings.some(function (chara) {
                        return chara.name == 'TemplarArchives';
                    })
                }
            },
            '9': { name: 'Cancel' }
        }
    },

    /***************Handlers***************/
    //Move button
    moveHandler: function () {
        if (Button.callback == null) {
            Button.callback = 'move';
            $('div.GameLayer').attr('status', 'button');
        }
        else {
            //Cancel handler
            $('div.GameLayer').removeAttr('status');
            Button.callback = null;
        }
    },
    //Stop button
    stopHandler: function () {
        Unit.allOurUnits().filter(function (chara) {
            return chara.selected;
        }).forEach(function (chara) {
            if (chara.attack) chara.stopAttack();
            chara.dock();
            delete chara._patrolRoute;
            //Interrupt old destination routing
            if (chara.destination) {
                //Break possible dead lock
                if (chara.destination.next) chara.destination.next = undefined;
                delete chara.destination;
            }
        });
    },
    //Attack button
    attackHandler: function () {
        if (Button.callback == null) {
            Button.callback = 'attack';
            $('div.GameLayer').attr('status', 'button');
        }
        else {
            //Cancel handler
            $('div.GameLayer').removeAttr('status');
            Button.callback = null;
        }
    },
    //Patrol button
    patrolHandler: function () {
        if (Button.callback == null) {
            Button.callback = 'patrol';
            $('div.GameLayer').attr('status', 'button');
        }
        else {
            //Cancel handler
            $('div.GameLayer').removeAttr('status');
            Button.callback = null;
        }
    },
    //Gather button
    gatherHandler: function () {
        if (Button.callback == null) {
            Button.callback = function (location) {
                var target;
                var mx = location.x;
                var my = location.y;
                var minerals = Game.getInRangeOnes(mx, my, 55, false, true, false, function (chara) {
                    return (typeof Neutral !== 'undefined' && chara instanceof Neutral.Mineral);
                });
                if ((!minerals || !minerals.length) && Game.getInRangeOnes) {
                    minerals = Game.getInRangeOnes(mx, my, 180, false, true, false, function (chara) {
                        return (typeof Neutral !== 'undefined' && chara instanceof Neutral.Mineral);
                    });
                }
                if (minerals && minerals.length) {
                    minerals.sort(function (a, b) {
                        var dax = mx - a.posX(), day = my - a.posY();
                        var dbx = mx - b.posX(), dby = my - b.posY();
                        return dax * dax + day * day - (dbx * dbx + dby * dby);
                    });
                    target = minerals[0];
                }
                else {
                    if (GameMap && GameMap._spawnMineralNear) {
                        var spawned = GameMap._spawnMineralNear(mx, my);
                        if (spawned) target = spawned;
                    }
                }
                if (!(target instanceof Gobj) && Game.getInRangeOnes) {
                    var gasBuildings = Game.getInRangeOnes(mx, my, 120, false, false, null, function (chara) {
                        return (chara instanceof Building) && !chara.isEnemy &&
                            (['Refinery', 'Extractor', 'Assimilator'].indexOf(chara.name) !== -1);
                    });
                    if (gasBuildings && gasBuildings.length) {
                        gasBuildings.sort(function (a, b) {
                            var dax = mx - a.posX(), day = my - a.posY();
                            var dbx = mx - b.posX(), dby = my - b.posY();
                            return dax * dax + day * day - (dbx * dbx + dby * dby);
                        });
                        target = gasBuildings[0];
                    }
                }
                if (!(target instanceof Gobj)) {
                    target = Game.getSelectedOne(location.x, location.y, null, null, null, function (chara) {
                        return (chara instanceof Building) && (['Refinery', 'Extractor', 'Assimilator'].indexOf(chara.name) !== -1);
                    });
                }
                if (!(target instanceof Gobj)) {
                    if (Referee && Referee.voice && Referee.voice.pError) Referee.voice.pError.play();
                    return;
                }
                Unit.allOurUnits().filter(function (chara) {
                    return chara.selected && (chara.name == 'SCV' || chara.name == 'Drone' || chara.name == 'Probe');
                }).forEach(function (worker) {
                    var isShift = keyController && keyController.shift;
                    var isBusy = (worker.status !== 'dock' || worker.routingTimer || (worker.attack && worker.target && worker.target.status !== 'dead') || worker.gatherTimer);
                    if (isShift && isBusy && worker.commandQueue) {
                        worker.commandQueue.push({ type: 'gather', target: target });
                    }
                    else {
                        if (worker.gather) worker.gather(target);
                    }
                });
            };
            $('div.GameLayer').attr('status', 'button');
        }
        else {
            $('div.GameLayer').removeAttr('status');
            Button.callback = null;
        }
    },
    //Hold button
    holdHandler: function () {
        Button.stopHandler();
        //Freeze all our selected units
        Unit.allOurUnits().filter(function (chara) {
            return chara.selected;
        }).forEach(function (chara) {
            if (chara.hold) {
                delete chara.AI;
                delete chara.findNearbyTargets;
                delete chara.hold;
                Button.reset();
            }
            else {
                //Use the same AI as attackable building
                chara.AI = Building.Attackable.prototypePlus.AI;
                //Can only find target inside attack range instead of in sight
                chara.findNearbyTargets = Building.Attackable.prototypePlus.findNearbyTargets;
                chara.dock();
                chara.hold = true;
                Button.reset();
            }
        });
    },
    //Execute callback
    execute: function (event) {
        //Finish part II
        switch (Button.callback) {
            case 'move':
                mouseController.rightClick(event);
                break;
            case 'attack':
                mouseController.rightClick(event, true);
                break;
            case 'patrol':
                mouseController.rightClick(event, true);
                break;
            default:
                if (typeof (Button.callback) == 'function') {
                    //Mouse at (clickX,clickY)
                    var offset = $('#frontCanvas').offset();
                    var clickX = event.pageX - offset.left;
                    var clickY = event.pageY - offset.top;
                    var location = { x: clickX + GameMap.offsetX, y: clickY + GameMap.offsetY };
                    //Show right click cursor
                    new Burst.RightClickCursor(location);
                    //Call back with location info
                    Button.callback(location);
                }
        }
        $('div.GameLayer').removeAttr('status');
        Button.callback = null;
    }
};
