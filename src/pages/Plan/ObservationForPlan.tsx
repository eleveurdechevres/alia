import * as React from 'react';
import * as d3 from 'd3';
// import $ from 'jquery'; 
// import { window } from 'd3-selection';
import { observer } from 'mobx-react';
import { IObservation } from 'src/interfaces/IObservation';

const transition = d3.transition()
.duration(3000)
.ease(d3.easeElastic);

const rectWidth = 16;
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

    private observationRef: SVGRectElement;
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
            <rect
                ref={(ref) => {this.observationRef = ref}}
                className="observationForPlan"
                x={this.props.x ? this.props.x - rectWidth / 2 : 0}
                y={this.props.y ? this.props.y - rectWidth / 2 : 0}
                width={rectWidth}
                height={rectWidth}
                stroke="black"
                strokeWidth={1}
                radius={2}
                fill="cyan"
                opacity={1}
                onClick={(evt) => this.props.onClick(this.props.observation)}
                onMouseOver={this.props.onMouseOver}
                onMouseOut={this.props.onMouseOut}
            />

        );
    }
}
