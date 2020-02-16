import * as React from 'react';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import { Menu, MenuItem, Icon } from '@blueprintjs/core';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { GenericSheetComponent, IGenericSheetComponentProps } from './GenericSheetComponent';
import { IDateInterval } from 'src/pages/Graph/GraphBoard';
import { MultiSensorSelector } from '../Detail/MultiSensorSelector';
import { AvgDeltaChartComponent } from 'src/pages/Graph/BasicCharts/AvgDeltaChartComponent';
import { IChannelOfTypeFromMission } from 'src/interfaces/IChannelOfTypeFromMission';
import { TypeOfMeasureSelector } from '../Detail/TypeOfMeasureSelector';
import { TMesure } from 'src/interfaces/Types';

@observer export class AvgDeltaChartSheetComponent<P extends IGenericSheetComponentProps> extends GenericSheetComponent {

    // @observable private selectedSeries: ISerieData[] = [];
    @observable private typeOfMeasure: TMesure = undefined;

    @observable private firstChannel: IChannelOfTypeFromMission = undefined;
    @observable private secondChannel: IChannelOfTypeFromMission = undefined;

    public constructor(props: P) {
        super(props);

        // autorun(() => {
        //     if (this.firstChannel && this.secondChannel) {
        //         console.log('autorun ', JSON.stringify(this.firstChannel), JSON.stringify(this.secondChannel));
        //     }
        //     // TODO : updateSerieData
        // })
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
                        firstChannel={this.firstChannel}
                        secondChannel={this.secondChannel}
                    />
                </div>
            </div>
        );
    }
    
    // private addChannel = (channelForMission: IChannelFromMission) => {

    //     if (!this.selectedChannelList.includes(channelForMission)) {
    //         this.selectedChannelList.push(channelForMission);
    //     }

    //     let serieData: ISerieData = {
    //         points: undefined,
    //         serieDef: undefined,
    //         timeEnd: undefined,
    //         timeStart: undefined,
    //         yMax: undefined,
    //         yMin: undefined
    //     };
    //     let serieDef: ISerieDef = {
    //         capteur: undefined,
    //         channel: undefined,
    //         plan: undefined,
    //         typeMesure: undefined
    //     };
    //     let promiseCapteur: Promise<ICapteur> = this.props.globalStore.getCapteur(channelForMission.capteur_id, channelForMission.mission_id);
    //     let promiseChannel: Promise<IChannel> = this.props.globalStore.getChannel(channelForMission.channel_id, channelForMission.capteur_reference_id);
    //     let promiseMeasureType: Promise<ITypeMesure> = this.props.globalStore.getMesureType(channelForMission.measure_id);
    //     let promisePlan: Promise<IPlan> = this.props.globalStore.getPlan(channelForMission.plan_id);
    //     let promiseMesures: Promise<IMesure[]> = this.props.globalStore.getMesures(
    //         channelForMission.capteur_id,
    //         channelForMission.channel_id,
    //         this.props.sheet.sheetDef.dateDebutMission,
    //         this.props.sheet.sheetDef.dateFinMission
    //     );

    //     Promise.all( [
    //             promiseCapteur,
    //             promiseChannel,
    //             promiseMeasureType,
    //             promisePlan,
    //             promiseMesures
    //         ]).then(([capteur, channel, typeMesure, plan, mesures]: [ICapteur, IChannel, ITypeMesure, IPlan, IMesure[]]) => {
    //             serieDef.capteur = capteur;    
    //             serieDef.channel = channel[0];
    //             serieDef.typeMesure = typeMesure[0];
    //             serieDef.plan = plan[0];
    //             serieData = {
    //                 serieDef: serieDef,
    //                 points: [],
    //                 timeStart: this.props.sheet.sheetDef.dateDebutMission,
    //                 timeEnd: this.props.sheet.sheetDef.dateFinMission,
    //                 yMax: Number.NEGATIVE_INFINITY,
    //                 yMin: Number.POSITIVE_INFINITY
    //             };
    //             mesures.forEach((mesure: IMesure) => {
    //                 serieData.points.push(mesure);
    //                 serieData.yMax = Math.max(serieData.yMax, mesure.valeur);
    //                 serieData.yMin = Math.min(serieData.yMin, mesure.valeur);
    //             });
    //             this.selectedSeries.push(serieData);
                
    //             this.mapSelectedChannelSelectedSerie.set(channelForMission, serieData);
    //             this.forceUpdate();
    //         }
    //     );
    // }

    // private removeChannel = (channelForMission: IChannelFromMission) => {
    //     let indexChannelForMission = this.selectedChannelList.findIndex(
    //         (channel: IChannelFromMission) =>
    //             channel.capteur_id === channelForMission.capteur_id &&
    //             channel.channel_id === channelForMission.channel_id &&
    //             channel.mission_id === channelForMission.mission_id &&
    //             channel.plan_id === channelForMission.plan_id
    //     );

    //     if (indexChannelForMission !== undefined) {
    //         this.selectedChannelList.splice(indexChannelForMission, 1);
    //     }
    //     let serieDataToRemove = this.mapSelectedChannelSelectedSerie.get(channelForMission);

    //     // Supprimer les courbes (selectedSeries)
    //     let indexSerieData = this.selectedSeries.findIndex(
    //         (serieData: ISerieData) => 
    //             serieData.serieDef.capteur.id === serieDataToRemove.serieDef.capteur.id &&
    //             serieData.serieDef.channel.id === serieDataToRemove.serieDef.channel.id
    //     );
    //     if (indexSerieData !== undefined && indexSerieData >= 0) {
    //         this.selectedSeries.splice(indexSerieData, 1);
    //     }
    //     this.forceUpdate();
    // }

    protected buildConfigBar = () => {
        return (
            <div className={style(csstips.horizontal, csstips.gridSpaced(10))}>
                <TypeOfMeasureSelector
                    globalStore={this.props.globalStore}
                    typeOfMeasure={this.typeOfMeasure}
                    handleSelectTypeOfMeasure={(typeOfMeasure: TMesure) => {
                        if (this.typeOfMeasure !== typeOfMeasure) {
                            this.typeOfMeasure = typeOfMeasure
                            this.firstChannel = undefined;
                            this.secondChannel = undefined;
                        }
                    }}
                />
                { this.typeOfMeasure ? 
                    <div className={style(csstips.horizontal, csstips.horizontallySpaced(10), {alignItems: 'center'})}>
                        <MultiSensorSelector
                            legend="Capteur 1"
                            globalStore={this.props.globalStore}
                            type={this.typeOfMeasure}
                            mission={this.props.sheet.sheetDef.mission}
                            sensorSelected={this.firstChannel}
                            handleSelect={(sensor: IChannelOfTypeFromMission) => {
                                this.firstChannel = sensor;
                            }}
                            filter={() => true}
                        />
                        <Icon icon="small-minus"/>
                        <MultiSensorSelector
                            legend="Capteur 2"
                            globalStore={this.props.globalStore}
                            type={this.typeOfMeasure}
                            mission={this.props.sheet.sheetDef.mission}
                            sensorSelected={this.secondChannel}
                            handleSelect={(sensor: IChannelOfTypeFromMission) => {
                                this.secondChannel = sensor;
                            }}
                            filter={() => true}
                        />
                    </div> : ''
                }
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