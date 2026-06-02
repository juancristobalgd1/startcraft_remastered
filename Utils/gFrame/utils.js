import _$ from './core.js';

_$.mixin = function (dist = {}, ...addIns) {
  for (const addIn of addIns) {
    for (const attr in addIn) {
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
  const dist = new obj.constructor();
  for (const attr in obj) {
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
    const valueArray = [].concat(values);
    const src = _$.templates.src[id];
    let result = src.tempStr;
    const count = Math.min(valueArray.length, src.params.length);
    for (let N = 0; N < count; N++) {
      result = result.replace(src.params[N], valueArray[N]);
    }
    return result;
  }
};

_$.traverse = function (obj, func) {
  for (const attr in obj) {
    if (!obj.hasOwnProperty(attr)) continue;
    if (typeof obj[attr] === 'object' && obj[attr] !== null) {
      _$.traverse(obj[attr], func);
    } else {
      func(obj[attr]);
    }
  }
};

_$.matrixOperation = function (matrix, operation) {
  for (const attr in matrix) {
    if (!matrix.hasOwnProperty(attr)) continue;
    if (typeof matrix[attr] === 'object' && matrix[attr] !== null) {
      _$.matrixOperation(matrix[attr], operation);
    } else {
      matrix[attr] = operation(matrix[attr]);
    }
  }
};

_$.mapTraverse = function (array, operation) {
  const operationTraverse = function (n) {
    return (n instanceof Array) ? n.map(operationTraverse) : operation(n);
  };
  return array.map(operationTraverse);
};

_$.arrayEqual = function (arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let n = 0; n < arr1.length; n++) {
    if (arr1[n] !== arr2[n]) return false;
  }
  return true;
};
