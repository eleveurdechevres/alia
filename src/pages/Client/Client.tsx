import * as React from 'react';
import { IClient } from 'src/interfaces/IClient';
import { observer } from 'mobx-react';
// import { observable } from 'mobx';
import { ClientsTable } from 'src/pages/Client/ClientsTable';

interface IProps {
    client: IClient;
}

@observer export class Client extends React.Component<IProps, {}> {

    public constructor(props: IProps) {
        super(props);
    }

    public render() {
        return (
            <div>
                <ClientsTable
                    client={this.props.client}
                />
            </div>
        );
    }
}
