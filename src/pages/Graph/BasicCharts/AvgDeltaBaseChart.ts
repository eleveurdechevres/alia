import * as d3 from 'd3';
import { BaseChart, IMargin, svgBorderWidth } from './BaseChart';
import { ISerieData } from 'src/interfaces/ISerieData';
import { ISheet } from 'src/interfaces/ISheet';
// import { toJS } from 'mobx';

const yAxisWidth = 50;
const xAxisHeight = 20;

const defautMarginChart: IMargin = {
    top: svgBorderWidth + xAxisHeight,
    bottom: svgBorderWidth + xAxisHeight,
    left: svgBorderWidth + yAxisWidth,
    right: svgBorderWidth
};

export interface IAvgDelta {
    latitude: number,
    longitude: number,
    dateBegin: Date,
    dateEnd: Date,
    isDay: boolean,
    delta: number
}

// This class is used both on server and client side
export class AvgDeltaBaseChart extends BaseChart {

    // data
    datum: IAvgDelta[] = [];

    // Params
    private marginChart: IMargin;

    // Measures
    // private legendRectSize = 14;
    // private legendSpacing = 4;
    // private legendItemHeight: number = this.legendRectSize + this.legendSpacing;
    private legendLeftMargin = 10;

    private chartWidth = 0;
    private chartHeight = 0;
    private legendNbColumn = 0;
    public legendWidth = 0;
    private legendColumnWidth = 0;

    public timeScaleChartDomainDefault: [Date, Date];
    public yChartDomainDefault: [number, number];

    public timeScaleChart: d3.ScaleTime<number, number> = d3.scaleTime();
    public yChart: d3.ScaleLinear<number, number> = d3.scaleLinear();
    private yMin: number;
    private yMax: number;
    private timeAxisChart: d3.Axis<number | Date | { valueOf(): number; }>;
    private shotAxisChart: d3.Axis<number | Date | { valueOf(): number; }>;
    private yAxisChart: d3.Axis<number | { valueOf(): number; }>;
    private yGridChart: d3.Axis<number | { valueOf(): number; }>;

    // svg components
    protected svgElementBase: any;
    public legends: any;
    public legendCheckBoxes: any;
    public legendTexts: any;
    private gChart: any;
    // private gAxisChartTimePeriod: any;
    private gAxisChartTime: any;
    private gAxisChartX: any;
    private gAxisChartY: any;
    private gAxisGridY: any;

    // Utils
    // public displayedPathes: Array<IDisplayedPath>;
    public displayedPathes: Map<string, ISerieData>;
    public shotsMap = new Map<Date, number>();

    public crossHairTimeFormat: string;

    private updatetimeDomain() {
        const time_start = this.datum.reduce((end: number, data: IAvgDelta) => data.dateEnd.getDate() > end ? data.dateEnd : end, Number.NEGATIVE_INFINITY);
        const time_end = this.datum.reduce((start: number, data: IAvgDelta) => data.dateBegin.getDate() < start ? data.dateBegin : start, Number.POSITIVE_INFINITY);
        if (time_start !== Infinity && time_end !== Infinity) {
            this.timeScaleChartDomainDefault = [new Date(time_start), new Date(time_end)];
            this.timeScaleChart.domain(this.timeScaleChartDomainDefault).range([0, this.chartWidth]);
    
            this.timeAxisChart = d3.axisTop(this.timeScaleChart);
            this.shotAxisChart = d3.axisBottom(this.timeScaleChart);
        }
    }

    private updateYDomain() {
        const values = this.datum.map((data: IAvgDelta) => data.delta);

        this.yMin = 0;
        this.yMax = d3.max(values);
        this.yChartDomainDefault = [this.yMax, this.yMin];
        this.yChart.domain(this.yChartDomainDefault).range([0, this.chartHeight]);

        this.yAxisChart = d3.axisLeft(this.yChart).tickSizeInner(6).tickSizeOuter(0);
        this.yGridChart = d3.axisLeft(this.yChart).tickSizeInner(-this.chartWidth).tickSizeOuter(0);
    }

     constructor(
        protected sheet: ISheet,
        width: number,
        height: number,
        margin: IMargin = defautMarginChart
    ) {
        super(sheet, width, height);
        this.displayedPathes = new Map();

        this.totalWidth = width;
        this.totalHeight = height;
        this.marginChart = margin;
        this.chartHeight = this.totalHeight - this.marginChart.top - this.marginChart.bottom;
        this.legendColumnWidth = 180;
        
        this.legendWidth = this.legendNbColumn * this.legendColumnWidth + this.legendLeftMargin;
        this.chartWidth = this.totalWidth - this.marginChart.left - this.marginChart.right - this.legendLeftMargin - this.legendWidth;
    }

    public getYRangeEnd = () => {
        return this.yChart(this.yMax);
    }

    public getYRangeStart = () => {
        return this.yChart(this.yMin);
    }

    public updateChart = () => {
        // this.updateLegendTexts();
        this.updateXAxis();
        this.updateYAxis();
    }

    public setData = (datum: IAvgDelta[]) => {
        this.datum = datum;
        this.updatetimeDomain();
        this.updateYDomain();
        this.updateRectangles();
        this.updateChart();
    }

    public getDeltaRectangles = () => {
        return this.gChart.selectAll('.delta_rect');
    }
    public updateRectanglesZoom = () => {
        this.gChart.selectAll('.delta_rect')
        .transition()
        .attr('x', (d: IAvgDelta) => this.timeScaleChart(d.dateBegin))
        .attr('width', (data: IAvgDelta) => {
            return this.timeScaleChart(data.dateEnd) - this.timeScaleChart(data.dateBegin)
        })
        .attr('y', (d: IAvgDelta) => this.yChart(d.delta))
        .attr('height', (d: IAvgDelta) => this.chartHeight - this.yChart(d.delta))
    }

    public updateRectangles = () => {
        const rectangles = this.gChart.selectAll('delta_rect')
            .data(this.datum);
        rectangles.exit().remove();
        rectangles.enter()
            .append('rect')
            .attr('class', 'delta_rect')
            .attr('fill', (d: IAvgDelta) => d.isDay ? 'LightGoldenRodYellow' : 'steelblue')
            .attr('stroke', 'gray')
            .attr('clip-path', 'url(#clip)')
            .attr('cursor', 'crosshair')
            .attr('shape-rendering', 'geometricPrecision')
            .attr('x', (d: IAvgDelta) => this.timeScaleChart(d.dateBegin))
            .attr('width', (data: IAvgDelta) => {
                return this.timeScaleChart(data.dateEnd) - this.timeScaleChart(data.dateBegin)
            })
            .attr('y', this.chartHeight)
            .attr('height', 0)
            .transition()
            .attr('y', (d: IAvgDelta) => this.yChart(d.delta))
            .attr('height', (d: IAvgDelta) => this.chartHeight - this.yChart(d.delta))
    }

    public updateXAxis = () => {

        // this.drawLabelDayAboveTimeAxis();

        this.customizeAxisTime(this.timeScaleChart, this.timeAxisChart);

        this.crossHairTimeFormat = this.getCrosshairTimeFormat(this.timeScaleChart);

        this.gAxisChartTime.transition().call(this.customAxis, this.timeAxisChart);
        this.gAxisChartX.transition().call(this.customAxis, this.shotAxisChart);
    }

    public updateYAxis = () => {
        this.gAxisChartY.transition().call(this.customAxis, this.yAxisChart);
        this.gAxisGridY.transition().call(this.customGrid, this.yGridChart);
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
        // this.gAxisChartTimePeriod = this.gAxisChartTime.append('g').attr('transform', 'translate(0,0)');
        this.gAxisChartX = this.gChart.append('g').attr('transform', 'translate(0,' + this.chartHeight + ')');
        this.gAxisChartY = this.gChart.append('g').attr('transform', 'translate(0,0)');

        this.gAxisGridY = this.gChart.append('g').attr('transform', 'translate(0,0)');
    }

    // private drawLabelDayAboveTimeAxis = () => {

    //     let timeDomain = this.timeScaleChart.domain();
    //     let beginTimeDomain: Date = timeDomain[0];
    //     let endTimeDomain: Date = timeDomain[1];
    //     let beginMoment: Moment.Moment = Moment(beginTimeDomain);
    //     let endMoment: Moment.Moment = Moment(endTimeDomain);

    //     let labelDayText: string | undefined = undefined;
    //     // Same day => draw label with the day above time axis
    //     if (endMoment.isSame(beginMoment, 'day')) {
    //         labelDayText = beginMoment.format('YYYY-MM-DD').toString();
    //     }

    //     this.gAxisChartTimePeriod.selectAll().remove();

    //     if (labelDayText) {
    //         let labelDayRect = { width: 100, height: 14 };

    //         this.gAxisChartTimePeriod.append('rect')
    //             .attr('x', 0)
    //             .attr('y', -xAxisHeight - labelDayRect.height)
    //             .attr('width', labelDayRect.width)
    //             .attr('height', labelDayRect.height)
    //             .attr('rx', 3)
    //             .attr('ry', 3)
    //             .attr('stroke', 'magenta')
    //             .attr('fill', 'yellow');

    //         this.gAxisChartTimePeriod.append('text')
    //             .attr('x', labelDayRect.width / 2)
    //             .attr('y', -xAxisHeight)
    //             // .attr('transform', 'translate(100, 100)')
    //             .attr('font-size', 12)
    //             .attr('text-anchor', 'middle')
    //             .attr('alignment-baseline', 'after-edge')
    //             .attr('fill', 'cyan')
    //             .text(labelDayText);
    //     }
    // }
}
