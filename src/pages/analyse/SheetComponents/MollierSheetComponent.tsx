import * as React from 'react';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import { Menu, MenuItem } from '@blueprintjs/core';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
// import { Mollier } from '../Graph/CrossGraph/Mollier';
// import { IDateInterval } from '../Graph/GraphBoard';
import { MultiSensorSelector } from '../Detail/MultiSensorSelector';
import { IChannelOfTypeFromMission } from 'src/interfaces/IChannelOfTypeFromMission';
import { GenericSheetComponent, IGenericSheetComponentProps } from './GenericSheetComponent';
import { IDateInterval } from 'src/pages/Graph/GraphBoard';
import { Mollier } from 'src/pages/Graph/CrossGraph/Mollier';
import { GraphType } from '../../Graph/Channel/GraphType';

@observer export class MollierSheetComponent<P extends IGenericSheetComponentProps> extends GenericSheetComponent {

    @observable private humiditySensor: IChannelOfTypeFromMission = undefined;
    @observable private temperatureSensor: IChannelOfTypeFromMission = undefined;

    public constructor(props: P) {
        super(props);
    }

    protected buildChart = () => {
        let dateInterval: IDateInterval = {
            minDate: this.props.sheet.sheetDef.dateDebut,
            startDate: this.props.sheet.sheetDef.dateDebut,
            maxDate: this.props.sheet.sheetDef.dateFin,
            stopDate: this.props.sheet.sheetDef.dateFin
        }
        return (
            <div>
                {
                    this.temperatureSensor && this.humiditySensor ?
                        <Mollier
                            chartWidth={this.windowWidth - 100}
                            chartHeight={800}
                            dateInterval={dateInterval}
                            capteurId={this.temperatureSensor.capteur_id}
                            channelX={this.temperatureSensor.channel_id} 
                            channelY={this.humiditySensor.channel_id} 
                            channelXType={GraphType.TEMPERATURE} 
                            channelYType={GraphType.HUMIDITE}
                            currentHumidity={undefined}
                            currentTemperature={undefined}
                        /> : ''
                    }
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
                    handleSelect={(sensor: IChannelOfTypeFromMission) => {
                        this.temperatureSensor = sensor;
                    }}
                />
                <MultiSensorSelector
                    globalStore={this.props.globalStore}
                    type="Humidité"
                    mission={this.props.sheet.sheetDef.mission}
                    handleSelect={(sensor: IChannelOfTypeFromMission) => {
                        this.humiditySensor = sensor;
                    }}
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