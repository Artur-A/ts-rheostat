import IAlgorithm from "./IAlgorithm";

export default class Linear implements IAlgorithm {

  public getPosition(x: number, min: number, max: number): number {
      return (((x - min) / (max - min)) * 100);
  }

  public getValue(positionPercent: number, min: number, max: number): number {
      const dec = positionPercent / 100;

      if (positionPercent === 0) {
        return min;
      } else if (positionPercent === 100) {
        return max;
      }

      return Math.round(((max - min) * dec) + min);
  }
}

