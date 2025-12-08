import ascending from './ascending.js';
import bisector from './bisector.js';
import number from './number.js';

const ascendingBisect = bisector(ascending);
const bisectRight = ascendingBisect.right;
bisector(number).center;
var bisect = bisectRight;

export { bisectRight, bisect as default };
