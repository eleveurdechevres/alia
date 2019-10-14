import * as React from 'react';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import { Menu, MenuItem } from '@blueprintjs/core';
import { autorun } from 'mobx';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { GenericSheetComponent, IGenericSheetComponentProps } from './GenericSheetComponent';
import { IDateInterval } from 'src/pages/Graph/GraphBoard';
// import { MultiSensorListSelector } from '../Detail/MultiSensorListSelector';
import { IChannelFromMission } from 'src/interfaces/IChannelFromMission';
import { ICapteur } from 'src/interfaces/ICapteur';
// import { ISerieData } from 'src/interfaces/ISerieData';
// import { IMesure } from 'src/managers/GraphDataManager';
// import { ISerieDef } from 'src/interfaces/ISeriesDef';
// import { ICapteur } from 'src/interfaces/ICapteur';
// import { IChannel } from 'src/interfaces/IChannel';
// import { ITypeMesure } from 'src/interfaces/ITypeMesure';
// import { IPlan } from 'src/interfaces/IPlan';

interface ICapteurDescription {
    capteur: ICapteur,
    channels: IChannelFromMission[]
}

@observer export class TextReportSheetComponent<P extends IGenericSheetComponentProps> extends GenericSheetComponent {

    @observable private channelList: IChannelFromMission[] = [];
    @observable private channelStats: Map<IChannelFromMission, number> = new Map();
    @observable private capteurDescriptionList: Map<number, ICapteurDescription> = new Map();
    // private mapSelectedChannelSelectedSerie: Map<IChannelFromMission, ISerieData> = new Map();
    
    public constructor(props: P) {
        super(props);

        this.loadData();
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
        console.log(dateInterval)
        return (
            <div>
                <h1>Résumé</h1>
                <h2>Client</h2>
                <ul>
                    <li>Nom : {this.props.sheet.sheetDef.client.nom}</li>
                    <li>Adresse : {this.props.sheet.sheetDef.client.adresse}</li>
                    <li>email : {this.props.sheet.sheetDef.client.email}</li>
                    <li>Téléphone : {this.props.sheet.sheetDef.client.telephone}</li>
                </ul>
                <h2>Habitat</h2>
                <ul>
                    <li>Adresse : {this.props.sheet.sheetDef.habitat.adresse}</li>
                    <li>longitude : {this.props.sheet.sheetDef.habitat.gps_longitude}</li>
                    <li>latitude : {this.props.sheet.sheetDef.habitat.gps_latitude}</li>
                    <li>elevation : {this.props.sheet.sheetDef.habitat.gps_elevation}</li>
                </ul>
                <h2>Mission</h2>
                <ul>
                    {
                        this.buildCapteursDescription()
                        // this.channelList.map((channel: IChannelFromMission, index: number) => {
                        //     console.log(index)
                        //     return (
                        //         <li key={index}>
                        //             {
                        //                 channel.capteur_reference_id + '[' + channel.capteur_id + '] (' + channel.measure_type + ') : ' + this.getNbEnregistrements(channel) 
                        //             }
                        //         </li>
                        //     );
                        // })
                    }
                </ul>
                <h1>Statistiques</h1>
                <h1>Données</h1>
            </div>
        );
    }
    
    private buildCapteursDescription() {
        // this.capteurDescriptionList.forEach((value: IChannelFromMission[], key: number) => {

        // })
        return ''
    }
    // private getNbEnregistrements(channel: IChannelFromMission) {
    //     let nbEnregistrements = this.channelStats.get(channel);
    //     return nbEnregistrements !== undefined ? nbEnregistrements + ' enregistrements' : '-'
    // }
    // @observable private selectedSeries: ISerieData[] = [];

    private loadData() {

        // let serieData: ISerieData = {
        //     points: undefined,
        //     serieDef: undefined,
        //     timeEnd: undefined,
        //     timeStart: undefined,
        //     yMax: undefined,
        //     yMin: undefined
        // };
        // let serieDef: ISerieDef = {
        //     capteur: undefined,
        //     channel: undefined,
        //     plan: undefined,
        //     typeMesure: undefined
        // };
        let promiseChannelsForMission: Promise<IChannelFromMission[]> = this.props.globalStore.getAllChannelsFromMission(this.props.sheet.sheetDef.mission.id);
        // let promiseCapteur: Promise<ICapteur> = this.props.globalStore.getCapteur(channelForMission.capteur_id, channelForMission.mission_id);
        // let promiseChannel: Promise<IChannel> = this.props.globalStore.getChannel(channelForMission.channel_id, channelForMission.capteur_reference_id);
        // let promiseMeasureType: Promise<ITypeMesure> = this.props.globalStore.getMesureType(channelForMission.measure_id);
        // let promisePlan: Promise<IPlan> = this.props.globalStore.getPlan(channelForMission.plan_id);
        // let promiseMesures: Promise<IMesure[]> = this.props.globalStore.getMesures(
        //     channelForMission.capteur_id,
        //     channelForMission.channel_id,
        //     this.props.sheet.sheetDef.dateDebutMission,
        //     this.props.sheet.sheetDef.dateFinMission
        // );

        promiseChannelsForMission.then((channelsForMission: IChannelFromMission[]) => {
            this.channelList = channelsForMission;
            this.channelList.forEach((channel: IChannelFromMission) => {
                this.props.globalStore.getCountMesuresForChannelMission(this.props.sheet.sheetDef.mission.id, channel.capteur_id, channel.channel_id).then(
                    (count: number) => {
                        this.channelStats.set(channel, count);
                    }
                )
                if (!this.capteurDescriptionList.has(channel.capteur_id)) {
                    let capteur: ICapteur;
                    this.props.globalStore.getCapteur(channel.capteur_id, this.props.sheet.sheetDef.mission.id).then((val: ICapteur) => {
                        capteur = val;
                    });
                    let capteurDescription: ICapteurDescription = {
                        capteur: capteur,
                        channels: []
                    }
                    this.capteurDescriptionList.set(channel.capteur_id, capteurDescription);
                }
                this.capteurDescriptionList.get(channel.capteur_id).channels.push(channel);
            });
            console.log(JSON.stringify(this.capteurDescriptionList))
        })
        // Promise.all( [
        //         promiseCapteur,
        //         promiseChannel,
        //         promiseMeasureType,
        //         promisePlan,
        //         promiseMesures
        //     ]).then(([capteur, channel, typeMesure, plan, mesures]: [ICapteur, IChannel, ITypeMesure, IPlan, IMesure[]]) => {
        //         serieDef.capteur = capteur[0];    
        //         serieDef.channel = channel[0];
        //         serieDef.typeMesure = typeMesure[0];
        //         serieDef.plan = plan[0];
        //         serieData = {
        //             serieDef: serieDef,
        //             points: [],
        //             timeStart: this.props.sheet.sheetDef.dateDebutMission,
        //             timeEnd: this.props.sheet.sheetDef.dateFinMission,
        //             yMax: Number.NEGATIVE_INFINITY,
        //             yMin: Number.POSITIVE_INFINITY
        //         };
        //         mesures.forEach((mesure: IMesure) => {
        //             serieData.points.push(mesure);
        //             serieData.yMax = Math.max(serieData.yMax, mesure.valeur);
        //             serieData.yMin = Math.min(serieData.yMin, mesure.valeur);
        //         });
        //         this.selectedSeries.push(serieData);
                
        //         this.mapSelectedChannelSelectedSerie.set(channelForMission, serieData);
        //         this.forceUpdate();
        //     }
        // );
    }

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
            <div className={style(csstips.gridSpaced(10))}>
                {/* <MultiSensorListSelector
                    mission={this.props.sheet.sheetDef.mission}
                    globalStore={this.props.globalStore}
                    selectedChannelList={this.selectedChannelList}
                    handleAddChannel={this.addChannel}
                    handleRemoveChannel={this.removeChannel}
                /> */}
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