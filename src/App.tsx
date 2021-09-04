import * as React from 'react';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/select/lib/css/blueprint-select.css';
import { observer } from 'mobx-react';
import { AliaNavBar } from './AliaNavBar'
import './App.css';
import { DebugPage } from 'src/DebugPage';
import { Clients } from 'src/pages/Client/Clients';
import { Habitats } from 'src/pages/Habitat/Habitats';
import { Missions } from 'src/pages/Mission/Missions';
import { Analyses } from 'src/pages/analyse/Analyses';
import { GlobalStore } from 'src/stores/GlobalStore';
import { Auth0Context, Auth0ContextInterface, User } from '@auth0/auth0-react';

interface IProps {
    globalStore: GlobalStore
}

export const enum NavBarTabEnum {
    CLIENT = 'Client',
    HABITATS = 'Habitats',
    MISSIONS = 'Missions',
    ANALYSES = 'Analyses',
    DEBUG = 'Debug'
}

@observer export default class App extends React.Component<IProps> {

    static contextType: React.Context<Auth0ContextInterface<User>> = Auth0Context;
    public constructor(props: IProps) {
        super(props);
    }

    public render() {
        let mainContent = undefined;

        switch ( this.props.globalStore.selectedTab ) {
            case NavBarTabEnum.CLIENT:
                mainContent = (
                    <Clients
                        globalStore={this.props.globalStore}
                    />
                );
                break;
            case NavBarTabEnum.HABITATS:
                mainContent = (
                    <Habitats
                        globalStore={this.props.globalStore}
                    />
                )
                break;
            case NavBarTabEnum.MISSIONS:
                mainContent = <Missions globalStore={this.props.globalStore}/>
                break;
            case NavBarTabEnum.ANALYSES:
                mainContent = <Analyses globalStore={this.props.globalStore}/>;
                break;
            case NavBarTabEnum.DEBUG:
                mainContent = <DebugPage/>;
                break;
            default:
                break;
        }
        let mainBoard = <div id="content" className={style(csstips.fillParent, csstips.padding(50, 0, 0, 0))}>{mainContent}</div>;
        const { isAuthenticated } = this.context;

        return (
            <div>
                <AliaNavBar
                    globalStore={this.props.globalStore}
                />
                {isAuthenticated && mainBoard}
            </div>
        );
    }
}
