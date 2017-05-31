"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Linear = (function () {
    function Linear() {
    }
    Linear.prototype.getPosition = function (x, min, max) {
        return (((x - min) / (max - min)) * 100);
    };
    Linear.prototype.getValue = function (positionPercent, min, max) {
        var dec = positionPercent / 100;
        if (positionPercent === 0) {
            return min;
        }
        else if (positionPercent === 100) {
            return max;
        }
        return Math.round(((max - min) * dec) + min);
    };
    return Linear;
}());
exports.default = Linear;
//# sourceMappingURL=Linear.js.map