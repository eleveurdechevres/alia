import * as React from 'react';
import { Popover, Button, Position, Menu, MenuItem } from '@blueprintjs/core';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import { TMesure } from '../../../interfaces/Types'
import { GlobalStore } from 'src/stores/GlobalStore';
import { IMission } from 'src/interfaces/IMission';
import { IChannelOfTypeFromMission } from 'src/interfaces/IChannelOfTypeFromMission';

interface IProps {
    type?: TMesure;
    mission: IMission;
    globalStore: GlobalStore;
    sensorSelected: IChannelOfTypeFromMission;
    handleSelect: (sensor: IChannelOfTypeFromMission) => void;
    filter: (sensor: IChannelOfTypeFromMission) => boolean;
}

@observer export class MultiSensorSelector extends React.Component<IProps, {}> {

    @observable listSensors: IChannelOfTypeFromMission[] = [];

    public constructor(props: IProps) {
        super(props);

        if (this.props.type) {
            this.props.globalStore.getAllChannelsOfTypeFromMission(this.props.type, this.props.mission.id).then(
                (listSensors: IChannelOfTypeFromMission[]) => {
                    this.listSensors = listSensors;
                }
            )
        }
        else {
            this.props.globalStore.getAllChannelsFromMission(this.props.mission.id).then(
                (listSensors: IChannelOfTypeFromMission[]) => {
                    this.listSensors = listSensors;
                }
            )
        }
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
                <Button text={this.buildLegend(this.props.sensorSelected)}/>
            </Popover>
        );
    }

    private buildSensorList = () => {
        return (
            <Menu>
                {this.listSensors.filter(this.props.filter).map((sensor: IChannelOfTypeFromMission) =>
                    <MenuItem
                        key={this.buildKey(sensor)}
                        text={this.buildLegend(sensor)}
                        onClick={() => {
                            this.props.handleSelect(sensor);
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
        return sensor ? sensor.capteur_reference_id + ' [plan ' + sensor.plan_id + '][channel ' + sensor.channel_id + ']' : this.props.type + '...';
    }
}