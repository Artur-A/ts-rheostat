import IAlgorithm from "./IAlgorithm";
export default class Log10 implements IAlgorithm {
    getPosition(x: number, min: number, max: number): number;
    getValue(positionPercent: number, min: number, max: number): number;
}
