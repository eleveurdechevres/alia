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
            </div>
        );
    }
}