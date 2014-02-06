/* Run 'node experiment.js' and observe the results. */

var suit = require('../lib')
var c = suit.constraints;

var schema = {
  username: [c.string, c.required],
  age: c.any,
  email: c.email,
  profile: {
    country: c.string,
    city: c.string
  }
};

////
// Inputs
////

// Okay, but lacking some optional fields.
var input1 = {
  username: 'molly',
  extra: 'lolololtrol',
  email: 'asdf@sdf.com',
  profile: {
    country: 'zimbab'
  }
}

// Bad email.
var input2 = {
  username: 'm',
  email: 'asdfsdf.com',
}

// No username.
var input3 = {
  email: 'asdf@df.com'
}

// Type conversion.
var input4 = {
  username: 45,
  age: 56,
  email: 'asdf@df.com'
}


////
// Test it!
////

try { console.log(suit.fit(input1, schema)); } catch (e) { console.log('Error: ' + e); }
try { console.log(suit.fit(input2, schema)); } catch (e) { console.log('Error: ' + e); }
try { console.log(suit.fit(input3, schema)); } catch (e) { console.log('Error: ' + e); }
try { console.log(suit.fit(input4, schema)); } catch (e) { console.log('Error: ' + e); }
