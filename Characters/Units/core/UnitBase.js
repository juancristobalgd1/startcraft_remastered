//Define unit which has HP/direction and be selectable, unattackable unit
class Unit extends Gobj {
    constructor(props) {
        super(props);
        if (!props) return;
        this.id = Unit.currentID++;
        this.direction = (Math.random() * 8) >> 0;
        this.isEnemy = Boolean(props.isEnemy);
        this.life = this.get('HP');
        if (this.SP) this.shield = this.get('SP');
        if (this.MP) this.magic = 50;
        this.selected = false;
        this.routingTimer = 0;
        GameMap.markExplored(this.posX(), this.posY(), this.get('sight'));
        this.sound = {
            selected: _$.lazyAudio('bgm/' + this.name + '.selected.wav'),
            moving: _$.lazyAudio('bgm/' + this.name + '.moving.wav'),
            death: _$.lazyAudio('bgm/' + this.name + '.death.wav')
        };
        this.commandQueue = [];
        setTimeout(() => {
            Unit.allUnits.push(this);
            if (this.isFlying) {
                if (this.isEnemy) Unit.enemyFlyingUnits.push(this);
                else Unit.ourFlyingUnits.push(this);
            }
            else {
                if (this.isEnemy) Unit.enemyGroundUnits.push(this);
                else Unit.ourGroundUnits.push(this);
            }
            Unit.sortAllUnits();
            this.dock();
        }, 0);
    }

    animeFrame() {
        if (typeof Game !== 'undefined' && Game && Game.isPaused) return;
        this.action++;
        var arrLimit = (this.imgPos[this.status].left[0] instanceof Array) ? (this.imgPos[this.status].left[0].length) : 1;
        if (this.action == this.frame[this.status] || this.action >= arrLimit) {
            this.action = 0;
        }
        if (this.imgPos[this.status].left[0][this.action] == -1) this.action = 0;
    }

    detectOutOfBound() {
        var boundX = GameMap.getCurrentMap().width - this.width;
        var boundY = GameMap.getCurrentMap().height - this.height;
        if (this.x > boundX) {
            this.x = boundX;
        }
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.y > boundY) {
            this.y = boundY;
        }
        if (this.y < 0) {
            this.y = 0;
        }
    }

    updateLocation() {
        if (this.get('speed') instanceof Array) {
            this.x += this.get('speed')[this.direction].x;
            this.y += this.get('speed')[this.direction].y;
        }
        else {
            this.x += this.get('speed').x;
            this.y += this.get('speed').y;
        }
    }

    turnTo(direction) {
        this.direction = direction;
    }

    dock() {
        this.stop();
        this.status = "dock";
        this.action = 0;
        clearInterval(this.routingTimer);
        if (typeof Game !== 'undefined' && Game.pathfinding) Game.pathfinding.cancel(this);
        this.routingTimer = 0;
        this._timer = setInterval(() => {
            this.animeFrame();
        }, 100);
        delete this._routingTarget;
        if (this.commandQueue && this.commandQueue.length > 0) {
            setTimeout(() => {
                if (this.status === 'dock') this.executeNextCommand();
            }, 0);
        }
        else {
            if (this._patrolRoute && !this.destination) {
                this.destination = this._patrolRoute;
            }
        }
    }

    executeNextCommand() {
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
    }

    stand() {
        this.dock();
    }

    stopMoving() {
        this.dock();
    }

    run() {
        this.moving();
    }
}

Unit.prototype.name = "Unit";
Unit.prototype.isFlying = true;
