Unit.prototype.navigateTo = function (clickX, clickY, range) {
    if (!range) range = Unit.moveRange;//Smallest limit by default
    //Center position
    var charaX = this.posX();
    var charaY = this.posY();
    //Already at check point
    if (this.insideCircle({ centerX: clickX, centerY: clickY, radius: range })) {
        this.dock();
        //Stop routing
        clearInterval(this.routingTimer);
        this.routingTimer = 0;
        if (typeof Game !== 'undefined' && Game.pathfinding) Game.pathfinding.cancel(this);
        //Reach destination flag
        return true;
    }
    //Need move
    else {
        var direction = 0;
        //Already in same X
        if (this.insideSquare({ centerX: clickX, centerY: charaY, radius: range * 0.7 >> 0 })) {
            direction = (clickY > charaY) ? 4 : 0;
        }
        else {
            //Already in same Y
            if (this.insideSquare({ centerX: charaX, centerY: clickY, radius: range * 0.7 >> 0 })) {
                direction = (clickX > charaX) ? 2 : 6;
            }
            //Need move by oblique path
            else {
                direction = (clickX > charaX) ? (clickY > charaY ? 3 : 1) : (clickY > charaY ? 5 : 7);
            }
        }
        /*//Change direction to avoid collision
        if (this.collision) {
            var directionLeft=(direction-1+8)%8;
            var nextStepLeft={x:this.posX()+this.get('speed')[directionLeft].x,
                y:this.posY()+this.get('speed')[directionLeft].y};
            var directionRight=(direction+1)%8;
            var nextStepRight={x:this.posX()+this.get('speed')[directionRight].x,
                y:this.posY()+this.get('speed')[directionRight].y};
            //Choose one side
            direction=(this.collision.distanceFrom(nextStepLeft)>this.collision.distanceFrom(nextStepRight))
                ?directionLeft:directionRight;
            //direction=(this.faceTo(this.collision,true)+1)%8;
            //Remove collision unit
            this.collision=undefined;
        }*/
        this.turnTo(direction);
        if (this.collision) {
            var directionLeft = (direction - 1 + 8) % 8;
            var speedLeft = (this.get('speed') instanceof Array) ? this.get('speed')[directionLeft] : this.get('speed');
            var nextStepLeft = { x: this.posX() + speedLeft.x, y: this.posY() + speedLeft.y };
            var directionRight = (direction + 1) % 8;
            var speedRight = (this.get('speed') instanceof Array) ? this.get('speed')[directionRight] : this.get('speed');
            var nextStepRight = { x: this.posX() + speedRight.x, y: this.posY() + speedRight.y };
            direction = (this.collision.distanceFrom(nextStepLeft) > this.collision.distanceFrom(nextStepRight))
                ? directionLeft : directionRight;
            this.turnTo(direction);
            this.collision = undefined;
        }
    }
};
Unit.prototype.faceTo = function (target, preventAction) {
    //Below angle represents direction toward target
    var angle;
    //Unit or Building
    if (target instanceof Gobj) {
        angle = Math.atan((this.posY() - target.posY()) / (target.posX() - this.posX()));
    }
    else {
        //Location={x:1,y:2}
        angle = Math.atan((this.posY() - target.y) / (target.x - this.posX()));
    }
    if (target.posX() < this.posX()) angle += Math.PI;
    //Wrap out nearest direction
    var direction = (angle < -Math.PI * 3 / 8) ? 4 : (angle < -Math.PI / 8) ? 3 : (angle < Math.PI / 8) ? 2 : (angle < Math.PI * 3 / 8) ? 1 :
        (angle < Math.PI * 5 / 8) ? 0 : (angle < Math.PI * 7 / 8) ? 7 : (angle < Math.PI * 9 / 8) ? 6 : (angle < Math.PI * 11 / 8) ? 5 : 4;
    if (!preventAction) this.turnTo(direction);
    return direction;
};
Unit.prototype.escapeFrom = function (enemy) {
    //Add to fix holding issue
    if (this.hold || this.cannotMove()) return;
    var escapeDirection = Unit.prototype.faceTo.call(enemy, this, true);//Fix escape from attackable building issue
    var speeds = this.get('speed');
    // Safety check for speed array (buildings or specific units might not have it)
    if (!(speeds instanceof Array)) return;
    var escapeSpeed = speeds[escapeDirection];
    if (!escapeSpeed) return;
    var escapeSteps = 100 / (Math.abs(escapeSpeed.x) + Math.abs(escapeSpeed.y));
    //Escape by multiple steps
    this.moveTo(this.posX() + escapeSpeed.x * escapeSteps, this.posY() + escapeSpeed.y * escapeSteps);
};
Unit.prototype.moveTo = function (clickX, clickY, range, callback) {
    if (!range) range = Unit.moveRange;//Smallest limit by default
    var hasScheduledRouting = (typeof Game !== 'undefined' && Game.pathfinding && Game.pathfinding.has && Game.pathfinding.has(this));
    if (this._routingTarget && (this.routingTimer || hasScheduledRouting) &&
        Math.abs(this._routingTarget.x - clickX) < 2 && Math.abs(this._routingTarget.y - clickY) < 2 &&
        Math.abs(this._routingTarget.range - range) < 1) {
        return;
    }
    //If already routing
    if (this.routingTimer) {
        clearInterval(this.routingTimer);//then break routing
    }
    this._routingTarget = { x: clickX, y: clickY, range: range };
    if (typeof Game !== 'undefined' && Game.pathfinding) {
        if (this.navigateTo(clickX, clickY, range)) {
            if (typeof (callback) == 'function') callback();
            callback = null;
        }
        Game.pathfinding.schedulePoint(this, clickX, clickY, range, callback);
    }
    else {
        const routingFrame = () => {
            if (this.navigateTo(clickX, clickY, range)) {
                if (typeof (callback) == 'function') callback();
                return true;
            }
        };
        if (routingFrame()) callback = null;
        const interval = (this.insideScreen && this.insideScreen()) ? 100 : 200;
        this.routingTimer = setInterval(routingFrame, interval);
    }
    //Start moving
    this.run();
};
Unit.prototype.moveToward = function (target, range, callback) {
    if (!range) range = Unit.moveRange;//Smallest limit by default
    //If already routing
    if (this.routingTimer) {
        clearInterval(this.routingTimer);//then break routing
    }
    if (typeof Game !== 'undefined' && Game.pathfinding) {
        if (target && target.status != 'dead') {
            if (this.navigateTo(target.posX(), target.posY(), range)) {
                if (typeof (callback) == 'function') callback();
                callback = null;
            }
            Game.pathfinding.scheduleFollow(this, target, range, callback);
        }
        else {
            this.dock();
        }
    }
    else {
        const routingFrame = () => {
            if (target.status != 'dead') {
                if (this.navigateTo(target.posX(), target.posY(), range)) {
                    if (typeof (callback) == 'function') callback();
                    return true;
                }
            }
            else {
                clearInterval(this.routingTimer);
                this.dock();
            }
        };
        if (routingFrame()) callback = null;
        const interval = (this.insideScreen && this.insideScreen()) ? 100 : 200;
        this.routingTimer = setInterval(routingFrame, interval);
    }
    //Start moving
    this.run();
};
