import * as React from 'react';
import { observer } from 'mobx-react';
import { dateFormat } from 'src/utils/DateUtils';
import { IHabitat } from 'src/interfaces/IHabitat';
import { ICrosshairTime } from 'src/pages/Graph/Channel/GraphChannel';
// import { autorun } from 'mobx';
// import * as Moment from 'moment';

interface IProps {
    habitat: IHabitat,
    startDate: string,
    stopDate: string,
    crossHairTime: ICrosshairTime,
    chartWidth: number,
    chartHeight: number
}

@observer export class SunBehaviour extends React.Component<IProps, {}> {

    private mapSunriseSunset: Map<Date, string> = new Map();
    private chartWidth: number;
    private chartHeight: number;

    constructor(props: IProps) {
        super(props);
        this.chartWidth = this.props.chartWidth;
        this.chartHeight = this.props.chartHeight;
    }

    componentWillReceiveProps(nextProps: IProps) {
        console.log(this.props.crossHairTime);

        if ( nextProps.startDate && nextProps.stopDate ) {
            if ( nextProps.startDate !== this.props.startDate || nextProps.stopDate !== this.props.stopDate ) {
                for (var d = new Date(nextProps.startDate) ; d <= new Date(nextProps.stopDate) ; d.setDate(d.getDate() + 1)) {
                    // var date: Date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDay());
                    var date: Date = new Date(d);
                    date.setHours(0);
                    date.setMinutes(0);
                    date.setSeconds(0);
                    date.setMilliseconds(0);
                    this.loadJsonSunPositionsFromApiSunriseSunset(date, this.props.habitat.gps_lattitude, this.props.habitat.gps_longitude);
                }
            }
        }
    }
    loadJsonSunPositionsFromApiSunriseSunset = (date: Date, latitude: number, longitude: number) => {
        // https://api.sunrise-sunset.org/json?lat=47.1458614&lng=-1.3093876&date=2018-03-23&formatted=0
        var request = 'https://api.sunrise-sunset.org/json?lat=' + latitude + '&lng=' + longitude + '&date=' + dateFormat(date, 'YYYY-MM-DD') + '&formatted=0';
        return fetch(request)
            .then((response) => response.json())
            .then((data) => {
                if ( data && data['status'] === 'OK' ) {
                    var sunrise = new Date(data['results']['sunrise']);
                    var sunset = new Date(data['results']['sunset']);
                    console.log(sunrise + '      -      ' + sunset)
                    this.mapSunriseSunset.set(date, data['results']);
                    
                }
            });
    }

    render() {
        return (
            <svg width={this.chartWidth} height={this.chartHeight}>
                <rect x="0" y="0" width={this.chartWidth} height={this.chartHeight} fill="transparent" stroke="black" strokeWidth="1"/>
            </svg>
        )
    }
}