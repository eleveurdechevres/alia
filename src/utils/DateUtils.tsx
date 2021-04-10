import * as moment from 'moment';

export function momentToSql(myMoment: moment.Moment): string {
    
    var d: Date = myMoment.toDate();
    var sqlDate: string = d.getFullYear() + '/' +  
        ('00' + (d.getMonth() + 1)).slice(-2) + '/' + 
        ('00' + d.getDate()).slice(-2) + ' ' + 
        ('00' + d.getHours()).slice(-2) + ':' + 
        ('00' + d.getMinutes()).slice(-2) + ':' + 
        ('00' + d.getSeconds()).slice(-2);
    return sqlDate;
}

/** Renvoie la date en heure au format décimal */
export function decimalTime(date: Date): number {
    return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
}

export function dateToSql(date: Date): string {
    return moment(date).format('YYYY/MM/DD HH:mm:ss');
}

export function dateToSqlDay(date: Date): string {
    return moment(date).format('YYYY/MM/DD');
}

export function dateTimeString(date: Date): string {
    return moment(date).format('DD/MM/YYYY HH:mm:ss');
}

export function dateFormat(date: Date, format: string): string {
    // moment.locale('fr-ca');
    return moment(date).format(format);
}

export function dateWithoutSeconds(sqlDate: any): Date {
    var date = new Date(sqlDate);
    date.setSeconds(0);
    date.setMilliseconds(0);
    date.setUTCMilliseconds(0);
    date.setUTCSeconds(0);
    return date;
}
