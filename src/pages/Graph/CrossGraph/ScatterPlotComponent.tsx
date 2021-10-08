import * as React from 'react';
import { dateWithoutSeconds } from '../../../utils/DateUtils';
import * as d3 from 'd3';
import { IDateInterval } from 'src/pages/Graph/GraphBoard';
import { ICrossValue } from 'src/interfaces/ICrossValue';
import { ScaleLinear } from 'd3';
import { observer } from 'mobx-react';
import { IChannelOfTypeFromMission } from 'src/interfaces/IChannelOfTypeFromMission';
import { GlobalStore } from 'src/stores/GlobalStore';
import { IChannel } from 'src/interfaces/IChannel';

interface IProps {
    globalStore: GlobalStore;
    missionId: number;
    chartWidth: number;
    chartHeight: number;
    dateInterval: IDateInterval;
    capteurX: IChannelOfTypeFromMission;
    capteurY: IChannelOfTypeFromMission;
    channelX: IChannel;
    channelY: IChannel;
    crosshairX: number;
    crosshairY: number;
}

interface Ixy {
    x: number;
    y: number;
    date: Date;
}

const HORIZONTAL_LEGEND_HEIGHT = 15;
const VERTICAL_LEGEND_WIDTH = 15;

const defaultTransition = d3.transition()
.duration(750)
.ease(d3.easeExp);

@observer export class ScatterPlotComponent extends React.Component<IProps, {}> {

    private mapValues: Map<Date, {x: number, y: number}> = new Map();
    private chartRef: SVGGElement;
    private refGBrush: SVGGElement;
    private xAxisRef: any;
    private yAxisRef: any;
    private currentCrosshairRef: SVGGElement;
    
    private startDate: Date = undefined;
    private stopDate: Date = undefined;

    private scaleX: ScaleLinear<number, number> = d3.scaleLinear();
    private scaleY: ScaleLinear<number, number> = d3.scaleLinear();
    private defaultDomainX: [number, number];
    private defaultDomainY: [number, number];

    private brush: d3.BrushBehavior<{}>;

    private datum: Ixy[] = [];
    private idleTimeout: NodeJS.Timeout = null;
    private idleDelay = 350;

    public constructor(props: IProps) {
        super(props);

        this.scaleX.range([0, this.props.chartWidth])
        this.scaleY.range([this.props.chartHeight, 0])

        this.componentWillReceiveProps(this.props);
    }

    public componentWillReceiveProps(props: IProps) {

        const startDate = props.dateInterval.missionStartDate;
        const stopDate = props.dateInterval.missionStopDate;

        if ( startDate !== this.startDate || stopDate !== this.stopDate) {
            this.startDate = startDate;
            this.stopDate = stopDate;
            this.loadJsonFromAeroc(props.missionId, startDate, stopDate, props.capteurX, props.capteurY);
        }
        if ( props.capteurX !== this.props.capteurX ||
            props.capteurY !== this.props.capteurY ) {
                this.loadJsonFromAeroc(props.missionId, startDate, stopDate, props.capteurX, props.capteurY);
            }

        if ( props.dateInterval.minDate !== this.props.dateInterval.minDate ||
            props.dateInterval.maxDate !== this.props.dateInterval.maxDate
        ) {
            d3.select(this.chartRef).selectAll('.classDots')
                .transition(defaultTransition)    
                .attr('opacity', (d: Ixy) => this.isDateBetweenInterval(d.date, props.dateInterval.minDate, props.dateInterval.maxDate) ? 1 : 0);
        }
    }

    public customBrush(g: any, brush: any) {
        g.call(brush);
        g.select('.selection')
            .attr('stroke', 'black')
            .attr('fill', 'white')
            .attr('stroke-dasharray', '1,1');
        }

    private idled = () => {
        this.idleTimeout = null;
    }

    private brushed = (): void => {
        console.log('brushed')
        var s = d3.event.selection;
        if (!s) {
            if (!this.idleTimeout) {
                this.idleTimeout = setTimeout(this.idled, this.idleDelay);
                return ;
            }
            this.scaleX.domain(this.defaultDomainX);
            this.scaleY.domain(this.defaultDomainY);
        } else {
            this.scaleX.domain([s[0][0], s[1][0]].map(this.scaleX.invert, this.scaleX));
            this.scaleY.domain([s[1][1], s[0][1]].map(this.scaleY.invert, this.scaleY));
            d3.select(this.refGBrush).call(this.brush.move, null);
        }
        // Zoom
        this.drawXAxis();
        this.drawYAxis();
        d3.select(this.chartRef).selectAll('.classDots')
            .transition(defaultTransition)
            .attr('cx', (d: Ixy) => this.scaleX(d.x))
            .attr('cy', (d: Ixy) => this.scaleY(d.y));
    }

    private loadJsonFromAeroc = (missionId: number, dateBegin: Date, dateEnd: Date, capteurX: IChannelOfTypeFromMission, capteurY: IChannelOfTypeFromMission) => {
        // LOAD DATA from AEROC
        if (capteurX !== undefined && capteurY !== undefined) {
            this.props.globalStore.getCrossMesures(missionId, dateBegin, dateEnd, capteurX, capteurY)
                .then((data: ICrossValue[]) => {
                    // console.log('Resultat loadJsonFromAeroc', data);
                    this.datum = [];
                    data.forEach((line: ICrossValue) => {
                        var date = dateWithoutSeconds(line.date);
                        this.mapValues.set(date, {x: line.channel1, y: line.channel2});
                        this.datum.push( {x: line.channel1, y: line.channel2, date: date} )
                    })
            
                    let maxChannel1: number = d3.max(this.datum, (d: Ixy) => d.x);
                    let minChannel1: number = d3.min(this.datum, (d: Ixy) => d.x);
                    let maxChannel2: number = d3.max(this.datum, (d: Ixy) => d.y);
                    let minChannel2: number = d3.min(this.datum, (d: Ixy) => d.y);

                    this.defaultDomainX = [minChannel1, maxChannel1];
                    this.defaultDomainY = [minChannel2, maxChannel2];
                    this.scaleX.domain(this.defaultDomainX);

                    this.scaleY.domain(this.defaultDomainY);
                    this.drawXAxis();
                    this.drawYAxis();

                    this.drawGraph();
                });
        }
    }

    private drawGraph = () => {
        d3.select(this.chartRef).selectAll('.classDots').remove();

        d3.select(this.chartRef).selectAll('dots')
            .data(this.datum)
            .enter().append('circle')
                .attr('class', (d) => 'classDots')
                .attr('cx', (d) => this.scaleX(d.x))
                .attr('cy', (d) => this.scaleY(d.y))
                .attr('r', 1)
                .attr('fill', 'none')
                .attr('stroke', 'black')
                .attr('stroke-width', 1);

        this.brush = d3.brush()
            .extent([[0, 0], [this.props.chartWidth, this.props.chartHeight]])
            .on('end', this.brushed);

        d3.select(this.refGBrush).call(this.customBrush, this.brush);

        // d3.select(this.refGBrush)
        //     .on('dblclick.zoom', this.resetZoom)
        //     .on('mouseover', this.displayCrosshair)
        //     .on('mousemove', this.displayCrosshair)
        //     .on('mouseout', this.displayCrosshair)
        //     .on('contextmenu', () => {
        //     d3.event.preventDefault();

        //     // let srcElement = d3.event.target || d3.event.srcElement;
        //     // this.xLastClick = d3.mouse(srcElement)[0];
        //     // this.yLastClick = d3.mouse(srcElement)[1];

        //     this.showContextMenu(d3.event.clientX, d3.event.clientY);
        //     });
    };

    private isDateBetweenInterval = (date: Date, dateMin: Date, dateMax: Date) => {
        return (date >= dateMin) && (date <= dateMax);
    }

    private drawXAxis = () => {
        d3.select(this.xAxisRef)
        .transition(defaultTransition)    
        .call(d3.axisTop(this.scaleX).tickFormat((value: number) => value + '... X'));
            // .call(d3.axisTop(this.scaleX).tickValues([0, 5, 10, 15, 20, 25, 30, 35, 40]).tickFormat((value: number) => value + '°C'))
            // .selectAll('text');
            // .append("text")
            // .attr("fill", "black")
            // // .style("text-anchor", "middle")
            // // .attr("y", -9) 
            // .text(function(d) { return d });
    }

    private drawYAxis = () => {
        d3.select(this.yAxisRef)
        .transition(defaultTransition)    
            .call(d3.axisLeft(this.scaleY).tickFormat((value: number) => value + '... Y'));
            // .selectAll('text');
            // .append("text")
            // .attr("fill", "black")
            // .style("text-anchor", "middle")
            // .attr("y", -9) 
            // .text(function(d) { return d });
    }

    public componentDidUpdate() {

        if (!this.props.crosshairX || !this.props.crosshairY) {
            d3.select(this.currentCrosshairRef)
                .attr('opacity', 0);
        } else {
            var translateX = this.scaleX(this.props.crosshairX);
            var translateY = this.scaleY(this.props.crosshairY);
            var translateCrosshair = 'translate(-10,-10)';
            var displayCrosshair = false;
        
            if (translateX !== NaN && translateY !== NaN) {
                translateCrosshair = 'translate(' + translateX + ',' + translateY + ')';
                displayCrosshair = true;
            }
    
            d3.select(this.currentCrosshairRef)
                .transition()
                .attr('transform', translateCrosshair)
                .attr('opacity', displayCrosshair ? 1 : 0);
        }
    }

    public render() {
        return (
            <div>
                <div>
                    <svg width={this.props.chartWidth} height={this.props.chartHeight}>
                        <rect x="0" y="0" width={this.props.chartWidth} height={this.props.chartHeight} fill="white" stroke="black"/>
                        <g>
                            <g ref={(ref) => {this.chartRef = ref}}/>
                            <g ref={(ref) => {this.xAxisRef = ref}} transform={'translate(0,' + this.props.chartHeight + ')'}/>
                            <g ref={(ref) => {this.yAxisRef = ref}} transform={'translate(' + this.props.chartWidth + ', 0)'}/>
                            <g
                                ref={(ref) => {this.currentCrosshairRef = ref}}
                                transform="translate(-10, -10)"
                                opacity="0"
                            >
                                <circle cx="0" cy="0" r="5" stroke="white" fill="steelblue"/>
                            </g>
                            <g id="generalBrush" ref={(ref) => {if (ref) { this.refGBrush = ref; } }}>
                                <rect
                                    width={this.props.chartWidth}
                                    height={this.props.chartHeight}
                                    fill="none"
                                />
                            </g>
                            <g
                                transform={`translate(${VERTICAL_LEGEND_WIDTH - 5},${this.props.chartHeight / 2})`}
                            >
                                <text
                                    textAnchor="middle"
                                    transform="rotate(-90 0 0)"
                                    fontSize="12"
                                >
                                    {this.props.capteurY.capteur_reference_id}&nbsp;
                                    [plan {this.props.capteurY.plan_id}]
                                    [channel {this.props.capteurY.channel_id}] -&nbsp;
                                    {this.props.channelY.measure_type} ({this.props.channelY.unit})
                                </text>
                            </g>
                            <text
                                x={this.props.chartWidth / 2}
                                y={HORIZONTAL_LEGEND_HEIGHT - 5}
                                textAnchor="middle"
                                // transform="rotate(-90 0 0)"
                                fontSize="12"
                            >
                                    {this.props.capteurX.capteur_reference_id}&nbsp;
                                    [plan {this.props.capteurX.plan_id}]
                                    [channel {this.props.capteurX.channel_id}] -&nbsp;
                                    {this.props.channelX.measure_type} ({this.props.channelX.unit})
                            </text>
                        </g>
                    </svg>
                </div>
           </div>
        )
    }
}