import * as React from 'react';
import * as $ from 'jquery';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import { GraphChannel, ICrosshairTime } from './Channel/GraphChannel';
import * as d3 from 'd3';
import { Crosshair } from './Crosshair';
// import { LuminosityTemperature } from './CrossGraph/LuminosityTemperature';
import { GraphType } from './Channel/GraphType';
import { ICapteur } from 'src/interfaces/ICapteur';
import { observe, observable } from 'mobx';
import { observer } from 'mobx-react';
import { IChannel } from 'src/interfaces/IChannel';
import * as csstips from 'csstips'; 
import { style } from 'typestyle'; 
import { ScaleTime } from 'd3';
import { MeteoBehaviour } from 'src/pages/Graph/Channel/MeteoBehaviour';
import { IHabitat } from 'src/interfaces/IHabitat';
import { SunBehaviourManager } from 'src/managers/SunBehaviourManager';
import { GraphDataManager, IMesure } from 'src/managers/GraphDataManager';
import { GraphPollutions } from 'src/pages/Graph/Pollutions/GraphPollutions';
import { IMission } from 'src/interfaces/IMission';
import { Mollier } from 'src/pages/Graph/CrossGraph/Mollier';
import { GlobalStore } from 'src/stores/GlobalStore';
// import { GraphDataManager, IMesure } from 'src/managers/GraphDataManager';

interface IProps {
    globalStore: GlobalStore;
    habitat: IHabitat;
    capteur: ICapteur;
    mission: IMission;
}

export interface IDateInterval {
    missionStartDate: Date;
    missionStopDate: Date;
    minDate: Date;
    maxDate: Date;
}

interface ICrosshair {
    verticalDisplayed: boolean;
    horizontalDisplayed: boolean;
    xPosition: number;
    yPosition: number;
}

@observer export class GraphBoard extends React.Component<IProps, {}> {

    graphDataManager: GraphDataManager = new GraphDataManager();

    @observable capteur: ICapteur = undefined;
    @observable mapChannels: Map<string, IChannel> = new Map<string, IChannel>();
    @observable channels: IChannel[] = [];
    @observable dateInterval: IDateInterval = {
        missionStartDate: new Date(),
        missionStopDate: new Date(),
        minDate: new Date(),
        maxDate: new Date()
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
    @observable currentHumidity: number = undefined;
    @observable meteoTemperature: number = undefined;
    @observable meteoHumidity: number = undefined;
    @observable meteoDirectionVent: number = undefined;
    @observable meteoVitesseVent: number = undefined;

    sunBehaviourManager: SunBehaviourManager;

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
        console.log('getDateIntervalMission ')
        console.log('this.capteur.id ' + this.capteur.id)
        this.getDateIntervalMission(this.capteur.id);
        this.updateVent();
        // CAPTEUR : {
        //   capteur_reference_id:"AEO_ZW100"
        //   coordonneePlanX:"500"
        //   coordonneePlanY:"300"
        //   coordonneePlanZ:"100"
        //   id:"1"
        //   plan_id:"1"
        // }

        observe (this.dateInterval, () => {
            
            this.updateVent();
        });
        // let graphDataManager: GraphDataManager = new GraphDataManager();
        // let habitatId = 1;
        // let dateBegin: Date = new Date(2017, 12, 20);
        // let dateEnd: Date = new Date(2017, 12, 24);
        
    }

    private updateVent = () => {

        let dateBegin = this.dateInterval.missionStartDate;
        let dateEnd = this.dateInterval.missionStopDate;
        this.graphDataManager.loadVitesseVentFromAeroc(this.props.mission.id, dateBegin, dateEnd, (mesures: IMesure[]) => {
            // console.log(mesures);
        });
        this.graphDataManager.loadDirectionVentFromAeroc(this.props.mission.id, dateBegin, dateEnd, (mesures: IMesure[]) => {
            // console.log(mesures);
        });
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

    getDateIntervalMission = (capteurId: number) => {
        if (!capteurId) {
            return Promise.resolve({ dateInterval: {startDate: undefined, stopDate: undefined} });
        }
        this.dateInterval.missionStartDate = new Date(this.props.mission.date_debut);
        this.dateInterval.missionStopDate = new Date(this.props.mission.date_fin);
        this.dateInterval.minDate = new Date(this.props.mission.date_debut);
        this.dateInterval.maxDate = new Date(this.props.mission.date_fin);
        
        this.sunBehaviourManager = new SunBehaviourManager(this.props.habitat, this.dateInterval.missionStartDate, this.dateInterval.missionStopDate)

        // Update time scale
        var domain = [this.dateInterval.missionStartDate, this.dateInterval.missionStopDate];
        var chartWidth = 1270;
        var range = [0, chartWidth];
        this.contextTimeScale = d3.scaleTime().domain(domain).range(range);
        this.domainTime = domain;
        this.timeScale = d3.scaleTime().domain(domain).range(range);

        // Redraw Globlal Axis
        this.drawDateAxis();
        return Promise.resolve({ dateInterval: {startDate: this.dateInterval.missionStartDate, stopDate: this.dateInterval.missionStopDate} });
    }

    handleChangeStartDate = (date: Date) => {
        this.dateInterval.missionStartDate = date;
    }
  
    handleChangeStopDate = (date: Date) => {
        this.dateInterval.missionStopDate = date;
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
                let date = new Date(timeMs);
                this.crosshair.verticalDisplayed = true;
                this.crosshair.xPosition = xMouse;    
                this.displayCrossHairTime = true;
                this.crossHairTime.dataTimeMs = dataTimeMs;
                this.crossHairTime.timeMs = timeMs;
                if ( this.sunBehaviourManager ) {
                    this.sunBehaviourManager.isDay(date);
                }
                this.meteoDirectionVent = this.graphDataManager.getDirectionVent(date);
                this.meteoVitesseVent = this.graphDataManager.getVitesseVent(date);
                
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

    setMeteo = (graphType: string, value: number) => {
        switch (graphType) {
            case 'temperature':
                this.meteoTemperature = value;
                break;
            case 'humidite':
                this.meteoHumidity = value;
                break;
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
    // for ( var currentMoment: moment.Moment = this.dateInterval.startDate.clone().hour(0).minute(0).second(0).millisecond(0) ;
    //     currentMoment <= this.dateInterval.stopDate ; currentMoment.add(1, 'days') ) {
    //     console.log(currentMoment.toDate());
    // }

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
                                globalStore={this.props.globalStore}
                                originGraphX={this.originGraphX} 
                                originGraphY={this.originGraphY} 
                                chartWidth={this.chartWidth} 
                                chartHeight={this.chartHeight} 
                                habitat={this.props.habitat}
                                missionId={this.props.mission.id}
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
                                sunBehaviourManager={this.sunBehaviourManager}
                                setMeteo={this.setMeteo}
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
        <div className={style(csstips.flex, csstips.vertical)}>
            <DatePicker
                selected={this.dateInterval.missionStartDate}
                onChange={this.handleChangeStartDate}
                minDate={this.dateInterval.minDate}
                maxDate={this.dateInterval.maxDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="Date de début"
            />
            <DatePicker
                selected={this.dateInterval.missionStopDate}
                onChange={this.handleChangeStopDate}
                minDate={this.dateInterval.minDate}
                maxDate={this.dateInterval.maxDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="Date de fin"
            />
            {
                this.mapChannels.has(GraphType.TEMPERATURE.svgClass) && this.mapChannels.has(GraphType.HUMIDITE.svgClass) ? 
                    <Mollier
                        missionId={this.props.mission.id}
                        chartWidth={340}
                        chartHeight={300}
                        dateInterval={this.dateInterval}
                        capteurId={this.capteur.id}
                        channelX={this.mapChannels.get(GraphType.TEMPERATURE.svgClass).id} 
                        channelY={this.mapChannels.get(GraphType.HUMIDITE.svgClass).id} 
                        channelXType={GraphType.TEMPERATURE} 
                        channelYType={GraphType.HUMIDITE}
                        currentHumidity={this.currentHumidity}
                        currentTemperature={this.currentTemperature}
                        showLegend={false}
                    /> : ''
            }
            <div className={style(csstips.width(340), csstips.vertical, csstips.height(300))}>
                <MeteoBehaviour
                    time={new Date(this.crossHairTime.timeMs)}
                    sunBehaviourManager={this.sunBehaviourManager}
                    humidite={this.meteoHumidity}
                    directionVent={this.meteoDirectionVent}
                    vitesseVent={this.meteoVitesseVent}
                    temperature={this.meteoTemperature}
                />
            </div>
            <div className={style(csstips.width(340), csstips.vertical, csstips.height(300))}>
            <div className={style(csstips.flex, csstips.fillParent)}>
                    <GraphPollutions humidity={this.currentHumidity}/>
                </div>
            </div>
          </div>
      </div>
    );
  }
}
