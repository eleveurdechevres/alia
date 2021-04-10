import * as React from 'react';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import { Menu, MenuItem } from '@blueprintjs/core';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { GenericSheetComponent, IGenericSheetComponentProps } from './GenericSheetComponent';
import { IDateInterval } from 'src/pages/Graph/GraphBoard';
import { MultiSensorSelector } from '../Detail/MultiSensorSelector';
import { IChannelOfTypeFromMission } from 'src/interfaces/IChannelOfTypeFromMission';
import { DJUChartComponent } from 'src/pages/Graph/BasicCharts/DJUChartComponent';

@observer export class DJUChartSheetComponent<P extends IGenericSheetComponentProps> extends GenericSheetComponent {

    @observable private extTempChannel: IChannelOfTypeFromMission = undefined;
    
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
                    <DJUChartComponent
                        sheet={this.props.sheet}
                        chartWidth={this.windowWidth - 60}
                        chartHeight={500}
                        dateInterval={dateInterval}
                        extTempChannel={this.extTempChannel}
                    />
                </div>
            </div>
        );
    }

    protected buildConfigBar = () => {
        return (
            <div className={style(csstips.horizontal, csstips.gridSpaced(10))}>
                <div className={style(csstips.horizontal, csstips.horizontallySpaced(10), {alignItems: 'center'})}>
                    <MultiSensorSelector
                        legend="Choix sensor température extérieure"
                        globalStore={this.props.globalStore}
                        type={'Température'}
                        mission={this.props.sheet.sheetDef.mission}
                        sensorSelected={this.extTempChannel}
                        handleSelect={(sensor: IChannelOfTypeFromMission) => {
                            this.extTempChannel = sensor;
                        }}
                        filter={() => true}
                    />
                </div>
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