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
import { ISerieDef } from 'src/interfaces/ISeriesDef';
import { ICapteur } from 'src/interfaces/ICapteur';
import { IChannel } from 'src/interfaces/IChannel';
import { ITypeMesure } from 'src/interfaces/ITypeMesure';

@observer export class LineChartSheetComponent<P extends IGenericSheetComponentProps> extends GenericSheetComponent {

    @observable private selectedChannelList: IChannelFromMission[] = [];

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
                        chartWidth={this.windowWidth - 60}
                        chartHeight={800}
                        dateInterval={dateInterval}
                        series={this.selectedSeries}
                    />
                </div>
            </div>
        );
    }
    
    private selectedSeries: ISerieData[] = [];

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
        this.props.globalStore.getCapteur(channelForMission.capteur_id, channelForMission.mission_id)
        .then(
            (capteur: ICapteur) => {
                serieDef.capteur = capteur;
                this.props.globalStore.getChannel(channelForMission.channel_id, channelForMission.capteur_reference_id)
                .then((channel: IChannel) => {
                    serieDef.channel = channel;
                })
                .then(() => {
                    this.props.globalStore.getMesureType(channelForMission.measure_id)
                    .then((typeMesure: ITypeMesure) => {
                        serieDef.typeMesure = typeMesure;
                    });
                });
            }
        )
        .then(
            () => {
                serieData = {
                    serieDef: serieDef,
                    points: [],
                    timeStart: this.props.sheet.sheetDef.dateDebutMission,
                    timeEnd: this.props.sheet.sheetDef.dateFinMission,
                    yMax: Number.NEGATIVE_INFINITY,
                    yMin: Number.POSITIVE_INFINITY
                };
                this.props.globalStore.getMesures(
                    channelForMission.capteur_id,
                    channelForMission.channel_id,
                    this.props.sheet.sheetDef.dateDebutMission,
                    this.props.sheet.sheetDef.dateFinMission
                ).then((mesures: IMesure[]) => {
                    mesures.forEach((mesure: IMesure) => {
                        serieData.points.push(mesure);
                        serieData.yMax = Math.max(serieData.yMax, mesure.valeur);
                        serieData.yMin = Math.max(serieData.yMin, mesure.valeur);
                    });
                    this.selectedSeries.push(serieData);
                    console.log(serieData);
                })
            }
        )

    }

    private removeChannel = (channelForMission: IChannelFromMission) => {
        let index = this.selectedChannelList.findIndex(
            (channel: IChannelFromMission) =>
                channel.capteur_id === channelForMission.capteur_id &&
                channel.channel_id === channelForMission.channel_id &&
                channel.mission_id === channelForMission.mission_id &&
                channel.plan_id === channelForMission.plan_id
            );
        if (index !== undefined) {
            this.selectedChannelList.splice(index, 1);
        }
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