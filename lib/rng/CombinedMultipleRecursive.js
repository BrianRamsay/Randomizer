/*
	A Pierre L'Ecuyer Combined Multiple Recursive RNG
    - Copyright (c) 1998, 2002 Pierre L'Ecuyer, DIRO, Universite de Montreal.
	- License Below
    - http://www.iro.umontreal.ca/~lecuyer/

	Javascript implementation by Johannes Baagoe <baagoe@baagoe.com>, 2010
	from http://baagoe.com/en/RandomMusings/javascript/
*/

var CombinedMultipleRecursive = function(in_seed) {
	if (in_seed == undefined) {
		in_seed = (new Date()).getTime();
	} 
	var seed = in_seed;
	
	var rng = new MRG32k3a(seed);
	
	this.random = function() {
		return rng();
	};

	this.setSeed = function(new_seed) {
		seed = new_seed;
		rng = new MRG32k3a(seed);
	};

	this.getSeed = function() {
		return seed;
	};
};

function MRG32k3a() {
  return (function(args) {
    var m1 = 4294967087;
    var m2 = 4294944443;
    var s10 = 12345,
        s11 = 12345,
        s12 = 123,
        s20 = 12345,
        s21 = 12345,
        s22 = 123;

    if (args.length === 0) {
      args = [+new Date()];
    }
    var mash = Mash();
    for (var i = 0; i < args.length; i++) {
      s10 += mash(args[i]) * 0x100000000; // 2 ^ 32
      s11 += mash(args[i]) * 0x100000000;
      s12 += mash(args[i]) * 0x100000000;
      s20 += mash(args[i]) * 0x100000000;
      s21 += mash(args[i]) * 0x100000000;
      s22 += mash(args[i]) * 0x100000000;
    }
    s10 %= m1;
    s11 %= m1;
    s12 %= m1;
    s20 %= m2;
    s21 %= m2;
    s22 %= m2;
    mash = null;

    var uint32 = function() {
      var m1 = 4294967087;
      var m2 = 4294944443;
      var a12 = 1403580;
      var a13n = 810728;
      var a21 = 527612;
      var a23n = 1370589;

      var k, p1, p2;

      /* Component 1 */
      p1 = a12 * s11 - a13n * s10;
      k = p1 / m1 | 0;
      p1 -= k * m1;
      if (p1 < 0) p1 += m1;
      s10 = s11;
      s11 = s12;
      s12 = p1;

      /* Component 2 */
      p2 = a21 * s22 - a23n * s20;
      k = p2 / m2 | 0;
      p2 -= k * m2;
      if (p2 < 0) p2 += m2;
      s20 = s21;
      s21 = s22;
      s22 = p2;

      /* Combination */
      if (p1 <= p2) return p1 - p2 + m1;
      else return p1 - p2;
    };

    var random = function() {
      return uint32() * 2.3283064365386963e-10; // 2^-32
    };
    random.uint32 = uint32;
    random.fract53 = function() {
      return random() +
        (uint32() & 0x1fffff) * 1.1102230246251565e-16; // 2^-53
    };
    random.version = 'MRG32k3a 0.9';
    random.args = args;

    return random;
  } (Array.prototype.slice.call(arguments)));
};
/*
http://www.iro.umontreal.ca/~simardr/testu01/copyright.html

Copyright (c) 2002 Pierre L'Ecuyer, Universite de Montreal.
Web address: http://www.iro.umontreal.ca/~lecuyer/
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted without a fee for private, research, academic, or other non-commercial purposes. Any use of this software by a commercial enterprise requires a written licence from the copyright owner.

Any changes made to this package must be clearly identified as such.

In scientific publications which used this software, one may give the citation as:
P. L'Ecuyer and R. Simard, TestU01: A C Library for Empirical Testing of Random Number Generators, ACM Transactions on Mathematical Software, Vol. 33, 4, article 22, 2007.

Redistributions of source code must retain this copyright notice and the following disclaimer.

THIS PACKAGE IS PROVIDED "AS IS" AND WITHOUT ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTIBILITY AND FITNESS FOR A PARTICULAR PURPOSE.
*/
