import * as React from 'react';
import * as d3 from 'd3';
// import $ from 'jquery'; 
// import { window } from 'd3-selection';
import { observer } from 'mobx-react';
import { ICapteur } from 'src/interfaces/ICapteur';

const transition = d3.transition()
.duration(3000)
.ease(d3.easeElastic);

const iconWidth = 0;
const iconHeight = 0;

interface IProps {
    x: number;
    y: number;
    capteur: ICapteur;
    onClick: (capteur: ICapteur) => void;
    onMouseOver: () => void;
    onMouseOut: () => void;
}

@observer export class CapteurForPlan extends React.Component<IProps, {}> {

    private capteurRef: SVGGElement;
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
            <g
                ref={(ref) => {this.capteurRef = ref}}    
                transform={`translate(${this.props.x ? this.props.x - iconWidth / 2 : 0},${this.props.y ? this.props.y - iconHeight / 2 : 0})`}
                onClick={() => this.props.onClick(this.props.capteur)}
                onMouseOver={this.props.onMouseOver}
                onMouseOut={this.props.onMouseOut}
                style={{cursor: 'pointer'}}
            >
                <path
                    transform="translate(-10)"
                    fill="white"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M 20,0 C 14.48,0 10,4.48 10,10 10,15.52 14.48,20 20,20 25.52,20 30,15.52 30,10 30,4.48 25.52,0 20,0 Z"
                />
                <path
                    transform="matrix(0.86823529,0,0,0.86823529,1.3176471,1.3176471)"
                    fill="black"
                    d="M 6,5 C 5.45,5 5,5.45 5,6 5,6.55 5.45,7 6,7 6.55,7 7,6.55 7,6 7,5.45 6.55,5 6,5 Z M 4,9 C 3.45,9 3,9.45 3,10 3,10.55
                    3.45,11 4,11 4.55,11 5,10.55 5,10 5,9.45 4.55,9 4,9 Z M 10,5 C 10.55,5 11,4.55 11,4 11,3.45 10.55,3 10,3 9.45,3 9,3.45
                    9,4 9,4.55 9.45,5 10,5 Z M 10,0 C 4.48,0 0,4.48 0,10 0,15.52 4.48,20 10,20 15.52,20 20,15.52 20,10 20,4.48 15.52,0 10,0
                    Z m 0,18 C 5.58,18 2,14.42 2,10 2,5.58 5.58,2 10,2 c 4.42,0 8,3.58 8,8 0,4.42 -3.58,8 -8,8 z m 6,-9 c -0.55,0 -1,0.45
                    -1,1 0,0.55 0.45,1 1,1 0.55,0 1,-0.45 1,-1 0,-0.55 -0.45,-1 -1,-1 z m -8,5 c 0,1.1 0.9,2 2,2 1.1,0 2,-0.9 2,-2 0,-0.33
                    -2,-8 -2,-8 0,0 -2,7.67 -2,8 z m 6,-9 c -0.55,0 -1,0.45 -1,1 0,0.55 0.45,1 1,1 0.55,0 1,-0.45 1,-1 0,-0.55 -0.45,-1 -1,-1 z"
                    clip-rule="evenodd"
                    fill-rule="evenodd"
                />
            </g>
            // <circle
            //     ref={(ref) => {this.capteurRef = ref}}
            //     className="capteurForPlan"
            //     cx={this.props.x ? this.props.x : 0}
            //     cy={this.props.y ? this.props.y : 0}
            //     r={0}
            //     stroke="black"
            //     strokeWidth={1}
            //     fill="white"
            //     opacity={1}
            //     onClick={() => this.props.onClick(this.props.capteur)}
            //     onMouseOver={this.props.onMouseOver}
            //     onMouseOut={this.props.onMouseOut}
            //     style={{cursor: 'pointer'}}
            // />
        );
    }
}
