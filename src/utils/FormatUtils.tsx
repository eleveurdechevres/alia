import * as React from 'react';

const numberFormater = new Intl.NumberFormat('en-US', { minimumIntegerDigits: 2 });
// const dateFormater = new Intl.DateTimeFormat('en-US', {
//     year: 'numeric',
//     month: 'numeric',
//     day: 'numeric',
//     hour: 'numeric',
//     minute: 'numeric',
//     second: 'numeric',
//     hour12: false
// });

/**
 * Return a date formated for the path : DD/MM/YYYY_hh:mm:ss
 * @param date date to format.
 */
type formatDateForPath = (date: Date) => string;
export const dateForPath: formatDateForPath = (d: Date) => {
    let dateFormated: string = d.getUTCFullYear() + '-' + numberFormater.format(d.getUTCMonth() + 1) + '-' + numberFormater.format(d.getUTCDate());
    dateFormated += '_' + numberFormater.format(d.getUTCHours());
    dateFormated += '-' + numberFormater.format(d.getUTCMinutes());
    dateFormated += '-' + numberFormater.format(d.getUTCSeconds());
    return dateFormated;
};

/**
 * Return a date formated.
 * @param date date to format.
 */
type formatDateType = (date: Date) => string;
export const date: formatDateType = (d: Date) => {
    let dateFormated: string = d.getUTCFullYear() + '/' + numberFormater.format(d.getUTCMonth() + 1) + '/' + numberFormater.format(d.getUTCDate());
    dateFormated += ' ' + numberFormater.format(d.getUTCHours());
    dateFormated += ':' + numberFormater.format(d.getUTCMinutes());
    dateFormated += ':' + numberFormater.format(d.getUTCSeconds());
    return dateFormated;
};

/**
 * Return a date formated.
 * @param date date to format.
 */
type formatDateFromTimeType = (time: number) => string;
export const dateFromTime: formatDateFromTimeType = (time: number) => {
    let d: Date = new Date(time);
    let dateFormated: string = d.getFullYear() + '/' + numberFormater.format(d.getUTCMonth() + 1) + '/' + numberFormater.format(d.getUTCDate());
    dateFormated += ' ' + numberFormater.format(d.getUTCHours());
    dateFormated += ':' + numberFormater.format(d.getUTCMinutes());
    dateFormated += ':' + numberFormater.format(d.getUTCSeconds());
    return dateFormated;
};

/**
 * Return a string formated.
 * @param value number to format
 * @param minimumIntegerDigits  The minimum number of integer digits to use.
 */
type formatNumberType = (value: number, minimumIntegerDigits: number) => string;
export const formatNumber: formatNumberType = (value: number, minimumIntegerDigits: number) => {
    let  formater = new Intl.NumberFormat('en-US', { minimumIntegerDigits: minimumIntegerDigits });
    return formater.format(value);
};

/**
 * Return a string which contains the size formated.
 * @param bytes bytes to format
 */
export const bytesToSize: (bytes: number) => string = (bytes: number) => {
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
        return '0 Byte';
    }
    let i: number = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
};

export function highlightText(text: string, query: string) {
    let lastIndex = 0;
    const words = query
        .split(/\s+/)
        .filter(word => word.length > 0)
        .map(escapeRegExpChars);
    if (words.length === 0) {
        return [text];
    }
    const regexp = new RegExp(words.join('|'), 'gi');
    const tokens: React.ReactNode[] = [];
    while (true) {
        const match = regexp.exec(text);
        if (!match) {
            break;
        }
        const length = match[0].length;
        const before = text.slice(lastIndex, regexp.lastIndex - length);
        if (before.length > 0) {
            tokens.push(before);
        }
        lastIndex = regexp.lastIndex;
        tokens.push(<strong key={lastIndex}>{match[0]}</strong>);
    }
    const rest = text.slice(lastIndex);
    if (rest.length > 0) {
        tokens.push(rest);
    }
    return tokens;
}

function escapeRegExpChars(text: string) {
    return text.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}
