import * as d3 from 'd3';
import * as Moment from 'moment';
import { ISheet } from 'src/interfaces/ISheet';

export interface IMargin {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export interface ILegendItem {
    serieName: string;
    isShown: boolean;
    seriesDefIndex: number;
    toString: () => string;
}

export const svgBorderWidth = 30;

export abstract class BaseChart {

    // Params
    protected totalWidth: number;
    protected totalHeight: number;
    protected legendItemsBySeriesDefs: ILegendItem[][];
    protected flatLegendItems: ILegendItem[] = [];

    public abstract updateChart: () => void;

    private nbTimeTicks: number;

    constructor(
        protected sheet: ISheet,
        width: number,
        height: number) {

        this.totalWidth = width;
        this.totalHeight = height;

        this.nbTimeTicks = 9;
    }

    public customAxis(g: any, axis: any) {
        g.call(axis);
        g.select('.domain')
            .attr('stroke', 'black')
            .attr('pointer-events', 'none');
        g.selectAll('line')
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('shape-rendering', 'crispEdges')
            .attr('pointer-events', 'none');
        g.selectAll('.tick text')
            .attr('fill', 'black')
            .attr('paint-order', 'stroke')
            .attr('stroke-width', 2)
            .attr('stroke', 'white')
            .attr('pointer-events', 'none')
            .attr('cursor', 'crosshair');
    }

    public customBrush(g: any, brush: any) {
        g.call(brush);
        g.select('.selection')
            .attr('stroke', 'black')
            .attr('fill', 'white')
            .attr('stroke-dasharray', '1,1');
        }

    public customGrid(g: any, axis: any) {
        g.call(axis);
        g.select('.domain')
            .attr('stroke', 'black')
            .attr('pointer-events', 'none');
        g.selectAll('line')
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('shape-rendering', 'crispEdges')
            .attr('stroke-dasharray', '2,2')
            .attr('pointer-events', 'none');
        g.selectAll('text').remove();
    }

    public customizeAxisTime = (scale: d3.ScaleTime<number, number>, timeAxis: any) => {
        // To display first and last value
        let timeDomain = scale.domain();
        let beginTimeDomain: Date = timeDomain[0];
        let endTimeDomain: Date = timeDomain[1];
        let beginMoment: Moment.Moment = Moment(beginTimeDomain);
        let endMoment: Moment.Moment = Moment(endTimeDomain);

        // "nice" domain
        let niceTimeScale = scale.copy().nice();

        let niceBeginDomain: Date = niceTimeScale.domain()[0];
        let niceEndDomain: Date = niceTimeScale.domain()[1];
        let niceBeginMoment: Moment.Moment = Moment(niceBeginDomain);

        // Ticks values
        let offset = Math.ceil(((niceEndDomain as any) - (niceBeginDomain as any)) / (this.nbTimeTicks - 1));
        let timeTicks: Date[] = [];

        timeTicks.push(beginMoment.toDate());
        for (let currentMoment = Moment(niceBeginMoment.add(offset, 'milliseconds'));
            currentMoment < endMoment;
            currentMoment = currentMoment.add(offset, 'milliseconds')) {

            if (!(currentMoment.diff(beginMoment) < offset / 5) && !(endMoment.diff(currentMoment, 'milliseconds') < offset / 5)) {
                timeTicks.push(currentMoment.toDate());
            }
        }
        timeTicks.push(endMoment.toDate());

        // Ticks format
        let tickFormat = this.getTimeTickFormat(beginMoment, endMoment);
        timeAxis.tickValues(timeTicks)
            .tickFormat(d3.timeFormat(tickFormat));
    }

    // protected initLegendItems() {
    //     this.legendItemsBySeriesDefs = this.sheet.sheetDef.seriesDefs.map(() => []);
    //     this.sheet.data.forEach( (gd) => {
    //         const seriesDefIndex = this.sheet.sheetDef.seriesDefs.indexOf(gd.serieDef);
    //         if (gd.partitions[this.iPartition]) {
    //             gd.partitions[this.iPartition].series.forEach( (serie) => {
    //                 if (!this.legendItemsBySeriesDefs[seriesDefIndex].find( (v) => v.serieName === serie.serie_name)) {
    //                     this.legendItemsBySeriesDefs[seriesDefIndex].push( {
    //                         serieName: serie.serie_name,
    //                         isShown: true,
    //                         seriesDefIndex: seriesDefIndex,
    //                         toString: () => String(seriesDefIndex) + ' ' + serie.serie_name
    //                     });
    //                 }
    //             });
    //         }
    //     });
    //     this.flatLegendItems = this.legendItemsBySeriesDefs.reduce( (flat, legendItems) => flat.concat(...legendItems), []);
    // }

    protected getCrosshairTimeFormat = (scale: d3.ScaleTime<number, number>) => {

        let crossHairTimeFormat: string;

        // To display first and last value
        let timeDomain = scale.domain();
        let beginTimeDomain: Date = timeDomain[0];
        let endTimeDomain: Date = timeDomain[1];
        let beginMoment: Moment.Moment = Moment(beginTimeDomain);
        let endMoment: Moment.Moment = Moment(endTimeDomain);
        
        // Tick width smaller than 1 second
        if (endMoment.diff(beginMoment, 'seconds') < this.nbTimeTicks) {
            crossHairTimeFormat = '%H:%M:%S.%L';
            // Tick width smaller than 1 minute
        }
        else if (endMoment.diff(beginMoment, 'minutes') < this.nbTimeTicks) {
            crossHairTimeFormat = '%H:%M:%S.%L';
            // Tick width smaller than 1 hour
        }
        else if (endMoment.diff(beginMoment, 'hour') < this.nbTimeTicks) {
            crossHairTimeFormat = '%H:%M:%S';
            // Tick width smaller than 1 day
        }
        else if (endMoment.diff(beginMoment, 'day') < this.nbTimeTicks) {
            crossHairTimeFormat = '%H:%M:%S';
        }
        else {
            crossHairTimeFormat = '%H:%M';
        }
        return crossHairTimeFormat;
    }

    private getTimeTickFormat = (beginMoment: Moment.Moment, endMoment: Moment.Moment) => {

        let tickFormat: string;

        // Tick width smaller than 1 second
        if (endMoment.diff(beginMoment, 'seconds') < this.nbTimeTicks) {
            tickFormat = '%H:%M:%S.%L';
            // Tick width smaller than 1 minute
        }
        else if (endMoment.diff(beginMoment, 'minutes') < this.nbTimeTicks) {
            tickFormat = '%H:%M:%S';
            // Tick width smaller than 1 hour
        }
        else if (endMoment.diff(beginMoment, 'hour') < this.nbTimeTicks) {
            tickFormat = '%H:%M';
            // Tick width smaller than 1 day
        }
        else if (endMoment.diff(beginMoment, 'day') < this.nbTimeTicks) {
            tickFormat = '%Y/%m/%d %H:%M';
        }
        else {
            tickFormat = '%Y/%m/%d';
        }
        return tickFormat;
    }
}
