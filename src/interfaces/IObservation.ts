import { ILocalizable } from './ILocalizable';

export interface IObservation extends ILocalizable {
    id: number;
    mission_id: number;
    plan_id: number;
    label: string;
    description: string;
    image: string;
    dateObservation: Date;
}