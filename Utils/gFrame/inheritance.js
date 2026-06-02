import _$ from './core.js';

Function.prototype.extends = function (addInObject) {
  var father = this;
  addInObject = addInObject || {};
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

_$.extends = function (fathers, addInObject) {
  var child = function (props) {
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

_$.classExtends = function (father, addInObject) {
  if (!father) father = function () { };
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

_$.declare = function (globalName, fathers, plusObj) {
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

_$.declareClass = function (globalName, father, plusObj) {
  if (arguments.length === 2) {
    plusObj = father;
    father = globalName;
    globalName = null;
  }
  if (!father) father = function () { };
  if (!plusObj) plusObj = {};
  var constructPlus = plusObj.constructor;
  delete plusObj.constructor;
  var child = _$.classExtends(father, { constructorPlus: constructPlus, prototypePlus: plusObj });
  if (globalName) window[globalName] = child;
  return child;
};

_$.topic = {};

_$.subscribe = function (topic, callback) {
  if (!_$.topic[topic]) _$.topic[topic] = { callbacks: [] };
  _$.topic[topic].callbacks.push(callback);
};

_$.unSubscribe = function (topic, callback) {
  if (!_$.topic[topic] || !_$.topic[topic].callbacks) return;
  var cbs = _$.topic[topic].callbacks;
  var index = cbs.indexOf(callback);
  if (index !== -1) cbs.splice(index, 1);
};

_$.publish = function (topic, msgObj) {
  if (!_$.topic[topic]) return;
  var cbs = _$.topic[topic].callbacks;
  for (var i = 0; i < cbs.length; i++) {
    cbs[i].call(window, msgObj);
  }
};

_$.delegate = function (chara, bufferObj) {
  var F = function () { };
  F.prototype = chara;
  return _$.mixin(new F(), bufferObj);
};

_$.hitch = function (func, thisP) {
  return function () {
    func.apply(thisP, arguments);
  };
};
