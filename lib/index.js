var _ = require('lodash');

// Constraint loader function. Either pass in the name of a set included with suit, or pass in a constraint set directly. Later constraints override earlier constraints with the same name.
module.exports.constraints = function (array) {
  var constraints = {};
  array = array || ['basic-types', 'basic-ui'];
  array.forEach(function (loadee) {
    if (_.isString(loadee)) {
      constraints = _.defaults(require('./constraints/' + loadee), constraints);
    } else if (_.isPlainObject(loadee)) {
      _.forOwn(loadee, function (value, key) {
        if (!_.isFunction(value)) throw 'Encountered a constraint that wasn\'t a function.';
        constraints[key] = value;
      });
    } else {
      // MAYBE: accept single functions as well.
      throw 'Error while loading constraints: Either pass in the name of a set included with suit, or pass a set itself (an object containing constraint functions - possibly through \'require\', or just declared inline).';
    }
  });
  return constraints;
};

// Main function.
module.exports.fit = function (input, schema) {
  var discrepencies = []; // If validation errors occur, this will fill up.

  if (_.isPlainObject(schema)) {
    var stripped = mapPrune(input, schema);
    
    var results = mapRun(stripped, schema, discrepencies);
    if (!_.isEmpty(discrepencies)) throw JSON.stringify(discrepencies);
    return results;
  } else {
    // Edge case: sometimes it's the value itself, rather than an object nested with values, that needs conforming.
    // Uses code adapted from mapRun, so there is probably some room for refactoring.
    if (!_.isArray(schema)) schema = [schema];
    var result;
    try {
      result = schema.reduce(function (prev, curr, index) {
        if (!_.isFunction(curr)) throw 'Index [' + index + ']: Not a function.';
        return curr(prev);
      }, input);
    } catch (e) {
      discrepencies.push(e);
    }
    if (!_.isEmpty(discrepencies)) throw JSON.stringify(discrepencies);
    return result;
  }
  
};

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
  });
  return result;
}
