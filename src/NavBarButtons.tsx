import { Classes, Button, Intent, IconName } from '@blueprintjs/core';
import { NavBarTabEnum } from './App';
import * as React from 'react';
import { observer } from 'mobx-react';

interface INavButtonProps {
    icon: IconName | JSX.Element;
    tabEnum: NavBarTabEnum;
    selectedTab: NavBarTabEnum;
    onClick: () => void;
    disabled: boolean;
}

@observer export class NavBarButton extends React.Component<INavButtonProps, {}> {
    public render() {
        return (
            <Button
                icon={this.props.icon}
                className={Classes.BUTTON}
                minimal={this.props.selectedTab === this.props.tabEnum ? false : true} 
                intent={this.props.selectedTab === this.props.tabEnum ? Intent.PRIMARY : Intent.NONE}
                onClick={this.props.onClick}
                disabled={this.props.disabled}
            >
                {this.props.tabEnum}
            </Button>
        );
    }
}
