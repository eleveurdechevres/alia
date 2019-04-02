import * as React from 'react';
import { Icon, IconName, Intent } from '@blueprintjs/core';
import { observer } from 'mobx-react';
// import { observable } from 'mobx';
import { style } from 'typestyle';
import { NestedCSSProperties } from '../../node_modules/typestyle/lib/types';

interface IProps {
    iconName: IconName;
    iconSize: number;
    onClick: () => void;

    intent?: Intent;
    margin?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    tooltip?: string;
    disabled?: boolean;
}

const mousePointerClassName = {cursor: 'pointer'};
const disabledMousePointerClassName = {cursor: 'default'};

@observer export class IconButton extends React.Component<IProps, {}> {

    // @observable private mouseOverIcon = false;
    private margin: number;
    private marginTop: number;
    private marginBottom: number;
    private marginLeft: number;
    private marginRight: number;
    
    private cssBase: NestedCSSProperties;

    constructor(props: IProps) {
        super(props);
        this.margin = this.props.margin ? this.props.margin : 0;
        this.marginTop = this.props.marginTop ? this.props.marginTop : this.margin;
        this.marginBottom = this.props.marginBottom ? this.props.marginBottom : this.margin;
        this.marginLeft = this.props.marginLeft ? this.props.marginLeft : this.margin;
        this.marginRight = this.props.marginRight ? this.props.marginRight : this.margin;

        this.cssBase = {
            marginTop: this.marginTop,
            marginBottom: this.marginBottom,
            marginLeft: this.marginLeft,
            marginRight: this.marginRight
        };
    }

    public render() {

        return (
            <Icon
                intent={this.props.intent}
                icon={this.props.iconName}
                iconSize={this.props.iconSize}
                className={style(this.cssBase, this.props.disabled ? disabledMousePointerClassName : mousePointerClassName)}
                // onMouseEnter={() => {this.mouseOverIcon = true; }}
                // onMouseLeave={() => {this.mouseOverIcon = false; }}
                color={this.props.disabled ? 'lightgray' : undefined}
                onClick={this.handleClick}
                title={this.props.tooltip ? this.props.tooltip : this.props.iconName}
            />
        );
    }

    private handleClick = () => {
        if ( !this.props.disabled ) {
            this.props.onClick();
        }
    }
}
