// Gobj - Optimized game object base class
class Gobj {
    #privateData = { _timer: -1 };

    constructor(props) {
        if (!props) return;
        this.x = props.x;
        this.y = props.y;

        if (props.target instanceof Gobj) {
            this.x = (props.target.posX() - this.width / 2) | 0;
            this.y = (props.target.posY() - this.height / 2) | 0;
        }

        this.action = 0;
        this.status = "";
        this.buffer = {};
        this.override = {};
        this.bufferObjs = [];
        this._timer = -1;

        this.#privateData = { _timer: -1 };
        
        this.getP = function (attr) {
            return attr ? this.#privateData[attr] : this.#privateData;
        };
        this.setP = function (attr, value) {
            this.#privateData[attr] = value;
        };
    }
}

var proto = Gobj.prototype;

// Defaults
proto.name = "Gobj";
proto.width = 0;
proto.height = 0;
proto.speed = { x: 0, y: 0 };
proto.frame = { moving: 1 };
proto.imgPos = {
    moving: {
        left: [0, 0, 0, 0, 0, 0, 0, 0],
        top: [0, 0, 0, 0, 0, 0, 0, 0]
    }
};

proto.posX = function () {
    return this.x + this.width * 0.5;
};

proto.posY = function () {
    return this.y + this.height * 0.5;
};

proto.detectOutOfBound = function () { };

proto.updateLocation = function () {
    if (typeof Game !== 'undefined' && Game && Game.isPaused) return;
    this.x += this.speed.x;
    this.y += this.speed.y;
};

proto.animeFrame = function () {
    if (typeof Game !== 'undefined' && Game && Game.isPaused) return;
    if (++this.action >= this.frame[this.status]) {
        this.action = 0;
    }
};

proto.moving = function () {
    this.stop();
    this.status = "moving";
    var self = this;

    var tick = function () {
        if (typeof Game !== 'undefined' && Game && Game.isPaused) return;
        self.animeFrame();
        self.updateLocation();
        self.detectOutOfBound();
    };

    tick();
    this._timer = setInterval(tick, 100);
};

proto.stop = function () {
    clearInterval(this._timer);
    clearTimeout(this._timer);
    this._timer = -1;
};

proto.die = function () {
    this.stop();
    this.status = "dead";
    this.action = 0;
    if (this.dieEffect) {
        new this.dieEffect({ x: this.posX(), y: this.posY() });
    }
};

proto.include = function (obj) {
    var px = obj.posX(), py = obj.posY();
    return py > this.y && py < this.y + this.height &&
        px > this.x && px < this.x + this.width;
};

proto.includePoint = function (x, y) {
    return y > this.y && y < this.y + this.height &&
        x > this.x && x < this.x + this.width;
};

proto.insideSquare = function (rect) {
    var dx = Math.abs(rect.centerX - this.posX());
    var dy = Math.abs(rect.centerY - this.posY());
    var r = rect.radius;
    return Array.isArray(r) ? (dx < r[0] && dy < r[1]) : (dx < r && dy < r);
};

proto.insideRect = function (rect) {
    var px = this.posX(), py = this.posY();
    return px > rect.start.x && px < rect.end.x &&
        py > rect.start.y && py < rect.end.y;
};

proto.insideCircle = function (circle) {
    var dx = circle.centerX - this.posX();
    var dy = circle.centerY - this.posY();
    var r = circle.radius;
    return dx * dx + dy * dy < r * r;
};

proto.inside = proto.insideCircle;

proto.radius = function () {
    return Math.min(this.width, this.height) * 0.5;
};

proto.distanceFrom = function (obj) {
    var tx = obj instanceof Gobj ? obj.posX() : obj.x;
    var ty = obj instanceof Gobj ? obj.posY() : obj.y;
    var dx = this.posX() - tx;
    var dy = this.posY() - ty;
    return Math.sqrt(dx * dx + dy * dy);
};

proto.insideScreen = function () {
    return (this.x + this.width) > GameMap.offsetX &&
        this.x < GameMap.offsetX + Game.HBOUND &&
        (this.y + this.height) > GameMap.offsetY &&
        this.y < GameMap.offsetY + Game.VBOUND;
};

proto.isIdle = function () {
    return this.status === "dock";
};

proto.canSee = function (enemy) {
    return enemy.inside({
        centerX: this.posX(),
        centerY: this.posY(),
        radius: this.get('sight')
    });
};

// Reemplazo de eval() - acceso seguro a propiedades anidadas
proto.get = function (prop) {
    var result;
    if (prop.indexOf('.') === -1) {
        result = this[prop];
        if (result === undefined && this.constructor) result = this.constructor[prop];
    }
    else {
        var parts = prop.split('.');
        result = parts.reduce(function (o, k) { return o && o[k]; }, this);
        if (result === undefined && this.constructor) {
            var root = this.constructor[parts[0]];
            if (root !== undefined) {
                result = parts.slice(1).reduce(function (o, k) { return o && o[k]; }, root);
            }
        }
    }

    return (Array.isArray(result) && result.shareFlag)
        ? result[Number(this.isEnemy)]
        : result;
};

proto.addBuffer = function (bufferObj, onAll) {
    for (var prop in bufferObj) {
        if (!this.override[prop]) this.override[prop] = [];
        var buffer = bufferObj[prop];
        this.override[prop].unshift(buffer);
        if (this[prop] != null || prop === 'isInvisible' || onAll) {
            this[prop] = buffer;
        }
    }
    this.bufferObjs.push(bufferObj);
    if (this === Game.selectedUnit) Button.reset();
};

proto.removeBuffer = function (bufferObj) {
    var idx = this.bufferObjs.indexOf(bufferObj);
    if (idx === -1) return false;

    for (var prop in bufferObj) {
        var list = this.override[prop];
        var i = list.indexOf(bufferObj[prop]);
        if (i !== -1) list.splice(i, 1);

        if (list.length > 0) this[prop] = list[0];
        else delete this[prop];
    }

    this.bufferObjs.splice(idx, 1);
    if (this === Game.selectedUnit) Button.reset();
    return true;
};

proto.cannotMove = function () {
    return (this instanceof Building && !this.isFlying) || Boolean(this.burrowBuffer);
};

proto.evolveTo = function (charaType, burstArr) {
    var self = this;
    var newTypeChara = null;
    var wasSelected = this.selected;
    var wasMain = this === Game.selectedUnit;

    this.dieEffect = this.sound.death = null;
    this.die();
    if (this.processing) delete this.processing;

    var bornAt = function (ref) {
        newTypeChara = new charaType({ target: ref });
        setTimeout(function () {
            if (wasSelected) Game.addIntoAllSelected(newTypeChara);
            if (wasMain) Game.changeSelectedTo(newTypeChara);
        }, 0);
    };

    if (!burstArr) {
        bornAt(this);
        return newTypeChara;
    }

    var pos = { x: this.posX(), y: this.posY() };
    var birth = new Burst[burstArr[0]](pos);
    var len = burstArr.length;

    var chain = function (n) {
        return function () {
            birth = new Burst[burstArr[n]](pos);
            if (n + 1 < len) {
                birth.callback = chain(n + 1);
            } else {
                birth.callback = function () {
                    var times = charaType.prototype.birthCount || 1;
                    for (var i = 0; i < times; i++) bornAt(birth);
                };
            }
        };
    };

    if (len > 1) {
        birth.callback = chain(1);
    } else {
        birth.callback = function () {
            var times = charaType.prototype.birthCount || 1;
            for (var i = 0; i < times; i++) bornAt(birth);
        };
    }

    return newTypeChara;
};

Gobj.detectorBuffer = { isInvisible: false };
