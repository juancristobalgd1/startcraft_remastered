Building.ProtossBuilding.Observatory = Building.ProtossBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "Observatory",
        imgPos: {
            dock: {
                left: 0,
                top: 302
            }
        },
        width: 96,
        height: 82,
        frame: {
            dock: 1
        },
        HP: 250,
        SP: 250,
        cost: {
            mine: 50,
            gas: 100,
            time: 300
        },
        items: {
            '1': { name: 'DevelopGraviticBooster' },
            '2': { name: 'DevelopSensorArray' }
        }
    }
});
Building.ProtossBuilding.ArbiterTribunal = Building.ProtossBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "ArbiterTribunal",
        imgPos: {
            dock: {
                left: 408,
                top: 176
            }
        },
        width: 94,
        height: 80,
        frame: {
            dock: 1
        },
        HP: 500,
        SP: 500,
        cost: {
            mine: 200,
            gas: 150,
            time: 600
        },
        items: {
            '1': { name: 'DevelopRecall' },
            '2': { name: 'DevelopStasisField' },
            '3': { name: 'DevelopKhaydarinCore' }
        }
    }
});
Building.ProtossBuilding.TeleportGate = Building.ProtossBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "TeleportGate",
        imgPos: {
            dock: {
                left: 602,
                top: 132
            }
        },
        width: 126,
        height: 148,
        frame: {
            dock: 1
        },
        HP: 500,
        SP: 500
    }
});
Building.ProtossBuilding.Pyramid = Building.ProtossBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "Pyramid",
        imgPos: {
            dock: {
                left: 620,
                top: 284
            }
        },
        width: 128,
        height: 120,
        frame: {
            dock: 1
        },
        HP: 1500,
        SP: 1500
    }
});
Building.ProtossBuilding.TeleportPoint = Building.ProtossBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "TeleportPoint",
        imgPos: {
            dock: {
                left: 516,
                top: 320
            }
        },
        width: 100,
        height: 64,
        frame: {
            dock: 1
        },
        HP: 100,
        SP: 100
    }
});
