import Upgrade from '../core/UpgradeBase.js';
import Magic from '../../Magics/core/MagicBase.js';
import { Hatchery, Lair, Hive, SpawningPool } from '../../Buildings/zerg/ZergCore1.js';
import { EvolutionChamber, HydraliskDen, Spire, GreaterSpire, QueenNest, UltraliskCavern, DefilerMound } from '../../Buildings/zerg/ZergCore2.js';
//import Zerg from '../../Zergs/core/ZergBase.js';
import { Zergling, Hydralisk, Lurker, Ultralisk, Broodling, InfestedTerran } from '../../Zergs/ground/ZergGround.js';
import { Mutalisk, Guardian, Devourer, Scourge } from '../../Zergs/air/ZergAir.js';
import { Drone } from '../../Zergs/workers/ZergWorkers.js';
import { Overlord, Queen, Defiler } from '../../Zergs/support/ZergSupport.js';
import Unit from '../../Units/core/UnitBase.js';

const addStat = (obj, key, idx, delta) => {
    const proto = obj && obj.prototype;
    if (!proto || !proto[key]) return;
    proto[key][idx] += delta;
};
const setStat = (obj, key, idx, value) => {
    const proto = obj && obj.prototype;
    if (!proto || !proto[key]) return;
    proto[key][idx] = value;
};
const delItem = (obj, key) => {
    const proto = obj && obj.prototype;
    if (proto && proto.items) delete proto.items[key];
};

Upgrade.EvolveBurrow={
    name:"EvolveBurrow",
    cost:{
        mine:100,
        gas:100,
        time:800
    },
    effect:function(){
        if (Magic.Burrow) Magic.Burrow.enabled=true;
        if (Magic.Unburrow) Magic.Unburrow.enabled=true;
        delItem(Hatchery, 3);
        delItem(Lair, 3);
        delItem(Hive, 3);
    }
};
Upgrade.EvolveVentralSacs={
    name:"EvolveVentralSacs",
    cost:{
        mine:200,
        gas:200,
        time:1600
    },
    effect:function(){
        if (Magic.Load) Magic.Load.enabled=true;
        if (Magic.UnloadAll) Magic.UnloadAll.enabled=true;
        delItem(Lair, 4);
        delItem(Hive, 4);
    }
};
Upgrade.EvolveAntennas={
    name:"EvolveAntennas",
    cost:{
        mine:150,
        gas:150,
        time:1330
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Overlord, 'sight', idx, 385);
        delItem(Lair, 5);
        delItem(Hive, 5);
    }
};
Upgrade.EvolvePneumatizedCarapace={
    name:"EvolvePneumatizedCarapace",
    cost:{
        mine:150,
        gas:150,
        time:1330
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Overlord, 'speed', idx, Unit.getSpeedMatrixBy(8));
        delItem(Lair, 6);
        delItem(Hive, 6);
    }
};
Upgrade.EvolveMetabolicBoost={
    name:"EvolveMetabolicBoost",
    cost:{
        mine:100,
        gas:100,
        time:1000
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Zergling, 'speed', idx, Unit.getSpeedMatrixBy(18));
        delItem(SpawningPool, 1);
    }
};
Upgrade.EvolveAdrenalGlands={
    name:"EvolveAdrenalGlands",
    cost:{
        mine:200,
        gas:200,
        time:1000
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Zergling, 'attackInterval', idx, 600);
        delItem(SpawningPool, 2);
    }
};
Upgrade.UpgradeMeleeAttacks={
    name:"UpgradeMeleeAttacks",
    cost:{
        mine:[100,150,200],
        gas:[100,150,200],
        time:[2660,2980,3300]
    },
    level:[0,0],
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        addStat(Zergling, 'damage', idx, 1);
        addStat(Ultralisk, 'damage', idx, 3);
        addStat(Broodling, 'damage', idx, 1);
        this.level[idx]++;
        if (this.level[0]>=3) delItem(EvolutionChamber, 1);
    }
};
Upgrade.UpgradeMissileAttacks={
    name:"UpgradeMissileAttacks",
    cost:{
        mine:[100,150,200],
        gas:[100,150,200],
        time:[2660,2980,3300]
    },
    level:[0,0],
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        addStat(Hydralisk, 'damage', idx, 1);
        addStat(Lurker, 'damage', idx, 2);
        this.level[idx]++;
        if (this.level[0]>=3) delItem(EvolutionChamber, 2);
    }
};
Upgrade.EvolveCarapace={
    name:"EvolveCarapace",
    cost:{
        mine:[150,225,300],
        gas:[150,225,300],
        time:[2660,2980,3300]
    },
    level:[0,0],
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        addStat(Drone, 'armor', idx, 1);
        addStat(Zergling, 'armor', idx, 1);
        addStat(Hydralisk, 'armor', idx, 1);
        addStat(Lurker, 'armor', idx, 1);
        addStat(Ultralisk, 'armor', idx, 1);
        addStat(Defiler, 'armor', idx, 1);
        addStat(Broodling, 'armor', idx, 1);
        addStat(InfestedTerran, 'armor', idx, 1);
        this.level[idx]++;
        if (this.level[0]>=3) delItem(EvolutionChamber, 3);
    }
};
Upgrade.EvolveMuscularAugments={
    name:"EvolveMuscularAugments",
    cost:{
        mine:100,
        gas:100,
        time:1000
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Hydralisk, 'speed', idx, Unit.getSpeedMatrixBy(13));
        delItem(HydraliskDen, 1);
    }
};
Upgrade.EvolveGroovedSpines={
    name:"EvolveGroovedSpines",
    cost:{
        mine:150,
        gas:150,
        time:1000
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Hydralisk, 'attackRange', idx, 175);
        delItem(HydraliskDen, 2);
    }
};
Upgrade.EvolveLurkerAspect={
    name:"EvolveLurkerAspect",
    cost:{
        mine:125,
        gas:125,
        time:1200
    },
    effect:function(){
        if (Magic.Lurker) Magic.Lurker.enabled=true;
        delItem(HydraliskDen, 4);
    }
};
Upgrade.UpgradeFlyerAttacks={
    name:"UpgradeFlyerAttacks",
    cost:{
        mine:[100,175,250],
        gas:[100,175,250],
        time:[2660,2980,3300]
    },
    level:[0,0],
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        addStat(Mutalisk, 'damage', idx, 1);
        addStat(Guardian, 'damage', idx, 2);
        addStat(Devourer, 'damage', idx, 2);
        this.level[idx]++;
        if (this.level[0]>=3) {
            delItem(Spire, 1);
            delItem(GreaterSpire, 1);
        }
    }
};
Upgrade.UpgradeFlyerCarapace={
    name:"UpgradeFlyerCarapace",
    cost:{
        mine:[150,225,300],
        gas:[150,225,300],
        time:[2660,2980,3300]
    },
    level:[0,0],
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        addStat(Overlord, 'armor', idx, 1);
        addStat(Mutalisk, 'armor', idx, 1);
        addStat(Guardian, 'armor', idx, 1);
        addStat(Devourer, 'armor', idx, 1);
        addStat(Scourge, 'armor', idx, 1);
        addStat(Queen, 'armor', idx, 1);
        this.level[idx]++;
        if (this.level[0]>=3) {
            delItem(Spire, 2);
            delItem(GreaterSpire, 2);
        }
    }
};
Upgrade.EvolveSpawnBroodling={
    name:"EvolveSpawnBroodling",
    cost:{
        mine:200,
        gas:200,
        time:800
    },
    effect:function(){
        if (Magic.SpawnBroodlings) Magic.SpawnBroodlings.enabled=true;
        delItem(QueenNest, 1);
    }
};
Upgrade.EvolveEnsnare={
    name:"EvolveEnsnare",
    cost:{
        mine:100,
        gas:100,
        time:800
    },
    effect:function(){
        if (Magic.Ensnare) Magic.Ensnare.enabled=true;
        delItem(QueenNest, 2);
    }
};
Upgrade.EvolveGameteMeiosis={
    name:"EvolveGameteMeiosis",
    cost:{
        mine:150,
        gas:150,
        time:1660
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Queen, 'MP', idx, 250);
        delItem(QueenNest, 3);
    }
};
Upgrade.EvolveAnabolicSynthesis={
    name:"EvolveAnabolicSynthesis",
    cost:{
        mine:200,
        gas:200,
        time:1330
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Ultralisk, 'speed', idx, Unit.getSpeedMatrixBy(18));
        delItem(UltraliskCavern, 1);
    }
};
Upgrade.EvolveChitinousPlating={
    name:"EvolveChitinousPlating",
    cost:{
        mine:150,
        gas:150,
        time:1330
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        addStat(Ultralisk, 'armor', idx, 2);
        delItem(UltraliskCavern, 2);
    }
};
Upgrade.EvolvePlague={
    name:"EvolvePlague",
    cost:{
        mine:200,
        gas:200,
        time:1000
    },
    effect:function(){
        if (Magic.Plague) Magic.Plague.enabled=true;
        delItem(DefilerMound, 1);
    }
};
Upgrade.EvolveConsume={
    name:"EvolveConsume",
    cost:{
        mine:100,
        gas:100,
        time:1000
    },
    effect:function(){
        if (Magic.Consume) Magic.Consume.enabled=true;
        delItem(DefilerMound, 2);
    }
};
Upgrade.EvolveMetasynapticNode={
    name:"EvolveMetasynapticNode",
    cost:{
        mine:150,
        gas:150,
        time:1660
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Defiler, 'MP', idx, 250);
        delItem(DefilerMound, 3);
    }
};
