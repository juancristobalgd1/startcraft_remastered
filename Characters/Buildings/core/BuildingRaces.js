import Building from './BuildingBase.js';
import _$ from '../../../Utils/gFrame/core.js';
import GameMap from '../../Map.js';
import { ZergBuildingBurst, TerranBuildingBurst, ProtossBuildingBurst } from '../../Bursts/buildings/BuildingBursts.js';

export class ZergBuilding extends Building {
    name = "ZergBuilding";
    source = "ZergBuilding";
    portraitOffset = { x: 0, y: 168 };
    dieEffect = ZergBuildingBurst;

    constructor(props) {
        super(props);
        this.sound = {
            selected: _$.lazyAudio('bgm/ZergBuilding.selected.wav'),
            death: _$.lazyAudio('bgm/ZergBuilding.death.wav')
        };
        GameMap.needRefresh = "MAP";
    }

    recover() {
        if (this.life < this.get('HP')) this.life += 0.5;
        if (this.magic != undefined && this.magic < this.get('MP')) this.magic += 0.5;
    }
}

export class MutationS extends ZergBuilding {
    name = "Mutation";
}
export class MutationM extends ZergBuilding {
    name = "Mutation";
}
export class MutationL extends ZergBuilding {
    name = "Mutation";
}

Building.MutationS = MutationS;
Building.MutationM = MutationM;
Building.MutationL = MutationL;
ZergBuilding.MutationS = MutationS;
ZergBuilding.MutationM = MutationM;
ZergBuilding.MutationL = MutationL;

export class Egg extends ZergBuilding {
    name = "Egg";
}
export class Cocoon extends ZergBuilding {
    name = "Cocoon";
}
export class LurkerCocoon extends ZergBuilding {
    name = "Cocoon";
}

Building.Egg = Egg;
Building.Cocoon = Cocoon;
Building.LurkerCocoon = LurkerCocoon;
ZergBuilding.Egg = Egg;
ZergBuilding.Cocoon = Cocoon;
ZergBuilding.LurkerCocoon = LurkerCocoon;

export class TerranBuilding extends Building {
    name = "TerranBuilding";
    source = "TerranBuilding";
    portraitOffset = { x: 780, y: 56 };
    dieEffect = TerranBuildingBurst;

    constructor(props) {
        super(props);
        this.sound = {
            selected: _$.lazyAudio('bgm/TerranBuilding.selected.wav'),
            death: _$.lazyAudio('bgm/TerranBuilding.death.wav')
        };
    }

    recover() {
        if (this.magic != undefined && this.magic < this.get('MP')) this.magic += 0.5;
    }
}

export class ProtossBuilding extends Building {
    name = "ProtossBuilding";
    source = "ProtossBuilding";
    plasma = 0;
    portraitOffset = { x: 900, y: 112 };
    dieEffect = ProtossBuildingBurst;

    constructor(props) {
        super(props);
        this.sound = {
            selected: _$.lazyAudio('bgm/ProtossBuilding.selected.wav'),
            death: _$.lazyAudio('bgm/ProtossBuilding.death.wav')
        };
    }

    recover() {
        if (this.requiresPower && !this.isPowered()) return;
        if (this.shield < this.get('SP')) this.shield += 0.5;
        if (this.magic != undefined && this.magic < this.get('MP')) this.magic += 0.5;
    }

    isPowered() {
        // Nexus, Pylon, and Assimilator don't need external power
        if (["Nexus", "Pylon", "Assimilator"].includes(this.name)) return true;
        // Check for any friendly active Pylon within power range (approx 400px)
        const pylons = this.isEnemy ? Building.enemyBuildings : Building.ourBuildings;
        return pylons.some(b =>
            b.name === "Pylon" && b.status !== "dead" &&
            Math.hypot(b.posX() - this.posX(), b.posY() - this.posY()) < 400
        );
    }
}

// Attach to Building for backward compatibility
Building.ZergBuilding = ZergBuilding;
Building.TerranBuilding = TerranBuilding;
Building.ProtossBuilding = ProtossBuilding;

if (typeof window !== 'undefined') {
    window.ZergBuilding = ZergBuilding;
    window.TerranBuilding = TerranBuilding;
    window.ProtossBuilding = ProtossBuilding;
}

