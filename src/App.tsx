import * as React from 'react';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
import '@blueprintjs/core/lib/css/blueprint.css';

import { DashBoard } from './pages/DashBoard';

import { Alignment, Navbar, Button, Intent } from '@blueprintjs/core';
import { ClientSearchComponent } from 'src/pages/ClientSearchComponent';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { IClient } from 'src/interfaces/IClient';

import './App.css';

interface IProps {

}

@observer export default class App extends React.Component<IProps> {

    @observable currentClient: IClient = undefined;

    public constructor(props: IProps) {
        super(props);
    }
  
    public render() {

        return (
            <div className={'App'}>
                <Navbar>
                    <Navbar.Group align={Alignment.LEFT} className={style(csstips.horizontallySpaced(10), csstips.horizontal, csstips.flex)}>
                        <img src="./favicon.ico" className={style({ width: 32, height: 32 })}/>
                        <Navbar.Heading>ALIA France</Navbar.Heading>
                        <Navbar.Divider />
                        <ClientSearchComponent handler={this.handlerClientSearch}/>
                    </Navbar.Group>
                    <Navbar.Group align={Alignment.RIGHT} className={style(csstips.horizontal, csstips.flex)}>
                    {this.currentClient ?
                            <div className={style(csstips.horizontal, csstips.flex)}>
                                <Navbar.Heading>{this.currentClient.adresse}</Navbar.Heading>
                                <Navbar.Divider />
                                <Navbar.Heading>{this.currentClient.email}</Navbar.Heading>
                                <Navbar.Divider />
                                <Navbar.Heading>{this.currentClient.telephone}</Navbar.Heading>
                                <Navbar.Divider />
                            </div>
                            : ''
                        }
                        <Button intent={Intent.NONE} icon="person" text="Client" onClick={() => this.handleNavigate('Client')}/>
                        <Button intent={Intent.SUCCESS} icon="home" text="Bâti" />
                        <Button icon="document" text="Files" />
                    </Navbar.Group>
                </Navbar>
                <DashBoard currentClient={this.currentClient}/>
            </div>
        );
    }
    private handleNavigate = (key: string) => {
        console.log(key)
    }

    private handlerClientSearch = (client: IClient) => {
        console.log('handlerClientSearch');
        this.currentClient = client;
    }
}
