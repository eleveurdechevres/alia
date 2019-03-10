import * as React from 'react';
// import { render } from "react-dom";

// Import React Table
import 'react-table/react-table.css';
import 'react-datepicker/dist/react-datepicker.css';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { NewElementButton } from 'src/components/NewElementButton';
import { IClient } from 'src/interfaces/IClient';
import { IHabitat } from 'src/interfaces/IHabitat';
import { Dialog, Button, Intent, Alignment } from '@blueprintjs/core';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';

interface IProps {
    client: IClient;
    habitat: IHabitat;
}

@observer export class Analyses extends React.Component<IProps, {}> {

    @observable private dialogCreateAnalyseShown: boolean;

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
                    canOutsideClickClose={true}
                    canEscapeKeyClose={true}
                    isOpen={this.dialogCreateAnalyseShown}
                    title="Créer une analyse"
                    icon="series-add"
                    onClose={() => { this.dialogCreateAnalyseShown = false; }}
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
                    </div>
                </Dialog>
                <NewElementButton
                    name="Créer une nouvelle analyse"
                    onClick={() => { 
                        this.dialogCreateAnalyseShown = true;
                    }}
                />
            </div>
        );
    }

    private createMollier = () => {
        this.dialogCreateAnalyseShown = false;
    }

    private createTimeChart = () => {
        this.dialogCreateAnalyseShown = false;
    }

    private createCandles = () => {
        this.dialogCreateAnalyseShown = false;
    }

    private createRapport = () => {
        this.dialogCreateAnalyseShown = false;
    }

    private createScatterPlot = () => {
        this.dialogCreateAnalyseShown = false;
    }

    private createRadar = () => {
        this.dialogCreateAnalyseShown = false;
    }
}