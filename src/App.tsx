import * as React from 'react';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
import '@blueprintjs/core/lib/css/blueprint.css';

import { Alignment, Navbar, NavbarHeading, NavbarDivider, NavbarGroup } from '@blueprintjs/core';
import { ClientSearchComponent } from 'src/pages/ClientSearchComponent';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { IClient } from 'src/interfaces/IClient';

import './App.css';
import { NavBarButton } from 'src/NavBarButtons';
import { DebugPage } from 'src/DebugPage';
import { Clients } from 'src/pages/Client/Clients';
import { Habitats } from 'src/pages/Habitat/Habitats';
import { Missions } from 'src/pages/Mission/Missions';
import { IHabitat } from 'src/interfaces/IHabitat';

interface IProps {

}

export const enum NavBarTabEnum {
    CLIENT = 'Client',
    HABITATS = 'Habitats',
    MISSIONS = 'Missions',
    ANALYSES = 'Analyses',
    DEBUG = 'Debug',
}

@observer export default class App extends React.Component<IProps> {

    @observable currentClient: IClient = undefined;
    @observable currentHabitat: IHabitat = undefined;
    
    @observable private selectedTab: NavBarTabEnum = NavBarTabEnum.CLIENT;

    public constructor(props: IProps) {
        super(props);
    }
  
    public render() {

        let mainContent = undefined;

        switch ( this.selectedTab ) {
            case NavBarTabEnum.CLIENT:
                mainContent = (
                    <Clients
                        client={this.currentClient}
                        selectClient={
                            (client: IClient) => {
                                this.currentClient = client;
                                this.handleGotoHabitats();
                            }
                        }
                    />
                );
                break;
            case NavBarTabEnum.HABITATS:
                mainContent = (
                    <Habitats
                        client={this.currentClient}
                        selectHabitat={
                            (habitat: IHabitat) => {
                                this.currentHabitat = habitat
//                                this.handleGotoMissions();
                            }
                        }
                    />
                )
                break;
            case NavBarTabEnum.MISSIONS:
                mainContent = <Missions habitat={this.currentHabitat}/>
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
                            tabEnum={NavBarTabEnum.HABITATS}
                            selectedTab={this.selectedTab}
                            onClick={this.handleGotoHabitats}
                        />
                        <NavBarButton
                            icon="folder-close"
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

    private handleGotoHabitats = () => {
        this.selectedTab = NavBarTabEnum.HABITATS;
    }

    private handleGotoMissions = () => {
        this.selectedTab = NavBarTabEnum.MISSIONS;
    }

    private handleGotoAnalyses = () => {
        this.selectedTab = NavBarTabEnum.ANALYSES;
    }

    private handleGotoDebug = () => {
        this.selectedTab = NavBarTabEnum.DEBUG;
    }
}
