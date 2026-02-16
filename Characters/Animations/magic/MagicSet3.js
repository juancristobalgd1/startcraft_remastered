Animation.RedShield = Animation.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        //Add basic unit info
        name: "Magic",
        imgPos: {
            burst: {
                left: [650, 780, 910, 1040, 1170, 650, 780, 910, 1040, 1170],
                top: [1560, 1560, 1560, 1560, 1560, 1690, 1690, 1690, 1690, 1690]
            }
        },
        width: 130,
        height: 130,
        above: true,
        autoSize: true,
        duration: 18000,//Normal 12 sec
        frame: {
            burst: 10
        }
    }
});
Animation.BurningCircle = Animation.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        //Add basic unit info
        name: "Magic",
        imgPos: {
            burst: {
                left: [0, 112, 224, 336, 448, 560],
                top: [1820, 1820, 1820, 1820, 1820, 1820]
            }
        },
        width: 112,
        height: 126,
        above: true,
        autoSize: true,
        duration: 18000,
        frame: {
            burst: 6
        }
    }
});
Animation.Irradiate = Animation.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        //Add basic unit info
        name: "Magic",
        imgPos: {
            burst: {
                left: [668, 792, 916, 1042, 1172],
                top: [1820, 1820, 1820, 1820, 1820]
            }
        },
        width: 126,
        height: 110,
        above: true,
        autoSize: true,
        duration: 30000,
        frame: {
            burst: 5
        }
    }
});
Animation.Recall = Animation.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        //Add basic unit info
        name: "Magic",
        imgPos: {
            burst: {
                left: [0, 86, 188, 282, 386, 488, 588, 688, 788, 894],
                top: [1938, 1938, 1938, 1938, 1938, 1938, 1938, 1938, 1938, 1938]
            }
        },
        width: 98,
        height: 98,
        frame: {
            burst: 10
        }
    }
});
Animation.Ice = Animation.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        //Add basic unit info
        name: "Magic",
        imgPos: {
            burst: {
                left: [1024, 1164, 1304, 1444],
                top: [1942, 1942, 1942, 1942]
            }
        },
        width: 78,
        height: 88,
        above: true,
        autoSize: true,
        duration: 30000,
        frame: {
            burst: 4
        }
    }
});
Animation.EMPShockwave = Animation.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        //Add basic unit info
        name: "Magic",
        imgPos: {
            burst: {
                left: [0, 180, 356, 534, 708, 886, 1068],
                top: [2038, 2038, 2038, 2038, 2038, 2038, 2038]
            }
        },
        width: 180,
        height: 146,
        scale: 1.5,
        frame: {
            burst: 7
        }
    }
});
Animation.StasisFieldSpell = Animation.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        //Add basic unit info
        name: "Magic",
        imgPos: {
            burst: {
                left: [1384, 1250, 1250, 1384],
                top: [2044, 2044, 2044, 2044]
            }
        },
        width: 128,
        height: 84,
        frame: {
            burst: 4
        }
    }
});
Animation.MaelStormSpell = Animation.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        //Add basic unit info
        name: "Magic",
        imgPos: {
            burst: {
                left: [1384, 1250, 1250, 1384],
                top: [2134, 2134, 2134, 2134]
            }
        },
        width: 128,
        height: 84,
        frame: {
            burst: 4
        }
    }
});
Animation.Restoration = Animation.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        //Add basic unit info
        name: "Magic",
        imgPos: {
            burst: {
                left: [0, 128, 256, 384, 512, 640, 768, 896, 0, 128, 256, 384, 512, 640, 768, 896],
                top: [2190, 2190, 2190, 2190, 2190, 2190, 2190, 2190, 2318, 2318, 2318, 2318, 2318, 2318, 2318, 2318]
            }
        },
        width: 128,
        height: 128,
        above: true,
        autoSize: true,
        frame: {
            burst: 16
        }
    }
});
Animation.Shockwave = Animation.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        //Add basic unit info
        name: "Magic",
        imgPos: {
            burst: {
                left: [0, 135, 270, 405, 540, 675, 810, 945, 1080, 1215, 1350],
                top: [2446, 2446, 2446, 2446, 2446, 2446, 2446, 2446, 2446, 2446, 2446]
            }
        },
        width: 135,
        height: 120,
        frame: {
            burst: 11
        }
    }
});
Animation.NuclearStrike = Animation.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        //Add basic unit info
        name: "Magic",
        imgPos: {
            burst: {
                left: [0, 154, 308, 462, 616, 770, 924, 1078, 1232, 1386, 0, 154, 308, 462, 616, 770, 924, 1078, 1232, 1386],
                top: [2562, 2562, 2562, 2562, 2562, 2562, 2562, 2562, 2562, 2562, 2716, 2716, 2716, 2716, 2716, 2716, 2716, 2716, 2716, 2716]
            }
        },
        width: 154,
        height: 154,
        scale: 2.5,
        frame: {
            burst: 20
        }
    }
});
