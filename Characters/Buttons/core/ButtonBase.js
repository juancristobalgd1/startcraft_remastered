import _$ from '../../../Utils/gFrame/core.js';
import '../../../Utils/gFrame/utils.js';
import GameMap from '../../Map.js';
import Unit from '../../Units/core/UnitBase.js';
import Building from '../../Buildings/core/BuildingBase.js';
import { ZergBuilding, TerranBuilding, ProtossBuilding } from '../../Buildings/core/BuildingRaces.js';
import Resource from '../../../GameRule/Resource.js';
import Animation from '../../Animations/core/AnimationBase.js';
import '../../Animations/evolve/Evolve.js';
import Game from '../../../GameRule/Games/core/GameBase.js';
import Referee from '../../../GameRule/Referees/core/RefereeBase.js';

const Button = {
    callback: null,
    reset: function () {
        if (Game && Game.changeSelectedTo && Game.selectedUnit) Game.changeSelectedTo(Game.selectedUnit);
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
            startTime: Game._clock,
            time: job.time
        };
        if (owner instanceof Building && owner.name == 'Construction' && owner.imgPos && owner.imgPos.step2 && owner.imgPos.step3 && job.time > 0) {
            // Logic moved to Building.animeFrame for dynamic updates
        }
        const checkCompletion = () => {
            if (!owner || owner.status == 'dead') {
                if (owner) delete owner.processing;
                return;
            }
            // Guard: processing may have been cleared externally
            if (!owner.processing) return;
            // Dynamic check for completion based on progress (which handles pauses)
            const elapsed = Game._clock - owner.processing.startTime;
            if (elapsed >= owner.processing.time) {
                let product;
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
            } else {
                // Not done yet (could be paused), check again in 100ms
                Game.commandTimeout(checkCompletion, 100);
            }
        };
        Game.commandTimeout(checkCompletion, job.time * 100);
        return true;
    },
    _cloneWaypointChain: function (node) {
        if (!node) return null;
        const copy = { x: node.x, y: node.y };
        if (node.next) copy.next = Button._cloneWaypointChain(node.next);
        return copy;
    },
    _applyRally: function (owner, product) {
        if (!owner || !owner.rallyPoint) return;
        if (!(product instanceof Unit)) return;
        if (product.status == 'dead') return;
        const dest = Button._cloneWaypointChain(owner.rallyPoint);
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
            const next = owner.productionQueue.shift();
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
    _getDummy: function (buildType) {
        if (!buildType) return {};
        if (buildType._dummy) return buildType._dummy;
        try {
            buildType._dummy = new buildType();
            return buildType._dummy;
        } catch (e) {
            return buildType.prototype || {};
        }
    },
    _buildRectFor: function (buildType, location) {
        const dummy = Button._getDummy(buildType);
        const w = dummy.width || 0;
        const h = dummy.height || 0;
        return {
            x: (location.x - w / 2) >> 0,
            y: (location.y - h / 2) >> 0,
            width: w,
            height: h
        };
    },
    _isBuildRectValid: function (rect, ignoreObj, margin, buildType) {
        if (!rect || !rect.width || !rect.height) return false;
        const map = GameMap.getCurrentMap();
        if (!map) return false;
        if (rect.x < 0 || rect.y < 0) return false;
        if ((rect.x + rect.width) > map.width) return false;
        if ((rect.y + rect.height) > map.height) return false;
        if (margin == null) margin = 2;
        if (buildType) {
            const dummy = Button._getDummy(buildType);
            const centerX = rect.x + rect.width / 2;
            const centerY = rect.y + rect.height / 2;
            if (Building.verifyBuildLocation) {
                if (!Building.verifyBuildLocation(dummy.name, centerX, centerY, false)) return false;
            }
        }
        return Unit.allUnits.concat(Building.allBuildings).every(function (chara) {
            if (!chara || chara.status == 'dead') return true;
            if (ignoreObj && chara === ignoreObj) return true;
            return !Button._rectsOverlap(rect, { x: chara.x, y: chara.y, width: chara.width, height: chara.height }, margin);
        });
    },
    _pickTerranConstruction: function (buildType) {
        const dummy = Button._getDummy(buildType);
        const w = dummy.width || 0;
        const h = dummy.height || 0;
        const m = Math.max(w, h);
        if (m <= 90) return 'ConstructionS';
        if (m <= 120) return 'ConstructionM';
        return 'ConstructionL';
    },
    _pickZergMutation: function (buildType) {
        const dummy = Button._getDummy(buildType);
        const w = dummy.width || 0;
        const h = dummy.height || 0;
        const m = Math.max(w, h);
        if (m <= 90) return 'MutationS';
        if (m <= 120) return 'MutationM';
        return 'MutationL';
    },
    _pickZergMutationComplete: function (buildType) {
        const dummy = Button._getDummy(buildType);
        const w = dummy.width || 0;
        const h = dummy.height || 0;
        const m = Math.max(w, h);
        if (m <= 90) return 'SmallMutationComplete';
        if (m <= 120) return 'MiddleMutationComplete';
        return 'LargeMutationComplete';
    },
    _spawnBuildingCompleteFx: function (building, buildType) {
        if (!building || building.status == 'dead') return;
        if (typeof Animation !== 'object') return;
        if (ZergBuilding && building instanceof ZergBuilding) {
            const fxName = buildType ? Button._pickZergMutationComplete(buildType) : null;
            if (fxName && Animation[fxName]) new Animation[fxName]({ x: building.posX(), y: building.posY() });
        }
        if (ProtossBuilding && building instanceof ProtossBuilding) {
            if (Animation.ProtossBuildingComplete) new Animation.ProtossBuildingComplete({ x: building.posX(), y: building.posY() });
        }
    },
    _notifyError: function (msg) {
        if (Referee && Referee.voice && Referee.voice.pError) Referee.voice.pError.play();
        if (msg && Game && Game.showMessage) Game.showMessage(msg);
    },
    _issueWorkerBuildOrder: function (worker, Build, buildType, buildName, rect, duration, cost) {
        if (!worker || worker.status == 'dead') return false;
        if (!rect || !rect.width || !rect.height) return false;
        const rectCenterX = rect.x + rect.width * 0.5;
        const rectCenterY = rect.y + rect.height * 0.5;
        const workerRadius = (typeof worker.radius == 'function') ? worker.radius() : (Math.min(worker.width, worker.height) * 0.5);
        const buildRadius = Math.min(rect.width, rect.height) * 0.5;
        const approachRange = Math.max(Unit.moveRange, workerRadius + buildRadius + 10);
        let started = false;
        const beginConstruction = function () {
            if (started) return;
            started = true;
            if (!worker || worker.status == 'dead') return;
            if (!Button._isBuildRectValid(rect, worker, 2, buildType)) {
                Button._notifyError('No se puede colocar aquí');
                return;
            }
            if (!Resource.paypal.call(worker, cost)) return;
            let placeholder;
            if (TerranBuilding && Build === TerranBuilding) {
                placeholder = new Build[Button._pickTerranConstruction(buildType)]({ x: rect.x, y: rect.y, isEnemy: worker.isEnemy });
                if (duration > 0) {
                    worker.processing = {
                        name: buildName,
                        startTime: Game._clock,
                        time: duration
                    };
                    Game.commandTimeout(function () {
                        if (!worker || worker.status == 'dead') return;
                        if (worker.processing && worker.processing.name === buildName) delete worker.processing;
                    }, duration * 100);
                }
            }
            else if (ProtossBuilding && Build === ProtossBuilding) {
                // Center the transfer animation
                var offsetX = (rect.width - 64) >> 1;
                var offsetY = (rect.height - 64) >> 1;
                placeholder = new Build.Tranfer({ x: rect.x + offsetX, y: rect.y + offsetY, isEnemy: worker.isEnemy });
            }
            else if (ZergBuilding && Build === ZergBuilding) {
                const wasSelected = worker.selected;
                const wasMain = worker === Game.selectedUnit;

                // Using centralized evolve logic for Drone -> Building
                import('../../Zergs/core/ZergEvolveLogic.js').then(EvolveLogic => {
                    EvolveLogic.default.mutate(worker, buildName);
                });
                return true;
            }
            else {
                placeholder = new Build[buildName]({ x: rect.x, y: rect.y, isEnemy: worker.isEnemy });
            }
            if (ZergBuilding && placeholder instanceof ZergBuilding) setTimeout(GameMap.drawMud, 0);
            if (duration <= 0) {
                const done = placeholder.evolveTo(buildType);
                Button._spawnBuildingCompleteFx(done, buildType);
                if (ZergBuilding && done instanceof ZergBuilding) setTimeout(GameMap.drawMud, 0);
                return;
            }
            Button.queueJob(placeholder, {
                name: buildName,
                time: duration,
                run: function () {
                    const done = placeholder.evolveTo(buildType);
                    Button._spawnBuildingCompleteFx(done, buildType);
                    if (ZergBuilding && done instanceof ZergBuilding) setTimeout(GameMap.drawMud, 0);
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
        const dummy = Button._getDummy(addonType);
        const w = dummy.width || 0;
        const h = dummy.height || 0;
        return {
            x: (owner.x + owner.width) >> 0,
            y: (owner.y + owner.height - h) >> 0,
            width: w,
            height: h
        };
    },
    equipButtonsForReplay: function () {
        const $ = globalThis.$;
        $('button[num="1"]').attr('class', 'Play').attr('disabled', true).show();
        $('button[num="2"]').attr('class', 'Pause').show();
        $('button[num="4"]').attr('class', 'SpeedUp').show();
        $('button[num="5"]').attr('class', 'SlowDown').show();
        //Bind callback for replay buttons
        $('button.Play').off('click').on('click', Button.playHandler);
        $('button.Pause').off('click').on('click', Button.pauseHandler);
        $('button.SpeedUp').off('click').on('click', Button.speedUpHandler);
        $('button.SlowDown').off('click').on('click', Button.slowDownHandler);
        //Bind tooltip callbacks
        $('div.panel_Control button').off('mouseover').on('mouseover', function (event) {
            $('div.tooltip_Box').css('right', window.innerWidth - event.clientX).css('bottom', window.innerHeight - event.clientY).show();
            $('div.tooltip_Box div.itemName')[0].innerHTML = this.className;
        });
        $('div.panel_Control button').off('mouseout').on('mouseout', function () {
            $('div.tooltip_Box').hide();
            $('div.tooltip_Box div.itemName')[0].innerHTML = '';
        });
    },
    playHandler: function () {
        Game.startAnimation();
        const $ = globalThis.$;
        $('button.Play').attr('disabled', true);
        $('button.Pause').attr('disabled', false);
    },
    pauseHandler: function () {
        Game.stopAnimation();
        const $ = globalThis.$;
        $('button.Pause').attr('disabled', true);
        $('button.Play').attr('disabled', false);
    },
    speedUpHandler: function () {
        if (Game.replayFlag) {
            const $ = globalThis.$;
            if (Game._frameInterval > 25) {
                Game._frameInterval /= 2;
                if (Game._frameInterval <= 25) $('button.SpeedUp').attr('disabled', true);
                Game.stopAnimation();
                Button.playHandler();
            }
            $('button.SlowDown').attr('disabled', false);
        }
    },
    slowDownHandler: function () {
        if (Game.replayFlag) {
            const $ = globalThis.$;
            if (Game._frameInterval < 400) {
                Game._frameInterval *= 2;
                if (Game._frameInterval >= 400) $('button.SlowDown').attr('disabled', true);
                Game.stopAnimation();
                Button.playHandler();
            }
            $('button.SpeedUp').attr('disabled', false);
        }
    }
};

if (typeof window !== 'undefined') {
    window.Button = Button;
}
export default Button;
