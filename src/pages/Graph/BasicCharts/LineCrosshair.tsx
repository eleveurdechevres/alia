import * as d3 from 'd3';
import { observer } from 'mobx-react';
import * as React from 'react';
import { style } from 'typestyle';

interface IProps {
    crosshairHeight: number;
    crosshairWidth: number;
    crosshairState: ILineChartCrosshairState;
    xAxisHeight: number;
    yAxisWidth: number;
}

export interface ILineChartCrosshairState {
    xDisplayed: boolean;
    yDisplayed: boolean;
    position: {
        x: number;
        y: number;
    };
    mousePosition: {
        x: number;
        y: number;
    };
    xTime: Date | string | undefined;
    xValue: number | undefined;
    yValue: number;
    textDisplayed: string | null;
    crossHairTimeFormat: string
};

export const crosshairParams = {
    width: {
        time: 80,
        shot: 40,
        yValue: 40,
        xValue: 120
    },
    height: 16,
    fontSize: 12,
    serieLegendWidth: 200
};

const marginToLegend = 2;

@observer export class LineCrosshair extends React.Component<IProps, {}> {

    constructor(props: IProps) {
        super(props);
    }

    public render() {
        let lineStroke = 'black';
        let rectFill = 'steelblue';
        let rectStroke = 'blue';
        let textFill = 'white';
        let timeFormat = d3.timeFormat(this.props.crosshairState.crossHairTimeFormat);
        return (
            <g pointerEvents="none">
                <g opacity={this.displayX()}>
                    <line
                        className={style({willChange: 'transform'})}
                        x1={this.props.crosshairState.position.x}
                        x2={this.props.crosshairState.position.x}
                        y1={-20}
                        y2={this.props.crosshairHeight + this.props.xAxisHeight}
                        stroke={lineStroke}
                        strokeWidth={1}
                        shapeRendering="crispEdges"
                    />

                    {/* Crosshair time caption */}
                    { this.props.crosshairState.xTime ? (
                        <g>
                            <rect
                                x={this.props.crosshairState.position.x - crosshairParams.width.time / 2}
                                y={-crosshairParams.height - 2}
                                rx={3}
                                ry={3}
                                width={crosshairParams.width.time}
                                height={crosshairParams.height}
                                fill={rectFill}
                                stroke={rectStroke}
                                shapeRendering="geometricPrecision"
                            />

                            <text
                                x={this.props.crosshairState.position.x}
                                y={-2}
                                fontSize={crosshairParams.fontSize}
                                fill={textFill}
                                textAnchor="middle"
                                alignmentBaseline="after-edge"
                            >
                                {
                                    this.props.crosshairState.xTime instanceof String ? this.props.crosshairState.xTime :
                                    this.props.crosshairState.xTime instanceof Date ? timeFormat(new Date(this.props.crosshairState.xTime)) : ''
                                }
                            </text>
                        </g>)
                        :
                        <g/>
                    }

                    {/* Crosshair xValue caption (for scatter plot...) */}
                    { this.props.crosshairState.xValue ?
                        [
                            <rect
                                key={1}
                                x={this.props.crosshairState.position.x - crosshairParams.width.xValue / 2}
                                y={this.props.crosshairHeight + marginToLegend}
                                rx={3}
                                ry={3}
                                width={crosshairParams.width.xValue}
                                height={crosshairParams.height}
                                fill={rectFill}
                                stroke={rectStroke}
                                shapeRendering="geometricPrecision"
                            />,

                            <text
                                key={2}
                                x={this.props.crosshairState.position.x}
                                y={this.props.crosshairHeight + crosshairParams.height / 2 + marginToLegend}
                                fontSize={crosshairParams.fontSize}
                                fill={textFill}
                                textAnchor="middle"
                                alignmentBaseline="central"
                            >
                                {this.props.crosshairState.xValue}
                            </text>
                        ]
                        : ''
                    }
                </g>

                <g opacity={this.displayY()}>
                    <line
                        x1={-this.props.yAxisWidth}
                        x2={this.props.crosshairWidth}
                        y1={this.props.crosshairState.position.y}
                        y2={this.props.crosshairState.position.y}
                        stroke={lineStroke}
                        strokeWidth={1}
                        shapeRendering="crispEdges"
                        opacity={this.displayY()}
                    />

                    <rect
                        x={0 - crosshairParams.width.yValue - marginToLegend}
                        y={this.props.crosshairState.position.y - crosshairParams.height / 2}
                        rx={3}
                        ry={3}
                        width={crosshairParams.width.yValue}
                        height={crosshairParams.height}
                        fill={rectFill}
                        stroke={rectStroke}
                        shapeRendering="geometricPrecision"
                    />

                    <text
                        x={0 - crosshairParams.width.yValue + crosshairParams.width.yValue / 2 - marginToLegend}
                        y={this.props.crosshairState.position.y}
                        fontSize={crosshairParams.fontSize}
                        fill={textFill}
                        textAnchor="middle"
                        alignmentBaseline="central"
                    >
                        {this.props.crosshairState.yValue.toFixed(2)}
                    </text>
                </g>

                <g
                    opacity={this.props.crosshairState.textDisplayed ? 1 : 0}
                    transform={'translate(' + this.props.crosshairState.mousePosition.x + ',' + this.props.crosshairState.mousePosition.y + ')'}
                >
                    <line
                        x1={0}
                        y1={0}
                        x2={+ 20}
                        y2={- 20}
                        width={crosshairParams.serieLegendWidth}
                        height={crosshairParams.height}
                        stroke={lineStroke}
                        shapeRendering="crispEdges"
                    />

                    <rect
                        x={+ 20}
                        y={- 20 - crosshairParams.height}
                        rx={3}
                        ry={3}
                        width={crosshairParams.serieLegendWidth}
                        height={crosshairParams.height}
                        fill={rectFill}
                        stroke={rectStroke}
                        shapeRendering="geometricPrecision"
                    />

                    <text
                        x={+ 20 + crosshairParams.serieLegendWidth / 2}
                        y={- 21 - crosshairParams.height / 2}
                        fontSize={crosshairParams.fontSize}
                        fill={textFill}
                        textAnchor="middle"
                        alignmentBaseline="central"
                    >
                        {this.props.crosshairState.textDisplayed}
                    </text>
                </g>
            </g>
        );
    }

    private displayX = () => {
        return this.props.crosshairState.xDisplayed ? '1' : '0';
    }

    private displayY = () => {
        return this.props.crosshairState.yDisplayed ? '1' : '0';
    }
}
