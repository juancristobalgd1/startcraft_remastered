Building.ZergBuilding = Building.extends({
    constructorPlus: function (props) {
        this.sound = {
            selected: _$.lazyAudio('bgm/ZergBuilding.selected.wav'),
            death: _$.lazyAudio('bgm/ZergBuilding.death.wav')
        };
        GameMap.needRefresh = "MAP";
    },
    prototypePlus: {
        name: "ZergBuilding",
        portraitOffset: { x: 0, y: 168 },
        dieEffect: Burst.ZergBuildingBurst,
        requiresCreep: true,
        recover: function () {
            if (this.life < this.get('HP')) this.life += 0.5;
            if (this.magic != undefined && this.magic < this.get('MP')) this.magic += 0.5;
        }
    }
});
Building.TerranBuilding = Building.extends({
    constructorPlus: function (props) {
        this.sound = {
            selected: _$.lazyAudio('bgm/TerranBuilding.selected.wav'),
            death: _$.lazyAudio('bgm/TerranBuilding.death.wav')
        };
    },
    prototypePlus: {
        name: "TerranBuilding",
        portraitOffset: { x: 780, y: 56 },
        dieEffect: Burst.TerranBuildingBurst,
        recover: function () {
            if (this.magic != undefined && this.magic < this.get('MP')) this.magic += 0.5;
        }
    }
});
Building.ProtossBuilding = Building.extends({
    constructorPlus: function (props) {
        this.sound = {
            selected: _$.lazyAudio('bgm/ProtossBuilding.selected.wav'),
            death: _$.lazyAudio('bgm/ProtossBuilding.death.wav')
        };
    },
    prototypePlus: {
        name: "ProtossBuilding",
        plasma: 0,
        portraitOffset: { x: 900, y: 112 },
        dieEffect: Burst.ProtossBuildingBurst,
        requiresPower: true,
        isPowered: function () {
            if (!this.requiresPower || this.isEnemy) return true;
            return Building.ourBuildings.some((b) => {
                return b.name === 'Pylon' && b.status !== 'dead' && this.distanceFrom(b) < 350;
            });
        },
        recover: function () {
            if (this.requiresPower && !this.isPowered()) return;
            if (this.shield < this.get('SP')) this.shield += 0.5;
            if (this.magic != undefined && this.magic < this.get('MP')) this.magic += 0.5;
        }
    }
});
