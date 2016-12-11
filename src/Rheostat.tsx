import * as React from "react";
import * as classNames from "classnames";

import RheostatScalePercent from "./constants/RheostatScalePercent";
import RheostatKeys from "./constants/RheostatKeys";
import RheostatOrientation from "./constants/RheostatOrientation";
import Linear from "./algorithms/Linear";
import IAlgorithm from "./algorithms/IAlgorithm";


interface IRheostatProps{
  // the algorithm to use
  algorithm?: IAlgorithm,
  // standard class name you'd like to apply to the root element
  className?: string,
  // prevent the slider from moving when clicked
  disabled?: boolean,
  // a custom handle you can pass in
  handle?: IClassicComponentClass,
  // the maximum possible value
  max?: number,
  // the minimum possible value
  min?: number,
  // called on click
  onClick?: () => void,
  // called whenever the user is done changing values on the slider
  onChange?: (state:IRheostatPublicState) => void,
  // called on key press
  onKeyPress?: () => void,
  // called when you finish dragging a handle
  onSliderDragEnd?: () => void,
  // called every time the slider is dragged and the value changes
  onSliderDragMove?: () => void,
  // called when you start dragging a handle
  onSliderDragStart?: () => void,
  // called whenever the user is actively changing the values on the slider
  // (dragging, clicked, keypress)
  onValuesUpdated?: (state:IRheostatPublicState) => void,
  // the orientation
  orientation?: RheostatOrientation,
  // a component for rendering the pits
  pitComponent?: IClassicComponentClass,
  // the points that pits are rendered on
  pitPoints?: number[],
  // a custom progress bar you can pass in
  progressBar?: IClassicComponentClass,
  // should we snap?
  snap?: boolean,
  // the points we should snap to
  snapPoints?: number[],
  // the values
  values?: number[],
}

interface RheostatState {
  className: string,
  handlePos: number[],
  handleDimensions: number,
  mousePos: IMousePosition | undefined,
  sliderBox: IBoundingBox,
  slidingIndex: number | undefined,
  values: number[]
}

class Rheostat extends React.Component<IRheostatProps, RheostatState> {
  public static defaultProps = 
  {
    algorithm: new Linear(),
    className: undefined,
    disabled: false,
    handle: undefined,
    max: RheostatScalePercent.Full,
    min: RheostatScalePercent.Empty,
    onClick: undefined,
    onChange: undefined,
    onKeyPress: undefined,
    onSliderDragEnd: undefined,
    onSliderDragMove: undefined,
    onSliderDragStart: undefined,
    onValuesUpdated: undefined,
    orientation: RheostatOrientation.Horizontal,
    pitComponent: undefined,
    pitPoints: [],
    progressBar: undefined,
    snap: false,
    snapPoints: [],
    values: [RheostatScalePercent.Empty]  
  }; 

  public constructor(props:IRheostatProps, state?:RheostatState) {
    super(props,state);

    const values = this.getValuesPropOrDefault(this.props.values);
    this.state = {
      className: this.getClassName(this.getOrientationPropOrDefault(), this.props.className),
      handlePos: values.map(value => this.getAlgorithmPropOrDefault().getPosition(value, this.getMinPropOrDefault(), this.getMaxPropOrDefault())),
      handleDimensions: 0,
      mousePos: undefined,
      sliderBox: {top: 0, left: 0, width:0, height: 0},
      slidingIndex: undefined,
      values: values,
    };

    this.getPublicState = this.getPublicState.bind(this);
    this.getSliderBoundingBox = this.getSliderBoundingBox.bind(this);
    this.getProgressStyle = this.getProgressStyle.bind(this);
    this.getMinValue = this.getMinValue.bind(this);
    this.getMaxValue = this.getMaxValue.bind(this);
    this.getHandleDimensions = this.getHandleDimensions.bind(this);
    this.getClosestSnapPoint = this.getClosestSnapPoint.bind(this);
    this.getSnapPosition = this.getSnapPosition.bind(this);
    this.getNextPositionForKey = this.getNextPositionForKey.bind(this);
    this.getNextState = this.getNextState.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.getClosestHandle = this.getClosestHandle.bind(this);
    this.setStartSlide = this.setStartSlide.bind(this);
    this.startMouseSlide = this.startMouseSlide.bind(this);
    this.startTouchSlide = this.startTouchSlide.bind(this);
    this.handleMouseSlide = this.handleMouseSlide.bind(this);
    this.handleTouchSlide = this.handleTouchSlide.bind(this);
    this.handleSlide = this.handleSlide.bind(this);
    this.endSlide = this.endSlide.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.validatePosition = this.validatePosition.bind(this);
    this.validateValues = this.validateValues.bind(this);
    this.canMove = this.canMove.bind(this);
    this.fireChangeEvent = this.fireChangeEvent.bind(this);
    this.slideTo = this.slideTo.bind(this);
    this.updateNewValues = this.updateNewValues.bind(this);
  }

  public componentWillReceiveProps(nextProps:IRheostatProps) {
    const minMaxChanged = (nextProps.min !== this.props.min || nextProps.max !== this.props.max);
    const nextPropsValues = this.getValuesPropOrDefault(nextProps.values);
    const valuesChanged = (
      this.state.values.length !== nextPropsValues.length ||
      this.state.values.some((value, idx) => nextPropsValues[idx] !== value)
    );

    const orientationChanged = (
      nextProps.className !== this.props.className ||
      nextProps.orientation !== this.props.orientation
    );

    const willBeDisabled = nextProps.disabled && !this.props.disabled;

    if (orientationChanged) {
      this.setState({
        className: this.getClassName(nextProps.orientation || RheostatOrientation.Horizontal, nextProps.className),
        handlePos: this.state.handlePos,
        handleDimensions: this.state.handleDimensions,
        mousePos: this.state.mousePos,
        sliderBox: this.state.sliderBox,
        slidingIndex: this.state.slidingIndex,
        values: this.state.values,
      });
    }

    if (minMaxChanged || valuesChanged){
      this.updateNewValues(nextProps);
    }

    if (willBeDisabled && this.state.slidingIndex !== undefined) {
        this.endSlide();
    }
  }

  private getAlgorithmPropOrDefault(): IAlgorithm{
    return this.props.algorithm || Rheostat.defaultProps.algorithm;
  }

  private getOrientationPropOrDefault(): RheostatOrientation {
    return this.props.orientation || RheostatOrientation.Horizontal;
  }

  private getSnapPointsPropOrDefault(): number[]{
    return this.props.snapPoints || Rheostat.defaultProps.snapPoints;
  }

  private getMinPropOrDefault(): number{
    return this.props.min || Rheostat.defaultProps.min;
  }  

  private getMaxPropOrDefault(): number{
    return this.props.max || Rheostat.defaultProps.max;
  }  

  private getDisabledPropOrDefault(): boolean{
    return this.props.disabled === undefined? Rheostat.defaultProps.disabled: this.props.disabled;
  }

  private getValuesPropOrDefault(values: number[] | undefined): number[]{
    return  values || Rheostat.defaultProps.values;
  }

  private getClassName(orientation: RheostatOrientation, rootClassName?: string): string {
    const classOrientation = orientation === RheostatOrientation.Vertical
      ? 'rheostat-vertical'
      : 'rheostat-horizontal';

    return classNames('rheostat', classOrientation, rootClassName);
  }

  public getPublicState(): IRheostatPublicState {
    return {
      max: this.getMaxPropOrDefault(),
      min: this.getMinPropOrDefault(),
      values: this.state.values,
    };
  }

  // istanbul ignore next
  private getSliderBoundingBox(): IBoundingBox {
    const { rheostat } = this.refs;
    const node = rheostat as any;
    const rect = node.getBoundingClientRect();

    return {
      height: rect.height || node.clientHeight,
      left: rect.left,
      top: rect.top,
      width: rect.width || node.clientWidth,
    };
  }

  public getProgressStyle(idx: number): any {
    const { handlePos } = this.state;

    const value = handlePos[idx];

    if (idx === 0) {
      return this.getOrientationPropOrDefault() === RheostatOrientation.Vertical
        ? { height: `${value}%`, top: 0 }
        : { left: 0, width: `${value}%` };
    }

    const prevValue = handlePos[idx - 1];
    const diffValue = value - prevValue;

    return this.getOrientationPropOrDefault() === RheostatOrientation.Vertical
      ? { height: `${diffValue}%`, top: `${prevValue}%` }
      : { left: `${prevValue}%`, width: `${diffValue}%` };
  }

  public getMinValue(idx: number): number {
    return this.state.values[idx - 1]
      ? Math.max(this.getMinPropOrDefault(), this.state.values[idx - 1])
      : this.getMinPropOrDefault();
  }

  public getMaxValue(idx: number): number {
    return this.state.values[idx + 1]
      ? Math.min(this.getMaxPropOrDefault(), this.state.values[idx + 1])
      : this.getMaxPropOrDefault();
  }

  // istanbul ignore next
  private getHandleDimensions(ev: any, sliderBox: IBoundingBox): number {
    const handleNode = ev.currentTarget || undefined;

    if (!handleNode) return 0;

    return this.getOrientationPropOrDefault() === RheostatOrientation.Vertical
      ? ((handleNode.clientHeight / sliderBox.height) * RheostatScalePercent.Full) / 2
      : ((handleNode.clientWidth / sliderBox.width) * RheostatScalePercent.Full) / 2;
  }

  public getClosestSnapPoint(value: number): number {
    if (!this.getSnapPointsPropOrDefault().length){
      return value;
    }

    return this.getSnapPointsPropOrDefault().reduce((snapTo, snap) => (
      Math.abs(snapTo - value) < Math.abs(snap - value) ? snapTo : snap
    ));
  }

  public getSnapPosition(positionPercent: number): number {
    if (!this.props.snap) return positionPercent;

    const value = this.getAlgorithmPropOrDefault().getValue(positionPercent, this.getMinPropOrDefault(), this.getMaxPropOrDefault());

    const snapValue = this.getClosestSnapPoint(value);

    return this.getAlgorithmPropOrDefault().getPosition(snapValue, this.getMinPropOrDefault(), this.getMaxPropOrDefault());
  }

  public getNextPositionForKey(idx: number, keyCode: number): number | undefined {
    const { handlePos, values } = this.state;
    //const { algorithm, max, min, snapPoints } = this.props;

    const shouldSnap = this.props.snap;

    let proposedValue = values[idx];
    let proposedPercentage = handlePos[idx];
    const originalPercentage = proposedPercentage;
    let stepValue = 1;

    if (this.props.max >= 100) {
      proposedPercentage = Math.round(proposedPercentage);
    } else {
      stepValue = 100 / (this.props.max - this.props.min);
    }

    let currentIndex = shouldSnap
                       ? this.getSnapPointsPropOrDefault().indexOf(this.getClosestSnapPoint(values[idx]))
                       : undefined;

    const stepMultiplier = {
      [RheostatKeys.LEFT]: function(v:number){ return v * -1},
      [RheostatKeys.RIGHT]: function(v:number){ return v * 1},
      [RheostatKeys.UP]: function(v:number){ return v * 1},
      [RheostatKeys.DOWN]: function(v:number){ return v * -1},
      [RheostatKeys.PAGE_DOWN]:function(v:number){ return  v > 1 ? -v : v * -10},
      [RheostatKeys.PAGE_UP]:function(v:number){ return v > 1 ? v : v * 10},
    };

    if (Object.prototype.hasOwnProperty.call(stepMultiplier, keyCode)) {
      proposedPercentage += stepMultiplier[keyCode](stepValue);

      if (shouldSnap) {
        if (proposedPercentage > originalPercentage) {
          // move cursor right unless overflow
          if (currentIndex < this.getSnapPointsPropOrDefault().length - 1) {
            proposedValue = this.getSnapPointsPropOrDefault()[currentIndex + 1];
          }
        // move cursor left unless there is overflow
        } else if (currentIndex > 0) {
          proposedValue = this.getSnapPointsPropOrDefault()[currentIndex - 1];
        }
      }
    } else if (keyCode === RheostatKeys.HOME) {
      proposedPercentage = RheostatScalePercent.Empty;

      if (shouldSnap) {
        proposedValue = this.getSnapPointsPropOrDefault()[0];
      }
    } else if (keyCode === RheostatKeys.END) {
      proposedPercentage = RheostatScalePercent.Full;

      if (shouldSnap) {
        proposedValue = this.getSnapPointsPropOrDefault()[this.getSnapPointsPropOrDefault().length - 1];
      }
    } else {
      return undefined;
    }

    return shouldSnap
      ? this.getAlgorithmPropOrDefault().getPosition(proposedValue, this.getMinPropOrDefault(), this.getMaxPropOrDefault())
      : proposedPercentage;
  }

  public getNextState(idx: number, proposedPosition: number): RheostatState {  
    const actualPosition = this.validatePosition(idx, proposedPosition);

    const nextHandlePos = this.state.handlePos.map((pos, index) => (
      index === idx ? actualPosition : pos
    ));

    return {
      handlePos: nextHandlePos,
      values: nextHandlePos.map(pos => (
        this.getAlgorithmPropOrDefault().getValue(pos, this.getMinPropOrDefault(), this.getMaxPropOrDefault())
      )),
      className: this.state.className,
      handleDimensions: this.state.handleDimensions,
      mousePos: this.state.mousePos,
      sliderBox: this.state.sliderBox,
      slidingIndex: this.state.slidingIndex,
    };
  }

  public getClosestHandle(positionPercent: number): number {
    const { handlePos } = this.state;

    return handlePos.reduce((closestIdx, node, idx) => {
      const challenger = Math.abs(handlePos[idx] - positionPercent);
      const current = Math.abs(handlePos[closestIdx] - positionPercent);
      return challenger < current ? idx : closestIdx;
    }, 0);
  }

  private getHandleFor(ev: any): number {
    return Number(ev.currentTarget.getAttribute('data-handle-key'));
  }

  // istanbul ignore next
  private setStartSlide(ev: any, x:number, y:number): void {
    const sliderBox = this.getSliderBoundingBox();

    this.setState({
      handleDimensions: this.getHandleDimensions(ev, sliderBox),
      mousePos: { x, y },
      sliderBox,
      slidingIndex: this.getHandleFor(ev),
      className: this.state.className,
      handlePos: this.state.handlePos,
      values: this.state.values
    });
  }

  // istanbul ignore next
  private startMouseSlide(ev:any): void {
    this.setStartSlide(ev, ev.clientX, ev.clientY);

    if (typeof document.addEventListener === 'function') {
      document.addEventListener('mousemove', this.handleMouseSlide, false);
      document.addEventListener('mouseup', this.endSlide, false);
    } else if((document as any).attachEvent) {
      (document as any).attachEvent('onmousemove', this.handleMouseSlide);
      (document as any).attachEvent('onmouseup', this.endSlide);
    }

    this.killEvent(ev);
  }

  // istanbul ignore next
  private startTouchSlide(ev:any): void {
    if (ev.changedTouches.length > 1) return;

    const touch = ev.changedTouches[0];

    this.setStartSlide(ev, touch.clientX, touch.clientY);

    document.addEventListener('touchmove', this.handleTouchSlide, false);
    document.addEventListener('touchend', this.endSlide, false);

    if (this.props.onSliderDragStart) this.props.onSliderDragStart();

    this.killEvent(ev);
  }

  // istanbul ignore next
  private handleMouseSlide(ev:any): void {
    if (this.state.slidingIndex === undefined) {
      return;
    }
    this.handleSlide(ev.clientX, ev.clientY);
    this.killEvent(ev);
  }

  // istanbul ignore next
  private handleTouchSlide(ev:any):void {
    if (this.state.slidingIndex === undefined) {
      return;
    }

    if (ev.changedTouches.length > 1) {
      this.endSlide();
      return;
    }

    const touch = ev.changedTouches[0];

    this.handleSlide(touch.clientX, touch.clientY);
    this.killEvent(ev);
  }

  // istanbul ignore next
  private handleSlide(x:number, y:number): void {
    const idx = this.state.slidingIndex;
    if (idx === undefined) {
      return;
    }
    const sliderBox = this.state.sliderBox;

    const positionPercent = this.getOrientationPropOrDefault() === RheostatOrientation.Vertical
      ? ((y - sliderBox.top) / sliderBox.height) * RheostatScalePercent.Full
      : ((x - sliderBox.left) / sliderBox.width) * RheostatScalePercent.Full;

    this.slideTo(idx, positionPercent);

    if (this.canMove(idx, positionPercent)) {
      // update mouse positions
      this.setState({
        mousePos: { x, y },      
        className: this.state.className,
        handlePos: this.state.handlePos,
        handleDimensions: this.state.handleDimensions,
        sliderBox: this.state.sliderBox,
        slidingIndex: this.state.slidingIndex,
        values: this.state.values
      });
      if (this.props.onSliderDragMove) this.props.onSliderDragMove();
    }
  }

  // istanbul ignore next
  private endSlide(): void {
    const idx = this.state.slidingIndex;
    if(idx === undefined){
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
    else if((document as any).detachEvent){
      (document as any).detachEvent('onmousemove', this.handleMouseSlide);
      (document as any).detachEvent('onmouseup', this.endSlide);
    }

    if (this.props.onSliderDragEnd) {
      this.props.onSliderDragEnd();
    }
    if (this.props.snap) {
      const positionPercent = this.getSnapPosition(this.state.handlePos[idx]);
      this.slideTo(idx, positionPercent, () => this.fireChangeEvent());
    } else {
      this.fireChangeEvent();
    }
  }

  // istanbul ignore next
  private handleClick(ev: React.MouseEvent<React.HTMLProps<HTMLDivElement>>): void {
    if ((ev.target as any).getAttribute('data-handle-key')) {
      return;
    }

    // Calculate the position of the slider on the page so we can determine
    // the position where you click in relativity.
    const sliderBox = this.getSliderBoundingBox();

    const positionDecimal = this.getOrientationPropOrDefault() === RheostatOrientation.Vertical
      ? (ev.clientY - sliderBox.top) / sliderBox.height
      : (ev.clientX - sliderBox.left) / sliderBox.width;

    const positionPercent = positionDecimal * RheostatScalePercent.Full;

    const handleId = this.getClosestHandle(positionPercent);

    const validPositionPercent = this.getSnapPosition(positionPercent);

    // Move the handle there
    this.slideTo(handleId, validPositionPercent, () => this.fireChangeEvent());

    if (this.props.onClick){
      this.props.onClick();
    }
  }

  // istanbul ignore next
  private handleKeydown(ev: any): void {
    const idx = this.getHandleFor(ev);

    if(ev.keyCode === RheostatKeys.ESC) {
      ev.currentTarget.blur();
      return;
    }

    const proposedPercentage = this.getNextPositionForKey(idx, ev.keyCode);

    if (proposedPercentage === undefined) {
      return;
    }

    if (this.canMove(idx, proposedPercentage)) {
      this.slideTo(idx, proposedPercentage, () => this.fireChangeEvent());
      if (this.props.onKeyPress) this.props.onKeyPress();
    }

    this.killEvent(ev);
  }

  // Make sure the proposed position respects the bounds and
  // does not collide with other handles too much.
  public validatePosition(idx: number, proposedPosition: number): number {
    const { handlePos, handleDimensions } = this.state;

    return Math.max(
      Math.min(
        proposedPosition,
        handlePos[idx + 1] !== undefined
          ? handlePos[idx + 1] - handleDimensions
          : RheostatScalePercent.Full, // 100% is the highest value
      ),
      handlePos[idx - 1] !== undefined
        ? handlePos[idx - 1] + handleDimensions
        : RheostatScalePercent.Empty, // 0% is the lowest value
    );
  }

  public validateValues(proposedValues: number[], props?: IRheostatProps): number[] {
    const { max, min } = props || this.props;

    return proposedValues.map((value, idx, values) => {
      const realValue = Math.max(Math.min(value, max || this.getMaxPropOrDefault()), min || this.getMinPropOrDefault());

      if (values.length && realValue < values[idx - 1]) {
        return values[idx - 1];
      }

      return realValue;
    });
  }

  // Can we move the slider to the given position?
  public canMove(idx: number, proposedPosition: number): boolean {
    const { handlePos, handleDimensions } = this.state;

    if (proposedPosition < RheostatScalePercent.Empty) return false;
    if (proposedPosition > RheostatScalePercent.Full) return false;

    const nextHandlePosition = handlePos[idx + 1] !== undefined
      ? handlePos[idx + 1] - handleDimensions
      : Infinity;

    if (proposedPosition > nextHandlePosition) return false;

    const prevHandlePosition = handlePos[idx - 1] !== undefined
      ? handlePos[idx - 1] + handleDimensions
      : -Infinity;

    if (proposedPosition < prevHandlePosition) return false;

    return true;
  }

  // istanbul ignore next
  private fireChangeEvent(): void {
    if (this.props.onChange) {
      this.props.onChange(this.getPublicState())
    };
  }

  // istanbul ignore next
  private slideTo(idx: number, proposedPosition: number, onAfterSet?: () => void) {
    const nextState = this.getNextState(idx, proposedPosition);

    this.setState(nextState, () => {
      if (this.props.onValuesUpdated) {
        this.props.onValuesUpdated(this.getPublicState());
      }
      if (onAfterSet) {
        onAfterSet();}
    });
  }

  // istanbul ignore next
  private updateNewValues(nextProps: IRheostatProps) {
    // Don't update while the slider is sliding
    if (this.state.slidingIndex !== undefined) {
      return;
    }
    const { max, min, values } = nextProps;
    const nextValues = this.validateValues(values || [], nextProps);

    this.setState({
        handlePos: nextValues.map(value => this.getAlgorithmPropOrDefault().getPosition(value, this.getMinPropOrDefault(), this.getMaxPropOrDefault())),
        values: nextValues,
        slidingIndex: this.state.slidingIndex,
        mousePos: this.state.mousePos,      
        className: this.state.className,
        handleDimensions: this.state.handleDimensions,
        sliderBox: this.state.sliderBox,
      }, 
      () => this.fireChangeEvent()
    );
  }

  private killEvent(ev:any) {
    ev.stopPropagation();
    ev.preventDefault();
  }

  render() {
      const Handle = this.props.handle || Button;
      const PitComponent = this.props.pitComponent;
      const ProgressBar = this.props.progressBar || 
                React.createClass({render: function(){ return <div {...this.props}></div>}});
      
    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        className={this.state.className}
        ref="rheostat"
        onClick={ev => { if(!this.getDisabledPropOrDefault()){ this.handleClick(ev) }}}
        style={{ position: 'relative' }}
      >
        <div className="rheostat-background" />
          {
            this.state.handlePos.map((pos, idx) => {
                const handleStyle = this.getOrientationPropOrDefault() === RheostatOrientation.Vertical
                  ? { top: `${pos}%`, position: 'absolute' }
                  : { left: `${pos}%`, position: 'absolute' };

                return <Handle 
                      aria-valuemax={this.getMaxValue(idx)}
                      aria-valuemin={this.getMinValue(idx)}
                      aria-valuenow={this.state.values[idx]}
                      aria-disabled={this.getDisabledPropOrDefault()}
                      data-handle-key={idx}
                      className="rheostat-handle"
                      key={idx}
                      onClick={this.killEvent}
                      onKeyDown={(ev:any) => {if(!this.getDisabledPropOrDefault()){this.handleKeydown(ev)}}}
                      onMouseDown={(ev:any) => {if(!this.getDisabledPropOrDefault()){this.startMouseSlide(ev)}}}
                      onTouchStart={(ev:any) => {if(!this.getDisabledPropOrDefault()){this.startTouchSlide(ev)}}}
                      role="slider"
                      style={handleStyle}
                      tabIndex={0}
                />;
          })}
        {
          this.state.handlePos.map((node, idx, arr) => {
              if (idx === 0 && arr.length > 1) {
                return undefined;
              }

              return (
                // progressbar
                <ProgressBar className="rheostat-progress"
                              key={idx}
                              style={this.getProgressStyle(idx)}
                />
              );
          })
        }
        {
          PitComponent && (this.props.pitPoints || []).map((n) => {
              const pos = this.getAlgorithmPropOrDefault().getPosition(n, this.getMinPropOrDefault(), this.getMaxPropOrDefault());
              const pitStyle = this.getOrientationPropOrDefault() === RheostatOrientation.Vertical
                                ? { top: `${pos}%`, position: 'absolute' }
                                : { left: `${pos}%`, position: 'absolute' };

              return (
                <PitComponent key={n} style={pitStyle}>{n}</PitComponent>
              );
          })
        }

        { this.props.children }
      </div>
    );
  }
}



class Button extends React.Component<React.HTMLProps<HTMLButtonElement>,{}> {
  render() {
    return <button {...this.props} type="button" />;
  }
}

interface IBoundingBox{
  width: number;
  height: number;
  top: number;
  left: number;
}
interface IMousePosition{
  x: number;
  y: number;
}
interface IRheostatPublicState{
    max: number,
    min: number,
    values: number[]
}

interface IClassicComponentClass{
  new (props?: any, context?: any): React.ClassicComponent<any, React.ComponentState>;
}


export default Rheostat;
export { IRheostatProps, IRheostatPublicState};
