import * as React from 'react';
import * as d3 from 'd3';
import { GraphType } from './GraphType';
import { momentToSql, dataTimeString } from '../../../utils/DateUtils';
import * as Moment from 'moment';
import { observer } from 'mobx-react';

interface IProps {
    originGraphX: number;
    originGraphY: number;
    chartWidth: number;
    chartHeight: number;
    capteurId: number;
    channelData: IChannelData;
    chartIndex: number;
    interChart: number;
    dateInterval: IDateInterval;
    handleMouseEvents: (
        xMouse: number, 
        yMouse: number, 
        timeMsMouse: number, 
        dataTimeMs: number, 
        d3Event: any) => void;
    timeScale: any;
    displayValue: IDisplayValue;
    xPosition: number;
    yPosition: number;
    handleSelectedValue: (
        graphType: any,
        y: number | undefined ) => void;
};

interface IState {
    graphType: any;
};

export interface IDisplayValue {
    display: boolean;
    dataTimeMs: number;
    timeMs: number;
}

interface IChannelData {
    capteur_reference_id: string;       // "AEO_ZW100"
    id: number;                         // 4
    id_type_mesure: number;             // 4
    max_range: number;                  // 1000
    measure_type: string;               // "Luminosité"
    min_range: number;                  // 0
    precision_step: number;             // 1
    unit: string;                       // "Lux"
};

interface IDateInterval {
    startDate: Moment.Moment,
    stopDate: Moment.Moment,
    minDate: Moment.Moment,
    maxDate: Moment.Moment
};

@observer export class GraphChannel extends React.Component<IProps, IState> {

    chartRef: SVGGElement | null;
    chartContextRef: SVGGElement | null;
    overlayRef: SVGRectElement  | null;
    
    yValueDisplayedRef: SVGGElement | null;
    yValueRef: SVGGElement | null;

    ghorizontalCrosshairRef: SVGGElement | null;
    horizontalCrosshairValueRef: SVGGElement | null;

    gDateRef: SVGGElement | null;
    dateRef: SVGGElement | null;

    axisBottomRef: SVGGElement | null;

    startDate: string;
    stopDate: string;

    originGraphX: number;
    originGraphY: number;
    chartWidth: number;
    chartHeight: number;

    mapValues = new Map<number, number>();

    lineFunction = d3.line<{date: Date, valeur: number}>()
    .x((d) => { return this.props.timeScale(d.date); })
    .y((d) => { return this.state.graphType.scaleFunction(d.valeur); })
    .curve(d3.curveStepAfter);

    // <GraphChannel
    //     capteurId
    //     channelData
    //     chartIndex
    //     chartHeight
    //     dateInterval

// capteur_id:"1"
// channel_id:"2"
// comment:"temperature"
// date:"2018-01-24 00:00:09"
// id:"1093896"
// valeur:"18.5"

// capteur_reference_id:"AEO_ZW100"
    // id:"4"
    // id_type_mesure:"4"
    // max_range:"1000"
    // measure_type:"Luminosité"
    // min_range:"0"
    // precision_step:"1"
    // unit:"Lux"

    constructor(props: IProps) {
        super(props);
        this.state = {
            graphType: GraphType.getGraphTypeFromMeasuretype(this.props.channelData.measure_type)
        }
        this.originGraphX = this.props.originGraphX;
        this.originGraphY = this.props.originGraphY;
        this.chartWidth = this.props.chartWidth;
        this.chartHeight = this.props.chartHeight;
    }

    loadJsonFromAeroc = (capteurId: number, channelId: number, dateBegin: string, dateEnd: string) => {
        // LOAD DATA from AEROC
        // date_begin=2017/12/09 20:13:04&date_end=2018/01/24 21:19:06
        // console.log('http://test.ideesalter.com/alia_readMesure.php?capteur_id=' + capteurId 
        // + '&channel_id=' + channelId + '&date_begin=' + dateBegin + '&date_end=' + dateEnd)
        // return fetch('http://test.ideesalter.com/alia_readMesure.php?capteur_id=' + capteurId
        // + '&channel_id=' + channelId + '&date_begin=2017/12/09 20:13:04&date_end=2017/12/11 21:19:06')
        var request = 'http://test.ideesalter.com/alia_readMesure.php?capteur_id=' + capteurId
            + '&channel_id=' + channelId + '&date_begin=' + dateBegin + '&date_end=' + dateEnd;
        return fetch(request)
            .then((response) => response.json())
            .then((data) => {

                this.mapValues.clear();
                data.forEach((line: {date: string, valeur: number}) => {
                    var date = new Date(line.date);
                    date.setSeconds(0);
                    date.setMilliseconds(0);
                    date.setUTCMilliseconds(0);
                    date.setUTCSeconds(0);
                    this.mapValues.set(date.getTime(), line.valeur);
                })

                this.drawGraph(this.mapValues);
                this.drawTimeAxis();
            });
    }

    drawGraph = (data: Map<number, number>) => {

        var datum: {date: Date, valeur: number}[] = [];
        data.forEach(
            (valeur: number, timeMs: number) => { datum.push( {date: new Date(timeMs), valeur: valeur} ) }
        );
        // d3.curveLinear
        // d3.curveStep
        // d3.curveStepBefore
        // d3.curveStepAfter
        // d3.curveBasis
        // d3.curveCardinal
        // d3.curveMonotoneX
        // d3.curveCatmullRom
        d3.select(this.chartRef).selectAll('path').remove();
        
        d3.select(this.chartRef).append('path')
            .datum(datum)
            .attr('d', this.lineFunction)
            .attr('fill', 'none')
            .attr('stroke', this.state.graphType.color)
            .attr('stroke-width', 1);
    };

    handleMouseEvents = () => {

        var xMouse = 0;
        var yMouse = 0;
        var timeMsMouse = 0;

        if ( this.overlayRef ) {
            xMouse = d3.mouse(this.overlayRef)[0];
            yMouse = d3.mouse(this.overlayRef)[1];
            timeMsMouse = this.props.timeScale.invert(d3.mouse(this.overlayRef)[0]);
        }

        var keys = Array.from(this.mapValues.keys());
        var indexTimeMs = d3.bisectLeft(keys, timeMsMouse);
        var dataTimeMs = keys[indexTimeMs];

        switch (d3.event.type) {
            case 'mouseover':
            case 'mousemove':
                // var yValue = this.state.graphType.scaleFunction.invert(yMouse);
                var yValue = this.state.graphType.getYValue(yMouse);
                
                d3.select(this.horizontalCrosshairValueRef)
                    .text(yValue)
                d3.select(this.ghorizontalCrosshairRef)
                    .attr('transform', 'translate(' + this.originGraphX + ',' + yMouse + ')')
                    .attr('opacity', 1);
                break;
            case 'mouseout':
                d3.select(this.ghorizontalCrosshairRef)
                    .attr('opacity', 0);
                break;
            default:
                break;

        }
        this.props.handleMouseEvents(xMouse, yMouse, timeMsMouse, dataTimeMs, d3.event.type);
    }

    computeYScale = () => {
        var yDomain = this.state.graphType.domain;
        var yRange = [0, this.chartHeight];
        this.state.graphType.scaleFunction.domain(yDomain).range(yRange);
    }

    drawYAxis = () => {

        d3.select(this.chartRef)
            .call(d3.axisLeft(this.state.graphType.scaleFunction).tickValues(this.state.graphType.tickValues))
            .append('text')
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .attr('y', -9) 
            .text((d) => { return d === undefined ? ' ' : d.toString() });
    }

    drawTimeAxis() {
        d3.select(this.axisBottomRef)
            .call(d3.axisBottom(this.props.timeScale)
                    .tickFormat(d3.timeFormat('%H:%M'))
                    // .ticks(d3.timeMinute.every(60))
                )
            .selectAll('text')
    }
    
    componentDidMount() {

        d3.select(this.overlayRef)
            .attr('fill', 'transparent')
            .on('mouseover', this.handleMouseEvents)
            .on('mouseout', this.handleMouseEvents)
            .on('mousemove', this.handleMouseEvents)
            .on('click', this.handleMouseEvents)
            .on('dblclick', this.handleMouseEvents);

        this.computeYScale();
        this.drawYAxis();
    
        // this.drawContext();
        // this.drawContextAxis();
    };

    shouldComponentUpdate(nextProps: IProps, nextState: IState) {
        return false;
    }

    componentWillReceiveProps(props: IProps) {
        var startDate = momentToSql(props.dateInterval.startDate);
        var stopDate = momentToSql(props.dateInterval.stopDate);
        if ( startDate !== this.startDate || stopDate !== this.stopDate) {
            this.startDate = startDate;
            this.stopDate = stopDate;
            // this.loadJsonFromAeroc(props.capteurId, props.channelData.id, '2017/12/20 00:00:00', '2017/12/21 01:00:00');
            // this.loadJsonFromAeroc(props.capteurId, props.channelData.id, '2017/12/09 00:00:00', '2017/12/09 23:59:00');
            // this.loadJsonFromAeroc(props.capteurId, props.channelData.id, '2017/12/10 00:00:00', '2017/12/10 23:59:00');
            // this.loadJsonFromAeroc(props.capteurId, props.channelData.id, '2017/12/11 00:00:00', '2017/12/11 23:59:00');
            // this.loadJsonFromAeroc(props.capteurId, props.channelData.id, '2017/12/12 00:00:00', '2017/12/12 23:59:00');
            // this.loadJsonFromAeroc(props.capteurId, props.channelData.id, '2017/12/13 00:00:00', '2017/12/13 23:59:00');
            this.loadJsonFromAeroc(props.capteurId, props.channelData.id, startDate, stopDate);
            
        }

        // if ( props.displayValue !== this.props.displayValue ) {
        if ( props.displayValue.display ) {
            this.displayCrosshair(props.displayValue.display, props.displayValue.dataTimeMs, props.displayValue.timeMs);
        }
    }

    displayCrosshair = (display: boolean, dataTimeMs: number, timeMs: number) => {
        var opacity = display ? 1 : 0;
        var value = this.mapValues.get(dataTimeMs);

        // Y Value
        d3.select(this.yValueDisplayedRef)
            .attr('opacity', opacity);
        d3.select(this.yValueRef)
            .text(value ? value.toString() : '')
        
        // X Value
        var date = new Date(timeMs);
        var formattedDate = dataTimeString(date)
        // var time = date.getUTCHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        d3.select(this.dateRef)
            .text(formattedDate)
        d3.select(this.gDateRef)
            .attr('transform', 'translate(' + (this.originGraphX + this.props.timeScale(new Date(date))) + ',' + (this.originGraphY + this.chartHeight - 18) + ')')
            .attr('opacity', opacity);

        this.props.handleSelectedValue(this.state.graphType, value);
    }

    render() {

        return (
            <g ref={(ref) => ref}>
                {/* Cadre */}
                <rect x={this.originGraphX} y={this.originGraphY} width={this.chartWidth} height={this.chartHeight} stroke="lavender" fill="transparent" strokeWidth="1" shapeRendering="crispEdges"/> 
                {/* Legende */}
                <text x="0" y="0" fill="black" textAnchor="start" alignmentBaseline="hanging">
                    {this.props.channelData.measure_type + ' ' + this.props.channelData.unit}
                </text>
                {/* Display Y Value */}
                <g ref={(ref) => {this.yValueDisplayedRef = ref}} opacity="0">
                    <rect x="0" y="20" width="50" height="20" stroke={this.state.graphType.color} strokeWidth="1" fill="white" />
                    <text ref={(ref) => {this.yValueRef = ref}} x="25" y="30" fill="black" textAnchor="middle" alignmentBaseline="central" />
                </g>
                {/* Chart */}
                <g ref={(ref) => {this.chartRef = ref}} className={this.state.graphType.svgClass} transform={'translate(' + this.originGraphX + ',' + this.originGraphY + ')'}>
                    <g ref={(ref) => {this.axisBottomRef = ref}} transform={'translate(0,' + this.chartHeight + ')'} />
                </g>
                {/* Overlay */}
                <g transform={'translate(' + this.originGraphX + ',' + this.originGraphY + ')'}>
                    <rect ref={(ref) => {this.overlayRef = ref}} x="0" y="0" width={this.chartWidth} height={this.chartHeight} stroke="lavender" fill="transparent"/> 
                </g>
                {/* X Crosshair Value */}
                <g ref={(ref) => {this.gDateRef = ref}} opacity="0" pointerEvents="none">
                    <rect rx="2" ry="2" x="-60" y="20" width="120" height="18" stroke="lavender" strokeWidth="1" fill="white" />
                    <text ref={(ref) => {this.dateRef = ref}} fontSize="12" x="0" y="22" fill="black" textAnchor="middle" alignmentBaseline="hanging" />
                </g>
                {/* Y Crosshair Value */}
                <g ref={(ref) => {this.ghorizontalCrosshairRef = ref}} opacity="0" pointerEvents="none">
                    <rect rx="2" ry="2" x="-30" y="-8" width="30" height="18" stroke="lavender" strokeWidth="1" fill="white" />
                    <line x1="0" x2={this.chartWidth} y1="0" y2="0" stroke="lavender" strokeWidth="1" shapeRendering="crispEdges"/> 
                    <text ref={(ref) => {this.horizontalCrosshairValueRef = ref}} fontSize="12" x="-15" y="-4" fill="black" textAnchor="middle" alignmentBaseline="hanging" />
                </g>
            </g>
        )
    }
}
