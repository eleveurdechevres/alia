import { IHabitat } from 'src/interfaces/IHabitat';
import { dateFormat } from 'src/utils/DateUtils';

export interface ISunriseSunset {
    sunrise: Date;
    sunset: Date;
    solar_noon: Date;
    day_length: number;
    civil_twilight_begin: Date;
    civil_twilight_end: Date;
    nautical_twilight_begin: Date;
    nautical_twilight_end: Date;
    astronomical_twilight_begin: Date;
    astronomical_twilight_end: Date;
}

export class SunBehaviourManager {

    private mapSunriseSunset: Map<string, ISunriseSunset> = new Map();
    private habitat: IHabitat;

    constructor(habitat: IHabitat, startDate: Date, stopDate: Date) {
        this.habitat = habitat;
        this.updateSunPositions(startDate, stopDate);
    }

    public updateSunPositions(startDate: Date, stopDate: Date) {
        for (var date = new Date(startDate) ; date <= new Date(stopDate) ; date.setDate(date.getDate() + 1)) {
            var date0: Date = new Date(date);
            date0.setHours(0);
            date0.setMinutes(0);
            date0.setSeconds(0);
            date0.setMilliseconds(0);
        
            if ( !this.mapSunriseSunset.has(date.toString()) ) {
                // var date: Date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDay());
                this.loadJsonSunPositionsFromApiSunriseSunset(date0, this.habitat.gps_lattitude, this.habitat.gps_longitude);
            }
        }
    }

    private loadJsonSunPositionsFromApiSunriseSunset = (date: Date, latitude: number, longitude: number) => {
        // https://api.sunrise-sunset.org/json?lat=47.1458614&lng=-1.3093876&date=2018-03-23&formatted=0

        var request = 'https://api.sunrise-sunset.org/json?lat=' + latitude + '&lng=' + longitude + '&date=' + dateFormat(date, 'YYYY-MM-DD') + '&formatted=0';
        return fetch(request)
            .then((response) => response.json())
            .then((data: {}) => {
                if ( data && data['status'] === 'OK' ) {
                    let answer: ISunriseSunset = {
                        sunrise: new Date(data['results']['sunrise']),
                        sunset: new Date(data['results']['sunset']),
                        solar_noon: new Date(data['results']['solar_noon']),
                        day_length: data['results']['day_length'],
                        civil_twilight_begin: new Date(data['results']['civil_twilight_begin']),
                        civil_twilight_end: new Date(data['results']['civil_twilight_end']),
                        nautical_twilight_begin: new Date(data['results']['nautical_twilight_begin']),
                        nautical_twilight_end: new Date(data['results']['nautical_twilight_end']),
                        astronomical_twilight_begin: new Date(data['results']['astronomical_twilight_begin']),
                        astronomical_twilight_end: new Date(data['results']['astronomical_twilight_end']),
                    }
                    this.mapSunriseSunset.set(date.toString(), answer);
                }
            });
    }

    public getSunriseSunsetData (): Map<string, ISunriseSunset> {
        return this.mapSunriseSunset;
    }

    public isDay(date: Date): boolean {
        if ( date ) {
            var simpleDate: Date = new Date(date);
            simpleDate.setHours(0);
            simpleDate.setMinutes(0);
            simpleDate.setSeconds(0);
            simpleDate.setMilliseconds(0);

            let dateKey = simpleDate.toString();

            if ( this.mapSunriseSunset.has(dateKey) ) {
                let sunriseDate: Date = new Date(this.mapSunriseSunset.get(dateKey).sunrise);
                let sunsetDate: Date = new Date(this.mapSunriseSunset.get(dateKey)['sunset']);
                if ( date < sunriseDate ) {
                    return false;
                } else if ( date > sunsetDate ) {
                    return false;
                }
                return true;
            }
        }
        return undefined;
    }
}