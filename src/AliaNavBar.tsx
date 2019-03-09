import * as React from 'react';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
import '@blueprintjs/core/lib/css/blueprint.css';
import { observer } from 'mobx-react';
import { Alignment, Navbar, NavbarHeading, NavbarDivider, NavbarGroup } from '@blueprintjs/core';
import { ClientSearchComponent } from 'src/pages/ClientSearchComponent';
import { IClient } from 'src/interfaces/IClient';
import { IHabitat } from 'src/interfaces/IHabitat';
import { NavBarButton } from 'src/NavBarButtons';
import { NavBarTabEnum } from 'src/App';

interface IProps {
    selectedTab: NavBarTabEnum;
    currentClient: IClient;
    currentHabitat: IHabitat;
    handlerClientSearch: (client: IClient) => void;
    handleSelectTab: (selectedTab: NavBarTabEnum) => void;
}

@observer export class AliaNavBar extends React.Component<IProps> {

    public constructor(props: IProps) {
        super(props);
    }

    public render() {
        return (
            <Navbar>
            <NavbarGroup align={Alignment.LEFT} className={style(csstips.horizontallySpaced(10), csstips.horizontal, csstips.flex)}>
                <img src="./favicon.ico" className={style({ width: 32, height: 32 })}/>
                <NavbarHeading>ALIA France</NavbarHeading>
                <NavbarDivider />
                <ClientSearchComponent handler={this.props.handlerClientSearch}/>
            </NavbarGroup>
            <NavbarGroup align={Alignment.RIGHT} className={style(csstips.horizontal, csstips.flex)}>
                {
                    this.props.currentClient ?
                        <div className={style(csstips.horizontal, csstips.flex)}>
                            <NavbarHeading>{this.props.currentClient.nom}</NavbarHeading>
                            <NavbarDivider />
                            <NavbarHeading>{this.props.currentClient.telephone}</NavbarHeading>
                            <NavbarDivider />
                            {
                                this.props.currentHabitat ? (
                                    <React.Fragment>
                                        <NavbarHeading>{this.props.currentHabitat.adresse}</NavbarHeading>
                                        <NavbarDivider />
                                    </React.Fragment>
                                ) : ''
                            }
                        </div>
                    : ''
                }
                <NavBarButton
                    icon="person"
                    tabEnum={NavBarTabEnum.CLIENT}
                    selectedTab={this.props.selectedTab}
                    onClick={this.handleGotoClients}
                    disabled={false}
                />
                <NavBarButton
                    icon="home"
                    tabEnum={NavBarTabEnum.HABITATS}
                    selectedTab={this.props.selectedTab}
                    onClick={this.handleGotoHabitats}
                    disabled={this.props.selectedTab === NavBarTabEnum.CLIENT}
                />
                <NavBarButton
                    icon="folder-close"
                    tabEnum={NavBarTabEnum.MISSIONS}
                    selectedTab={this.props.selectedTab}
                    onClick={this.handleGotoMissions}
                    disabled={!this.props.currentHabitat}
                />
                <NavBarButton
                    icon="timeline-line-chart"
                    tabEnum={NavBarTabEnum.ANALYSES}
                    selectedTab={this.props.selectedTab}
                    onClick={this.handleGotoAnalyses}
                    disabled={false}
                />
                <NavBarButton
                    icon="lightbulb"
                    tabEnum={NavBarTabEnum.DEBUG}
                    selectedTab={this.props.selectedTab}
                    onClick={this.handleGotoDebug}
                    disabled={false}
                />
            </NavbarGroup>
        </Navbar>
        );
    }

    private handleGotoClients = () => {
        this.props.handleSelectTab(NavBarTabEnum.CLIENT);
    }

    private handleGotoHabitats = () => {
        this.props.handleSelectTab(NavBarTabEnum.HABITATS);
    }

    private handleGotoMissions = () => {
        this.props.handleSelectTab(NavBarTabEnum.MISSIONS);
    }

    private handleGotoAnalyses = () => {
        this.props.handleSelectTab(NavBarTabEnum.ANALYSES);
    }

    private handleGotoDebug = () => {
        this.props.handleSelectTab(NavBarTabEnum.DEBUG);
    }

}
