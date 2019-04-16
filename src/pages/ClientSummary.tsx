import * as React from 'react';
import { IClient } from '../interfaces/IClient';
import { observer } from 'mobx-react';

// import { ClientSearchComponent } from './ClientSearchComponent';
interface IProps {
    client: IClient;
}

@observer export class ClientSummary extends React.Component<IProps, {}> {

    constructor(props: IProps) {
        super(props);
    }

    render() {
        if ( this.props.client === undefined )  {
            return (
                <div/>
            );                
        }

        return (
            <div>
                {this.props.client.nom}
            </div>
        );
    }
}
