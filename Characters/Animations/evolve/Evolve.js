//Evolve related
Animation.EvolveGroundUnit = class EvolveGroundUnit extends Animation {};
Object.assign(Animation.EvolveGroundUnit.prototype, {
    //Add basic unit info
    name: "Magic",
    imgPos: {
        burst: {
            left: [524, 562, 600, 638, 676, 714, 524, 562, 600, 638, 676, 714],
            top: [724, 724, 724, 724, 724, 724, 766, 766, 766, 766, 766, 766]
        }
    },
    width: 38,
    height: 43,
    frame: {
        burst: 12
    }
});
Animation.EvolveFlyingUnit = class EvolveFlyingUnit extends Animation {};
Object.assign(Animation.EvolveFlyingUnit.prototype, {
    //Add basic unit info
    name: "Magic",
    imgPos: {
        burst: {
            left: [438, 501, 564, 627, 690, 438, 501, 564, 627],
            top: [810, 810, 810, 810, 810, 855, 855, 855, 855]
        }
    },
    width: 63,
    height: 46,
    frame: {
        burst: 9
    }
});
Animation.SmallMutationComplete = class SmallMutationComplete extends Animation {};
Object.assign(Animation.SmallMutationComplete.prototype, {
    //Add basic unit info
    name: "ZergBuilding",
    imgPos: {
        burst: {
            left: [1316, 1476, 1636, 1796],
            top: [962, 962, 962, 962]
        }
    },
    width: 88,
    height: 84,
    frame: {
        burst: 4
    }
});
Animation.MiddleMutationComplete = class MiddleMutationComplete extends Animation {};
Object.assign(Animation.MiddleMutationComplete.prototype, {
    //Add basic unit info
    name: "ZergBuilding",
    imgPos: {
        burst: {
            left: [980, 1140, 1300],
            top: [1048, 1048, 1048]
        }
    },
    width: 120,
    height: 112,
    frame: {
        burst: 3
    }
});
Animation.LargeMutationComplete = class LargeMutationComplete extends Animation {};
Object.assign(Animation.LargeMutationComplete.prototype, {
    //Add basic unit info
    name: "ZergBuilding",
    imgPos: {
        burst: {
            left: [960, 1120, 1280],
            top: [1160, 1160, 1160]
        }
    },
    width: 160,
    height: 150,
    frame: {
        burst: 3
    }
});
Animation.ProtossBuildingComplete = class ProtossBuildingComplete extends Animation {};
Object.assign(Animation.ProtossBuildingComplete.prototype, {
    //Add basic unit info
    name: "ProtossBuilding",
    imgPos: {
        burst: {
            left: [486, 486, 486, 636, 636, 636],
            top: [648, 648, 648, 648, 648, 648]
        }
    },
    width: 152,
    height: 152,
    frame: {
        burst: 6
    }
});
