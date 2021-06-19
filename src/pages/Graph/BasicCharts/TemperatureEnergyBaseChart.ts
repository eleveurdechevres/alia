import * as d3 from 'd3';
import { BaseChart, IMargin, svgBorderWidth } from './BaseChart';
import { ISerieData } from 'src/interfaces/ISerieData';
import { ISheet } from 'src/interfaces/ISheet';
import { IAvgMesure } from 'src/managers/GraphDataManager';
import { TPeriod } from 'src/stores/GlobalStore';
// import { toJS } from 'mobx';

const yAxisWidth = 50;
const xAxisHeight = 20;

const defautMarginChart: IMargin = {
    top: svgBorderWidth + xAxisHeight,
    bottom: svgBorderWidth + xAxisHeight,
    left: svgBorderWidth + yAxisWidth,
    right: svgBorderWidth
};

export interface ITemperatureEnergyData {
    dateBegin: Date,
    dateEnd: Date,
    indicateurTemperatureEnergie: number,
    uniteIndicateurTemperatureEnergie: string,
    indicateurEnergie: number,
    uniteIndicateurEnergie: string,
    intTemp?: IAvgMesure,
    extTemp?: IAvgMesure,
    conso?: IAvgMesure,
    period: TPeriod
}

// This class is used both on server and client side
export class TemperatureEnergyBaseChart extends BaseChart {

    // data
    datum: ITemperatureEnergyData[] = [];

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
    public gChart: any;
    // private gAxisChartTimePeriod: any;
    private gAxisChartTime: any;
    private gAxisChartX: any;
    private gAxisChartY: any;
    private gAxisGridY: any;
    private gLegendY: any;
    // private textLegendY: any;
    
    // Utils
    // public displayedPathes: Array<IDisplayedPath>;
    public displayedPathes: Map<string, ISerieData>;
    public shotsMap = new Map<Date, number>();

    public crossHairTimeFormat: string;

    private updatetimeDomain() {
        const time_start = this.datum.reduce((end: number, data: ITemperatureEnergyData) => data.dateEnd.getDate() > end ? data.dateEnd : end, Number.NEGATIVE_INFINITY);
        const time_end = this.datum.reduce((start: number, data: ITemperatureEnergyData) => data.dateBegin.getDate() < start ? data.dateBegin : start, Number.POSITIVE_INFINITY);
        if (time_start !== Infinity && time_end !== Infinity) {
            this.timeScaleChartDomainDefault = [new Date(time_start), new Date(time_end)];
            this.timeScaleChart.domain(this.timeScaleChartDomainDefault).range([0, this.chartWidth]);
    
            this.timeAxisChart = d3.axisTop(this.timeScaleChart);
            this.shotAxisChart = d3.axisBottom(this.timeScaleChart);
        }
    }

    private updateYDomain() {

        this.yMin = 0;
        // this.yMax = 10;
        this.yMax = d3.max(this.datum, (d: ITemperatureEnergyData, i: number) => d.indicateurTemperatureEnergie);
        this.yMax = this.yMax + (this.yMax - this.yMin) / 10;
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

    public setData = (datum: ITemperatureEnergyData[]) => {
        this.datum = datum;
        this.updatetimeDomain();
        this.updateYDomain();
        this.updateRectangles();
        this.updateChart();
    }

    public getRectangles = () => {
        return this.gChart.selectAll('.energy_rect');
    }
    public updateRectanglesZoom = () => {
        this.gChart.selectAll('.energy_rect')
        .transition()
        .attr('x', (d: ITemperatureEnergyData) => this.timeScaleChart(d.dateBegin))
        .attr('width', (data: ITemperatureEnergyData) => {
            return this.timeScaleChart(data.dateEnd) - this.timeScaleChart(data.dateBegin)
        })
        .attr('y', (d: ITemperatureEnergyData) => this.yChart(d.indicateurTemperatureEnergie))
        .attr('height', (d: ITemperatureEnergyData) => this.chartHeight - this.yChart(d.indicateurTemperatureEnergie))
    }

    public removeRectangles = () => {
        this.gChart.selectAll('.energy_rect').remove();
    }

    public updateRectangles = () => {
        this.removeRectangles();
        const rectangles = this.gChart.selectAll('.energy_rect')
            .data(this.datum);
        rectangles.exit().remove();
        rectangles.enter()
            .append('rect')
            .attr('class', 'energy_rect')
            .attr('fill', (d: ITemperatureEnergyData) => (d.period === 'DAY' && d.dateBegin.getDay() === 0) ? 'Steelblue' : 'LightGoldenRodYellow')
            .attr('stroke', 'gray')
            .attr('clip-path', 'url(#clip)')
            .attr('cursor', 'crosshair')
            .attr('shape-rendering', 'geometricPrecision')
            .attr('x', (d: ITemperatureEnergyData) => this.timeScaleChart(d.dateBegin))
            .attr('width', (data: ITemperatureEnergyData) => {
                return this.timeScaleChart(data.dateEnd) - this.timeScaleChart(data.dateBegin)
            })
            .attr('y', this.chartHeight)
            .attr('height', 0)
            .transition()
            .attr('y', (d: ITemperatureEnergyData) => this.yChart(d.indicateurTemperatureEnergie))
            .attr('height', (d: ITemperatureEnergyData) => this.chartHeight - this.yChart(d.indicateurTemperatureEnergie))
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
        this.gLegendY = this.gChart.append('g')
            .attr('transform',  `translate(-30, ${this.chartHeight / 2}) rotate(-90, 0, 0)`)
        /*this.textLegendY = */this.gLegendY.append('text')
            .attr('font-size', 12)
            .attr('text-anchor', 'middle')
            // .attr('alignment-baseline', 'after-edge')
            // .attr('fill', 'cyan')
            .text('kWh/Δ°C/m²');
    }
}
