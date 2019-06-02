import { ISerieDef } from './ISeriesDef';
import { IMesure } from './IMesure';

export interface ISerieData {
    serieDef: ISerieDef;
    timeStart: Date;
    timeEnd: Date;
    yMin: number;
    yMax: number;
    points: IMesure[];
}
