import * as React from 'react';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import { Checkbox, NumericInput, Radio, RadioGroup } from '@blueprintjs/core';
// import { Checkbox, Menu, MenuItem, RadioGroup } from '@blueprintjs/core';
import { observer } from 'mobx-react';
import { observable, autorun } from 'mobx';
import { GenericSheetComponent, IGenericSheetComponentProps } from './GenericSheetComponent';
import { IDateInterval } from 'src/pages/Graph/GraphBoard';
import { MultiSensorSelector } from '../Detail/MultiSensorSelector';
import { IChannelOfTypeFromMission } from 'src/interfaces/IChannelOfTypeFromMission';
import { ITemperatureEnergyChannels, TemperatureEnergyChartComponent } from 'src/pages/Graph/BasicCharts/TemperatureEnergyChartComponent';
import { MultiCapteurVirtuelSelector } from '../Detail/MultiCapteurVirtuelSelector';
import { ICapteurVirtuelForMission } from 'src/interfaces/ICapteurVirtuelForMission';
import { TPeriod } from 'src/stores/GlobalStore';

@observer export class TemperatureEnergyChartSheetComponent<P extends IGenericSheetComponentProps> extends GenericSheetComponent {

    @observable private extTempChannel: IChannelOfTypeFromMission = undefined;
    @observable private intTempChannel: IChannelOfTypeFromMission = undefined;
    @observable private sensorConsommationEnergie: IChannelOfTypeFromMission = undefined;
    @observable private virtualCapteurConsommationEnergie: ICapteurVirtuelForMission = undefined;
    @observable private consommationEnergie: IChannelOfTypeFromMission | ICapteurVirtuelForMission = undefined;
    @observable private isConsommationVirtual = false;
        
    @observable private channels: ITemperatureEnergyChannels;
    @observable private period: TPeriod = 'DAY';
    @observable private surfaceM2: number = undefined;

    public constructor(props: P) {
        super(props);

        autorun(() => {
            if (this.sensorConsommationEnergie || this.virtualCapteurConsommationEnergie) {
                this.consommationEnergie = this.isConsommationVirtual ? this.virtualCapteurConsommationEnergie : this.sensorConsommationEnergie;
            }
        })
        autorun(() => {
            if (this.extTempChannel && this.intTempChannel && this.consommationEnergie && this.period && this.surfaceM2) {
                this.channels = {
                    extTempChannel: this.extTempChannel,
                    intTempChannel: this.intTempChannel,
                    consommationEnergie: this.consommationEnergie,
                    period: this.period,
                    surfaceM2: this.surfaceM2
                };
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
                    <TemperatureEnergyChartComponent
                        globalStore={this.props.globalStore}
                        sheet={this.props.sheet}
                        chartWidth={this.windowWidth - 60}
                        chartHeight={500}
                        dateInterval={dateInterval}
                        channels={this.channels}
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
                    <MultiSensorSelector
                        legend="Choix sensor température intérieure"
                        globalStore={this.props.globalStore}
                        type={'Température'}
                        mission={this.props.sheet.sheetDef.mission}
                        sensorSelected={this.intTempChannel}
                        handleSelect={(sensor: IChannelOfTypeFromMission) => {
                            this.intTempChannel = sensor;
                        }}
                        filter={() => true}
                    />
                    <Checkbox
                        label="Virtual sensor"
                        checked={this.isConsommationVirtual}
                        onChange={() => {
                            this.isConsommationVirtual = !this.isConsommationVirtual;
                        }}
                    />
                    {
                        this.isConsommationVirtual ? 
                            <MultiCapteurVirtuelSelector
                                legend="Choix sensor énergie"
                                globalStore={this.props.globalStore}
                                type={'Consommation électrique'}
                                mission={this.props.sheet.sheetDef.mission}
                                sensorSelected={this.virtualCapteurConsommationEnergie}
                                handleSelect={(sensor: ICapteurVirtuelForMission) => {
                                    this.virtualCapteurConsommationEnergie = sensor;
                                }}
                                filter={() => true}
                            />
                            :
                            <MultiSensorSelector
                                legend="Choix sensor énergie"
                                globalStore={this.props.globalStore}
                                type={'Consommation électrique'}
                                mission={this.props.sheet.sheetDef.mission}
                                sensorSelected={this.sensorConsommationEnergie}
                                handleSelect={(sensor: IChannelOfTypeFromMission) => {
                                    this.sensorConsommationEnergie = sensor;
                                }}
                                filter={() => true}
                            />
                    }
                    <RadioGroup
                        // label="Period"
                        onChange={this.handlePeriodChange}
                        selectedValue={this.period}
                    >
                        <Radio label="Day" value="DAY" />
                        <Radio label="Month" value="MONTH" />
                        <Radio label="Year" value="YEAR" />
                    </RadioGroup>
                    <NumericInput
                        onValueChange={this.handleSurfaceChange}
                        value={this.surfaceM2}
                        
                    />
                </div>
            </div>
        );
    }
    private handlePeriodChange = (event: React.FormEvent<HTMLElement>) => {
        this.period = (event.target as HTMLInputElement).value as TPeriod;
    }

    private handleSurfaceChange = (value: number) => {
        this.surfaceM2 = value;
    }

    // protected buildSettingsMenu = () => {
    //     return (
    //         <Menu>
    //             <MenuItem text="item1"/>
    //             <MenuItem text="item2"/>
    //         </Menu>
    //     );
    // }

}