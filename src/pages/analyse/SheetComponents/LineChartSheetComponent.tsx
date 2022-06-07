import * as React from 'react';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import { Menu, MenuItem } from '@blueprintjs/core';
import { autorun } from 'mobx';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { GenericSheetComponent, IGenericSheetComponentProps } from './GenericSheetComponent';
import { IDateInterval } from 'src/pages/Graph/GraphBoard';
import { LineChartComponent } from 'src/pages/Graph/BasicCharts/LineChartComponent';
import { MultiSensorListSelector } from '../Detail/MultiSensorListSelector';
import { IChannelFromMission } from 'src/interfaces/IChannelFromMission';
import { ISerieData } from 'src/interfaces/ISerieData';
import { IMesure } from 'src/managers/GraphDataManager';
import { ISerieDef, ISerieVirtuelleDef } from 'src/interfaces/ISeriesDef';
import { ICapteurForPlan } from 'src/interfaces/ICapteurForPlan';
import { IChannel } from 'src/interfaces/IChannel';
import { ITypeMesure } from 'src/interfaces/ITypeMesure';
import { IPlan } from 'src/interfaces/IPlan';
import { MultiCapteurVirtuelListSelector } from '../Detail/MultiCapteurVirtuelListSelector';
import { ICapteurVirtuelForMission } from 'src/interfaces/ICapteurVirtuelForMission';
import * as d3 from 'd3';
import { ScaleOrdinal } from 'd3';

@observer export class LineChartSheetComponent<P extends IGenericSheetComponentProps> extends GenericSheetComponent {

    @observable private selectedChannelList: IChannelFromMission[] = [];
    @observable private selectedCapteurVirtuelList: ICapteurVirtuelForMission[] = [];
    private zColors: ScaleOrdinal<string, string> = d3.scaleOrdinal(d3.schemeCategory10);
    private mapSelectedChannelSelectedSerie: Map<IChannelFromMission, ISerieData> = new Map();
    private mapSelectedCapteurVirtuelSelectedSerie: Map<ICapteurVirtuelForMission, ISerieData> = new Map();

    public constructor(props: P) {
        super(props);

        autorun(() => {
            // if (this.temperatureSensor) {
            //     this.humiditySensor = undefined;
            // }
        })
    }

    protected buildChart = () => {
        let dateInterval: IDateInterval = {
            missionStartDate: this.props.sheet.sheetDef.dateDebutMission,
            missionStopDate: this.props.sheet.sheetDef.dateFinMission,
            minDate: this.minDate,
            maxDate: this.maxDate
        }

        return (
            <div>
                <div>
                    <LineChartComponent
                        sheet={this.props.sheet}
                        chartHeight={500}
                        dateInterval={dateInterval}
                        series={this.selectedSeries}
                        chartWidth={this.windowWidth - 60}
                    />
                </div>
            </div>
        );
    }
    
    @observable private selectedSeries: ISerieData[] = [];

    private legendColorGenerator = (legend: string) => {
        return this.zColors(legend)
    }

    private addChannel = (channelForMission: IChannelFromMission) => {

        if (!this.selectedChannelList.includes(channelForMission)) {
            this.selectedChannelList.push(channelForMission);
        }

        let serieData: ISerieData = {
            points: undefined,
            serieDef: undefined,
            timeEnd: undefined,
            timeStart: undefined,
            yMax: undefined,
            yMin: undefined
        };
        let serieDef: ISerieDef = {
            _objId: 'ISerieDef',
            capteur: undefined,
            channel: undefined,
            plan: undefined,
            typeMesure: undefined
        };
        let promiseCapteur: Promise<ICapteurForPlan> = this.props.globalStore.getCapteur(channelForMission.capteur_id, channelForMission.mission_id);
        let promiseChannel: Promise<IChannel> = this.props.globalStore.getChannel(channelForMission.channel_id, channelForMission.capteur_reference_id);
        let promiseMeasureType: Promise<ITypeMesure> = this.props.globalStore.getMesureType(channelForMission.measure_id);
        let promisePlan: Promise<IPlan> = this.props.globalStore.getPlan(channelForMission.plan_id);
        let promiseMesures: Promise<IMesure[]> = this.props.globalStore.getMesures(
            channelForMission.mission_id,
            channelForMission.capteur_id,
            channelForMission.channel_id,
            this.props.sheet.sheetDef.dateDebutMission,
            this.props.sheet.sheetDef.dateFinMission
        );

        Promise.all( [
                promiseCapteur,
                promiseChannel,
                promiseMeasureType,
                promisePlan,
                promiseMesures
            ]).then(([capteur, channel, typeMesure, plan, mesures]: [ICapteurForPlan, IChannel, ITypeMesure, IPlan, IMesure[]]) => {
                serieDef.capteur = capteur;    
                serieDef.channel = channel[0];
                serieDef.typeMesure = typeMesure[0];
                serieDef.plan = plan[0];
                serieData = {
                    serieDef: serieDef,
                    points: [],
                    timeStart: this.props.sheet.sheetDef.dateDebutMission,
                    timeEnd: this.props.sheet.sheetDef.dateFinMission,
                    yMax: Number.NEGATIVE_INFINITY,
                    yMin: Number.POSITIVE_INFINITY
                };
                mesures.forEach((mesure: IMesure) => {
                    serieData.points.push(mesure);
                    serieData.yMax = Math.max(serieData.yMax, mesure.valeur);
                    serieData.yMin = Math.min(serieData.yMin, mesure.valeur);
                });
                this.selectedSeries.push(serieData);
                
                this.mapSelectedChannelSelectedSerie.set(channelForMission, serieData);
                this.forceUpdate();
            }
        );
    }

    private addCapteurVirtuel = (capteurVirtuelForMission: ICapteurVirtuelForMission) => {

        if (!this.selectedCapteurVirtuelList.includes(capteurVirtuelForMission)) {
            this.selectedCapteurVirtuelList.push(capteurVirtuelForMission);
        }

        let serieData: ISerieData = {
            points: undefined,
            serieDef: undefined,
            timeEnd: undefined,
            timeStart: undefined,
            yMax: undefined,
            yMin: undefined
        };
        let serieDefVirtuelle: ISerieVirtuelleDef = {
            _objId: 'ISerieVirtuelleDef',
            capteurVirtuel: undefined,
            plan: undefined,
            typeMesure: undefined,
        };
        let promiseMeasureType: Promise<ITypeMesure> = this.props.globalStore.getMesureType(capteurVirtuelForMission.type_mesure);
        let promisePlan: Promise<IPlan> = this.props.globalStore.getPlan(capteurVirtuelForMission.plan_id);
        let promiseMesures: Promise<IMesure[]> = this.props.globalStore.getMesuresViruelles(
            this.props.sheet.sheetDef.mission.id,
            capteurVirtuelForMission.id,
            this.props.sheet.sheetDef.dateDebutMission,
            this.props.sheet.sheetDef.dateFinMission
        );

        Promise.all( [
                promiseMeasureType,
                promisePlan,
                promiseMesures
            ]).then(([typeMesure, plan, mesures]: [ITypeMesure, IPlan, IMesure[]]) => {
                serieDefVirtuelle.capteurVirtuel = capteurVirtuelForMission;    
                serieDefVirtuelle.typeMesure = typeMesure[0];
                serieDefVirtuelle.plan = plan[0];
                serieData = {
                    serieDef: serieDefVirtuelle,
                    points: [],
                    timeStart: this.props.sheet.sheetDef.dateDebutMission,
                    timeEnd: this.props.sheet.sheetDef.dateFinMission,
                    yMax: Number.NEGATIVE_INFINITY,
                    yMin: Number.POSITIVE_INFINITY
                };
                mesures.forEach((mesure: IMesure) => {
                    serieData.points.push(mesure);
                    serieData.yMax = Math.max(serieData.yMax, mesure.valeur);
                    serieData.yMin = Math.min(serieData.yMin, mesure.valeur);
                });
                this.selectedSeries.push(serieData);
                this.mapSelectedCapteurVirtuelSelectedSerie.set(capteurVirtuelForMission, serieData);
                this.forceUpdate();
            }
        );
    }

    private removeChannel = (channelForMission: IChannelFromMission) => {
        let indexChannelForMission = this.selectedChannelList.findIndex(
            (channel: IChannelFromMission) =>
                channel.capteur_id === channelForMission.capteur_id &&
                channel.channel_id === channelForMission.channel_id &&
                channel.mission_id === channelForMission.mission_id &&
                channel.plan_id === channelForMission.plan_id
        );

        if (indexChannelForMission !== undefined) {
            this.selectedChannelList.splice(indexChannelForMission, 1);
        }
        let serieDataToRemove = this.mapSelectedChannelSelectedSerie.get(channelForMission);

        // Supprimer les courbes (selectedSeries)
        let indexSerieData = this.selectedSeries.findIndex(
            (serieData: ISerieData) => 
                serieData.serieDef._objId === 'ISerieDef' && serieDataToRemove.serieDef._objId === 'ISerieDef' &&
                serieData.serieDef.capteur.id === serieDataToRemove.serieDef.capteur.id &&
                serieData.serieDef.channel.id === serieDataToRemove.serieDef.channel.id
        );
        if (indexSerieData !== undefined && indexSerieData >= 0) {
            this.selectedSeries.splice(indexSerieData, 1);
        }
        this.forceUpdate();
    }

    private removeCapteurVirtuel = (capteurVirtuel: ICapteurVirtuelForMission) => {
        let index = this.selectedCapteurVirtuelList.findIndex(
            (c: ICapteurVirtuelForMission) =>
                c.id === capteurVirtuel.id
        );

        if (index !== undefined) {
            this.selectedCapteurVirtuelList.splice(index, 1);
        }
        let serieDataToRemove = this.mapSelectedCapteurVirtuelSelectedSerie.get(capteurVirtuel);

        // Supprimer les courbes (selectedSeries)
        let indexSerieData = this.selectedSeries.findIndex(
            (serieData: ISerieData) => 
                serieData.serieDef._objId === 'ISerieVirtuelleDef' && serieDataToRemove.serieDef._objId === 'ISerieVirtuelleDef' &&
                serieData.serieDef.capteurVirtuel.id === serieDataToRemove.serieDef.capteurVirtuel.id
        );
        if (indexSerieData !== undefined && indexSerieData >= 0) {
            this.selectedSeries.splice(indexSerieData, 1);
        }
        this.forceUpdate();
    }

    protected buildConfigBar = () => {
        return (
            <div className={style(csstips.gridSpaced(10))}>
                <MultiSensorListSelector
                    mission={this.props.sheet.sheetDef.mission}
                    globalStore={this.props.globalStore}
                    selectedChannelList={this.selectedChannelList}
                    handleAddChannel={this.addChannel}
                    handleRemoveChannel={this.removeChannel}
                    legendColorgenerator={this.legendColorGenerator}
                />
                <MultiCapteurVirtuelListSelector
                    mission={this.props.sheet.sheetDef.mission}
                    globalStore={this.props.globalStore}
                    selectedCapteurVirtuelList={this.selectedCapteurVirtuelList}
                    handleAddCapteurVirtuel={this.addCapteurVirtuel}
                    handleRemoveCapteurVirtuel={this.removeCapteurVirtuel}
                    legendColorgenerator={this.legendColorGenerator}
                />
            </div>
        );
    }

    protected buildSettingsMenu = () => {
        return (
            <Menu>
                <MenuItem text="item1"/>
                <MenuItem text="item2"/>
            </Menu>
        );
    }

}