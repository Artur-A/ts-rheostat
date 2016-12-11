import IAlgorithm from "./IAlgorithm";

export default class Log10 implements IAlgorithm {

  public getPosition(x: number, min: number, max: number): number {
    const minv = Math.log(min);
    const maxv = Math.log(max);

    const scale = (maxv - minv) / 100;

    return (Math.log(x) - minv) / scale;
  }

  public getValue(positionPercent: number, min: number, max: number): number {
    const minv = Math.log(min);
    const maxv = Math.log(max);

    if (positionPercent === 0) {
      return min;
    } else if (positionPercent === 100) {
      return max;
    }

    // calculate adjustment factor
    const scale = (maxv - minv) / 100;

    return Math.floor(Math.exp(minv + (scale * positionPercent))) || 0;
  }
}



