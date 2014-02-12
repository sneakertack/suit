/* Unless specified, be tolerant, and auto-fix slightly-unconforming values. */

var suit = require('../index'); // Used in recursive steps.
var _ = require('lodash');
var validator = require('validator');

// HELPER: Allows undefined/null values.
function noo(value) {
  return (value === undefined || value === null) ? true : false;
}

// Note: Undefineds and nulls always pass, except on the 'required' test.

module.exports = {

  any: function (value) {
    return value;
  },

  required: function (value) {
    if (noo(value)) throw 'Is required, but received: ' + value;
    return value;
  },

  default: function (defaultValue) {
    return function (value) {
      if (noo(value)) return defaultValue;
      return value;
    };
  },

  string: function (value) {
    if (noo(value) || _.isString(value)) return value;
    try {
      return value.toString();
    } catch (e) {
      throw 'Expected a string, but received: ' + value + ' (type is ' + typeof value + ')';
    }
  },

  stringStrict: function (value) {
    if (noo(value) || _.isString(value)) return value;
    throw 'Expected a string, but received: ' + value + ' (type is ' + typeof value + ')';
  },

  // TODO: Document that NaN is not valid.
  // TODO: Decide twhether to convert trues and falses to 1s and 0s (seems like no).
  number: function (value) {
    if (noo(value) || (_.isNumber(value) && !_.isNaN(value))) return value;
    if (_.isString(value)) {
      if (!_.isNaN(parseFloat(value))) return parseFloat(value);
    }
    throw 'Expected a number, but received: ' + value + ' (type is ' + typeof value + ')';
  },

  numberStrict: function (value) {
    if (noo(value) || (_.isNumber(value) && !_.isNaN(value))) return value;
    throw 'Expected a number, but received: ' + value + ' (type is ' + typeof value + ')';
  },

  // TODO: Document that it rounds the math-ey way (4.5 to 5.4999 returns 5.)
  integer: function (value) {
    if (noo(value) || (_.isNumber(value) && !_.isNaN(value))) return Math.round(value);
    if (_.isString(value)) {
      if (!_.isNaN(parseInt(value))) return parseInt(value);
    }
    throw 'Expected an integer, but received: ' + value;
  },

  integerStrict: function (value) {
    if (noo(value) || (_.isNumber(value) && !_.isNaN(value))) {
      // Note that 5.0 will pass, but it's okay, because the output will become 5 anyway.
      if (value === Math.round(value)) return Math.round(value);
      throw 'Expected an integer, but received a float: ' + value;
    }
    throw 'Expected an integer, but received: ' + value;
  },

  // No decimals, because there's no good universal storage for decimals in JS.

  boolean: function (value) {
    if (noo(value) || _.isBoolean(value)) return value;
    return !!value;
  },

  booleanStrict: function (value) {
    if (noo(value) || _.isBoolean(value)) return value;
    throw 'Expected a boolean, but received: ' + value + ' (type is ' + typeof value + ').';
  },

  array: function (constraints) {
    return function (array) {
      if (noo(array)) return array;
      if (_.isArray(array)) {
        return array.map(function (value) {
          return suit.fit(value, schema); // Schema expected to be a function, or an array of functions.
        });
      }
      throw 'Expected an array, but received: ' + value + ' (type is ' + typeof value + ').';
    };
  },

  // An array of objects, where each object follows a consistent schema.
  // Array and collection actually use the same code, so they can also be treated as aliases of one another.
  collection: function (schema) {
    return function (array) {
      if (noo(array)) return array;
      if (_.isArray(array)) {
        return array.map(function (value) {
          return suit.fit(value, schema); // Schema expected to be an object.
        });
      }
      throw 'Expected a collection (array of similar objects), but received: ' + value + ' (type is ' + typeof value + ').';
    };
  },

  min: function (minValue) {
    return function (value) {
      if (noo(value)) return value;
      if (_.isNumber(value) && !_.isNaN(value)) {
        return Math.max(value, minValue);
      }
      if (_.isArray(value) || _.isString(value)) {
        if (value.length >= minValue) return value;
        throw 'Length of ' + value + ' (type ' + typeof value + ') is less than the required minimum of ' + minValue + ' (got ' + value.length + ')';
      }
      throw 'Expected a number, string, or array.';
    };
  },

  minStrict: function (minValue) {
    return function (value) {
      if (noo(value)) return value;
      if (_.isNumber(value) && !_.isNaN(value)) {
        if (value >= minValue) return value;
        throw 'Value is below the minimum of ' + minValue;
      }
      if (_.isArray(value) || _.isString(value)) {
        if (value.length >= minValue) return value;
        throw 'Length of ' + value + ' (type ' + typeof value + ') is less than the required minimum of ' + minValue + ' (got ' + value.length + ')';
      }
      throw 'Expected a number, string, or array.';
    };
  },

  max: function (maxValue) {
    return function (value) {
      if (noo(value)) return value;
      if (_.isNumber(value) && !_.isNaN(value)) {
        return Math.min(value, maxValue);
      }
      if (_.isArray(value) || _.isString(value)) {
        if (value.length <= maxValue) return value;
        throw 'Length of ' + value + ' (type ' + typeof value + ') is more than the allowed maximum of ' + maxValue + ' (got ' + value.length + ')';
      }
      throw 'Expected a number, string, or array.';
    };
  },

  maxStrict: function (maxValue) {
    return function (value) {
      if (noo(value)) return value;
      if (_.isNumber(value) && !_.isNaN(value)) {
        if (value <= maxValue) return value;
        throw 'Value is above the maximum of ' + maxValue;
      }
      if (_.isArray(value) || _.isString(value)) {
        if (value.length <= maxValue) return value;
        throw 'Length of ' + value + ' (type ' + typeof value + ') is more than the allowed maximum of ' + maxValue + ' (got ' + value.length + ')';
      }
      throw 'Expected a number, string, or array.';
    };
  }

};
