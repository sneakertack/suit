Suit.js
=======

Gracefully conform objects to defined schemas.

How to use
------

Why are you here? This library is not ready for public consumption yet. I am sorry that your time got wasted.

```js
var suit = require('suit');
var c = suit.constraints; // Soon, you'll be able to add your own constraints, which makes this library a whole lot more useful.

// input is whatever object you want to conform.
// It will return a conformed output if everything went well, otherwise it will throw an error describing what went wrong.
suit.fit(input, schema);

// Example of a schema.
var schema = {
  email: [c.email, c.required]
  username: c.string,
  info: {
    country: c.string,
    things: c.freeform // Not implemented yet.
    stereo-speakers: {
      // Infinite nesting is allowed.
      left: {
        name: c.string,
        power: c.integer // Surprisingly, not implemented yet.
      },
      right: {
        // If you want to reduce repetiveness, define a custom constraint (next time).
        name: c.string,
        power: c.integer
      }
    }
  },
  wallets: [c.collection({
    name: c.string,
    quantity: c.decimal(2), // Not implemented yet.
    currency: c.paypalCurrencyCode // Probably implemented by yourself.
  }), c.min(1)] // min not implemented yet.
}
```
