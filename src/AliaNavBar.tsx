import * as React from 'react';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
import '@blueprintjs/core/lib/css/blueprint.css';
import { observer } from 'mobx-react';
import { Alignment, Navbar, NavbarHeading, NavbarDivider, NavbarGroup } from '@blueprintjs/core';
import { NavBarButton } from 'src/NavBarButtons';
import { NavBarTabEnum } from 'src/App';
import { GlobalStore } from 'src/stores/GlobalStore';

interface IProps {
    globalStore: GlobalStore
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
            </NavbarGroup>
            <NavbarGroup align={Alignment.RIGHT} className={style(csstips.horizontal, csstips.flex)}>
                {
                    this.props.globalStore.client ?
                        <div className={style(csstips.horizontal, csstips.flex)}>
                            <NavbarHeading>{this.props.globalStore.client.nom}</NavbarHeading>
                            <NavbarDivider />
                            <NavbarHeading>{this.props.globalStore.client.telephone}</NavbarHeading>
                            <NavbarDivider />
                            {
                                this.props.globalStore.habitat ? (
                                    <React.Fragment>
                                        <NavbarHeading>{this.props.globalStore.habitat.adresse}</NavbarHeading>
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
                    selectedTab={this.props.globalStore.selectedTab}
                    onClick={this.handleGotoClients}
                    disabled={false}
                />
                <NavBarButton
                    icon="home"
                    tabEnum={NavBarTabEnum.HABITATS}
                    selectedTab={this.props.globalStore.selectedTab}
                    onClick={this.handleGotoHabitats}
                    disabled={!this.props.globalStore.client}
                />
                <NavBarButton
                    icon="folder-close"
                    tabEnum={NavBarTabEnum.MISSIONS}
                    selectedTab={this.props.globalStore.selectedTab}
                    onClick={this.handleGotoMissions}
                    disabled={!this.props.globalStore.habitat}
                />
                <NavBarButton
                    icon="timeline-line-chart"
                    tabEnum={NavBarTabEnum.ANALYSES}
                    selectedTab={this.props.globalStore.selectedTab}
                    onClick={this.handleGotoAnalyses}
                    disabled={false}
                />
                <NavBarButton
                    icon="lightbulb"
                    tabEnum={NavBarTabEnum.DEBUG}
                    selectedTab={this.props.globalStore.selectedTab}
                    onClick={this.handleGotoDebug}
                    disabled={false}
                />
            </NavbarGroup>
        </Navbar>
        );
    }

    private handleGotoClients = () => {
        this.props.globalStore.navigateToTab(NavBarTabEnum.CLIENT);
    }

    private handleGotoHabitats = () => {
        this.props.globalStore.navigateToTab(NavBarTabEnum.HABITATS);
    }

    private handleGotoMissions = () => {
        this.props.globalStore.navigateToTab(NavBarTabEnum.MISSIONS);
    }

    private handleGotoAnalyses = () => {
        this.props.globalStore.navigateToTab(NavBarTabEnum.ANALYSES);
    }

    private handleGotoDebug = () => {
        this.props.globalStore.navigateToTab(NavBarTabEnum.DEBUG);
    }

}
