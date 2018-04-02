import * as React from 'react';
import { observer } from 'mobx-react';
import { SunBehaviourManager } from 'src/managers/SunBehaviourManager';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips'; 
import { Icon, Colors } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons';

interface IProps {
    sunBehaviourManager: SunBehaviourManager;
    time: Date,
    humidite: number,
    directionVent: number,
    vitesseVent: number
}

@observer export class SunBehaviour extends React.Component<IProps, {}> {

    refhumidity: SVGSVGElement;
    sunChartRef: SVGSVGElement;

    constructor(props: IProps) {
        super(props);
    }

    componentDidUpdate() {
        // TODO
    }

    border1 = csstips.border('1px solid green');
    border2 = csstips.border('1px solid blue');
    border3 = csstips.border('1px solid yellow');

    render() {
        let ordonneeHumidite = (100 - this.props.humidite);

        return (
            <div className={style(csstips.flex, csstips.horizontal, csstips.fillParent, this.border1)}>
                <div className={style(csstips.center, csstips.vertical, csstips.width(100))}>
                    <div>
                        <Icon icon={IconNames.CLOUD} color={Colors.GRAY1} iconSize={Icon.SIZE_LARGE}/>
                    </div>
                    <div className={style(csstips.flex, csstips.center, csstips.vertical, {marginTop: 10, marginBottom: 10})}>
                        <svg width="100%" height="100%">
                            {/* <rect x="0" y="0" width="100%" height="100%" fill="yellow" stroke={Colors.GRAY1} strokeWidth="1"/> */}
                            <text x="32" y="0%" fontSize="12" textAnchor="end" alignmentBaseline="text-before-edge">100%</text>
                            <text x="32" y="100%" fontSize="12" textAnchor="end" alignmentBaseline="text-after-edge">0%</text>
                            <rect x="35" y={(100 - this.props.humidite) + '%'} width="30" height={this.props.humidite + '%'} fill={Colors.GRAY1} stroke={Colors.GRAY1} strokeWidth="1"/>
                            <rect x="35" y="0" width="30" height="100%" fill="transparent" stroke={Colors.GRAY1} strokeWidth="1"/>

                            {  
                                this.props.humidite ? 
                                    <text
                                        x="68"
                                        y={(ordonneeHumidite > 95 ? 95 : ordonneeHumidite < 5 ? 5 : ordonneeHumidite) + '%'}
                                        fontSize="12"
                                        textAnchor="start"
                                        alignmentBaseline="middle"
                                    >
                                        {this.props.humidite} %
                                    </text>
                                    :
                                    <div/>

                            }
                        </svg>
                    </div>
                    <div className={style(csstips.vertical)}>
                        <div className={style(csstips.fillParent)}>
                            Wind
                        </div>
                        <div className={style(csstips.flex)}>
                            <svg width="50" height="50">
                                <circle cx="50%" cy="50%" r="24" fill={Colors.GOLD3} stroke={Colors.GOLD1} strokeWidth="0.5"/>
                                <circle cx="50%" cy="50%" r="22" fill={Colors.GOLD5} stroke={Colors.GOLD1} strokeWidth="0.5"/>
                                <line x1="50%" x2="50%" y1="4.5" y2="45.5" stroke={Colors.GOLD1} strokeWidth="1" />
                                <line x1="5" x2="45" y1="50%" y2="50%" stroke={Colors.GOLD1} strokeWidth="1" />
                                <line x1="10.5" y1="10.5" x2="39.5" y2="39.5" stroke={Colors.GOLD1} strokeWidth="1" />
                                <line x1="10.5" y1="39.5" x2="39.5" y2="10.5" stroke={Colors.GOLD1} strokeWidth="1" />
                                <circle cx="50%" cy="50%" r="16" fill={Colors.GOLD5} stroke={Colors.WHITE} strokeWidth="0"/>
                                <g
                                    transform={'translate(25, 25) rotate(' + (this.props.directionVent + 180) + ')'}
                                    display={(this.props.directionVent === undefined || this.props.vitesseVent === undefined) ? 'none' : null}
                                >
                                    <path transform="translate(-25, -25)" d="M 25 11 l 7 25 l -7 -7" fill={Colors.BLACK} stroke={Colors.BLACK}/>
                                    <path transform="translate(-25, -25)" d="M 25 11 l -7 25 l 7 -7" fill={Colors.WHITE} stroke={Colors.BLACK}/>
                                </g>
                            </svg>
                        </div>
                        <div className={style(csstips.fillParent)}>
                            {this.props.vitesseVent ? this.props.vitesseVent : '-'} km/h 
                        </div>
                    </div>
                </div>
                <div className={style(csstips.flex, this.border3)}>
                    {this.props.time.toString()}
                    {/* <svg ref={(ref) => {this.sunChartRef = ref}} width="100%" height="100%"/> */}
                </div>
            </div>
        )
    }
}