import { ISerieDef, ISerieVirtuelleDef } from './ISeriesDef';
import { IMesure } from './IMesure';

export interface ISerieData {
    serieDef: ISerieDef | ISerieVirtuelleDef;
    timeStart: Date;
    timeEnd: Date;
    yMin: number;
    yMax: number;
    points: IMesure[];
}
