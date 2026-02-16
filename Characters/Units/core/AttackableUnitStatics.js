//Attack type
AttackableUnit.NORMAL_ATTACK = 0;
AttackableUnit.BURST_ATTACK = 1;
AttackableUnit.WAVE_ATTACK = 2;
//Dock action I, override
AttackableUnit.turnAround = function () {
    //Inherited dock from Unit.js
    Unit.prototype.dock.call(this);
    //Add in new things
    if (this.dockTimer) clearInterval(this.dockTimer);
    var myself = this;
    this.dockTimer = setInterval(function () {
        //Look around animation
        if (myself.isIdle()) {
            myself.turnTo((myself.direction + 1) % 8);//For all ground soldier to use
        }
        else {
            clearInterval(myself.dockTimer);
        }
    }, 2000);
};
//Dock action II, override
AttackableUnit.walkAround = function () {
    //Inherited dock from Unit.js
    Unit.prototype.dock.call(this);
    //Add in new things
    if (this.dockTimer) clearInterval(this.dockTimer);
    var myself = this;
    this.dockTimer = setInterval(function () {
        var direction = (Math.random() * 8) >> 0;//Math.floor
        //Walk around, for all critters to use
        if (myself.isIdle()) {
            myself.moveTo(myself.posX() + myself.get('speed')[direction].x * 6, myself.posY() + myself.get('speed')[direction].y * 6);
        }
        else {
            clearInterval(myself.dockTimer);
        }
    }, 2000);
};
//Dock action III, override
AttackableUnit.hover = function () {
    //Inherited dock from Unit.js
    Unit.prototype.dock.call(this);
    //Add in new things
    if (this.dockTimer) clearInterval(this.dockTimer);
    var myself = this;
    var N = 0;
    var hoverOffset = 1;
    this.dockTimer = setInterval(function () {
        //Hover animation
        if (myself.isIdle()) {
            myself.y += hoverOffset;
            if (N % 4 == 0) {
                //myself.turnTo((myself.direction+1)%8);//For marine to use
                hoverOffset = -hoverOffset;//Hover up and down
            }
        }
        else {
            clearInterval(myself.dockTimer);
        }
        N++;
    }, 200);
};
