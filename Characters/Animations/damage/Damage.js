//Damaged related
Animation.redFireL = class RedFireL extends Animation {};
Object.assign(Animation.redFireL.prototype, {
    //Add basic unit info
    name: "TerranBuilding",
    imgPos: {
        burst: {
            left: [14, 78, 142, 206, 270, 334, 398, 462, 526, 590, 654, 718],
            top: [546, 546, 546, 546, 546, 546, 546, 546, 546, 546, 546, 546]
        }
    },
    width: 40,//64N+14
    height: 70,
    above: true,
    //Keep playing until killed
    forever: true,
    frame: {
        burst: 12
    }
});
Animation.redFireM = class RedFireM extends Animation {};
Object.assign(Animation.redFireM.prototype, {
    //Add basic unit info
    name: "TerranBuilding",
    imgPos: {
        burst: {
            left: [14, 78, 142, 206, 270, 334, 398, 462, 526, 590, 654, 718],
            top: [632, 632, 632, 632, 632, 632, 632, 632, 632, 632, 632, 632]
        }
    },
    width: 40,//64N+14
    height: 70,
    above: true,
    forever: true,
    frame: {
        burst: 12
    }
});
Animation.redFireR = class RedFireR extends Animation {};
Object.assign(Animation.redFireR.prototype, {
    //Add basic unit info
    name: "TerranBuilding",
    imgPos: {
        burst: {
            left: [10, 74, 138, 202, 266, 330, 394, 458, 522, 586, 650, 714],
            top: [722, 722, 722, 722, 722, 722, 722, 722, 722, 722, 722, 722]
        }
    },
    width: 48,//64N+10
    height: 60,
    above: true,
    forever: true,
    frame: {
        burst: 12
    }
});
Animation.blueFireL = class BlueFireL extends Animation {};
Object.assign(Animation.blueFireL.prototype, {
    //Add basic unit info
    name: "ProtossBuilding",
    imgPos: {
        burst: {
            left: [14, 78, 142, 206, 270, 334, 398, 462, 526, 590, 654, 718],
            top: [424, 424, 424, 424, 424, 424, 424, 424, 424, 424, 424, 424]
        }
    },
    width: 40,//64N+14
    height: 70,
    above: true,
    forever: true,
    frame: {
        burst: 12
    }
});
Animation.blueFireM = class BlueFireM extends Animation {};
Object.assign(Animation.blueFireM.prototype, {
    //Add basic unit info
    name: "ProtossBuilding",
    imgPos: {
        burst: {
            left: [14, 78, 142, 206, 270, 334, 398, 462, 526, 590, 654, 718],
            top: [506, 506, 506, 506, 506, 506, 506, 506, 506, 506, 506, 506]
        }
    },
    width: 40,//64N+14
    height: 70,
    above: true,
    forever: true,
    frame: {
        burst: 12
    }
});
Animation.blueFireR = class BlueFireR extends Animation {};
Object.assign(Animation.blueFireR.prototype, {
    //Add basic unit info
    name: "ProtossBuilding",
    imgPos: {
        burst: {
            left: [10, 74, 138, 202, 266, 330, 394, 458, 522, 586, 650, 714],
            top: [588, 588, 588, 588, 588, 588, 588, 588, 588, 588, 588, 588]
        }
    },
    width: 48,//64N+10
    height: 60,
    above: true,
    forever: true,
    frame: {
        burst: 12
    }
});
Animation.bloodA = class BloodA extends Animation {};
Object.assign(Animation.bloodA.prototype, {
    //Add basic unit info
    name: "ZergBuilding",
    imgPos: {
        burst: {
            left: [0, 64, 128, 192, 256, 320, 384, 448, 512, 576, 640, 704],
            top: [1320, 1320, 1320, 1320, 1320, 1320, 1320, 1320, 1320, 1320, 1320, 1320]
        }
    },
    width: 64,
    height: 50,
    above: true,
    forever: true,
    frame: {
        burst: 12
    }
});
Animation.bloodB = class BloodB extends Animation {};
Object.assign(Animation.bloodB.prototype, {
    //Add basic unit info
    name: "ZergBuilding",
    imgPos: {
        burst: {
            left: [768, 832, 896, 960, 1024, 1088, 1152, 1216, 1280, 1344, 1408, 1472],
            top: [1320, 1320, 1320, 1320, 1320, 1320, 1320, 1320, 1320, 1320, 1320, 1320]
        }
    },
    width: 64,
    height: 50,
    above: true,
    forever: true,
    frame: {
        burst: 12
    }
});
Animation.bloodC = class BloodC extends Animation {};
Object.assign(Animation.bloodC.prototype, {
    //Add basic unit info
    name: "ZergBuilding",
    imgPos: {
        burst: {
            left: [0, 64, 128, 192, 256, 320, 384, 448, 512, 576, 640, 704],
            top: [1376, 1376, 1376, 1376, 1376, 1376, 1376, 1376, 1376, 1376, 1376, 1376]
        }
    },
    width: 64,
    height: 50,
    above: true,
    forever: true,
    frame: {
        burst: 12
    }
});
Animation.bloodD = class BloodD extends Animation {};
Object.assign(Animation.bloodD.prototype, {
    //Add basic unit info
    name: "ZergBuilding",
    imgPos: {
        burst: {
            left: [768, 832, 896, 960, 1024, 1088, 1152, 1216, 1280, 1344, 1408, 1472],
            top: [1376, 1376, 1376, 1376, 1376, 1376, 1376, 1376, 1376, 1376, 1376, 1376]
        }
    },
    width: 64,
    height: 50,
    above: true,
    forever: true,
    frame: {
        burst: 12
    }
});
