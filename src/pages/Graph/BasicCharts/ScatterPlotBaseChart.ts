// // import * as winston from 'winston';
// import * as d3 from 'd3';
// import { Axis, ScaleLinear } from 'd3';
// import { ISheet } from '../store/ChartStore';
// import { BaseChart, ILegendItem, IMargin, svgBorderWidth } from './BaseChart';
// import { IColorPalette } from './ColorPalette';
// import * as LookAndFeelDictionary from './LookAndFeelDictionary';
// import * as ColorPalette from './ColorPalette';

// export interface IEnhancedPoint {
//     legendItem: ILegendItem;
//     point: [number, number];
//     date: Date;
// }

// const yAxisWidth  = 50;
// const xAxisHeight  = 20;

// const defautMarginChart: IMargin = {
//     top: svgBorderWidth + xAxisHeight,
//     bottom: svgBorderWidth + xAxisHeight,
//     left: svgBorderWidth + yAxisWidth,
//     right: svgBorderWidth
// };

// export interface ISerieGroup {
//     legendItem: ILegendItem;
//     svgGroup: any;
// }

// // This component is used both on server and client side
// export class ScatterPlotBaseChart extends BaseChart {

//     // Params
//     private marginChart: IMargin;

//     // Mesures
//     private legendRectSize = 14;
//     private legendSpacing = 4;
//     private legendItemHeight: number = this.legendRectSize + this.legendSpacing;
//     private legendLeftMargin = 10;

//     private chartWidth: number;
//     private chartHeight: number;
//     private legendNbItemPerCol: number;
//     private legendNbColumn: number;
//     public legendWidth: number;
//     private legendColumnWidth: number;

//     public xChartDomainDefault: [number, number];
//     public yChartDomainDefault: [number, number];

//     public xChart: ScaleLinear<number, number> = d3.scaleLinear();
//     public yChart: ScaleLinear<number, number> = d3.scaleLinear();

//     private xAxisChart: Axis<number | {valueOf(): number; }>;
//     private yAxisChart: Axis<number | {valueOf(): number; }>;
// //    private yGridChart: Axis<number | {valueOf(): number; }>;

//     private zColors;

//     // svg components
//     private svgElementBase;
//     public legends;
//     public legendCheckBoxes;
//     public legendTexts;
//     private gChart;
//     private gAxisChartTimePeriod;
//     private gAxisChartTime;
//     private gAxisChartX;
//     private gAxisChartY;
//     private gAllSeriesPlots;
//     // private gAxisGridY;

//     // Utils
//     public seriesGroups: ISerieGroup[] = [];

//     constructor(
//         protected sheet: ISheet,
//         protected iPartition: number,
//         width: number,
//         height: number,
//         lookAndFeelMode: LookAndFeelDictionary.Mode,
//         margin: IMargin = defautMarginChart) {

//         super(sheet, iPartition, width, height, lookAndFeelMode);

//         this.totalWidth = width;
//         this.totalHeight = height;
//         this.marginChart = margin;

//         this.initLegendItems();

//         this.chartHeight = this.totalHeight - this.marginChart.top - this.marginChart.bottom;
//         this.legendNbItemPerCol = Math.floor(this.chartHeight / this.legendItemHeight);
//         this.legendNbColumn = Math.ceil(this.flatLegendItems.length / this.legendNbItemPerCol);
//         this.legendColumnWidth = (lookAndFeelMode === LookAndFeelDictionary.Mode.PDF_MODE) ? 70 : 180;

//         this.legendWidth = this.legendNbColumn * this.legendColumnWidth + this.legendLeftMargin;

//         this.chartWidth = this.totalWidth - this.marginChart.left - this.marginChart.right - this.legendLeftMargin - this.legendWidth;

//         const {xMin, xMax, yMin, yMax} = this.sheet.data.reduce(
//             (acc, gd) => {
//                 if (gd.partitions[this.iPartition]) {
//                     const v_min = gd.partitions[this.iPartition].v_min as [number, number];
//                     const v_max = gd.partitions[this.iPartition].v_max as [number, number];
//                     const _xMin = (acc.xMin > v_min[0] ? v_min[0] : acc.xMin);
//                     const _xMax = (acc.xMax > v_max[0] ? acc.xMax : v_max[0]);
//                     const _yMin = (acc.yMin > v_min[1] ? v_min[1] : acc.yMin);
//                     const _yMax = (acc.yMax > v_max[1] ? acc.yMax : v_max[1]);
//                     return { xMin: _xMin, xMax: _xMax, yMin: _yMin, yMax: _yMax };
//                 }
//                 else return acc;
//             },
//             { xMin: Number.POSITIVE_INFINITY, xMax: Number.NEGATIVE_INFINITY, yMin: Number.POSITIVE_INFINITY, yMax: Number.NEGATIVE_INFINITY }
//         );
        
//         this.xChartDomainDefault = [xMin, xMax];
//         this.yChartDomainDefault = [yMin, yMax];
//         this.xChart.domain(this.xChartDomainDefault).range([0, this.chartWidth]).ticks(5);
//         this.yChart.domain(this.yChartDomainDefault).range([this.chartHeight, 0]);

//         this.xAxisChart = d3.axisBottom(this.xChart);
//         this.yAxisChart = d3.axisLeft(this.yChart);

//         this.zColors = d3.scaleOrdinal(ColorPalette.getColorPaletteByName(this.sheet.sheetDef.colorPalette!).colors);
//     }

//     // public getYRangeEnd = ()  => {
//     //     return this.yChart(this.chartData.y_end);
//     // }

//     // public getYRangeStart = ()  => {
//     //     return this.yChart(this.chartData.y_start);
//     // }

//     public updateChart = (mode: LookAndFeelDictionary.Mode) => {
//         this.updateLegendTexts(mode);
//         this.updateXAxis(mode);
//         this.updateYAxis(mode);
//     }

//     public updateSeries = () => {
//         this.seriesGroups.forEach( g => {
//             g.svgGroup.selectAll('.scatterPlotPoint')
//                 .transition().duration(500)
//                 .attr('cx', (enhancedPoint: IEnhancedPoint) => { return this.xChart(enhancedPoint.point[0]); })
//                 .attr('cy', (enhancedPoint: IEnhancedPoint) => { return this.yChart(enhancedPoint.point[1]); });
//         } );
//     }

//     public updateXAxis = (mode: LookAndFeelDictionary.Mode) => {
//         this.gAxisChartX.transition().duration(500).call(this.customAxis, this.xAxisChart, mode);
//     }

//     public updateYAxis = (mode: LookAndFeelDictionary.Mode) => {
//         this.gAxisChartY.transition().duration(500).call(this.customAxis, this.yAxisChart, mode);
//     }

//     public createChart = (svgRef: Element) => {
//         this.svgElementBase = d3.select(svgRef);
//         this.svgElementBase.selectAll('*').remove();

//         this.svgElementBase.append('rect')
//             .attr('width', this.totalWidth)
//             .attr('height', this.totalHeight)
//             .attr('stroke', LookAndFeelDictionary.getLookAndFeelValue('svgRect', 'stroke', this.lookAndFeelMode))
//             .attr('stroke-width', 1)
//             .attr('fill', 'none');

//         this.gChart = this.svgElementBase.append('g')
//             .attr('transform', 'translate(' + this.marginChart.left + ',' + this.marginChart.top + ')');

//         this.gAxisChartTime = this.gChart.append('g').attr('transform', 'translate(0,0)');
//         this.gAxisChartTimePeriod = this.gAxisChartTime.append('g').attr('transform', 'translate(0,0)');
//         this.gAllSeriesPlots = this.gChart.append('g');
//         this.gAxisChartX = this.gChart.append('g').attr('transform', 'translate(0,' + this.chartHeight / 2 + ')');
//         this.gAxisChartY = this.gChart.append('g').attr('transform', 'translate(' + this.chartWidth / 2 + ',0)');

//         // this.gAxisGridY = this.gChart.append('g').attr('transform', 'translate(0,0)');
//         this.zColors.domain(this.flatLegendItems);

//         this.sheet.data.forEach( (gd) => {
//             const seriesDefIndex = this.sheet.sheetDef.seriesDefs.indexOf(gd.serieDef);
//             gd.partitions[this.iPartition].series.forEach( (serieData) => {
//                 const legendItem = this.legendItemsBySeriesDefs[seriesDefIndex].find( v => serieData.serie_name === v.serieName );
//                 if (!legendItem) {
//                     console.log('legendItem not found for serie ' + serieData.serie_name);
//                     return;
//                 }
//                 let strokeColor = this.zColors(legendItem);
//                 let currentSeriePlot = this.gAllSeriesPlots.append('g');
//                 let enhancedPoints: IEnhancedPoint[] = serieData.values.map((point: [number, number], index: number) => {
//                     let enhancedPoint: IEnhancedPoint = {
//                         legendItem: legendItem,
//                         point: point,
//                         date: new Date(serieData.times[index])
//                     };
//                     return enhancedPoint;
//                 });

//                 currentSeriePlot.selectAll('.scatterPlotPoint')
//                     .data(enhancedPoints)
//                     .enter()
//                         .append('circle')
//                         .attr('class', 'scatterPlotPoint')
//                         .attr('r', 1.2)
//                         .attr('cx', (enhancedPoint: IEnhancedPoint) => { return this.xChart(enhancedPoint.point[0]); })
//                         .attr('cy', (enhancedPoint: IEnhancedPoint) => { return this.yChart(enhancedPoint.point[1]); })
//                         .attr('fill', strokeColor)
//                         .attr('stroke', strokeColor)
//                         .attr('stroke-linejoin', 'round')
//                         .attr('stroke-linecap', 'round')
//                         .attr('stroke-width', 1.2)
//                         .attr('clip-path', 'url(#clip)')
//                         .attr('cursor', 'crosshair')
//                         .attr('shape-rendering', 'geometricPrecision')
//                         .style('opacity', 1);

//                 this.seriesGroups.push( { legendItem: legendItem, svgGroup: currentSeriePlot });
//             });
//         });
//         this.updateSeries();

//         // draw legends
//         this.legends = this.gChart.selectAll('.legend')
//             .data(this.flatLegendItems)
//             .enter()
//             .append('g')
//             .attr('class', 'legend')
//             .attr('transform', (d: any, i: number) => {
//                 let column = ~~(i / this.legendNbItemPerCol);
//                 let rankInCol = i % this.legendNbItemPerCol;
//                 let voffset = column * this.legendColumnWidth;
//                 let horz = this.chartWidth + this.legendLeftMargin + voffset;
//                 let vert = rankInCol * this.legendItemHeight;
//                 return `translate(${horz}, ${vert})`;
//             })
//             .style('cursor', 'pointer');

//         this.legendCheckBoxes = this.legends.append('rect')
//             .attr('width', this.legendRectSize)
//             .attr('height', this.legendRectSize)
//             .attr('fill', this.legendCheckBoxFill)
//             .attr('stroke', this.zColors);

//         this.legendTexts = this.legends.append('text')
//             .attr('x', this.legendRectSize + this.legendSpacing)
//             .attr('y', this.legendRectSize - this.legendSpacing)
//             .attr('font-size', 10)
//             .attr('fill', LookAndFeelDictionary.getLookAndFeelValue('text', 'fill', this.lookAndFeelMode))
//             .text((d) => d);

//         // draw Axis
//         this.updateXAxis(this.lookAndFeelMode);
//         this.updateYAxis(this.lookAndFeelMode);
//     }

//     public legendCheckBoxFill = (legendItem: ILegendItem) => {
//         if ( legendItem.isShown ) {
//             return this.zColors(legendItem);
//         }
//         return 'none';
//     }

//     private updateSvgElementBase = (mode: LookAndFeelDictionary.Mode) => {
//         this.svgElementBase.attr('stroke', LookAndFeelDictionary.getLookAndFeelValue('svgRect', 'stroke', mode));
//     }

//     private updateLegendTexts = (mode: LookAndFeelDictionary.Mode) => {
//         this.legendTexts.attr('fill', LookAndFeelDictionary.getLookAndFeelValue('text', 'fill', mode));
//     }

//     private pointMin = (p1: [number, number], p2: [number, number]) => [Math.min(p1[0], p2[0]), Math.min(p1[1], p2[1])];

//     private pointMax = (p1: [number, number], p2: [number, number]) => [Math.max(p1[0], p2[0]), Math.max(p1[1], p2[1])];
// }
