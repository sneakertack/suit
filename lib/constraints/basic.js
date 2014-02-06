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
      throw 'Expected a string, but received: ' + value;
    }
  },

  boolean: function (value) {
    if (noo(value) || _.isBoolean(value)) return value;
    return !!value;
  },

  email: function (value) {
    if (noo(value) || validator.isEmail(value)) return value;
    throw 'Not a valid email: ' + value;
  },

  paypalCurrency: function (value) {
    // MOCK FOR NOW.
    return value;
  }
};
