import * as React from 'react';

export class LuminosityTemperature extends React.Component {
    constructor(props) {
        super(props);
        this.chartWidth=this.props.chartWidth;
        this.chartHeight=this.props.chartHeight;
    }

    shouldComponentUpdate() {
        return false;
    }

    render() {
        return (
            <svg width={this.chartWidth} height={this.chartHeight}>
                <rect x='0' y='0' width={this.chartWidth} height={this.chartHeight} fill="yellow" stroke="black"/>
            </svg>
        )
    }
}