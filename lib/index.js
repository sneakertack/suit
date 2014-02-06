var _ = require('lodash');

// When more constraints, make this load multiple files.
module.exports.constraints = require('./constraints/basic.js');

// Main function.
module.exports.fit = function (input, schema) {
  var stripped = mapPrune(input, schema);
  var discrepencies = []; // If validation errors occur, this will fill up.
  var results = mapRun(stripped, schema, discrepencies);
  if (!_.isEmpty(discrepencies)) throw JSON.stringify(discrepencies);
  return results;
}

// Returns a copy of the input in which any property that hasn't explicitly been expressed in the schema is stripped.
function mapPrune(input, schema) {
  var result = {};
  _.forOwn(schema, function (value, key) {
    if (_.isPlainObject(value)) {
      // Recursive.
      result[key] = mapPrune(input[key] || {}, value);
    } else {
      // Base. Null is set as the default value.
      result[key] = input[key] || null;
    }
  });
  return result;
}

// Returns a result map of running the schema's tests/transformers against an input object.
function mapRun(input, schema, discrepencies) {
  var result = {};
  _.forOwn(schema, function (value, key) {
    if (_.isPlainObject(value)) {
      // Recursive. Others are bases.
      result[key] = mapRun(input[key], value, discrepencies);
    } else if (_.isArray(value)) {
      try {
        result[key] = value.reduce(function (prev, curr, index) {
          if (!_.isFunction(curr)) throw 'Index [' + index + ']: Not a function.';
          return curr(prev);
        }, input[key]);
      } catch (e) {
        discrepencies.push('' + key + ': ' + e);
      }
    } else if (_.isFunction(value)) {
      try {
        result[key] = value(input[key]); // Result of running that function against the input.
      } catch (e) {
        discrepencies.push('' + key + ': ' + e);
      }
    } else {
      throw new TypeError('Schemas should be a nested object of functions or function arrays.');
    }
  })
  return result;
}
