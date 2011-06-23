
/*
	Randomizer

	Options:
	Provide an object with keys 'rng' and/or 'seed'. If 'rng' is not provided
	Randomizer will use Math.random(). 

	The provided RNG can be a javascript object with methods for random(), setSeed(), 
	and possibly randomInteger(), or one of the following options:

	'MersenneTwister',
	'MultiplyWithCarry'
	'CombinedMultipleRecursive'

*/
var Randomizer = function(options) {
	options = options || {};

	var seed = options.seed || new Date().getTime();
	var rng = options.rng || options.RNG;

	if(typeof rng === "string") {
		switch (rng) {
			case 'MersenneTwister': // fall-through intentional
			case 'CombinedMultipleRecursive':
			case 'MultiplyWithCarry':
				if(typeof window[rng] === "undefined") {
					throw new TypeError("'" + rng + "' must be included before use.");
				}
				rng = new window[rng]();
				if(seed && typeof rng.setSeed === 'function') {
					rng.setSeed(seed);
				}
				break;
			default:
				throw new TypeError("'" + rng + "' is not a valid RNG option.");
		}
	} else if(rng) {
		// ensure the proper methods are provided
		if(typeof rng.random !== 'function') {
			throw new TypeError("The provided RNG does not implement random()");
		}

	} else {
		rng = Math;
	}

	this.random = function() {
		return rng.random();
	};
	this.randomInteger = function(min, max) {
		if(typeof rng.randomInteger === 'function') {
			return rng.randomInteger(min, max);
		} else {
			if(!min || min < 0) {
				min = 0;
			}
			if(!max) {
				max = 2147483647;
			}
			return Math.floor(rng.random() * (max - min + 1)) + min;
		}
	};
	this.setSeed = function(seed) {
		if(typeof rng.setSeed === 'function') {
			rng.setSeed(seed);
		}
	};
};
