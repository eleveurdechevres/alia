import * as React from 'react';
import * as d3 from 'd3';
// import $ from 'jquery'; 
// import { window } from 'd3-selection';
import { observer } from 'mobx-react';
import { IObservation } from 'src/interfaces/IObservation';

const transition = d3.transition()
.duration(3000)
.ease(d3.easeElastic);

interface IProps {
    x: number;
    y: number;
    observation: IObservation;
    onClick: (observation: IObservation) => void;
    onMouseOver: () => void;
    onMouseOut: () => void;
}

@observer export class ObservationForPlan extends React.Component<IProps, {}> {

    private observationRef: SVGCircleElement;
    public constructor(props: IProps) {
        super(props);
    }

    componentDidMount() {
        this.animateObservations();
    }

    componentDidUpdate() {
        // this.animateCapteurs();
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
            <circle
                ref={(ref) => {this.observationRef = ref}}
                className="observationForPlan"
                cx={this.props.x ? this.props.x : 0}
                cy={this.props.y ? this.props.y : 0}
                r={0}
                stroke="black"
                strokeWidth={1}
                fill="blue"
                opacity={1}
                onClick={() => this.props.onClick(this.props.observation)}
                onMouseOver={this.props.onMouseOver}
                onMouseOut={this.props.onMouseOut}
            />
        );
    }
}
