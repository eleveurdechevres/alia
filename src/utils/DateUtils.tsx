import * as moment from 'moment';

export function momentToSql(myMoment: moment.Moment) {
    
    var d = myMoment.toDate();
    var sqlDate = d.getFullYear() + '/' +  
        ('00' + (d.getMonth() + 1)).slice(-2) + '/' + 
        ('00' + d.getDate()).slice(-2) + ' ' + 
        ('00' + d.getHours()).slice(-2) + ':' + 
        ('00' + d.getMinutes()).slice(-2) + ':' + 
        ('00' + d.getSeconds()).slice(-2);
    return sqlDate;
}

export function dateToSql(date: Date) {
    return moment(date).format('YYYY/MM/DD hh:mm:ss');
}

export function dateTimeString(date: Date) {
    return moment(date).format('DD/MM/YYYY hh:mm:ss');
}

export function dateFormat(date: Date, format: string) {
    return moment(date).format(format);
}

export function dateWithoutSeconds(sqlDate: any) {
    var date = new Date(sqlDate);
    date.setSeconds(0);
    date.setMilliseconds(0);
    date.setUTCMilliseconds(0);
    date.setUTCSeconds(0);
    return date;
}
