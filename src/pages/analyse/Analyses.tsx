import * as React from 'react';
// import { render } from "react-dom";

// Import React Table
import 'react-table/react-table.css';
import 'react-datepicker/dist/react-datepicker.css';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { NewElementButton } from 'src/components/NewElementButton';
import { AnalysesWizzard } from 'src/pages/analyse/AnalysesWizzard';
import { GlobalStore } from 'src/stores/GlobalStore';
import { ISheet, ESheetType } from 'src/interfaces/ISheet';
import { MollierSheetComponent } from './SheetComponents/MollierSheetComponent';

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
        return (
            <div>
                <AnalysesWizzard
                    analysesWizzardShown={this.analysesWizzardShown}
                    globalStore={this.props.globalStore}
                    handleCloseDialog={() => { this.analysesWizzardShown = false; }}
                    handleCancel={() => { this.analysesWizzardShown = false }}
                />
                <NewElementButton
                    name="Créer une nouvelle analyse"
                    onClick={() => { 
                        this.analysesWizzardShown = true;
                    }}
                />
                {
                    this.props.globalStore.sheets.map(
                        (sheet: ISheet) => {
                            switch (sheet.sheetType) {
                                case ESheetType.MOLLIER_CHART:
                                    return (
                                        <MollierSheetComponent
                                            key={'SheetComponent' + sheet.sheetName}
                                            globalStore={this.props.globalStore}
                                            sheet={sheet}
                                        />
                                    );
                                default:
                                    return <div>{sheet}</div>;
                            }
                            return <div key="default"/>;
                        }
                    )
                }
            </div>
        );
    }
}