import Upgrade from '../core/UpgradeBase.js';
import Magic from '../../Magics/core/MagicBase.js';
import { EngineeringBay, Academy } from '../../Buildings/terran/TerranCore1.js';
import { MachineShop, ControlTower, ConvertOps, PhysicsLab } from '../../Buildings/terran/TerranAddons.js';
import { ScienceFacility, Armory } from '../../Buildings/terran/TerranCore2.js';
import Terran from '../../Terrans/core/TerranBase.js';
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
const addAttackModeStat = (obj, mode, key, idx, delta) => {
    const proto = obj && obj.prototype;
    const target = proto && proto.attackMode && proto.attackMode[mode] && proto.attackMode[mode][key];
    if (!target) return;
    target[idx] += delta;
};
const setAttackModeStat = (obj, mode, key, idx, value) => {
    const proto = obj && obj.prototype;
    const target = proto && proto.attackMode && proto.attackMode[mode] && proto.attackMode[mode][key];
    if (!target) return;
    target[idx] = value;
};
const delItem = (obj, key) => {
    const proto = obj && obj.prototype;
    if (proto && proto.items) delete proto.items[key];
};

Upgrade.UpgradeInfantryWeapons={
    name:"UpgradeInfantryWeapons",
    cost:{
        mine:[100,175,250],
        gas:[100,175,250],
        time:[2660,2980,3300]
    },
    level:[0,0],
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        addStat(Terran.Marine, 'damage', idx, 1);
        addStat(Terran.Firebat, 'damage', idx, 2);
        addStat(Terran.Ghost, 'damage', idx, 1);
        this.level[idx]++;
        if (this.level[0]>=3) delItem(EngineeringBay, 1);
    }
};
Upgrade.UpgradeInfantryArmors={
    name:"UpgradeInfantryArmors",
    cost:{
        mine:[100,175,250],
        gas:[100,175,250],
        time:[2660,2980,3300]
    },
    level:[0,0],
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        addStat(Terran.SCV, 'armor', idx, 1);
        addStat(Terran.Marine, 'armor', idx, 1);
        addStat(Terran.Firebat, 'armor', idx, 1);
        addStat(Terran.Ghost, 'armor', idx, 1);
        addStat(Terran.Medic, 'armor', idx, 1);
        addStat(Terran.Civilian, 'armor', idx, 1);
        this.level[idx]++;
        if (this.level[0]>=3) delItem(EngineeringBay, 2);
    }
};
Upgrade.ResearchU238Shells={
    name:"ResearchU238Shells",
    cost:{
        mine:150,
        gas:150,
        time:1000
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Terran.Marine, 'attackRange', idx, 175);
        delItem(Academy, 1);
    }
};
Upgrade.ResearchStimPackTech={
    name:"ResearchStimPackTech",
    cost:{
        mine:100,
        gas:100,
        time:800
    },
    effect:function(){
        if (Magic.StimPacks) Magic.StimPacks.enabled=true;
        delItem(Academy, 2);
    }
};
Upgrade.ResearchRestoration={
    name:"ResearchRestoration",
    cost:{
        mine:100,
        gas:100,
        time:800
    },
    effect:function(){
        if (Magic.Restoration) Magic.Restoration.enabled=true;
        delItem(Academy, 4);
    }
};
Upgrade.ResearchOpticalFlare={
    name:"ResearchOpticalFlare",
    cost:{
        mine:100,
        gas:100,
        time:1200
    },
    effect:function(){
        if (Magic.OpticalFlare) Magic.OpticalFlare.enabled=true;
        delItem(Academy, 5);
    }
};
Upgrade.ResearchCaduceusReactor={
    name:"ResearchCaduceusReactor",
    cost:{
        mine:150,
        gas:150,
        time:1660
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Terran.Medic, 'MP', idx, 250);
        delItem(Academy, 6);
    }
};
Upgrade.ResearchIonThrusters={
    name:"ResearchIonThrusters",
    cost:{
        mine:100,
        gas:100,
        time:1000
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Terran.Vulture, 'speed', idx, Unit.getSpeedMatrixBy(20));
        delItem(MachineShop, 1);
    }
};
Upgrade.ResearchSpiderMines={
    name:"ResearchSpiderMines",
    cost:{
        mine:100,
        gas:100,
        time:800
    },
    effect:function(){
        if (Magic.SpiderMines) Magic.SpiderMines.enabled=true;
        delItem(MachineShop, 2);
    }
};
Upgrade.ResearchSiegeTech={
    name:"ResearchSiegeTech",
    cost:{
        mine:150,
        gas:150,
        time:800
    },
    effect:function(){
        if (Magic.SeigeMode) Magic.SeigeMode.enabled=true;
        delItem(MachineShop, 3);
    }
};
Upgrade.ResearchCharonBoosters={
    name:"ResearchCharonBoosters",
    cost:{
        mine:150,
        gas:150,
        time:1330
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setAttackModeStat(Terran.Goliath, 'flying', 'attackRange', idx, 300);
        delItem(MachineShop, 4);
    }
};
Upgrade.ResearchCloakingField={
    name:"ResearchCloakingField",
    cost:{
        mine:150,
        gas:150,
        time:1000
    },
    effect:function(){
        if (Magic.Cloak) Magic.Cloak.enabled=true;
        delItem(ControlTower, 1);
    }
};
Upgrade.ResearchApolloReactor={
    name:"ResearchApolloReactor",
    cost:{
        mine:200,
        gas:200,
        time:1660
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Terran.Wraith, 'MP', idx, 250);
        delItem(ControlTower, 2);
    }
};
Upgrade.ResearchEMPShockwaves={
    name:"ResearchEMPShockwaves",
    cost:{
        mine:200,
        gas:200,
        time:1200
    },
    effect:function(){
        if (Magic.EMPShockwave) Magic.EMPShockwave.enabled=true;
        delItem(ScienceFacility, 1);
    }
};
Upgrade.ResearchIrradiate={
    name:"ResearchIrradiate",
    cost:{
        mine:150,
        gas:150,
        time:800
    },
    effect:function(){
        if (Magic.Irradiate) Magic.Irradiate.enabled=true;
        delItem(ScienceFacility, 2);
    }
};
Upgrade.ResearchTitanReactor={
    name:"ResearchTitanReactor",
    cost:{
        mine:150,
        gas:150,
        time:1660
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Terran.Vessel, 'MP', idx, 250);
        delItem(ScienceFacility, 3);
    }
};
Upgrade.ResearchLockdown={
    name:"ResearchLockdown",
    cost:{
        mine:200,
        gas:200,
        time:1000
    },
    effect:function(){
        if (Magic.Lockdown) Magic.Lockdown.enabled=true;
        delItem(ConvertOps, 1);
    }
};
Upgrade.ResearchPersonalCloaking={
    name:"ResearchPersonalCloaking",
    cost:{
        mine:100,
        gas:100,
        time:800
    },
    effect:function(){
        if (Magic.PersonalCloak) Magic.PersonalCloak.enabled=true;
        delItem(ConvertOps, 2);
    }
};
Upgrade.ResearchOcularImplants={
    name:"ResearchOcularImplants",
    cost:{
        mine:100,
        gas:100,
        time:1660
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Terran.Ghost, 'sight', idx, 385);
        delItem(ConvertOps, 4);
    }
};
Upgrade.ResearchMoebiusReactor={
    name:"ResearchMoebiusReactor",
    cost:{
        mine:150,
        gas:150,
        time:1660
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Terran.Ghost, 'MP', idx, 250);
        delItem(ConvertOps, 5);
    }
};
Upgrade.ResearchYamatoGun={
    name:"ResearchYamatoGun",
    cost:{
        mine:200,
        gas:200,
        time:1200
    },
    effect:function(){
        if (Magic.Yamato) Magic.Yamato.enabled=true;
        delItem(PhysicsLab, 1);
    }
};
Upgrade.ResearchColossusReactor={
    name:"ResearchColossusReactor",
    cost:{
        mine:150,
        gas:150,
        time:1600
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Terran.BattleCruiser, 'MP', idx, 250);
        delItem(PhysicsLab, 2);
    }
};
Upgrade.UpgradeVehicleWeapons={
    name:"UpgradeVehicleWeapons",
    cost:{
        mine:[100,175,250],
        gas:[100,175,250],
        time:[2660,2980,3300]
    },
    level:[0,0],
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        addStat(Terran.Vulture, 'damage', idx, 2);
        addStat(Terran.Tank, 'damage', idx, 3);
        addAttackModeStat(Terran.Goliath, 'ground', 'damage', idx, 2);
        addAttackModeStat(Terran.Goliath, 'flying', 'damage', idx, 4);
        this.level[idx]++;
        if (this.level[0]>=3) delItem(Armory, 1);
    }
};
Upgrade.UpgradeShipWeapons={
    name:"UpgradeShipWeapons",
    cost:{
        mine:[100,150,200],
        gas:[100,150,200],
        time:[2660,2980,3300]
    },
    level:[0,0],
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        addAttackModeStat(Terran.Wraith, 'ground', 'damage', idx, 1);
        addAttackModeStat(Terran.Wraith, 'flying', 'damage', idx, 2);
        addStat(Terran.BattleCruiser, 'damage', idx, 3);
        addStat(Terran.Valkyrie, 'damage', idx, 1);
        this.level[idx]++;
        if (this.level[0]>=3) delItem(Armory, 2);
    }
};
Upgrade.UpgradeVehicleArmors={
    name:"UpgradeVehicleArmors",
    cost:{
        mine:[100,175,250],
        gas:[100,175,250],
        time:[2660,2980,3300]
    },
    level:[0,0],
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        addStat(Terran.Vulture, 'armor', idx, 1);
        addStat(Terran.Tank, 'armor', idx, 1);
        addStat(Terran.Goliath, 'armor', idx, 1);
        this.level[idx]++;
        if (this.level[0]>=3) delItem(Armory, 4);
    }
};
Upgrade.UpgradeShipArmors={
    name:"UpgradeShipArmors",
    cost:{
        mine:[150,225,300],
        gas:[150,225,300],
        time:[2660,2980,3300]
    },
    level:[0,0],
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        addStat(Terran.Wraith, 'armor', idx, 1);
        addStat(Terran.Dropship, 'armor', idx, 1);
        addStat(Terran.BattleCruiser, 'armor', idx, 1);
        addStat(Terran.Vessel, 'armor', idx, 1);
        addStat(Terran.Valkyrie, 'armor', idx, 1);
        this.level[idx]++;
        if (this.level[0]>=3) delItem(Armory, 5);
    }
};
