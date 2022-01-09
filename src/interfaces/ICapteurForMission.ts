import { ILocalizable } from './ILocalizable';

export interface ICapteurForMission extends ILocalizable {
    mission_id: number,
    capteur_id: number,
    plan_id: number,
    coordonneePlanX: number,
    coordonneePlanY: number,
    coordonneePlanZ: number,
    label: string,
    description: string
}
