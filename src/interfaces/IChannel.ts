export interface IChannel {
    id: number;
    capteur_reference_id: string;
    min_range: number;
    max_range: number;
    precision_step: number;
    id_type_mesure: number;
    measure_type: string;
    unit: string;
}