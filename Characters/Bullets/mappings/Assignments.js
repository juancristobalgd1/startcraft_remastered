
import Bullets from '../core/BulletsBase.js';
import { 
    Spooge, 
    Thorn, 
    Darts, 
    GreenBall, 
    PurpleCloud,
    Spore,
    DevilBall
} from '../zerg/ZergBullets.js';
import { 
    Flame, 
    VultureBall, 
    Missile, 
    SmallLaser,
    Laser,
    LongMissile,
    MultipleMissile,
    SingleMissile,
    Yamato
} from '../terran/TerranBullets.js';
import { 
    DragoonBall, 
    ArchonLightening, 
    ReaverBomb, 
    ScoutMissile, 
    Interceptor 
} from '../protoss/ProtossBullets.js';
import Zerg from '../../Zergs/core/ZergBase.js';
import Terran from '../../Terrans/core/TerranBase.js';
import Protoss from '../../Protosses/core/ProtossBase.js';
import Building from '../../Buildings/core/BuildingBase.js';
import Hero from '../../Heroes/core/HeroBase.js';

// Import all units to ensure they are loaded and attached to global namespaces
// Zerg Units
import '../../Zergs/ground/ZergGround.js';
import '../../Zergs/air/ZergAir.js';
import '../../Zergs/workers/ZergWorkers.js';
import '../../Zergs/support/ZergSupport.js';

// Terran Units
import '../../Terrans/infantry/TerranInfantry.js';
import '../../Terrans/vehicles/TerranVehicles.js';
import '../../Terrans/air/TerranAir.js';
import '../../Terrans/workers/TerranWorkers.js';

// Protoss Units
import '../../Protosses/ground/ProtossGround.js';
import '../../Protosses/air/ProtossAir.js';
import '../../Protosses/workers/ProtossWorkers.js';

// Hero Units
import '../../Heroes/units/HeroUnits.js';

// Mapping for apply, need to move it into Units.js
// Ensure Zerg objects exist before accessing
if (Zerg && Zerg.Drone) Zerg.Drone.prototype.Bullet = Spooge;
if (Zerg && Zerg.Hydralisk) Zerg.Hydralisk.prototype.Bullet = Spooge;
if (Zerg && Zerg.Lurker) Zerg.Lurker.prototype.Bullet = Thorn;
if (Zerg && Zerg.Mutalisk) Zerg.Mutalisk.prototype.Bullet = Darts;
if (Zerg && Zerg.Guardian) Zerg.Guardian.prototype.Bullet = GreenBall;
if (Zerg && Zerg.Devourer) Zerg.Devourer.prototype.Bullet = PurpleCloud;

if (Terran && Terran.Wraith && Terran.Wraith.prototype.attackMode) {
    if (Terran.Wraith.prototype.attackMode.flying) Terran.Wraith.prototype.attackMode.flying.Bullet = Missile;
    if (Terran.Wraith.prototype.attackMode.ground) Terran.Wraith.prototype.attackMode.ground.Bullet = SmallLaser;
}
if (Terran && Terran.BattleCruiser) Terran.BattleCruiser.prototype.Bullet = Laser;
if (Terran && Terran.Firebat) Terran.Firebat.prototype.Bullet = Flame;
if (Terran && Terran.Vulture) Terran.Vulture.prototype.Bullet = VultureBall;
if (Terran && Terran.Goliath && Terran.Goliath.prototype.attackMode) {
    if (Terran.Goliath.prototype.attackMode.flying) Terran.Goliath.prototype.attackMode.flying.Bullet = LongMissile;
}
if (Terran && Terran.Valkyrie) Terran.Valkyrie.prototype.Bullet = MultipleMissile;

if (Protoss && Protoss.Dragoon) Protoss.Dragoon.prototype.Bullet = DragoonBall;
if (Protoss && Protoss.Archon) Protoss.Archon.prototype.Bullet = ArchonLightening;
if (Protoss && Protoss.Reaver) Protoss.Reaver.prototype.Bullet = ReaverBomb;
if (Protoss && Protoss.Scout && Protoss.Scout.prototype.attackMode) {
    if (Protoss.Scout.prototype.attackMode.flying) Protoss.Scout.prototype.attackMode.flying.Bullet = ScoutMissile;
}
if (Protoss && Protoss.Arbiter) Protoss.Arbiter.prototype.Bullet = DragoonBall;
if (Protoss && Protoss.Carrier) Protoss.Carrier.prototype.Bullet = Interceptor;

if (Hero && Hero.HeroCruiser) Hero.HeroCruiser.prototype.Bullet = Yamato;
if (Hero && Hero.DevilHunter) Hero.DevilHunter.prototype.Bullet = DevilBall;

if (Building && Building.ZergBuilding && Building.ZergBuilding.SporeColony) {
    Building.ZergBuilding.SporeColony.prototype.Bullet = Spore;
}
if (Building && Building.TerranBuilding && Building.TerranBuilding.MissileTurret) {
    Building.TerranBuilding.MissileTurret.prototype.Bullet = SingleMissile;
}
if (Building && Building.ProtossBuilding && Building.ProtossBuilding.PhotonCannon) {
    Building.ProtossBuilding.PhotonCannon.prototype.Bullet = DragoonBall;
}
