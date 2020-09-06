import { ILocalizable } from './ILocalizable';

export interface ICapteur extends ILocalizable {
    id: number;
    capteur_reference_id: string;
    plan_id: number;
}