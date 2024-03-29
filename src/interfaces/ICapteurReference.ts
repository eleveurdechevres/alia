import { IChannel } from './IChannel';

export interface ICapteurReference {
    id: string;
    marque: string;
    ref_fabricant: string;
    description: string;
    image: string;
    channels: IChannel[];
}