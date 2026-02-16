Building.TerranBuilding.CrashCruiser = Building.TerranBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "CrashCruiser",
        imgPos: {
            dock: {
                left: 154,
                top: 440
            }
        },
        width: 106,
        height: 108,
        frame: {
            dock: 1
        },
        HP: 250
    }
});
Building.TerranBuilding.BigCannon = Building.TerranBuilding.extends({
    constructorPlus: function (props) {
        //Nothing
    },
    prototypePlus: {
        name: "BigCannon",
        imgPos: {
            dock: {
                left: 0,
                top: 423
            }
        },
        width: 152,
        height: 110,
        frame: {
            dock: 1
        },
        HP: 500
    }
});
Building.TerranBuilding.ConstructionS = Building.TerranBuilding.extends({
    constructorPlus: function (props) {
        this.imgPos.dock = this.imgPos.step1;
    },
    prototypePlus: {
        name: "Construction",
        imgPos: {
            step1: {
                left: 798,
                top: 296
            },
            step2: {
                left: 894,
                top: 296
            },
            step3: {
                left: 990,
                top: 296
            }
        },
        width: 72,
        height: 70,
        frame: {
            step1: 1,
            step2: 1,
            step3: 1,
            dock: 1
        },
        HP: 400,
        armor: 0,
        sight: 350
    }
});
Building.TerranBuilding.ConstructionM = Building.TerranBuilding.extends({
    constructorPlus: function (props) {
        this.imgPos.dock = this.imgPos.step1;
    },
    prototypePlus: {
        name: "Construction",
        imgPos: {
            step1: {
                left: 498,
                top: 296
            },
            step2: {
                left: 594,
                top: 296
            },
            step3: {
                left: 690,
                top: 296
            }
        },
        width: 96,
        height: 70,
        frame: {
            step1: 1,
            step2: 1,
            step3: 1,
            dock: 1
        },
        HP: 400,
        armor: 0,
        sight: 350
    }
});
Building.TerranBuilding.ConstructionL = Building.TerranBuilding.extends({
    constructorPlus: function (props) {
        this.imgPos.dock = this.imgPos.step1;
    },
    prototypePlus: {
        name: "Construction",
        imgPos: {
            step1: {
                left: 276,
                top: 442
            },
            step2: {
                left: 404,
                top: 442
            },
            step3: {
                left: 540,
                top: 442
            }
        },
        width: 124,
        height: 86,
        frame: {
            step1: 1,
            step2: 1,
            step3: 1,
            dock: 1
        },
        HP: 400,
        armor: 0,
        sight: 350
    }
});
