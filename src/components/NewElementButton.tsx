import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Icon } from '@blueprintjs/core';
// import { Position, Tooltip } from '@blueprintjs/core';
import { style } from 'typestyle';

interface IProps {
    name: string;
    onClick: () => void;
}

const fixedButton: string = style(
    {
        position: 'fixed',
        bottom: '40px',
        right: '40px',
        zIndex: 100,
        transition: '0.3s'
    }
);

@observer export class NewElementButton extends React.Component<IProps, {}> {

    @observable private buttonNewSheetSize = 60;
    @observable private buttonNewSheetColor = 'blue';

    constructor(props: IProps) {
        super(props);
    }

    public render() {
        return (
            // <Tooltip content={this.props.name} position={Position.LEFT}>
                <Icon
                    className={fixedButton}
                    icon="add"
                    iconSize={this.buttonNewSheetSize}
                    color={this.buttonNewSheetColor}
                    title={this.props.name}
                    onMouseOver={() => {
                        this.buttonNewSheetSize = 65 ;
                        this.buttonNewSheetColor = 'purple';
                    }}
                    onMouseLeave={() => {
                        this.buttonNewSheetSize = 60 ;
                        this.buttonNewSheetColor = 'blue';
                    }}
                    onClick={this.props.onClick}
                />
            // </Tooltip>
        );
    }
}
