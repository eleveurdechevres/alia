import * as React from 'react';

interface IProps {
    displayVertical: boolean;
    top: number;
    bottom: number;
    xPosition: number;
    yPosition: number;
}

export class Crosshair extends React.Component<IProps, {}> {
    
    constructor(props: IProps) {
        super(props);
        this.props = props;
    }

    shouldComponentUpdate(nextProps: IProps, nextState: {}) {
        if ( nextProps !== this.props ) {
            return true;
        }
        return false;
    }
    render() {
        return (
            <g pointerEvents="none">
                {/* Ligne verticale */}
                {/* <g opacity={this.props.displayVertical ? 1 : 0}>
                    <line
                        x1={this.props.xPosition}
                        x2={this.props.xPosition}
                        y1={this.props.top}
                        y2={this.props.bottom}
                        stroke="RebeccaPurple"
                        strokeWidth="1"
                        shapeRendering="crispEdges"
                    />
                </g> */}
                {/* Ligne Horizontale */}
                {/* <g display={this.props.displayHorizontal}>
                    <line x1={this.props.left}
                        x2={this.props.right}
                        y1={this.props.yPosition}
                        y2={this.props.yPosition}
                        stroke="black"
                        strokeWidth='1'/>
                </g> */}
            </g>
        )
    }
}
