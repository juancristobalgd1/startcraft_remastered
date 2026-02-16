Building.ProtossBuilding.Nexus = Building.ProtossBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "Nexus",
        imgPos: {
            dock: {
                left: 24,
                top: 12
            }
        },
        width: 146,
        height: 136,
        frame: {
            dock: 1
        },
        HP: 750,
        SP: 750,
        manPlus: 10,
        requiresPower: false,
        cost: {
            mine: 400,
            time: 1200
        },
        items: {
            '1': { name: 'Probe' },
            '6': { name: 'SetRallyPoint' }
        }
    }
});
Building.ProtossBuilding.Pylon = Building.ProtossBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "Pylon",
        imgPos: {
            dock: {
                left: 454,
                top: 314
            }
        },
        width: 60,
        height: 68,
        frame: {
            dock: 1
        },
        HP: 300,
        SP: 300,
        manPlus: 8,
        requiresPower: false,
        cost: {
            mine: 100,
            time: 300
        }
    }
});
Building.ProtossBuilding.Assimilator = Building.ProtossBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "Assimilator",
        imgPos: {
            dock: {
                left: 300,
                top: 36
            }
        },
        width: 126,
        height: 100,
        frame: {
            dock: 1
        },
        HP: 450,
        SP: 450,
        requiresPower: false,
        cost: {
            mine: 100,
            time: 400
        }
    }
});
Building.ProtossBuilding.Gateway = Building.ProtossBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "Gateway",
        imgPos: {
            dock: {
                left: 580,
                top: 20
            }
        },
        width: 128,
        height: 110,
        frame: {
            dock: 1
        },
        HP: 500,
        SP: 500,
        cost: {
            mine: 150,
            time: 600
        },
        items: {
            '1': { name: 'Zealot' },
            '2': {
                name: 'Dragoon', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'CyberneticsCore';
                    })
                }
            },
            '3': {
                name: 'Templar', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'TemplarArchives';
                    })
                }
            },
            '4': {
                name: 'DarkTemplar', condition: function () {
                    return Building.ourBuildings.some(function (chara) {
                        return chara.name == 'TemplarArchives';
                    })
                }
            },
            '6': { name: 'SetRallyPoint' }
        }
    }
});
Building.ProtossBuilding.Forge = Building.ProtossBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "Forge",
        imgPos: {
            dock: {
                left: 210,
                top: 178
            }
        },
        width: 102,
        height: 80,
        frame: {
            dock: 1
        },
        HP: 550,
        SP: 550,
        cost: {
            mine: 150,
            time: 400
        },
        items: {
            '1': { name: 'UpgradeGroundWeapons' },
            '2': { name: 'UpgradeGroundArmor' },
            '3': { name: 'UpgradePlasmaShields' }
        }
    }
});
Building.ProtossBuilding.PhotonCannon = Building.ProtossBuilding.extends(Building.Attackable).extends({
    constructorPlus: function (props) {
        this.imgPos.attack = this.imgPos.dock;
        this.sound.attack = new Audio('bgm/Dragoon.attack.wav');
    },
    prototypePlus: {
        name: "PhotonCannon",
        imgPos: {
            dock: {
                left: [98, 162, 226, 290, 290, 290, 290, 290, 290],
                top: [320, 320, 320, 320, 320, 320, 320, 320, 320]
            }
        },
        width: 62,
        height: 54,
        frame: {
            dock: 1,
            attack: 9
        },
        HP: 100,
        SP: 100,
        detector: Gobj.detectorBuffer,
        cost: {
            mine: 150,
            time: 500
        },
        damage: 20,
        attackRange: 245,
        attackInterval: 2200,
        attackType: AttackableUnit.NORMAL_ATTACK,
        fireDelay: 400
    }
});
Building.ProtossBuilding.CyberneticsCore = Building.ProtossBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "CyberneticsCore",
        imgPos: {
            dock: {
                left: 314,
                top: 168
            }
        },
        width: 90,
        height: 88,
        frame: {
            dock: 1
        },
        HP: 500,
        SP: 500,
        cost: {
            mine: 200,
            time: 600
        },
        items: {
            '1': { name: 'UpgradeAirWeapons' },
            '2': { name: 'UpgradeAirArmor' },
            '3': { name: 'DevelopSingularityCharge' }
        }
    }
});
Building.ProtossBuilding.ShieldBattery = Building.ProtossBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "ShieldBattery",
        imgPos: {
            dock: {
                left: 360,
                top: 318
            }
        },
        width: 90,
        height: 64,
        frame: {
            dock: 1
        },
        HP: 200,
        SP: 200,
        MP: 200,
        cost: {
            mine: 100,
            time: 300
        },
        items: {
            '1': { name: 'RechargeShields' }
        }
    }
});
