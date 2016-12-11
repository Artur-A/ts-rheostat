
interface IAlgorithm{
    getPosition(x: number, min: number, max: number): number;
    getValue(positionPercent: number, min: number, max: number): number;
} 

export default IAlgorithm;