'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var ascending = require('./ascending.js');
var bisector = require('./bisector.js');
var number = require('./number.js');

const ascendingBisect = bisector(ascending);
const bisectRight = ascendingBisect.right;
bisector(number.default).center;
var bisect = bisectRight;

exports.bisectRight = bisectRight;
exports.default = bisect;
