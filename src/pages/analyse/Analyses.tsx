import * as React from 'react';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import 'react-table/react-table.css';
import 'react-datepicker/dist/react-datepicker.css';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { AnalysesWizzard } from 'src/pages/analyse/AnalysesWizzard';
import { GlobalStore } from 'src/stores/GlobalStore';
import { ISheet, ESheetType } from 'src/interfaces/ISheet';
import { MollierSheetComponent } from './SheetComponents/MollierSheetComponent';
import { LineChartSheetComponent } from './SheetComponents/LineChartSheetComponent';
import { TextReportSheetComponent } from './SheetComponents/TextReportSheetComponent';
import { AvgDeltaChartSheetComponent } from './SheetComponents/AvgDeltaChartSheetComponent';
import { DJUChartSheetComponent } from './SheetComponents/DJUChartSheetComponent';
import { TemperatureEnergyChartSheetComponent } from './SheetComponents/TemperatureEnergyChartSheetComponent';
import { ActionElementBar, IPropsActionElement } from 'src/components/ActionBar';
import { ScatterPlotSheetComponent } from './SheetComponents/ScatterPlotSheetComponent';

interface IProps {
    globalStore: GlobalStore
}

@observer export class Analyses extends React.Component<IProps, {}> {

    @observable private analysesWizzardShown: boolean;

    // https://react-table.js.org/#/story/readme
    constructor(props: IProps) {
        super(props);
    }

    public render() {
        let createAnalyseButton: IPropsActionElement = {
            id: 'createNewAnalysisButton',
            iconName: 'add',
            name: 'Créer une nouvelle analyse',
            onClick: () => { 
                this.analysesWizzardShown = true;
            }
        };
        return (
            <div>
                <AnalysesWizzard
                    analysesWizzardShown={this.analysesWizzardShown}
                    globalStore={this.props.globalStore}
                    handleCloseDialog={() => { this.analysesWizzardShown = false; }}
                    handleCancel={() => { this.analysesWizzardShown = false }}
                />
                <ActionElementBar elements={[createAnalyseButton]} />
                {
                    this.props.globalStore.sheets.map(
                        (sheet: ISheet, index: number) => {
                            switch (sheet.sheetType) {
                                case ESheetType.MOLLIER_CHART:
                                    return (
                                        <MollierSheetComponent
                                            key={'SheetComponent' + sheet.sheetName}
                                            globalStore={this.props.globalStore}
                                            sheet={sheet}
                                        />
                                    );
                                    case ESheetType.TIME_CHART:
                                    return (
                                        <LineChartSheetComponent
                                            key={'SheetComponent' + sheet.sheetName}
                                            globalStore={this.props.globalStore}
                                            sheet={sheet}
                                        />
                                    );
                                case ESheetType.AVG_DELTA_CHART:
                                    return (
                                        <AvgDeltaChartSheetComponent
                                            key={'SheetComponent' + sheet.sheetName}
                                            globalStore={this.props.globalStore}
                                            sheet={sheet}
                                        />
                                    );
                                case ESheetType.DJU_CHART:
                                    return (
                                        <DJUChartSheetComponent
                                            key={'SheetComponent' + sheet.sheetName}
                                            globalStore={this.props.globalStore}
                                            sheet={sheet}
                                        />
                                    );
                                case ESheetType.TEXT_REPORT:
                                    return (
                                        <TextReportSheetComponent
                                            key={'SheetComponent' + sheet.sheetName}
                                            globalStore={this.props.globalStore}
                                            sheet={sheet}
                                        />
                                    );
                                case ESheetType.TEMPERATURE_ENERGY_CHART:
                                    return (
                                        <TemperatureEnergyChartSheetComponent
                                            key={'SheetComponent' + sheet.sheetName}
                                            globalStore={this.props.globalStore}
                                            sheet={sheet}
                                        />
                                    );
                                case ESheetType.SCATTER_PLOT:
                                    return (
                                        <ScatterPlotSheetComponent
                                            key={'SheetComponent' + sheet.sheetName}
                                            globalStore={this.props.globalStore}
                                            sheet={sheet}
                                        />
                                    );
                                default:
                                    // return <div>{sheet}</div>;
                                    return <React.Fragment key={'SheetComponent' + sheet.sheetName}>{sheet.sheetType}</React.Fragment>;
                            }
                            return <div key="default"/>;
                        }
                    )
                }
                <div className={style(csstips.height(120))}/>
            </div>
        );
    }
}