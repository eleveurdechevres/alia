import * as React from 'react';
import { Colors } from '@blueprintjs/core';

export interface IPollutionProps {
    label: string;
    plages: Plage[];
    x: number | null;
}

interface Plage {
    xMin: number;
    xMax: number;
}

export class Pollution extends React.Component<IPollutionProps, {}> {

    constructor(props: IPollutionProps) {
        super(props);
    }

    render() {
        let x = this.props.x;
        return (
            <g>
                <rect x="0%" y="0%" width="25%" height="100%" stroke="white" fill={Colors.RED5} opacity="0.5"/>
                <text x="5" y="50%" fontSize={10} fontWeight="bold" fill="black" textAnchor="start" alignmentBaseline="middle">{this.props.label}</text>
                <svg x="25%" y="0%" height="100%" width="75%"  viewBox="0 0 100 100" preserveAspectRatio="none">
                    <rect x="0%" y="0%" width="40%" height="100%" stroke="white" fill={Colors.BLUE5} opacity="0.5"/>
                    <rect x="40%" y="0%" width="20%" height="100%" stroke="white" fill={Colors.GREEN5} opacity="0.5"/>
                    <rect x="60%" y="0%" width="40%" height="100%" stroke="white" fill={Colors.BLUE5} opacity="0.5"/>
                    {
                        this.props.plages.map((plage: Plage, index: number) => {
                            let xMin = plage.xMin;
                            let xMax = plage.xMax;
                            // let opacity = 1;
                            let fillColor = Colors.GREEN5;
                            // const minOpacity = 0.2;
                            // const maxOpacity = 1;
                            if ( (xMin < xMax && x >= xMin ) || 
                                 (xMin > xMax && x <= xMin ) ) {
//                                    opacity = minOpacity + (maxOpacity - minOpacity) / (xMax - xMin) * (x - xMin);
                                let diff = Math.abs(x - xMin);
                                let maxDiff = Math.abs(xMax - xMin);
                                if ( diff < ((maxDiff) / 5)) {
                                    fillColor = Colors.GREEN5;
                                } else if ( diff < (2 * (maxDiff) / 5)) {
                                    fillColor = Colors.ORANGE5;
                                } else if ( diff < (3 * (maxDiff) / 5)) {
                                    fillColor = Colors.ORANGE4;
                                } else if ( diff < (4 * (maxDiff) / 5)) {
                                    fillColor = Colors.RED5;
                                } else {
                                    fillColor = Colors.RED4;
                                }
                            }
                            
                            return <path key={index}  d={'M ' + xMax + ' 0 L ' + xMin + ' 100 L ' + xMax + ' 100'} fill={fillColor} stroke={Colors.WHITE}/>
                        })
                    }
                    <line x1={this.props.x + '%'} x2={this.props.x + '%'} y1="0%" y2="100%" stroke="steelblue" strokeWidth="0.5" shapeRendering="crispEdges"/>
                </svg>
            </g>
        )
    }
}