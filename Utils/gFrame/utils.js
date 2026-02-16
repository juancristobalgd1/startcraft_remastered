_$.mixin = function () {
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

_$.copy = function (obj) {
  return _$.mixin(new obj.constructor(), obj);
};

_$.clone = function (obj, ref) {
  var dist = new obj.constructor();
  for (var attr in obj) {
    if (!obj.hasOwnProperty(attr)) continue;
    dist[attr] = (!ref && typeof obj[attr] === 'object' && obj[attr] !== null)
      ? _$.clone(obj[attr])
      : obj[attr];
  }
  return dist;
};

_$.templates = {
  src: {},
  register: function (id, tempStr) {
    _$.templates.src[id] = {
      tempStr: tempStr,
      params: tempStr.match(/\${2}\w+\${2}/g)
    };
  },
  applyOn: function (id, values) {
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

_$.traverse = function (obj, func) {
  for (var attr in obj) {
    if (!obj.hasOwnProperty(attr)) continue;
    if (typeof obj[attr] === 'object' && obj[attr] !== null) {
      _$.traverse(obj[attr], func);
    } else {
      func(obj[attr]);
    }
  }
};

_$.matrixOperation = function (matrix, operation) {
  for (var attr in matrix) {
    if (!matrix.hasOwnProperty(attr)) continue;
    if (typeof matrix[attr] === 'object' && matrix[attr] !== null) {
      _$.matrixOperation(matrix[attr], operation);
    } else {
      matrix[attr] = operation(matrix[attr]);
    }
  }
};

_$.mapTraverse = function (array, operation) {
  var operationTraverse = function (n) {
    return (n instanceof Array) ? n.map(operationTraverse) : operation(n);
  };
  return array.map(operationTraverse);
};

_$.arrayEqual = function (arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (var n = 0; n < arr1.length; n++) {
    if (arr1[n] !== arr2[n]) return false;
  }
  return true;
};
