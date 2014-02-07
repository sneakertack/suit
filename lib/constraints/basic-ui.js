/* Unless specified, be tolerant, and auto-fix slightly-unconforming values. */

var _ = require('lodash');
var validator = require('validator');

// HELPER: Allows undefined/null values.
function noo(value) {
  return (value === undefined || value === null) ? true : false;
}

// Note: Undefineds and nulls always pass, except on the 'required' test.

module.exports = {

  email: function (value) {
    if (noo(value) || validator.isEmail(value)) return value;
    throw 'Not a valid email: ' + value;
  }

};
