import * as React from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
// import { ClientSearchComponent } from 'src/pages/ClientSearchComponent';
// import { HabitatSearchComponent } from 'src/pages/HabitatSearchComponent';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import { GlobalStore } from 'src/stores/GlobalStore';
import { Dialog, Button } from '@blueprintjs/core';
// import { IPlan } from 'src/interfaces/IPlan';
import { MissionSelector } from './MissionSelector';
import { IMission } from 'src/interfaces/IMission';
import { ESheetType } from 'src/interfaces/ISheet';

interface IProps {
    globalStore: GlobalStore;
    isVisible: boolean;
    sheetType: ESheetType;
    handleClose: () => void;
}

@observer export class CreateSheetWizzard extends React.Component<IProps, {}> {

    @observable private mission: IMission = undefined;

    public render() {
        return (
            <Dialog
                autoFocus={true}
                enforceFocus={true}
                usePortal={true}
                canOutsideClickClose={false}
                canEscapeKeyClose={true}
                isOpen={this.props.isVisible}
                title="Créer une analyse"
                icon="curved-range-chart"
                onClose={this.props.handleClose}
            >
                <table className={style(csstips.flex, csstips.margin(5))}>
                    <tbody>
                        <tr>
                            <td>Client :</td>
                            <td>{this.props.globalStore.client.nom}</td>
                        </tr>
                        <tr>
                            <td>Habitat :</td>
                            <td>{this.props.globalStore.habitat.adresse}</td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <MissionSelector
                                    globalStore={this.props.globalStore}
                                    mission={this.mission}
                                    handleSelectMission={(mission: IMission) => {this.mission = mission}}
                                />
                                <Button
                                    disabled={this.mission === undefined}
                                    text="Créer"
                                    icon="add"
                                    onClick={() => {
                                        this.handleCreateSheet();
                                    }}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>

                    {/* <ClientSearchComponent
                        globalStore={this.props.globalStore}
                    /> */}
                    {/* <HabitatSearchComponent
                        globalStore={this.props.globalStore}
                    /> */}

            </Dialog>
        );
    }

    private handleCreateSheet = () => {
        this.props.globalStore.createSheet(
            this.props.sheetType,
            this.mission,
            new Date(this.mission.date_debut),
            new Date(this.mission.date_fin)
        );
        this.props.handleClose();
    }
}
