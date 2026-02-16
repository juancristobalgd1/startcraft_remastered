Animation.ScannerSweep = Animation.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        //Add basic unit info
        name: "Magic",
        imgPos: {
            burst: {
                left: [1012, 1012, 1167, 1167, 1322, 1322, 1012, 1012, 1167, 1167, 1322, 1322],
                top: [2220, 2220, 2220, 2220, 2220, 2220, 2335, 2335, 2335, 2335, 2335, 2335]
            }
        },
        width: 155,
        height: 115,
        scale: 1.5,
        duration: 15600,
        sight: 350,
        frame: {
            burst: 12
        }
    }
});
Animation.Feedback = Animation.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        //Add basic unit info
        name: "Magic",
        imgPos: {
            burst: {
                left: [632, 702, 772, 842, 912, 982, 1052, 1122, 1192, 1262, 1332, 1402],
                top: [2872, 2872, 2872, 2872, 2872, 2872, 2872, 2872, 2872, 2872, 2872, 2872]
            }
        },
        width: 70,
        height: 70,
        above: true,
        autoSize: true,
        frame: {
            burst: 12
        }
    }
});
Animation.HellFire = Animation.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        //Add basic unit info
        name: "Magic",
        imgPos: {
            burst: {
                left: [655, 730, 805, 880, 955, 1030, 1105, 1180, 1255, 1330],
                top: [1284, 1284, 1284, 1284, 1284, 1284, 1284, 1284, 1284, 1284]
            }
        },
        width: 75,
        height: 75,
        above: true,
        autoSize: true,
        frame: {
            burst: 10
        }
    }
});
Animation.MindControl = Animation.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        //Add basic unit info
        name: "Magic",
        imgPos: {
            burst: {
                left: [658, 720, 782, 844, 906, 968, 1030, 1092, 1154, 1216, 1278, 1340],
                top: [1378, 1378, 1378, 1378, 1378, 1378, 1378, 1378, 1378, 1378, 1378, 1378]
            }
        },
        width: 62,
        height: 40,
        above: true,
        autoSize: true,
        frame: {
            burst: 12
        }
    }
});
Animation.RechargeShields = Animation.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        //Add basic unit info
        name: "Magic",
        imgPos: {
            burst: {
                left: [0, 64, 128, 192, 256, 320, 384, 448, 0, 64, 128, 192, 256, 320, 384, 448],
                top: [1432, 1432, 1432, 1432, 1432, 1432, 1432, 1432, 1496, 1496, 1496, 1496, 1496, 1496, 1496, 1496]
            }
        },
        width: 64,
        height: 64,
        above: true,
        autoSize: true,
        frame: {
            burst: 16
        }
    }
});
Animation.DisruptionWeb = Animation.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        //Add basic unit info
        name: "Magic",
        imgPos: {
            burst: {
                left: [1396, 1396, 1396, 1396, 1088, 1088, 1242, 1242, 1392, 1392, 1392, 1392],
                top: [1194, 1194, 1322, 1322, 1432, 1432, 1432, 1432, 1432, 1432, 1538, 1538]
            }
        },
        width: 154,
        height: 112,
        scale: 1.2,
        duration: 25000,
        frame: {
            burst: 12
        }
    }
});
Animation.DefensiveMatrix = Animation.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        //Add basic unit info
        name: "Magic",
        imgPos: {
            burst: {
                left: [1327, 1427, 1327, 1427, 1327],
                top: [1664, 1664, 1751, 1751, 1838]
            }
        },
        width: 90,
        height: 84,
        above: true,
        autoSize: true,
        duration: 60000,
        frame: {
            burst: 5
        }
    }
});
Animation.BlueShield = Animation.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        //Add basic unit info
        name: "Magic",
        imgPos: {
            burst: {
                left: [0, 130, 260, 390, 520, 0, 130, 260, 390, 520],
                top: [1560, 1560, 1560, 1560, 1560, 1690, 1690, 1690, 1690, 1690]
            }
        },
        width: 130,
        height: 130,
        above: true,
        autoSize: true,
        duration: 60000,
        frame: {
            burst: 10
        }
    }
});
Animation.MaelStorm = Animation.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        //Add basic unit info
        name: "Magic",
        imgPos: {
            burst: {
                left: [2, 70, 130, 195, 252, 312, 372, 430, 492, 554],
                top: [2870, 2870, 2870, 2870, 2870, 2870, 2870, 2870, 2870, 2870]
            }
        },
        width: 60,
        height: 60,
        above: true,
        autoSize: true,
        duration: 18000,//Normal 12 sec
        frame: {
            burst: 10
        }
    }
});
