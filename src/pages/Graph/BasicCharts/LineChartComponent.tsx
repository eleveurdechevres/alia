import { ContextMenu } from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';
import * as d3 from 'd3';
import { Area, Axis, BrushBehavior, ScaleLinear, ScaleTime } from 'd3';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
// import { style } from 'typestyle';
import { GenericChartComponent, IMargin } from './GenericChartComponent';
import { ISerieData } from 'src/interfaces/ISerieData';
import { LineBaseChart, IDisplayedPath } from './LineBaseChart';
import { ISheet } from 'src/interfaces/ISheet';
import { LineCrosshair, ILineChartCrosshairState } from './LineCrosshair';
import { ILegendItem } from './BaseChart';
import { IDateInterval } from '../GraphBoard';

interface IProps {
    sheet: ISheet;
    chartWidth: number;
    chartHeight: number;
    dateInterval: IDateInterval;
    series: ISerieData[];
}

// interface IProps extends IPropsGenericChartComponent {
//     sheet: ISheet;
//     iPartition: number;
//     handleGlobalMarkersManager: IhandleGlobalMarkersManager;
//     handleSheetMarkersManager: IhandleSheetMarkersManager;
//     verticalMarkers: Date[];
//     horizontalMarkers: number[];
// }

interface IHorizontalContextDatum {
    x: Date;
    y: number;
}

// const mousePointerClassName = style({cursor: 'pointer', pointerEvents: 'visible'});

    // D3 Popular Blocks :
    // https://bl.ocks.org

    // D3 Pan & Zoom axes
    // https://bl.ocks.org/mbostock/db6b4335bf1662b413e7968910104f0f

    // D3 Brush & Zoom (context)
    // https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172

    // D3 Brush & zoom (graph)
    // https://bl.ocks.org/mbostock/f48fcdb929a620ed97877e4678ab15e6

    // D3 advanced brush style
    // http://bl.ocks.org/jisaacks/5678983

    // D3 X-value MouseOver
    // https://bl.ocks.org/mbostock/3902569

    // D3 shape drag
    // https://bl.ocks.org/feyderm/4d143591b66725aed0f1855444752fd9

    // D3
    // https://developer.mozilla.org/fr/docs/Web/SVG/Attribute

    // D3 Right-click context menu
    // http://jsfiddle.net/thudfactor/WwdT3

    // CSS mouse cursors
    // https://developer.mozilla.org/fr/docs/Web/CSS/cursor

    // Export SVG D3 visualization to PNG or JPEG
    // http://bl.ocks.org/Rokotyan/0556f8facbaf344507cdc45dc3622177

    // http://bl.ocks.org/duopixel/3831266

const horizontalContextHeight = 70;
const verticalContextWidth = 50;
const yAxisWidth = 50;
const xAxisHeight = 50;

const legendLeftMargin = 10;

const defaultTransition = d3.transition()
.duration(750)
.ease(d3.easeExp);
const zoomTransition = defaultTransition;

@observer export class LineChartComponent extends GenericChartComponent<IProps> {

    // Mesures
    private totalWidth: number;
    private totalHeight: number;
    private chartWidth: number;
    private chartHeight: number;
    private marginChart: IMargin;
    private marginHorizontalContext: IMargin;
    private marginVerticalContext: IMargin;

    // Chart js object
    private baseChart: LineBaseChart;

    // References of SVG graphic components
    private refGChart: SVGGElement;
    // private refGVerticalMarkers: SVGGElement;
    // private refGVerticalContextMarkers: SVGGElement;
    // private refGHorizontalContextMarkers: SVGGElement;
    // private refGHorizontalMarkers: SVGGElement;
    // private refGAnomalyMarkers: SVGGElement;
    // private refGVerticalContextAnomalyMarkers: SVGGElement;

    private refGBrush: SVGGElement;

    private refGHorizontalContextPathes: SVGGElement;
    private refGHorizontalBrush: SVGGElement;

    private refGVerticalBrush: SVGGElement;

    private refGHorizontalBrushDetail: SVGGElement;
    private refGVerticalBrushDetail: SVGGElement;

    private refGHorizontalContextAxisX: SVGGElement;
    private refGVerticalContextAxisY: SVGGElement;

    // Popup Menu
    // @observable private markersShown = true;
    // private anomalyMarkersShown = false;
    // private newVerticalMarkerDate: Date | undefined = undefined;
    // private newMarkerYValue = NaN;
    // private markersColorScale: ScaleOrdinal<string, string> = d3.scaleOrdinal(d3.schemeCategory10);
    // private xLastClick: number;
    // private yLastClick: number;

    // d3 components
    private brush: BrushBehavior<{}>;
    private horizontalBrush: BrushBehavior<{}>;
    private verticalBrush: BrushBehavior<{}>;
    private horizontalBrushDetail: BrushBehavior<{}>;
    private verticalBrushDetail: BrushBehavior<{}>;
    private xHorizontalContextTime: ScaleTime<number, number>;
    private yHorizontalContext: ScaleLinear<number, number>;
    private yVerticalContext: ScaleLinear<number, number>;
    private xAxisContext: Axis<number | Date | { valueOf(): number; }>;
    private yAxisContext: Axis<number | { valueOf(): number; }>;
    private lineHorizontalContext: Area<IHorizontalContextDatum>;
    // helpIconRef;

    // Utils
    private mapCrosshairValues: Map<string, number> = new Map();

    private saveXDomain: Date[];
    private saveYDomain: number[];

    private crossHairTimer: NodeJS.Timer;
    @observable private crosshairState: ILineChartCrosshairState = {
        xDisplayed: false,
        yDisplayed: false,
        position: {
            x: 0,
            y: 0
        },
        mousePosition: {
            x: 0,
            y: 0
        },
        xValue: undefined,
        xTime: undefined,
        yValue: 0,
        textDisplayed: null,
        crossHairTimeFormat: ''
    };

    constructor(props: IProps) {
        super(props);

        // observe(this.props.verticalMarkers, (change) => {
        //     this.updateVerticalMarkers();
        // });

        // observe(this.props.horizontalMarkers, (change) => {
        //     this.updateHorizontalMarkers();
        // });

        this.marginChart = {
            top: GenericChartComponent.svgBorderWidth + xAxisHeight,
            bottom: GenericChartComponent.svgBorderWidth + horizontalContextHeight + 2 * xAxisHeight,
            left: GenericChartComponent.svgBorderWidth + verticalContextWidth + yAxisWidth,
            right: GenericChartComponent.svgBorderWidth
        };

        // protected sheet: ISheet,
        // protected seriesData: ISerieData[],
        // width: number,
        // height: number,
        // margin: IMargin = defautMarginChart

        this.baseChart = new LineBaseChart(
            this.props.sheet,
            this.props.series,
            this.props.chartWidth,
            this.props.chartHeight
        );
    }

    public componentWillMount() {
        this.updateChartComponent(this.saveXDomain, this.saveYDomain);
    }

    public componentDidMount() {
        this.drawChart(true);
        this.updateComponents();
    }

    public componentWillUpdate() {
        // this.saveXDomain = this.baseChart.timeScaleChart.domain();
        // this.saveYDomain = this.baseChart.yChart.domain();
        // this.updateChartComponent(this.saveXDomain, this.saveYDomain);
    }

    public componentDidUpdate() {
        this.drawChart(false);
        // this.baseChart.updateChart(this.props.lookAndFeelStore.getMode());
        // this.updateComponents();
    }

    public render() {
        return (
            <svg width={this.totalWidth} height={this.totalHeight} id="svgChart">
                <defs>
                    <clipPath id="clip">
                        <rect width={this.chartWidth} height={this.chartHeight} />
                    </clipPath>
                </defs>
                <g transform={'translate(' + this.marginChart.left + ',' + this.marginChart.top + ')'}>

                    {/* <g className='verticalMarkers' ref={ (ref) => { if (ref) { this.refGVerticalMarkers = ref; } }} clipPath='url(#clip)'/>
                    <g className='horizontalMarkers' ref={ (ref) => { if (ref) { this.refGHorizontalMarkers = ref; } }} clipPath='url(#clip)'/>
                    <g className='anomalyMarkers' ref={(ref) => { if (ref) { this.refGAnomalyMarkers = ref; } }} clipPath='url(#clip)'/> */}

                    <g
                        className="horizontalContextDetail"
                        ref={(ref) => { if (ref) { this.refGHorizontalBrushDetail = ref; } }}
                        transform={'translate(0,' + (this.chartHeight) + ')'}
                    />
                    <g
                        className="verticalContextDetail"
                        ref={(ref) => { if (ref) { this.refGVerticalBrushDetail = ref; } }}
                        transform={'translate(' + (- yAxisWidth) + ',0)'}
                    />
                    <g id="generalBrush" ref={(ref) => {if (ref) { this.refGBrush = ref; } }}>
                        <rect
                            width={this.chartWidth}
                            height={this.chartHeight}
                            fill="none"
                        />
                    </g>
                </g>
                <g ref={(ref) => { if (ref) { this.refGChart = ref; } }}/>
                <g transform={'translate(' + this.marginChart.left + ',' + this.marginChart.top + ')'}>
                    <LineCrosshair
                        crosshairWidth={this.chartWidth}
                        crosshairHeight={this.chartHeight}
                        crosshairState={this.crosshairState}
                        xAxisHeight={xAxisHeight}
                        yAxisWidth={yAxisWidth}
                    />
                </g>
                <g
                    className="horizontalContext"
                    transform={'translate(' + this.marginHorizontalContext.left + ',' + this.marginHorizontalContext.top + ')'}
                >
                    <g ref={(ref) => { if (ref) { this.refGHorizontalContextPathes = ref; } }}/>
                    {/* <g className='verticalMarkers' ref={ (ref) => { if (ref) { this.refGHorizontalContextMarkers = ref; } }}/> */}
                    <g ref={(ref) => { if (ref) { this.refGHorizontalBrush = ref; } }}/>
                    <g
                        ref={(ref) => { if (ref) { this.refGHorizontalContextAxisX = ref; } }}
                        transform={'translate(0,' + horizontalContextHeight + ')'}
                    />
                </g>
                <g
                    className="verticalContext"
                    transform={'translate(' + this.marginVerticalContext.left + ',' + this.marginVerticalContext.top + ')'}
                >
                    {/* <g className='horizontalMarkers' ref={ (ref) => { if (ref) { this.refGVerticalContextMarkers = ref; } }}/>
                    <g className='horizontalAnomalyMarkers' ref={ (ref) => { if (ref) { this.refGVerticalContextAnomalyMarkers = ref; } }}/> */}
                    <g ref={(ref) => {if (ref) { this.refGVerticalBrush = ref; } }}/>
                    <g
                        ref={(ref) => {if (ref) { this.refGVerticalContextAxisY = ref; } }}
                        transform={'translate(0,0)'}
                    />
                </g>
                {/* <g transform={'translate(0,' + (this.marginChart.top + this.chartHeight + xAxisHeight) + ')'}>
                    { (this.props.verticalMarkers.length > 0 || this.props.horizontalMarkers.length > 0) ?
                        <foreignObject x='0' y='0' width='100' height='100'>
                            <Icon
                                className={mousePointerClassName}
                                icon={this.markersShown ? 'eye-on' : 'eye-off'}
                                iconSize={20}
                                onClick={this.toggleMarkersVisible}/> Markers
                        </foreignObject>
                        : null
                    }
                </g> */}
            </svg>
        );
    }

    private showContextMenu = (xMouse: number, yMouse: number): void => {
        // let mouseDate = this.baseChart.timeScaleChart.invert(this.xLastClick);
        // this.newMarkerYValue = this.baseChart.yChart.invert(this.yLastClick);

        const menu = ( <div/>
            // <Menu>
            //     <MenuItem text='Save As' icon='download'>
            //         <MenuItem text='Image (.png)' icon='media' onClick={this.saveChartAsPng} />
            //         <MenuItem text='Text (.csv)' icon='document' onClick={this.saveChartAsCSV} />
            //     </MenuItem>
            //     <MenuDivider />
            //     <MenuItem text='Add horizontal marker' icon='arrows-horizontal'>
            //         <input className={classNames(Classes.INPUT, Classes.LARGE, style(csstips.fillParent))}
            //             defaultValue={this.newMarkerYValue.toString()}
            //             type='number'
            //             onChange={(event) => { this.newMarkerYValue = parseFloat(event.target.value); }}
            //             onKeyPress={(event) => { if (event.which === 13 || event.keyCode === 13 ) {this.handleAddHorizontalMarker(); } }}
            //         />
            //         <Button className={style(csstips.fillParent)} text='Add to section'
            //             rightIcon='add'
            //             onClick={() => { this.handleAddHorizontalMarker(); }}/>
            //     </MenuItem>
            //     <MenuItem text='Add vertical marker' icon='arrows-vertical'>
            //         <Text ellipsize={false}>{newMarkerXDateDescription}</Text>
            //         <Button className={style(csstips.fillParent)} text='Add to all charts'
            //             rightIcon='circle-arrow-down'
            //             onClick={() => this.handleAddVerticalMarker()}/>
            //     </MenuItem>
            //     { this.props.verticalMarkers.length > 0 || this.props.horizontalMarkers.length > 0 ?
            //         <React.Fragment>
            //             <MenuItem text={this.markersShown ? 'Hide markers' : 'Show markers'}
            //                 onClick={(event) => this.handleHideShowMarkers()}
            //                 icon={this.markersShown ? 'eye-off' : 'eye-on'}/>
            //             <MenuItem text='Remove all markers'
            //                 onClick={(event) => this.handleRemoveAllMarkers()}
            //                 icon='trash'
            //                 />
            //         </React.Fragment> :
            //         <React.Fragment/>
            //     }
            // </Menu>
        );

        // mouse position is available on event
        ContextMenu.show(menu, { left: xMouse - 20, top: yMouse - 20}, () => {
            // menu was closed; callback optional
        });

    }

    private updateChartComponent(domainTime: Date[] | undefined, domainY: number[] | undefined): void {

        if ( domainTime ) {
            this.baseChart.timeScaleChart.domain(domainTime);
        }
        if ( domainY ) {
            this.baseChart.yChart.domain(domainY);
        }

        this.totalWidth = this.props.chartWidth;
        this.totalHeight = this.props.chartHeight;
        this.chartHeight = this.totalHeight - this.marginChart.top - this.marginChart.bottom;

        this.chartWidth = this.totalWidth - this.marginChart.left - this.marginChart.right - legendLeftMargin - this.baseChart.legendWidth;

        this.marginVerticalContext = {
            top: this.marginChart.top,
            bottom: this.marginChart.bottom,
            left: GenericChartComponent.svgBorderWidth,
            right: this.totalWidth - verticalContextWidth - GenericChartComponent.svgBorderWidth
        };
        this.marginHorizontalContext = {
            top: this.marginChart.top + this.chartHeight + xAxisHeight,
            bottom: GenericChartComponent.svgBorderWidth,
            left: this.marginChart.left,
            right: this.marginChart.right
        };

        const yMin = this.props.series.reduce(
            (ymin, serie) => serie.yMin < ymin ? serie.yMin : ymin, Number.POSITIVE_INFINITY
        ) as number;
        const yMax = this.props.series.reduce(
            (ymax, serie) => serie.yMax > ymax ? serie.yMax : ymax, Number.NEGATIVE_INFINITY
        ) as number;
        let yDomain = [yMin, yMax];

        const time_start: number = this.props.series.reduce((start, serie) => serie.timeStart.getTime() < start ? serie.timeStart.getTime() : start, Number.POSITIVE_INFINITY);
        const time_end: number = this.props.series.reduce((end, serie) => serie.timeEnd.getTime() > end ? serie.timeEnd.getTime() : end, Number.NEGATIVE_INFINITY);
        let xTimeDomain = [new Date(time_start), new Date(time_end)];

        this.xHorizontalContextTime = d3.scaleTime().domain(xTimeDomain).range([0, this.chartWidth]);
        this.yHorizontalContext = d3.scaleLinear().domain(yDomain).range([horizontalContextHeight, 0]);
        this.yVerticalContext = d3.scaleLinear().domain(yDomain).range([this.chartHeight, 0]);

        this.xAxisContext = d3.axisBottom(this.xHorizontalContextTime);
        this.baseChart.customizeAxisTime(this.xHorizontalContextTime, this.xAxisContext);

        this.yAxisContext = d3.axisRight(this.yVerticalContext);

        this.brush = d3.brush()
            .extent([[0, 0], [this.chartWidth, this.chartHeight]])
            .on('end', this.brushed);

        this.horizontalBrush = d3.brushX()
            .extent([[0, 0], [this.chartWidth, horizontalContextHeight]])
            .on('brush end', this.horizontalBrushed);

        this.horizontalBrushDetail = d3.brushX()
            .extent([[0, -this.chartHeight], [this.chartWidth, xAxisHeight]])
            .on('end', this.horizontalBrushedDetail);

        this.verticalBrush = d3.brushY()
            .extent([[0, 0], [verticalContextWidth, this.chartHeight]])
            .on('brush end', this.verticalBrushed);

        this.verticalBrushDetail = d3.brushY()
            .extent([[0, 0], [yAxisWidth + this.chartWidth, this.chartHeight]])
            .on('end', this.verticalBrushedDetail);

        this.lineHorizontalContext =  d3.area<IHorizontalContextDatum>()
            .curve(d3.curveMonotoneX)
            .x((d, i, a) => this.xHorizontalContextTime(new Date(d.x)))
            .y0(horizontalContextHeight)
            .y1((d, i, a) => this.yHorizontalContext(d.y));
    }

    private brushed = (): void => {
        let s = d3.event.selection;
        if (s) {
            d3.select(this.refGBrush).call(this.brush.move, null);

            d3.select(this.refGHorizontalBrush)
                .call(this.horizontalBrush)
                .transition(zoomTransition)
                .call(this.horizontalBrush.move);
            d3.select(this.refGVerticalBrush)
                .call(this.verticalBrush)
                .transition(zoomTransition)
                .call(this.verticalBrush.move);

            this.updateHorizontalContext([s[0][0], s[1][0]].map(this.baseChart.timeScaleChart.invert, this.baseChart.timeScaleChart), zoomTransition);
            this.updateVerticalContext([s[0][1], s[1][1]].map(this.baseChart.yChart.invert, this.baseChart.yChart), zoomTransition);
        }
    }

    private horizontalBrushed = (): void => {
        if ( d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom' ) {
            return; // ignore brush-by-zoom
        }
        // Time Axis
        let selectionTime = d3.event.selection || this.xHorizontalContextTime.range();
        this.baseChart.timeScaleChart.domain(selectionTime.map(this.xHorizontalContextTime.invert, this.xHorizontalContextTime));

        this.baseChart.updatePathes();
        this.baseChart.updateXAxis();
        // this.updateVerticalMarkers();
    }

    private horizontalBrushedDetail = (): void => {
        let s = d3.event.selection;
        if (s) {
            d3.select(this.refGHorizontalBrushDetail).call(this.horizontalBrushDetail.move, null);

            d3.select(this.refGHorizontalBrush)
                .call(this.horizontalBrush)
                .transition(zoomTransition)
                .call(this.horizontalBrush.move);
            this.updateHorizontalContext([s[0], s[1]].map(this.baseChart.timeScaleChart.invert, this.baseChart.timeScaleChart), zoomTransition);
        }
    }

    private verticalBrushed = (): void => {
        if ( d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom' ) {
            return; // ignore brush-by-zoom
        }
        let selection = d3.event.selection || this.yVerticalContext.range();
        this.baseChart.yChart.domain(selection.map(this.yVerticalContext.invert, this.yVerticalContext));
        this.baseChart.updatePathes();
        this.baseChart.updateYAxis();
        // this.updateHorizontalMarkers();
        // this.updateAnomalyMarkers();
    }

    private verticalBrushedDetail = (): void => {
        let s = d3.event.selection;
        if (s) {
            d3.select(this.refGVerticalBrushDetail).call(this.verticalBrushDetail.move, null);

            d3.select(this.refGVerticalBrush)
                .call(this.verticalBrush)
                .transition(zoomTransition)
                .call(this.verticalBrush.move);
            this.updateVerticalContext([s[0], s[1]].map(this.baseChart.yChart.invert, this.baseChart.yChart), zoomTransition);
        }
    }

    private displayCrosshair = (): void => {
        this.displayCrosshairX();
        this.displayCrosshairY();
    }

    // private getSerieValueFromDate = (serie: ISerieData, shotDate: Date): number => {
    //     let shotTime = shotDate.getTime();
    //     let index = serie.times.findIndex((time: number) => { return (time === shotTime); } );
    //     let value = serie.values[index];
    //     return value as number;
    // }

    private displayCrosshairX = (): void => {

        switch ( d3.event.type ) {
            case 'mouseover':
            case 'mousemove':
                let srcElement = d3.event.target || d3.event.srcElement;
                let xMouse: number = d3.mouse(srcElement)[0];
                this.crosshairState.position.x = xMouse;
                this.crosshairState.xTime = this.baseChart.timeScaleChart.invert(xMouse);

                this.crosshairState.mousePosition.x = xMouse;

                if ( this.crossHairTimer ) {
                    clearTimeout(this.crossHairTimer);
                    // Mask values near legends
                    this.mapCrosshairValues.clear();
                    this.updateTextLegends();
                }
                // this.crossHairTimer = setTimeout(
                //     () => {
                //         this.props.series.forEach( (serie, iSerie) => {
                //             partition.series.forEach( (serie, iSerie) => {
                //                 let realShotDate = this.getRealShotDate(serie, this.crosshairState.xTime as Date);
                //                 this.mapCrosshairValues.set(iGroupData + ' ' + serie.serie_name, this.getSerieValueFromDate(serie, realShotDate));

                //                 this.crosshairState.shotDef = this.getShotFromDate(realShotDate);

                //                 this.crosshairState.xTime = realShotDate;
                //                 this.crosshairState.position.x = this.baseChart.timeScaleChart(realShotDate);
                //             });
                //         });
                //         this.crosshairState.crossHairTimeFormat = this.baseChart.crossHairTimeFormat;
                //         this.updateTextLegends();
                //     },
                //     500
                // );
                this.crosshairState.xDisplayed = true;
                break;
            case 'mouseout':
            default:
                this.crosshairState.xDisplayed = false;
                this.mapCrosshairValues.clear();
                clearTimeout(this.crossHairTimer);
                this.updateTextLegends();
                break;
        }
    }

    private updateTextLegends = (): void => {

        this.baseChart.legendTexts.text( (d: ILegendItem) => {
            let value = this.mapCrosshairValues.get(d.toString());
            return this.baseChart.buildLegend(d.toString(), value);
        });
    }

    private displayCrosshairY = (): void => {
        switch ( d3.event.type ) {
            case 'mouseover':
            case 'mousemove':
                let srcElement = d3.event.target || d3.event.srcElement;
                let yMouse = d3.mouse(srcElement)[1];
                let y = this.baseChart.yChart.invert(yMouse);

                this.crosshairState.mousePosition.y = yMouse;

                this.crosshairState.position.y = yMouse;
                this.crosshairState.yValue = y;

                this.crosshairState.yDisplayed = true;
                break;
            case 'mouseout':
            default:
                this.crosshairState.yDisplayed = false;
                this.mapCrosshairValues.clear();
                break;
        }
    }

    private resetZoomX = () => {
        this.updateHorizontalContext(this.baseChart.timeScaleChartDomainDefault, zoomTransition);
    }

    private resetZoomY = () => {
        let domain = this.baseChart.yChartDomainDefault.slice();
        this.updateVerticalContext(domain, zoomTransition);
    }

    private resetZoom = () => {
        this.resetZoomX();
        this.resetZoomY();
    }

    private updateHorizontalContext = (domain: any, transition: any) => {
        let range = domain.map(this.xHorizontalContextTime, this.xHorizontalContextTime.invert);
        let brush = d3.select(this.refGHorizontalBrush).call(this.horizontalBrush);
        if ( transition != null ) {
            brush.transition(transition).call(this.horizontalBrush.move, range);
        }
        else {
            brush.call(this.horizontalBrush.move, range);
        }
    }

    private updateVerticalContext = (domain: any, transition: any) => {
        let range = domain.map(this.yVerticalContext, this.yVerticalContext.invert);
        let brush = d3.select(this.refGVerticalBrush).call(this.verticalBrush);
        if ( transition ) {
            brush.transition(transition).call(this.verticalBrush.move, range);
        }
        else {
            brush.call(this.verticalBrush.move, range);
        }
    }

    /**
     * Export the chart in png file.
     */
    // private saveChartAsPng = (event) => {
    //     saveSvgAsPng.saveSvgAsPng(
    //         document.getElementById('svgChart'),
    //         `${this.props.sheet.sheetName}.png`,
    //         {backgroundColor : 'white', encoderOptions: 1}
    //     );
    // }

    /**
     * Export series in CVS file.
     */
    // private saveChartAsCSV = (event) => {

    //     const domain: Domain = 'REALTIME'; // arbitrary. This should be let to user choice.

    //     let cvsData: string[] = [];

    //     let header = '';
    //     header = header.concat('shot');
    //     this.props.sheet.data.forEach((groupData) => {
    //         groupData.partitions[this.props.iPartition].series.forEach( serie => {
    //             header = header.concat(',' + serie.serie_name);
    //         });
    //     });
    //     header = header.concat('\n');
    //     cvsData.push(header);

    //     let shots = this.props.sheet.shots[domain];
    //     if ( shots !== undefined ) {
    //         shots.forEach( (shotDef, iShot) => {
    //             let row = String(shotDef.shot);
    //             this.props.sheet.data.forEach( groupData => {
    //                 if (groupData.serieDef.domain === domain) {
    //                     groupData.partitions[this.props.iPartition].series.forEach( serie => {
    //                         row = row.concat(',' + String(serie.values[iShot]));
    //                     });
    //                 }
    //             });
    //             row = row.concat('\n');
    //             cvsData.push(row);
    //         });
    //     }
    //     let blob = new Blob(cvsData, { type: 'text/cvs;charset=utf-8' });
    //     fileSaver.saveAs(blob, `${this.props.sheet.sheetName}.csv`);
    // }

    private updateContextPath(): void {
        d3.select(this.refGHorizontalContextPathes).selectAll('.contextArea')
            .attr('fill', 'blue');
    }

    // private handleAddHorizontalMarker = (): void => {
    //     ContextMenu.hide();
    //     this.props.handleSheetMarkersManager.addHorizontalMarker(this.newMarkerYValue);
    // }

    // private handleAddVerticalMarker = (): void => {
    //     ContextMenu.hide();
    //     if ( this.newVerticalMarkerDate ) {
    //         this.props.handleGlobalMarkersManager.addVerticalMarker(this.newVerticalMarkerDate);
    //     }
    // }

    // private handleRemoveAllMarkers = (): void => {
    //     ContextMenu.hide();
    //     this.markersShown = true;
    //     this.props.handleGlobalMarkersManager.removeAllVerticalMarkers();
    //     this.props.handleSheetMarkersManager.removeAllHorizontalMarkers();
    // }

    // private handleHideShowMarkers = (): void => {
    //     ContextMenu.hide();
    //     this.markersShown = !this.markersShown;
    //     this.updateHorizontalMarkers();
    //     this.updateVerticalMarkers();
    //     this.updateAnomalyMarkers();
    // }

    private drawChart = (callBrushes: boolean): void => {
        console.log('drawChart');
        if ( this.refGChart ) {
            this.baseChart.createChart(this.refGChart);
        }

        // Courbes résumé de contexte
        d3.select(this.refGHorizontalContextPathes).selectAll('.contextArea').remove();
        this.props.series.forEach( serie => {
                let datum: IHorizontalContextDatum[] = [];
                for ( let indexValue = 0 ; indexValue < serie.points.length ; indexValue++ ) {
                    datum.push({x: serie.points[indexValue].date, y: serie.points[indexValue].valeur});
                }
                d3.select(this.refGHorizontalContextPathes).append('path').datum(datum)
                    .attr('class', 'contextArea')
                    .attr('d', this.lineHorizontalContext);
        });

        d3.select(this.refGBrush)
            .on('dblclick.zoom', this.resetZoom)
            .on('mouseover', this.displayCrosshair)
            .on('mousemove', this.displayCrosshair)
            .on('mouseout', this.displayCrosshair)
            .on('contextmenu', () => {
                d3.event.preventDefault();

                // let srcElement = d3.event.target || d3.event.srcElement;
                // this.xLastClick = d3.mouse(srcElement)[0];
                // this.yLastClick = d3.mouse(srcElement)[1];

                this.showContextMenu(d3.event.clientX, d3.event.clientY);
            });

        d3.select(this.refGHorizontalBrushDetail)
            .on('dblclick.zoom', this.resetZoomX)
            .on('mouseover', this.displayCrosshairX)
            .on('mousemove', this.displayCrosshairX)
            .on('mouseout', this.displayCrosshairX);

        d3.select(this.refGVerticalBrushDetail)
            .on('dblclick.zoom', this.resetZoomY)
            .on('mouseover', this.displayCrosshairY)
            .on('mousemove', this.displayCrosshairY)
            .on('mouseout', this.displayCrosshairY);

        // Mouse events on legend checkboxes
        this.baseChart.legends
            .attr('pointer-events', 'visible')
            .on('mouseover', this.legendMouseHandle)
            .on('mouseout', this.legendMouseHandle)
            .on('click', this.legendMouseHandle);

        // this.baseChart.legendTexts
        //     .attr('pointer-events', 'visible')
        //     .on('mouseover', this.legendMouseHandle)
        //     .on('mouseout', this.legendMouseHandle)
        //     .on('click', this.legendMouseHandle);

        this.baseChart.displayedPathes.forEach((displayedPath: IDisplayedPath) => {
            
            // TODO : CREATE SERIE NAME let serieName = displayedPath.serieData.serie_name;
            displayedPath.path.attr('pointer-events', 'stroke')
                .on('mouseover', (d: any, i: any, g: any) => { this.pathMouseOver(d, i, g, displayedPath); })
                .on('mousemove', (d: any, i: any, g: any) => { this.pathMouseOver(d, i, g, displayedPath); })
                .on('mouseout', (d: any, i: any, g: any) => { this.pathMouseOver(d, i, g, displayedPath); })
                .on('mousedown', () => { this.dispatchEventToGeneralBrush('mousedown'); })
                .on('click', () => { this.dispatchEventToGeneralBrush('click'); })
                .on('dblclick', () => { this.dispatchEventToGeneralBrush('dblclick'); });
        });

        if ( callBrushes ) {

            d3.select(this.refGBrush)
                .call(this.baseChart.customBrush, this.brush);

            d3.select(this.refGHorizontalBrush)
                .call(this.horizontalBrush)
                .call(this.horizontalBrush.move, this.baseChart.timeScaleChart.range());

            d3.select(this.refGHorizontalBrushDetail)
                .call(this.horizontalBrushDetail);

            d3.select(this.refGVerticalBrush)
                .call(this.verticalBrush)
                .call(this.verticalBrush.move, this.baseChart.yChart.range());

            d3.select(this.refGVerticalBrushDetail)
                .call(this.verticalBrushDetail);
        }

        // Help
        // var helpTansformDefault = 'scale('+helpButtonDefaultScale+')';

        // d3.select(this.refHelpButton)
        //     .attr('pointer-events', 'bounding-box')
        //     .style('cursor', 'help')
        //     .attr('transform', helpTansformDefault)
        //     .on('mouseover', function() {
        //         var bbox = this.getBBox();
        //         d3.select(this)
        //             .transition()
        //             .ease(d3.easeElastic)
        //             .duration(500)
        //             .attr('transform',
        //                 'scale('+mouseoverRescale*helpButtonDefaultScale+') ' +
        //                 'translate('+ (bbox.x-bbox.width*(mouseoverRescale-1))/2+','+(bbox.y-bbox.height*(mouseoverRescale-1))/2+')')
        //     })
        //     .on('mouseout', function() {
        //         d3.select(this)
        //             .transition()
        //             .ease(d3.easeElastic)
        //             .duration(500)
        //             .attr('transform', helpTansformDefault)
        //     })
        //     .on('click', () => {this.showTooltip()})
    }

    private dispatchEventToGeneralBrush = (event: string): void => {
        // voir cette adresse pour pouvoir cliquer sur les path pour lancer le brush
        // https://bl.ocks.org/mthh/99dc420cd7e276ecafe4ef4bf12c6927
        const brushOverlayElement: Element = d3.select('#generalBrush > .overlay').node() as Element;
        const brushSelectionElement: Element = d3.select('#generalBrush > .selection').node() as Element;

        if ( brushSelectionElement ) {
            const newClickEvent = new MouseEvent(event, {
                clientX: d3.event.clientX,
                clientY: d3.event.clientY,
                bubbles: true,
                cancelable: true,
                view: window
            });
            if ( brushOverlayElement ) {
                brushOverlayElement.dispatchEvent(newClickEvent);
            }
        }
    }

    private legendMouseHandle = (legendItem: ILegendItem): void => {
        switch ( d3.event.type ) {
            case 'mouseover':
                this.baseChart.displayedPathes
                    .filter( displayedPath => displayedPath.legendItem === legendItem )
                    .map( displayedPath => displayedPath.path.attr('stroke-width', 2) );
                break;
            case 'mouseout':
                this.baseChart.displayedPathes
                    .filter( displayedPath => displayedPath.legendItem === legendItem )
                    .map( displayedPath => displayedPath.path.attr('stroke-width', 1.2) );
                break;
            case 'click':
                legendItem.isShown = !legendItem.isShown;
                this.baseChart.legendCheckBoxes.attr('fill', this.baseChart.legendCheckBoxFill);
                this.baseChart.displayedPathes
                    .filter( displayedPath => displayedPath.legendItem === legendItem )
                    .map( displayedPath => displayedPath.path.style('opacity', legendItem.isShown ? 1 : 0) );
                break;
            default:
                break;
        }
    }

    private pathMouseOver = (data: any, index: any, group: any, displayedPath: IDisplayedPath): void => {
        let path: any = d3.select(d3.event.srcElement);
        
        switch ( d3.event.type ) {
            case 'mouseover':
            case 'mousemove':
                path.attr('stroke-width', 2);
                this.legendStrokeHighlight(displayedPath);
                this.crosshairState.textDisplayed = 'serie name TODO'; // TODO : CREATE SERIE NAME displayedPath.serieData.serie_name;
                this.displayCrosshair();
                break;
            case 'mouseout':
                path.attr('stroke-width', 1.2);
                this.legendStrokeHighlight();
                this.crosshairState.textDisplayed = null;
                this.displayCrosshair();
                break;
            default:
                break;
        }
    }

    private legendStrokeHighlight = (displayedPath?: IDisplayedPath): void => {
        this.baseChart.legendCheckBoxes.attr('stroke-width', (d: ILegendItem, i: number) => {return displayedPath && displayedPath.legendItem === d ? '2' : '1'; });
        this.baseChart.legendTexts.attr('font-weight', (d: ILegendItem, i: number) => {return displayedPath && displayedPath.legendItem === d ? 'bold' : 'normal'; });
    }

    private updateXContextAxis = (): void => {
        d3.select(this.refGHorizontalContextAxisX).call(this.baseChart.customAxis, this.xAxisContext);
    }

    private updateYContextAxis = (): void => {
        d3.select(this.refGVerticalContextAxisY).call(this.baseChart.customAxis, this.yAxisContext);
    }

    // updateHelpIcon = () => {
    //     d3.select(this.refHelpButton).attr('fill', getLookAndFeelValue('help', 'iconFill', this.props.lookAndFeelStore.getMode()));
    // }

    private updateComponents(): void {
        this.updateXContextAxis();
        this.updateYContextAxis();
        // this.updateHelpIcon();
        this.updateContextPath();
        this.updateBrush();
        this.updateHorizontalBrush();
        this.updateHorizontalBrushDetail();
        this.updateVerticalBrush();
        this.updateVerticalBrushDetail();
        // this.updateVerticalMarkers();
        // this.updateHorizontalMarkers();
        // this.updateAnomalyMarkers();
    }

    private updateBrush = (): void => {
        d3.select(this.refGBrush).call(this.baseChart.customBrush, this.brush);
    }

    private updateHorizontalBrush = (): void => {
        d3.select(this.refGHorizontalBrush).call(this.baseChart.customBrush, this.horizontalBrush);
    }

    private updateHorizontalBrushDetail = (): void => {
        d3.select(this.refGHorizontalBrushDetail).call(this.baseChart.customBrush, this.horizontalBrushDetail);
    }

    private updateVerticalBrush = (): void => {
        d3.select(this.refGVerticalBrush).call(this.baseChart.customBrush, this.verticalBrush);
    }

    private updateVerticalBrushDetail = (): void => {
        d3.select(this.refGVerticalBrushDetail).call(this.baseChart.customBrush, this.verticalBrushDetail);
    }

    // private updateHorizontalMarkers = (): void => {

    //     // Markers on main chart
    //     d3.select(this.refGHorizontalMarkers).selectAll('line').remove();

    //     d3.select(this.refGHorizontalMarkers).selectAll('line')
    //         .data(this.props.horizontalMarkers).enter()
    //         .append('line')
    //         .attr('x1', 0)
    //         .attr('x2', this.chartWidth)
    //         .attr('y1', (y) => this.baseChart.yChart(y))
    //         .attr('y2', (y) => this.baseChart.yChart(y))
    //         .attr('opacity', this.markersShown ? 0.7 : 0)
    //         .attr('stroke', (d) => this.markersColorScale(d.toString()))
    //         .attr('stroke-width', 1)
    //         .attr('shape-rendering', 'crispEdges');

    //     // Markers on verticalContext
    //     d3.select(this.refGVerticalContextMarkers).selectAll('line').remove();

    //     d3.select(this.refGVerticalContextMarkers).selectAll('line')
    //         .data(this.props.horizontalMarkers).enter()
    //         .append('line')
    //         .attr('x1', 0)
    //         .attr('x2', verticalContextWidth)
    //         .attr('y1', (y) => this.yVerticalContext(y))
    //         .attr('y2', (y) => this.yVerticalContext(y))
    //         .attr('opacity', this.markersShown ? 1 : 0)
    //         .attr('stroke', (d) => this.markersColorScale(d.toString()))
    //         .attr('stroke-width', 1)
    //         .attr('shape-rendering', 'crispEdges');
    // }

    // private updateVerticalMarkers = (): void => {

    //     // Markers on main chart
    //     d3.select(this.refGVerticalMarkers).selectAll('line').remove();

    //     d3.select(this.refGVerticalMarkers).selectAll('line')
    //         .data(this.props.verticalMarkers).enter()
    //         .append('line')
    //         .attr('x1', (time) => this.baseChart.timeScaleChart(new Date(time)))
    //         .attr('x2', (time) => this.baseChart.timeScaleChart(new Date(time)))
    //         .attr('y1', 0)
    //         .attr('y2', this.chartHeight)
    //         .attr('opacity', this.markersShown ? 0.7 : 0)
    //         .attr('stroke', (d) => this.markersColorScale(d.toString()))
    //         .attr('stroke-width', 1)
    //         .attr('shape-rendering', 'crispEdges');

    //     // Markers on horizontalcontext
    //     d3.select(this.refGHorizontalContextMarkers).selectAll('line').remove();

    //     d3.select(this.refGHorizontalContextMarkers).selectAll('line')
    //         .data(this.props.verticalMarkers).enter()
    //         .append('line')
    //         .attr('x1', (time) => this.xHorizontalContextTime(new Date(time)))
    //         .attr('x2', (time) => this.xHorizontalContextTime(new Date(time)))
    //         .attr('y1', 0)
    //         .attr('y2', horizontalContextHeight)
    //         .attr('opacity', this.markersShown ? 1 : 0)
    //         .attr('stroke', (d) => this.markersColorScale(d.toString()))
    //         .attr('stroke-width', 1)
    //         .attr('shape-rendering', 'crispEdges');
    // }

    // private updateAnomalyMarkers = (): void => {
    //     if ( !this.props.sheet.sheetDef.isAnomalyMarkersShown ||
    //         this.props.sheet.sheetDef.maxAnomalyMarker === undefined ||
    //         this.props.sheet.sheetDef.minAnomalyMarker === undefined ) { return; }

    //     let yAnomalyMax: number = this.baseChart.yChart(this.props.sheet.sheetDef.maxAnomalyMarker);
    //     let yAnomalyMin: number = this.baseChart.yChart(this.props.sheet.sheetDef.minAnomalyMarker);

    //     let yContextAnomalyMax = this.yVerticalContext(this.props.sheet.sheetDef.maxAnomalyMarker);
    //     let yContextAnomalyMin = this.yVerticalContext(this.props.sheet.sheetDef.minAnomalyMarker);

    //     // let yChartMax = this.props.section.isYAxisInverted?this.baseChart.getYRangeStart():this.baseChart.getYRangeEnd();
    //     // let yChartMin = this.props.section.isYAxisInverted?this.baseChart.getYRangeEnd():this.baseChart.getYRangeStart();
    //     let yChartTop = Math.min(this.baseChart.getYRangeStart(), this.baseChart.getYRangeEnd());
    //     let yChartBottom = Math.max(this.baseChart.getYRangeStart(), this.baseChart.getYRangeEnd());

    //     // Markers on main chart
    //     let gAnomalyMarkers = d3.select(this.refGAnomalyMarkers);
    //     gAnomalyMarkers.selectAll('rect').remove();
    //     gAnomalyMarkers.selectAll('line').remove();
    //     // Markers on vertical context
    //     let gverticalContextAnomalyMarkers = d3.select(this.refGVerticalContextAnomalyMarkers);
    //     gverticalContextAnomalyMarkers.selectAll('rect').remove();
    //     gverticalContextAnomalyMarkers.selectAll('line').remove();

    //     let yTopRectAnomalyMin: number = this.props.sheet.sheetDef.isYAxisInverted ? yAnomalyMax : yChartTop;
    //     let heightRectAnomalyMin: number = this.props.sheet.sheetDef.isYAxisInverted ? (yChartBottom - yAnomalyMax) : (yAnomalyMax - yChartTop);

    //     // Anomaly Max main chart
    //     if ( ( yAnomalyMax >= 0 && !this.props.sheet.sheetDef.isYAxisInverted )
    //         || ( yAnomalyMax <= yChartBottom && this.props.sheet.sheetDef.isYAxisInverted ) ) {

    //         gAnomalyMarkers.append('rect')
    //             .attr('x', 0)
    //             .attr('width', this.chartWidth)
    //             .attr('y', yTopRectAnomalyMin)
    //             .attr('height', heightRectAnomalyMin)
    //             .attr('opacity', this.props.sheet.sheetDef.isAnomalyMarkersShown ? 0.1 : 0)
    //             .attr('fill', 'red')
    //             .attr('shape-rendering', 'crispEdges');

    //         gAnomalyMarkers.append('line')
    //             .attr('x1', 0)
    //             .attr('x2', this.chartWidth)
    //             .attr('y1', yAnomalyMax)
    //             .attr('y2', yAnomalyMax)
    //             .attr('opacity', this.props.sheet.sheetDef.isAnomalyMarkersShown ? 0.5 : 0)
    //             .attr('stroke', 'red')
    //             .attr('stroke-width', 1)
    //             .attr('stroke-dasharray', '2,2')
    //             .attr('shape-rendering', 'crispEdges');
    //     }

    //     // Anomaly Max vertical context
    //     if ( ( yContextAnomalyMax >= 0 && !this.props.sheet.sheetDef.isYAxisInverted )
    //         || ( yContextAnomalyMax <= this.chartHeight && this.props.sheet.sheetDef.isYAxisInverted ) ) {

    //         gverticalContextAnomalyMarkers.append('line')
    //             .attr('x1', 0)
    //             .attr('x2', verticalContextWidth)
    //             .attr('y1', yContextAnomalyMax)
    //             .attr('y2', yContextAnomalyMax)
    //             .attr('opacity', this.props.sheet.sheetDef.isAnomalyMarkersShown ? 0.5 : 0)
    //             .attr('stroke', 'red')
    //             .attr('stroke-width', 1)
    //             .attr('stroke-dasharray', '2,1')
    //             .attr('shape-rendering', 'crispEdges');

    //         let anomalyMaxRectHeight = this.props.sheet.sheetDef.isYAxisInverted ? this.chartHeight - yContextAnomalyMax : yContextAnomalyMax;
    //         gverticalContextAnomalyMarkers.append('rect')
    //             .attr('x', 0)
    //             .attr('width', verticalContextWidth)
    //             .attr('y', this.props.sheet.sheetDef.isYAxisInverted ? yContextAnomalyMax : 0)
    //             .attr('height', anomalyMaxRectHeight > 0 ? anomalyMaxRectHeight : 0)
    //             .attr('opacity', this.props.sheet.sheetDef.isAnomalyMarkersShown ? 0.2 : 0)
    //             .attr('fill', 'red')
    //             .attr('shape-rendering', 'crispEdges');
    //     }

    //     // Anomaly Min main chart
    //     if ( ( yAnomalyMin >= 0 && this.props.sheet.sheetDef.isYAxisInverted )
    //     || ( yAnomalyMin <= this.chartHeight && !this.props.sheet.sheetDef.isYAxisInverted ) ) {

    //         gAnomalyMarkers.append('rect')
    //             .attr('x', 0)
    //             .attr('width', this.chartWidth)
    //             .attr('y', this.props.sheet.sheetDef.isYAxisInverted ? yChartTop : yAnomalyMin)
    //             .attr('height', this.props.sheet.sheetDef.isYAxisInverted ? (yAnomalyMin - yChartTop) : (yChartBottom - yAnomalyMin))
    //             .attr('opacity', this.props.sheet.sheetDef.isAnomalyMarkersShown ? 0.1 : 0)
    //             .attr('fill', 'red')
    //             .attr('shape-rendering', 'crispEdges');

    //         gAnomalyMarkers.append('line')
    //             .attr('x1', 0)
    //             .attr('x2', this.chartWidth)
    //             .attr('y1', yAnomalyMin)
    //             .attr('y2', yAnomalyMin)
    //             .attr('opacity', this.props.sheet.sheetDef.isAnomalyMarkersShown ? 0.5 : 0)
    //             .attr('stroke', 'red')
    //             .attr('stroke-width', 1)
    //             .attr('stroke-dasharray', '2,2')
    //             .attr('shape-rendering', 'crispEdges');
    //     }

    //     // Anomaly Min vertical context
    //     if ( ( yContextAnomalyMin >= 0 && this.props.sheet.sheetDef.isYAxisInverted )
    //     || ( yContextAnomalyMin <= yChartBottom && !this.props.sheet.sheetDef.isYAxisInverted ) ) {

    //         gverticalContextAnomalyMarkers.append('line')
    //             .attr('x1', 0)
    //             .attr('x2', verticalContextWidth)
    //             .attr('y1', yContextAnomalyMin)
    //             .attr('y2', yContextAnomalyMin)
    //             .attr('opacity', this.props.sheet.sheetDef.isAnomalyMarkersShown ? 0.5 : 0)
    //             .attr('stroke', 'red')
    //             .attr('stroke-width', 1)
    //             .attr('stroke-dasharray', '2,1')
    //             .attr('shape-rendering', 'crispEdges');

    //         let anomalyMinRectHeight = this.props.sheet.sheetDef.isYAxisInverted ? yContextAnomalyMin : this.chartHeight - yContextAnomalyMin;
    //         gverticalContextAnomalyMarkers.append('rect')
    //             .attr('x', 0)
    //             .attr('width', verticalContextWidth)
    //             .attr('y', this.props.sheet.sheetDef.isYAxisInverted ? 0 : yContextAnomalyMin)
    //             .attr('height', anomalyMinRectHeight > 0 ? anomalyMinRectHeight : 0)
    //             .attr('opacity', this.props.sheet.sheetDef.isAnomalyMarkersShown ? 0.2 : 0)
    //             .attr('fill', 'red')
    //             .attr('shape-rendering', 'crispEdges');
    //     }
    // }

    // private toggleMarkersVisible = (): void => {
    //     this.markersShown = !this.markersShown;
    //     this.updateHorizontalMarkers();
    //     this.updateVerticalMarkers();
    //     this.updateAnomalyMarkers();
    // }
}
