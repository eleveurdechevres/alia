// import { ContextMenu } from '@blueprintjs/core';
// import '@blueprintjs/core/lib/css/blueprint.css';
// import * as d3 from 'd3';
// import { Axis, BrushBehavior, ScaleLinear, ScaleOrdinal } from 'd3';
// import { observable, observe } from 'mobx';
// import { observer } from 'mobx-react';
// import * as React from 'react';
// import * as saveSvgAsPng from 'save-svg-as-png';
// import { style } from 'typestyle';
// import { IMargin } from '../../../chart/BaseChart';
// import { CandleBaseChart } from '../../../chart/CandleBaseChart';
// import * as LookAndFeelDictionary from '../../../chart/LookAndFeelDictionary';
// import * as NavColors from '../../../chart/NavColors';
// import { ISheet } from '../../../store/ChartStore';
// import * as LookAndFeelStore from '../../../store/LookAndFeelStore';
// import { IhandleGlobalMarkersManager } from '../../Charts';
// import { ILineChartCrosshairState, LineCrosshair } from '../LineCrosshair';
// import { IhandleSheetMarkersManager } from '../SheetComponent';
// import { GenericChartComponent, IPropsGenericChartComponent } from './GenericChartComponent';

// interface IProps extends IPropsGenericChartComponent {
//     sheet: ISheet;
//     iPartition: number;
//     handleGlobalMarkersManager: IhandleGlobalMarkersManager;
//     handleSheetMarkersManager: IhandleSheetMarkersManager;
//     horizontalMarkers: number[];
// }

// const fitToParent = style({width: '100%'});
// const mousePointerClassName = style({cursor: 'pointer', pointerEvents: 'visible'});

// const svgBorderWidth = 0;
// const horizontalContextHeight = 70;
// const verticalContextWidth = 50;
// const yAxisWidth = 50;
// const xAxisHeight = 50;

// const legendRectSize = 14;
// const legendSpacing = 4;
// const legendItemHeight = legendRectSize + legendSpacing;
// const legendLeftMargin = 10;
// const legendColumnWidth = 180;

// const crossHairRectWidth = 100;

// const helpButtonDefaultScale = 0.08;
// const mouseoverRescale = 1.2;

// const defaultTransition = d3.transition()
// .duration(750)
// .ease(d3.easeExp);
// const zoomTransition = defaultTransition;

// @observer export class CandleChartComponent extends GenericChartComponent<IProps> {

//     // Mesures
//     private totalWidth: number;
//     private totalHeight: number;
//     private chartWidth: number;
//     private chartHeight: number;
//     private marginChart: IMargin;
//     private marginHorizontalContext: IMargin;
//     private marginVerticalContext: IMargin;

//     // Chart js object
//     private baseChart: CandleBaseChart;

//     // References of SVG graphic components
//     private refGChart: SVGGElement;
//     private refChartFocus: SVGGElement;
//     private refGVerticalContextMarkers: SVGGElement;
//     private refGHorizontalMarkers: SVGGElement;

//     private refGVerticalContext: SVGGElement;
//     private refGVerticalBrush: SVGGElement;
//     private refGVerticalBrushDetail: SVGGElement;

//     private refGVerticalContextAxisY: SVGGElement;

//     // Candle legends on mouseover
//     private refCandleMouceOverRect: SVGRectElement;
//     private refGCandleLegends: SVGGElement;
//     private refGCandleCrosshair: SVGGElement;
//     private refCandleMaxText: SVGTextElement;
//     private refCandleJeanPaulMaxText: SVGTextElement;
//     private refCandleMoyText: SVGTextElement;
//     private refCandleJeanPaulMinText: SVGTextElement;
//     private refCandleMinText: SVGTextElement;

//     private refRectCrosshairX: SVGRectElement;
//     private refTextCrosshairX: SVGTextElement;

//     // Popup Menu
//     @observable private markersShown = true;
//     private newMarkerXDateIndex = NaN;
//     private newMarkerYValue = NaN;
//     private markersColorScale: ScaleOrdinal<string, string> = NavColors.createDefaultColorScale();
//     private xLastClick: number;
//     private yLastClick: number;
//     private refInputMarker;

//     // d3 components
//     private verticalBrush: BrushBehavior<{}>;
//     private verticalBrushDetail: BrushBehavior<{}>;
//     private yHorizontalContext: ScaleLinear<number, number>;
//     private yVerticalContext: ScaleLinear<number, number>;
//     private yAxisContext: Axis<number | { valueOf(): number; }>;
//     // helpIconRef;

//     // Utils
//     private mapCrosshairValues: Map<string, number> = new Map();

//     // @observable private xMouseOverGroup: number | undefined;
//     // @observable private xMouseOverCandle: number | undefined;
//     // @observable private mouseOverCandle: ICandle | undefined;
//     // @observable private isDiplayCandleLegends: boolean;

//     private saveXDomain: Date[];
//     private saveYDomain: number[];

//     @observable private crosshairState: ILineChartCrosshairState = {
//         xDisplayed: false,
//         yDisplayed: false,
//         position: {
//             x: 0,
//             y: 0
//         },
//         mousePosition: {
//             x: 0,
//             y: 0
//         },
//         shotDef: undefined,
//         xValue: undefined,
//         xTime: undefined,
//         yValue: 0,
//         textDisplayed: null,
//         crossHairTimeFormat: ''
//     };

//     constructor(props) {
//         super(props);

//         observe(this.props.horizontalMarkers, (change) => {
//             this.updateHorizontalMarkers();
//         });

//         this.marginChart = {
//             top: svgBorderWidth + xAxisHeight,
//             bottom: svgBorderWidth + horizontalContextHeight + 2 * xAxisHeight,
//             left: svgBorderWidth + verticalContextWidth + yAxisWidth,
//             right: svgBorderWidth
//         };

//         this.baseChart = new CandleBaseChart(
//             // this.props.xData,
//             // this.props.chartData,
//             this.props.sheet,
//             this.props.iPartition,
//             this.props.width,
//             this.props.height,
//             LookAndFeelStore.getMode(),
//             this.marginChart
//         );
//     }

//     public componentWillMount() {
//         this.updateChartComponent(this.saveXDomain, this.saveYDomain);
//     }

//     public componentDidMount() {
//         this.drawChart(true);
//         this.updateComponents();
//     }

//     public componentWillUpdate() {
//         this.saveYDomain = this.baseChart.yChart.domain();
//         this.updateChartComponent(this.saveXDomain, this.saveYDomain);
//     }

//     public componentDidUpdate() {
//         this.drawChart(false);
//         this.baseChart.updateChart(LookAndFeelStore.getMode());
//         this.updateComponents();
//     }

//     public render() {
//         return (
//                 <svg width={this.totalWidth} height={this.totalHeight} id='svgChart'>
//                     <defs>
//                         <clipPath id='clip'>
//                             <rect width={this.chartWidth} height={this.chartHeight} />
//                         </clipPath>
//                     </defs>
//                     <g transform={'translate(' + this.marginChart.left + ',' + this.marginChart.top + ')'}>

//                         <g className='horizontalMarkers' ref={ (ref) => { if (ref) { this.refGHorizontalMarkers = ref; } }} clipPath='url(#clip)'/>
//                         <g
//                             id='generalBrush'
//                             className='verticalContextDetail'
//                             ref={(ref) => { if (ref) { this.refGVerticalBrushDetail = ref; } }}
//                             transform={'translate(' + (- yAxisWidth) + ',0)'}
//                         >
//                             <rect
//                                 ref={(ref) => { if (ref) { this.refChartFocus = ref; } }}
//                                 width={this.chartWidth}
//                                 height={this.chartHeight}
//                                 fill='none'
//                             />
//                         </g>
//                     </g>
//                     <g ref={ (ref) => { if (ref) { this.refGChart = ref; } } }>
//                     </g>
//                     <g transform={'translate(' + this.marginChart.left + ',' + this.marginChart.top + ')'}>
//                         <LineCrosshair
//                             crosshairWidth={this.chartWidth}
//                             crosshairHeight={this.chartHeight}
//                             crosshairState={this.crosshairState}
//                             xAxisHeight={xAxisHeight}
//                             yAxisWidth={yAxisWidth}
//                         />
//                         <g ref={(ref) => { if (ref) { this.refGCandleCrosshair = ref; } } } pointerEvents='none'>
//                             <rect ref={(ref) => { if (ref) { this.refRectCrosshairX = ref; } } }
//                                 y={-18}
//                                 rx={3} ry={3}
//                                 width={crossHairRectWidth} height={16}
//                                 shapeRendering='geometricPrecision'
//                             />

//                             <text ref={(ref) => { if (ref) { this.refTextCrosshairX = ref; } } }
//                                 y={-2}
//                                 fontSize={12}
//                                 textAnchor='middle'
//                                 alignmentBaseline='after-edge'
//                             />
//                         </g>
//                     </g>
//                     <g transform={'translate(' + this.marginChart.left + ',' + this.marginChart.top + ')'} clipPath='url(#clip)'>
//                         <g ref={(ref) => { if (ref) { this.refGCandleLegends = ref; } } } pointerEvents='none' opacity={0}>

//                             <rect ref={(ref) => { if (ref) { this.refCandleMouceOverRect = ref; } }}
//                                 width={this.baseChart.candleWidth}
//                                 strokeWidth={3}
//                                 fill='none'
//                             />

//                             <text ref={(ref) => { if (ref) { this.refCandleMaxText = ref; } } }
//                                 fontSize={12}
//                                 alignmentBaseline='middle'
//                                 paintOrder='stroke'
//                                 strokeWidth={2}
//                             />

//                             <text ref={(ref) => { if (ref) { this.refCandleJeanPaulMaxText = ref; } } }
//                                 fontSize={12}
//                                 alignmentBaseline='middle'
//                                 paintOrder='stroke'
//                                 strokeWidth={2}
//                             />

//                             <text ref={(ref) => { if (ref) { this.refCandleMoyText = ref; } } }
//                                 fontSize={12}
//                                 alignmentBaseline='middle'
//                                 paintOrder='stroke'
//                                 strokeWidth={2}
//                             />

//                             <text ref={(ref) => { if (ref) { this.refCandleJeanPaulMinText = ref; } } }
//                                 fontSize={12}
//                                 alignmentBaseline='middle'
//                                 paintOrder='stroke'
//                                 strokeWidth={2}
//                             />

//                             <text ref={(ref) => { if (ref) { this.refCandleMinText = ref; } } }
//                                 fontSize={12}
//                                 alignmentBaseline='middle'
//                                 paintOrder='stroke'
//                                 strokeWidth={2}
//                             />
//                         </g>
//                     </g>
//                     <g className='verticalContext' ref={(ref) => {if (ref) { this.refGVerticalContext = ref; } }}
//                         transform={'translate(' + this.marginVerticalContext.left + ',' + this.marginVerticalContext.top + ')'}>
//                         <g className='horizontalMarkers' ref={ (ref) => { if (ref) { this.refGVerticalContextMarkers = ref; } }}/>
//                         <g ref={(ref) => {if (ref) { this.refGVerticalBrush = ref; } }}/>
//                         <g ref={(ref) => {if (ref) { this.refGVerticalContextAxisY = ref; } }}
//                             transform={'translate(0,0)'}>
//                         </g>
//                     </g>
//                 </svg>
//         );
//     }

//     private updateChartComponent(domainTime: Date[] | undefined, domainY: number[] | undefined): void {

//         if ( domainY ) {
//             this.baseChart.yChart.domain(domainY);
//         }

//         this.totalWidth = this.props.width;
//         this.totalHeight = this.props.height;
//         this.chartHeight = this.totalHeight - this.marginChart.top - this.marginChart.bottom;

//         this.chartWidth = this.totalWidth - this.marginChart.left - this.marginChart.right - legendLeftMargin - this.baseChart.legendWidth;

//         this.marginVerticalContext = {
//             top: this.marginChart.top,
//             bottom: this.marginChart.bottom,
//             left: svgBorderWidth,
//             right: this.totalWidth - verticalContextWidth - svgBorderWidth
//         };
//         this.marginHorizontalContext = {
//             top: this.marginChart.top + this.chartHeight + xAxisHeight,
//             bottom: svgBorderWidth,
//             left: this.marginChart.left,
//             right: this.marginChart.right
//         };

//         let yDomain = this.baseChart.yChartDomainDefault;
//         if (this.props.sheet.sheetDef.isYAxisInverted) yDomain.reverse();

//         this.yHorizontalContext = d3.scaleLinear().domain(yDomain).range([0, horizontalContextHeight]);
//         this.yVerticalContext = d3.scaleLinear().domain(yDomain).range([0, this.chartHeight]);

//         this.yAxisContext = d3.axisRight(this.yVerticalContext);

//         this.verticalBrush = d3.brushY()
//             .extent([[0, 0], [verticalContextWidth, this.chartHeight]])
//             .on('brush end', this.verticalBrushed);

//         this.verticalBrushDetail = d3.brushY()
//             .extent([[0, 0], [yAxisWidth + this.chartWidth, this.chartHeight]])
//             .on('end', this.verticalBrushedDetail);
//     }

//     private verticalBrushed = (): void => {
//         if ( d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom' ) {
//             return; // ignore brush-by-zoom
//         }
//         let selection = d3.event.selection || this.yVerticalContext.range();
//         this.baseChart.yChart.domain(selection.map(this.yVerticalContext.invert, this.yVerticalContext));
//         this.baseChart.updateBargraphs(LookAndFeelStore.getMode());
//         this.baseChart.updateYAxis(LookAndFeelStore.getMode());
//         this.updateHorizontalMarkers();
//     }

//     private verticalBrushedDetail = (): void => {
//         let s = d3.event.selection;
//         if (s) {
//             d3.select(this.refGVerticalBrushDetail).call(this.verticalBrushDetail.move, null);

//             d3.select(this.refGVerticalBrush)
//                 .call(this.verticalBrush)
//                 .transition(zoomTransition)
//                 .call(this.verticalBrush.move);
//             this.updateVerticalContext([s[0], s[1]].map(this.baseChart.yChart.invert, this.baseChart.yChart), zoomTransition);
//         }
//     }

//     private displayCrosshair = (): void => {
//         this.displayCrosshairY();
//     }

//     private displayCrosshairY = (): void => {
//         switch ( d3.event.type ) {
//             case 'mouseover':
//             case 'mousemove':
//                 let srcElement = d3.event.target || d3.event.srcElement;
//                 let yMouse = d3.mouse(srcElement)[1];
//                 let y = this.baseChart.yChart.invert(d3.mouse(srcElement)[1]);
                
//                 this.crosshairState.mousePosition.y = yMouse;

//                 this.crosshairState.position.y = this.baseChart.yChart(y);
//                 this.crosshairState.yValue = y;

//                 this.crosshairState.yDisplayed = true;
//                 break;
//             case 'mouseout':
//             default:
//                 this.crosshairState.yDisplayed = false;
//                 this.crosshairState.xDisplayed = false;
//                 this.mapCrosshairValues.clear();
//                 break;
//         }
//     }

//     private resetZoomY = () => {
//         let domain = this.baseChart.yChartDomainDefault.slice();
//         if (this.props.sheet.sheetDef.isYAxisInverted) {
//             domain.reverse();
//         }
//         this.updateVerticalContext(domain, zoomTransition);
//     }

//     private resetZoom = () => {
//         this.resetZoomY();
//     }

//     private updateVerticalContext = (domain, transition) => {
//         let range = domain.map(this.yVerticalContext, this.yVerticalContext.invert);
//         let brush = d3.select(this.refGVerticalBrush).call(this.verticalBrush);
//         if ( transition ) {
//             brush.transition(transition).call(this.verticalBrush.move, range);
//         }
//         else {
//             brush.call(this.verticalBrush.move, range);
//         }
//     }

//     /**
//      * Export the chart in png file.
//      */
//     private saveChartAsPng = (event) => {
//         saveSvgAsPng.saveSvgAsPng(
//             document.getElementById('svgChart'),
//             `${this.props.sheet.sheetName}.png`,
//             {backgroundColor : 'white', encoderOptions: 1}
//         );
//     }

//     /**
//      * Export series in CVS file.
//      */
//     // private saveChartAsCSV = (event) => {
//     //     let cvsData: string[] = [];

//     //     let header = '';
//     //     header = header.concat('shot');
//     //     this.props.chartData.series.forEach((serie) => {
//     //         header = header.concat(',' + serie.serie_name);
//     //     });
//     //     header = header.concat('\n');
//     //     cvsData.push(header);

//     //     let row = '';
//     //     this.props.xData.shots.forEach((shotNumber, i) => {
//     //         row = row.concat(String(shotNumber));
//     //         this.props.chartData.series.forEach((serie) => {
//     //             row = row.concat(',' + String(serie.values[i]));
//     //         });
//     //         row = row.concat('\n');
//     //         cvsData.push(row);
//     //         row = '';
//     //     });

//     //     let blob = new Blob(cvsData, { type: 'text/cvs;charset=utf-8' });
//     //     fileSaver.saveAs(blob, `${this.props.series[0].name}.cvs`);
//     // }

//     private handleAddHorizontalMarker = (): void => {
//         ContextMenu.hide();
//         this.props.handleSheetMarkersManager.addHorizontalMarker(this.newMarkerYValue);
//     }

//     private handleRemoveAllMarkers = (): void => {
//         ContextMenu.hide();
//         this.markersShown = true;
//         this.props.handleSheetMarkersManager.removeAllHorizontalMarkers();
//     }

//     private handleHideShowMarkers = (): void => {
//         ContextMenu.hide();
//         this.markersShown = !this.markersShown;
//         this.updateHorizontalMarkers();
//     }

//     private drawChart = (callBrushes: boolean): void => {
//         if ( this.refGChart ) {
//             this.baseChart.createChart(this.refGChart);
//             this.baseChart.candleGroups

//             .on('mouseover', (serieName: string, indexCandleGroup: number) => {
//                 let xGroup = this.baseChart.candleGroupMargin + this.baseChart.xChart(serieName) - this.baseChart.candleGroupWidth / 2;
//                 d3.select(this.refGCandleLegends)
//                     .transition()
//                     .attr('transform', 'translate(' + xGroup + ',0)')
//                     .attr('opacity', 1);
//                 d3.select(this.refGCandleCrosshair)
//                     .transition()
//                     .attr('transform', 'translate(' + xGroup + ',0)')
//                     .attr('opacity', 1);
//             })
//             .on('mouseout', () => {
//                 d3.select(this.refGCandleLegends)
//                     .transition()
//                     .attr('opacity', 0);
//                 d3.select(this.refGCandleCrosshair)
//                     .transition()
//                     .attr('opacity', 0);
//             });
                
//             this.baseChart.candles
//             .on('mouseover', (candle, indexCandle: number) => {
//                 let serieData = candle.serieData;

//                 let xMouseOverCandle = indexCandle * this.baseChart.candleSpace;
//                 let xMiddleCandle = xMouseOverCandle + this.baseChart.candleSpace / 2;
//                 let marginText = this.baseChart.candleWidth / 2 + 5;
//                 let textFill = LookAndFeelDictionary.getLookAndFeelValue('candle', 'textFill', LookAndFeelStore.getMode());
//                 let textStroke = LookAndFeelDictionary.getLookAndFeelValue('candle', 'textStroke', LookAndFeelStore.getMode());
//                 let stroke = LookAndFeelDictionary.getLookAndFeelValue('candle', 'stroke', LookAndFeelStore.getMode());

//                 d3.select(this.refRectCrosshairX )
//                     .transition()
//                     .attr('x', xMouseOverCandle + this.baseChart.candleSpace / 2 - crossHairRectWidth / 2)
//                     .attr('fill', LookAndFeelDictionary.getLookAndFeelValue('crosshair', 'rectFill', LookAndFeelStore.getMode()))
//                     .attr('stroke', LookAndFeelDictionary.getLookAndFeelValue('crosshair', 'rectStroke', LookAndFeelStore.getMode()));
                    
//                 d3.select(this.refTextCrosshairX)
//                     .transition()
//                     .attr('x', xMouseOverCandle + this.baseChart.candleSpace / 2)
//                     .attr('fill', LookAndFeelDictionary.getLookAndFeelValue('crosshair', 'textFill', LookAndFeelStore.getMode()))
//                     .text(candle.legendItem.serieName);
                
//                 d3.select(this.refCandleMouceOverRect)
//                     .transition()
//                     .attr('x', xMiddleCandle - this.baseChart.candleWidth / 2)
//                     .attr('y', Math.min(this.baseChart.yChart(serieData.v_avg + serieData.v_sd), this.baseChart.yChart(serieData.v_avg - serieData.v_sd)))
//                     .attr('height', Math.abs(this.baseChart.yChart(serieData.v_avg + serieData.v_sd) - this.baseChart.yChart(serieData.v_avg - serieData.v_sd)))
//                     .attr('stroke', stroke);
                    
//                 d3.select(this.refCandleMaxText)
//                     .transition()
//                     .attr('text-anchor', 'start')
//                     .attr('x', xMiddleCandle + marginText )
//                     .attr('y', this.baseChart.yChart(serieData.v_max as number))
//                     .attr('fill', textFill)
//                     .attr('stroke', textStroke)
//                     .text(serieData.v_max as number);
//                 d3.select(this.refCandleJeanPaulMaxText)
//                     .transition()
//                     .attr('text-anchor', 'end')
//                     .attr('x', xMiddleCandle - marginText)
//                     .attr('y', this.baseChart.yChart(serieData.v_avg + serieData.v_sd))
//                     .attr('fill', textFill)
//                     .attr('stroke', textStroke)
//                     .text(serieData.v_avg + serieData.v_sd);
//                 d3.select(this.refCandleMoyText)
//                     .transition()
//                     .attr('text-anchor', 'start')
//                     .attr('x', xMiddleCandle + marginText)
//                     .attr('y', this.baseChart.yChart(serieData.v_avg))
//                     .attr('fill', textFill)
//                     .attr('stroke', textStroke)
//                     .text(serieData.v_avg);
//                 d3.select(this.refCandleJeanPaulMinText)
//                     .transition()
//                     .attr('text-anchor', 'end')
//                     .attr('x', xMiddleCandle - marginText)
//                     .attr('y', this.baseChart.yChart(serieData.v_avg - serieData.v_sd))
//                     .attr('fill', textFill)
//                     .attr('stroke', textStroke)
//                     .text(serieData.v_avg - serieData.v_sd);
//                 d3.select(this.refCandleMinText)
//                     .transition()
//                     .attr('text-anchor', 'start')
//                     .attr('x', xMiddleCandle + marginText)
//                     .attr('y', this.baseChart.yChart(serieData.v_min as number))
//                     .attr('fill', textFill)
//                     .attr('stroke', textStroke)
//                     .text(serieData.v_min as number);
//                 this.legendStrokeHighlight('candle.legend');
//             })
//             .on('mousemove', this.displayCrosshair)
//             .on('mousedown', () => { this.dispatchEventToGeneralBrush('mousedown'); })
//             .on('click', () => { this.dispatchEventToGeneralBrush('click'); })
//             .on('dblclick', () => { this.dispatchEventToGeneralBrush('dblclick'); });
//         }

//         d3.select(this.refGVerticalBrushDetail)
//             .on('dblclick.zoom', this.resetZoomY)
//             .on('mouseover', this.displayCrosshairY)
//             .on('mousemove', this.displayCrosshairY)
//             .on('mouseout', this.displayCrosshairY);
//             // .call(this.verticalBrushDetail);

//         // Mouse events on legend checkboxes
//         this.baseChart.legendCheckBoxes
//             .attr('pointer-events', 'visible');
//             // .on('mouseover', this.legendMouseHandle)
//             // .on('mouseout', this.legendMouseHandle)
//             // .on('click', this.legendMouseHandle);

//         // this.baseChart.candles.forEach((path, serieName) => {
//         //     path.attr('pointer-events', 'stroke')
//         //         .on('mouseover', (d, i, g) => { this.pathMouseOver(d, i, g, serieName); })
//         //         .on('mousemove', (d, i, g) => { this.pathMouseOver(d, i, g, serieName); })
//         //         .on('mouseout', (d, i, g) => { this.pathMouseOver(d, i, g, serieName); })
//         //         .on('mousedown', () => { this.dispatchEventToGeneralBrush('mousedown'); })
//         //         .on('click', () => { this.dispatchEventToGeneralBrush('click'); })
//         //         .on('dblclick', () => { this.dispatchEventToGeneralBrush('dblclick'); });
//         // });

//         if ( callBrushes ) {

//             d3.select(this.refGVerticalBrush)
//                 .call(this.verticalBrush)
//                 .call(this.verticalBrush.move, this.baseChart.yChart.range());

//             d3.select(this.refGVerticalBrushDetail)
//                 .call(this.verticalBrushDetail);
//         }
//     }

//     private dispatchEventToGeneralBrush = (event: string): void => {
//         // voir cette adresse pour pouvoir cliquer sur les path pour lancer le brush
//         // https://bl.ocks.org/mthh/99dc420cd7e276ecafe4ef4bf12c6927
//         const brushOverlayElement: Element = d3.select('#generalBrush > .overlay').node() as Element;
//         const brushSelectionElement: Element = d3.select('#generalBrush > .selection').node() as Element;

//         if ( brushSelectionElement ) {
//             const newClickEvent = new MouseEvent(event, {
//                 clientX: d3.event.clientX,
//                 clientY: d3.event.clientY,
//                 bubbles: true,
//                 cancelable: true,
//                 view: window
//             });
//             if ( brushOverlayElement ) {
//                 brushOverlayElement.dispatchEvent(newClickEvent);
//             }
//         }
//     }

//     // private legendMouseHandle = (serieName: any, index: number): void => {
//     //     switch ( d3.event.type ) {
//     //         case 'mouseover':
//     //             this.baseChart.candlesSet.values[serieName].attr('stroke-width', 2);
//     //             break;
//     //         case 'mouseout':
//     //             this.baseChart.displayedPathesMap.get(serieName).attr('stroke-width', 1.2);
//     //             break;
//     //         case 'click':
//     //             if ( this.baseChart.displayedPathesSet.has(serieName) ) {
//     //                 this.baseChart.displayedPathesSet.delete(serieName);
//     //             }
//     //             else {
//     //                 this.baseChart.displayedPathesSet.add(serieName);
//     //             }
//     //             this.baseChart.legendCheckBoxes.attr('fill', this.baseChart.legendCheckBoxFill);
//     //             this.baseChart.displayedPathesMap.get(serieName).style('opacity', this.baseChart.pathOpacity(serieName));
//     //             break;
//     //         default:
//     //             break;
//     //     }
//     // }

//     private pathMouseOver = (serieData, index, group, serieName: string): void => {
//         let path: any = d3.select(d3.event.srcElement);

//         switch ( d3.event.type ) {
//             case 'mouseover':
//             case 'mousemove':
//                 path.attr('stroke-width', 2);
//                 this.legendStrokeHighlight(serieName);
//                 this.crosshairState.textDisplayed = serieName;
//                 this.displayCrosshair();
//                 break;
//             case 'mouseout':
//                 path.attr('stroke-width', 1.2);
//                 this.legendStrokeHighlight(null);
//                 this.crosshairState.textDisplayed = null;
//                 this.displayCrosshair();
//                 break;
//             default:
//                 break;
//         }
//     }

//     private legendStrokeHighlight = (serieName: string | null): void => {
//         this.baseChart.legendCheckBoxes.attr('stroke-width', (d, i) => {return serieName === d ? '2' : '1'; });
//         this.baseChart.legendTexts.attr('font-weight', (d, i) => {return serieName === d ? 'bold' : 'normal'; });
//     }

//     private updateYContextAxis = (): void => {
//         d3.select(this.refGVerticalContextAxisY).call(this.baseChart.customAxis, this.yAxisContext, LookAndFeelStore.getMode());
//     }

//     private updateComponents(): void {
//         this.updateYContextAxis();
//         this.updateVerticalBrush();
//         this.updateVerticalBrushDetail();
//         this.updateHorizontalMarkers();
//     }

//     private updateVerticalBrush = (): void => {
//         d3.select(this.refGVerticalBrush).call(this.baseChart.customBrush, this.verticalBrush, LookAndFeelStore.getMode());
//     }

//     private updateVerticalBrushDetail = (): void => {
//         d3.select(this.refGVerticalBrushDetail).call(this.baseChart.customBrush, this.verticalBrushDetail, LookAndFeelStore.getMode());
//     }

//     private updateHorizontalMarkers = (): void => {

//         // Markers on main chart
//         d3.select(this.refGHorizontalMarkers).selectAll('line').remove();

//         d3.select(this.refGHorizontalMarkers).selectAll('line')
//             .data(this.props.horizontalMarkers).enter()
//             .append('line')
//             .attr('x1', 0)
//             .attr('x2', this.chartWidth)
//             .attr('y1', (y) => this.baseChart.yChart(y))
//             .attr('y2', (y) => this.baseChart.yChart(y))
//             .attr('opacity', this.markersShown ? 0.7 : 0)
//             .attr('stroke', (d) => this.markersColorScale(d.toString()))
//             .attr('stroke-width', 1)
//             .attr('shape-rendering', 'crispEdges');

//         // Markers on verticalContext
//         d3.select(this.refGVerticalContextMarkers).selectAll('line').remove();

//         d3.select(this.refGVerticalContextMarkers).selectAll('line')
//             .data(this.props.horizontalMarkers).enter()
//             .append('line')
//             .attr('x1', 0)
//             .attr('x2', verticalContextWidth)
//             .attr('y1', (y) => this.yVerticalContext(y))
//             .attr('y2', (y) => this.yVerticalContext(y))
//             .attr('opacity', this.markersShown ? 1 : 0)
//             .attr('stroke', (d) => this.markersColorScale(d.toString()))
//             .attr('stroke-width', 1)
//             .attr('shape-rendering', 'crispEdges');
//     }

//     private toggleMarkersVisible = (): void => {
//         this.markersShown = !this.markersShown;
//         this.updateHorizontalMarkers();
//     }
// }
