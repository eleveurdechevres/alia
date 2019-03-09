import * as React from 'react';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
import '@blueprintjs/core/lib/css/blueprint.css';

import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { IClient } from 'src/interfaces/IClient';
import { AliaNavBar } from './AliaNavBar'
import './App.css';
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
                <AliaNavBar
                    selectedTab={this.selectedTab}
                    currentClient={this.currentClient}
                    currentHabitat={this.currentHabitat}
                    handlerClientSearch={this.handlerClientSearch}
                    handleSelectTab={this.handleSelectTab}
                />
                </div>
                {mainBoard}
            </div>
        );
    }
    private handlerClientSearch = (client: IClient) => {
        this.currentClient = client;
    }

    private handleGotoHabitats = () => {
        this.selectedTab = NavBarTabEnum.HABITATS;
    }

    private handleSelectTab = (selectedTab: NavBarTabEnum) => {
        this.selectedTab = selectedTab;
        if (this.selectedTab === NavBarTabEnum.CLIENT) {
            this.currentHabitat = undefined;
        }
    }
}
