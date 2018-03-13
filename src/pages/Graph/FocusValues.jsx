import React, { Component } from 'react';
import GraphType from './GraphType';

export class FocusValues extends Component {
    render() {
        return (
        <g className="focusValues">
            <rect x='0' y="0" width="10" height="2" fill={GraphType.PRESENCE.color}/>
            <rect x="0" y="10" width="10" height="2" fill={GraphType.TEMPERATURE.color}/>
            <rect x="0" y="20" width="10" height="2" fill={GraphType.HUMIDITE.color}/>
            <rect x="0" y="30" width="10" height="2" fill={GraphType.LUMINOSITE.color} strokeWidth='1' stroke='black' shapeRendering='crispEdges'/>
        </g>
        )
    }
}
