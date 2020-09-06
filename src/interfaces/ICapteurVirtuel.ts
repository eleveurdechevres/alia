import { ILocalizable } from './ILocalizable';

export interface ICapteurVirtuel extends ILocalizable {
    id: number;
    mission_id: number;
    plan_id: number;
    label: string;
    description: string;
    type_mesure: number;
}