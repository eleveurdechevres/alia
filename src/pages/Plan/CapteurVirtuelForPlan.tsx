import * as React from 'react';
import * as d3 from 'd3';
// import $ from 'jquery'; 
// import { window } from 'd3-selection';
import { observer } from 'mobx-react';
import { ICapteurVirtuel } from 'src/interfaces/ICapteurVirtuel';

// const transition = d3.transition()
// .duration(3000)
// .ease(d3.easeElastic);

// const rectWidth = 16;
interface IProps {
    x: number;
    y: number;
    capteurVirtuel: ICapteurVirtuel;
    onClick: (capteurVirtuel: ICapteurVirtuel) => void;
    onRightClick: (capteurVirtuel: ICapteurVirtuel) => void;
    onMouseOver: () => void;
    onMouseOut: () => void;
}

@observer export class CapteurVirtuelForPlan extends React.Component<IProps, {}> {

    private capteurVirtuelRef: SVGPathElement;
    // private capteurVirtuelRef: SVGCircleElement;
    public constructor(props: IProps) {
        super(props);
    }

    componentDidMount() {
        this.animateCapteurVirtuel();
    }

    componentDidUpdate() {
        d3.select(this.capteurVirtuelRef)
            .on('contextmenu', () => {
                d3.event.preventDefault();

                this.props.onRightClick(this.props.capteurVirtuel);
            });
        this.animateCapteurVirtuel();
    }

    animateCapteurVirtuel() {
        console.log('animateCapteurVirtuel')
        // Capteurs
        // d3.select(this.capteurVirtuelRef)
        //     .transition(transition)
        //     .attr('r', 10)
        //     .attr('opacity', 1);
        d3.select(this.capteurVirtuelRef)
            .attr('d', d3.symbol().type(d3.symbolCross).size(100))
            .attr('transform', `translate(${this.props.x ? this.props.x - 10 / 2 : 0},${this.props.y ? this.props.y - 10 / 2 : 0})`)
    }

    render() {
        return (
            // <circle
            //     ref={(ref) => {this.capteurVirtuelRef = ref}}
            //     className="capteurVirtuelForPlan"
            //     cx={this.props.x ? this.props.x : 0}
            //     cy={this.props.y ? this.props.y : 0}
            //     r={0}
            //     stroke="green"
            //     strokeWidth={1}
            //     fill="yellow"
            //     opacity={1}
            //     onClick={(evt) => this.props.onClick(this.props.capteurVirtuel)}
            //     onMouseOver={this.props.onMouseOver}
            //     onMouseOut={this.props.onMouseOut}
            // />
            <path
                ref={(ref) => {this.capteurVirtuelRef = ref}}
                stroke="black"
                strokeWidth={1}
                fill="green"
                opacity={1}
                onClick={(evt) => this.props.onClick(this.props.capteurVirtuel)}
                onMouseOver={this.props.onMouseOver}
                onMouseOut={this.props.onMouseOut}
                style={{cursor: 'pointer'}}
            />
            // <rect
            //     ref={(ref) => {this.observationRef = ref}}
            //     className="observationForPlan"
            //     x={this.props.x ? this.props.x - rectWidth / 2 : 0}
            //     y={this.props.y ? this.props.y - rectWidth / 2 : 0}
            //     width={rectWidth}
            //     height={rectWidth}
            //     stroke="black"
            //     strokeWidth={1}
            //     radius={2}
            //     fill="cyan"
            //     opacity={1}
            //     onClick={(evt) => this.props.onClick(this.props.capteurVirtuel)}
            //     onMouseOver={this.props.onMouseOver}
            //     onMouseOut={this.props.onMouseOut}
            // />

        );
    }
}
