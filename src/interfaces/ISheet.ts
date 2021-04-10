import { ISerieDef } from './ISeriesDef';
import { IClient } from './IClient';
import { IHabitat } from './IHabitat';
import { IMission } from './IMission';
import { IconName } from '@blueprintjs/core';

export interface ISheet {
    sheetName: string;
    sheetType: ESheetType;
    isVisible: boolean;
    sheetDef: ISheetDef;
    series: ISerieDef[];
    // data: IGroupDataExt[];
    isReadOnly: boolean;
}

export enum ESheetType {
    MOLLIER_CHART,
    TIME_CHART,
    AVG_DELTA_CHART,
    CANDLE_CHART,
    TEXT_REPORT,
    SCATTER_PLOT,
    RADAR_CHART,
    DJU_CHART
}

export interface ISheetTypeProperties {
    name: string,
    icon: IconName,
    disabled?: boolean
}

export const ISheetTypes: Map<ESheetType, ISheetTypeProperties> = new Map([
    [
        ESheetType.MOLLIER_CHART,
        {
            name: 'Mollier',
            icon: 'curved-range-chart'
        } as ISheetTypeProperties
    ],
    [
        ESheetType.TIME_CHART,
        {
            name: 'y=f(t)',
            icon: 'timeline-line-chart'
        } as ISheetTypeProperties
    ],
    [
        ESheetType.AVG_DELTA_CHART,
        {
            name: 'M(Δ)=f(t, ☼)',
            icon: 'step-chart'
        } as ISheetTypeProperties
    ],
    [   ESheetType.CANDLE_CHART,
        {
            name: 'Candles',
            icon: 'alignment-horizontal-center',
            disabled: true
    } as ISheetTypeProperties
    ],
    [
        ESheetType.TEXT_REPORT,
        {
            name: 'Rapport',
            icon: 'manually-entered-data',
        } as ISheetTypeProperties
    ],
    [
        ESheetType.SCATTER_PLOT,
        {
            name: 'y=f(x)',
            icon: 'scatter-plot',
            disabled: true
        } as ISheetTypeProperties
    ],
    [
        ESheetType.RADAR_CHART,
        {
            name: 'Radar',
            icon: 'layout-auto',
            disabled: true
        } as ISheetTypeProperties
    ],
    [
        ESheetType.DJU_CHART,
        {
            name: 'DJU',
            icon: 'timeline-bar-chart'
        } as ISheetTypeProperties
    ]
]);

export function getSheetTypeProperties(sheetType: ESheetType): ISheetTypeProperties {
    return ISheetTypes.get(sheetType);
}

export interface ISheetDef {
    client: IClient;
    habitat: IHabitat;
    mission: IMission;
    dateDebutMission: Date;
    dateFinMission: Date;
}
