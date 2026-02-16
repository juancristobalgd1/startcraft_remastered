Burst.InfestedBomb=Burst.extends({
    constructorPlus:function(props){
        //Has burst sound effect
        if (this.insideScreen()) new Audio('bgm/ReaverBomb.burst.wav').play();
    },
    prototypePlus:{
        //Add basic unit info
        name:"InfestedTerran",
        imgPos:{
            burst:{
                left:[0, 78, 156, 234, 312, 0, 78, 156, 234, 312],
                top:[432,432,432,432,432,496,496,496,496,496]
            }
        },
        width:78,
        height:64,
        frame:{
            burst:10
        }
    }
});
Burst.ScourgeBomb=Burst.extends({
    constructorPlus:function(props){
        //Nothing
    },
    prototypePlus:{
        //Add basic unit info
        name:"Scourge",
        imgPos:{
            burst:{
                left:[0, 52, 104, 156, 208, 260, 312, 364, 416],
                top:[218,218,218,218,218,218,218,218,218]
            }
        },
        width:52,
        height:46,
        frame:{
            burst:9
        }
    }
});
Burst.RagnasaurDeath=Burst.extends({
    constructorPlus:function(props){
        //Nothing
    },
    prototypePlus:{
        //Add basic unit info
        name:"Ragnasaur",
        imgPos:{
            burst:{
                left:[0, 104, 208, 312, 416, 520, 624, 728],
                top:[936,936,936,936,936,936,936,936]
            }
        },
        width:128,
        height:128,
        frame:{
            burst:8
        }
    }
});
Burst.RhynsdonDeath=Burst.extends({
    constructorPlus:function(props){
        //Nothing
    },
    prototypePlus:{
        //Add basic unit info
        name:"Rhynsdon",
        imgPos:{
            burst:{
                left:[0, 104, 208, 312, 416, 520, 624, 728],
                top:[1144,1144,1144,1144,1144,1144,1144,1144]
            }
        },
        width:104,
        height:128,
        frame:{
            burst:8
        }
    }
});
Burst.UrsadonDeath=Burst.extends({
    constructorPlus:function(props){
        //Nothing
    },
    prototypePlus:{
        //Add basic unit info
        name:"Ursadon",
        imgPos:{
            burst:{
                left:[0, 92, 184, 276, 368, 460, 552, 644],
                top:[736,736,736,736,736,736,736,736]
            }
        },
        width:92,
        height:92,
        frame:{
            burst:8
        }
    }
});
Burst.BengalaasDeath=Burst.extends({
    constructorPlus:function(props){
        //Nothing
    },
    prototypePlus:{
        //Add basic unit info
        name:"Bengalaas",
        imgPos:{
            burst:{
                left:[0, 128, 256, 384, 512, 640, 768, 896],
                top:[1536,1536,1536,1536,1536,1536,1536,1536]
            }
        },
        width:128,
        height:128,
        frame:{
            burst:8
        }
    }
});
Burst.ScantidDeath=Burst.extends({
    constructorPlus:function(props){
        //Nothing
    },
    prototypePlus:{
        //Add basic unit info
        name:"Scantid",
        imgPos:{
            burst:{
                left:[0, 92, 184, 276, 368, 460, 552, 644],
                top:[1104,1104,1104,1104,1104,1104,1104,1104]
            }
        },
        width:92,
        height:92,
        frame:{
            burst:8
        }
    }
});
Burst.KakaruDeath=Burst.extends({
    constructorPlus:function(props){
        //Nothing
    },
    prototypePlus:{
        //Add basic unit info
        name:"Kakaru",
        imgPos:{
            burst:{
                left:[0, 92, 184, 276, 368, 460, 552, 644],
                top:[1104,1104,1104,1104,1104,1104,1104,1104]
            }
        },
        width:92,
        height:92,
        frame:{
            burst:8
        }
    }
});
