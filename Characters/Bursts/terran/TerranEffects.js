Burst.SmallFireSpark=Burst.extends({
    constructorPlus:function(props){
        //Has burst sound effect
        if (this.insideScreen()) new Audio('bgm/FireSpark.burst.wav').play();
    },
    prototypePlus:{
        //Add basic unit info
        name:"Wraith",
        imgPos:{
            burst:{
                left:[64,106,64],
                top:[91,91,91]
            }
        },
        width:32,
        height:28,
        frame:{
            burst:3
        }
    }
});
Burst.FireSpark=Burst.extends({
    constructorPlus:function(props){
        //Nothing
    },
    prototypePlus:{
        //Add basic unit info
        name:"Ghost",
        imgPos:{
            burst:{
                left:[0, 38, 76, 114, 152, 190, 228, 266, 304, 342],
                top:[596,596,596,596,596,596,596,596,596,596]
            }
        },
        width:38,
        height:36,
        frame:{
            burst:10
        }
    }
});
Burst.FireSparkSound=Burst.FireSpark.extends({
    constructorPlus:function(props){
        //Has burst sound effect
        if (this.insideScreen()) new Audio('bgm/FireSpark.burst.wav').play();
    },
    prototypePlus:{
        //Nothing
    }
});
Burst.LaserSpark=Burst.extends({
    constructorPlus:function(props){
        //Nothing
    },
    prototypePlus:{
        //Add basic unit info
        name:"Burst",
        imgPos:{
            burst:{
                left:[18,70,128,182],
                top:[50,50,50,50]
            }
        },
        width:30,
        height:30,
        frame:{
            burst:4
        }
    }
});
Burst.VultureSpark=Burst.LaserSpark.extends({
    constructorPlus:function(props){
        //Has burst sound effect
        if (this.insideScreen()) new Audio('bgm/VultureSpark.burst.wav').play();
    },
    prototypePlus: {
        //Nothing
    }
});
Burst.SCVSpark=Burst.extends({
    constructorPlus:function(props){
        //Nothing
    },
    prototypePlus:{
        //Add basic unit info
        name:"Burst",
        imgPos:{
            burst:{
                left:[0, 48, 96, 144, 192, 240, 288, 336, 384, 432],
                top:[1147,1147,1147,1147,1147,1147,1147,1147,1147,1147]
            }
        },
        width:48,
        height:48,
        frame:{
            burst:10
        }
    }
});
Burst.HumanDeath=Burst.extends({
    constructorPlus:function(props){
        //Nothing
    },
    prototypePlus:{
        //Add basic unit info
        name:"Civilian",
        imgPos:{
            burst:{
                left:[6,58,106,158,6,54,102,152],
                top:[286,286,286,286,320,320,320,320]
            }
        },
        width:42,
        height:30,
        frame:{
            burst:8
        }
    }
});
Burst.MedicDeath=Burst.extends({
    constructorPlus:function(props){
        //Nothing
    },
    prototypePlus:{
        //Add basic unit info
        name:"Medic",
        imgPos:{
            burst:{
                left:[0, 64, 128, 192, 256, 320, 384, 448],
                top:[832,832,832,832,832,832,832,832]
            }
        },
        width:64,
        height:64,
        frame:{
            burst:8
        }
    }
});
