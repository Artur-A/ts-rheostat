import "../lib/rheostat.css";

import * as React from "react";
import { storiesOf } from "@kadira/storybook";

import * as rs from "../lib";

declare var module:any;

interface ILabeledSliderProps extends rs.IRheostatProps {
    formatValue?: (value:number) => void 
}
interface ILabeledSliderState {
    values: number[], 
}

class LabeledSlider extends React.Component<ILabeledSliderProps, ILabeledSliderState> {
  constructor(props: ILabeledSliderProps, state: ILabeledSliderState) {
    super(props, state);

    this.state = {
      values: props.values || [0],
    };

    this.updateValue = this.updateValue.bind(this);
  }

  private updateValue(sliderState: rs.IRheostatPublicState): void {
    this.setState({
      values: sliderState.values,
    });
  }

  render() {
    const { formatValue } = this.props;

    return (
      <div
        style={{
          margin: '10% auto',
          height: '100%',
          width: '50%',
        }}
      >
        <rs.Rheostat
          {...this.props}
          onValuesUpdated={this.updateValue}
          values={this.state.values}
        />
        <ul>
          <h4>Values</h4>
          {this.state.values.map(value => (
            <li key={value}>
              {formatValue ? formatValue(value) : value}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

storiesOf('Slider', module)
  .add('A Simple Slider', () => (
    <LabeledSlider />
  ))
  .add('Custom Handle', () => {
    const MyHandle = React.createClass({
      render: function(){  
        return (
          <div
            {...this.props}
            style={{
              ...this.props.style,
              backgroundColor: 'rgba(0, 15, 137, 0.5)',
              border: '1px solid #000f89',
              borderRadius: '100%',
              cursor: 'ew-resize',
              marginLeft: -13,
              height: 24,
              width: 24,
              zIndex: 3,
            }}
          />
      );
    }
  });
    return (
      <LabeledSlider
        handle={MyHandle}
        values={[0, 100]}
      />
    );
  })  
  .add('Large scale', () => (
    <LabeledSlider
      min={1}
      max={1000000}
      values={[1]}
    />
  ))
  .add('Large scale (with many handles)', () => (
    <LabeledSlider
      min={1}
      max={1000000}
      values={[1, 250000, 500000, 750000, 1000000]}
    />
  ))
  .add('Logarithmic scale algorithm', () => (
    <LabeledSlider
      algorithm={new rs.Log10Algorithm()}
      min={1}
      max={1000}
      values={[100]}
    />
  ))
  .add('Small scale (auto snap)', () => (
    <LabeledSlider
      max={5}
      min={1}
      snap
      values={[3]}
    />
  ))
  .add('Snapping to exact points', () => (
    <LabeledSlider
      snap
      snapPoints={[20, 40, 60, 80]}
    />
  ))
  .add('Pits with a snap', () => {
    const PitComponent = React.createClass({
      render: function(){
        return (
            <div
              style={{
                ...this.props.style,
                background: '#a2a2a2',
                width: 1,
                height: this.props.children % 10 === 0 ? 12 : 8,
                top: 20,
              }}
            />
        );
      }
    });    

    return (
      <LabeledSlider
        pitComponent={PitComponent}
        pitPoints={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]} // eslint-disable-line max-len
        snap
        snapPoints={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
        values={[40, 80]}
      />
    );
  })
  .add('Vertical', () => (
    <LabeledSlider orientation={rs.RheostatOrientation.Vertical} />
  ))
  .add('Vertical slider with pits', () => {
    const PitComponent = React.createClass({
      render: function(){
        return (
            <div
              style={{
                ...this.props.style,
                background: '#a2a2a2',
                width: this.props.children % 10 === 0 ? 12 : 8,
                height: 1,
                left:20
              }}
            >
            {
              this.props.children % 10 === 0 &&
              <span style={{left: 20, top:-8, position: "absolute", "font-size": 12}}>{this.props.children}</span>
            }
            </div>
        );
      }
    });    

    return (
      <LabeledSlider
        orientation={rs.RheostatOrientation.Vertical}
        pitComponent={PitComponent}
        pitPoints={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]} // eslint-disable-line max-len
        snap
        snapPoints={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
        values={[40]}
      />
    );
  })
  .add('Disabled', () => (
    <LabeledSlider disabled />
  ))
;