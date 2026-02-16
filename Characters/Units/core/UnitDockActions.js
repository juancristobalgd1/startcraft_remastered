//Dock action I
Unit.turnAround = function () {
    //Inherited dock from Unit.js
    Unit.prototype.dock.call(this);
    //Add in new things
    if (this.dockTimer) clearInterval(this.dockTimer);
    var myself = this;
    this.dockTimer = setInterval(function () {
        //Look around animation
        if (myself.status == "dock") {
            myself.turnTo((myself.direction + 1) % 8);//For all ground soldier to use
        }
        else {
            clearInterval(myself.dockTimer);
        }
    }, 2000);
};
//Dock action II
Unit.walkAround = function () {
    //Inherited dock from Unit.js
    Unit.prototype.dock.call(this);
    //Add in new things
    if (this.dockTimer) clearInterval(this.dockTimer);
    var myself = this;
    this.dockTimer = setInterval(function () {
        var direction = (Math.random() * 8) >> 0;//Math.floor
        //Walk around, for all critters to use
        if (myself.status == "dock") {
            myself.moveTo(myself.posX() + myself.get('speed')[direction].x * 6, myself.posY() + myself.get('speed')[direction].y * 6);
        }
        else {
            clearInterval(myself.dockTimer);
        }
    }, 2000);
};
//Dock action III
Unit.hover = function () {
    //Inherited dock from Unit.js
    Unit.prototype.dock.call(this);
    //Add in new things
    if (this.dockTimer) clearInterval(this.dockTimer);
    var myself = this;
    var N = 0;
    var hoverOffset = 1;
    this.dockTimer = setInterval(function () {
        //Hover animation
        if (myself.status == "dock") {
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
//Dock action IV
Unit.walkAroundLarva = function () {
    //Inherited dock from Unit.js
    Unit.prototype.dock.call(this);
    //Add in new things
    if (this.dockTimer) clearInterval(this.dockTimer);
    var myself = this;
    this.dockTimer = setInterval(function () {
        var direction = (myself.direction + 1) % 8;//Math.floor
        //Walk around, for all critters to use
        if (myself.status == "dock") {
            Unit.prototype.moveTo.call(myself, myself.posX() + myself.get('speed')[direction].x * 6, myself.posY() + myself.get('speed')[direction].y * 6);
        }
        else {
            clearInterval(myself.dockTimer);
        }
    }, 2000);
};
