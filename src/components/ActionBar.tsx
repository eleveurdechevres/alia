import { Icon, IconName, Position, Tooltip } from '@blueprintjs/core';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { style } from 'typestyle';

const styleClassName: string = style( { margin: ' 3px' } );

const fixedButton: string = style(
    {
        position: 'fixed',
        bottom: '40px',
        right: '40px',
        zIndex: 3 ,
        transition: '0.3s'
    }
);

export interface IPropsActionElement {
    id: string;
    iconName: IconName;
    name: string;
    onClick: () => void;
}

interface IProps {    
    elements: IPropsActionElement[];
}

const DISPLAY_DURATION_WHEN_OPENING = 2000;

export class ActionElementBar extends React.Component<IProps, {}> {

    constructor(props: IProps) {
        super(props);
    }

    public render() {
        let view = this.props.elements.map( (propsAction) => {
            return (
                <ActionElementButton
                    id={propsAction.id}
                    iconName={propsAction.iconName}
                    name={propsAction.name}
                    onClick={propsAction.onClick}
                    key={'actionElementButton.' + propsAction.name + '.' + propsAction.iconName}
                />
            );
        });

        return (
            <div className={fixedButton}>
                {view}      
            </div>
        );
    }
}

const frontColor = '#2787C3';
const frontColorHvover = '#2477AB';
@observer export class ActionElementButton extends React.Component<IPropsActionElement, {}> {

    
    @observable private buttonNewSheetSize = 60;
    @observable private buttonNewSheetColor = frontColor;
    @observable private isPopupOpened = true;

    public componentDidMount() {
        if (this.isPopupOpened) {
            setTimeout(() => {
                this.isPopupOpened = false;
            }, DISPLAY_DURATION_WHEN_OPENING);
        }
    }

    public render() {
        return (
            <div
                id={this.props.id}
                className={styleClassName}
                onMouseOver={() => {
                    this.buttonNewSheetSize = 65 ;
                    this.buttonNewSheetColor = frontColorHvover;
                }}
                onMouseLeave={() => {
                    this.buttonNewSheetSize = 60 ;
                    this.buttonNewSheetColor = frontColor;
                }}
                onClick={this.props.onClick}
            >
                <Tooltip
                    isOpen={this.isPopupOpened}
                    content={this.props.name}
                    position={Position.LEFT}
                >
                    <Icon
                        onMouseEnter={() => { this.isPopupOpened = true; }}
                        onMouseLeave={() => { this.isPopupOpened = false; }}
                        icon={this.props.iconName}
                        iconSize={this.buttonNewSheetSize}
                        color={this.buttonNewSheetColor}
                        title={this.props.name}
                    />
                </Tooltip>
            </div>
        );
    }
}
