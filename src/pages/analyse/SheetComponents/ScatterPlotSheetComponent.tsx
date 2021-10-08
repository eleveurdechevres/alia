import * as React from 'react';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import { Menu, MenuItem } from '@blueprintjs/core';
import { observable, autorun } from 'mobx';
import { observer } from 'mobx-react';
import { MultiSensorSelector } from '../Detail/MultiSensorSelector';
import { IChannelOfTypeFromMission } from 'src/interfaces/IChannelOfTypeFromMission';
import { GenericSheetComponent, IGenericSheetComponentProps } from './GenericSheetComponent';
import { IDateInterval } from 'src/pages/Graph/GraphBoard';
import { TimeContextBar } from '../Detail/TimeContextBar';
import { ScatterPlotComponent } from 'src/pages/Graph/CrossGraph/ScatterPlotComponent';
import { IChannel } from 'src/interfaces/IChannel';

@observer export class ScatterPlotSheetComponent<P extends IGenericSheetComponentProps> extends GenericSheetComponent {

    @observable private sensorX: IChannelOfTypeFromMission;
    @observable private sensorY: IChannelOfTypeFromMission;
    @observable private channelX: IChannel;
    @observable private channelY: IChannel;

    public constructor(props: P) {
        super(props);

        autorun(() => {
            if (this.sensorX || this.sensorY) {
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
                        this.sensorX && this.sensorY ?
                            <ScatterPlotComponent
                                globalStore={this.props.globalStore}
                                missionId={this.props.sheet.sheetDef.mission.id}
                                chartWidth={this.windowWidth - 60}
                                chartHeight={800}
                                dateInterval={dateInterval}
                                capteurX={this.sensorX}
                                capteurY={this.sensorY}
                                channelX={this.channelX}
                                channelY={this.channelY}
                                crosshairX={undefined}
                                crosshairY={undefined}
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
                    legend="Ordonnées"
                    mission={this.props.sheet.sheetDef.mission}
                    sensorSelected={this.sensorY}
                    handleSelect={(sensor: IChannelOfTypeFromMission, channel: IChannel) => {
                        this.sensorY = sensor;
                        this.channelY = channel;
                    }}
                    filter={(sensor: IChannelOfTypeFromMission) => true}
                />
                &nbsp;= f(
                <MultiSensorSelector
                    globalStore={this.props.globalStore}
                    legend="Abscisses"
                    mission={this.props.sheet.sheetDef.mission}
                    sensorSelected={this.sensorX}
                    handleSelect={(sensor: IChannelOfTypeFromMission, channel: IChannel) => {
                        this.sensorX = sensor;
                        this.channelX = channel;
                    }}
                    filter={(sensor: IChannelOfTypeFromMission) => true}
                />
                )
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