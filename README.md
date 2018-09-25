# http-querystring-stringify

Simple, small and correct querystring serialization-only for the browser or
server.

This package is intended for client side code or input data which structure is
defined by the application. It has no DoS protection and simplicity and
correctness is prioritized over performance.

If you need extreme performance you should consider
https://github.com/petkaantonov/querystringparser.

This package was written because serialization seems to happen most often on the
client as a single operation and similar performance-focused libraries had
trade-offs and bugs while others carried huge dependencies.

```js
var stringify = require('http-querystring-stringify')

stringify({
	first: 'John',
	last: 'Wayne',
})
// -> first=John&last=Wayne

stringify({
	brands: ['KitKat', 'Snickers', 'Bounty'],
})
// -> brands[]=KitKat&brands[]=Snickers&brands[]=Bounty

stringify({
	sites: [{name: 'facebook', color: 'blue'}],
})
// -> sites[0][name]=facebook&sites[0][color]=blue
```

- `toJSON` is respected (like `JSON.stringify` does)
- `true` and `false` are converted to `y` or `n` respectively
- `null` is represented by an empty string
- `undefined` values will be skipped completely (like `JSON.stringify` does)
- arrays will be numbered only if they contain arrays or objects themselves

## Compatibility with parsers

Generally there are two types of parsers: those supporting extended nesting and
those that just support repeated keys.

### Perfect support (extended nesting):

- [querystringparser](https://github.com/petkaantonov/querystringparser) (read
  open issues)
- [qs](https://github.com/ljharb/qs)

```js
var input = {
	a: '',
	b: 's',
	c: [ '1', '2', '3' ],
	d: '&=[]',
	e: [ '1', '2', [ '3', '4' ] ],
	f: [ '1', { a: '1' } ],
}

deepEqual(parse(stringify(input)), input);
	-> true;
```

### Will flatten:

- [Node.js built-in](https://nodejs.org/api/url.html)
- [URI.js](https://github.com/medialize/URI.js)

```js
parse(stringify({
	a: '',
	b: 's',
	c: [ '1', '2', '3' ],
	d: '&=[]',
	e: [ '1', '2', [ '3', '4' ] ],
	f: [ '1', { a: '1' } ],
}));
	-> {
		a: '',
		b: 's',
		d: '&=[]',

		// expect arrays to be collapsed like this
		'c[]': [ '1', '2', '3' ],

		// expect objects and multi-level arrays to be flattened like this
		'e[0]': '1',
		'e[1]': '2',
		'e[2][]': [ '3', '4' ],
		'f[0]': '1',
		'f[1][a]': '1',
	};
```
