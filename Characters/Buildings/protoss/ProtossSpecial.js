Building.ProtossBuilding.Archon = Building.ProtossBuilding.extends({
    constructorPlus: function (props) {
        this.action = 7;
    },
    prototypePlus: {
        name: "Archon",
        source: "Archon",
        portrait: "Archon",
        imgPos: {
            dock: {
                left: [1340, 1460, 1580, 1700, 1820, 1940, -1, 1100, 1220],
                top: [1700, 1700, 1700, 1700, 1700, 1700, -1, 1700, 1700]
            }
        },
        width: 80,
        height: 80,
        frame: {
            dock: 6
        },
        HP: 10,
        SP: 350,
        armor: 0,
        plasma: 0,
        sight: 280,
        dieEffect: Burst.BigBlueExplode
    }
});
Building.ProtossBuilding.DarkArchon = Building.ProtossBuilding.extends({
    constructorPlus: function (props) {
        this.action = 7;
    },
    prototypePlus: {
        name: "DarkArchon",
        source: "DarkArchon",
        portrait: "DarkArchon",
        imgPos: {
            dock: {
                left: [1340, 1460, 1580, 1700, 1820, 1940, -1, 1100, 1220],
                top: [1220, 1220, 1220, 1220, 1220, 1220, -1, 1220, 1220]
            }
        },
        width: 80,
        height: 80,
        frame: {
            dock: 6
        },
        HP: 25,
        SP: 200,
        armor: 1,
        plasma: 0,
        sight: 350,
        dieEffect: Burst.BigBlueExplode
    }
});
Building.ProtossBuilding.Tranfer = Building.ProtossBuilding.extends({
    constructorPlus: function (props) {
        this.action = 7;
    },
    prototypePlus: {
        name: "Tranfer",
        imgPos: {
            dock: {
                left: [10, 74, 150, 234, 328, 418, -1, 10, 74, 150, 234, 328, 418],
                top: [722, 722, 722, 722, 722, 722, -1, 658, 658, 658, 658, 658, 658]
            }
        },
        width: 64,
        height: 64,
        frame: {
            dock: 6
        },
        HP: 200,
        SP: 200,
        armor: 0,
        plasma: 0,
        sight: 350
    }
});
