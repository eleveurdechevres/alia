import { Moment } from 'moment';
import { IHabitat } from 'src/interfaces/IHabitat';
import { IClient } from 'src/interfaces/IClient';

export enum AnalyseType {
    MOLLIER,
    LINE_CHART,
    CANDLE_CHART,
    RAPPORT,
    SCATTER_PLOT,
    RADAR_CHART
}
export interface IAnalyse {
    analyseType: AnalyseType,
    dateDebut: Moment,
    dateFin: Moment,
    client: IClient,
    habitat: IHabitat
}