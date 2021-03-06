import { IPlan } from './IPlan';
import { ICapteur } from './ICapteur';
import { IChannel } from './IChannel';
import { ITypeMesure } from './ITypeMesure';
import { ICapteurVirtuel } from './ICapteurVirtuel';

export interface ISerieDef {
    _objId: 'ISerieDef';
    plan: IPlan | undefined;
    capteur: ICapteur;
    channel: IChannel;
    typeMesure: ITypeMesure;
}

export interface ISerieVirtuelleDef {
    _objId: 'ISerieVirtuelleDef';
    plan: IPlan | undefined;
    capteurVirtuel: ICapteurVirtuel;
    typeMesure: ITypeMesure;
}