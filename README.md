Suit.js
=======

Simple JS object validation.

*Note: This library is not entirely ready for public consumption yet. Expect unexpected bugs.*

Basic Usage
------

Run `npm install suit`. Then require as required in code.

```js
var suit = require('suit');
var s = suit.constraints();

// suit.fit is a function that takes an input object and a schema object and returns a fitted object.
// suit.fit(input, schema) => output

var schema = {
  name: s.string,
  age: s.number,
  stats: {
    weight: s.number,
    height: s.number
  }
}

var input = {
  name: 'Bob',
  age: '42',
  stats: {
    weight: 84
  }
}

suit.fit(input, schema);
/*
Returns the following:
{
  name: 'Bob',
  age: 42,
  stats: {
    weight: 84,
    height: null
  }
}
*/
```

The `suit` library has only 2 main parts: 1) the `suit.fit` function, which conforms your input according to a desired schema, and 2) the `suit.constraints` function, which loads constraints you can use in building your schemas (including some common defaults like `string`, `number`, `collection`, etc.).

What it Does
------

`suit.fit` takes an input object, a schema object, and returns an output object.

For malformed input, suit's default policy is to try and knock it into shape so that it can pass. So types get auto-converted, decimals get rounded, nulls and undefineds pass, etc. 

If that fails, then suit will throw an error listing all the properties that failed. Your app needs to catch that error and do something useful with it.

TODO: So some code examples for both good and bad input would be nice.

What constraints can I work with?
------

Things like:

- Constraints that enforce type, like s.string, s.stringStrict, s.integer, etc.
- Constraints that deal with necessaryness, like s.default(false) or s.required.
- List-based constraints, like s.array(s.string) or s.collection({property: s.string}). They accept a schema as an argument and run the schema against all their members.
- And other things. See files in lib/constraints to see what's currently available.

This list is not really helpful, because I haven't written the helpful list yet.

TODO: Write a better reference, rather than pointing to source.

Oh and constraints are just simple functions, so you can add your own fairly easily. See below below for more.

Multiple Constraints
------

You can supply an array of constraints for a property - they'll be run from left to right.

```js
var schema = {
  percentage: [s.integer, s.min(0), s.max(100)]
}

suit.fit({percentage: 65.48}, schema); // {percentage: 65}
suit.fit({percentage: '44'}, schema); // {percentage: 44}
suit.fit({percentage: -11}, schema); // {percentage: 0}
suit.fit({}, schema); // {percentage: null}
suit.fit({percentage: {makeGo: 'kablooey'}}, schema); // Throws an error. s.integer doesn't know what to do with an object.
```

Nesting
------

`suit.fit` is really friendly to objects of arbitrary depth.

```js
var schema = {
  id: [s.integer, s.required],
  admin: [s.boolean, s.default(false)],
  address: {
    street: s.string,
    postalCode: [s.integer, s.length(6)],
    country: {
      code: [s.string, s.length(2)],
      name: s.string
    }
  },
  pets: s.collection({
    name: s.string,
    color: s.string
  })
}

suit.fit({
  id: 2,
  address: {
    street: '11 Roadey Road',
    postalCode: 123456,
    country:
      code: 'SG',
      name: 'Singapore'
  },
  pets: [{
    name: 'spot',
    color: 'brown'
  }, {
    name: 'nyan',
    color: 'multi'
  }]
}, schema); // Everything passes, and the output has an additional admin property that's false.
```

Non-objects
------

Also, the input doesn't even need to be an object. So it works as a string/number/etc. validator.

```js
suit.fit('Bob Schrodinger', [s.string, s.min(2)]); // Returns 'Bob Schrodinger'
suit.fit('i are very clever', [s.devowel, s.cap, s.nospace]); // Returns 'IRVRYCLVR'
// Note: devowel, cap, and nospace aren't official suit constraints, they're just there to stimulate your imagination. If you really want them you'll have to build them, see next section.
```

What's a constraint
------
A constraint is simply a function that takes a single input argument. If all is well it outputs the original input (or a slightly amended version of the input). If all is not well it throws an error.

```js
// Source for s.integer
// noo() refers to a convenience function that checks whether the value is null or undefined - handling null/undefined is not this constraint's job, so it just lets it pass.
// Notice that we can just use other library's validators (e.g. lodash) instead of inventing our own.
module.exports.integer = function (value) {
  if (noo(value)) return value;
  if (_.isNumber(value) && !_.isNaN(value)) return Math.round(value);
  if (_.isString(value)) {
    if (!_.isNaN(parseInt(value))) return parseInt(value);
  }
  throw 'Expected an integer, but received: ' + value;
};

// Source for s.min
// s.min is used like s.min(17), which is why it's a function that returns a function.
module.exports.min = function (minValue) {
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
};
```

Adding your own constraints
------

You have a few ways of adding your own constraints:

1. You can put them in a seperate file and then load using suit.constraints(),

**Actually, this method is offline right now, because I haven't settled how suit.constraints() pathfinds for custom constraint files yet.**

```js
// my-app/special-needs.js

module.exports.cap = function (value) {
  if (value === undefined || value === null) return value;
  if (_.isString(value)) return value.toUpperCase();
  throw 'Expected a string but got type: ' + typeof value;
}
```

```js
var suit = require('suit');
var s = suit.constraints([
  'basic-types', // Included by default.
  'basic-ui', // Included by default.
  '/my-app/special-needs.js'
]);

suit.fit('im listening', s.cap); // 'IM LISTENING'
```

2. You can also pass suit.constraints an inline hash of constraints, if you're lazy,

```js
var suit = require('suit');
var s = suit.constraints([
  'basic-types', // Included by default.
  'basic-ui', // Included by default.
  {
    cap: function (value) {
      if (value === undefined || value === null) return value;
      if (_.isString(value)) return value.toUpperCase();
      throw 'Expected a string but got type: ' + typeof value;
    }
  }
]);

suit.fit('im listening', s.cap); // 'IM LISTENING'
```

3. Heck, because constraints are simply functions, you can even declare them on-the-fly,

```js
suit.fit('im listening', function (value) {
  if (value === undefined || value === null) return value;
  if (_.isString(value)) return value.toUpperCase();
  throw 'Expected a string but got type: ' + typeof value;
}); // 'IM LISTENING'
```
