// import { ContextMenu, Icon } from '@blueprintjs/core';
// import '@blueprintjs/core/lib/css/blueprint.css';
// import * as d3 from 'd3';
// import { Axis, BrushBehavior, ScaleTime } from 'd3';
// import { observable } from 'mobx';
// import { observer } from 'mobx-react';
// import * as React from 'react';
// import { style } from 'typestyle';
// import { ILegendItem, IMargin } from '../../../chart/BaseChart';
// import { IEnhancedPoint, ISerieGroup, ScatterPlotBaseChart } from '../../../chart/ScatterPlotBaseChart';
// import { ISeriesDef } from '../../../model/Template';
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
// }

// const mousePointerClassName = style({cursor: 'pointer', pointerEvents: 'visible'});

// const horizontalContextHeight = 50;
// const verticalContextWidth = 50;
// const yAxisWidth = 50;
// const xAxisHeight = 50;

// const legendRectSize = 14;
// const legendSpacing = 4;
// const legendItemHeight = legendRectSize + legendSpacing;
// const legendLeftMargin = 10;
// const legendColumnWidth = 180;

// const helpButtonDefaultScale = 0.08;
// const mouseoverRescale = 1.2;
// const crossHairTimeFormat = d3.timeFormat('%Y/%m/%d %H:%M:%S.%L');

// @observer export class ScatterPlotComponent extends GenericChartComponent<IProps> {

//     // Mesures
//     private totalWidth: number;
//     private totalHeight: number;
//     private chartWidth: number;
//     private chartHeight: number;
//     private marginChart: IMargin;
//     private marginHorizontalContext: IMargin;
//     private marginVerticalContext: IMargin;

//     // Chart js object
//     private baseChart: ScatterPlotBaseChart;

//     // References of SVG graphic components
//     private refGChart: SVGGElement;
//     private refChartFocus: SVGGElement;
//     private refGAnomalyMarkers: SVGGElement;

//     private refGBrush: SVGGElement;

//     private refGHorizontalBrushDetail: SVGGElement;
//     private refGVerticalBrushDetail: SVGGElement;

//     private refGHorizontalContext: SVGGElement;
//     private refGTimeContextAxisX: SVGGElement;
//     private refGShotContextAxisX: SVGGElement;
//     private refGTimeBrush: SVGGElement;

//     // Popup Menu
//     @observable private markersShown = true;
//     private xLastClick: number;
//     private yLastClick: number;

//     // d3 components
//     private brush: BrushBehavior<{}>;
//     private horizontalBrushDetail: BrushBehavior<{}>;
//     private verticalBrushDetail: BrushBehavior<{}>;
//     private xHorizontalContextTime: ScaleTime<number, number>;
//     private xAxisContextTime: Axis<number | Date | { valueOf(): number; }>;
//     private xAxisContextShot: Axis<number | Date | { valueOf(): number; }>;
//     private timeBrush: BrushBehavior<{}>;

//     // Utils
//     private saveXDomain: number[];
//     private saveYDomain: number[];

//     private beginTime: number | undefined;
//     private endTime: number | undefined;

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
//         xTime: undefined,
//         xValue: undefined,
//         yValue: 0,
//         textDisplayed: null,
//         crossHairTimeFormat: ''
//     };

//     constructor(props) {
//         super(props);

//         this.marginChart = {
//             top: GenericChartComponent.svgBorderWidth + xAxisHeight,
//             bottom: GenericChartComponent.svgBorderWidth + horizontalContextHeight + 2 * xAxisHeight,
//             left: GenericChartComponent.svgBorderWidth + verticalContextWidth + yAxisWidth,
//             right: GenericChartComponent.svgBorderWidth
//         };

//         let section: ISeriesDef | undefined = this.props.sheet.sheetDef.seriesDefs.find((v) => v !== undefined);
//         if (! section) { throw 'Empty sheet'; }
//         this.baseChart = new ScatterPlotBaseChart(
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
//         this.saveXDomain = this.baseChart.xChart.domain();
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

//                         <g className='anomalyMarkers' ref={(ref) => { if (ref) { this.refGAnomalyMarkers = ref; } }} clipPath='url(#clip)'/>

//                         <g className='horizontalContextDetail' ref={(ref) => { if (ref) { this.refGHorizontalBrushDetail = ref; } }}
//                             transform={'translate(0,' + (this.chartHeight) + ')'}/>
//                         <g className='verticalContextDetail' ref={(ref) => { if (ref) { this.refGVerticalBrushDetail = ref; } }}
//                             transform={'translate(' + (- yAxisWidth) + ',0)'}/>
//                         <g id='generalBrush' ref={(ref) => {if (ref) { this.refGBrush = ref; } }}>
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
//                     <g name='toto' className='horizontalContext' ref={(ref) => { if (ref) { this.refGHorizontalContext = ref; } }}
//                         transform={'translate(' + this.marginHorizontalContext.left + ',' + this.marginHorizontalContext.top + ')'}>
//                         <rect x={0} y={0} width={this.chartWidth} height={horizontalContextHeight} stroke='black' fill='none'/>
//                         <g ref={(ref) => { if (ref) { this.refGTimeBrush = ref; } }}/>
//                         <g ref={(ref) => { if (ref) { this.refGTimeContextAxisX = ref; } }} />
//                         <g ref={(ref) => { if (ref) { this.refGShotContextAxisX = ref; } }}
//                             transform={'translate(0,' + horizontalContextHeight + ')'}>
//                         </g>
//                     </g>
//                     <g transform={'translate(' + this.marginChart.left + ',' + this.marginChart.top + ')'}>
//                         <LineCrosshair
//                             crosshairWidth={this.chartWidth}
//                             crosshairHeight={this.chartHeight}
//                             crosshairState={this.crosshairState}
//                             xAxisHeight={xAxisHeight}
//                             yAxisWidth={yAxisWidth}
//                         />
//                     </g>
//                     <g transform={'translate(0,' + (this.marginChart.top + this.chartHeight + xAxisHeight) + ')'}>
//                         {/* { (this.props.verticalMarkers.length > 0 || this.props.horizontalMarkers.length > 0) ? */
//                             false ? 
//                             <foreignObject x='0' y='0' width='100' height='100'>
//                                 <Icon
//                                     className={mousePointerClassName}
//                                     icon={this.markersShown ? 'eye-on' : 'eye-off'}
//                                     iconSize={20}
//                                     onClick={this.toggleMarkersVisible}/> Markers
//                             </foreignObject>
//                             : null
//                         }
//                     </g>
//                 </svg>
//         );
//     }

//     // private showContextMenu = (xMouse: number, yMouse: number): void => {

//     //     this.newMarkerXDateIndex = this.getRealXIndex(this.xLastClick);
//     //     let newMarkerXDateDescription: string = this.props.xData.shots[this.newMarkerXDateIndex] ?
//     //     'at shot ' + this.props.xData.shots[this.newMarkerXDateIndex].toString() :
//     //     'at ' + d3.timeFormat('%Y/%m/%d %H:%M:%S')(this.props.xData.times[this.newMarkerXDateIndex]);
//     //     this.newMarkerYValue = this.baseChart.yChart.invert(this.yLastClick);

//     //     const menu = (
//     //         <Menu>
//     //             <MenuItem text='Save As' icon='download'>
//     //                 <MenuItem text='Image (.png)' icon='media' onClick={this.saveChartAsPng} />
//     //                 <MenuItem text='Text (.csv)' icon='document' onClick={this.saveChartAsCSV} />
//     //             </MenuItem>
//     //             <MenuDivider />
//     //             <MenuItem text='Add horizontal marker' icon='arrows-horizontal'>
//     //                 <input className={'bp3-input .bp3-large ' + fitToParent}
//     //                     defaultValue={this.newMarkerYValue.toString()}
//     //                     type='number'
//     //                     onChange={(event) => { this.newMarkerYValue = parseFloat(event.target.value); }}
//     //                     onKeyPress={(event) => { if (event.which === 13 || event.keyCode === 13 ) {this.handleAddHorizontalMarker(); } }}
//     //                 />
//     //                 <Button className={fitToParent} text='Add to section'
//     //                     rightIcon='add'
//     //                     onClick={() => { this.handleAddHorizontalMarker(); }}/>
//     //             </MenuItem>
//     //             <MenuItem text='Add vertical marker' icon='arrows-vertical'>
//     //                 <Text ellipsize={false}>{newMarkerXDateDescription}</Text>
//     //                 <Button className={fitToParent} text='Add to all charts'
//     //                     rightIcon='circle-arrow-down'
//     //                     onClick={() => this.handleAddVerticalMarker()}/>
//     //             </MenuItem>
//     //             { this.props.verticalMarkers.length > 0 || this.props.horizontalMarkers.length > 0 ?
//     //                 <React.Fragment>
//     //                     <MenuItem text={this.markersShown ? 'Hide markers' : 'Show markers'}
//     //                         onClick={(event) => this.handleHideShowMarkers()}
//     //                         icon={this.markersShown ? 'eye-off' : 'eye-on'}/>
//     //                     <MenuItem text='Remove all markers'
//     //                         onClick={(event) => this.handleRemoveAllMarkers()}
//     //                         icon='trash'
//     //                         />
//     //                 </React.Fragment> :
//     //                 <React.Fragment/>
//     //             }
//     //         </Menu>
//     //     );

//     //     // mouse position is available on event
//     //     ContextMenu.show(menu, { left: xMouse - 20, top: yMouse - 20}, () => {
//     //         // menu was closed; callback optional
//     //     });
//     // }

//     private updateChartComponent(domainX: number[] | undefined, domainY: number[] | undefined): void {

//         if ( domainX ) {
//             this.baseChart.xChart.domain(domainX);
//         }
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
//             left: GenericChartComponent.svgBorderWidth,
//             right: this.totalWidth - verticalContextWidth - GenericChartComponent.svgBorderWidth
//         };
//         this.marginHorizontalContext = {
//             top: this.marginChart.top + this.chartHeight + xAxisHeight,
//             bottom: GenericChartComponent.svgBorderWidth,
//             left: this.marginChart.left,
//             right: this.marginChart.right
//         };

//         const time_start = this.props.sheet.data.reduce(
//             (start, groupData) => groupData.time_start < start ? groupData.time_start : start, Number.POSITIVE_INFINITY
//         );
//         const time_end = this.props.sheet.data.reduce(
//             (end, groupData) => groupData.time_end > end ? groupData.time_end : end, Number.NEGATIVE_INFINITY
//         );
//         let xTimeDomain = [new Date(time_start), new Date(time_end)];

//         this.xHorizontalContextTime = d3.scaleTime().domain(xTimeDomain).range([0, this.chartWidth]);
//         this.xAxisContextTime = d3.axisBottom(this.xHorizontalContextTime);
//         this.xAxisContextShot = d3.axisTop(this.xHorizontalContextTime);
//         this.baseChart.customizeAxisTime(this.xHorizontalContextTime, this.xAxisContextTime);
//         this.baseChart.customizeAxisShot(this.xHorizontalContextTime, this.xAxisContextShot);

//         this.brush = d3.brush()
//             .extent([[0, 0], [this.chartWidth, this.chartHeight]])
//             .on('end', this.brushed);

//         this.horizontalBrushDetail = d3.brushX()
//             .extent([[0, -this.chartHeight], [this.chartWidth, xAxisHeight]])
//             .on('end', this.horizontalBrushedDetail);

//         this.verticalBrushDetail = d3.brushY()
//             .extent([[0, 0], [yAxisWidth + this.chartWidth, this.chartHeight]])
//             .on('end', this.verticalBrushedDetail);

//         this.timeBrush = d3.brushX()
//             .extent([[0, 0], [this.chartWidth, horizontalContextHeight]])
//             .on('end', this.timeBrushed);
//     }

//     private isPlotVisible = (enhancedPoint: IEnhancedPoint): boolean => {
//         let time: number = enhancedPoint.date.getTime();
//         if ( this.beginTime === undefined || this.endTime === undefined ) {
//             return true;
//         }
//         if ( time >= this.beginTime && time <= this.endTime ) {
//             return true;
//         }
//         return false;
//     }

//     private timeBrushed = () => {
//         let s = d3.event.selection;
//         if (s) {
//             this.beginTime = this.xHorizontalContextTime.invert(s[0]).getTime();
//             this.endTime = this.xHorizontalContextTime.invert(s[1]).getTime();
//         }
//         else {
//             this.beginTime = this.xHorizontalContextTime.domain()[0].getTime();
//             this.endTime = this.xHorizontalContextTime.domain()[1].getTime();
//         }
//         this.baseChart.seriesGroups.forEach((serieGroup: ISerieGroup) => {
//             serieGroup.svgGroup.selectAll('.scatterPlotPoint')
//             .attr('visibility', (enhancedPoint: IEnhancedPoint) => this.isPlotVisible(enhancedPoint) ? 'visible' : 'hidden');
//             // .style('opacity', (enhancedPoint: IEnhancedPoint) => this.isPlotVisible(enhancedPoint) ? 1 : 0)
//         });
//     }

//     private brushed = (): void => {
//         let s = d3.event.selection;
//         if (s) {
//             d3.select(this.refGBrush).call(this.brush.move, null);
//             this.baseChart.xChart.domain([s[0][0], s[1][0]].map(this.baseChart.xChart.invert, this.baseChart.xChart));
//             this.baseChart.yChart.domain([s[1][1], s[0][1]].map(this.baseChart.yChart.invert, this.baseChart.yChart));
//         }
//         this.baseChart.updateSeries();
//         this.baseChart.updateXAxis(LookAndFeelStore.getMode());
//         this.baseChart.updateYAxis(LookAndFeelStore.getMode());
//     }

//     private horizontalBrushedDetail = (): void => {
//         let s = d3.event.selection;
//         if (s) {
//             this.baseChart.xChart.domain([s[0], s[1]].map(this.baseChart.xChart.invert, this.baseChart.xChart));
//             d3.select(this.refGHorizontalBrushDetail).call(this.horizontalBrushDetail.move, null);
//         }
//         this.baseChart.updateSeries();
//         this.baseChart.updateXAxis(LookAndFeelStore.getMode());
//         this.baseChart.updateYAxis(LookAndFeelStore.getMode());
//     }

//     private verticalBrushedDetail = (): void => {
//         let s = d3.event.selection;
//         if (s) {
//             this.baseChart.yChart.domain([s[1], s[0]].map(this.baseChart.yChart.invert, this.baseChart.yChart));
//             d3.select(this.refGVerticalBrushDetail).call(this.verticalBrushDetail.move, null);
//         }
//         this.baseChart.updateSeries();
//         this.baseChart.updateXAxis(LookAndFeelStore.getMode());
//         this.baseChart.updateYAxis(LookAndFeelStore.getMode());
//     }

//     private displayCrosshair = (): void => {
//         this.displayCrosshairX();
//         this.displayCrosshairY();
//     }

//     private displayCrosshairX = (): void => {

//         switch ( d3.event.type ) {
//             case 'mouseover':
//             case 'mousemove':
//                 let srcElement = d3.event.target || d3.event.srcElement;
//                 let xMouse: number = d3.mouse(srcElement)[0];
//                 let x = this.baseChart.xChart.invert(xMouse);

//                 this.crosshairState.position.x = xMouse;
//                 this.crosshairState.mousePosition.x = xMouse;
//                 this.crosshairState.xValue = x;
//                 this.crosshairState.xDisplayed = true;
//                 break;
//             case 'mouseout':
//             default:
//                 this.crosshairState.xDisplayed = false;
//                 break;
//         }
//     }

//     private displayCrosshairY = (): void => {
//         switch ( d3.event.type ) {
//             case 'mouseover':
//             case 'mousemove':
//                 let srcElement = d3.event.target || d3.event.srcElement;
//                 let yMouse = d3.mouse(srcElement)[1];
//                 let y = this.baseChart.yChart.invert(yMouse);

//                 this.crosshairState.mousePosition.y = yMouse;
//                 this.crosshairState.position.y = yMouse;
//                 this.crosshairState.yValue = y;
//                 this.crosshairState.yDisplayed = true;
//                 break;
//             case 'mouseout':
//             default:
//                 this.crosshairState.yDisplayed = false;
//                 break;
//         }
//     }

//     private resetZoomX = () => {
//         this.baseChart.xChart.domain(this.baseChart.xChartDomainDefault);
//         this.baseChart.updateSeries();
//         this.baseChart.updateXAxis(LookAndFeelStore.getMode());
//     }

//     private resetZoomY = () => {
//         this.baseChart.yChart.domain(this.baseChart.yChartDomainDefault);
//         this.baseChart.updateSeries();
//         this.baseChart.updateYAxis(LookAndFeelStore.getMode());
//     }

//     private resetZoom = () => {
//         this.baseChart.xChart.domain(this.baseChart.xChartDomainDefault);
//         this.baseChart.yChart.domain(this.baseChart.yChartDomainDefault);
//         this.baseChart.updateSeries();
//         this.baseChart.updateXAxis(LookAndFeelStore.getMode());
//         this.baseChart.updateYAxis(LookAndFeelStore.getMode());
//     }

//     /**
//      * Export the chart in png file.
//      */
//     private saveChartAsPng = (event) => {
//         console.log('FIXME');
//         /*
//         saveSvgAsPng.saveSvgAsPng(
//             document.getElementById('svgChart'),
//             `${this.props.series[0].serie_name}.png`,
//             {backgroundColor : 'white', encoderOptions: 1}
//         );
//         */
//     }

//     /**
//      * Export series in CVS file.
//      */
//     private saveChartAsCSV = (event) => {
//         let csvData: string[] = [];

//         let header = '';
//         /*
//         header = header.concat('shot');
//         this.props.chartData.series.forEach((serie) => {
//             header = header.concat(',' + serie.serie_name);
//         });
//         */
//         header = header.concat('\n');
//         csvData.push(header);

//         let row = '';
//         // this.props.xData.shots.forEach((shotNumber, i) => {
//         //     row = row.concat(String(shotNumber));
//         //     this.props.chartData.series.forEach((serie) => {
//         //         row = row.concat(',' + String(serie.values[i]));
//         //     });
//         //     row = row.concat('\n');
//         //     cvsData.push(row);
//         //     row = '';
//         // });

//         let blob = new Blob(csvData, { type: 'text/cvs;charset=utf-8' });
//         // fileSaver.saveAs(blob, `${this.props.series[0].serie_name}.cvs`);
//     }

//     private handleHideShowMarkers = (): void => {
//         ContextMenu.hide();
//         this.markersShown = !this.markersShown;
//         // this.updateHorizontalMarkers();
//         // this.updateVerticalMarkers();
//         // this.updateAnomalyMarkers();
//     }

//     private drawChart = (callBrushes: boolean): void => {
//         if ( this.refGChart ) {
//             this.baseChart.createChart(this.refGChart);
//         }

//         d3.select(this.refGBrush)
//             .on('dblclick.zoom', this.resetZoom)
//             .on('mouseover', this.displayCrosshair)
//             .on('mousemove', this.displayCrosshair)
//             .on('mouseout', this.displayCrosshair)
//             .on('contextmenu', () => {
//                 d3.event.preventDefault();

//                 let srcElement = d3.event.target || d3.event.srcElement;
//                 this.xLastClick = d3.mouse(srcElement)[0];
//                 this.yLastClick = d3.mouse(srcElement)[1];

//                 // this.showContextMenu(d3.event.clientX, d3.event.clientY);
//             });

//         d3.select(this.refGHorizontalBrushDetail)
//             .on('dblclick.zoom', this.resetZoomX)
//             .on('mouseover', this.displayCrosshairX)
//             .on('mousemove', this.displayCrosshairX)
//             .on('mouseout', this.displayCrosshairX);

//         d3.select(this.refGVerticalBrushDetail)
//             .on('dblclick.zoom', this.resetZoomY)
//             .on('mouseover', this.displayCrosshairY)
//             .on('mousemove', this.displayCrosshairY)
//             .on('mouseout', this.displayCrosshairY);

//         // Mouse events on legend checkboxes
//         this.baseChart.legends
//             .attr('pointer-events', 'visible')
//             .on('mouseover', this.legendMouseHandle)
//             .on('mouseout', this.legendMouseHandle)
//             .on('click', this.legendMouseHandle);

//         // this.baseChart.displayedSeriesMap.forEach((serie, serieName) => {
//         //     path.attr('pointer-events', 'stroke')
//         //         .on('mouseover', (d, i, g) => { this.pathMouseOver(d, i, g, serieName); })
//         //         .on('mousemove', (d, i, g) => { this.pathMouseOver(d, i, g, serieName); })
//         //         .on('mouseout', (d, i, g) => { this.pathMouseOver(d, i, g, serieName); })
//         //         .on('mousedown', () => { this.dispatchEventToGeneralBrush('mousedown'); })
//         //         .on('click', () => { this.dispatchEventToGeneralBrush('click'); })
//         //         .on('dblclick', () => { this.dispatchEventToGeneralBrush('dblclick'); });
//         // });
        
//         this.baseChart.seriesGroups.forEach((serieGroup: ISerieGroup) => {

//             serieGroup.svgGroup.selectAll('.scatterPlotPoint')
//                 .on('mouseover', this.pointMouseOver)
//                 .on('mousemove', this.pointMouseOver)
//                 .on('mouseout', this.pointMouseOver)
//                 .on('mousedown', () => { this.dispatchEventToGeneralBrush('mousedown'); })
//                 .on('click', () => { this.dispatchEventToGeneralBrush('click'); })
//                 .on('dblclick', () => { this.dispatchEventToGeneralBrush('dblclick'); });
//         });

//         if ( callBrushes ) {

//             d3.select(this.refGBrush)
//                 .call(this.baseChart.customBrush, this.brush, LookAndFeelStore.getMode());

//             d3.select(this.refGHorizontalBrushDetail)
//                 .call(this.horizontalBrushDetail);

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

//     private legendMouseHandle = (legendItem: ILegendItem): void => {
//         switch ( d3.event.type ) {
//             case 'mouseover':
//                 this.baseChart.seriesGroups
//                     .filter( g => g.legendItem === legendItem)
//                     .forEach( g => { g.svgGroup.attr('stroke-width', 2); } );
//                 break;
//             case 'mouseout':
//                 this.baseChart.seriesGroups
//                     .filter( g => g.legendItem === legendItem)
//                     .forEach( g => { g.svgGroup.attr('stroke-width', 1.2); } );
//                 break;
                
//             case 'click':
//                 legendItem.isShown = !legendItem.isShown;
//                 this.baseChart.seriesGroups
//                     .filter( g => g.legendItem === legendItem)
//                     .forEach( g => {
//                         g.svgGroup.attr('opacity', legendItem.isShown ? 1 : 0);
//                     });
//                 this.baseChart.legendCheckBoxes.attr('fill', this.baseChart.legendCheckBoxFill);
//                 break;
//             default:
//                 break;
//         }
//     }

//     private pointMouseOver = (enhancedPoint: IEnhancedPoint): void => {
//         let point: any = d3.select(d3.event.srcElement);
        
//         switch ( d3.event.type ) {
//             case 'mouseover':
//             case 'mousemove':
//                 point.attr('r', 5);
//                 this.legendStrokeHighlight(enhancedPoint.legendItem);
//                 this.crosshairState.textDisplayed = '[' + enhancedPoint.legendItem.toString() + '] ' + crossHairTimeFormat(enhancedPoint.date);

//                 this.displayCrosshair();
//                 break;
//             case 'mouseout':
//                 point.attr('r', 1.2);
//                 this.legendStrokeHighlight(null);
//                 this.crosshairState.textDisplayed = null;
//                 this.displayCrosshair();
//                 break;
//             default:
//                 break;
//         }
//     }

//     private legendStrokeHighlight = (legendItem: ILegendItem | null): void => {
//         this.baseChart.legendCheckBoxes.attr('stroke-width', (d, i) => ( legendItem && legendItem.toString() === d.toString() ? '2' : '1' ));
//         this.baseChart.legendTexts.attr('font-weight', (d, i) => ( legendItem && legendItem.toString() === d.toString() ? 'bold' : 'normal' ));
//     }

//     private updateComponents(): void {
//         this.updateBrush();
//         this.updateHorizontalBrushDetail();
//         this.updateVerticalBrushDetail();
//         this.updateTimeBrush();
//         this.updateXContextTimeAxis();
//         this.updateXContextShotAxis();
//         // this.updateAnomalyMarkers();
//     }

//     private updateXContextTimeAxis = (): void => {
//         d3.select(this.refGTimeContextAxisX).call(this.baseChart.customAxis, this.xAxisContextTime, LookAndFeelStore.getMode());
//     }

//     private updateXContextShotAxis = (): void => {
//         d3.select(this.refGShotContextAxisX).call(this.baseChart.customAxis, this.xAxisContextShot, LookAndFeelStore.getMode());
//     }

//     private updateBrush = (): void => {
//         d3.select(this.refGBrush).call(this.baseChart.customBrush, this.brush, LookAndFeelStore.getMode());
//     }

//     private updateHorizontalBrushDetail = (): void => {
//         d3.select(this.refGHorizontalBrushDetail).call(this.baseChart.customBrush, this.horizontalBrushDetail, LookAndFeelStore.getMode());
//     }

//     private updateVerticalBrushDetail = (): void => {
//         d3.select(this.refGVerticalBrushDetail).call(this.baseChart.customBrush, this.verticalBrushDetail, LookAndFeelStore.getMode());
//     }

//     private updateTimeBrush = (): void => {
//         d3.select(this.refGTimeBrush).call(this.baseChart.customBrush, this.timeBrush, LookAndFeelStore.getMode());
//     }

//     // private updateAnomalyMarkers = (): void => {
//     //     let section = this.props.series.find( (v) => v !== undefined);
//     //     if ( !this.props.isAnomalyMarkersShown || this.props.maxAnomalyMarker === undefined || this.props.minAnomalyMarker === undefined ) { return; }
//     //     let yAnomalyMax: number = this.baseChart.yChart(this.props.maxAnomalyMarker);
//     //     let yAnomalyMin: number = this.baseChart.yChart(this.props.minAnomalyMarker);

//     //     let yContextAnomalyMax = this.yVerticalContext(this.props.maxAnomalyMarker);
//     //     let yContextAnomalyMin = this.yVerticalContext(this.props.minAnomalyMarker);

//     //     // let yChartMax = this.props.section.isYAxisInverted?this.baseChart.getYRangeStart():this.baseChart.getYRangeEnd();
//     //     // let yChartMin = this.props.section.isYAxisInverted?this.baseChart.getYRangeEnd():this.baseChart.getYRangeStart();
//     //     let yChartTop = Math.min(this.baseChart.getYRangeStart(), this.baseChart.getYRangeEnd());
//     //     let yChartBottom = Math.max(this.baseChart.getYRangeStart(), this.baseChart.getYRangeEnd());

//     //     // Markers on main chart
//     //     let gAnomalyMarkers = d3.select(this.refGAnomalyMarkers);
//     //     gAnomalyMarkers.selectAll('rect').remove();
//     //     gAnomalyMarkers.selectAll('line').remove();
//     //     // Markers on vertical context
//     //     let gverticalContextAnomalyMarkers = d3.select(this.refGVerticalContextAnomalyMarkers);
//     //     gverticalContextAnomalyMarkers.selectAll('rect').remove();
//     //     gverticalContextAnomalyMarkers.selectAll('line').remove();

//     //     let yTopRectAnomalyMin: number = this.props.isInvertYAxis ? yAnomalyMax : yChartTop;
//     //     let heightRectAnomalyMin: number = this.props.isInvertYAxis ? (yChartBottom - yAnomalyMax) : (yAnomalyMax - yChartTop);

//     //     // Anomaly Max main chart
//     //     if ( ( yAnomalyMax >= 0 && !this.props.isInvertYAxis )
//     //         || ( yAnomalyMax <= yChartBottom && this.props.isInvertYAxis ) ) {

//     //         gAnomalyMarkers.append('rect')
//     //             .attr('x', 0)
//     //             .attr('width', this.chartWidth)
//     //             .attr('y', yTopRectAnomalyMin)
//     //             .attr('height', heightRectAnomalyMin)
//     //             .attr('opacity', this.props.isAnomalyMarkersShown ? 0.1 : 0)
//     //             .attr('fill', 'red')
//     //             .attr('shape-rendering', 'crispEdges');

//     //         gAnomalyMarkers.append('line')
//     //             .attr('x1', 0)
//     //             .attr('x2', this.chartWidth)
//     //             .attr('y1', yAnomalyMax)
//     //             .attr('y2', yAnomalyMax)
//     //             .attr('opacity', this.props.isAnomalyMarkersShown ? 0.5 : 0)
//     //             .attr('stroke', 'red')
//     //             .attr('stroke-width', 1)
//     //             .attr('stroke-dasharray', '2,2')
//     //             .attr('shape-rendering', 'crispEdges');
//     //     }

//     //     // Anomaly Max vertical context
//     //     if ( ( yContextAnomalyMax >= 0 && !this.props.isInvertYAxis )
//     //         || ( yContextAnomalyMax <= this.chartHeight && this.props.isInvertYAxis ) ) {

//     //         gverticalContextAnomalyMarkers.append('line')
//     //             .attr('x1', 0)
//     //             .attr('x2', verticalContextWidth)
//     //             .attr('y1', yContextAnomalyMax)
//     //             .attr('y2', yContextAnomalyMax)
//     //             .attr('opacity', this.props.isAnomalyMarkersShown ? 0.5 : 0)
//     //             .attr('stroke', 'red')
//     //             .attr('stroke-width', 1)
//     //             .attr('stroke-dasharray', '2,1')
//     //             .attr('shape-rendering', 'crispEdges');

//     //         let anomalyMaxRectHeight = this.props.isInvertYAxis ? this.chartHeight - yContextAnomalyMax : yContextAnomalyMax;
//     //         gverticalContextAnomalyMarkers.append('rect')
//     //             .attr('x', 0)
//     //             .attr('width', verticalContextWidth)
//     //             .attr('y', this.props.isInvertYAxis ? yContextAnomalyMax : 0)
//     //             .attr('height', anomalyMaxRectHeight > 0 ? anomalyMaxRectHeight : 0)
//     //             .attr('opacity', this.props.isAnomalyMarkersShown ? 0.2 : 0)
//     //             .attr('fill', 'red')
//     //             .attr('shape-rendering', 'crispEdges');
//     //     }

//     //     // Anomaly Min main chart
//     //     if ( ( yAnomalyMin >= 0 && this.props.isInvertYAxis )
//     //     || ( yAnomalyMin <= this.chartHeight && !this.props.isInvertYAxis ) ) {

//     //         gAnomalyMarkers.append('rect')
//     //             .attr('x', 0)
//     //             .attr('width', this.chartWidth)
//     //             .attr('y', this.props.isInvertYAxis ? yChartTop : yAnomalyMin)
//     //             .attr('height', this.props.isInvertYAxis ? (yAnomalyMin - yChartTop) : (yChartBottom - yAnomalyMin))
//     //             .attr('opacity', this.props.isAnomalyMarkersShown ? 0.1 : 0)
//     //             .attr('fill', 'red')
//     //             .attr('shape-rendering', 'crispEdges');

//     //         gAnomalyMarkers.append('line')
//     //             .attr('x1', 0)
//     //             .attr('x2', this.chartWidth)
//     //             .attr('y1', yAnomalyMin)
//     //             .attr('y2', yAnomalyMin)
//     //             .attr('opacity', this.props.isAnomalyMarkersShown ? 0.5 : 0)
//     //             .attr('stroke', 'red')
//     //             .attr('stroke-width', 1)
//     //             .attr('stroke-dasharray', '2,2')
//     //             .attr('shape-rendering', 'crispEdges');
//     //     }

//     //     // Anomaly Min vertical context
//     //     if ( ( yContextAnomalyMin >= 0 && this.props.isInvertYAxis )
//     //     || ( yContextAnomalyMin <= yChartBottom && !this.props.isInvertYAxis ) ) {

//     //         gverticalContextAnomalyMarkers.append('line')
//     //             .attr('x1', 0)
//     //             .attr('x2', verticalContextWidth)
//     //             .attr('y1', yContextAnomalyMin)
//     //             .attr('y2', yContextAnomalyMin)
//     //             .attr('opacity', this.props.isAnomalyMarkersShown ? 0.5 : 0)
//     //             .attr('stroke', 'red')
//     //             .attr('stroke-width', 1)
//     //             .attr('stroke-dasharray', '2,1')
//     //             .attr('shape-rendering', 'crispEdges');

//     //         let anomalyMinRectHeight = this.props.isInvertYAxis ? yContextAnomalyMin : this.chartHeight - yContextAnomalyMin;
//     //         gverticalContextAnomalyMarkers.append('rect')
//     //             .attr('x', 0)
//     //             .attr('width', verticalContextWidth)
//     //             .attr('y', this.props.isInvertYAxis ? 0 : yContextAnomalyMin)
//     //             .attr('height', anomalyMinRectHeight > 0 ? anomalyMinRectHeight : 0)
//     //             .attr('opacity', this.props.isAnomalyMarkersShown ? 0.2 : 0)
//     //             .attr('fill', 'red')
//     //             .attr('shape-rendering', 'crispEdges');
//     //     }
//     // }

//     private toggleMarkersVisible = (): void => {
//     //     this.markersShown = !this.markersShown;
//     //     this.updateAnomalyMarkers();
//     }
// }
