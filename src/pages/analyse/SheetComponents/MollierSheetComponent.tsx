import * as React from 'react';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import { Menu, MenuItem } from '@blueprintjs/core';
import { observable, autorun } from 'mobx';
import { observer } from 'mobx-react';
// import { Mollier } from '../Graph/CrossGraph/Mollier';
// import { IDateInterval } from '../Graph/GraphBoard';
import { MultiSensorSelector } from '../Detail/MultiSensorSelector';
import { IChannelOfTypeFromMission } from 'src/interfaces/IChannelOfTypeFromMission';
import { GenericSheetComponent, IGenericSheetComponentProps } from './GenericSheetComponent';
import { IDateInterval } from 'src/pages/Graph/GraphBoard';
import { Mollier } from 'src/pages/Graph/CrossGraph/Mollier';
import { GraphType } from '../../Graph/Channel/GraphType';
import { TimeContextBar } from '../Detail/TimeContextBar';

@observer export class MollierSheetComponent<P extends IGenericSheetComponentProps> extends GenericSheetComponent {

    @observable private humiditySensor: IChannelOfTypeFromMission;
    @observable private temperatureSensor: IChannelOfTypeFromMission;

    public constructor(props: P) {
        super(props);

        autorun(() => {
            if (this.temperatureSensor) {
                this.humiditySensor = undefined;
            }
        })

        autorun(() => {
            if (this.humiditySensor) {
                this.forceUpdate();
            }
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
                    {
                        this.temperatureSensor && this.humiditySensor ?
                            <Mollier
                                missionId={this.props.sheet.sheetDef.mission.id}
                                chartWidth={this.windowWidth - 60}
                                chartHeight={800}
                                dateInterval={dateInterval}
                                capteurId={this.temperatureSensor.capteur_id}
                                channelX={this.temperatureSensor.channel_id} 
                                channelY={this.humiditySensor.channel_id} 
                                channelXType={GraphType.TEMPERATURE} 
                                channelYType={GraphType.HUMIDITE}
                                currentHumidity={undefined}
                                currentTemperature={undefined}
                                showLegend={true}
                            /> : ''
                    }
                </div>
                <div>
                    <TimeContextBar
                        width={this.windowWidth - 60}
                        height={50}
                        minDate={this.minDate}
                        maxDate={this.maxDate}
                        handleChangeTimeInterval={(date1: Date, date2: Date) => {
                            this.minDate = date1;
                            this.maxDate = date2;
                        }}
                    />
                </div>
            </div>
        );
    }

    protected buildConfigBar = () => {
        return (
            <div className={style(csstips.gridSpaced(10))}>
                <MultiSensorSelector
                    globalStore={this.props.globalStore}
                    type="Température"
                    mission={this.props.sheet.sheetDef.mission}
                    sensorSelected={this.temperatureSensor}
                    handleSelect={(sensor: IChannelOfTypeFromMission) => {
                        this.temperatureSensor = sensor;
                    }}
                    filter={() => true}
                />
                {
                    this.temperatureSensor ?
                        <MultiSensorSelector
                            globalStore={this.props.globalStore}
                            type="Humidité"
                            mission={this.props.sheet.sheetDef.mission}
                            sensorSelected={this.humiditySensor}
                            handleSelect={(sensor: IChannelOfTypeFromMission) => {
                                this.humiditySensor = sensor;
                            }}
                            filter={(sensor: IChannelOfTypeFromMission) => this.temperatureSensor.capteur_id === sensor.capteur_id}
                        /> : ''
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