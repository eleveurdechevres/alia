import * as React from 'react';
import * as d3 from 'd3';
// import $ from 'jquery'; 
// import { window } from 'd3-selection';
import { observer } from 'mobx-react';
import { IObservation } from 'src/interfaces/IObservation';
import { NestedCSSProperties } from 'typestyle/lib/types';
import { style, keyframes } from 'typestyle';

const iconWidth = 22;
const iconHeight = 22;

interface IProps {
    x: number;
    y: number;
    observation: IObservation;
    onClick: (observation: IObservation) => void;
    onRightClick: (observation: IObservation) => void;
    onMouseOver: () => void;
    onMouseOut: () => void;
}

const rotateFrames = keyframes({
    '0%': {
        transform: 'rotate(-10deg)'
    },
    '50%': {
        transform: 'rotate(+10deg)'
    },
    '100%': {
        transform: 'rotate(-10deg)'
    }
});

const gCssProperties: NestedCSSProperties = {
    $nest: {
        'path.pathBackgroundIcon': {
            fill: 'white',
        },
        'path.pathIcon': {
            fill: 'darkcyan',
        },
        '&:hover': {
            $nest: {
                'path.pathBackgroundIcon': {
                    fill: 'darkcyan',
                },
                'path.pathIcon': {
                    fill: 'white',
                }
            }
        },
    }
}   

const animationCssProperties: NestedCSSProperties = {
    animationName: rotateFrames,
    animationDuration: '5s',
    animationIterationCount: 'infinite'
}

@observer export class ObservationForPlan extends React.Component<IProps, {}> {

    private observationRef: SVGGElement;
    public constructor(props: IProps) {
        super(props);
    }

    componentDidUpdate() {
        d3.select(this.observationRef)
            .on('contextmenu', () => {
                d3.event.preventDefault();
                this.props.onRightClick(this.props.observation);
            });
    }

    render() {
        return (
            // <circle
            //     ref={(ref) => {this.observationRef = ref}}
            //     className="observationForPlan"
            //     cx={this.props.x ? this.props.x : 0}
            //     cy={this.props.y ? this.props.y : 0}
            //     r={0}
            //     stroke="black"
            //     strokeWidth={1}
            //     fill="blue"
            //     opacity={1}
            //     onClick={(evt) => this.props.onClick(this.props.observation)}
            //     onMouseOver={this.props.onMouseOver}
            //     onMouseOut={this.props.onMouseOut}
            // />
            <g
                ref={(ref) => {this.observationRef = ref}}
                className={style(gCssProperties) + ' observationForPlan'}
                onClick={(evt) => this.props.onClick(this.props.observation)}
                onMouseOver={this.props.onMouseOver}
                onMouseOut={this.props.onMouseOut}
                style={{cursor: 'pointer'}}
                transform={`translate(${this.props.x ? this.props.x - iconWidth / 2 : 0},${this.props.y ? this.props.y - iconHeight / 2 : 0})`}
            >
                <g
                    className={style(animationCssProperties)}
                >
                    <path
                        className="pathBackgroundIcon"
                        d="M 19,4 H 15.41 L 13.7,2.29 C 13.53,2.11 13.28,2 13,2 H 7 C 6.72,2 6.47,2.11 6.29,2.29 L 4.59,4 H 1
                        C 0.45,4 0,4.45 0,5 v 10 c 0,0.55 0.45,1 1,1 h 4.11 c 1.26,1.24 2.99,2 4.89,2 1.9,0 3.63,-0.76 4.89,-2
                        H 19 c 0.55,0 1,-0.45 1,-1 V 5 C 20,4.45 19.55,4 19,4 Z"
                        clipRule="evenodd"
                        fillRule="evenodd"
                    />
                    <g transform="matrix(0.86714976,0,0,0.86714976,1.3285024,1.3285024)">
                        <path
                            className="pathIcon"
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="m 10,8 c -1.66,0 -3,1.34 -3,3 0,1.66 1.34,3 3,3 1.66,0 3,-1.34 3,-3 C 13,9.34 11.66,8 10,8 Z M
                            19,4 H 15.41 L 13.7,2.29 C 13.53,2.11 13.28,2 13,2 H 7 C 6.72,2 6.47,2.11 6.29,2.29 L 4.59,4 H 1 C
                            0.45,4 0,4.45 0,5 v 10 c 0,0.55 0.45,1 1,1 h 4.11 c 1.26,1.24 2.99,2 4.89,2 1.9,0 3.63,-0.76 4.89,-2
                            H 19 c 0.55,0 1,-0.45 1,-1 V 5 C 20,4.45 19.55,4 19,4 Z M 4,8 H 2 V 6 h 2 z m 6,8 C 7.24,16 5,13.76
                            5,11 5,8.24 7.24,6 10,6 c 2.76,0 5,2.24 5,5 0,2.76 -2.24,5 -5,5 z"
                        />
                    </g>
                </g>
                {/* <rect
                    x={0}
                    y={0}
                    width={cameraWidth}
                    height={cameraHeight}
                    stroke="white"
                    strokeWidth={1}
                    fill="black"
                    opacity={1}
                /> */}
                {/* <circle
                    cx={cameraWidth / 2}
                    cy={cameraHeight / 2}
                    r={2}
                    stroke="white"
                    strokeWidth={2}
                    fill="cyan"
                /> */}
            </g>
        );
    }
}
