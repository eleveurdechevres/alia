import * as React from 'react';
import { IClient } from '../interfaces/IClient';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

// import { ClientSearchComponent } from './ClientSearchComponent';
interface IProps {
    client: IClient;
}

@observer export class ClientSummary extends React.Component<IProps, {}> {

    @observable private currentClient: IClient;

    constructor(props: IProps) {
        super(props);
        this.currentClient = props.client;
    }

    componentWillReceiveProps(nextProps: IProps) {
        // console.log("componentWillReceiveProps");
        // console.log(nextProps);
        // console.log("===========================");
        if ( nextProps !== this.props ) {
            this.currentClient = nextProps.client;
        }
    }

    render() {
        if ( this.currentClient === undefined )  {
            return (
                <div/>
            );                
        }

        return (
            <div>
                {this.currentClient.nom}
            </div>
        );
    }
}
