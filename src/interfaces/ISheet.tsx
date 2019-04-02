import { ISeriesDef } from './ISeriesDef';
import { IClient } from './IClient';
import { IHabitat } from './IHabitat';
import { IMission } from './IMission';

export interface ISheet {
    sheetName: string;
    isVisible: boolean;
    sheetDef: ISheetDef;
    series: ISeriesDef[];
    // data: IGroupDataExt[];
    isReadOnly: boolean;
}

export interface ISheetDef {
    client: IClient;
    habitat: IHabitat;
    mission: IMission;
    dateDebut: Date;
    dateFin: Date;
}
