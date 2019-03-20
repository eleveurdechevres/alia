import * as React from 'react';
// import { render } from "react-dom";

// Import React Table
import 'react-table/react-table.css';
import 'react-datepicker/dist/react-datepicker.css';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { Dialog, Button, Intent, Alignment } from '@blueprintjs/core';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
// import { Mollier } from 'src/pages/Graph/CrossGraph/Mollier';
import { RadarChartWizzard } from 'src/pages/analyse/Detail/RadarChartWizzard';
import { GlobalStore } from 'src/stores/GlobalStore';
import { MollierChartWizzard } from './Detail/MollierChartWizzard';
import { LineChartWizzard } from './Detail/LineChartWizzard';
import { CandleChartWizzard } from './Detail/CandleChartWizzard';
import { RapportWizzard } from './Detail/RapportWizzard';
import { ScatterPlotWizzard } from './Detail/ScatterPlotWizzard';

interface IProps {
    analysesWizzardShown: boolean;
    globalStore: GlobalStore;
    handleCloseDialog: () => void;
    // handleCreateAnalyse: () => void;
    handleCancel: () => void;
}

@observer export class AnalysesWizzard extends React.Component<IProps, {}> {

    @observable private mollierWizzardVisible = false;
    @observable private timeChartWizzardVisible = false;
    @observable private candleChartWizzardVisible = false;
    @observable private rapportWizzardVisible = false;
    @observable private scatterPlotWizzardVisible = false;
    @observable private radarChartWizzardVisible = false;

    // https://react-table.js.org/#/story/readme
    public constructor(props: IProps) {
        super(props);
    }

    public render() {
        return (
            <div>
                <Dialog
                    autoFocus={true}
                    enforceFocus={true}
                    usePortal={true}
                    canOutsideClickClose={false}
                    canEscapeKeyClose={true}
                    isOpen={this.props.analysesWizzardShown}
                    title="Créer une analyse"
                    icon="series-add"
                    onClose={this.props.handleCancel}
                >
                    <div className={style(csstips.flex, csstips.vertical)}>
                        <div className={style(csstips.margin(10), csstips.flex)}>
                            Sélectionnez le type d'analyse
                        </div>
                        <div className={style(csstips.margin(10), csstips.horizontal, csstips.flex, csstips.height(200))}>
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.PRIMARY}
                                icon="curved-range-chart"
                                text="Mollier"
                                large={true}
                                alignText={Alignment.CENTER}
                                onClick={this.createMollier}
                                disabled={false}
                            />
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.PRIMARY}
                                icon="timeline-line-chart"
                                text="y=f(t)"
                                large={true}
                                onClick={this.createTimeChart}
                                disabled={false}
                            />
                        </div>
                        <div className={style(csstips.margin(10), csstips.horizontal, csstips.flex, csstips.height(200))}>
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.PRIMARY}
                                icon="alignment-horizontal-center"
                                text="Candles"
                                large={true}
                                onClick={this.createCandleChart}
                                disabled={false}
                            />
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.PRIMARY}
                                icon="manually-entered-data"
                                text="Rapport"
                                large={true}
                                onClick={this.createRapport}
                                disabled={false}
                            />
                        </div>
                        <div className={style(csstips.margin(10), csstips.horizontal, csstips.flex, csstips.height(200))}>
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.PRIMARY}
                                icon="scatter-plot"
                                text="y=f(x)"
                                large={true}
                                onClick={this.createScatterPlot}
                                disabled={false}
                            />
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.PRIMARY}
                                icon="layout-auto"
                                text="Radar"
                                large={true}
                                onClick={this.createRadarChart}
                                disabled={false}
                            />
                        </div>
                    </div>
                </Dialog>
                <MollierChartWizzard
                    globalStore={this.props.globalStore}
                    isVisible={this.mollierWizzardVisible}
                    handleCancel={() => this.mollierWizzardVisible = false}
                />
                <LineChartWizzard
                    globalStore={this.props.globalStore}
                    isVisible={this.timeChartWizzardVisible}
                    handleCancel={() => this.timeChartWizzardVisible = false}
                />
                <CandleChartWizzard
                    globalStore={this.props.globalStore}
                    isVisible={this.candleChartWizzardVisible}
                    handleCancel={() => this.candleChartWizzardVisible = false}
                />
                <RapportWizzard
                    globalStore={this.props.globalStore}
                    isVisible={this.rapportWizzardVisible}
                    handleCancel={() => this.rapportWizzardVisible = false}
                />
                <ScatterPlotWizzard
                    globalStore={this.props.globalStore}
                    isVisible={this.scatterPlotWizzardVisible}
                    handleCancel={() => this.scatterPlotWizzardVisible = false}
                />
                <RadarChartWizzard
                    globalStore={this.props.globalStore}
                    isVisible={this.radarChartWizzardVisible}
                    handleCancel={() => this.radarChartWizzardVisible = false}
                />
            </div>
        );
    }
    
    private createMollier = () => {
        this.mollierWizzardVisible = true;
        this.props.handleCloseDialog();
    }

    private createTimeChart = () => {
        this.timeChartWizzardVisible = true;
        this.props.handleCloseDialog();
    }

    private createCandleChart = () => {
        this.candleChartWizzardVisible = true;
        this.props.handleCloseDialog();
    }

    private createRapport = () => {
        this.rapportWizzardVisible = true;
        this.props.handleCloseDialog();
    }

    private createScatterPlot = () => {
        this.scatterPlotWizzardVisible = true;
        this.props.handleCloseDialog();
    }

    private createRadarChart = () => {
        this.radarChartWizzardVisible = true;
        this.props.handleCloseDialog();
    }
}