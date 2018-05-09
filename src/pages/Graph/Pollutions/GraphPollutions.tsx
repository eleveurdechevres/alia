import * as React from 'react';
import { Pollution } from 'src/pages/Graph/Pollutions/Pollution';

interface IProps {
    humidity: number;
}

export class GraphPollutions extends React.Component<IProps, {}> {

    constructor(props: IProps) {
        super(props);
    }

    render() {
        
        let lineHeight: number = 100 / 8;
        console.log(lineHeight)
        return (
            <div>
                <svg x="0" y="0" width="100%" height="100%">
                    <rect x="0%" y="0%" width="100%" height="100%" fill="white" stroke="black"/>
                    <svg x="0%" y="0%" width="100%" height={lineHeight + '%'}>
                        <Pollution
                            label="Bactéries"
                            plages={[{xMax: 0, xMin: 30}]}
                            x={this.props.humidity}
                        />
                    </svg>
                    <svg x="0%" y={lineHeight + '%'} width="100%" height={lineHeight + '%'}>
                        <Pollution
                            label="Virus"
                            plages={[{xMax: 0, xMin: 40}]}
                            x={this.props.humidity}
                        />
                    </svg>
                    <svg x="0%" y={2 * lineHeight + '%'} width="100%" height={lineHeight + '%'}>
                        <Pollution
                            label="Virus"
                            plages={[{xMax: 0, xMin: 40}]}
                            x={this.props.humidity}
                        />
                    </svg>
                    <svg x="0%" y={3 * lineHeight + '%'} width="100%" height={lineHeight + '%'}>
                        <Pollution
                            label="Champignons"
                            plages={[{xMin: 60, xMax: 100}]}
                            x={this.props.humidity}
                        />
                    </svg>
                    <svg x="0%" y={4 * lineHeight + '%'} width="100%" height={lineHeight + '%'}>
                        <Pollution
                            label="Acariens"
                            plages={[{xMin: 50, xMax: 100}]}
                            x={this.props.humidity}
                        />
                    </svg>
                    <svg x="0%" y={5 * lineHeight + '%'} width="100%" height={lineHeight + '%'}>
                        <Pollution
                            label="Infections"
                            plages={[{xMax: 0, xMin: 50}]}
                            x={this.props.humidity}
                        />
                    </svg>
                    <svg x="0%" y={6 * lineHeight + '%'} width="100%" height={lineHeight + '%'}>
                        <Pollution
                            label="Allergies"
                            plages={[{xMax: 0, xMin: 50}, {xMin: 50, xMax: 100}]}
                            x={this.props.humidity}
                        />
                    </svg>
                    <svg x="0%" y={7 * lineHeight + '%'} width="100%" height={lineHeight + '%'}>
                        <Pollution
                            label="Ozone"
                            plages={[{xMax: 0, xMin: 60}]}
                            x={this.props.humidity}
                        />
                    </svg>
                </svg>
            </div>
        )
    }
}