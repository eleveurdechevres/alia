import * as d3 from 'd3';
import * as Moment from 'moment';
import { BaseChart, ILegendItem, IMargin, svgBorderWidth } from './BaseChart';
import { ISerieData } from 'src/interfaces/ISerieData';
import { ScaleOrdinal } from 'd3';
import { ISheet } from 'src/interfaces/ISheet';

const yAxisWidth = 50;
const xAxisHeight = 20;

const defautMarginChart: IMargin = {
    top: svgBorderWidth + xAxisHeight,
    bottom: svgBorderWidth + xAxisHeight,
    left: svgBorderWidth + yAxisWidth,
    right: svgBorderWidth
};

export interface IDisplayedPath {
    legendItem: ILegendItem;
    serieData: ISerieData;
    path: any;
}

// This class is used both on server and client side
export class LineBaseChart extends BaseChart {

    // Params
    private marginChart: IMargin;

    // Measures
    private legendRectSize = 14;
    private legendSpacing = 4;
    private legendItemHeight: number = this.legendRectSize + this.legendSpacing;
    private legendLeftMargin = 10;

    private chartWidth: number;
    private chartHeight: number;
    private legendNbItemPerCol: number;
    private legendNbColumn: number;
    public legendWidth: number;
    private legendColumnWidth: number;

    private yMin: number;
    private yMax: number;

    public timeScaleChartDomainDefault: [Date, Date];
    public yChartDomainDefault: [number, number];

    public timeScaleChart: d3.ScaleTime<number, number> = d3.scaleTime();
    public yChart: d3.ScaleLinear<number, number> = d3.scaleLinear();

    private timeAxisChart: d3.Axis<number | Date | { valueOf(): number; }>;
    private shotAxisChart: d3.Axis<number | Date | { valueOf(): number; }>;
    private yAxisChart: d3.Axis<number | { valueOf(): number; }>;
    private yGridChart: d3.Axis<number | { valueOf(): number; }>;

    private zColors: ScaleOrdinal<string, {}>;

    // svg components
    protected svgElementBase: any;
    public legends: any;
    public legendCheckBoxes: any;
    public legendTexts: any;
    private gChart: any;
    private gAxisChartTimePeriod: any;
    private gAxisChartTime: any;
    private gAxisChartX: any;
    private gAxisChartY: any;
    private gAxisGridY: any;

    // Utils
    public displayedPathes: Array<IDisplayedPath>;
    public shotsMap = new Map<Date, number>();

    public crossHairTimeFormat: string;

    constructor(
        protected sheet: ISheet,
        protected seriesData: ISerieData[],
        width: number,
        height: number,
        margin: IMargin = defautMarginChart
    ) {
        super(sheet, width, height);
        this.displayedPathes = new Array();

        this.totalWidth = width;
        this.totalHeight = height;
        this.marginChart = margin;
        this.chartHeight = this.totalHeight - this.marginChart.top - this.marginChart.bottom;
        this.legendNbItemPerCol = Math.floor(this.chartHeight / this.legendItemHeight);
        const nbSeries = this.seriesData.length;
        this.legendNbColumn = Math.ceil(nbSeries / this.legendNbItemPerCol);
        this.legendColumnWidth = 180;
        this.legendWidth = this.legendNbColumn * this.legendColumnWidth + this.legendLeftMargin;
        this.chartWidth = this.totalWidth - this.marginChart.left - this.marginChart.right - this.legendLeftMargin - this.legendWidth;

        const time_start = this.seriesData.reduce((start, serieData) => serieData.timeStart.getDate() < start ? serieData.timeStart : start, Number.POSITIVE_INFINITY);
        const time_end = this.seriesData.reduce((end, serieData) => serieData.timeEnd.getDate() > end ? serieData.timeEnd : end, Number.NEGATIVE_INFINITY);
        this.timeScaleChartDomainDefault = [new Date(time_start), new Date(time_end)];
        this.timeScaleChart.domain(this.timeScaleChartDomainDefault).range([0, this.chartWidth]);
        this.yMin = this.seriesData.reduce(
            (ymin, sd) => sd.yMin < ymin ? sd.yMin : ymin, Number.POSITIVE_INFINITY
        ) as number;
        this.yMax = this.seriesData.reduce(
            (ymax, sd) => sd.yMax > ymax ? sd.yMax : ymax, Number.NEGATIVE_INFINITY
        ) as number;
        this.yChartDomainDefault = [this.yMax, this.yMin];
        this.yChart.domain(this.yChartDomainDefault).range([0, this.chartHeight]);

        this.timeAxisChart = d3.axisTop(this.timeScaleChart);
        this.shotAxisChart = d3.axisBottom(this.timeScaleChart);

        this.yAxisChart = d3.axisLeft(this.yChart).tickSizeInner(6).tickSizeOuter(0);
        this.yGridChart = d3.axisLeft(this.yChart).tickSizeInner(-this.chartWidth).tickSizeOuter(0);

        this.zColors = d3.scaleOrdinal(d3.schemeCategory10);
    }

    public getYRangeEnd = () => {
        return this.yChart(this.yMax);
    }

    public getYRangeStart = () => {
        return this.yChart(this.yMin);
    }

    public updateChart = () => {
        this.updateLegendTexts();
        this.updateXAxis();
        this.updateYAxis();
    }

    public updatePathes = () => {
        this.displayedPathes.forEach((data: IDisplayedPath) => {
            data.path.attr('d', this.createLineChart(data.serieData));
        });
    }

    public updateXAxis = () => {

        this.drawLabelDayAboveTimeAxis();

        this.customizeAxisTime(this.timeScaleChart, this.timeAxisChart);

        this.crossHairTimeFormat = this.getCrosshairTimeFormat(this.timeScaleChart);

        this.gAxisChartTime.call(this.customAxis, this.timeAxisChart);
        this.gAxisChartX.call(this.customAxis, this.shotAxisChart);
    }

    public updateYAxis = () => {
        this.gAxisChartY.call(this.customAxis, this.yAxisChart);
        this.gAxisGridY.call(this.customGrid, this.yGridChart);
    }

    public createChart = (svgRef: Element) => {
        this.svgElementBase = d3.select(svgRef);
        this.svgElementBase.selectAll('*').remove();

        this.svgElementBase.append('rect')
            .attr('width', this.totalWidth)
            .attr('height', this.totalHeight)
            .attr('stroke', 'gray')
            .attr('stroke-width', 1)
            .attr('fill', 'none');

        this.gChart = this.svgElementBase.append('g')
            .attr('transform', 'translate(' + this.marginChart.left + ',' + this.marginChart.top + ')');

        this.gAxisChartTime = this.gChart.append('g').attr('transform', 'translate(0,0)');
        this.gAxisChartTimePeriod = this.gAxisChartTime.append('g').attr('transform', 'translate(0,0)');
        this.gAxisChartX = this.gChart.append('g').attr('transform', 'translate(0,' + this.chartHeight + ')');
        this.gAxisChartY = this.gChart.append('g').attr('transform', 'translate(0,0)');

        this.gAxisGridY = this.gChart.append('g').attr('transform', 'translate(0,0)');

        // this.initLegendItems();
        // this.zColors.domain(toto);

        this.seriesData.forEach( (serieData) => {
                // const legendItem = this.legendItemsBySeriesDefs[seriesDefIndex].find( v => serieData.serie_name === v.serieName );
                // if (!legendItem) {
                //     console.log('legendItem not found for serie ' + serieData.serie_name);
                //     return;
                // }
                let legendText: string = serieData.serieDef.capteur.capteur_reference_id +
                    '[' + serieData.serieDef.capteur.id + ']' +
                    '_plan[' + serieData.serieDef.plan.id + ']' +
                    '(' + serieData.serieDef.typeMesure.type + ')';
                let strokeColor = this.zColors(legendText);
                // let path = 
                this.gChart.append('path').datum(serieData.points)
                    .attr('class', 'curve')
                    .attr('fill', 'none')
                    .attr('stroke', strokeColor)
                    .attr('stroke-linejoin', 'round')
                    .attr('stroke-linecap', 'round')
                    .attr('stroke-width', 1.1)
                    .attr('clip-path', 'url(#clip)')
                    .attr('cursor', 'crosshair')
                    .attr('shape-rendering', 'geometricPrecision')
                    .attr('d', this.createLineChart(serieData))
                    .style('opacity', 1);
                // this.displayedPathes.push({ legendItem: legendItem, serieData: serieData, path: path });
        });

        // draw legends
        this.legends = this.gChart.selectAll('.legend')
            .data(this.flatLegendItems)
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', (d: any, i: number) => {
                let column = ~~(i / this.legendNbItemPerCol);
                let rankInCol = i % this.legendNbItemPerCol;
                let voffset = column * this.legendColumnWidth;
                let horz = this.chartWidth + this.legendLeftMargin + voffset;
                let vert = rankInCol * this.legendItemHeight;
                return `translate(${horz}, ${vert})`;
            })
            .style('cursor', 'pointer');

        this.legendCheckBoxes = this.legends.append('rect')
            .attr('width', this.legendRectSize)
            .attr('height', this.legendRectSize)
            .attr('fill', this.legendCheckBoxFill)
            .attr('stroke', this.zColors);

        this.legendTexts = this.legends.append('text')
            .attr('x', this.legendRectSize + this.legendSpacing)
            .attr('y', this.legendRectSize - this.legendSpacing)
            .attr('font-size', 10)
            .attr('fill', 'black')
            .text((d: ILegendItem) => d.serieName);

        // draw Axis
        this.updateXAxis();
        this.updateYAxis();
    }

    public buildLegend = (serieName: string, value?: number): string => {
        return serieName + ( value ? ' : ' + value : '');
    }

    public legendCheckBoxFill = (legendItem: ILegendItem) => {
        if ( legendItem.isShown ) {
            return this.zColors(legendItem.serieName);
        }
        return 'none';
    }

    private createLineChart(serie: ISerieData) {
        return d3.line<number>()
            .defined((d) => { return d !== null; })
            // .x((d, i, a) => this.xChart(this.xData.shots[i]))
            .x((d, i, a) => this.timeScaleChart(serie.points[i].date))
            .y((d, i, a) => this.yChart(serie.points[i].valeur));
    }

    private updateLegendTexts = () => {
        this.legendTexts.attr('fill', 'green');
    }

    private drawLabelDayAboveTimeAxis = () => {

        let timeDomain = this.timeScaleChart.domain();
        let beginTimeDomain: Date = timeDomain[0];
        let endTimeDomain: Date = timeDomain[1];
        let beginMoment: Moment.Moment = Moment(beginTimeDomain);
        let endMoment: Moment.Moment = Moment(endTimeDomain);

        let labelDayText: string | undefined = undefined;
        // Same day => draw label with the day above time axis
        if (endMoment.isSame(beginMoment, 'day')) {
            labelDayText = beginMoment.format('YYYY-MM-DD').toString();
        }

        this.gAxisChartTimePeriod.selectAll().remove();

        if (labelDayText) {
            let labelDayRect = { width: 100, height: 14 };

            this.gAxisChartTimePeriod.append('rect')
                .attr('x', 0)
                .attr('y', -xAxisHeight - labelDayRect.height)
                .attr('width', labelDayRect.width)
                .attr('height', labelDayRect.height)
                .attr('rx', 3)
                .attr('ry', 3)
                .attr('stroke', 'magenta')
                .attr('fill', 'yellow');

            this.gAxisChartTimePeriod.append('text')
                .attr('x', labelDayRect.width / 2)
                .attr('y', -xAxisHeight)
                // .attr('transform', 'translate(100, 100)')
                .attr('font-size', 12)
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'after-edge')
                .attr('fill', 'cyan')
                .text(labelDayText);
        }
    }
}