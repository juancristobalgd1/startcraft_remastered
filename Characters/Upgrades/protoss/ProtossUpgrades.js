import Upgrade from '../core/UpgradeBase.js';
import Magic from '../../Magics/core/MagicBase.js';
import { Forge, CyberneticsCore } from '../../Buildings/protoss/ProtossCore1.js';
import { CitadelOfAdun, RoboticsSupportBay, FleetBeacon, TemplarArchives } from '../../Buildings/protoss/ProtossTech1.js';
import { Observatory, ArbiterTribunal } from '../../Buildings/protoss/ProtossTech2.js';
//import Protoss from '../../Protosses/core/ProtossBase.js';
import Unit from '../../Units/core/UnitBase.js';
import { Zealot, Dragoon, Templar, DarkTemplar, Archon, DarkArchon, Reaver } from '../../Protosses/ground/ProtossGround.js';
import { Scout, Carrier, Arbiter, Corsair, Shuttle, Observer } from '../../Protosses/air/ProtossAir.js';
import { Probe } from '../../Protosses/workers/ProtossWorkers.js';

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
Upgrade.UpgradeGroundWeapons={
    name:"UpgradeGroundWeapons",
    cost:{
        mine:[100,150,200],
        gas:[100,150,200],
        time:[2660,2980,3300]
    },
    level:[0,0],
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        addStat(Zealot, 'damage', idx, 2);
        addStat(Dragoon, 'damage', idx, 2);
        addStat(Templar, 'damage', idx, 1);
        addStat(DarkTemplar, 'damage', idx, 3);
        addStat(Archon, 'damage', idx, 3);
        this.level[idx]++;
        if (this.level[0]>=3) delItem(Forge, 1);
    }
};
Upgrade.UpgradeGroundArmor={
    name:"UpgradeGroundArmor",
    cost:{
        mine:[100,175,250],
        gas:[100,175,250],
        time:[2660,2980,3300]
    },
    level:[0,0],
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        addStat(Probe, 'armor', idx, 1);
        addStat(Zealot, 'armor', idx, 1);
        addStat(Dragoon, 'armor', idx, 1);
        addStat(Templar, 'armor', idx, 1);
        addStat(DarkTemplar, 'armor', idx, 1);
        addStat(Archon, 'armor', idx, 1);
        addStat(DarkArchon, 'armor', idx, 1);
        addStat(Reaver, 'armor', idx, 1);
        this.level[idx]++;
        if (this.level[0]>=3) delItem(Forge, 2);
    }
};
Upgrade.UpgradePlasmaShields={
    name:"UpgradePlasmaShields",
    cost:{
        mine:[200,300,400],
        gas:[200,300,400],
        time:[2660,2980,3300]
    },
    level:[0,0],
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        var units = [Probe, Zealot, Dragoon, Templar, DarkTemplar, Archon, DarkArchon, Reaver, Scout, Carrier, Arbiter, Corsair, Shuttle, Observer];
        units.forEach(unit => {
            addStat(unit, 'plasma', idx, 1);
        });
        this.level[idx]++;
        if (this.level[0]>=3) delItem(Forge, 3);
    }
};
Upgrade.UpgradeAirWeapons={
    name:"UpgradeAirWeapons",
    cost:{
        mine:[100,175,250],
        gas:[100,175,250],
        time:[2660,2980,3300]
    },
    level:[0,0],
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        addAttackModeStat(Scout, 'ground', 'damage', idx, 1);
        addAttackModeStat(Scout, 'flying', 'damage', idx, 2);
        addStat(Carrier, 'damage', idx, 1);
        addStat(Arbiter, 'damage', idx, 1);
        addStat(Corsair, 'damage', idx, 1);
        this.level[idx]++;
        if (this.level[0]>=3) delItem(CyberneticsCore, 1);
    }
};
Upgrade.UpgradeAirArmor={
    name:"UpgradeAirArmor",
    cost:{
        mine:[150,225,300],
        gas:[150,225,300],
        time:[2660,2980,3300]
    },
    level:[0,0],
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        addStat(Scout, 'armor', idx, 1);
        addStat(Carrier, 'armor', idx, 1);
        addStat(Arbiter, 'armor', idx, 1);
        addStat(Corsair, 'armor', idx, 1);
        this.level[idx]++;
        if (this.level[0]>=3) delItem(CyberneticsCore, 2);
    }
};
Upgrade.DevelopSingularityCharge={
    name:"DevelopSingularityCharge",
    cost:{
        mine:150,
        gas:150,
        time:1660
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Dragoon, 'attackRange', idx, 210);
        delItem(CyberneticsCore, 3);
    }
};
Upgrade.DevelopLegEnhancements={
    name:"DevelopLegEnhancements",
    cost:{
        mine:150,
        gas:150,
        time:1330
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Zealot, 'speed', idx, Unit.getSpeedMatrixBy(14));
        delItem(CitadelOfAdun, 1);
    }
};
Upgrade.UpgradeScarabDamage={
    name:"UpgradeScarabDamage",
    cost:{
        mine:200,
        gas:200,
        time:1660
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Reaver, 'damage', idx, 125);
        delItem(RoboticsSupportBay, 1);
    }
};
Upgrade.IncreaseReaverCapacity={
    name:"IncreaseReaverCapacity",
    cost:{
        mine:200,
        gas:200,
        time:1660
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Reaver, 'scarabCapacity', idx, 10);
        delItem(RoboticsSupportBay, 2);
    }
};
Upgrade.DevelopGraviticDrive={
    name:"DevelopGraviticDrive",
    cost:{
        mine:200,
        gas:200,
        time:1660
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Shuttle, 'speed', idx, Unit.getSpeedMatrixBy(16));
        delItem(RoboticsSupportBay, 3);
    }
};
Upgrade.DevelopApialSensors={
    name:"DevelopApialSensors",
    cost:{
        mine:100,
        gas:100,
        time:1660
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Scout, 'sight', idx, 350);
        delItem(FleetBeacon, 1);
    }
};
Upgrade.DevelopGraviticThrusters={
    name:"DevelopGraviticThrusters",
    cost:{
        mine:200,
        gas:200,
        time:1660
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Scout, 'speed', idx, Unit.getSpeedMatrixBy(16));
        delItem(FleetBeacon, 2);
    }
};
Upgrade.IncreaseCarrierCapacity={
    name:"IncreaseCarrierCapacity",
    cost:{
        mine:100,
        gas:100,
        time:1000
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Carrier, 'interceptorCapacity', idx, 8);
        delItem(FleetBeacon, 3);
    }
};
Upgrade.DevelopDistruptionWeb={
    name:"DevelopDistruptionWeb",
    cost:{
        mine:200,
        gas:200,
        time:800
    },
    effect:function(){
        if (Magic.DisruptionWeb) Magic.DisruptionWeb.enabled=true;
        delItem(FleetBeacon, 4);
    }
};
Upgrade.DevelopArgusJewel={
    name:"DevelopArgusJewel",
    cost:{
        mine:100,
        gas:100,
        time:1660
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Corsair, 'MP', idx, 250);
        delItem(FleetBeacon, 5);
    }
};
Upgrade.DevelopPsionicStorm={
    name:"DevelopPsionicStorm",
    cost:{
        mine:200,
        gas:200,
        time:1200
    },
    effect:function(){
        if (Magic.PsionicStorm) Magic.PsionicStorm.enabled=true;
        delItem(TemplarArchives, 1);
    }
};
Upgrade.DevelopHallucination={
    name:"DevelopHallucination",
    cost:{
        mine:150,
        gas:150,
        time:800
    },
    effect:function(){
        if (Magic.Hallucination) Magic.Hallucination.enabled=true;
        delItem(TemplarArchives, 2);
    }
};
Upgrade.DevelopKhaydarinAmulet={
    name:"DevelopKhaydarinAmulet",
    cost:{
        mine:150,
        gas:150,
        time:1660
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Templar, 'MP', idx, 250);
        delItem(TemplarArchives, 3);
    }
};
Upgrade.DevelopMindControl={
    name:"DevelopMindControl",
    cost:{
        mine:200,
        gas:200,
        time:1200
    },
    effect:function(){
        if (Magic.MindControl) Magic.MindControl.enabled=true;
        delItem(TemplarArchives, 4);
    }
};
Upgrade.DevelopMaelStorm={
    name:"DevelopMaelStorm",
    cost:{
        mine:100,
        gas:100,
        time:1000
    },
    effect:function(){
        if (Magic.MaelStorm) Magic.MaelStorm.enabled=true;
        delItem(TemplarArchives, 5);
    }
};
Upgrade.DevelopArgusTalisman={
    name:"DevelopArgusTalisman",
    cost:{
        mine:150,
        gas:150,
        time:1660
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(DarkArchon, 'MP', idx, 250);
        delItem(TemplarArchives, 6);
    }
};
Upgrade.DevelopGraviticBooster={
    name:"DevelopGraviticBooster",
    cost:{
        mine:150,
        gas:150,
        time:1330
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Observer, 'speed', idx, Unit.getSpeedMatrixBy(12));
        delItem(Observatory, 1);
    }
};
Upgrade.DevelopSensorArray={
    name:"DevelopSensorArray",
    cost:{
        mine:150,
        gas:150,
        time:1330
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Observer, 'sight', idx, 385);
        delItem(Observatory, 2);
    }
};
Upgrade.DevelopRecall={
    name:"DevelopRecall",
    cost:{
        mine:150,
        gas:150,
        time:1200
    },
    effect:function(){
        if (Magic.Recall) Magic.Recall.enabled=true;
        delItem(ArbiterTribunal, 1);
    }
};
Upgrade.DevelopStasisField={
    name:"DevelopStasisField",
    cost:{
        mine:150,
        gas:150,
        time:1000
    },
    effect:function(){
        if (Magic.StasisField) Magic.StasisField.enabled=true;
        delItem(ArbiterTribunal, 2);
    }
};
Upgrade.DevelopKhaydarinCore={
    name:"DevelopKhaydarinCore",
    cost:{
        mine:150,
        gas:150,
        time:1660
    },
    effect:function(isEnemy){
        const idx = Number(Boolean(isEnemy));
        setStat(Arbiter, 'MP', idx, 250);
        delItem(ArbiterTribunal, 3);
    }
};
