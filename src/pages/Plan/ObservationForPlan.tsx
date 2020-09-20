import * as React from 'react';
import * as d3 from 'd3';
// import $ from 'jquery'; 
// import { window } from 'd3-selection';
import { observer } from 'mobx-react';
import { IObservation } from 'src/interfaces/IObservation';

const transition = d3.transition()
.duration(3000)
.ease(d3.easeElastic);

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

@observer export class ObservationForPlan extends React.Component<IProps, {}> {

    private observationRef: SVGGElement;
    public constructor(props: IProps) {
        super(props);
    }

    componentDidMount() {
        this.animateObservations();
    }

    componentDidUpdate() {
        d3.select(this.observationRef)
            .on('contextmenu', () => {
                d3.event.preventDefault();
                this.props.onRightClick(this.props.observation);
            });
    }

    animateObservations() {
        // Capteurs
        d3.select(this.observationRef)
            .transition(transition)
                .attr('r', 10)
                .attr('opacity', 1);
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
                className="observationForPlan"
                onClick={(evt) => this.props.onClick(this.props.observation)}
                onMouseOver={this.props.onMouseOver}
                onMouseOut={this.props.onMouseOut}
                style={{cursor: 'pointer'}}
                transform={`translate(${this.props.x ? this.props.x - iconWidth / 2 : 0},${this.props.y ? this.props.y - iconHeight / 2 : 0})`}
            >
                {/* <path
                    fill="white"
                    d="M 19,4 H 15.41 L 13.7,2.29 C 13.53,2.11 13.28,2 13,2 H 7 C 6.72,2 6.47,2.11 6.29,2.29 L 4.59,4 H 1
                    C 0.45,4 0,4.45 0,5 v 10 c 0,0.55 0.45,1 1,1 h 4.11 c 1.26,1.24 2.99,2 4.89,2 1.9,0 3.63,-0.76 4.89,-2
                    H 19 c 0.55,0 1,-0.45 1,-1 V 5 C 20,4.45 19.55,4 19,4 Z"
                    clip-rule="evenodd"
                    fill-rule="evenodd"
                />
                <g transform="matrix(0.86714976,0,0,0.86714976,1.3285024,1.3285024)">
                    <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="m 10,8 c -1.66,0 -3,1.34 -3,3 0,1.66 1.34,3 3,3 1.66,0 3,-1.34 3,-3 C 13,9.34 11.66,8 10,8 Z M
                        19,4 H 15.41 L 13.7,2.29 C 13.53,2.11 13.28,2 13,2 H 7 C 6.72,2 6.47,2.11 6.29,2.29 L 4.59,4 H 1 C
                        0.45,4 0,4.45 0,5 v 10 c 0,0.55 0.45,1 1,1 h 4.11 c 1.26,1.24 2.99,2 4.89,2 1.9,0 3.63,-0.76 4.89,-2
                        H 19 c 0.55,0 1,-0.45 1,-1 V 5 C 20,4.45 19.55,4 19,4 Z M 4,8 H 2 V 6 h 2 z m 6,8 C 7.24,16 5,13.76
                        5,11 5,8.24 7.24,6 10,6 c 2.76,0 5,2.24 5,5 0,2.76 -2.24,5 -5,5 z"
                    />
                </g> */}

        <path
            fill="white"
            d="M 19,1 H 1 C 0.45,1 0,1.45 0,2 v 12 c 0,0.55 0.45,1 1,1 h 3 v 4 c 0,0.55 0.45,1 1,1 0.28,0 0.53,-0.11
            0.71,-0.29 L 10.41,15 H 19 c 0.55,0 1,-0.45 1,-1 V 2 C 20,1.45 19.55,1 19,1 Z"
            clip-rule="evenodd"
            fill-rule="evenodd"
        />
        <g transform="matrix(0.91010593,0,0,0.91010593,0.89894073,0.94388777)">
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M 19,1 H 1 C 0.45,1 0,1.45 0,2 v 11.324391 c 0,0.55 0.45,1 1,1 h 3.3378043 v 4 c 0,0.55 0.2801492,0.882212
                0.6621957,1 0.2442999,0.07532 0.53,-0.11 0.71,-0.29 l 4.7,-4.71 H 19 c 0.55,0 1,-0.45 1,-1 V 2 C 20,1.45 19.55,1
                19,1 Z M 4,10 C 2.9,10 2,9.1 2,8 2,6.9 2.9,6 4,6 5.1,6 6,6.9 6,8 6,9.1 5.1,10 4,10 Z m 6,0 C 8.9,10 8,9.1 8,8 8,6.9
                8.9,6 10,6 c 1.1,0 2,0.9 2,2 0,1.1 -0.9,2 -2,2 z m 6,0 c -1.1,0 -2,-0.9 -2,-2 0,-1.1 0.9,-2 2,-2 1.1,0 2,0.9 2,2 0,1.1 -0.9,2 -2,2 z"
            />
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
