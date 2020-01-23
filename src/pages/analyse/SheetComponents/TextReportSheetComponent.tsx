import * as React from 'react';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import { Menu, MenuItem, Spinner } from '@blueprintjs/core';
import { observable, observe } from 'mobx';
import { observer } from 'mobx-react';
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
// import { Map, Marker, Popup, TileLayer } from 'react-leaflet'

// const position = [51.505, -0.09]

interface IChannelDescription extends IChannelFromMission {
    count: number
}
interface ICapteurDescription {
    capteur: ICapteur,
    channels: IChannelDescription[]
}

@observer export class TextReportSheetComponent<P extends IGenericSheetComponentProps> extends GenericSheetComponent {

    @observable private channelList: IChannelFromMission[] = [];
    @observable private capteurIdList: Set<number> = new Set();
    // @observable private channelStats: Map<IChannelFromMission, number> = new Map();
    @observable private capteurDescriptionList: ICapteurDescription[] = [];
    // private capteurDescriptionMap: Map<number, ICapteurDescription> = new Map();
    // private mapSelectedChannelSelectedSerie: Map<IChannelFromMission, ISerieData> = new Map();
    
    public constructor(props: P) {
        super(props);

        this.loadData();
        observe(this.capteurDescriptionList, () => {
            this.forceUpdate()
        });
        // autorun(() => {
        //     console.log(this.capteurDescriptionList.length)
        //     // if (this.temperatureSensor) {
        //     //     this.humiditySensor = undefined;
        //     // }
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
                {/* <Map center={position} zoom={13}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                    />
                    <Marker position={position}>
                    <Popup>A pretty CSS3 popup.<br />Easily customizable.</Popup>
                    </Marker>
                </Map> */}
                <h2>Mission</h2>
                <ul>
                    <li>Début : {dateInterval.missionStartDate.toLocaleDateString()}</li>
                    <li>Fin : {dateInterval.missionStopDate.toLocaleDateString()}</li>
                    <li>Capteurs : {this.buildCapteurList()}</li>
                </ul>
                <h1>Statistiques</h1>
                <h1>Données</h1>
            </div>
        );
    }
    
    private buildCapteurList(): JSX.Element {
        // console.log(JSON.stringify(this.capteurDescriptionList))
        let jsxCapteurList: JSX.Element[] = [];
        // console.log('buildCapteurList ' + this.capteurDescriptionList.length)
        this.capteurDescriptionList.forEach((capteurDescription: ICapteurDescription, index: number) => {
            jsxCapteurList.push(
                <li key={index}>
                    {capteurDescription.capteur.capteur_reference_id}
                    <table className={style(csstips.border('1px solid gray'))}>
                        <thead className={style({backgroundColor: 'lightgray'})}>
                            <tr>
                                <th colSpan={1} rowSpan={2} align={'center'}>Channel</th>
                                <th colSpan={3} align={'center'}>Range</th>
                                <th colSpan={1} rowSpan={2} align={'center'}>Mesures</th>
                            </tr>
                            <tr>
                                <th colSpan={1} align={'center'}>Min</th>
                                <th colSpan={1} align={'center'}>Max</th>
                                <th colSpan={1} align={'center'}>Step</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.buildChannelList(capteurDescription.channels)}                            
                        </tbody>
                    </table>
                    
                    
                </li>
            );
        });
        return (
            <ul>{jsxCapteurList.length > 0 ? jsxCapteurList : <Spinner/>}</ul>
        );
    }

    private buildChannelList(channels: IChannelDescription[]): JSX.Element[] {
        let jsxChannelList: JSX.Element[] = [];
        channels.forEach((channel: IChannelDescription, index: number) => {
            let minRange: string;
            let maxRange: string;
            let stepRange: string;
            if (channel.unit !== 'boolean') {
                minRange = channel.min_range ? channel.min_range.toString() + ' ' + channel.unit : '-';
                maxRange = channel.max_range ? channel.max_range.toString() + ' ' + channel.unit : '-';
            } else {
                minRange = 'False';
                maxRange = 'True';
            }
            stepRange = channel.precision_step ? channel.precision_step.toString() + ' ' + channel.unit : '-';
            jsxChannelList.push(
                <tr key={index}>
                    <td>{channel.measure_type}</td>
                    <td>{minRange}</td>
                    <td>{maxRange}</td>
                    <td>{stepRange}</td>
                    <td>{channel.count}</td>
                </tr>
            );
        });
        return jsxChannelList;
    }

    // private getNbEnregistrements(channel: IChannelFromMission) {
    //     let nbEnregistrements = this.channelStats.get(channel);
    //     return nbEnregistrements !== undefined ? nbEnregistrements + ' enregistrements' : '-'
    // }
    // @observable private selectedSeries: ISerieData[] = [];

    private async loadData() {

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

        await promiseChannelsForMission.then((channelsForMission: IChannelFromMission[]) => {
            this.channelList = channelsForMission;
            this.channelList.forEach((channel: IChannelFromMission) => {
                this.capteurIdList.add(channel.capteur_id);
            });
        })

        this.capteurIdList.forEach(async (capteurId: number) => {
            let capteurChannels: IChannelFromMission[] = this.channelList.filter((channel: IChannelFromMission) => channel.capteur_id === capteurId)
            let promiseCapteur: Promise<ICapteur> = this.props.globalStore.getCapteur(capteurId, this.props.sheet.sheetDef.mission.id);
            await promiseCapteur.then((capteur: ICapteur) => {

                let promisesCount: Promise<number>[] = [];
                capteurChannels.forEach((channel: IChannelFromMission) => {
                    promisesCount.push(this.props.globalStore.getCountMesuresForChannelMission(this.props.sheet.sheetDef.mission.id, channel.capteur_id, channel.channel_id));
                });
                Promise.all(promisesCount).then((counts: number[]) => {
                    let capteurChannelsWithCount: IChannelDescription[] = [];
                    capteurChannels.forEach((channel: IChannelFromMission, index: number) => {
                        let channelDescription: IChannelDescription = {
                            count: counts[index],
                            ...channel
                        }
                        capteurChannelsWithCount.push(channelDescription);
                    });
                    let capteurDescription: ICapteurDescription = {
                        capteur: capteur,
                        channels: capteurChannelsWithCount
                    };
                    this.capteurDescriptionList.push(capteurDescription);
                });
                // this.capteurDescriptionList = [...this.capteurDescriptionList, capteurDescription];
            });
            // let promiseChannelMesuresCount = this.props.globalStore.getCountMesuresForChannelMission(this.props.sheet.sheetDef.mission.id, channel.capteur_id, channel.channel_id);
        });
        // console.log(JSON.stringify(this.capteurDescriptionList))

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