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
const iconWidth = 0;
const iconHeight = 0;

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

    private capteurVirtuelRef: SVGGElement;

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
            })
    this.animateCapteurVirtuel();
    }

    animateCapteurVirtuel() {
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
            <g
                ref={(ref) => {this.capteurVirtuelRef = ref}}
                transform={`translate(${this.props.x ? this.props.x - iconWidth / 2 : 0},${this.props.y ? this.props.y - iconHeight / 2 : 0})`}
                onClick={(evt) => this.props.onClick(this.props.capteurVirtuel)}
                onMouseOver={this.props.onMouseOver}
                onMouseOut={this.props.onMouseOut}
                style={{cursor: 'pointer'}}
            >
                <g transform="matrix(1.0828025,0,0,1.0719849,-0.7907727,-0.81763694)">
                    <path
                        fill="white"
                        d="m 13.449221,2 c 0,-0.55 -0.508827,-1 -1.130726,-1 H 11.43653 C 11.040775,0.4 10.328418,0
                        9.4916811,0 8.6549442,0 7.9312797,0.4 7.546833,1 H 6.664867 C 6.0429679,1 5.5341414,1.45 5.5341414,2 v 2 h 7.9150796 z"
                    />
                    <path
                        fill="white"
                        d="M 16,2 C 8.0116103,2.0045969 11.075975,2.0208564 3,2 2.4508662,2.0311672 2,2.45 2,3 v 16 c 0,0.55 0.45,1 1,1 h 13
                        c 0.55,0 1,-0.45 1,-1 V 3 C 17,2.45 16.528389,2.0066427 16,2 Z"
                    />
                </g>
                <g transform="matrix(0.99632835,0,0,0.99632835,0.03073225,0.04710511)">
                    <path
                        d="m 13.411628,2 c 0,-0.6674097 -0.50185,-1.21347219 -1.115222,-1.21347219 h -0.869874 c -0.390328,-0.72808332
                        -1.092917,-1.21347219 -1.9181824,-1.21347219 -0.8252645,0 -1.539007,0.48538887 -1.9181826,1.21347219 H 6.7202936
                        C 6.1069212,0.78652781 5.6050712,1.3325903 5.6050712,2 v 2.4269443 h 7.8065568 z"
                    />
                    <path
                        d="M 16,2 H 14 V 4 5 H 13 6 5 V 4 2 H 3 C 2.45,2 2,2.45 2,3 v 16 c 0,0.55 0.45,1 1,1
                        h 13 c 0.55,0 1,-0.45 1,-1 V 3 C 17,2.45 16.55,2 16,2 Z"
                    />
                </g>
            </g>
            
            // <path
            //     ref={(ref) => {this.capteurVirtuelRef = ref}}
            //     stroke="black"
            //     strokeWidth={1}
            //     fill="green"
            //     opacity={1}
            //     onClick={(evt) => this.props.onClick(this.props.capteurVirtuel)}
            //     onMouseOver={this.props.onMouseOver}
            //     onMouseOut={this.props.onMouseOut}
            //     style={{cursor: 'pointer'}}
            // />

        );
    }
}
