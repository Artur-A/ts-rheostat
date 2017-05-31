"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Log10 = (function () {
    function Log10() {
    }
    Log10.prototype.getPosition = function (x, min, max) {
        var minv = Math.log(min);
        var maxv = Math.log(max);
        var scale = (maxv - minv) / 100;
        return (Math.log(x) - minv) / scale;
    };
    Log10.prototype.getValue = function (positionPercent, min, max) {
        var minv = Math.log(min);
        var maxv = Math.log(max);
        if (positionPercent === 0) {
            return min;
        }
        else if (positionPercent === 100) {
            return max;
        }
        var scale = (maxv - minv) / 100;
        return Math.floor(Math.exp(minv + (scale * positionPercent))) || 0;
    };
    return Log10;
}());
exports.default = Log10;
//# sourceMappingURL=Log10.js.map