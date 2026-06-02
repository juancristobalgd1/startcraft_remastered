import Game from '../../../GameRule/Games/core/GameBase.js';
import Resource from '../../../GameRule/Resource.js';
import Zerg from '../core/ZergBase.js';
import { ZergBuilding } from '../../Buildings/core/BuildingRaces.js';
import Unit from '../../Units/core/UnitBase.js';
import Building from '../../Buildings/core/BuildingBase.js';

const ZergEvolveLogic = {
    // Larva -> Egg -> Target Unit
    morphLarva: function (larva, targetUnitName) {
        const cost = Resource.getCost(targetUnitName);
        if (!cost) return;

        // Pay for the unit
        if (Resource.paypal.call(larva, cost)) {
            const x = larva.posX();
            const y = larva.posY();
            const isEnemy = larva.isEnemy;

            // Remove larva and create Egg
            larva.die();
            const egg = new ZergBuilding.Egg({ x, y, isEnemy });

            // Set up production in the Egg
            egg.processing = {
                startTime: Game._clock,
                time: cost.time,
                name: targetUnitName
            };

            // Transition Egg to Unit
            Game.commandTimeout(() => {
                if (egg.status !== "dead") {
                    egg.die();
                    const unitClass = Zerg[targetUnitName];
                    const newUnit = new unitClass({ x, y, isEnemy });
                }
            }, cost.time * 100);
        }
    },

    // Drone/Building -> Mutation -> Target Building
    mutate: function (oldObj, targetBuildingName) {
        const cost = Resource.getCost(targetBuildingName);
        if (!cost) return;

        if (Resource.paypal.call(oldObj, cost)) {
            const x = oldObj.posX();
            const y = oldObj.posY();
            const isEnemy = oldObj.isEnemy;

            // Remove old object and create Mutation placeholder
            oldObj.die();
            const mutation = new ZergBuilding.MutationS({ x, y, isEnemy });
            mutation.name = "Mutation"; // Force display name

            // Set up mutation processing
            mutation.processing = {
                startTime: Game._clock,
                time: cost.time,
                name: targetBuildingName
            };

            // Transition Mutation to Building
            Game.commandTimeout(() => {
                if (mutation.status !== "dead") {
                    mutation.die();
                    const buildingClass = ZergBuilding[targetBuildingName];
                    const newBuilding = new buildingClass({ x, y, isEnemy });
                }
            }, cost.time * 100);
        }
    }
};

export default ZergEvolveLogic;
