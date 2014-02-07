/* Unless specified, be tolerant, and auto-fix slightly-unconforming values. */

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
    if (noo(value) || (_.isNumber(value) && !_isNaN(value))) return value;
    if (_.isString(value)) {
      if (parseFloat(value) !== NaN) return parseFloat(value);
    }
    throw 'Expected a number, but received: ' + value + ' (type is ' + typeof value + ')';
  },

  numberStrict: function (value) {
    if (noo(value) || (_.isNumber(value) && !_isNaN(value))) return value;
    throw 'Expected a number, but received: ' + value + ' (type is ' + typeof value + ')';
  },

  // TODO: Document that it rounds the math-ey way (4.5 to 5.4999 returns 5.)
  integer: function (value) {
    if (noo(value) || (_.isNumber(value) && !_isNaN(value))) return Math.Round(value);
    if (_.isString(value)) {
      if (parseInt(value) !== NaN) return parseInt(value);
    }
    throw 'Expected an integer, but received: ' + value;
  },

  integerStrict: function (value) {
    if (noo(value) || (_.isNumber(value) && !_isNaN(value))) {
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
  }

};