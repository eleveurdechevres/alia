import * as React from 'react';
import * as d3 from 'd3';
// import $ from 'jquery'; 
// import { window } from 'd3-selection';
import { observer } from 'mobx-react';
import { IObservation } from 'src/interfaces/IObservation';

const transition = d3.transition()
.duration(3000)
.ease(d3.easeElastic);

const cameraWidth = 22;
const cameraHeight = 16;

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
                transform={`translate(${this.props.x ? this.props.x - cameraWidth / 2 : 0},${this.props.y ? this.props.y - cameraWidth / 2 : 0})`}
            >
                <rect
                    x={0}
                    y={0}
                    width={cameraWidth}
                    height={cameraHeight}
                    stroke="white"
                    strokeWidth={1}
                    fill="black"
                    opacity={1}
                />
                <circle
                    cx={cameraWidth / 2}
                    cy={cameraHeight / 2}
                    r={5}
                    stroke="white"
                    strokeWidth={2}
                    fill="cyan"
                />
            </g>
        );
    }
}
