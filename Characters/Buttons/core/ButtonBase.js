var Button = {
    callback: null,
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
        if (buildType && buildType.prototype) {
            var centerX = rect.x + rect.width / 2;
            var centerY = rect.y + rect.height / 2;
            if (buildType.prototype instanceof Building.ProtossBuilding && buildType.prototype.requiresPower) {
                var hasPower = Building.ourBuildings.some(function (b) {
                    return b.name === 'Pylon' && b.status !== 'dead' &&
                        Math.sqrt(Math.pow(b.posX() - centerX, 2) + Math.pow(b.posY() - centerY, 2)) < 350;
                });
                if (!hasPower) return false;
            }
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
    }
};
