import { IHabitat } from 'src/interfaces/IHabitat';
import { dateFormat, decimalTime } from 'src/utils/DateUtils';

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
    sunHeight: (date: Date) => number;
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
                this.loadJsonSunPositionsFromApiSunriseSunset(date0, this.habitat.gps_latitude, this.habitat.gps_longitude);
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
                    
                    let sunrise: Date = new Date(data['results']['sunrise']);
                    let sunset: Date = new Date(data['results']['sunset']);
                    let solar_noon: Date = new Date(data['results']['solar_noon']);
                    let day_length: number = data['results']['day_length'];
                    let civil_twilight_begin: Date = new Date(data['results']['civil_twilight_begin']);
                    let civil_twilight_end: Date = new Date(data['results']['civil_twilight_end']);
                    let nautical_twilight_begin: Date = new Date(data['results']['nautical_twilight_begin']);
                    let nautical_twilight_end: Date = new Date(data['results']['nautical_twilight_end']);
                    let astronomical_twilight_begin: Date = new Date(data['results']['astronomical_twilight_begin']);
                    let astronomical_twilight_end: Date = new Date(data['results']['astronomical_twilight_end']);
                
                    let answer: ISunriseSunset = {
                        sunrise: sunrise,
                        sunset: sunset,
                        solar_noon: solar_noon,
                        day_length: day_length,
                        civil_twilight_begin: civil_twilight_begin,
                        civil_twilight_end: civil_twilight_end,
                        nautical_twilight_begin: nautical_twilight_begin,
                        nautical_twilight_end: nautical_twilight_end,
                        astronomical_twilight_begin: astronomical_twilight_begin,
                        astronomical_twilight_end: astronomical_twilight_end,
                        sunHeight: (currentDate: Date) => {
                            let time: number = decimalTime(currentDate);
                            let noonTime: number = decimalTime(solar_noon);
                            let sunriseTime: number = decimalTime(sunrise);
                            let sunHeight: number = -Math.cos(2 * Math.PI * (time - noonTime + 12) / 24) + Math.cos(6.28 * (sunriseTime - noonTime + 12) / 24)
                            // TODO : penser à mettre à l'échelle
                            return sunHeight;
                        }
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