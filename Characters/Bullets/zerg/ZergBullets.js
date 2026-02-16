Bullets.Spooge=Bullets.extends({
    constructorPlus:function(props){},
    prototypePlus:{
        //Add basic unit info
        name:"Hydralisk",
        duration:400,
        imgPos:{
            moving:{
                left:[14, 72, 136, 204],
                top:[758,758,758,758]
            }
        },
        width:56,
        height:28,
        frame:{
            moving:4
        },
        burstEffect:Burst.HydraSpark
    }
});
Bullets.Thorn=Bullets.extends({
    constructorPlus:function(props){},
    prototypePlus:{
        //Add basic unit info
        name:"Lurker",
        duration:600,
        imgPos:{
            moving:{
                left:[61,88,117,144,117,88],
                top:[711,711,711,711,711,711]
            }
        },
        width:28,
        height:35,
        frame:{
            moving:6
        },
        forbidRotate:true
    }
});
Bullets.Darts=Bullets.extends({
    constructorPlus:function(props){
        this.life=this.traceTimes;
    },
    prototypePlus:{
        //Add basic unit info
        name:"Burst",//Source img inside Mutalisk.png
        duration:400,//Match attack sound=1000?
        imgPos:{
            moving:{
                left:[0, 36, 72, 108, 144, 180, 216, 252, 288, 324],
                top:[1051,1051,1051,1051,1051,1051,1051,1051,1051,1051]
            }
        },
        width:36,
        height:36,
        frame:{
            moving:10
        },
        burstEffect:Burst.GreenFog,
        //Chain tracing attack
        traceTimes:3,
        traceRadius:100,
        //Override
        noDamage:true,
        die:function(){
            var target=this.target;
            var owner=this.owner;
            //Interrupt tracing if target is dead first
            if (target.status=="dead") {
                //Former behavior before override
                this.inherited.die.call(this);
            }
            //Override damage, damage reduce
            target.getDamageBy(owner,this.life/this.traceTimes);
            target.reactionWhenAttackedBy(owner);
            //Bullet reduce
            this.life--;
            var myself=this;
            var traceEnemies;
            //Get all possible enemies
            if (owner.isEnemy) {
                traceEnemies=(owner.attackLimit)?((owner.attackLimit=="flying")?
                    Unit.ourFlyingUnits:Unit.ourGroundUnits):Unit.allOurUnits();
            }
            else {
                traceEnemies=(owner.attackLimit)?((owner.attackLimit=="flying")?
                    Unit.enemyFlyingUnits:Unit.enemyGroundUnits):Unit.allEnemyUnits();
            }
            //Filter out trace-able enemies
            traceEnemies=traceEnemies.filter(function(chara) {
                return (chara!=myself.target) &&
                    chara.insideCircle({centerX:myself.posX(),centerY:myself.posY(),radius:myself.traceRadius});
            });
            //Attack trace enemy
            if (traceEnemies.length>0 && this.life>0){
                //Initial position again before jumping
                this.x=target.posX()-this.width/2;
                this.y=target.posY()-this.height/2;
                this.target=traceEnemies[0];
                var targetX=this.target.posX();
                var targetY=this.target.posY();
                var myX=this.posX();
                var myY=this.posY();
                //Update bullet speed
                this.speed={
                    x:(targetX-myX)/(this.duration/100),
                    y:(targetY-myY)/(this.duration/100)
                };
                //Update bullet angle
                if (this.forbidRotate) this.angle=0;
                else {
                    //Below angle represents direction toward target
                    this.angle=Math.atan((myY-targetY)/(targetX-myX));
                    if (targetX<myX) this.angle+=Math.PI;
                }
                //Fire bullet
                setTimeout(function(){
                    myself.burst();
                },this.duration);
            }
            else {
                //Former behavior before override
                this.inherited.die.call(this);
            }
        }
    }
});
Bullets.Parasite=Bullets.extends({
    constructorPlus:function(props){},
    prototypePlus:{
        //Add basic unit info
        name:"Burst",
        duration:600,
        imgPos:{
            moving:{
                left:152,
                top:0
            }
        },
        width:10,
        height:34,
        frame:{
            moving:1
        },
        burstEffect:Burst.Parasite
    }
});
Bullets.GreenBall=Bullets.extends({
    constructorPlus:function(props){},
    prototypePlus:{
        //Add basic unit info
        name:"Guardian",
        duration:800,//Match attack sound
        imgPos:{
            moving:{
                left:32,
                top:520
            }
        },
        width:20,
        height:20,
        frame:{
            moving:1
        },
        forbidRotate:true,
        burstEffect:Burst.GreenBallBroken
    }
});
Bullets.PurpleCloud=Bullets.extends({
    constructorPlus:function(props){},
    prototypePlus:{
        //Add basic unit info
        name:"Devourer",
        duration:900,//Match attack sound
        imgPos:{
            moving:{
                left:8,
                top:973
            }
        },
        width:70,
        height:32,
        frame:{
            moving:1
        },
        burstEffect:Burst.PurpleCloudSpread
    }
});
Bullets.Spore=Bullets.extends({
    constructorPlus:function(props){},
    prototypePlus:{
        //Add basic unit info
        name:"Burst",
        duration:500,
        imgPos:{
            moving:{
                left:522,
                top:6
            }
        },
        width:20,
        height:20,
        frame:{
            moving:1
        },
        burstEffect:Burst.Spore
    }
});
