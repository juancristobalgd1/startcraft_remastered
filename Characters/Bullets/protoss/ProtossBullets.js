Bullets.DragoonBall=Bullets.extends({
    constructorPlus:function(props){},
    prototypePlus:{
        //Add basic unit info
        name:"Burst",
        duration:800,//Match attack sound
        imgPos:{
            moving:{
                left:[5, 36, 70, 101, 133],
                top:[862,862,862,862,862]
            }
        },
        width:23,
        height:21,
        frame:{
            moving:5
        },
        forbidRotate:true,
        burstEffect:Burst.DragoonBallBroken,
        //Delay fire for Dragoon and PhotonCannon
        fire:function(){
            var delay=this.owner.fireDelay;
            if (!delay) delay=0;
            //Inherit fire function
            var myself=this;
            setTimeout(function(){
                Bullets.prototype.fire.call(myself);
            },delay);
        }
    }
});
Bullets.ArchonLightening=Bullets.extends({
    constructorPlus:function(props){
        //Override position to hands
        this.x+=this.speed.x*6;//N/8==40/70 (ArchonRadius/AttackRange)
        this.y+=this.speed.y*6;
        //Override speed, will not move
        this.speed={x:0,y:0};
    },
    prototypePlus:{
        //Add basic unit info
        name:"Burst",
        duration:800,
        imgPos:{
            moving:{
                left:[4, 192, 388, 580],
                top:[704,704,704,704]
            }
        },
        width:90,
        height:75,
        frame:{
            moving:4
        }
    }
});
Bullets.ScoutMissile=Bullets.extends({
    constructorPlus:function(props){},
    prototypePlus:{
        //Add basic unit info
        name:"Burst",
        duration:1000,
        imgPos:{
            moving:{
                left:53,//53//580
                top:0
            }
        },
        width:30,//30//55
        height:34,//34//45
        frame:{
            moving:1
        },
        burstEffect:Burst.DragoonBallBroken
    }
});
Bullets.ReaverBomb=Bullets.extends({
    constructorPlus:function(props){},
    prototypePlus:{
        //Add basic unit info
        name:"Burst",
        duration:1000,
        imgPos:{
            moving:{
                left:350,//186
                top:0
            }
        },
        width:70,//62
        height:34,
        frame:{
            moving:1
        },
        burstEffect:Burst.ReaverBurst,
        //Override
        fire:function(){
            Bullets.prototype.fire.call(this);
            //Consume scarab
            if (this.owner.scarabNum>0) {
                this.owner.scarabNum--;
                Button.reset();
            }
        }
    }
});
Bullets.ReaverBombII=Bullets.extends({
    constructorPlus:function(props){},
    prototypePlus:{
        //Add basic unit info
        name:"Burst",
        duration:1000,
        imgPos:{
            moving:{
                left:300,
                top:0
            }
        },
        width:40,
        height:30,
        frame:{
            moving:1
        },
        forbidRotate:true,
        burstEffect:Burst.ReaverBurst
    }
});
Bullets.Interceptor=Bullets.extends({
    constructorPlus:function(props){},
    prototypePlus:{
        //Add basic unit info
        name:"Burst",
        duration:1000,
        imgPos:{
            moving:{
                left:[120,170,220,272,272,120,120,120,120,120],
                top:[582,582,582,582,582,582,582,582,582,582]
            }
        },
        width:44,
        height:28,
        frame:{
            moving:10
        },
        //Override cause damage timing
        noDamage:true,
        fire:function(){
            this.inherited.fire.call(this);
            var target=this.target;
            var owner=this.owner;
            setTimeout(function(){
                target.getDamageBy(owner);
                target.reactionWhenAttackedBy(owner);
            },500);
        }
    }
});
