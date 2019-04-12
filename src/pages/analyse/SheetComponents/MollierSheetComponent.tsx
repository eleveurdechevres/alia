import * as React from 'react';
import { ESheetType } from 'src/interfaces/ISheet';
// import { style } from 'typestyle';
// import * as csstips from 'csstips';
import { Menu, Intent, Popover, Position, IconName, MenuItem } from '@blueprintjs/core';
// import { Mollier } from '../Graph/CrossGraph/Mollier';
// import { IDateInterval } from '../Graph/GraphBoard';
import { MultiSensorSelector } from '../Detail/MultiSensorSelector';
import { IChannelOfTypeFromMission } from 'src/interfaces/IChannelOfTypeFromMission';
import { GenericSheetComponent, IGenericSheetComponentProps } from './GenericSheetComponent';
// import { TMesure } from 'src/interfaces/Types';

export class MollierSheetComponent<P extends IGenericSheetComponentProps> extends GenericSheetComponent {

    public constructor(props: P) {
        super(props);
    }

    protected buildChart = () => {
        // let dateInterval: IDateInterval = {
        //     minDate: this.props.sheet.sheetDef.dateDebut,
        //     startDate: this.props.sheet.sheetDef.dateDebut,
        //     maxDate: this.props.sheet.sheetDef.dateFin,
        //     stopDate: this.props.sheet.sheetDef.dateFin
        // }
        return (
            <div/>
        );
    }

    protected buildConfigBar = () => {
        return (
            <div>
                <MultiSensorSelector
                    globalStore={this.props.globalStore}
                    type="Température"
                    mission={this.props.sheet.sheetDef.mission}
                    handleSelect={(sensor: IChannelOfTypeFromMission) => {
                        console.log(sensor);
                    }}
                />
                <MultiSensorSelector
                    globalStore={this.props.globalStore}
                    type="Humidité"
                    mission={this.props.sheet.sheetDef.mission}
                    handleSelect={(sensor: IChannelOfTypeFromMission) => {
                        console.log(sensor);
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