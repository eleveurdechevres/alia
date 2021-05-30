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
import { GlobalStore } from 'src/stores/GlobalStore';
import { ESheetType, ISheetTypes } from 'src/interfaces/ISheet';
import { CreateSheetWizzard } from './Detail/CreateSheetWizzard';

interface IProps {
    analysesWizzardShown: boolean;
    globalStore: GlobalStore;
    handleCloseDialog: () => void;
    // handleCreateAnalyse: () => void;
    handleCancel: () => void;
}

@observer export class AnalysesWizzard extends React.Component<IProps, {}> {

    @observable private createSheetWizzardVisible = false;
    @observable private currentSheetType: ESheetType = undefined;

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
                            {this.buildButton(ESheetType.MOLLIER_CHART)}
                            {this.buildButton(ESheetType.TIME_CHART)}
                        </div>
                        <div className={style(csstips.margin(10), csstips.horizontal, csstips.flex, csstips.height(200))}>
                            {this.buildButton(ESheetType.AVG_DELTA_CHART)}
                            {this.buildButton(ESheetType.CANDLE_CHART)}
                        </div>
                        <div className={style(csstips.margin(10), csstips.horizontal, csstips.flex, csstips.height(200))}>
                            {this.buildButton(ESheetType.TEXT_REPORT)}
                            {this.buildButton(ESheetType.SCATTER_PLOT)}
                        </div>
                        <div className={style(csstips.margin(10), csstips.horizontal, csstips.flex, csstips.height(200))}>
                            {this.buildButton(ESheetType.DJU_CHART)}
                            {this.buildButton(ESheetType.RADAR_CHART)}
                        </div>
                        <div className={style(csstips.margin(10), csstips.horizontal, csstips.flex, csstips.height(200))}>
                            {this.buildButton(ESheetType.TEMPERATURE_ENERGY_CHART)}
                        </div>
                    </div>
                </Dialog>
                <CreateSheetWizzard
                    globalStore={this.props.globalStore}
                    isVisible={this.createSheetWizzardVisible}
                    sheetType={this.currentSheetType}
                    handleClose={() => this.createSheetWizzardVisible = false}
                />
            </div>
        );
    }
    
    private buildButton = (sheetType: ESheetType): JSX.Element => {
        const sheetDescription = ISheetTypes.get(sheetType);
        return (
            <Button
                className={style(csstips.margin(10), csstips.flex)}
                intent={Intent.PRIMARY}
                icon={sheetDescription.icon}
                text={sheetDescription.name}
                large={true}
                alignText={Alignment.CENTER}
                onClick={() => this.createSheet(sheetType)}
                disabled={sheetDescription.disabled}
            />
        );
    }

    private createSheet = (sheetType: ESheetType) => {
        this.createSheetWizzardVisible = true;
        this.currentSheetType = sheetType;
        this.props.handleCloseDialog();
    }
}