import * as React from 'react';
import * as d3 from 'd3';
// import $ from 'jquery'; 
// import { window } from 'd3-selection';
import { observer } from 'mobx-react';
import { ICapteur } from 'src/interfaces/ICapteur';

const transition = d3.transition()
.duration(3000)
.ease(d3.easeElastic);

interface IProps {
    x: number;
    y: number;
    capteur: ICapteur;
    onClick: (capteur: ICapteur) => void;
    onMouseOver: () => void;
    onMouseOut: () => void;
}

@observer export class CapteurForPlan extends React.Component<IProps, {}> {

    private capteurRef: SVGCircleElement;
    public constructor(props: IProps) {
        super(props);
    }

    componentDidMount() {
        this.animateCapteurs();
    }

    componentDidUpdate() {
        // this.animateCapteurs();
    }

    animateCapteurs() {
        // Capteurs
        d3.select(this.capteurRef)
            .transition(transition)
                .attr('r', 10)
                .attr('opacity', 1);
    }

    render() {
        return (
            <circle
                ref={(ref) => {this.capteurRef = ref}}
                className="capteurForPlan"
                cx={this.props.x ? this.props.x : 0}
                cy={this.props.y ? this.props.y : 0}
                r={0}
                stroke="black"
                strokeWidth={1}
                fill="white"
                opacity={1}
                onClick={() => this.props.onClick(this.props.capteur)}
                onMouseOver={this.props.onMouseOver}
                onMouseOut={this.props.onMouseOut}
            />
        );
    }
}
