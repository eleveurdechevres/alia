import { ICapteurVirtuelForMission } from 'src/interfaces/ICapteurVirtuelForMission';
import { IChannelFromMission } from 'src/interfaces/IChannelFromMission';
import { ISerieData } from 'src/interfaces/ISerieData';

export function channelNameRenderer(channel: IChannelFromMission): string {
    return 'Plan[' + channel.plan_id + '] - Capteur[' + channel.capteur_reference_id + ']' + ' (' + channel.measure_type + ')';
}

export function capteurVirtuelNameRenderer(capteurVirtuel: ICapteurVirtuelForMission): string {
    return 'Plan[' + capteurVirtuel.plan_id + '] - Capteur[' + capteurVirtuel.label + ']' + ' (' + capteurVirtuel.unit + ')';
}

export function createSerieDataUniqueId(serieData: ISerieData): string {
    const serieDef = serieData.serieDef;
    
    const refId = serieDef._objId === 'ISerieDef' ? 'C_' + serieDef.capteur.capteur_reference_id : 'CV_' + serieDef.capteurVirtuel.label;
    const id = serieDef._objId === 'ISerieDef' ? serieDef.capteur.id : serieDef.capteurVirtuel.id;
    let legendText = refId +
        '_' + id +
        '_plan' + serieData.serieDef.plan.id + 
        '_' + serieData.serieDef.typeMesure.measure_type;

    return (legendText.replace(/(\s)/g, '_'));
}
