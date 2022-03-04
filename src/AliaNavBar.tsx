import * as React from 'react';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
import '@blueprintjs/core/lib/css/blueprint.css';
import { observer } from 'mobx-react';
import { Alignment, Navbar, NavbarHeading, NavbarDivider, NavbarGroup, Popover, Button, Position, Menu, MenuItem } from '@blueprintjs/core';
import { NavBarButton } from 'src/NavBarButtons';
import { NavBarTabEnum } from 'src/App';
import { GlobalStore } from 'src/stores/GlobalStore';
import { Auth0Context, Auth0ContextInterface, User } from '@auth0/auth0-react';

interface IProps {
    globalStore: GlobalStore
}

@observer export class AliaNavBar extends React.Component<IProps> {

    static contextType: React.Context<Auth0ContextInterface<User>> = Auth0Context;

    public constructor(props: IProps) {
        super(props);

    }

    public render() {

        return (
            <Navbar 
                className={style(csstips.margin(0, 0, 10, 0), { boxShadow: '1px 1px 10px #888' })}
                fixedToTop={true}
            >
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
                    {
                        this.props.globalStore.isRoleAdmin(this.context) &&
                        <NavBarButton
                            icon="person"
                            tabEnum={NavBarTabEnum.CLIENT}
                            selectedTab={this.props.globalStore.selectedTab}
                            onClick={this.handleGotoClients}
                            disabled={false}
                        />
                    }
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
                        disabled={!this.props.globalStore.habitat}
                    />
                    {
                        this.props.globalStore.isRoleAdmin(this.context) &&
                        <NavBarButton
                            icon="lightbulb"
                            tabEnum={NavBarTabEnum.DEBUG}
                            selectedTab={this.props.globalStore.selectedTab}
                            onClick={this.handleGotoDebug}
                            disabled={false}
                        />
                    }
                    {
                        this.props.globalStore.isRoleAdmin(this.context) &&
                        <NavBarButton
                            icon="cog"
                            tabEnum={NavBarTabEnum.ADMIN}
                            selectedTab={this.props.globalStore.selectedTab}
                            onClick={this.handleGotoAdmin}
                            disabled={false}
                        />
                    }
                    <Popover
                        // className={style(csstips.fillParent, csstips.width('100%'))}
                        canEscapeKeyClose={true}
                        minimal={true}
                        position={Position.BOTTOM_LEFT}
                        content={this.buildUserMenu()}
                    >
                        <Button
                            className={style(csstips.width('100%'))}
                            icon="person"
                            text={this.props.globalStore.isAuthenticated(this.context) ? this.props.globalStore.getUser(this.context).name : ''}
                        />
                    </Popover>

                </NavbarGroup>
            </Navbar>
        );
    }

    private buildUserMenu = (): JSX.Element => {
        const { isAuthenticated, loginWithRedirect, logout } = this.context;
        const keyBase = Math.random();
        return (
            <Menu>
                {!isAuthenticated ?
                    <MenuItem
                        key={keyBase}
                        icon="log-in"
                        text={'Login'}
                        onClick={() => {
                            loginWithRedirect();
                            this.props.globalStore.selectedTab
                        }}
                    />
                    :
                    <MenuItem
                        key={keyBase}
                        icon="log-out"
                        text={'Logout'}
                        onClick={() => logout()}
                        // onClick={() => logout({
                        //     returnTo: window.location.origin
                        // })}
                    />
                }
            </Menu>
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

    private handleGotoAdmin = () => {
        this.props.globalStore.navigateToTab(NavBarTabEnum.ADMIN);
    }
}
