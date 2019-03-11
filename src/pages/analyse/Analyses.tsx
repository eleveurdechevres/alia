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
import { AnalysesWizzard } from 'src/pages/analyse/AnalysesWizzard';

interface IProps {
    client: IClient;
    habitat: IHabitat;
}

@observer export class Analyses extends React.Component<IProps, {}> {

    @observable private analysesWizzardShown: boolean;

    // https://react-table.js.org/#/story/readme
    constructor(props: IProps) {
        super(props);
    }

    render() {
        return (
            <div>
                <AnalysesWizzard
                    analysesWizzardShown={this.analysesWizzardShown}
                    client={this.props.client}
                    habitat={this.props.habitat}
                    handleCreateAnalyse={() => { console.log('handleCreateAnalyse') }}
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