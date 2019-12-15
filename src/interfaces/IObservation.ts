export interface IObservation {
    id: number;
    mission_id: number;
    plan_id: number;
    coordonneesPlanX: number;
    coordonneesPlanY: number;
    coordonneesPlanZ: number;
    label: string;
    description: string;
    image: string;
    dateObservation: Date;
}