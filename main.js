// Utils
import './Utils/jquery.min.js';
import './Utils/gFrame/core.js';
import './Utils/gFrame/utils.js';
import './Utils/gFrame/inheritance.js';
import './Utils/gFrame/audio.js';
import './Utils/gFrame/modules.js';
import './Utils/sourceLoader.js';

// Characters
import './Characters/Gobj.js';

// Bursts
import './Characters/Bursts/core/BurstBase.js';
import './Characters/Bursts/zerg/ZergEffects1.js';
import './Characters/Bursts/terran/TerranEffects.js';
import './Characters/Bursts/protoss/ProtossEffects1.js';
import './Characters/Bursts/protoss/ProtossEffects2.js';
import './Characters/Bursts/buildings/BuildingBursts.js';
import './Characters/Bursts/zerg/ZergDeaths.js';
import './Characters/Bursts/zerg/ZergBirths.js';
import './Characters/Bursts/neutral/NeutralBursts.js';

// Animations
import './Characters/Animations/core/AnimationBase.js';
import './Characters/Animations/magic/MagicSet1.js';
import './Characters/Animations/magic/MagicSet2.js';
import './Characters/Animations/magic/MagicSet3.js';
import './Characters/Animations/evolve/Evolve.js';
import './Characters/Animations/damage/Damage.js';

// Units
import './Characters/Units/core/UnitBase.js';
import './Characters/Units/core/AttackableUnitBase.js';

// Magics
import './Characters/Magics/core/MagicBase.js';
import './Characters/Magics/zerg/ZergMagic.js';
import './Characters/Magics/terran/TerranMagic.js';
import './Characters/Magics/protoss/ProtossMagic.js';

// Upgrades
import './Characters/Upgrades/core/UpgradeBase.js';
import './Characters/Upgrades/terran/TerranUpgrades.js';
import './Characters/Upgrades/zerg/ZergUpgrades.js';
import './Characters/Upgrades/protoss/ProtossUpgrades.js';

// Buildings
import './Characters/Buildings/core/BuildingBase.js';
import './Characters/Buildings/core/BuildingRaces.js';
import './Characters/Buildings/core/BuildingAttackable.js';
import './Characters/Buildings/zerg/ZergCore1.js';
import './Characters/Buildings/zerg/ZergCore2.js';
import './Characters/Buildings/zerg/ZergSpecial.js';
import './Characters/Buildings/zerg/ZergEvolve.js';
import './Characters/Buildings/terran/TerranCore1.js';
import './Characters/Buildings/terran/TerranCore2.js';
import './Characters/Buildings/terran/TerranAddons.js';
import './Characters/Buildings/terran/TerranSpecial.js';
import './Characters/Buildings/protoss/ProtossCore1.js';
import './Characters/Buildings/protoss/ProtossTech1.js';
import './Characters/Buildings/protoss/ProtossTech2.js';
import './Characters/Buildings/protoss/ProtossSpecial.js';

// Breeds
import './Characters/Zergs/core/ZergBase.js';
import './Characters/Zergs/workers/ZergWorkers.js';
import './Characters/Zergs/ground/ZergGround.js';
import './Characters/Zergs/air/ZergAir.js';
import './Characters/Zergs/support/ZergSupport.js';

import './Characters/Terrans/core/TerranBase.js';
import './Characters/Terrans/workers/TerranWorkers.js';
import './Characters/Terrans/infantry/TerranInfantry.js';
import './Characters/Terrans/vehicles/TerranVehicles.js';
import './Characters/Terrans/air/TerranAir.js';

import './Characters/Protosses/core/ProtossBase.js';
import './Characters/Protosses/workers/ProtossWorkers.js';
import './Characters/Protosses/ground/ProtossGround.js';
import './Characters/Protosses/air/ProtossAir.js';

import './Characters/Breeds/Neutral.js';

// Heroes
import './Characters/Heroes/core/HeroBase.js';
import './Characters/Heroes/units/HeroUnits.js';
import './Characters/Heroes/post/HeroPost.js';

// Bullets
import './Characters/Bullets/core/BulletsBase.js';
import './Characters/Bullets/zerg/ZergBullets.js';
import './Characters/Bullets/terran/TerranBullets.js';
import './Characters/Bullets/protoss/ProtossBullets.js';
import './Characters/Bullets/mappings/Assignments.js';

// Buttons
import './Characters/Buttons/core/ButtonBase.js';
import './Characters/Buttons/menus/ButtonMenus.js';
import './Characters/Buttons/core/ButtonEquip.js';
import './Characters/Buttons/core/ButtonHandlers.js';

// Map
import './Characters/Map.js';

// GameRule
import './GameRule/Resource.js';

import './GameRule/Referees/core/RefereeBase.js';
import './GameRule/Referees/vision/RefereeVision.js';
import './GameRule/Referees/movement/RefereeMovement.js';
import './GameRule/Referees/world/RefereeWorld.js';

import './GameRule/Levels/core/LevelsBase.js';
import './GameRule/Levels/sets/LevelsSet1.js';
import './GameRule/Levels/sets/LevelsSet2.js';
import './GameRule/Levels/sets/LevelsSet3.js';
import './GameRule/Levels/sets/LevelsSet4.js';
import './Characters/Upgrades/core/RPGUpgrades.js';

import Game from './GameRule/Games/core/GameBase.js';
import './GameRule/Games/selection/GameSelection.js';

// Expose Game globally for legacy support and debugging
window.Game = Game;
import './GameRule/Games/ui/GameUI.js';
import './GameRule/Games/render/GameRender.js';
import './GameRule/Games/lifecycle/GameLifecycle.js';

import './GameRule/Cheat.js';
import './GameRule/Multiplayer.js';

// Controller
import './Controller/mouseController.js';
import './Controller/keyController.js';

// Initialize
// Wait for DOM to be ready and assets if necessary.
// The original code used $('body')[0].onload = function() { Game.init(); };
// We can use window.onload or DOMContentLoaded, but since we are module, defer is implied.
// However, Game.init() might depend on window load.
window.addEventListener('load', () => {
    // Ensure Game is available globally (it should be if defined in GameBase/GameLifecycle)
    if (window.Game && window.Game.init) {
        window.Game.init();
    } else {
        console.error("Game object not found!");
    }
});
