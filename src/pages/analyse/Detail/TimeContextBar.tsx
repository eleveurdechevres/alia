import * as React from 'react';
import * as d3 from 'd3';
import * as Moment from 'moment';

interface IProps {
    width: number;
    height: number;
    minDate: Date;
    maxDate: Date;
    handleChangeTimeInterval: (date1: Date, date2: Date) => void;
}

const nbTimeTicks = 9;

export class TimeContextBar extends React.Component<IProps, {}> {

    // private refGHorizontalContext: SVGGElement;
    private refGTimeContextAxisX: SVGGElement;
    private refGShotContextAxisX: SVGGElement;
    private refGTimeBrush: SVGGElement;

    private xHorizontalContextTime: d3.ScaleTime<number, number>;
    private xAxisContextTime: d3.Axis<number | Date | { valueOf(): number; }>;
    private xAxisContextShot: d3.Axis<number | Date | { valueOf(): number; }>;
    private timeBrush: d3.BrushBehavior<{}>;

    private toolBarHeight: number;

    public constructor(props: IProps) {
        super(props);

        this.updateSizes();
        let xTimeDomain = [this.props.minDate, this.props.maxDate];
        this.xHorizontalContextTime = d3.scaleTime().domain(xTimeDomain).range([0, this.props.width]);
        this.xAxisContextTime = d3.axisBottom(this.xHorizontalContextTime);
        this.xAxisContextShot = d3.axisTop(this.xHorizontalContextTime);
        this.customizeAxisTime(this.xHorizontalContextTime, this.xAxisContextTime);

        this.timeBrush = d3.brushX()
            .extent([[0, 0], [this.props.width, this.toolBarHeight]])
            .on('end', this.timeBrushed);

    }

    private updateSizes = () => {
        this.toolBarHeight = this.props.height - 30;
    }

    public componentDidMount() {
        this.updateComponents();
    }

    public componentDidUpdate() {
        this.updateComponents();
    }

    private updateComponents = () => {
        this.updateTimeBrush();
        this.updateXContextTimeAxis();
        this.updateXContextShotAxis();
    }

    public render() {
        return (
            <svg width={this.props.width} height={this.props.height} id="svgChart">
                <g
                    className="horizontalContext"
                    // ref={(ref) => { if (ref) { this.refGHorizontalContext = ref; } }}
                    // transform={'translate(' + this.marginHorizontalContext.left + ',' + this.marginHorizontalContext.top + ')'}
                >
                    <rect
                        x={0}
                        y={0}
                        width={this.props.width}
                        height={this.toolBarHeight}
                        stroke="black"
                        fill="none"
                    />
                    <g ref={(ref) => { if (ref) { this.refGTimeBrush = ref; } }}/>
                    {/* <g ref={(ref) => { if (ref) { this.refGTimeContextAxisX = ref; } }} /> */}
                    <g ref={(ref) => { if (ref) { this.refGTimeContextAxisX = ref; } }} transform={'translate(0,' + this.toolBarHeight + ')'}/>
                </g>
            </svg>
        );
    }

    private timeBrushed = () => {
        let s = d3.event.selection;
        let startTime: number;
        let stopTime: number;
        if (s) {
            startTime = this.xHorizontalContextTime.invert(s[0]).getTime();
            stopTime = this.xHorizontalContextTime.invert(s[1]).getTime();
        }
        else {
            startTime = this.xHorizontalContextTime.domain()[0].getTime();
            stopTime = this.xHorizontalContextTime.domain()[1].getTime();
        }
        this.props.handleChangeTimeInterval(new Date(startTime), new Date(stopTime));
        // this.baseChart.seriesGroups.forEach((serieGroup: ISerieGroup) => {
        //     serieGroup.svgGroup.selectAll('.scatterPlotPoint')
        //     .attr('visibility', (enhancedPoint: IEnhancedPoint) => this.isPlotVisible(enhancedPoint) ? 'visible' : 'hidden');
        //     // .style('opacity', (enhancedPoint: IEnhancedPoint) => this.isPlotVisible(enhancedPoint) ? 1 : 0)
        // });
    }

    private updateXContextTimeAxis = (): void => {
        d3.select(this.refGTimeContextAxisX).call(this.customAxis, this.xAxisContextTime);
    }

    private updateXContextShotAxis = (): void => {
        d3.select(this.refGShotContextAxisX).call(this.customAxis, this.xAxisContextShot);
    }

    private updateTimeBrush = (): void => {
        d3.select(this.refGTimeBrush).call(this.customBrush, this.timeBrush);
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
        let offset = Math.ceil(((niceEndDomain as any) - (niceBeginDomain as any)) / (nbTimeTicks - 1));
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

    public customAxis(g: any, axis: any) {
        g.call(axis);
        g.select('.domain')
            .attr('stroke', 'lightgrey')
            .attr('pointer-events', 'none');
        g.selectAll('line')
            .attr('stroke', 'lightgrey')
            .attr('stroke-width', 1)
            .attr('shape-rendering', 'crispEdges')
            .attr('pointer-events', 'none');
        g.selectAll('.tick text')
            .attr('fill', 'black')
            .attr('paint-order', 'stroke')
            .attr('stroke-width', 2)
            .attr('stroke', 'lavender')
            .attr('pointer-events', 'none')
            .attr('cursor', 'crosshair');
    }

    public customBrush(g: any, brush: any) {
        g.call(brush);
        g.select('.selection')
            .attr('stroke', '#3399FF')
            .attr('fill', '#3399FF')
            .attr('stroke-dasharray', '1,1');
    }

    private getTimeTickFormat = (beginMoment: Moment.Moment, endMoment: Moment.Moment) => {

        let tickFormat: string;

        // Tick width smaller than 1 second
        if (endMoment.diff(beginMoment, 'seconds') < nbTimeTicks) {
            tickFormat = '%H:%M:%S.%L';
            // Tick width smaller than 1 minute
        }
        else if (endMoment.diff(beginMoment, 'minutes') < nbTimeTicks) {
            tickFormat = '%H:%M:%S';
            // Tick width smaller than 1 hour
        }
        else if (endMoment.diff(beginMoment, 'hour') < nbTimeTicks) {
            tickFormat = '%H:%M';
            // Tick width smaller than 1 day
        }
        else if (endMoment.diff(beginMoment, 'day') < nbTimeTicks) {
            tickFormat = '%Y/%m/%d %H:%M';
        }
        else {
            tickFormat = '%Y/%m/%d';
        }
        return tickFormat;
    }
}
