import { dateToSql } from 'src/utils/DateUtils';
// import { observable } from "mobx";

interface ITypeMesures {
    id: number,
    measure_type: string,
    unit: string,
}

export interface IMesure {
    date: Date,
    valeur: number
}

// Mouvement
// Température
// Humidité
// Luminosité
// Batterie
// Vitesse vent
// Direction vent
// Pression atmosphérique
// Sabotage

export class GraphDataManager {

    mapTypeMesures: Map<string, ITypeMesures> = new Map();
    vitesseVentValues: IMesure[] = [];
    directionVentValues: IMesure[] = [];

    constructor() {
        this.loadTypeMesuresFromAeroc();
    }

    public getMesureTypes = () => {
        return this.mapTypeMesures;
    }

    private loadTypeMesuresFromAeroc = () => {
        var request = 'http://test.ideesalter.com/alia_getTypeMesures.php';
        return fetch(request)
            .then((response) => response.json())
            .then((data) => {
                this.mapTypeMesures.clear();
                data.forEach((typeMesure: ITypeMesures) => {
                    let key = typeMesure.measure_type;
                    this.mapTypeMesures.set(key, typeMesure);
                })
            });
    }
    
    public loadMeteoDataFromAerocForChannelId = (
        habitatId: number, 
        channelId: number, 
        dateBegin: Date, 
        dateEnd: Date, 
        mesuresToStore: IMesure[], 
        callback: (mesures: IMesure[]) => void
    ) => {
        var request = 'http://test.ideesalter.com/alia_readMeteo.php?habitat_id=' + habitatId
            + '&channel_id=' + channelId + '&date_begin=' + dateToSql(dateBegin) + '&date_end=' + dateToSql(dateEnd);

        return fetch(request)
            .then((response) => response.json())
            .then((data) => {

                mesuresToStore.length = 0;
                data.forEach((mesure: IMesure) => {
                    mesuresToStore.push({ date: new Date(mesure.date), valeur: mesure.valeur})
                });
                callback(mesuresToStore);
            });
    }

    public getDirectionVent = (date: Date): number => {
        return this.getValeurAtDate( this.directionVentValues, date );
    }
    
    public getVitesseVent = (date: Date): number => {
        return this.getValeurAtDate( this.vitesseVentValues, date );
    }

    private getValeurAtDate( genericMesures: IMesure[], date: Date ) {
        let index = genericMesures.findIndex((mesure: IMesure) => { return mesure.date >= date });

        return ( index !== -1 ? genericMesures[index].valeur : undefined );
    }

    // http://test.ideesalter.com/alia_readMeteoForChannelType.php?date_begin=2018/03/18%2000:00:00&date_end=2018/03/22%2019:00:00&habitat_id=2&channel_type=Direction%20vent
    private loadMeteoDataFromAerocForChannelType = (missionId: number, channelType: string, dateBegin: Date, dateEnd: Date, mesuresToStore: IMesure[], callback: (mesures: IMesure[]) => void) => {
        
        var request = 'http://test.ideesalter.com/alia_readMeteoForChannelType.php?mission_id=' + missionId
            + '&channel_type=' + channelType + '&date_begin=' + dateToSql(dateBegin) + '&date_end=' + dateToSql(dateEnd);
        console.log(request);
        return fetch(request)
            .then((response) => response.json())
            .then((data) => {

                mesuresToStore.length = 0;
                data.forEach((mesure: any) => {
                    mesuresToStore.push({ date: new Date(mesure.date), valeur: parseFloat(mesure.valeur)})
                });
                callback(mesuresToStore);
            });
    }

    public loadVitesseVentFromAeroc = (
        missionId: number,
        dateBegin: Date,
        dateEnd: Date,
        callback: (mesures: IMesure[]) => void
    ) => {
        this.loadMeteoDataFromAerocForChannelType(missionId, 'Vitesse vent', dateBegin, dateEnd, this.vitesseVentValues, callback);
    }

    public loadDirectionVentFromAeroc = (
        missionId: number,
        dateBegin: Date,
        dateEnd: Date,
        callback: (mesures: IMesure[]) => void
    ) => {
        this.loadMeteoDataFromAerocForChannelType(missionId, 'Direction vent', dateBegin, dateEnd, this.directionVentValues, callback);
    }

}