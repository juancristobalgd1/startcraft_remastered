/**
 * gFrame namespace — DOM selector & utility framework
 * Backward-compatible refactor: no API changes, same logic
 */
var _$ = function(selector) {
    var selectors = selector.trim().split(' ');
    var result = document;
    var N, M, curSelector, filter, filterIndex, id, TagName, className,
        tagResult, classResult, _result, attr, val, parts;

    for (N = 0; N < selectors.length; N++) {
        curSelector = selectors[N];
        filter = undefined;
        filterIndex = curSelector.indexOf('[');

        if (filterIndex !== -1) {
            filter = curSelector.substring(filterIndex + 1, curSelector.indexOf(']')).trim();
            curSelector = curSelector.substring(0, filterIndex);
        }

        if (curSelector.indexOf('#') !== -1) {
            id = curSelector.split('#')[1];
            if (result.length) {
                _result = [];
                for (M = 0; M < result.length; M++) {
                    _result.push(result[M].getElementById(id));
                }
                result = _result;
            } else {
                result = result.getElementById(id);
            }
        } else {
            TagName = curSelector.indexOf('.') !== -1 ? curSelector.split('.')[0] : curSelector;
            className = curSelector.split('.')[1];
            tagResult = classResult = undefined;

            if (TagName) {
                if (result.length) {
                    _result = [];
                    for (M = 0; M < result.length; M++) {
                        _result = _result.concat($.makeArray(result[M].getElementsByTagName(TagName)));
                    }
                    tagResult = _result;
                } else {
                    tagResult = $.makeArray(result.getElementsByTagName(TagName));
                }
            }

            if (className) {
                if (result.length) {
                    _result = [];
                    for (M = 0; M < result.length; M++) {
                        _result = _result.concat($.makeArray(result[M].getElementsByClassName(className)));
                    }
                    classResult = _result;
                } else {
                    classResult = $.makeArray(result.getElementsByClassName(className));
                }
            }

            if (TagName && !className) result = tagResult;
            if (!TagName && className) result = classResult;
            if (TagName && className) {
                _result = [];
                for (M = 0; M < tagResult.length; M++) {
                    if (classResult.indexOf(tagResult[M]) !== -1) _result.push(tagResult[M]);
                }
                result = _result;
            }
        }

        // Apply filter
        if (filter) {
            if (filter.indexOf('=') !== -1) {
                parts = filter.split('=');
                attr = parts[0];
                // Safe parse: strips quotes instead of eval
                val = parts.slice(1).join('=');
                if ((val[0] === '"' && val[val.length - 1] === '"') ||
                    (val[0] === "'" && val[val.length - 1] === "'")) {
                    val = val.substring(1, val.length - 1);
                }
                result = result.filter(function(item) {
                    return item.getAttribute(attr) == val;
                });
            } else {
                result = result.filter(function(item) {
                    return item.getAttribute(filter) != null;
                });
            }
        }
    }
    return result;
};

// String.contains polyfill — guarded to not override native
if (!String.prototype.contains) {
    String.prototype.contains = function(str) {
        return this.indexOf(str) !== -1;
    };
}

// requestAnimationFrame polyfill
window.requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    window.oRequestAnimationFrame;

/**
 * Prototypal inheritance via .extends()
 * father.extends({constructorPlus, prototypePlus}) → child
 */
Function.prototype.extends = function(addInObject) {
    var father = this;
    var child = function(props) {
        if (props) {
            father.call(this, props);
            addInObject.constructorPlus.call(this, props);
        }
    };
    // Clean prototype chain (no father constructor side-effects)
    var F = function() {};
    F.prototype = father.prototype;
    child.prototype = new F();
    child.prototype.constructor = child;

    // Merge prototype additions
    var prototypePlus = addInObject.prototypePlus;
    for (var attr in prototypePlus) {
        if (prototypePlus.hasOwnProperty(attr)) {
            child.prototype[attr] = prototypePlus[attr];
        }
    }

    // Super/inherited references
    child.prototype.super = father;
    child.prototype.inherited = father.prototype;
    child.super = father;
    child.inherited = father.prototype;

    return child;
};

// Audio extensions
Audio.prototype.playFromStart = function() {
    this.pause();
    this.currentTime = 0;
    this.play();
};

// Audio registry — pause/resume all tracked audio
_$.audioRegistry = [];

_$.registerAudio = function(audio) {
    if (!audio || _$.audioRegistry.indexOf(audio) !== -1) return;
    _$.audioRegistry.push(audio);
};

_$.pauseAllAudio = function() {
    var a, playing;
    for (var i = 0, len = _$.audioRegistry.length; i < len; i++) {
        a = _$.audioRegistry[i];
        if (!a) continue;
        playing = false;
        try { playing = !a.paused && !a.ended; } catch (e) {}
        a.__wasPlayingBeforePause = playing;
        if (playing) {
            try { a.pause(); } catch (e) {}
        }
    }
};

_$.resumeAllAudio = function() {
    var a, p;
    for (var i = 0, len = _$.audioRegistry.length; i < len; i++) {
        a = _$.audioRegistry[i];
        if (!a || !a.__wasPlayingBeforePause) continue;
        a.__wasPlayingBeforePause = false;
        try {
            p = a.play();
            if (p && typeof p.catch === 'function') p.catch(function() {});
        } catch (e) {}
    }
};

// Patch Audio.play to auto-register & swallow promise rejections
if (!Audio.prototype.__scAudioPlayPatched) {
    Audio.prototype.__scAudioPlayPatched = true;
    var __nativePlay = Audio.prototype.play;
    Audio.prototype.play = function() {
        if (window._$ && _$.registerAudio) _$.registerAudio(this);
        var p = __nativePlay.apply(this, arguments);
        if (p && typeof p.catch === 'function') p.catch(function() {});
        return p;
    };
}

/**
 * Lazy-loaded audio: defers Audio object creation until first play
 */
_$.lazyAudio = function(src) {
    return {
        _audio: null,
        _ensure: function() {
            if (!this._audio) this._audio = new Audio(src);
            if (window._$ && _$.registerAudio) _$.registerAudio(this._audio);
            return this._audio;
        },
        play: function() {
            try {
                var p = this._ensure().play();
                if (p && typeof p.catch === 'function') p.catch(function() {});
                return p;
            } catch (e) { return null; }
        },
        pause: function() {
            if (this._audio) this._audio.pause();
        },
        playFromStart: function() {
            try { this._ensure().playFromStart(); } catch (e) {}
        }
    };
};

/**************** _$ namespace utilities *******************/

_$.requestAnimationFrame = window.requestAnimationFrame;

/**
 * Multiple inheritance via _$.extends(fathers[], {constructorPlus, prototypePlus})
 */
_$.extends = function(fathers, addInObject) {
    var child = function(props) {
        if (!(fathers instanceof Array)) throw '_$.extends need array type parameter fathers!';
        for (var i = 0; i < fathers.length; i++) {
            fathers[i].call(this, props);
        }
        addInObject.constructorPlus.call(this, props);
    };

    if (fathers.length > 0) {
        var mixinProto = fathers[0].prototype;
        for (var N = 1; N < fathers.length; N++) {
            mixinProto = _$.delegate(mixinProto, fathers[N].prototype);
            mixinProto.constructor = fathers[N];
        }
        child.prototype = _$.delegate(mixinProto, addInObject.prototypePlus);
        child.prototype.constructor = child;
    } else {
        var prototypePlus = addInObject.prototypePlus;
        for (var attr in prototypePlus) {
            if (prototypePlus.hasOwnProperty(attr)) {
                child.prototype[attr] = prototypePlus[attr];
            }
        }
    }
    return child;
};

/** Shallow merge (like $.extend) */
_$.mixin = function() {
    var dist = arguments[0] || {};
    for (var N = 1; N < arguments.length; N++) {
        var addIn = arguments[N];
        for (var attr in addIn) {
            if (addIn.hasOwnProperty(attr)) {
                dist[attr] = addIn[attr];
            }
        }
    }
    return dist;
};

/** Shallow copy (one level, reference) */
_$.copy = function(obj) {
    return _$.mixin(new obj.constructor(), obj);
};

/** Deep clone. ref=true → shallow clone only */
_$.clone = function(obj, ref) {
    var dist = new obj.constructor();
    for (var attr in obj) {
        if (!obj.hasOwnProperty(attr)) continue;
        dist[attr] = (!ref && typeof obj[attr] === 'object' && obj[attr] !== null)
            ? _$.clone(obj[attr])
            : obj[attr];
    }
    return dist;
};

/** Simple string template engine */
_$.templates = {
    src: {},
    register: function(id, tempStr) {
        _$.templates.src[id] = {
            tempStr: tempStr,
            params: tempStr.match(/\${2}\w+\${2}/g)
        };
    },
    applyOn: function(id, values) {
        var valueArray = [].concat(values);
        var src = _$.templates.src[id];
        var result = src.tempStr;
        var count = Math.min(valueArray.length, src.params.length);
        for (var N = 0; N < count; N++) {
            result = result.replace(src.params[N], valueArray[N]);
        }
        return result;
    }
};

/** Deep traverse: calls func on every leaf value */
_$.traverse = function(obj, func) {
    for (var attr in obj) {
        if (!obj.hasOwnProperty(attr)) continue;
        if (typeof obj[attr] === 'object' && obj[attr] !== null) {
            _$.traverse(obj[attr], func);
        } else {
            func(obj[attr]);
        }
    }
};

/** In-place matrix/nested-object transform */
_$.matrixOperation = function(matrix, operation) {
    for (var attr in matrix) {
        if (!matrix.hasOwnProperty(attr)) continue;
        if (typeof matrix[attr] === 'object' && matrix[attr] !== null) {
            _$.matrixOperation(matrix[attr], operation);
        } else {
            matrix[attr] = operation(matrix[attr]);
        }
    }
};

/** Recursive map for nested arrays */
_$.mapTraverse = function(array, operation) {
    var operationTraverse = function(n) {
        return (n instanceof Array) ? n.map(operationTraverse) : operation(n);
    };
    return array.map(operationTraverse);
};

/** Shallow array equality */
_$.arrayEqual = function(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (var n = 0; n < arr1.length; n++) {
        if (arr1[n] !== arr2[n]) return false;
    }
    return true;
};

/********** Module system (AMD-like) **********/
_$.modules = {};

_$.sourceLoader = {
    sources: {},
    sourceNum: 0,
    loadedNum: 0,
    allLoaded: true,
    load: function(pathName) {
        _$.sourceLoader.sourceNum++;
        _$.sourceLoader.allLoaded = false;
        var node = document.createElement('script');
        node.onload = function() {
            _$.modules[pathName] = _$.define.loadedBuilders.shift();
            _$.sourceLoader.loaded();
        };
        _$.modules[pathName] = true; // Block duplicate loads
        node.src = pathName + '.js';
        document.getElementsByTagName('head')[0].appendChild(node);
    },
    loaded: function() {
        _$.sourceLoader.loadedNum++;
        if (_$.sourceLoader.loadedNum === _$.sourceLoader.sourceNum) {
            _$.sourceLoader.allLoaded = true;
        }
    },
    allOnLoad: function(callback) {
        if (_$.sourceLoader.allLoaded) {
            callback();
        } else {
            setTimeout(function() {
                _$.sourceLoader.allOnLoad(callback);
            }, 100);
        }
    }
};

/** Instantiate a module and its dependencies */
_$.instModule = function(name) {
    _$.instModule.refStack.push(name);
    var module = _$.modules[name];

    if (module && module._$isBuilder) {
        var refObjs = [];
        if (module.refArr) {
            for (var i = 0; i < module.refArr.length; i++) {
                var ref = module.refArr[i];
                if (ref[0] === '=') {
                    // Closure reference
                    refObjs.push((function(loc) {
                        return function() { return _$.modules[loc]; };
                    })(ref.substr(1)));
                } else {
                    if (_$.instModule.refStack.indexOf(ref) !== -1) {
                        throw 'Loop reference found: ' + name + ' --> ' + ref;
                    }
                    refObjs.push(_$.instModule(ref));
                }
            }
        }
        _$.modules[name] = module.apply(window, refObjs);
    }

    _$.instModule.refStack.pop();
    return _$.modules[name];
};
_$.instModule.refStack = [];

/** Define a module with dependencies */
_$.define = function(refArr, builderFunc) {
    for (var i = 0; i < refArr.length; i++) {
        var ref = refArr[i];
        if (ref[0] === '=') continue;
        if (!_$.modules[ref]) _$.sourceLoader.load(ref);
    }
    builderFunc.refArr = refArr;
    builderFunc._$isBuilder = true;
    _$.define.loadedBuilders.push(builderFunc);
};
_$.define.loadedBuilders = [];

/** Require modules then run callback */
_$.require = function(refArr, callback) {
    for (var i = 0; i < refArr.length; i++) {
        var ref = refArr[i];
        if (ref[0] === '=') continue;
        if (!_$.modules[ref]) _$.sourceLoader.load(ref);
    }
    _$.sourceLoader.allOnLoad(function() {
        var refObjs = [];
        for (var i = 0; i < refArr.length; i++) {
            refObjs.push(_$.instModule(refArr[i]));
        }
        callback.apply(window, refObjs);
    });
};

/** Declare class with multiple inheritance (Dojo-style) */
_$.declare = function(globalName, fathers, plusObj) {
    if (arguments.length === 2) {
        plusObj = fathers;
        fathers = globalName;
        globalName = null;
    }
    if (!fathers) fathers = [];
    var constructPlus = plusObj.constructor;
    delete plusObj.constructor;
    var child = _$.extends(fathers, { constructorPlus: constructPlus, prototypePlus: plusObj });
    if (globalName) window[globalName] = child;
    return child;
};

/** ES6 class-based extends */
_$.classExtends = function(father, addInObject) {
    if (!father) father = function() {};
    if (!addInObject) addInObject = {};
    var constructorPlus = addInObject.constructorPlus;
    var prototypePlus = addInObject.prototypePlus || {};

    var child = class extends father {
        constructor(props) {
            super(props);
            if (props && constructorPlus) constructorPlus.call(this, props);
        }
    };

    for (var attr in prototypePlus) {
        if (prototypePlus.hasOwnProperty(attr)) {
            child.prototype[attr] = prototypePlus[attr];
        }
    }
    child.prototype.super = father;
    child.prototype.inherited = father.prototype;
    child.super = father;
    child.inherited = father.prototype;
    return child;
};

/** Declare class using ES6 class syntax */
_$.declareClass = function(globalName, father, plusObj) {
    if (arguments.length === 2) {
        plusObj = father;
        father = globalName;
        globalName = null;
    }
    if (!father) father = function() {};
    if (!plusObj) plusObj = {};
    var constructPlus = plusObj.constructor;
    delete plusObj.constructor;
    var child = _$.classExtends(father, { constructorPlus: constructPlus, prototypePlus: plusObj });
    if (globalName) window[globalName] = child;
    return child;
};

/** Pub/Sub */
_$.topic = {};

_$.subscribe = function(topic, callback) {
    if (!_$.topic[topic]) _$.topic[topic] = { callbacks: [] };
    _$.topic[topic].callbacks.push(callback);
};

_$.unSubscribe = function(topic, callback) {
    if (!_$.topic[topic] || !_$.topic[topic].callbacks) return;
    var cbs = _$.topic[topic].callbacks;
    var index = cbs.indexOf(callback);
    if (index !== -1) cbs.splice(index, 1);
};

_$.publish = function(topic, msgObj) {
    if (!_$.topic[topic]) return;
    var cbs = _$.topic[topic].callbacks;
    for (var i = 0; i < cbs.length; i++) {
        cbs[i].call(window, msgObj);
    }
};

/** Delegate: creates object with proto chain + buffer overlay */
_$.delegate = function(chara, bufferObj) {
    var F = function() {};
    F.prototype = chara;
    return _$.mixin(new F(), bufferObj);
};

/** Hitch: bind function to a fixed `this` context */
_$.hitch = function(func, thisP) {
    return function() {
        func.apply(thisP, arguments);
    };
};