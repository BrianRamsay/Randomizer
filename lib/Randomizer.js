
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
	this.getSeed = function() {
		if(typeof rng.getSeed === 'function') {
			return rng.getSeed();
		}
		return null;
	};

	/* 
		Normal distribution

		Javascript implementation of the Box-Muller transform.
		http://en.wikipedia.org/wiki/Box-Muller_transform
		The ziggurat algorithm is more efficient, but this is
		easier to implement. This particular implementation is a 
		version of http://www.dreamincode.net/code/snippet1446.htm
		@constructor 
		@param {Number} sigma The standard-deviation of the distribution
		@param {Number} mu The center of the distribution

		by Sean McCullough (banksean@gmail.com)
		25.December 2007
		http://www.cricketschirping.com/code/random_sampling_in_javascript.html
	*/
	var rand_obj = this;
	function NormalDistribution(sigma, mu) {
		return {
			sigma: sigma,
			mu: mu,
			sample: function normaldistribution__sample() {
				var res;
				if (this.storedDeviate) {
					res = this.storedDeviate * this.sigma + this.mu;
					this.storedDeviate = null;
				} else {
					var dist = Math.sqrt(-1 * Math.log(rand_obj.random()));
					var angle = 2 * Math.PI * rand_obj.random();
					this.storedDeviate = dist*Math.cos(angle);
					res = dist*Math.sin(angle) * this.sigma + this.mu;
				}
				return res; 
			},
			sampleInt : function normaldistribution__sample_int() {
				return Math.round(this.sample());
			}
		}; 
	}   

	// cache some of the normal objects instead of re-evaluating deviate
	var stored_normals = {};
	var cache_normal = function(mean, stddev, create_new) {
		create_new = (create_new === undefined) ? false : create_new;

		// store and retrieve distributions to avoid some of the math if we're going over and over it
		var key = mean + '_' + stddev;
		var exists = (stored_normals[key] !== undefined);
		if(!exists || create_new) {
			stored_normals[key] = new NormalDistribution(stddev, mean);
		}
		
		return stored_normals[key];
	};

	this.normal = function(mean, stddev, create_new) {
		stddev = stddev || 1;
		var obj = cache_normal(mean, stddev, create_new);
		return obj.sample();
	};

	this.normalInteger = function(mean, stddev, create_new) {
		stddev = stddev || 1;
		var obj = cache_normal(mean, stddev, create_new);
		return obj.sampleInt();
	};
};
