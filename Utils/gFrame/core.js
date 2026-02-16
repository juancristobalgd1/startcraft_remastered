var _$ = function (selector) {
  if (!(this instanceof _$)) return _$.select(selector);
  this.selector = selector;
  return _$.select(selector);
};

_$.select = function (selector) {
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

    if (filter) {
      if (filter.indexOf('=') !== -1) {
        parts = filter.split('=');
        attr = parts[0];
        val = parts.slice(1).join('=');
        if ((val[0] === '"' && val[val.length - 1] === '"') ||
          (val[0] === "'" && val[val.length - 1] === "'")) {
          val = val.substring(1, val.length - 1);
        }
        result = result.filter(function (item) {
          return item.getAttribute(attr) == val;
        });
      } else {
        result = result.filter(function (item) {
          return item.getAttribute(filter) != null;
        });
      }
    }
  }
  return result;
};

if (!String.prototype.contains) {
  String.prototype.contains = function (str) {
    return this.indexOf(str) !== -1;
  };
}

window.requestAnimationFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  window.oRequestAnimationFrame;

_$.requestAnimationFrame = window.requestAnimationFrame;
