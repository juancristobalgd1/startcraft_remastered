Animation.RightClickCursor = class RightClickCursor extends Animation {};
Object.assign(Animation.RightClickCursor.prototype, {
    //Add basic unit info
    name: "Burst",
    imgPos: {
        burst: {
            left: [0, 44, 88, 132],
            top: [1087, 1087, 1087, 1087]
        }
    },
    width: 44,
    height: 28,
    frame: {
        burst: 4
    }
});
Animation.PsionicStorm = class PsionicStorm extends Animation {};
Object.assign(Animation.PsionicStorm.prototype, {
    //Add basic unit info
    name: "Magic",
    imgPos: {
        burst: {
            left: [0, 188, 376, 564, 0, 188, 376, 564, 0, 188, 376, 564, 0, 188],
            top: [0, 0, 0, 0, 153, 153, 153, 153, 306, 306, 306, 306, 459, 459]
        }
    },
    width: 188,
    height: 153,
    scale: 1.2,
    duration: 7000,
    frame: {
        burst: 14
    }
});
Animation.Hallucination = class Hallucination extends Animation {};
Object.assign(Animation.Hallucination.prototype, {
    //Add basic unit info
    name: "Magic",
    imgPos: {
        burst: {
            left: [752, 815, 878, 941, 1004, 1067, 1130, 1193, 1256, 752, 815, 878, 941, 1004, 1067, 1130, 1193, 1256],
            top: [0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 63, 63, 63, 63, 63, 63, 63, 63]
        }
    },
    width: 63,
    height: 63,
    above: true,
    frame: {
        burst: 18
    }
});
Animation.Consume = class Consume extends Animation {};
Object.assign(Animation.Consume.prototype, {
    //Add basic unit info
    name: "Magic",
    imgPos: {
        burst: {
            left: [752, 826, 900, 974, 1048, 1122, 1196, 1270, 1344, 752, 826, 900, 974, 1048, 1122, 1196, 1270, 1344],
            top: [126, 126, 126, 126, 126, 126, 126, 126, 126, 196, 196, 196, 196, 196, 196, 196, 196, 196]
        }
    },
    width: 74,
    height: 70,
    above: true,
    autoSize: true,
    frame: {
        burst: 18
    }
});
Animation.StasisField = class StasisField extends Animation {};
Object.assign(Animation.StasisField.prototype, {
    //Add basic unit info
    name: "Magic",
    imgPos: {
        burst: {
            left: 376,
            top: 459
        }
    },
    width: 130,
    height: 110,
    above: true,
    autoSize: 'MAX',
    scale: 1.25,
    duration: 30000,
    frame: {
        burst: 1
    }
});
Animation.Lockdown = class Lockdown extends Animation {};
Object.assign(Animation.Lockdown.prototype, {
    //Add basic unit info
    name: "Magic",
    imgPos: {
        burst: {
            left: [330, 0, 110, 220, 330, 0, 0, 0, 110, 220, 330, 0, 110, 220],
            top: [723, 834, 834, 834, 834, 945, 0, 612, 612, 612, 612, 723, 723, 723]
        }
    },
    width: 110,
    height: 111,
    above: true,
    autoSize: 'MAX',
    duration: 60000,
    frame: {
        burst: 6
    }
});
Animation.DarkSwarm = class DarkSwarm extends Animation {};
Object.assign(Animation.DarkSwarm.prototype, {
    //Add basic unit info
    name: "Magic",
    imgPos: {
        burst: {
            left: [1260, 752, 1006, 1260, 752, 0, 752, 1006, 1260, 752, 1006],
            top: [456, 645, 645, 645, 834, 0, 267, 267, 267, 456, 456]
        }
    },
    width: 254,
    height: 189,
    scale: 1.2,
    duration: 60000,
    frame: {
        burst: 5
    }
});
Animation.Plague = class Plague extends Animation {};
Object.assign(Animation.Plague.prototype, {
    //Add basic unit info
    name: "Magic",
    imgPos: {
        burst: {
            left: [1144, 1274, 1404, 754, 884, 1014, 1144, 1274, 1404, 754, 884, 1014, 1144, 1274],
            top: [892, 892, 892, 1022, 1022, 1022, 1022, 1022, 1022, 1152, 1152, 1152, 1152, 1152]
        }
    },
    width: 130,
    height: 130,
    scale: 1.2,
    frame: {
        burst: 14
    }
});
Animation.PurpleEffect = class PurpleEffect extends Animation {};
Object.assign(Animation.PurpleEffect.prototype, {
    //Add basic unit info
    name: "Magic",
    imgPos: {
        burst: {
            left: [440, 499, 558, 617],
            top: [902, 902, 902, 902]
        }
    },
    width: 59,
    height: 60,
    above: true,
    autoSize: 'MIN',
    duration: 30000,
    frame: {
        burst: 4
    }
});
Animation.RedEffect = class RedEffect extends Animation {};
Object.assign(Animation.RedEffect.prototype, {
    //Add basic unit info
    name: "Magic",
    imgPos: {
        burst: {
            left: [1006, 1068, 1130, 1192],
            top: [836, 836, 836, 836]
        }
    },
    width: 62,
    height: 50,
    above: true,
    autoSize: 'MIN',
    duration: 30000,
    frame: {
        burst: 4
    }
});
Animation.GreenEffect = class GreenEffect extends Animation {};
Object.assign(Animation.GreenEffect.prototype, {
    //Add basic unit info
    name: "Magic",
    imgPos: {
        burst: {
            left: [1256, 1313, 1370, 1427],
            top: [836, 836, 836, 836]
        }
    },
    width: 57,
    height: 46,
    above: true,
    autoSize: 'MIN',
    duration: 30000,
    frame: {
        burst: 4
    }
});
Animation.Ensnare = class Ensnare extends Animation {};
Object.assign(Animation.Ensnare.prototype, {
    //Add basic unit info
    name: "Magic",
    imgPos: {
        burst: {
            left: [0, 131, 262, 393, 524, 0, 131, 262, 393, 524, 0, 131, 262, 393, 524],
            top: [1056, 1056, 1056, 1056, 1056, 1181, 1181, 1181, 1181, 1181, 1306, 1306, 1306, 1306, 1306]
        }
    },
    width: 131,
    height: 125,
    scale: 1.2,
    frame: {
        burst: 15
    }
});
