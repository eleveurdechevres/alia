import * as React from 'react';
// import { render } from "react-dom";

// Import React Table
import 'react-table/react-table.css';
import 'react-datepicker/dist/react-datepicker.css';
import { observer } from 'mobx-react';
import { Dialog, Button, Intent, Alignment } from '@blueprintjs/core';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
// import { Mollier } from 'src/pages/Graph/CrossGraph/Mollier';
import { RadarChartWizzard } from 'src/pages/analyse/Detail/RadarChartWizzard';
import { GlobalStore } from 'src/stores/GlobalStore';

interface IProps {
    analysesWizzardShown: boolean;
    globalStore: GlobalStore;
    handleCreateAnalyse: () => void;
    handleCancel: () => void;
}

@observer export class AnalysesWizzard extends React.Component<IProps, {}> {

    // https://react-table.js.org/#/story/readme
    constructor(props: IProps) {
        super(props);
    }

    render() {
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
                                disabled={true}
                            />
                        </div>
                        <div className={style(csstips.margin(10), csstips.horizontal, csstips.flex, csstips.height(200))}>
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.PRIMARY}
                                icon="alignment-horizontal-center"
                                text="Candles"
                                large={true}
                                onClick={this.createCandles}
                                disabled={true}
                            />
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.PRIMARY}
                                icon="manually-entered-data"
                                text="Rapport"
                                large={true}
                                onClick={this.createRapport}
                                disabled={true}
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
                                disabled={true}
                            />
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.PRIMARY}
                                icon="layout-auto"
                                text="Radar"
                                large={true}
                                onClick={this.createRadar}
                                disabled={true}
                            />
                        </div>
                        <div className={style(csstips.margin(10), csstips.horizontal, csstips.flex, csstips.height(200))}>
                            <RadarChartWizzard
                                globalStore={this.props.globalStore}
                            />
                        </div>
                    </div>
                </Dialog>
                {/* <MollierChartWizzard/>
                <LineChartWizzard/>
                <CandleChartWizzard/>
                <RapportWizzard/>
                <ScatterPlotWizzard/> */}
            </div>
        );
    }

    private createMollier = () => {
        this.props.handleCreateAnalyse();
    }

    private createTimeChart = () => {
        this.props.handleCreateAnalyse();
    }

    private createCandles = () => {
        this.props.handleCreateAnalyse();
    }

    private createRapport = () => {
        this.props.handleCreateAnalyse();
    }

    private createScatterPlot = () => {
        this.props.handleCreateAnalyse();
    }

    private createRadar = () => {
        this.props.handleCreateAnalyse();
    }
}