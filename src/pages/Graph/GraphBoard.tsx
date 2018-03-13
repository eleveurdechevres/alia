import * as React from 'react';
import * as $ from 'jquery';
import DatePicker from 'react-datepicker';
import * as moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import { GraphChannel, IDisplayValue } from './Channel/GraphChannel';
import * as d3 from 'd3';
import { Crosshair } from './Crosshair';
// import { TemperatureHumidity } from './CrossGraph/TemperatureHumidity';
// import { LuminosityTemperature } from './CrossGraph/LuminosityTemperature';
import { GraphType } from './Channel/GraphType';
import { ICapteur } from 'src/interfaces/ICapteur';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { IChannel } from 'src/interfaces/IChannel';

interface IProps {
    capteur: ICapteur;
}

interface IDateInterval {
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
    @observable displayValue: IDisplayValue = {
        display: false,
        dataTimeMs: undefined,
        timeMs: undefined,
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
    brushRef : SVGGElement;
    globalBrushRef : SVGGElement;

    brushed = () => {
        console.log('BRUSHED1');
        // var s = d3.event.selection || this.getTimeScale().range();
        // console.log(s);
        // d3.select(this.brushRef)
        // .call(this.brush)
        // .call(this.brush.clear());
        // .call(this.globalBrush.move, this.getTimeScale().range())

        // console.log(s);
        // x.domain(s.map(x2.invert, x2));
        // focus.select(".area").attr("d", area);
        // focus.select(".axis--x").call(xAxis);
        // svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        //     .scale(width / (s[1] - s[0]))
        //     .translate(-s[0], 0));
    }

    globalBrushed = () => {
        console.log('global brushed');
        // var s = d3.event.selection || this.getTimeScale().range();
        // console.log(s);
        // x.domain(s.map(x2.invert, x2));
        // focus.select(".area").attr("d", area);
        // focus.select(".axis--x").call(xAxis);
        // svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        //     .scale(width / (s[1] - s[0]))
        //     .translate(-s[0], 0));
    }

    brush = d3.brushX()
        .extent([[0, 0], [this.chartWidth, 1000]])
        .on('brush end', this.brushed);

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
        d3.select(this.brushRef)
            .call(this.brush)
        d3.select(this.globalBrushRef)
            .call(this.globalBrush)
            .call(this.globalBrush.move, this.getTimeScale().range())
    }

    handleMouseEvents = (xMouse: number, yMouse: number, timeMs: number, dataTimeMs: number, eventType: string) => {
        switch (eventType) {
            case 'mouseover':
            case 'mousemove':
                this.crosshair.verticalDisplayed = true;    
                this.crosshair.horizontalDisplayed = true;    
                this.crosshair.xPosition = xMouse;    
                this.crosshair.yPosition = yMouse;    
                this.displayValue.display = true;
                this.displayValue.dataTimeMs = dataTimeMs;
                this.displayValue.timeMs = timeMs;
                break;
            case 'mouseout':
                this.crosshair.verticalDisplayed = false;
                this.crosshair.horizontalDisplayed = false;    
                this.crosshair.xPosition = xMouse;    
                this.crosshair.yPosition = yMouse;    
                this.displayValue.display = false;
                this.displayValue.dataTimeMs = dataTimeMs;
                this.displayValue.timeMs = timeMs;
                break;

            case 'click':
            case 'dblclick':
            default:
                break;
        }
    }

    handleSelectedValue = (graphType: GraphType, y: number) => {
        this.crosshairValues.set(graphType, y);
        // console.log("handle crosshairValues")
        switch (graphType) {
            case GraphType.HUMIDITE:
                this.currentHumidity = y
                break;
            case GraphType.TEMPERATURE:
                this.currentTemperature = y;
                break;
            case GraphType.PRESENCE:
            case GraphType.LUMINOSITE:
            default:
        }
    }

    getTimeScale = () => {
        var domain = [this.dateInterval.startDate.toDate(), this.dateInterval.stopDate.toDate()];
        var chartWidth = 1270;
        var range = [0, chartWidth];

        return d3.scaleTime().domain(domain).range(range);
    }

    drawDateAxis = () => {
        d3.select(this.dateAxisRef)
            .attr('transform', 'translate(' + this.originGraphX + ',0)')
            .call(d3.axisTop(this.getTimeScale())
                .tickFormat(d3.timeFormat('%d/%m/%Y'))
                // .ticks(d3.timeHour.every(24))
                )
            .selectAll('text');
    }

  componentDidUpdate() {
    this.drawDateAxis();
  }

  render() {

    var svgHeight = this.channels.length * this.chartHeight
      + (this.channels.length - 1) * this.interChart + 200;

    return (
      <div>
        <svg width="100%" height={svgHeight}>
        <g transform={'translate(' + this.originGraphX + ',' + this.topMargin + ')'}>
            <g ref={(ref) => {this.brushRef = ref}}/>
            <Crosshair
                displayVertical={this.crosshair.verticalDisplayed}
                displayHorizontal={this.crosshair.horizontalDisplayed}
                top={0}
                bottom={1000}
                left={this.originGraphX}
                right={this.originGraphX + this.chartWidth}
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
                        capteurId={this.capteur.id}
                        channelData={data} 
                        chartIndex={index} 
                        interChart={this.interChart} 
                        dateInterval={this.dateInterval} 
                        handleMouseEvents={this.handleMouseEvents} 
                        timeScale={this.getTimeScale()}
                        displayValue={this.displayValue}
                        xPosition={this.crosshair.xPosition}
                        yPosition={this.crosshair.yPosition}
                        handleSelectedValue={this.handleSelectedValue}
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
                      {/* <tr>
                        <td>
                          <TemperatureHumidity chartWidth='340' chartHeight='300'
                            dateInterval={this.state.dateInterval}
                            capteurId={this.state.capteur.id}
                            channelX={this.state.mapChannels.get(GraphType.TEMPERATURE)} 
                            channelY={this.state.mapChannels.get(GraphType.HUMIDITE)} 
                            channelXType={GraphType.TEMPERATURE} 
                            channelYType={GraphType.HUMIDITE}
                            currentHumidity={this.state.currentHumidity}
                            currentTemperature={this.state.currentTemperature}
                        />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan='2'>
                          <LuminosityTemperature chartWidth='100%' chartHeight='300'/>
                        </td>
                      </tr> */}
      </div>
    );

  }
}
