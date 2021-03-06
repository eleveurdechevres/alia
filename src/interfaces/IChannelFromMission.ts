export interface IChannelFromMission {
    _objId: 'IChannelFromMission';
    mission_id: number;
    capteur_id: number;
    plan_id: number;
    capteur_reference_id: string;
    channel_id: number;
    measure_id: number;
    measure_type: string;
    min_range: number;
    max_range: number;
    precision_step: number;
    unit: string;
}
