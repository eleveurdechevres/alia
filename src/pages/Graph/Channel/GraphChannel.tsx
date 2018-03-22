import * as React from 'react';
import * as d3 from 'd3';
import { GraphType } from './GraphType';
import { momentToSql, dataTimeString } from '../../../utils/DateUtils';
import * as Moment from 'moment';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

interface IProps {
    originGraphX: number;
    originGraphY: number;
    chartWidth: number;
    chartHeight: number;
    habitatId: number;
    capteurId: number;
    channelData: IChannelData;
    chartIndex: number;
    interChart: number;
    dateInterval: IDateInterval;
    displayCrossHairX: (
        xMouse: number, 
        timeMsMouse: number, 
        dataTimeMs: number, 
        d3Event: any) => void;
    displayCrossHairY: (
        yMouse: number, 
        d3Event: any) => void;
    domainTime: Date[];
    displayCrossHairTime: boolean;
    crosshairTime: ICrosshairTime;
    xPosition: number;
    yPosition: number;
    handleSelectedValue: (
        graphType: any,
        y: number | undefined ) => void;
    applyGlobalBrush: (dateInterval: {}[]) => void;
    resetZoomX: () => void;
};

export interface ICrosshairTime {
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

@observer export class GraphChannel extends React.Component<IProps, {}> {

    @observable graphType: any = undefined;

    gChartRef: SVGGElement | null;
    chartRef: SVGGElement | null;
    chartContextRef: SVGGElement | null;
    overlayChartRef: SVGGElement  | null;

    yValueDisplayedRef: SVGGElement | null;
    yValueRef: SVGGElement | null;

    gHorizontalCrosshairRef: SVGGElement | null;
    horizontalCrosshairValueRef: SVGGElement | null;

    gVerticalCrosshairRef: SVGGElement | null;
    gDateRef: SVGGElement | null;
    dateRef: SVGGElement | null;

    axisBottomRef: SVGGElement | null;

    refGVerticalBrushDetail: SVGGElement | null;
    refGHorizontalBrushDetail : SVGGElement;

    xyBrush: d3.BrushBehavior<{}>;
    verticalBrushDetail: d3.BrushBehavior<{}>;
    horizontalBrushDetail: d3.BrushBehavior<{}>;

    startDate: string;
    stopDate: string;

    originGraphX: number;
    originGraphY: number;
    chartWidth: number;
    chartHeight: number;

    mapValues = new Map<number, number>();
    mapMeteo = new Map<number, number>();
    timeScale: any;

    lineFunction: d3.Line<{ date: Date; valeur: number; }>;

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
        this.graphType = GraphType.getGraphTypeFromMeasuretype(this.props.channelData.measure_type)

        this.originGraphX = this.props.originGraphX;
        this.originGraphY = this.props.originGraphY;
        this.chartWidth = this.props.chartWidth;
        this.chartHeight = this.props.chartHeight;

        this.timeScale = d3.scaleTime().range([0, this.props.chartWidth]);

        this.xyBrush = d3.brush()
            .extent([[0, 0], [this.chartWidth, this.chartHeight]])
            .on('end', this.xyBrushed);

        this.verticalBrushDetail = d3.brushY()
            .extent([[0, 0], [30 + this.chartWidth, this.chartHeight]])
            .on('end', this.verticalBrushedDetail);
        
        this.horizontalBrushDetail = d3.brushX()
            .extent([[0, 0], [this.chartWidth, this.chartHeight + this.props.interChart]])
            .on('end', this.horizontalBrushedDetail);

        this.lineFunction = d3.line<{date: Date, valeur: number}>()
            .x((d) => { return this.timeScale(d.date); })
            .y((d) => { return this.graphType.scaleFunction(d.valeur); })
            .curve(this.graphType.interpolation);
    
    }

    loadJsonDataFromAeroc = (capteurId: number, channelId: number, dateBegin: string, dateEnd: string) => {
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

    loadJsonMeteoFromAeroc = (habitatId: number, channelId: number, dateBegin: string, dateEnd: string) => {
        var request = 'http://test.ideesalter.com/alia_readMeteo.php?habitat_id=' + habitatId
            + '&channel_id=' + channelId + '&date_begin=' + dateBegin + '&date_end=' + dateEnd;
        return fetch(request)
            .then((response) => response.json())
            .then((data) => {

                this.mapMeteo.clear();
                data.forEach((line: {date: string, valeur: number}) => {
                    var date = new Date(line.date);
                    date.setSeconds(0);
                    date.setMilliseconds(0);
                    date.setUTCMilliseconds(0);
                    date.setUTCSeconds(0);
                    this.mapMeteo.set(date.getTime(), line.valeur);
                })

                this.drawMeteo(this.mapMeteo);
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
        d3.select(this.chartRef).selectAll('path').filter('.pathValuesClass').remove();
        
        d3.select(this.chartRef).append('path')
            .datum(datum)
            .attr('class', 'pathValuesClass')
            .attr('clip-path', 'url(#id_clipPath)')
            .attr('d', this.lineFunction)
            .attr('fill', 'none')
            .attr('stroke', this.graphType.color)
            .attr('stroke-width', 1);
    };

    drawMeteo = (data: Map<number, number>) => {
        var datum: {date: Date, valeur: number}[] = [];
        data.forEach(
            (valeur: number, timeMs: number) => { datum.push( {date: new Date(timeMs), valeur: valeur} ) }
        );
        if ( datum.length > 2 ) {

            var min = this.graphType.domain[1];
            var firstDate: Date = datum[0].date;
            var lastDate: Date = datum[datum.length - 1].date;
            var firstElement = {date: firstDate, valeur: min};
            var lastElement = {date: lastDate, valeur: min};
            datum.unshift(firstElement);
            datum.push(lastElement);
            d3.select(this.chartRef).selectAll('path').filter('.pathMeteoClass').remove();
            
            d3.select(this.chartRef).append('path')
                .datum(datum)
                .attr('class', 'pathMeteoClass')
                .attr('clip-path', 'url(#id_clipPath)')
                .attr('d', this.lineFunction)
                .attr('fill', this.graphType.color)
                .attr('stroke', this.graphType.color)
                .attr('stroke-width', 1)
                .attr('opacity', '0.1');
        }
    }

    xyBrushed = () => {
        var s: [Array<number>, Array<number>] = d3.event.selection;
        if ( s ) {
            // Masque le brush
            d3.select(this.overlayChartRef).call(this.xyBrush.move, null);

            var startPoint: Array<number> = s[0];
            var endPoint: Array<number> = s[1];
            var xSelection: Array<number> = [startPoint[0], endPoint[0]]; 
            var ySelection: Array<number> = [startPoint[1], endPoint[1]]; 
            this.horizontalBrushedDetail(xSelection);
            this.verticalBrushedDetail(ySelection);
        }
    }

    verticalBrushedDetail = (s: Array<number> | undefined) => {
        if ( s === undefined) {
            s = d3.event.selection;
        }
        if (s) {
            // Masque le brush
            d3.select(this.refGVerticalBrushDetail).call(this.verticalBrushDetail.move, null);
            
            var yDomainBrushed = [s[0], s[1]].map(this.graphType.scaleFunction.invert);
            this.graphType.scaleFunction.domain(yDomainBrushed);
            this.drawYAxis();
            this.drawTimeAxis();
            this.drawGraph(this.mapValues);
            this.drawMeteo(this.mapMeteo);
        }
    }

    horizontalBrushedDetail = (s: Array<number> | undefined) => {
        if ( s === undefined) {
            s = d3.event.selection;
        }
        if (s) {
            var dateInterval = [s[0], s[1]].map(this.timeScale.invert);

            this.props.applyGlobalBrush(dateInterval);

            // Masquer le brush detail
            d3.select(this.refGHorizontalBrushDetail)
                .call(this.horizontalBrushDetail.move, null);
        }
    }

    resetZoomXY = () => {
        this.props.resetZoomX();
        this.resetZoomY();
    }
    resetZoomY = () => {
        this.graphType.scaleFunction.domain(this.graphType.domain);
        this.drawYAxis();
        this.drawTimeAxis();
        this.drawGraph(this.mapValues);
        this.drawMeteo(this.mapMeteo);
    }

    handleXYMouseEvents = () => {
        this.handleXMouseEvents();
        this.handleYMouseEvents();
    }

    handleXMouseEvents = () => {
        var xMouse = 0;
        var timeMsMouse = 0;
        if ( this.refGHorizontalBrushDetail ) {
            xMouse = d3.mouse(this.refGHorizontalBrushDetail)[0];
            timeMsMouse = this.timeScale.invert(xMouse);
        }
        var keys = Array.from(this.mapValues.keys());
        var indexTimeMs = d3.bisectLeft(keys, timeMsMouse);
        var dataTimeMs = keys[indexTimeMs];
        this.props.displayCrossHairX(xMouse, timeMsMouse, dataTimeMs, d3.event.type);
    }

    handleYMouseEvents = () => {
        var yMouse = 0;

        if ( this.refGHorizontalBrushDetail ) {
            yMouse = d3.mouse(this.refGHorizontalBrushDetail)[1];
        }

        switch (d3.event.type) {
            case 'mouseover':
            case 'mousemove':
                // var yValue = this.state.graphType.scaleFunction.invert(yMouse);
                var yValue = this.graphType.getYValue(yMouse);
                
                d3.select(this.horizontalCrosshairValueRef)
                    .text(yValue)
                d3.select(this.gHorizontalCrosshairRef)
                    .attr('transform', 'translate(' + this.originGraphX + ',' + yMouse + ')')
                    .attr('opacity', 1);
                break;
            case 'mouseout':
                d3.select(this.gHorizontalCrosshairRef)
                    .attr('opacity', 0);
                break;
            default:
                break;

        }
        this.props.displayCrossHairY(yMouse, d3.event.type);
    }

    computeYScale = () => {
        var yDomain = this.graphType.domain;
        var yRange = [0, this.chartHeight];
        this.graphType.scaleFunction.domain(yDomain).range(yRange);
    }

    drawYAxis = () => {

        var axis = d3.axisLeft(this.graphType.scaleFunction)
        
        if ( this.graphType.tickValues !== undefined ) {
            axis.tickValues(this.graphType.tickValues);
        }
            
        d3.select(this.chartRef).call(axis)
            .append('text')
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .attr('y', -9) 
            .text((d) => { return d === undefined ? ' ' : d.toString() });
        d3.select(this.chartRef)
            .selectAll('text')
            .attr('pointer-events', 'none');
    }

    drawTimeAxis() {
        d3.select(this.axisBottomRef)
            .call(d3.axisBottom(this.timeScale)
                    .tickFormat(d3.timeFormat('%H:%M'))
                    .ticks(15)
                )
            .selectAll('text')
            .attr('pointer-events', 'none');
    }
    
    componentDidMount() {

        d3.select(this.gChartRef)
            .append('clipPath')
            .attr('id', 'id_clipPath')
            .append('rect')
            .attr('width', this.chartWidth)
            .attr('height', this.chartHeight)
            .attr('fill', 'white');

        d3.select(this.overlayChartRef)
            .call(this.xyBrush)
            .on('mouseover', this.handleXYMouseEvents)
            .on('mouseout', this.handleXYMouseEvents)
            .on('mousemove', this.handleXYMouseEvents)
            .on('dblclick', this.resetZoomXY);

        d3.select(this.refGHorizontalBrushDetail)
            .call(this.horizontalBrushDetail)
            .on('mouseover', this.handleXMouseEvents)
            .on('mouseout', this.handleXMouseEvents)
            .on('mousemove', this.handleXMouseEvents)
            .on('dblclick.zoom', this.props.resetZoomX)

        d3.select(this.refGVerticalBrushDetail)
            .call(this.verticalBrushDetail)
            .on('mouseover', this.handleYMouseEvents)
            .on('mouseout', this.handleYMouseEvents)
            .on('mousemove', this.handleYMouseEvents)
            .on('dblclick.zoom', this.resetZoomY)

        this.computeYScale();
        this.drawYAxis();

        // this.drawContext();
        // this.drawContextAxis();
    };

    shouldComponentUpdate(nextProps: IProps, nextState: {}) {
        // if ( nextProps.displayCrossHairTime !== this.props.displayCrossHairTime ) {
        //     console.log('shouldUpdate')
        //     return true;
        // }
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
            this.loadJsonDataFromAeroc(props.capteurId, props.channelData.id, startDate, stopDate);
            this.loadJsonMeteoFromAeroc(props.habitatId, props.channelData.id, startDate, stopDate);
        }

        this.displayVerticalCrosshair(props.displayCrossHairTime, props.crosshairTime.dataTimeMs, props.crosshairTime.timeMs);

        if ( props.domainTime !== this.props.domainTime ) {
            this.timeScale.domain(props.domainTime);
            this.drawGraph(this.mapValues);
            this.drawMeteo(this.mapMeteo);
            this.drawTimeAxis();
            // this.forceUpdate();
        };
    }

    displayVerticalCrosshair = (display: boolean, dataTimeMs: number, timeMs: number) => {
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
        var translateX = this.originGraphX + this.timeScale(new Date(date));
        d3.select(this.dateRef)
            .text(formattedDate);
        d3.select(this.gVerticalCrosshairRef)
            .attr('transform', 'translate(' + translateX + ',0)')
        .attr('opacity', opacity);

        this.props.handleSelectedValue(this.graphType, value);
    }

    render() {
        return (
            <g ref={(ref) => this.gChartRef = ref}>
                {/* Cadre */}
                <rect x={this.originGraphX} y={this.originGraphY} width={this.chartWidth} height={this.chartHeight} stroke="lavender" fill="transparent" strokeWidth="1" shapeRendering="crispEdges"/> 
                {/* Legende */}
                <text x="0" y="0" fill="black" textAnchor="start" alignmentBaseline="hanging">
                    {this.props.channelData.measure_type + ' ' + this.props.channelData.unit}
                </text>
                {/* Display Y Value */}
                <g ref={(ref) => {this.yValueDisplayedRef = ref}} opacity={this.props.displayCrossHairTime ? 1 : 0}>
                    <rect x="0" y="20" width="50" height="20" stroke={this.graphType.color} strokeWidth="1" fill="white" />
                    <text ref={(ref) => {this.yValueRef = ref}} x="25" y="30" fill="black" textAnchor="middle" alignmentBaseline="central" />
                </g>
                {/* Chart */}
                <g ref={(ref) => {this.chartRef = ref}} className={this.graphType.svgClass} transform={'translate(' + this.originGraphX + ',' + this.originGraphY + ')'}>
                    <g ref={(ref) => {this.refGHorizontalBrushDetail = ref}}/>
                    <g ref={(ref) => {this.axisBottomRef = ref}} transform={'translate(0,' + this.chartHeight + ')'}/>
                    <g ref={(ref) => {this.refGVerticalBrushDetail = ref}} transform={'translate(-30,0)'} cursor="none"/>
                </g>
                {/* Chart Overlay */}
                <g transform={'translate(' + this.originGraphX + ',' + this.originGraphY + ')'}>
                    <g ref={(ref) => {this.overlayChartRef = ref}} cursor="none"/>
                </g>

                {/* Y Crosshair Value */}
                <g ref={(ref) => {this.gHorizontalCrosshairRef = ref}} opacity="0" pointerEvents="none">
                    <line x1="0" x2={this.chartWidth} y1="0" y2="0" stroke="RebeccaPurple" strokeWidth="1" shapeRendering="crispEdges"/> 
                    <rect rx="2" ry="2" x="-30" y="-8" width="30" height="18" stroke="RebeccaPurple" strokeWidth="1" fill="RebeccaPurple" opacity={0.7}/>
                    <text ref={(ref) => {this.horizontalCrosshairValueRef = ref}} fontSize="12" x="-15" y="-4" fill="white" textAnchor="middle" alignmentBaseline="hanging" />
                </g>
                {/* X Crosshair Value */}
                <g ref={(ref) => {this.gVerticalCrosshairRef = ref}} pointerEvents="none">
                    <line
                        x1={0}
                        x2={0}
                        y1={0}
                        y2={this.chartHeight + this.props.interChart}
                        stroke="RebeccaPurple"
                        strokeWidth="1"
                        shapeRendering="crispEdges"
                    />
                    <g ref={(ref) => {this.gDateRef = ref}}>
                        <rect rx="2" ry="2" x="-60" y={this.chartHeight} width="120" height="18" stroke="RebeccaPurple" strokeWidth="1" fill="RebeccaPurple" opacity={0.7}/>
                        <text ref={(ref) => {this.dateRef = ref}} fontSize="12" x="0" y={this.chartHeight + 10} fill="white" textAnchor="middle" alignmentBaseline="middle" />
                    </g>
                </g>
            </g>
        )
    }
}
