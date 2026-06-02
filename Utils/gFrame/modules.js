import _$ from './core.js';

_$.modules = {};

_$.sourceLoader = {
  sources: {},
  sourceNum: 0,
  loadedNum: 0,
  allLoaded: true,
  load: function (pathName) {
    _$.sourceLoader.sourceNum++;
    _$.sourceLoader.allLoaded = false;
    var node = document.createElement('script');
    node.onload = function () {
      _$.modules[pathName] = _$.define.loadedBuilders.shift();
      _$.sourceLoader.loaded();
    };
    _$.modules[pathName] = true;
    node.src = pathName + '.js';
    document.getElementsByTagName('head')[0].appendChild(node);
  },
  loaded: function () {
    _$.sourceLoader.loadedNum++;
    if (_$.sourceLoader.loadedNum === _$.sourceLoader.sourceNum) {
      _$.sourceLoader.allLoaded = true;
    }
  },
  allOnLoad: function (callback) {
    if (_$.sourceLoader.allLoaded) {
      callback();
    } else {
      setTimeout(function () {
        _$.sourceLoader.allOnLoad(callback);
      }, 100);
    }
  }
};

_$.instModule = function (name) {
  _$.instModule.refStack.push(name);
  var module = _$.modules[name];

  if (module && module._$isBuilder) {
    var refObjs = [];
    if (module.refArr) {
      for (var i = 0; i < module.refArr.length; i++) {
        var ref = module.refArr[i];
        if (ref[0] === '=') {
          refObjs.push((function (loc) {
            return function () { return _$.modules[loc]; };
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

_$.define = function (refArr, builderFunc) {
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

_$.require = function (refArr, callback) {
  for (var i = 0; i < refArr.length; i++) {
    var ref = refArr[i];
    if (ref[0] === '=') continue;
    if (!_$.modules[ref]) _$.sourceLoader.load(ref);
  }
  _$.sourceLoader.allOnLoad(function () {
    var refObjs = [];
    for (var i = 0; i < refArr.length; i++) {
      refObjs.push(_$.instModule(refArr[i]));
    }
    callback.apply(window, refObjs);
  });
};
