import * as React from 'react';
import { Popover, Button, Position, Menu, MenuItem } from '@blueprintjs/core';
import { observer } from 'mobx-react';
import { autorun, observable } from 'mobx';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import { TMesure } from '../../../interfaces/Types'
import { GlobalStore } from 'src/stores/GlobalStore';
import { IMission } from 'src/interfaces/IMission';
import { ICapteurVirtuelForMission } from 'src/interfaces/ICapteurVirtuelForMission';

interface IProps {
    legend?: string;
    type?: TMesure;
    mission: IMission;
    globalStore: GlobalStore;
    sensorSelected: ICapteurVirtuelForMission;
    handleSelect: (sensor: ICapteurVirtuelForMission) => void;
    filter: (sensor: ICapteurVirtuelForMission) => boolean;
}

@observer export class MultiCapteurVirtuelSelector extends React.Component<IProps, {}> {

    @observable listSensors: ICapteurVirtuelForMission[] = [];

    public constructor(props: IProps) {
        super(props);

        autorun(() => {
            this.listSensors = [];
            if (this.props.type) {
                this.props.globalStore.getAllCapteursVirtuelsOfTypeFromMission(this.props.type, this.props.mission.id).then(
                    (listSensors: ICapteurVirtuelForMission[]) => {
                        this.listSensors.push(...listSensors);
                    }
                )
            }
            else {
                this.props.globalStore.getAllCapteursVirtuelsFromMission(this.props.mission.id).then(
                    (listSensors: ICapteurVirtuelForMission[]) => {
                        this.listSensors.push(...listSensors);
                    }
                )
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

    private buildSensorList = () => {
        return (
            <Menu>
                {this.listSensors.filter(this.props.filter).map((sensor: ICapteurVirtuelForMission) =>
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

    private buildKey = (capteurVirtuel: ICapteurVirtuelForMission): string => {
        return 'Virtual_' + capteurVirtuel.id + capteurVirtuel.mission_id + capteurVirtuel.plan_id;
    }

    private buildLegend = (capteurVirtuel: ICapteurVirtuelForMission): string => {
        return capteurVirtuel ?
            '[' + capteurVirtuel.label + ']' + ' [plan ' + capteurVirtuel.plan_id + '][unit ' + capteurVirtuel.unit + ']'
            : this.props.legend ? this.props.legend + ' (' + this.props.type + ')...' : this.props.type + '...';
    }
}