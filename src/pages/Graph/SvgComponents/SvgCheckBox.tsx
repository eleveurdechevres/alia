import * as React from 'react';
import { EnumAlarm } from 'src/pages/Graph/CrossGraph/Mollier';
import { observer } from 'mobx-react';

interface IProps {
    alarm: EnumAlarm;
    selected: boolean;
    handleSelect: () => void;
}

@observer export class SvgCheckBox extends React.Component<IProps, {}> {
    constructor(props: IProps) {
        super(props);
    }

    render() {
        return (
            <g>
                <circle cx={5} cy={5} r={6} strokeWidth={1} stroke="black" fill="white" onClick={this.props.handleSelect}/>
                {
                    this.props.selected ?
                        <circle cx={5} cy={5} r={3} strokeWidth={1} stroke="steelblue" fill="steelblue"/> :
                        ''
                }
                <text x={15} y={0} fontSize={10} fontWeight="bold" fill="black" alignmentBaseline="text-before-edge" dominantBaseline="text-before-edge">{this.props.alarm}</text>
            </g>
        );
    }
}
