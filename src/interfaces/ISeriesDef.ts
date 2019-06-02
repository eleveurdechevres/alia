import { IPlan } from './IPlan';
import { ICapteur } from './ICapteur';
import { IChannel } from './IChannel';
import { ITypeMesure } from './ITypeMesure';

export interface ISerieDef {
    plan: IPlan | undefined;
    capteur: ICapteur;
    channel: IChannel;
    typeMesure: ITypeMesure;
}
