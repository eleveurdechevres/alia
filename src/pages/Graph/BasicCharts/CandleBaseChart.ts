// // import * as winston from 'winston';
// import * as d3 from 'd3';
// import { Axis, ScaleLinear, ScaleOrdinal } from 'd3';
// import { IGroupData, ISerieData } from '../model/DatabaseModel';
// import { BaseChart, IMargin, ISheetBase, svgBorderWidth } from './BaseChart';
// import * as ColorPalette from './ColorPalette';
// import * as LookAndFeelDictionary from './LookAndFeelDictionary';

// const yAxisWidth  = 50;
// const xAxisHeight  = 20;

// const defaultMarginChart: IMargin = {
//     top: svgBorderWidth + xAxisHeight,
//     bottom: svgBorderWidth + xAxisHeight,
//     left: svgBorderWidth + yAxisWidth,
//     right: svgBorderWidth };

// // This component is used both on server and client side
// export class CandleBaseChart extends BaseChart {

//     private lineNames: string[];

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
//     public candleGroupWidth = 0;
//     public candleWidth = 0;
//     public candleSpace = 0;
//     private maxCandlesPerGroup = 0;
//     public candleGroupMargin = 30;
//     private candleMaxWidth = 30;
    
//     public xChart: ScaleOrdinal<string, number> = d3.scaleOrdinal();
    
//     // public xChart0: ScaleBand<string> = d3.scaleBand();
//     // public xChart1: ScaleBand<string> = d3.scaleBand();
//     public yChartDomainDefault: [number, number];
//     public yChart: ScaleLinear<number, number> = d3.scaleLinear();

//     private xAxisChart: Axis<string | {valueOf(): number; }>;
//     private yAxisChart: Axis<number | {valueOf(): number; }>;
//     private yGridChart: Axis<number | {valueOf(): number; }>;

//     private zColors;

//     // svg components
//     private svgElementBase;
//     public legendCheckBoxes;
//     public legendTexts;
//     private gChart;
//     private gAxisChartX;
//     private gAxisChartY;
//     private gAxisGridY;

//     public candleGroups;
//     public candles;
//     private candleLine;
//     private candleMax;
//     private candleBar;
//     private candleMoy;
//     private candleMin;

//     constructor(
//         protected sheet: ISheetBase,
//         protected iPartition: number,
//         width: number,
//         height: number,
//         lookAndFeelMode: LookAndFeelDictionary.Mode,
//         margin: IMargin = defaultMarginChart) {

//         super(sheet, iPartition, width, height, lookAndFeelMode);

//         // this.displayedPathesMap = new Map();
//         // this.displayedPathesIndexMap = new Map();
//         // this.displayedPathesSet = new Set();

//         // this.partition.series.forEach( (s, i) => {
//         //     this.displayedPathesSet.add(s.serie_name);
//         // });

//         this.totalWidth = width;
//         this.totalHeight = height;
//         this.marginChart = margin;
//         this.chartHeight = this.totalHeight - this.marginChart.top - this.marginChart.bottom;
//         this.legendNbItemPerCol = Math.floor(this.chartHeight / this.legendItemHeight);

//         this.initLegendItems();
//         this.legendNbColumn = Math.ceil(this.flatLegendItems.length  / this.legendNbItemPerCol);
//         this.legendColumnWidth = (lookAndFeelMode === LookAndFeelDictionary.Mode.PDF_MODE) ? 70 : 180;

//         this.legendWidth = this.legendNbColumn * this.legendColumnWidth + this.legendLeftMargin;

//         this.chartWidth = this.totalWidth - this.marginChart.left - this.marginChart.right - this.legendLeftMargin - this.legendWidth;

//         // x
//         this.lineNames = sheet.data.reduce( (a, gd) => a.includes(gd.line.line_name) ? a : a.concat(gd.line.line_name), [] as string[]);
//         this.candleGroupWidth = this.chartWidth / (this.lineNames.length + 1);
//         this.maxCandlesPerGroup = this.flatLegendItems.length;
        
//         if ( this.maxCandlesPerGroup === undefined ) {
//             this.maxCandlesPerGroup = 0;
//         }
//         this.candleSpace = (this.candleGroupWidth - 2 * this.candleGroupMargin ) / this.maxCandlesPerGroup;
//         this.candleWidth = Math.min(this.candleMaxWidth, this.candleSpace * 90 / 100);

//         let xDomain = this.lineNames;
//         xDomain.unshift('');
//         xDomain.push('');
//         let xRange = xDomain.map( (v, i) => i * this.candleGroupWidth );
//         this.xChart.domain(xDomain);
//         this.xChart.range(xRange);

//         // y
//         let yMax: number | undefined = d3.max(sheet.data, (groupData: IGroupData) => {
//             return groupData.partitions[this.iPartition] ? groupData.partitions[this.iPartition].v_max as number : Number.NEGATIVE_INFINITY;
//         });
//         let yMin: number | undefined = d3.min(sheet.data, (groupData: IGroupData) => {
//             return groupData.partitions[this.iPartition] ? groupData.partitions[this.iPartition].v_min as number : Number.POSITIVE_INFINITY;
//         });
//         if ( yMax === undefined ) {
//             yMax = 1;
//         }
//         if ( yMin === undefined ) {
//             yMin = 0;
//         }
//         let yRange = yMax - yMin;
//         yMax += yRange / 10;
//         yMin -= yRange / 10;

//         this.yChartDomainDefault = [yMax, yMin];
//         this.yChart.domain(this.yChartDomainDefault).range([0, this.chartHeight]);

//         this.xAxisChart = d3.axisBottom(this.xChart);
//         this.yAxisChart = d3.axisLeft(this.yChart).tickSizeInner(6).tickSizeOuter(0);
//         this.yGridChart = d3.axisLeft(this.yChart).tickSizeInner(-this.chartWidth).tickSizeOuter(0);

//         this.zColors = d3.scaleOrdinal(ColorPalette.getColorPaletteByName(this.sheet.sheetDef.colorPalette!).colors);
//     }

//     public updateChart = (mode: LookAndFeelDictionary.Mode) => {
//         this.updateBargraphs(mode);
//         this.updateLegendTexts(mode);
//         this.updateXAxis(mode);
//         this.updateYAxis(mode);
//     }

//     public updateBargraphs = (mode: LookAndFeelDictionary.Mode) => {
//         let stroke = LookAndFeelDictionary.getLookAndFeelValue('candle', 'stroke', mode);
        
//         this.candleLine
//         .attr('stroke', stroke)
//         .attr('y1', (o): number => { return this.yChart(o.serieData.v_max as number); })
//         .attr('y2', (o): number => { return this.yChart(o.serieData.v_min as number); });

//         this.candleMax
//         .attr('stroke', stroke)
//         .attr('y1', (o): number => { return this.yChart(o.serieData.v_max as number); })
//         .attr('y2', (o): number => { return this.yChart(o.serieData.v_max as number); });

//         this.candleBar
//         .attr('stroke', stroke)
//         .attr('y', (o): number =>
//             Math.min(this.yChart(o.serieData.v_avg - o.serieData.v_sd), this.yChart(o.serieData.v_avg + o.serieData.v_sd)))
//         .attr('height', (o): number =>
//             Math.abs(this.yChart(o.serieData.v_avg + o.serieData.v_sd) - this.yChart(o.serieData.v_avg - o.serieData.v_sd)));

//         this.candleMoy
//         .attr('y1', (o): number => { return this.yChart(o.serieData.v_avg); })
//         .attr('y2', (o): number => { return this.yChart(o.serieData.v_avg); });

//         this.candleMin
//         .attr('stroke', stroke)
//         .attr('y1', (o): number => { return this.yChart(o.serieData.v_min as number); })
//         .attr('y2', (o): number => { return this.yChart(o.serieData.v_min as number); });

//         // this.displayedPathesMap.forEach( (path, serieName) => {
//         //     path.attr('d', this.createLineChart(this.displayedPathesIndexMap.get(serieName)!));
//         // } );
//     }

//     public updateXAxis = (mode: LookAndFeelDictionary.Mode) => {
//         this.gAxisChartX.call(this.customAxis, this.xAxisChart, mode);
//     }

//     public updateYAxis = (mode: LookAndFeelDictionary.Mode) => {
//         this.gAxisChartY.call(this.customAxis, this.yAxisChart, mode);
//         this.gAxisGridY.call(this.customGrid, this.yGridChart, mode);
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

//         this.gAxisChartX = this.gChart.append('g').attr('transform', 'translate(0,' + this.chartHeight + ')');
//         this.gAxisChartY = this.gChart.append('g').attr('transform', 'translate(0,0)');

//         this.gAxisGridY = this.gChart.append('g').attr('transform', 'translate(0,0)');

//         this.zColors.domain(this.flatLegendItems);

//         this.candleGroups = this.gChart.selectAll('candleGroup')
//             .data(this.lineNames)
//             .enter()
//             .append('g')
//                 .attr('class', 'candleGroup')
//                 .attr('transform', (lineName: string): string => {
//                     let xGroup = this.xChart(lineName);
//                     return 'translate(' + xGroup + ', 0)';
//                 });

//         this.candles = this.candleGroups
//             .selectAll('candle')
//             .data(
//                 (lineName: string) => this.flatLegendItems.map( 
//                     legendItem => {
//                         const seriesDef = this.sheet.sheetDef.seriesDefs[legendItem.seriesDefIndex];
//                         const groupData = this.sheet.data.find( gd => (gd.serieDef === seriesDef && gd.line.line_name === lineName));
//                         const serieData =
//                             groupData ? groupData.partitions[this.iPartition].series.find( sd => sd.serie_name === legendItem.serieName) : undefined;
//                         return { lineName: lineName, legendItem: legendItem, serieData: serieData };
//                     }
//                 )
//             )
//             /*
//                 ([] as ISerieData[]).concat(
//                     ...this.sheet.data.filter( gd => gd.line.line_name === lineName ).map( gd => gd.partitions[this.iPartition].series ) ) )
//             */
//             .enter()
//             .append('g')
//                 .attr('transform', (serieData: ISerieData, serieDataIndex: number): string => {
//                     let xCandle = - this.candleGroupWidth / 2 + this.candleGroupMargin + serieDataIndex * this.candleSpace;
//                     return 'translate(' + xCandle + ', 0)';
//                 });
//         let candleMargin = (this.candleSpace - this.candleWidth) / 2;
//         let x1 = candleMargin;
//         let xMiddle = this.candleSpace / 2;
//         let x2 = this.candleSpace - candleMargin;
//         let fill = (o): number => {return this.zColors(o.legendItem); };
//         let strokeWidth = 1;
//         let strokeDasharray = '2,2';

//         this.candleLine = this.candles
//         .filter( (d) => d.serieData )
//         .append('line')
//         .attr('x1', xMiddle)
//         .attr('x2', xMiddle)
//         .attr('stroke-linejoin', 'round')
//         .attr('stroke-linecap', 'round')
//         .attr('stroke-width', strokeWidth)
//         .attr('stroke-dasharray', strokeDasharray)
//         .attr('clip-path', 'url(#clip)')
//         .attr('cursor', 'crosshair')
//         .attr('shape-rendering', 'crispEdges');
        
//         this.candleMax = this.candles
//         .filter( (d) => d.serieData )
//         .append('line')
//         .attr('x1', x1)
//         .attr('x2', x2)
//         .attr('stroke-linejoin', 'round')
//         .attr('stroke-linecap', 'round')
//         .attr('stroke-width', strokeWidth)
//         .attr('clip-path', 'url(#clip)')
//         .attr('cursor', 'crosshair')
//         .attr('shape-rendering', 'crispEdges');

//         this.candleBar = this.candles
//         .filter( (d) => d.serieData )
//         .append('rect')
//         .attr('x', x1)
//         .attr('width', x2 - x1)
//         .attr('fill', fill)
//         .attr('stroke-linejoin', 'round')
//         .attr('stroke-linecap', 'round')
//         .attr('stroke-width', strokeWidth)
//         .attr('clip-path', 'url(#clip)')
//         .attr('cursor', 'crosshair')
//         .attr('shape-rendering', 'crispEdges');

//         this.candleMoy = this.candles
//         .filter( (d) => d.serieData )
//         .append('line')
//         .attr('x1', x1)
//         .attr('x2', x2)
//         .attr('fill', fill)
//         .attr('stroke', 'black')
//         .attr('stroke-linejoin', 'round')
//         .attr('stroke-linecap', 'round')
//         .attr('stroke-width', strokeWidth)
//         .attr('stroke-dasharray', strokeDasharray)
//         .attr('clip-path', 'url(#clip)')
//         .attr('cursor', 'crosshair')
//         .attr('shape-rendering', 'crispEdges');

//         this.candleMin = this.candles
//         .filter( (d) => d.serieData )
//         .append('line')
//         .attr('x1', x1)
//         .attr('x2', x2)
//         .attr('stroke-linejoin', 'round')
//         .attr('stroke-linecap', 'round')
//         .attr('stroke-width', strokeWidth)
//         .attr('clip-path', 'url(#clip)')
//         .attr('cursor', 'crosshair')
//         .attr('shape-rendering', 'crispEdges');

//         this.updateBargraphs(this.lookAndFeelMode);
        
//         // draw legends
//         let legends = this.gChart.selectAll('.legend')
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
//             });
//             // .style('cursor', 'pointer');

//         this.legendCheckBoxes = legends.append('rect')
//             .attr('width', this.legendRectSize)
//             .attr('height', this.legendRectSize)
//             .attr('fill', this.zColors)
//             .attr('stroke', this.zColors);

//         this.legendTexts = legends.append('text')
//             .attr('x', this.legendRectSize + this.legendSpacing)
//             .attr('y', this.legendRectSize - this.legendSpacing)
//             .attr('font-size', 10)
//             .attr('fill', LookAndFeelDictionary.getLookAndFeelValue('text', 'fill', this.lookAndFeelMode))
//             .text((d) => d);

//         // draw Axis
//         this.updateXAxis(this.lookAndFeelMode);
//         this.updateYAxis(this.lookAndFeelMode);
//     }
    
//     private updateLegendTexts = (mode: LookAndFeelDictionary.Mode) => {
//         this.legendTexts.attr('fill', LookAndFeelDictionary.getLookAndFeelValue('text', 'fill', mode));
//     }
// }
