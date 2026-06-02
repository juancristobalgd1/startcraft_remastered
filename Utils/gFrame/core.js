
const _$ = function (selector) {
  if (!(this instanceof _$)) return _$.select(selector);
  this.selector = selector;
  return _$.select(selector);
};

_$.select = function (selector) {
  const selectors = selector.trim().split(' ');
  let result = document;
  let tagResult, classResult, _result, attr, val, parts;

  for (let N = 0; N < selectors.length; N++) {
    let curSelector = selectors[N];
    let filter;
    const filterIndex = curSelector.indexOf('[');

    if (filterIndex !== -1) {
      filter = curSelector.substring(filterIndex + 1, curSelector.indexOf(']')).trim();
      curSelector = curSelector.substring(0, filterIndex);
    }

    if (curSelector.indexOf('#') !== -1) {
      const id = curSelector.split('#')[1];
      if (result.length) {
        _result = [];
        for (let M = 0; M < result.length; M++) {
          _result.push(result[M].getElementById(id));
        }
        result = _result;
      } else {
        result = result.getElementById(id);
      }
    } else {
      const TagName = curSelector.indexOf('.') !== -1 ? curSelector.split('.')[0] : curSelector;
      const className = curSelector.split('.')[1];
      tagResult = classResult = undefined;

      if (TagName) {
        if (result.length) {
          _result = [];
          for (let M = 0; M < result.length; M++) {
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
          for (let M = 0; M < result.length; M++) {
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
        for (let M = 0; M < tagResult.length; M++) {
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
        result = result.filter(item => item.getAttribute(attr) == val);
      } else {
        result = result.filter(item => item.getAttribute(filter) != null);
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

window._$ = Object.assign(_$, window._$);
export default _$;
