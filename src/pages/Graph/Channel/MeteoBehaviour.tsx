import * as React from 'react';
import * as d3 from 'd3';
import { observer } from 'mobx-react';
import { SunBehaviourManager } from 'src/managers/SunBehaviourManager';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips'; 
import { Icon, Colors } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons';
import { ScaleLinear } from 'd3';

interface IProps {
    sunBehaviourManager: SunBehaviourManager;
    time: Date,
    humidite: number,
    directionVent: number,
    vitesseVent: number,
    temperature: number
}

const minTemperature = -20;
const maxTemperature = 40;
const minTemperaturePosition = 90; // en %
const maxTemperaturePosition = 5; // en %

@observer export class MeteoBehaviour extends React.Component<IProps, {}> {

    private refRectHumidite: SVGRectElement;
    private refTextHumidite: SVGTextElement;
    private refgDirectionVent: SVGGElement;
    private refCircleTemperature: SVGCircleElement;
    private refRectTemperature: SVGRectElement;
    private refTextTemperature: SVGTextElement;
    private refLineTemperature: SVGLineElement;

    private scaleTemperature: ScaleLinear<number, number> = d3.scaleLinear();

    constructor(props: IProps) {
        super(props);
        this.scaleTemperature
            .domain([minTemperature, maxTemperature])
            .range([minTemperaturePosition, maxTemperaturePosition]);
    }

    componentDidUpdate() {
        if ( this.props.humidite !== undefined ) {
            d3.select(this.refRectHumidite)
                .transition()
                .attr('y', (100 - this.props.humidite) + '%')
                .attr('height', this.props.humidite + '%');

            let ordonneeHumidite = (100 - this.props.humidite);
            d3.select(this.refTextHumidite)
                .transition()
                .attr('y', (ordonneeHumidite > 95 ? 95 : ordonneeHumidite < 5 ? 5 : ordonneeHumidite) + '%');
        }

        if ( this.props.directionVent !== undefined ) {
            d3.select(this.refgDirectionVent)
                .transition()
                .attr('transform', 'translate(25, 25) rotate(' + (this.props.directionVent + 180) + ')');
        }

        if ( this.props.temperature !== undefined ) {
            d3.select(this.refCircleTemperature)
                .transition()
                .attr('cy', this.scaleTemperature(this.props.temperature) + '%');

            d3.select(this.refRectTemperature)
                .transition()
                .attr('y', this.scaleTemperature(this.props.temperature) + '%')
                .attr('height', minTemperaturePosition - this.scaleTemperature(this.props.temperature) + '%');

            d3.select(this.refTextTemperature)
                .transition()
                .attr('y', this.scaleTemperature(this.props.temperature) + '%')
                .attr('opacity', 1);
            d3.select(this.refLineTemperature)
                .transition()
                .attr('y1', this.scaleTemperature(this.props.temperature) + '%')
                .attr('y2', this.scaleTemperature(this.props.temperature) + '%')
                .attr('opacity', 1);
        } else {
            d3.select(this.refTextTemperature)
                .attr('opacity', 0);
            d3.select(this.refLineTemperature)
                .attr('opacity', 0);
        }
    }

    border1 = csstips.border('1px solid green');
    border2 = csstips.border('1px solid blue');
    border3 = csstips.border('1px solid yellow');

    render() {
        
        let graduationsTemperature = [-10, 0, 10, 20, 30].map(
            (valeur) => { return (
                <g key={valeur}>
                    <text x="38" y={this.scaleTemperature(valeur) + '%'} fontSize="10" textAnchor="end" alignmentBaseline="middle">{valeur}°C</text>
                    <line
                        x1="43"
                        x2="46"
                        y1={this.scaleTemperature(valeur) + '%'}
                        y2={this.scaleTemperature(valeur) + '%'}
                        stroke={Colors.BLUE5}
                        strokeWidth="2"
                    />
                </g>
            )}
        );

        return (
            <div className={style(csstips.flex, csstips.horizontal, csstips.fillParent, csstips.border('1px solid black'))}>
                <div className={style(csstips.center, csstips.vertical, csstips.width(100))}>
                    <div>
                        <Icon icon={IconNames.CLOUD} color={Colors.GRAY1} iconSize={Icon.SIZE_LARGE}/>
                    </div>
                    <div className={style(csstips.flex, csstips.center, csstips.vertical, {paddingTop: 10, paddingBottom: 10})}>
                        <svg width="100%" height="100%" className={style(csstips.flex)}>
                            {/* <rect x="0" y="0" width="100%" height="100%" fill="yellow" stroke={Colors.GRAY1} strokeWidth="1"/> */}
                            <text x="32" y="0%" fontSize="12" textAnchor="end" alignmentBaseline="text-before-edge">100%</text>
                            <text x="32" y="100%" fontSize="12" textAnchor="end" alignmentBaseline="text-after-edge">0%</text>
                            <rect
                                ref={(ref) => {this.refRectHumidite = ref}}
                                x="35"
                                y="100%"
                                width="30"
                                height="0%"
                                fill={Colors.GRAY1}
                                stroke={Colors.GRAY1}
                                strokeWidth="1"
                            />
                            <rect x="35" y="0" width="30" height="100%" fill="transparent" stroke={Colors.GRAY1} strokeWidth="1"/>

                            {  
                                this.props.humidite ? 
                                    <text
                                        ref={(ref) => {this.refTextHumidite = ref}}    
                                        x="68"
                                        y="95%"
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
                    <div>
                        Wind
                    </div>
                    <div className={style(csstips.content, csstips.center, csstips.vertical, {marginTop: 10, marginBottom: 10})}>
                        <svg width="50" height="50">
                            <circle cx="50%" cy="50%" r="24" fill={Colors.GOLD3} stroke={Colors.GOLD1} strokeWidth="0.5"/>
                            <circle cx="50%" cy="50%" r="22" fill={Colors.GOLD5} stroke={Colors.GOLD1} strokeWidth="0.5"/>
                            <line x1="50%" x2="50%" y1="4.5" y2="45.5" stroke={Colors.GOLD1} strokeWidth="1" />
                            <line x1="5" x2="45" y1="50%" y2="50%" stroke={Colors.GOLD1} strokeWidth="1" />
                            <line x1="10.5" y1="10.5" x2="39.5" y2="39.5" stroke={Colors.GOLD1} strokeWidth="1" />
                            <line x1="10.5" y1="39.5" x2="39.5" y2="10.5" stroke={Colors.GOLD1} strokeWidth="1" />
                            <circle cx="50%" cy="50%" r="16" fill={Colors.GOLD5} stroke={Colors.WHITE} strokeWidth="0"/>
                            <g
                                ref={(ref) => {this.refgDirectionVent = ref}}
                                transform="translate(25, 25)"
                                display={(this.props.directionVent === undefined || this.props.vitesseVent === undefined) ? 'none' : null}
                            >
                                <path transform="translate(-25, -25)" d="M 25 11 l 7 25 l -7 -7" fill={Colors.BLACK} stroke={Colors.BLACK}/>
                                <path transform="translate(-25, -25)" d="M 25 11 l -7 25 l 7 -7" fill={Colors.WHITE} stroke={Colors.BLACK}/>
                            </g>
                        </svg>
                    </div>
                    <div className={style(csstips.center)}>
                        {this.props.vitesseVent !== undefined ? this.props.vitesseVent : '-'} km/h 
                    </div>
                </div>
                <div className={style(csstips.flex)}>
                    {this.props.time.toString()}
                    {/* <svg ref={(ref) => {this.sunChartRef = ref}} width="100%" height="100%"/> */}
                </div>
                <div className={style(csstips.center, csstips.vertical, csstips.width(100))}>
                    <svg width="100" height="100%">
                        <circle cx="50" cy="5%" r="5" fill={Colors.WHITE} stroke={Colors.BLUE5} strokeWidth="6"/>
                        <rect x="45" y="5%" width="10" height={minTemperaturePosition - maxTemperaturePosition + '%'} fill={Colors.WHITE} stroke={Colors.BLUE5} strokeWidth="6"/>
                        <circle cx="50" cy={minTemperaturePosition + '%'} r="10" fill={Colors.WHITE} stroke={Colors.BLUE5} strokeWidth="6"/>

                        <circle cx="50" cy="5%" r="5" fill={Colors.WHITE} stroke={Colors.WHITE} strokeWidth="2"/>
                        <rect x="45" y="5%" width="10" height={minTemperaturePosition - maxTemperaturePosition + '%'} fill={Colors.WHITE} stroke={Colors.WHITE} strokeWidth="2"/>
                        <circle cx="50" cy={minTemperaturePosition + '%'} r="10" fill={Colors.WHITE} stroke={Colors.WHITE} strokeWidth="2"/>

                        <circle
                            ref={(ref) => {this.refCircleTemperature = ref}}
                            cx="50"
                            cy={this.scaleTemperature(minTemperature) + '%'}
                            r="2"
                            fill={Colors.RED2}
                            strokeWidth="0"
                        />
                        <rect
                            ref={(ref) => {this.refRectTemperature = ref}}
                            x="48"
                            y={minTemperaturePosition + '%'}
                            width="4"
                            height="0%"
                            fill={Colors.RED2}
                            strokeWidth="0"
                        />
                        <circle cx="50" cy={minTemperaturePosition + '%'} r="8" fill={Colors.RED2} strokeWidth="0"/>
                        {graduationsTemperature}
                        <g>
                            <text
                                ref={(ref) => {this.refTextTemperature = ref}}
                                x="62"
                                y={minTemperaturePosition}
                                fontSize="10"
                                textAnchor="start"
                                alignmentBaseline="middle"
                                opacity="0"
                            >
                                {this.props.temperature} °C
                            </text>
                            <line
                                ref={(ref) => {this.refLineTemperature = ref}}
                                x1="58"
                                x2="60"
                                y1={minTemperaturePosition + '%'}
                                y2={minTemperaturePosition + '%'}
                                stroke={Colors.BLUE5}
                                strokeWidth="2"
                                opacity="0"
                            />
                        </g>
                    </svg>
                </div>
            </div>
        )
    }
}