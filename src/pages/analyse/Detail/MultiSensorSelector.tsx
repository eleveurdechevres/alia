import * as React from 'react';
import { Popover, Button, Position, Menu, MenuItem } from '@blueprintjs/core';
import { observer } from 'mobx-react';
import { autorun, observable } from 'mobx';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import { TMesure } from '../../../interfaces/Types'
import { GlobalStore } from 'src/stores/GlobalStore';
import { IMission } from 'src/interfaces/IMission';
import { IChannelOfTypeFromMission } from 'src/interfaces/IChannelOfTypeFromMission';
import { IChannelFromMission } from 'src/interfaces/IChannelFromMission';
import { IChannel } from 'src/interfaces/IChannel';

interface IProps {
    legend?: string;
    type?: TMesure;
    mission: IMission;
    globalStore: GlobalStore;
    sensorSelected: IChannelOfTypeFromMission;
    handleSelect: (sensor: IChannelOfTypeFromMission, channel: IChannel) => void;
    filter: (sensor: IChannelOfTypeFromMission) => boolean;
}

@observer export class MultiSensorSelector extends React.Component<IProps, {}> {

    @observable listSensors: IChannelOfTypeFromMission[] = [];
    @observable mapSensorTypes: Map<IChannelOfTypeFromMission, IChannel> = new Map();

    public constructor(props: IProps) {
        super(props);

        autorun(() => {
            this.listSensors = [];
            if (this.props.type) {
                this.props.globalStore.getAllChannelsOfTypeFromMission(this.props.type, this.props.mission.id).then(
                    (listSensors: IChannelOfTypeFromMission[]) => {
                        this.listSensors.push(...listSensors);
                    }
                );
                // this.updateMapTypeMesures();
            }
            else {
                this.props.globalStore.getAllChannelsFromMission(this.props.mission.id).then(
                    (listSensors: IChannelFromMission[]) => {
                        listSensors.forEach((sensor: IChannelFromMission) => {
                            this.listSensors.push({
                                _objId: 'IChannelOfTypeFromMission',
                                capteur_id: sensor.capteur_id,
                                capteur_reference_id: sensor.capteur_reference_id,
                                channel_id: sensor.channel_id,
                                mission_id: sensor.mission_id,
                                plan_id: sensor.plan_id
                            });
                        });
                        this.updateMapTypeMesures();
                    }
                );
            }
        });
    }

    public render() {
        return (
            <Popover
                className={style(csstips.fillParent)}
                canEscapeKeyClose={true}
                content={this.buildSensorList()}
                minimal={true}
                position={Position.BOTTOM_LEFT}
            >
                <Button
                    className={style(csstips.width(300))}
                    rightIcon="caret-down"
                    text={this.buildLegend(this.props.sensorSelected)}
                />
            </Popover>
        );
    }

    private updateMapTypeMesures = () => {
        this.listSensors.forEach((sensor: IChannelOfTypeFromMission, index: number) => {
            this.props.globalStore.getChannel(sensor.channel_id, sensor.capteur_reference_id).then(
                (channel: IChannel) => {
                    this.mapSensorTypes.set(sensor, channel);
                }
            );
        });
    }

    private buildSensorList = () => {
        return (
            <Menu>
                {this.listSensors.filter(this.props.filter).map((sensor: IChannelOfTypeFromMission) =>
                    <MenuItem
                        key={this.buildKey(sensor)}
                        text={this.buildLegend(sensor)}
                        onClick={() => {
                            this.props.handleSelect(sensor, this.mapSensorTypes.get(sensor));
                        }}
                    />
                )}
            </Menu>
        );
    }

    private buildKey = (sensor: IChannelOfTypeFromMission): string => {
        return sensor.capteur_id + sensor.capteur_reference_id + sensor.channel_id + sensor.mission_id + sensor.plan_id;
    }

    private buildLegend = (sensor: IChannelOfTypeFromMission): string => {
        if (sensor) {
            let channel: IChannel = this.mapSensorTypes.get(sensor);
                // console.log(JSON.stringify(channel))
            let channelDescription = channel ? `(${channel.measure_type})` : '';
            // console.log(channel ? channel.measure_type : '-');
            return sensor.capteur_reference_id + ' [plan ' + sensor.plan_id + '][channel ' + sensor.channel_id + '] ' + channelDescription;
        }
        return this.props.legend ? this.props.legend + ' (' + this.props.type + ')...' : this.props.type + '...';
    }
}