//Dock action I
Unit.turnAround = function () {
    //Inherited dock from Unit.js
    Unit.prototype.dock.call(this);
    //Add in new things
    if (this.dockTimer) clearInterval(this.dockTimer);
    this.dockTimer = setInterval(() => {
        //Look around animation
        if (this.status == "dock") {
            this.turnTo((this.direction + 1) % 8);//For all ground soldier to use
        }
        else {
            clearInterval(this.dockTimer);
        }
    }, 2000);
};
//Dock action II
Unit.walkAround = function () {
    //Inherited dock from Unit.js
    Unit.prototype.dock.call(this);
    //Add in new things
    if (this.dockTimer) clearInterval(this.dockTimer);
    this.dockTimer = setInterval(() => {
        const direction = (Math.random() * 8) >> 0;//Math.floor
        //Walk around, for all critters to use
        if (this.status == "dock") {
            this.moveTo(this.posX() + this.get('speed')[direction].x * 6, this.posY() + this.get('speed')[direction].y * 6);
        }
        else {
            clearInterval(this.dockTimer);
        }
    }, 2000);
};
//Dock action III
Unit.hover = function () {
    //Inherited dock from Unit.js
    Unit.prototype.dock.call(this);
    //Add in new things
    if (this.dockTimer) clearInterval(this.dockTimer);
    let N = 0;
    let hoverOffset = 1;
    this.dockTimer = setInterval(() => {
        //Hover animation
        if (this.status == "dock") {
            this.y += hoverOffset;
            if (N % 4 == 0) {
                //myself.turnTo((myself.direction+1)%8);//For marine to use
                hoverOffset = -hoverOffset;//Hover up and down
            }
        }
        else {
            clearInterval(this.dockTimer);
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
    this.dockTimer = setInterval(() => {
        const direction = (this.direction + 1) % 8;//Math.floor
        //Walk around, for all critters to use
        if (this.status == "dock") {
            Unit.prototype.moveTo.call(this, this.posX() + this.get('speed')[direction].x * 6, this.posY() + this.get('speed')[direction].y * 6);
        }
        else {
            clearInterval(this.dockTimer);
        }
    }, 2000);
};
