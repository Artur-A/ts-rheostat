"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var classNames = require("classnames");
var RheostatScalePercent_1 = require("./constants/RheostatScalePercent");
var RheostatKeys_1 = require("./constants/RheostatKeys");
var RheostatOrientation_1 = require("./constants/RheostatOrientation");
var Linear_1 = require("./algorithms/Linear");
var Rheostat = (function (_super) {
    __extends(Rheostat, _super);
    function Rheostat(props, state) {
        var _this = _super.call(this, props, state) || this;
        var values = _this.getValuesPropOrDefault(_this.props.values);
        _this.state = {
            className: _this.getClassName(_this.getOrientationPropOrDefault(), _this.props.className),
            handlePos: values.map(function (value) { return _this.getAlgorithmPropOrDefault().getPosition(value, _this.getMinPropOrDefault(), _this.getMaxPropOrDefault()); }),
            handleDimensions: 0,
            mousePos: undefined,
            sliderBox: { top: 0, left: 0, width: 0, height: 0 },
            slidingIndex: undefined,
            values: values,
        };
        _this.getPublicState = _this.getPublicState.bind(_this);
        _this.getSliderBoundingBox = _this.getSliderBoundingBox.bind(_this);
        _this.getProgressStyle = _this.getProgressStyle.bind(_this);
        _this.getMinValue = _this.getMinValue.bind(_this);
        _this.getMaxValue = _this.getMaxValue.bind(_this);
        _this.getHandleDimensions = _this.getHandleDimensions.bind(_this);
        _this.getClosestSnapPoint = _this.getClosestSnapPoint.bind(_this);
        _this.getSnapPosition = _this.getSnapPosition.bind(_this);
        _this.getNextPositionForKey = _this.getNextPositionForKey.bind(_this);
        _this.getNextState = _this.getNextState.bind(_this);
        _this.handleClick = _this.handleClick.bind(_this);
        _this.getClosestHandle = _this.getClosestHandle.bind(_this);
        _this.setStartSlide = _this.setStartSlide.bind(_this);
        _this.startMouseSlide = _this.startMouseSlide.bind(_this);
        _this.startTouchSlide = _this.startTouchSlide.bind(_this);
        _this.handleMouseSlide = _this.handleMouseSlide.bind(_this);
        _this.handleTouchSlide = _this.handleTouchSlide.bind(_this);
        _this.handleSlide = _this.handleSlide.bind(_this);
        _this.endSlide = _this.endSlide.bind(_this);
        _this.handleKeydown = _this.handleKeydown.bind(_this);
        _this.validatePosition = _this.validatePosition.bind(_this);
        _this.validateValues = _this.validateValues.bind(_this);
        _this.canMove = _this.canMove.bind(_this);
        _this.fireChangeEvent = _this.fireChangeEvent.bind(_this);
        _this.slideTo = _this.slideTo.bind(_this);
        _this.updateNewValues = _this.updateNewValues.bind(_this);
        return _this;
    }
    Rheostat.prototype.componentWillReceiveProps = function (nextProps) {
        var minMaxChanged = (nextProps.min !== this.props.min || nextProps.max !== this.props.max);
        var nextPropsValues = this.getValuesPropOrDefault(nextProps.values);
        var valuesChanged = (this.state.values.length !== nextPropsValues.length ||
            this.state.values.some(function (value, idx) { return nextPropsValues[idx] !== value; }));
        var orientationChanged = (nextProps.className !== this.props.className ||
            nextProps.orientation !== this.props.orientation);
        var willBeDisabled = nextProps.disabled && !this.props.disabled;
        if (orientationChanged) {
            this.setState({
                className: this.getClassName(nextProps.orientation || RheostatOrientation_1.default.Horizontal, nextProps.className),
                handlePos: this.state.handlePos,
                handleDimensions: this.state.handleDimensions,
                mousePos: this.state.mousePos,
                sliderBox: this.state.sliderBox,
                slidingIndex: this.state.slidingIndex,
                values: this.state.values,
            });
        }
        if (minMaxChanged || valuesChanged) {
            this.updateNewValues(nextProps);
        }
        if (willBeDisabled && this.state.slidingIndex !== undefined) {
            this.endSlide();
        }
    };
    Rheostat.prototype.getAlgorithmPropOrDefault = function () {
        return this.props.algorithm || Rheostat.defaultProps.algorithm;
    };
    Rheostat.prototype.getOrientationPropOrDefault = function () {
        return this.props.orientation || RheostatOrientation_1.default.Horizontal;
    };
    Rheostat.prototype.getSnapPointsPropOrDefault = function () {
        return this.props.snapPoints || Rheostat.defaultProps.snapPoints;
    };
    Rheostat.prototype.getMinPropOrDefault = function () {
        return this.props.min || Rheostat.defaultProps.min;
    };
    Rheostat.prototype.getMaxPropOrDefault = function () {
        return this.props.max || Rheostat.defaultProps.max;
    };
    Rheostat.prototype.getDisabledPropOrDefault = function () {
        return this.props.disabled === undefined ? Rheostat.defaultProps.disabled : this.props.disabled;
    };
    Rheostat.prototype.getValuesPropOrDefault = function (values) {
        return values || Rheostat.defaultProps.values;
    };
    Rheostat.prototype.getClassName = function (orientation, rootClassName) {
        var classOrientation = orientation === RheostatOrientation_1.default.Vertical
            ? 'rheostat-vertical'
            : 'rheostat-horizontal';
        return classNames('rheostat', classOrientation, rootClassName);
    };
    Rheostat.prototype.getPublicState = function () {
        return {
            max: this.getMaxPropOrDefault(),
            min: this.getMinPropOrDefault(),
            values: this.state.values,
        };
    };
    Rheostat.prototype.getSliderBoundingBox = function () {
        var rheostat = this.refs.rheostat;
        var node = rheostat;
        var rect = node.getBoundingClientRect();
        return {
            height: rect.height || node.clientHeight,
            left: rect.left,
            top: rect.top,
            width: rect.width || node.clientWidth,
        };
    };
    Rheostat.prototype.getProgressStyle = function (idx) {
        var handlePos = this.state.handlePos;
        var value = handlePos[idx];
        if (idx === 0) {
            return this.getOrientationPropOrDefault() === RheostatOrientation_1.default.Vertical
                ? { height: value + "%", top: 0 }
                : { left: 0, width: value + "%" };
        }
        var prevValue = handlePos[idx - 1];
        var diffValue = value - prevValue;
        return this.getOrientationPropOrDefault() === RheostatOrientation_1.default.Vertical
            ? { height: diffValue + "%", top: prevValue + "%" }
            : { left: prevValue + "%", width: diffValue + "%" };
    };
    Rheostat.prototype.getMinValue = function (idx) {
        return this.state.values[idx - 1]
            ? Math.max(this.getMinPropOrDefault(), this.state.values[idx - 1])
            : this.getMinPropOrDefault();
    };
    Rheostat.prototype.getMaxValue = function (idx) {
        return this.state.values[idx + 1]
            ? Math.min(this.getMaxPropOrDefault(), this.state.values[idx + 1])
            : this.getMaxPropOrDefault();
    };
    Rheostat.prototype.getHandleDimensions = function (ev, sliderBox) {
        var handleNode = ev.currentTarget || undefined;
        if (!handleNode)
            return 0;
        return this.getOrientationPropOrDefault() === RheostatOrientation_1.default.Vertical
            ? ((handleNode.clientHeight / sliderBox.height) * RheostatScalePercent_1.default.Full) / 2
            : ((handleNode.clientWidth / sliderBox.width) * RheostatScalePercent_1.default.Full) / 2;
    };
    Rheostat.prototype.getClosestSnapPoint = function (value) {
        if (!this.getSnapPointsPropOrDefault().length) {
            return value;
        }
        return this.getSnapPointsPropOrDefault().reduce(function (snapTo, snap) { return (Math.abs(snapTo - value) < Math.abs(snap - value) ? snapTo : snap); });
    };
    Rheostat.prototype.getSnapPosition = function (positionPercent) {
        if (!this.props.snap)
            return positionPercent;
        var value = this.getAlgorithmPropOrDefault().getValue(positionPercent, this.getMinPropOrDefault(), this.getMaxPropOrDefault());
        var snapValue = this.getClosestSnapPoint(value);
        return this.getAlgorithmPropOrDefault().getPosition(snapValue, this.getMinPropOrDefault(), this.getMaxPropOrDefault());
    };
    Rheostat.prototype.getNextPositionForKey = function (idx, keyCode) {
        var _a = this.state, handlePos = _a.handlePos, values = _a.values;
        var shouldSnap = this.props.snap;
        var proposedValue = values[idx];
        var proposedPercentage = handlePos[idx];
        var originalPercentage = proposedPercentage;
        var stepValue = 1;
        var max = this.props.max || 0;
        var min = this.props.min || 0;
        if (max >= 100) {
            proposedPercentage = Math.round(proposedPercentage);
        }
        else {
            stepValue = 100 / (max - min);
        }
        var currentIndex = shouldSnap
            ? this.getSnapPointsPropOrDefault().indexOf(this.getClosestSnapPoint(values[idx]))
            : 0;
        var stepMultiplier = (_b = {},
            _b[RheostatKeys_1.default.LEFT] = function (v) { return v * -1; },
            _b[RheostatKeys_1.default.RIGHT] = function (v) { return v * 1; },
            _b[RheostatKeys_1.default.UP] = function (v) { return v * 1; },
            _b[RheostatKeys_1.default.DOWN] = function (v) { return v * -1; },
            _b[RheostatKeys_1.default.PAGE_DOWN] = function (v) { return v > 1 ? -v : v * -10; },
            _b[RheostatKeys_1.default.PAGE_UP] = function (v) { return v > 1 ? v : v * 10; },
            _b);
        if (Object.prototype.hasOwnProperty.call(stepMultiplier, keyCode)) {
            proposedPercentage += stepMultiplier[keyCode](stepValue);
            if (shouldSnap) {
                if (proposedPercentage > originalPercentage) {
                    if (currentIndex < this.getSnapPointsPropOrDefault().length - 1) {
                        proposedValue = this.getSnapPointsPropOrDefault()[currentIndex + 1];
                    }
                }
                else if (currentIndex > 0) {
                    proposedValue = this.getSnapPointsPropOrDefault()[currentIndex - 1];
                }
            }
        }
        else if (keyCode === RheostatKeys_1.default.HOME) {
            proposedPercentage = RheostatScalePercent_1.default.Empty;
            if (shouldSnap) {
                proposedValue = this.getSnapPointsPropOrDefault()[0];
            }
        }
        else if (keyCode === RheostatKeys_1.default.END) {
            proposedPercentage = RheostatScalePercent_1.default.Full;
            if (shouldSnap) {
                proposedValue = this.getSnapPointsPropOrDefault()[this.getSnapPointsPropOrDefault().length - 1];
            }
        }
        else {
            return undefined;
        }
        return shouldSnap
            ? this.getAlgorithmPropOrDefault().getPosition(proposedValue, this.getMinPropOrDefault(), this.getMaxPropOrDefault())
            : proposedPercentage;
        var _b;
    };
    Rheostat.prototype.getNextState = function (idx, proposedPosition) {
        var _this = this;
        var actualPosition = this.validatePosition(idx, proposedPosition);
        var nextHandlePos = this.state.handlePos.map(function (pos, index) { return (index === idx ? actualPosition : pos); });
        return {
            handlePos: nextHandlePos,
            values: nextHandlePos.map(function (pos) { return (_this.getAlgorithmPropOrDefault().getValue(pos, _this.getMinPropOrDefault(), _this.getMaxPropOrDefault())); }),
            className: this.state.className,
            handleDimensions: this.state.handleDimensions,
            mousePos: this.state.mousePos,
            sliderBox: this.state.sliderBox,
            slidingIndex: this.state.slidingIndex,
        };
    };
    Rheostat.prototype.getClosestHandle = function (positionPercent) {
        var handlePos = this.state.handlePos;
        return handlePos.reduce(function (closestIdx, node, idx) {
            var challenger = Math.abs(handlePos[idx] - positionPercent);
            var current = Math.abs(handlePos[closestIdx] - positionPercent);
            return challenger < current ? idx : closestIdx;
        }, 0);
    };
    Rheostat.prototype.getHandleFor = function (ev) {
        return Number(ev.currentTarget.getAttribute('data-handle-key'));
    };
    Rheostat.prototype.setStartSlide = function (ev, x, y) {
        var sliderBox = this.getSliderBoundingBox();
        this.setState({
            handleDimensions: this.getHandleDimensions(ev, sliderBox),
            mousePos: { x: x, y: y },
            sliderBox: sliderBox,
            slidingIndex: this.getHandleFor(ev),
            className: this.state.className,
            handlePos: this.state.handlePos,
            values: this.state.values
        });
    };
    Rheostat.prototype.startMouseSlide = function (ev) {
        this.setStartSlide(ev, ev.clientX, ev.clientY);
        if (typeof document.addEventListener === 'function') {
            document.addEventListener('mousemove', this.handleMouseSlide, false);
            document.addEventListener('mouseup', this.endSlide, false);
        }
        else if (document.attachEvent) {
            document.attachEvent('onmousemove', this.handleMouseSlide);
            document.attachEvent('onmouseup', this.endSlide);
        }
        this.killEvent(ev);
    };
    Rheostat.prototype.startTouchSlide = function (ev) {
        if (ev.changedTouches.length > 1)
            return;
        var touch = ev.changedTouches[0];
        this.setStartSlide(ev, touch.clientX, touch.clientY);
        document.addEventListener('touchmove', this.handleTouchSlide, false);
        document.addEventListener('touchend', this.endSlide, false);
        if (this.props.onSliderDragStart)
            this.props.onSliderDragStart();
        this.killEvent(ev);
    };
    Rheostat.prototype.handleMouseSlide = function (ev) {
        if (this.state.slidingIndex === undefined) {
            return;
        }
        this.handleSlide(ev.clientX, ev.clientY);
        this.killEvent(ev);
    };
    Rheostat.prototype.handleTouchSlide = function (ev) {
        if (this.state.slidingIndex === undefined) {
            return;
        }
        if (ev.changedTouches.length > 1) {
            this.endSlide();
            return;
        }
        var touch = ev.changedTouches[0];
        this.handleSlide(touch.clientX, touch.clientY);
        this.killEvent(ev);
    };
    Rheostat.prototype.handleSlide = function (x, y) {
        var idx = this.state.slidingIndex;
        if (idx === undefined) {
            return;
        }
        var sliderBox = this.state.sliderBox;
        var positionPercent = this.getOrientationPropOrDefault() === RheostatOrientation_1.default.Vertical
            ? ((y - sliderBox.top) / sliderBox.height) * RheostatScalePercent_1.default.Full
            : ((x - sliderBox.left) / sliderBox.width) * RheostatScalePercent_1.default.Full;
        this.slideTo(idx, positionPercent);
        if (this.canMove(idx, positionPercent)) {
            this.setState({
                mousePos: { x: x, y: y },
                className: this.state.className,
                handlePos: this.state.handlePos,
                handleDimensions: this.state.handleDimensions,
                sliderBox: this.state.sliderBox,
                slidingIndex: this.state.slidingIndex,
                values: this.state.values
            });
            if (this.props.onSliderDragMove)
                this.props.onSliderDragMove();
        }
    };
    Rheostat.prototype.endSlide = function () {
        var _this = this;
        var idx = this.state.slidingIndex;
        if (idx === undefined) {
            return;
        }
        this.setState({
            slidingIndex: undefined,
            mousePos: this.state.mousePos,
            className: this.state.className,
            handlePos: this.state.handlePos,
            handleDimensions: this.state.handleDimensions,
            sliderBox: this.state.sliderBox,
            values: this.state.values,
        });
        if (typeof document.removeEventListener === 'function') {
            document.removeEventListener('mouseup', this.endSlide, false);
            document.removeEventListener('touchend', this.endSlide, false);
            document.removeEventListener('touchmove', this.handleTouchSlide, false);
            document.removeEventListener('mousemove', this.handleMouseSlide, false);
        }
        else if (document.detachEvent) {
            document.detachEvent('onmousemove', this.handleMouseSlide);
            document.detachEvent('onmouseup', this.endSlide);
        }
        if (this.props.onSliderDragEnd) {
            this.props.onSliderDragEnd();
        }
        if (this.props.snap) {
            var positionPercent = this.getSnapPosition(this.state.handlePos[idx]);
            this.slideTo(idx, positionPercent, function () { return _this.fireChangeEvent(); });
        }
        else {
            this.fireChangeEvent();
        }
    };
    Rheostat.prototype.handleClick = function (ev) {
        var _this = this;
        if (ev.target.getAttribute('data-handle-key')) {
            return;
        }
        var sliderBox = this.getSliderBoundingBox();
        var positionDecimal = this.getOrientationPropOrDefault() === RheostatOrientation_1.default.Vertical
            ? (ev.clientY - sliderBox.top) / sliderBox.height
            : (ev.clientX - sliderBox.left) / sliderBox.width;
        var positionPercent = positionDecimal * RheostatScalePercent_1.default.Full;
        var handleId = this.getClosestHandle(positionPercent);
        var validPositionPercent = this.getSnapPosition(positionPercent);
        this.slideTo(handleId, validPositionPercent, function () { return _this.fireChangeEvent(); });
        if (this.props.onClick) {
            this.props.onClick();
        }
    };
    Rheostat.prototype.handleKeydown = function (ev) {
        var _this = this;
        var idx = this.getHandleFor(ev);
        if (ev.keyCode === RheostatKeys_1.default.ESC) {
            ev.currentTarget.blur();
            return;
        }
        var proposedPercentage = this.getNextPositionForKey(idx, ev.keyCode);
        if (proposedPercentage === undefined) {
            return;
        }
        if (this.canMove(idx, proposedPercentage)) {
            this.slideTo(idx, proposedPercentage, function () { return _this.fireChangeEvent(); });
            if (this.props.onKeyPress)
                this.props.onKeyPress();
        }
        this.killEvent(ev);
    };
    Rheostat.prototype.validatePosition = function (idx, proposedPosition) {
        var _a = this.state, handlePos = _a.handlePos, handleDimensions = _a.handleDimensions;
        return Math.max(Math.min(proposedPosition, handlePos[idx + 1] !== undefined
            ? handlePos[idx + 1] - handleDimensions
            : RheostatScalePercent_1.default.Full), handlePos[idx - 1] !== undefined
            ? handlePos[idx - 1] + handleDimensions
            : RheostatScalePercent_1.default.Empty);
    };
    Rheostat.prototype.validateValues = function (proposedValues, props) {
        var _this = this;
        var _a = props || this.props, max = _a.max, min = _a.min;
        return proposedValues.map(function (value, idx, values) {
            var realValue = Math.max(Math.min(value, max || _this.getMaxPropOrDefault()), min || _this.getMinPropOrDefault());
            if (values.length && realValue < values[idx - 1]) {
                return values[idx - 1];
            }
            return realValue;
        });
    };
    Rheostat.prototype.canMove = function (idx, proposedPosition) {
        var _a = this.state, handlePos = _a.handlePos, handleDimensions = _a.handleDimensions;
        if (proposedPosition < RheostatScalePercent_1.default.Empty)
            return false;
        if (proposedPosition > RheostatScalePercent_1.default.Full)
            return false;
        var nextHandlePosition = handlePos[idx + 1] !== undefined
            ? handlePos[idx + 1] - handleDimensions
            : Infinity;
        if (proposedPosition > nextHandlePosition)
            return false;
        var prevHandlePosition = handlePos[idx - 1] !== undefined
            ? handlePos[idx - 1] + handleDimensions
            : -Infinity;
        if (proposedPosition < prevHandlePosition)
            return false;
        return true;
    };
    Rheostat.prototype.fireChangeEvent = function () {
        if (this.props.onChange) {
            this.props.onChange(this.getPublicState());
        }
        ;
    };
    Rheostat.prototype.slideTo = function (idx, proposedPosition, onAfterSet) {
        var _this = this;
        var nextState = this.getNextState(idx, proposedPosition);
        this.setState(nextState, function () {
            if (_this.props.onValuesUpdated) {
                _this.props.onValuesUpdated(_this.getPublicState());
            }
            if (onAfterSet) {
                onAfterSet();
            }
        });
    };
    Rheostat.prototype.updateNewValues = function (nextProps) {
        var _this = this;
        if (this.state.slidingIndex !== undefined) {
            return;
        }
        var max = nextProps.max, min = nextProps.min, values = nextProps.values;
        var nextValues = this.validateValues(values || [], nextProps);
        this.setState({
            handlePos: nextValues.map(function (value) { return _this.getAlgorithmPropOrDefault().getPosition(value, _this.getMinPropOrDefault(), _this.getMaxPropOrDefault()); }),
            values: nextValues,
            slidingIndex: this.state.slidingIndex,
            mousePos: this.state.mousePos,
            className: this.state.className,
            handleDimensions: this.state.handleDimensions,
            sliderBox: this.state.sliderBox,
        }, function () { return _this.fireChangeEvent(); });
    };
    Rheostat.prototype.killEvent = function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
    };
    Rheostat.prototype.render = function () {
        var _this = this;
        var Handle = this.props.handle || Button;
        var PitComponent = this.props.pitComponent;
        var ProgressBar = this.props.progressBar ||
            React.createClass({ render: function () { return React.createElement("div", __assign({}, this.props)); } });
        return (React.createElement("div", { className: this.state.className, ref: "rheostat", onClick: function (ev) { if (!_this.getDisabledPropOrDefault()) {
                _this.handleClick(ev);
            } }, style: { position: 'relative' } },
            React.createElement("div", { className: "rheostat-background" }),
            this.state.handlePos.map(function (pos, idx) {
                var handleStyle = _this.getOrientationPropOrDefault() === RheostatOrientation_1.default.Vertical
                    ? { top: pos + "%", position: 'absolute' }
                    : { left: pos + "%", position: 'absolute' };
                return React.createElement(Handle, { "aria-valuemax": _this.getMaxValue(idx), "aria-valuemin": _this.getMinValue(idx), "aria-valuenow": _this.state.values[idx], "aria-disabled": _this.getDisabledPropOrDefault(), "data-handle-key": idx, className: "rheostat-handle", key: idx, onClick: _this.killEvent, onKeyDown: function (ev) { if (!_this.getDisabledPropOrDefault()) {
                        _this.handleKeydown(ev);
                    } }, onMouseDown: function (ev) { if (!_this.getDisabledPropOrDefault()) {
                        _this.startMouseSlide(ev);
                    } }, onTouchStart: function (ev) { if (!_this.getDisabledPropOrDefault()) {
                        _this.startTouchSlide(ev);
                    } }, role: "slider", style: handleStyle, tabIndex: 0 });
            }),
            this.state.handlePos.map(function (node, idx, arr) {
                if (idx === 0 && arr.length > 1) {
                    return undefined;
                }
                return (React.createElement(ProgressBar, { className: "rheostat-progress", key: idx, style: _this.getProgressStyle(idx) }));
            }),
            PitComponent && (this.props.pitPoints || []).map(function (n) {
                var pos = _this.getAlgorithmPropOrDefault().getPosition(n, _this.getMinPropOrDefault(), _this.getMaxPropOrDefault());
                var pitStyle = _this.getOrientationPropOrDefault() === RheostatOrientation_1.default.Vertical
                    ? { top: pos + "%", position: 'absolute' }
                    : { left: pos + "%", position: 'absolute' };
                return (React.createElement(PitComponent, { key: n, style: pitStyle }, n));
            }),
            this.props.children));
    };
    return Rheostat;
}(React.Component));
Rheostat.defaultProps = {
    algorithm: new Linear_1.default(),
    className: undefined,
    disabled: false,
    handle: undefined,
    max: RheostatScalePercent_1.default.Full,
    min: RheostatScalePercent_1.default.Empty,
    onClick: undefined,
    onChange: undefined,
    onKeyPress: undefined,
    onSliderDragEnd: undefined,
    onSliderDragMove: undefined,
    onSliderDragStart: undefined,
    onValuesUpdated: undefined,
    orientation: RheostatOrientation_1.default.Horizontal,
    pitComponent: undefined,
    pitPoints: [],
    progressBar: undefined,
    snap: false,
    snapPoints: [],
    values: [RheostatScalePercent_1.default.Empty]
};
var Button = (function (_super) {
    __extends(Button, _super);
    function Button() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Button.prototype.render = function () {
        return React.createElement("button", __assign({}, this.props, { type: "button" }));
    };
    return Button;
}(React.Component));
exports.default = Rheostat;
//# sourceMappingURL=Rheostat.js.map