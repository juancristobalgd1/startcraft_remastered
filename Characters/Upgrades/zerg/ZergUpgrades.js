Upgrade.EvolveBurrow={
    name:"EvolveBurrow",
    cost:{
        mine:100,
        gas:100,
        time:800
    },
    effect:function(){
        Magic.Burrow.enabled=Magic.Unburrow.enabled=true;
        delete Building.ZergBuilding.Hatchery.prototype.items[3];
        delete Building.ZergBuilding.Lair.prototype.items[3];
        delete Building.ZergBuilding.Hive.prototype.items[3];
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
        Magic.Load.enabled=Magic.UnloadAll.enabled=true;
        delete Building.ZergBuilding.Lair.prototype.items[4];
        delete Building.ZergBuilding.Hive.prototype.items[4];
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
        Zerg.Overlord.prototype.sight[Number(Boolean(isEnemy))]=385;
        delete Building.ZergBuilding.Lair.prototype.items[5];
        delete Building.ZergBuilding.Hive.prototype.items[5];
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
        Zerg.Overlord.prototype.speed[Number(Boolean(isEnemy))]=Unit.getSpeedMatrixBy(8);
        delete Building.ZergBuilding.Lair.prototype.items[6];
        delete Building.ZergBuilding.Hive.prototype.items[6];
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
        Zerg.Zergling.prototype.speed[Number(Boolean(isEnemy))]=Unit.getSpeedMatrixBy(18);
        delete Building.ZergBuilding.SpawningPool.prototype.items[1];
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
        Zerg.Zergling.prototype.attackInterval[Number(Boolean(isEnemy))]=600;
        delete Building.ZergBuilding.SpawningPool.prototype.items[2];
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
        Zerg.Zergling.prototype.damage[Number(Boolean(isEnemy))]+=1;
        Zerg.Ultralisk.prototype.damage[Number(Boolean(isEnemy))]+=3;
        Zerg.Broodling.prototype.damage[Number(Boolean(isEnemy))]+=1;
        this.level[Number(Boolean(isEnemy))]++;
        if (this.level[0]>=3) delete Building.ZergBuilding.EvolutionChamber.prototype.items[1];
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
        Zerg.Hydralisk.prototype.damage[Number(Boolean(isEnemy))]+=1;
        Zerg.Lurker.prototype.damage[Number(Boolean(isEnemy))]+=2;
        this.level[Number(Boolean(isEnemy))]++;
        if (this.level[0]>=3) delete Building.ZergBuilding.EvolutionChamber.prototype.items[2];
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
        Zerg.Drone.prototype.armor[Number(Boolean(isEnemy))]+=1;
        Zerg.Zergling.prototype.armor[Number(Boolean(isEnemy))]+=1;
        Zerg.Hydralisk.prototype.armor[Number(Boolean(isEnemy))]+=1;
        Zerg.Lurker.prototype.armor[Number(Boolean(isEnemy))]+=1;
        Zerg.Ultralisk.prototype.armor[Number(Boolean(isEnemy))]+=1;
        Zerg.Defiler.prototype.armor[Number(Boolean(isEnemy))]+=1;
        Zerg.Broodling.prototype.armor[Number(Boolean(isEnemy))]+=1;
        Zerg.InfestedTerran.prototype.armor[Number(Boolean(isEnemy))]+=1;
        this.level[Number(Boolean(isEnemy))]++;
        if (this.level[0]>=3) delete Building.ZergBuilding.EvolutionChamber.prototype.items[3];
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
        Zerg.Hydralisk.prototype.speed[Number(Boolean(isEnemy))]=Unit.getSpeedMatrixBy(13);
        delete Building.ZergBuilding.HydraliskDen.prototype.items[1];
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
        Zerg.Hydralisk.prototype.attackRange[Number(Boolean(isEnemy))]=175;
        delete Building.ZergBuilding.HydraliskDen.prototype.items[2];
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
        Magic.Lurker.enabled=true;
        delete Building.ZergBuilding.HydraliskDen.prototype.items[4];
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
        Zerg.Mutalisk.prototype.damage[Number(Boolean(isEnemy))]+=1;
        Zerg.Guardian.prototype.damage[Number(Boolean(isEnemy))]+=2;
        Zerg.Devourer.prototype.damage[Number(Boolean(isEnemy))]+=2;
        this.level[Number(Boolean(isEnemy))]++;
        if (this.level[0]>=3) {
            delete Building.ZergBuilding.Spire.prototype.items[1];
            delete Building.ZergBuilding.GreaterSpire.prototype.items[1];
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
        Zerg.Overlord.prototype.armor[Number(Boolean(isEnemy))]+=1;
        Zerg.Mutalisk.prototype.armor[Number(Boolean(isEnemy))]+=1;
        Zerg.Guardian.prototype.armor[Number(Boolean(isEnemy))]+=1;
        Zerg.Devourer.prototype.armor[Number(Boolean(isEnemy))]+=1;
        Zerg.Scourge.prototype.armor[Number(Boolean(isEnemy))]+=1;
        Zerg.Queen.prototype.armor[Number(Boolean(isEnemy))]+=1;
        this.level[Number(Boolean(isEnemy))]++;
        if (this.level[0]>=3) {
            delete Building.ZergBuilding.Spire.prototype.items[2];
            delete Building.ZergBuilding.GreaterSpire.prototype.items[2];
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
        Magic.SpawnBroodlings.enabled=true;
        delete Building.ZergBuilding.QueenNest.prototype.items[1];
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
        Magic.Ensnare.enabled=true;
        delete Building.ZergBuilding.QueenNest.prototype.items[2];
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
        Zerg.Queen.prototype.MP[Number(Boolean(isEnemy))]=250;
        delete Building.ZergBuilding.QueenNest.prototype.items[3];
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
        Zerg.Ultralisk.prototype.speed[Number(Boolean(isEnemy))]=Unit.getSpeedMatrixBy(18);
        delete Building.ZergBuilding.UltraliskCavern.prototype.items[1];
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
        Zerg.Ultralisk.prototype.armor[Number(Boolean(isEnemy))]+=2;
        delete Building.ZergBuilding.UltraliskCavern.prototype.items[2];
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
        Magic.Plague.enabled=true;
        delete Building.ZergBuilding.DefilerMound.prototype.items[1];
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
        Magic.Consume.enabled=true;
        delete Building.ZergBuilding.DefilerMound.prototype.items[2];
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
        Zerg.Defiler.prototype.MP[Number(Boolean(isEnemy))]=250;
        delete Building.ZergBuilding.DefilerMound.prototype.items[3];
    }
};
