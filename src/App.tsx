import * as React from 'react';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
import '@blueprintjs/core/lib/css/blueprint.css';

import { DashBoard } from './pages/DashBoard';

import { Alignment, Navbar, NavbarHeading, NavbarDivider, NavbarGroup } from '@blueprintjs/core';
import { ClientSearchComponent } from 'src/pages/ClientSearchComponent';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { IClient } from 'src/interfaces/IClient';

import './App.css';
import { NavBarButton } from 'src/NavBarButtons';
import { DebugPage } from 'src/DebugPage';
import { Client } from 'src/pages/Client/Client';

interface IProps {

}

export const enum NavBarTabEnum {
    CLIENT = 'Client',
    MISSIONS = 'Missions',
    ANALYSES = 'Analyses',
    DEBUG = 'Debug',
}

@observer export default class App extends React.Component<IProps> {

    @observable currentClient: IClient = undefined;
    @observable private selectedTab: NavBarTabEnum = NavBarTabEnum.CLIENT;

    public constructor(props: IProps) {
        super(props);
    }
  
    public render() {

        let mainContent = undefined;

        switch ( this.selectedTab ) {
            case NavBarTabEnum.CLIENT:
                mainContent = <Client client={this.currentClient}/>;
                break;
            case NavBarTabEnum.MISSIONS:
                mainContent = <DashBoard currentClient={this.currentClient}/>
                break;
            case NavBarTabEnum.ANALYSES:
                mainContent = <div>Analyses</div>;
                break;
            case NavBarTabEnum.DEBUG:
                mainContent = <DebugPage/>;
                break;
            default:
                break;
        }
        let mainBoard = <div id="content" className={style(csstips.fillParent, csstips.height('100%'))}>{mainContent}</div>
    
        return (
            <div className={style(csstips.fillParent)}>
                <div className={style(csstips.flex)}>
                <Navbar>
                    <NavbarGroup align={Alignment.LEFT} className={style(csstips.horizontallySpaced(10), csstips.horizontal, csstips.flex)}>
                        <img src="./favicon.ico" className={style({ width: 32, height: 32 })}/>
                        <NavbarHeading>ALIA France</NavbarHeading>
                        <NavbarDivider />
                        <ClientSearchComponent handler={this.handlerClientSearch}/>
                    </NavbarGroup>
                    <NavbarGroup align={Alignment.RIGHT} className={style(csstips.horizontal, csstips.flex)}>
                        {
                            this.currentClient ?
                                <div className={style(csstips.horizontal, csstips.flex)}>
                                    <NavbarHeading>{this.currentClient.adresse}</NavbarHeading>
                                    <NavbarDivider />
                                    <NavbarHeading>{this.currentClient.email}</NavbarHeading>
                                    <NavbarDivider />
                                    <NavbarHeading>{this.currentClient.telephone}</NavbarHeading>
                                    <NavbarDivider />
                                </div>
                            : ''
                        }
                        <NavBarButton
                            icon="person"
                            tabEnum={NavBarTabEnum.CLIENT}
                            selectedTab={this.selectedTab}
                            onClick={this.handleGotoClient}
                        />
                        <NavBarButton
                            icon="home"
                            tabEnum={NavBarTabEnum.MISSIONS}
                            selectedTab={this.selectedTab}
                            onClick={this.handleGotoMissions}
                        />
                        <NavBarButton
                            icon="timeline-line-chart"
                            tabEnum={NavBarTabEnum.ANALYSES}
                            selectedTab={this.selectedTab}
                            onClick={this.handleGotoAnalyses}
                        />
                        <NavBarButton
                            icon="lightbulb"
                            tabEnum={NavBarTabEnum.DEBUG}
                            selectedTab={this.selectedTab}
                            onClick={this.handleGotoDebug}
                        />
                    </NavbarGroup>
                </Navbar>
                </div>
                {mainBoard}
            </div>
        );
    }
    private handlerClientSearch = (client: IClient) => {
        console.log('handlerClientSearch');
        this.currentClient = client;
    }

    private handleGotoClient = () => {
        this.selectedTab = NavBarTabEnum.CLIENT;
    }

    private handleGotoMissions = () => {
        this.selectedTab = NavBarTabEnum.MISSIONS;
        console.log('missions')
    }

    private handleGotoAnalyses = () => {
        this.selectedTab = NavBarTabEnum.ANALYSES;
    }

    private handleGotoDebug = () => {
        this.selectedTab = NavBarTabEnum.DEBUG;
    }
}
