/// <reference types="react" />
import * as React from "react";
import RheostatScalePercent from "./constants/RheostatScalePercent";
import RheostatOrientation from "./constants/RheostatOrientation";
import Linear from "./algorithms/Linear";
import IAlgorithm from "./algorithms/IAlgorithm";
export interface IRheostatProps {
    algorithm?: IAlgorithm;
    className?: string;
    disabled?: boolean;
    handle?: IClassicComponentClass;
    max?: number;
    min?: number;
    onClick?: () => void;
    onChange?: (state: IRheostatPublicState) => void;
    onKeyPress?: () => void;
    onSliderDragEnd?: () => void;
    onSliderDragMove?: () => void;
    onSliderDragStart?: () => void;
    onValuesUpdated?: (state: IRheostatPublicState) => void;
    orientation?: RheostatOrientation;
    pitComponent?: IClassicComponentClass;
    pitPoints?: number[];
    progressBar?: IClassicComponentClass;
    snap?: boolean;
    snapPoints?: number[];
    values?: number[];
}
export interface RheostatState {
    className: string;
    handlePos: number[];
    handleDimensions: number;
    mousePos: IMousePosition | undefined;
    sliderBox: IBoundingBox;
    slidingIndex: number | undefined;
    values: number[];
}
declare class Rheostat extends React.Component<IRheostatProps, RheostatState> {
    static defaultProps: {
        algorithm: Linear;
        className: undefined;
        disabled: boolean;
        handle: undefined;
        max: RheostatScalePercent;
        min: RheostatScalePercent;
        onClick: undefined;
        onChange: undefined;
        onKeyPress: undefined;
        onSliderDragEnd: undefined;
        onSliderDragMove: undefined;
        onSliderDragStart: undefined;
        onValuesUpdated: undefined;
        orientation: RheostatOrientation;
        pitComponent: undefined;
        pitPoints: never[];
        progressBar: undefined;
        snap: boolean;
        snapPoints: never[];
        values: RheostatScalePercent[];
    };
    constructor(props: IRheostatProps, state?: RheostatState);
    componentWillReceiveProps(nextProps: IRheostatProps): void;
    private getAlgorithmPropOrDefault();
    private getOrientationPropOrDefault();
    private getSnapPointsPropOrDefault();
    private getMinPropOrDefault();
    private getMaxPropOrDefault();
    private getDisabledPropOrDefault();
    private getValuesPropOrDefault(values);
    private getClassName(orientation, rootClassName?);
    getPublicState(): IRheostatPublicState;
    private getSliderBoundingBox();
    getProgressStyle(idx: number): any;
    getMinValue(idx: number): number;
    getMaxValue(idx: number): number;
    private getHandleDimensions(ev, sliderBox);
    getClosestSnapPoint(value: number): number;
    getSnapPosition(positionPercent: number): number;
    getNextPositionForKey(idx: number, keyCode: number): number | undefined;
    getNextState(idx: number, proposedPosition: number): RheostatState;
    getClosestHandle(positionPercent: number): number;
    private getHandleFor(ev);
    private setStartSlide(ev, x, y);
    private startMouseSlide(ev);
    private startTouchSlide(ev);
    private handleMouseSlide(ev);
    private handleTouchSlide(ev);
    private handleSlide(x, y);
    private endSlide();
    private handleClick(ev);
    private handleKeydown(ev);
    validatePosition(idx: number, proposedPosition: number): number;
    validateValues(proposedValues: number[], props?: IRheostatProps): number[];
    canMove(idx: number, proposedPosition: number): boolean;
    private fireChangeEvent();
    private slideTo(idx, proposedPosition, onAfterSet?);
    private updateNewValues(nextProps);
    private killEvent(ev);
    render(): JSX.Element;
}
export interface IBoundingBox {
    width: number;
    height: number;
    top: number;
    left: number;
}
export interface IMousePosition {
    x: number;
    y: number;
}
export interface IRheostatPublicState {
    max: number;
    min: number;
    values: number[];
}
export interface IClassicComponentClass {
    new (props?: any, context?: any): React.ClassicComponent<any, React.ComponentState>;
}
export default Rheostat;
