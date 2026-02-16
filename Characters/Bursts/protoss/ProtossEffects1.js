Burst.CorsairCloud=Burst.extends({
    constructorPlus:function(props){
        //Nothing
    },
    prototypePlus:{
        //Add basic unit info
        name:"Burst",
        imgPos:{
            burst:{
                left:[5,57],//[1, 64, 128]
                top:[576,576]
            }
        },
        width:40,//62
        height:44,//44
        frame:{
            burst:2
        }
    }
});
Burst.ArchonBurst=Burst.extends({
    constructorPlus:function(props){
        //Nothing
    },
    prototypePlus:{
        //Add basic unit info
        name:"Burst",
        imgPos:{
            burst:{
                left:[0, 80, 160, 240, 320, 400],
                top:[779,779,779,779,779,779]
            }
        },
        width:80,
        height:80,
        frame:{
            burst:8
        }
    }
});
Burst.DragoonBallBroken=Burst.extends({
    constructorPlus:function(props){
        //Has burst sound effect
        if (this.insideScreen()) new Audio('bgm/DragoonBall.burst.wav').play();
    },
    prototypePlus:{
        //Add basic unit info
        name:"Burst",
        imgPos:{
            burst:{
                left:[0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520],
                top:[891,891,891,891,891,891,891,891,891,891,891,891,891,891]
            }
        },
        width:38,
        height:40,
        frame:{
            burst:14
        }
    }
});
Burst.ShootSpark=Burst.extends({
    constructorPlus:function(props){
        //Nothing
    },
    prototypePlus:{
        //Add basic unit info
        name:"Burst",
        imgPos:{
            burst:{
                left:[0, 40, 80, 120, 160, 200, 240, 280, 320, 360],
                top:[1011,1011,1011,1011,1011,1011,1011,1011,1011,1011]
            }
        },
        width:40,
        height:40,
        frame:{
            burst:10
        }
    }
});
Burst.BlueShootSpark=Burst.extends({
    constructorPlus:function(props){
        //Nothing
    },
    prototypePlus:{
        //Add basic unit info
        name:"Burst",
        imgPos:{
            burst:{
                left:[32, 64, 96, 128, 160, 192, 224, 256],
                top:[1115,1115,1115,1115,1115,1115,1115,1115]
            }
        },
        width:32,
        height:32,
        frame:{
            burst:8
        }
    }
});
Burst.ProbeSpark=Burst.extends({
    constructorPlus:function(props){
        //Nothing
    },
    prototypePlus:{
        //Add basic unit info
        name:"Burst",
        imgPos:{
            burst:{
                left:[0, 48, 96, 144, 192, 240, 288],
                top:[672,672,672,672,672,672,672]
            }
        },
        width:48,
        height:32,
        frame:{
            burst:7
        }
    }
});
