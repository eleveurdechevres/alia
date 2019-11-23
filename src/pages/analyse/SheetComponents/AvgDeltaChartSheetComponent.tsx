import * as React from 'react';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import { Menu, MenuItem } from '@blueprintjs/core';
import { autorun } from 'mobx';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { GenericSheetComponent, IGenericSheetComponentProps } from './GenericSheetComponent';
import { IDateInterval } from 'src/pages/Graph/GraphBoard';
import { MultiSensorListSelector } from '../Detail/MultiSensorListSelector';
import { IChannelFromMission } from 'src/interfaces/IChannelFromMission';
import { ISerieData } from 'src/interfaces/ISerieData';
import { IMesure } from 'src/managers/GraphDataManager';
import { ISerieDef } from 'src/interfaces/ISeriesDef';
import { ICapteur } from 'src/interfaces/ICapteur';
import { IChannel } from 'src/interfaces/IChannel';
import { ITypeMesure } from 'src/interfaces/ITypeMesure';
import { IPlan } from 'src/interfaces/IPlan';
import { AvgDeltaChartComponent } from 'src/pages/Graph/BasicCharts/AvgDeltaChartComponent';

@observer export class AvgDeltaChartSheetComponent<P extends IGenericSheetComponentProps> extends GenericSheetComponent {

    @observable private selectedChannelList: IChannelFromMission[] = [];

    private mapSelectedChannelSelectedSerie: Map<IChannelFromMission, ISerieData> = new Map();
    
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
                    <AvgDeltaChartComponent
                        sheet={this.props.sheet}
                        chartWidth={this.windowWidth - 60}
                        chartHeight={500}
                        dateInterval={dateInterval}
                        series={this.selectedSeries}
                    />
                </div>
            </div>
        );
    }
    
    @observable private selectedSeries: ISerieData[] = [];

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
            capteur: undefined,
            channel: undefined,
            plan: undefined,
            typeMesure: undefined
        };
        let promiseCapteur: Promise<ICapteur> = this.props.globalStore.getCapteur(channelForMission.capteur_id, channelForMission.mission_id);
        let promiseChannel: Promise<IChannel> = this.props.globalStore.getChannel(channelForMission.channel_id, channelForMission.capteur_reference_id);
        let promiseMeasureType: Promise<ITypeMesure> = this.props.globalStore.getMesureType(channelForMission.measure_id);
        let promisePlan: Promise<IPlan> = this.props.globalStore.getPlan(channelForMission.plan_id);
        let promiseMesures: Promise<IMesure[]> = this.props.globalStore.getMesures(
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
            ]).then(([capteur, channel, typeMesure, plan, mesures]: [ICapteur, IChannel, ITypeMesure, IPlan, IMesure[]]) => {
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
                serieData.serieDef.capteur.id === serieDataToRemove.serieDef.capteur.id &&
                serieData.serieDef.channel.id === serieDataToRemove.serieDef.channel.id
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