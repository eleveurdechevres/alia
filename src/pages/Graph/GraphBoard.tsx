import * as React from 'react';
import * as $ from 'jquery';
import DatePicker from 'react-datepicker';
import * as moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import { GraphChannel, ICrosshairTime } from './Channel/GraphChannel';
import * as d3 from 'd3';
import { Crosshair } from './Crosshair';
import { TemperatureHumidity } from './CrossGraph/TemperatureHumidity';
// import { LuminosityTemperature } from './CrossGraph/LuminosityTemperature';
import { GraphType } from './Channel/GraphType';
import { ICapteur } from 'src/interfaces/ICapteur';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { IChannel } from 'src/interfaces/IChannel';
import * as csstips from 'csstips'; 
import { style } from 'typestyle'; 
import { ScaleTime } from 'd3';

interface IProps {
    habitatId: number;
    capteur: ICapteur;
}

export interface IDateInterval {
    startDate: moment.Moment;
    stopDate: moment.Moment;
    minDate: moment.Moment;
    maxDate: moment.Moment;
}

interface ICrosshair {
    verticalDisplayed: boolean;
    horizontalDisplayed: boolean;
    xPosition: number;
    yPosition: number;
}

@observer export class GraphBoard extends React.Component<IProps, {}> {

    @observable capteur: ICapteur = undefined;
    @observable mapChannels: Map<string, IChannel> = new Map<string, IChannel>();
    @observable channels: IChannel[] = [];
    @observable dateInterval: IDateInterval = {
        startDate: moment(),
        stopDate: moment(),
        minDate: moment(),
        maxDate: moment()
    }
    @observable crosshair: ICrosshair = {
        verticalDisplayed: false,
        horizontalDisplayed: false,
        xPosition: 0,
        yPosition: 0
    }

    @observable displayCrossHairTime: boolean = false;

    @observable crossHairTime: ICrosshairTime = {
        dataTimeMs: undefined,
        timeMs: undefined
    }
    @observable currentTemperature: number;
    @observable currentHumidity: number;

    topMargin = 20;
    originGraphX = 150;
    originGraphY = 0;
    chartWidth = 1270;
    chartHeight = 200;
    interChart = 20;
    crosshairValues = new Map();

    dateAxisRef: SVGGElement;

    //  verticalCrosshairRef :SVGGElement;
    //  verticalCrosshairLineRef : SVGGElement;
    globalBrushRef : SVGGElement;

    globalBrushed = () => {
        if ( d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom' ) {
            return; // ignore brush-by-zoom
        }
        var selection = d3.event.selection || this.contextTimeScale.range();
        this.domainTime = selection.map(this.contextTimeScale.invert, this.contextTimeScale);
        this.timeScale.domain(this.domainTime);
        // this.timeScale.tickValues(selection.map(this.timeScale.invert, this.timeScale));
        // this.updatePathes();
        // this.drawDateAxis();
    }

    applyGlobalBrush = (dateInterval: {}[]) => {
        var range = dateInterval.map(this.contextTimeScale);
        var brush = d3.select(this.globalBrushRef).call(this.globalBrush);
        brush.transition().call(this.globalBrush.move, range);
    }

    globalBrush = d3.brushX()
        .extent([[0, 0], [this.chartWidth, this.topMargin]])
        .on('brush end', this.globalBrushed);

    constructor(props: IProps) {
        super(props);
        this.capteur = this.props.capteur;
        this.loadCapteurChannels();
        this.getDateInterval(this.capteur.id)

        // CAPTEUR : {
        //   capteur_reference_id:"AEO_ZW100"
        //   coordonneePlanX:"500"
        //   coordonneePlanY:"300"
        //   coordonneePlanZ:"100"
        //   id:"1"
        //   plan_id:"1"
        // }
    }

    loadCapteurChannels = () => {

        $.getJSON(
            'http://test.ideesalter.com/alia_searchChannelsFromCapteur.php?capteur_reference_id=' + this.capteur.capteur_reference_id,
            (data: IChannel[]) => {
                this.channels = data;
                data.forEach((channel) => {
                    var graphType = GraphType.getGraphTypeFromMeasuretype(channel.measure_type);
                    this.mapChannels.set(graphType.svgClass, channel);
                })
            });
    }

    getDateInterval = (id: number) => {
        if (!id) {
            return Promise.resolve({ dateInterval: {startDate: undefined, stopDate: undefined} });
        }
        return fetch(`http://test.ideesalter.com/alia_searchDateIntervalMissionForCapteur.php?id=${id}`)
            .then((response) => response.json())
            .then((data) => {
                var minDate = moment(data.minDate);
                var maxDate = moment(data.maxDate);

                this.dateInterval.startDate = minDate;
                this.dateInterval.stopDate = maxDate;
                this.dateInterval.minDate = minDate;
                this.dateInterval.maxDate = maxDate;
                
                // Update time scale
                var domain = [this.dateInterval.startDate.toDate(), this.dateInterval.stopDate.toDate()];
                var chartWidth = 1270;
                var range = [0, chartWidth];
                this.contextTimeScale = d3.scaleTime().domain(domain).range(range);
                this.domainTime = domain;
                this.timeScale = d3.scaleTime().domain(domain).range(range);

                // Redraw Globlal Axis
                this.drawDateAxis();
            }
        );
    }

    handleChangeStartDate = (date: moment.Moment) => {
        this.dateInterval.startDate = date;
    }
  
    handleChangeStopDate = (date: moment.Moment) => {
        this.dateInterval.stopDate = date;
    }

    componentDidMount() {
        d3.select(this.globalBrushRef)
            .call(this.globalBrush)
            // .call(this.globalBrush.move, this.timeScale.range())
    }

    resetZoomX = () => {
        var brush = d3.select(this.globalBrushRef).call(this.globalBrush);
        brush.transition().call(this.globalBrush.move, [0, this.chartWidth]);
    }

    displayCrossHairX = (xMouse: number, timeMs: number, dataTimeMs: number, eventType: string) => {
        switch (eventType) {
            case 'mouseover':
            case 'mousemove':
                this.crosshair.verticalDisplayed = true;
                this.crosshair.xPosition = xMouse;    
                this.displayCrossHairTime = true;
                this.crossHairTime.dataTimeMs = dataTimeMs;
                this.crossHairTime.timeMs = timeMs;
                break;
            case 'mouseout':
                this.crosshair.verticalDisplayed = false;
                this.displayCrossHairTime = false;
                break;
            default:
                break;
        }
    }

    displayCrossHairY = (yMouse: number, eventType: string) => {
        switch (eventType) {
            case 'mouseover':
            case 'mousemove':
            case 'drag':
                this.crosshair.horizontalDisplayed = true;    
                this.crosshair.yPosition = yMouse;    
                break;
            case 'mouseout':
                this.crosshair.horizontalDisplayed = false;
                this.crosshair.yPosition = yMouse;    
                break;

            case 'click':
            case 'dblclick':
            default:
                break;
        }
    }

    handleSelectedValue = (graphType: any, y: number) => {
        this.crosshairValues.set(graphType, y);
        switch (graphType.svgClass) {
            case GraphType.HUMIDITE.svgClass:
                this.currentHumidity = y
                break;
            case GraphType.TEMPERATURE.svgClass:
                this.currentTemperature = y;
                break;
            case GraphType.PRESENCE.svgClass:
            case GraphType.LUMINOSITE.svgClass:
            default:
                break;
        }
    }

    contextTimeScale: ScaleTime<number, number> = d3.scaleTime();
    timeScale: ScaleTime<number, number> = d3.scaleTime();
    @observable domainTime: Date[];

    drawDateAxis = () => {
        d3.select(this.dateAxisRef)
            .attr('transform', 'translate(' + this.originGraphX + ',0)')
            .call(d3.axisTop(this.contextTimeScale)
                .tickFormat(d3.timeFormat('%d/%m/%Y'))
                // .ticks(d3.timeHour.every(24))
                )
            .selectAll('text');
    }

  render() {

    var svgHeight = this.channels.length * this.chartHeight
      + (this.channels.length - 1) * this.interChart + 200;

    return (
      <div className={style(csstips.fillParent, csstips.horizontal)}>
        <div className={style(csstips.fillParent)}>
            <svg width="100%" height={svgHeight}>
                <g transform={'translate(' + this.originGraphX + ',' + this.topMargin + ')'}>
                    <Crosshair
                        displayVertical={this.crosshair.verticalDisplayed}
                        top={0}
                        bottom={1000}
                        xPosition={this.crosshair.xPosition}
                        yPosition={this.crosshair.yPosition}
                    />
                </g>
                <g transform={'translate(0,' + this.topMargin + ')'}>

                    <g ref={(ref) => {this.dateAxisRef = ref}} />
                    {
                    this.channels.map((data, index) => {
                        var originy = index * (this.chartHeight + this.interChart);
                        return (
                        
                        <g key={data.id} transform={'translate(0,' + originy + ')'}>
                            <GraphChannel
                                originGraphX={this.originGraphX} 
                                originGraphY={this.originGraphY} 
                                chartWidth={this.chartWidth} 
                                chartHeight={this.chartHeight} 
                                habitatId={this.props.habitatId}
                                capteurId={this.capteur.id}
                                channelData={data} 
                                chartIndex={index} 
                                interChart={this.interChart} 
                                dateInterval={this.dateInterval} 
                                displayCrossHairX={this.displayCrossHairX} 
                                displayCrossHairY={this.displayCrossHairY} 
                                domainTime={this.domainTime}
                                displayCrossHairTime={this.displayCrossHairTime}
                                crosshairTime={this.crossHairTime}
                                xPosition={this.crosshair.xPosition}
                                yPosition={this.crosshair.yPosition}
                                handleSelectedValue={this.handleSelectedValue}
                                applyGlobalBrush={this.applyGlobalBrush}
                                resetZoomX={this.resetZoomX}
                            />
                        </g>
                        )
                    })
                    }
                </g>
                <g transform={'translate(' + this.originGraphX + ',0)'}>
                    <g ref={(ref) => {this.globalBrushRef = ref}}/>
                </g>
            </svg>
        </div>
        <div className={style(csstips.content, csstips.vertical)}>
            <DatePicker
                selected={this.dateInterval.startDate}
                onChange={this.handleChangeStartDate}
                minDate={this.dateInterval.minDate}
                maxDate={this.dateInterval.maxDate}
                dateFormat="DD/MM/YYYY"
                placeholderText="Date de début"
            />
            <DatePicker
                selected={this.dateInterval.stopDate}
                onChange={this.handleChangeStopDate}
                minDate={this.dateInterval.minDate}
                maxDate={this.dateInterval.maxDate}
                dateFormat="DD/MM/YYYY"
                placeholderText="Date de fin"
            />
            <TemperatureHumidity
                chartWidth={340}
                chartHeight={300}
                dateInterval={this.dateInterval}
                capteurId={this.capteur.id}
                channelX={this.mapChannels.get(GraphType.TEMPERATURE.svgClass)} 
                channelY={this.mapChannels.get(GraphType.HUMIDITE.svgClass)} 
                channelXType={GraphType.TEMPERATURE} 
                channelYType={GraphType.HUMIDITE}
                currentHumidity={this.currentHumidity}
                currentTemperature={this.currentTemperature}
            />
          </div>
      </div>
    );

  }
}
