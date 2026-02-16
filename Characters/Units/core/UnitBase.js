//Define unit which has HP/direction and be selectable, unattackable unit
var Unit = Gobj.extends({
    constructorPlus: function (props) {
        //Add id for unit
        this.id = Unit.currentID++;
        this.direction = (Math.random() * 8) >> 0;//Random direction,Math.floor
        this.isEnemy = Boolean(props.isEnemy);//false by default
        this.life = this.get('HP');
        if (this.SP) this.shield = this.get('SP');
        if (this.MP) this.magic = 50;
        this.selected = false;
        this.routingTimer = 0;
        // Fog of War: mark initial position as seen
        GameMap.markExplored(this.posX(), this.posY(), this.get('sight'));
        //Each unit instance has its own sound
        this.sound = {
            selected: _$.lazyAudio('bgm/' + this.name + '.selected.wav'),
            moving: _$.lazyAudio('bgm/' + this.name + '.moving.wav'),
            death: _$.lazyAudio('bgm/' + this.name + '.death.wav')
        };
        this.commandQueue = [];
        //Finish below after fully constructed, postpone
        var myself = this;
        setTimeout(function () {
            //Add this unit into Game
            Unit.allUnits.push(myself);
            if (myself.isFlying) {
                if (myself.isEnemy) Unit.enemyFlyingUnits.push(myself);
                else Unit.ourFlyingUnits.push(myself);
            }
            else {
                if (myself.isEnemy) Unit.enemyGroundUnits.push(myself);
                else Unit.ourGroundUnits.push(myself);
            }
            //Flying units show above ground units
            Unit.sortAllUnits();
            //Show unit
            myself.dock();
        }, 0);

    },
    prototypePlus: {
        name: "Unit",
        isFlying: true,
        //Override Gobj method
        animeFrame: function () {
            if (typeof Game !== 'undefined' && Game && Game.isPaused) return;
            //Animation play
            this.action++;
            //Override Gobj here, support hidden frames
            var arrLimit = (this.imgPos[this.status].left[0] instanceof Array) ? (this.imgPos[this.status].left[0].length) : 1;
            if (this.action == this.frame[this.status] || this.action >= arrLimit) {
                this.action = 0;
            }
            //Multiple hidden frames support
            if (this.imgPos[this.status].left[0][this.action] == -1) this.action = 0;
        },
        detectOutOfBound: function () {
            var boundX = GameMap.getCurrentMap().width - this.width;
            var boundY = GameMap.getCurrentMap().height - this.height;
            //Right Bound
            if (this.x > boundX) {
                this.x = boundX;
            }
            //Left Bound
            if (this.x < 0) {
                this.x = 0;
            }
            //Bottom Bound
            if (this.y > boundY) {
                this.y = boundY;
            }
            //Top Bound
            if (this.y < 0) {
                this.y = 0;
            }
        },
        //Override to use 8 directions speed
        updateLocation: function () {
            //8 directions speed
            if (this.get('speed') instanceof Array) {
                this.x += this.get('speed')[this.direction].x;
                this.y += this.get('speed')[this.direction].y;
            }
            //No direction speed
            else {
                this.x += this.get('speed').x;
                this.y += this.get('speed').y;
            }
        },
        //Add new functions to prototype
        turnTo: function (direction) {
            //Change direction
            this.direction = direction;
        },
        //Dock means stop moving but keep animation
        dock: function () {
            //Clear old timer
            this.stop();
            //Launch new dock timer
            this.status = "dock";
            this.action = 0;
            //Stop routing
            clearInterval(this.routingTimer);
            if (typeof Game !== 'undefined' && Game.pathfinding) Game.pathfinding.cancel(this);
            this.routingTimer = 0;
            var myself = this;
            this._timer = setInterval(function () {
                //Only play animation, will not move
                myself.animeFrame();
            }, 100);
            delete this._routingTarget;
            //Shift-queue: execute next command if idle
            if (this.commandQueue && this.commandQueue.length > 0) {
                setTimeout(function () {
                    if (myself.status === 'dock') myself.executeNextCommand();
                }, 0);
            }
            else {
                if (this._patrolRoute && !this.destination) {
                    this.destination = this._patrolRoute;
                }
            }
        },
        executeNextCommand: function () {
            if (!this.commandQueue || this.commandQueue.length === 0) return;
            var cmd = this.commandQueue.shift();
            if (cmd.type != 'patrol') delete this._patrolRoute;
            switch (cmd.type) {
                case 'move':
                    this.moveTo(cmd.x, cmd.y);
                    break;
                case 'attack':
                    if (this.attack) this.attack(cmd.target);
                    break;
                case 'gather':
                    if (this.gather) this.gather(cmd.target);
                    break;
                case 'patrol':
                    if (this.patrol) this.patrol({ x: cmd.x, y: cmd.y });
                    break;
            }
        },
        stand: function () {
            this.dock();
        },//alias
        stopMoving: function () {
            this.dock();
        },//alias
        run: function () {
            this.moving();
        }//alias
    }
});
