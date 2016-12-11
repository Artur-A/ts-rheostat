
import 'jsdom-global/register';

import * as mocha from "mocha";
import { shallow, describeWithDOM, mount } from 'enzyme';
import * as sinon from 'sinon';
import { assert } from 'chai';


import * as React from 'react';
import Rheostat, {IRheostatProps} from "../src/Rheostat";
import RheostatKeys from '../src/constants/RheostatKeys';
import RheostatOrientation from '../src/constants/RheostatOrientation';


const has = Object.prototype.hasOwnProperty;

function testKeys(slider:any, tests: {key: RheostatKeys, expectedPos: number}[]) {
  tests.forEach((test) => {
      assert(slider.getNextPositionForKey(0, test.key) === test.expectedPos, `${test.key}: ${test.expectedPos}%`);    
  });
}
function newSlider(props?: any){ return new Rheostat({...Rheostat.defaultProps, ...props}) };

describe('<Rheostat />', () => {
  describe('render', () => {
    it('should render the slider with one handle by default', () => {
      const wrapper = shallow(<Rheostat />);
      assert(wrapper.find('.rheostat-handle').length === 1, 'no values one handle');
    });

    it('should render the slider with a single handle', () => {
      const wrapper = shallow(<Rheostat values={[1]} />);
      assert(wrapper.find('.rheostat-handle').length === 1, 'one handle is present');
    });

    it('should render the slider with as many handles as values', () => {
      const wrapper = shallow(<Rheostat values={[0, 25, 50, 75, 100]} />);
      assert(wrapper.find('.rheostat-handle').length === 5, 'five handles are present');
    });

    it('should render the slider with a bar', () => {
      const wrapper = shallow(<Rheostat />);
      assert(wrapper.find('.rheostat-progress').length === 1, 'the bar is present');
    });

    it('renders pits if they are provided', () => {
      const pitRender = sinon.stub().returns(<div />);

      // eslint-disable-next-line
      const PitComponent = React.createClass({
          render: pitRender
      });

      mount(<Rheostat pitComponent={PitComponent} pitPoints={[0, 20]} />);

      assert.isTrue(pitRender.calledTwice, 'two pits were rendered, one for each point');
    });

    it('renders pits if they are provided', () => {
      const pitRender = sinon.stub().returns(<div />);

      // eslint-disable-next-line
      const PitComponent = React.createClass({
        render: pitRender,
      });

      mount(
        <Rheostat
          orientation={RheostatOrientation.Vertical}
          pitComponent={PitComponent}
          pitPoints={[10]}
        />,
      );

      assert.isTrue(pitRender.calledOnce, 'one pit was rendered vertically');
    });
  });

  describe('componentWillReceiveProps', () => {    
    it('should re-evaluate the orientation when props change', () => {
      const slider = mount(<Rheostat />);
      assert(slider.props().orientation === RheostatOrientation.Horizontal, 'slider is horizontal');
      assert.include(
        slider.state('className'),
        'rheostat-horizontal',
        'cached class has horizontal',
      );
       slider.setProps({ orientation: RheostatOrientation.Vertical });

      assert(slider.props().orientation === RheostatOrientation.Vertical, 'slider was changed to vertical');
      
      assert.include(
        slider.state('className'),
        'rheostat-vertical',
        'the cached classes were updated',
      );
    });

    it('should not call onChange twice if values are the same as what is in state', () => {
      const onChange = sinon.spy();
      const slider = mount(<Rheostat onChange={onChange} values={[0]} />);

      // programatically change values like if the slider was dragged
      slider.setState({ values: [10] });

      slider.setProps({ values: [10] });

      assert(onChange.callCount === 0, 'onChange was not called');
    });

    it('should not update values if we are sliding', () => {
      const onChange = sinon.spy();
      const slider = mount(<Rheostat onChange={onChange} values={[0]} />);

      slider.setState({ slidingIndex: 0 });

      slider.setProps({ values: [50] });

      assert(onChange.callCount === 0, 'updateNewValues was not called');
    });

    it('should not update values if they are the same', () => {
      const onChange = sinon.spy();
      const slider = mount(<Rheostat onChange={onChange} values={[50]} />);

      slider.setProps({ values: [50] });

      assert(onChange.callCount === 0, 'updateNewValues was not called');
    });

    it('should update values when they change', () => {
      const onChange = sinon.spy();
      const slider = mount(<Rheostat onChange={onChange} values={[50]} />);

      slider.setProps({ values: [80] });

      assert.isTrue(onChange.calledOnce, 'updateNewValues was called');

      assert.include(slider.state('values'), 80, 'new value is reflected in state');
    });

    it('should move the values if the min is changed to be larger', () => {
      const slider = shallow(<Rheostat values={[50]} />);
      slider.setProps({ min: 80 });

      assert.include(slider.state('values'), 80, 'values was updated');
    });

    it('should move the values if the max is changed to be smaller', () => {
      const slider = shallow(<Rheostat values={[50]} />);
      slider.setProps({ max: 20 });

      assert.include(slider.state('values'), 20, 'values was updated');
    });

    it('should add handles', () => {
      const slider = shallow(<Rheostat />);
      assert(slider.state('values').length === 1, 'one handle exists');
      assert(slider.state('handlePos').length === 1, 'one handle exists');

      slider.setProps({ values: [] });
      assert(slider.state('values').length === 0, 'no handles exist');
      assert(slider.state('handlePos').length === 0, 'no handles exist');

      slider.setProps({ values: [0, 100] });
      assert(slider.state('values').length === 2, 'two handles exist');
      assert(slider.state('handlePos').length === 2, 'two handles exist');
    });
  });
});

describe('Rheostat API', () => {
  describe('getPublicState', () => {
    it('should only return min, max, and values from public state', () => {
      const slider = newSlider();
      const state = slider.getPublicState();

      assert.isTrue(has.call(state, 'max'), 'max exists');
      assert.isTrue(has.call(state, 'min'), 'min exists');
      assert.isTrue(has.call(state, 'values'), 'values exists');
      assert(Object.keys(state).length === 3, 'only 3 properties are present');
    });
  });

  describe('getProgressStyle', () => {
    it('should get correct style for horizontal slider', () => {
      const slider = newSlider();
      const style = slider.getProgressStyle(0);

      assert.isTrue(has.call(style, 'left'), 'left exists');
      assert.isTrue(has.call(style, 'width'), 'width exists');
      assert(Object.keys(style).length === 2, 'only two properties exist');
    });

    it('should get correct style for single handle at 0%', () => {
      const slider = newSlider();
      const style = slider.getProgressStyle(0);

      assert(style.left === 0, 'progress bar is at 0 because it is single handle');

      assert(style.width === '0%', 'progress bar is at 0%');
    });

    it('should get correct style for single handle at 50%', () => {
      const slider = newSlider({ values: [50], max: 100 });
      const style = slider.getProgressStyle(0);

      assert(style.width === '50%', 'progress bar is at 50');
    });

    it('should get correct style for second handle at 50%', () => {
      const slider = newSlider({ values: [50, 100], max: 100 });
      const style = slider.getProgressStyle(1);

      assert(style.left === '50%', 'progress bar starts at 50%');
      assert(style.width === '50%', 'progress bar spans 50%');
    });

    it('should get correct style for vertical slider', () => {
      const slider = newSlider({ orientation: RheostatOrientation.Vertical });
      const style = slider.getProgressStyle(0);

      assert.isTrue(has.call(style, 'top'), 'top exists');
      assert.isTrue(has.call(style, 'height'), 'height exists');
      assert(Object.keys(style).length === 2, 'only two properties exist');
    });

    it('should get correct style for second handle and vertical slider', () => {
      const slider = newSlider({ values: [50, 100], orientation: RheostatOrientation.Vertical });
      const style = slider.getProgressStyle(1);

      assert(style.top === '50%', 'progress bar starts at 50%');
      assert(style.height === '50%', 'progress bar spans 50%');
    });
  });

  describe('getMinValue', () => {
    it('should get the min value for single handle', () => {
      const slider = newSlider({ min: 10, values: [20] });
      assert(slider.getMinValue(0) === 10, 'the minimum possible value is 10');
    });

    it('should get the min value for second handle', () => {
      const slider = newSlider({ min: 0, values: [20, 40] });
      assert(slider.getMinValue(1) === 20, 'the minimum possible value is 20');
    });
  });

  describe('getMaxValue', () => {
    it('should get the max value for single handle', () => {
      const slider = newSlider({ max: 50, values: [20] });
      assert(slider.getMaxValue(0) === 50, 'the maximum possible value is 50');
    });

    it('should get the max value for two handles', () => {
      const slider = newSlider({ values: [20, 30] });
      assert(slider.getMaxValue(0) === 30, 'the maximum possible value is 30');
    });
  });

  describe('getClosestSnapPoint', () => {
    it('should get the closest value inside points given a value', () => {
      const slider = newSlider({ snapPoints: [0, 50] });

      assert(slider.getClosestSnapPoint(25) === 50, 'the closest point is 50');
      assert(slider.getClosestSnapPoint(24) === 0, 'the closest point is 0');
    });

    it('should return the value if points does not exist', () => {
      const slider = newSlider();
      assert(slider.getClosestSnapPoint(42) === 42, 'the closest point is 42');
    });
   });

  describe('getSnapPosition', () => {
    it('should return the position if snap is false', () => {
      const slider = newSlider();
      assert(slider.getSnapPosition(20) === 20, 'position is 20');
    });

    it('should snap to the closest value and give its position', () => {
      const slider = newSlider({
        snap: true,
        snapPoints: [0, 25, 50, 75, 100],
      });

      assert(slider.getSnapPosition(20) === 25, 'position is at 25%');
      assert(slider.getSnapPosition(96) === 100, 'position is at 100%');
      assert(slider.getSnapPosition(55) === 50, 'position is at 50%');
    });
  });

  describe('getNextPositionForKey', () => {
    it('should try to advance 1% when pressing left, right, up or down', () => {
      const slider = newSlider({
        values: [50],
      });

      testKeys(slider, [
        {key: RheostatKeys.LEFT, expectedPos: 49},
        {key: RheostatKeys.RIGHT, expectedPos: 51},
        {key: RheostatKeys.UP, expectedPos: 51},
        {key: RheostatKeys.DOWN, expectedPos: 49},
      ]);
    });

    it('should try to advance up to 10% when pressing page up/down', () => {
      const slider = newSlider({
        values: [50],
      });


       testKeys(slider, [
        {key: RheostatKeys.PAGE_UP, expectedPos: 60},
        {key: RheostatKeys.PAGE_DOWN, expectedPos: 40},
      ]);
    });
    it('should reach the start/end when pressing home/end', () => {
      const slider = newSlider({
        values: [50],
      });

       testKeys(slider, [
        {key: RheostatKeys.HOME, expectedPos: 0},
        {key: RheostatKeys.END, expectedPos: 100},
      ]);
    });

    it('overflows max', () => {
      const slider = newSlider({
        values: [100],
      }); 
      testKeys(slider, [
        {key: RheostatKeys.END, expectedPos: 100},
        {key: RheostatKeys.RIGHT, expectedPos: 101},
        {key: RheostatKeys.PAGE_UP, expectedPos: 110},
      ]);
    });

    it('should increment by value on a really small scale', () => {
      const slider = newSlider({
        max: 5,
        values: [2],
      });

      testKeys(slider, [
        {key: RheostatKeys.END, expectedPos: 100},
        {key: RheostatKeys.RIGHT, expectedPos: 60},
        {key: RheostatKeys.PAGE_UP, expectedPos: 60},
        {key: RheostatKeys.PAGE_DOWN, expectedPos: 20},
        {key: RheostatKeys.LEFT, expectedPos: 20},
        {key: RheostatKeys.HOME, expectedPos: 0},
      ]);
    });
    it('should handle large scales well', () => {
      const slider = newSlider({
        max: 1e9,
        values: [5e8],
      });

      testKeys(slider, [
        {key: RheostatKeys.END, expectedPos: 100},
        {key: RheostatKeys.RIGHT, expectedPos: 51},
        {key: RheostatKeys.PAGE_UP, expectedPos: 60},
        {key: RheostatKeys.PAGE_DOWN, expectedPos: 40},
        {key: RheostatKeys.LEFT, expectedPos: 49},
        {key: RheostatKeys.HOME, expectedPos: 0},
      ]);
    });

    it('should snap to a value if snap is set', () => {
      const slider = newSlider({
        snap: true,
        snapPoints: [10, 20, 40, 60, 80],
        values: [40],
      });

      testKeys(slider, [
        {key: RheostatKeys.END, expectedPos: 80},
        {key: RheostatKeys.RIGHT, expectedPos: 60},
        {key: RheostatKeys.PAGE_UP, expectedPos: 60},
        {key: RheostatKeys.PAGE_DOWN, expectedPos: 20},
        {key: RheostatKeys.LEFT, expectedPos: 20},
        {key: RheostatKeys.HOME, expectedPos: 10},
      ]);
    });

    it('should not overflow min with snap', () => {
      const slider = newSlider({
        snap: true,
        snapPoints: [10, 20, 40, 60, 80],
        values: [10],
      });

      testKeys(slider, [
        {key: RheostatKeys.LEFT, expectedPos: 10},
        {key: RheostatKeys.PAGE_DOWN, expectedPos: 10},
        {key: RheostatKeys.HOME, expectedPos: 10},
      ]);
    });

    it('should not overflow max with snap', () => {
      const slider = newSlider({
        snap: true,
        snapPoints: [10, 20, 40, 60, 80],
        values: [80],
      });

  
      testKeys(slider, [
        {key: RheostatKeys.RIGHT, expectedPos: 80},
        {key: RheostatKeys.PAGE_UP, expectedPos: 80},
        {key: RheostatKeys.END, expectedPos: 80},
      ]);
    });

    it('should return null for escape', () => {
      const slider = newSlider();
      assert.isUndefined(slider.getNextPositionForKey(0, RheostatKeys.ESC));
    });
  });

  describe('getNextState', () => {
    it('should return the next state given a position and index', () => {
      const slider = newSlider({
        values: [0],
      });

      const nextState = slider.getNextState(0, 50);

      assert(nextState.handlePos[0] === 50, 'handle is at 50%');
      assert(nextState.values[0] === 50, 'the value is 50');
    });

    it('should return correct validated state given two handles and overflow', () => {
      const slider = newSlider({
        values: [0, 20],
      });

      const nextState = slider.getNextState(0, 50);

      assert(nextState.handlePos[0] === 20, 'handle is at 20%');
      assert(nextState.values[0] === 20, 'the value is 20');
    });

    it('should not overflow the boundaries', () => {
      const slider = newSlider({
        values: [20],
      });

      let nextState = slider.getNextState(0, -20);

      assert(nextState.handlePos[0] === 0, 'handle is at 0%');
      assert(nextState.values[0] === 0, 'the value is 0');

      nextState = slider.getNextState(0, 120);

      assert(nextState.handlePos[0] === 100, 'handle is at 100%');
      assert(nextState.values[0] === 100, 'the value is 100');
    });
  });

  describe('getClosestHandle', () => {
    it('should return the index of the closest handle given a position', () => {
      const slider = newSlider({
        values: [0, 25, 50, 75, 100],
      });

      assert(slider.getClosestHandle(55) === 2, 'the index of the handle at 50% is 2');
      assert(slider.getClosestHandle(89) === 4, 'the index of the handle at 100% is 4');
      assert(slider.getClosestHandle(4) === 0, 'the index of the handle at 0% is 0');
    });
  });

  describe('validatePosition', () => {
    it('should make sure that handles respect bounds', () => {
      const slider = newSlider({
        values: [50],
      });

      assert(slider.validatePosition(0, -20) === 0, 'the handle was set to the min');
      assert(slider.validatePosition(0, 120) === 100, 'the handle was set to the max');
      assert(slider.validatePosition(0, 25) === 25, 'the correct position is returned');
    });

    it('should verify that two handles do not overlap', () => {
      const slider = newSlider({
        values: [25, 75],
      });

      assert(slider.validatePosition(0, 90) === 75, 'the handle reached its own max');
      assert(slider.validatePosition(1, 20) === 25, 'the handle reached its own min');
    });
  });

  describe('validateValues', () => {
    it('should validate that values do not overflow', () => {
      const slider = newSlider({
        values: [50],
      });

      assert(slider.validateValues([-20])[0] === 0, 'the value is set to the min');
      assert(slider.validateValues([120])[0] === 100, 'the value is set to the max');
    });

    it('should assert that values do not overlap', () => {
      const slider = newSlider();

      const newValues = slider.validateValues([80, 20]);

      assert(newValues[0] === 80, 'the first value is 80');
      assert(newValues[1] === 80, 'the second value is 80');
    });
  });

  describe('canMove', () => {
    it('should confirm that we can move to the proposed position', () => {
      const slider = newSlider({
        values: [50],
      });

      assert.isFalse(slider.canMove(0, 120), 'cannot overflow max');
      assert.isFalse(slider.canMove(0, -20), 'cannot overflow min');
    });

    it('should not overflow the position of another handle', () => {
      const slider = newSlider({
        values: [20, 60],
      });

      assert.isFalse(slider.canMove(0, 80), 'cannot overflow second handle');
      assert.isFalse(slider.canMove(1, 10), 'cannot overflow first handle');
    });

    it('should return true if it can move to the position', () => {
      const slider = newSlider({
        values: [25],
      });

      assert.isTrue(slider.canMove(0, 40), 'sure you can move here');
    });
  });
});
