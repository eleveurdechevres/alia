import { IChannel } from './IChannel';

export interface IAvailableCapteur {
    id: number;
    capteur_reference_id: string;
    marque: string;
    ref_fabricant: string;
    description: string;
    available: boolean;
    propriete_alia: boolean;
    channels: IChannel[];
}