import * as React from 'react';
import { observer } from 'mobx-react';
import { ICrosshairTime } from 'src/pages/Graph/Channel/GraphChannel';
import { SunBehaviourManager } from 'src/managers/SunBehaviourManager';
// import { autorun } from 'mobx';
// import * as Moment from 'moment';

interface IProps {
    sunBehaviourManager: SunBehaviourManager;
    crossHairTime: ICrosshairTime,
    chartWidth: number,
    chartHeight: number
}

@observer export class SunBehaviour extends React.Component<IProps, {}> {

    private chartWidth: number;
    private chartHeight: number;

    constructor(props: IProps) {
        super(props);
        this.chartWidth = this.props.chartWidth;
        this.chartHeight = this.props.chartHeight;
    }

    componentDidMount() {
        // TODO
    }

    render() {
        return (
            <div>
                <svg width={this.props.chartWidth} height={this.props.chartHeight}>
                    <rect x="0" y="0" width={this.chartWidth} height={this.chartHeight} fill="transparent" stroke="black" strokeWidth="1"/>
                </svg>
            </div>
        )
    }
}