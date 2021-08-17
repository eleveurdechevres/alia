import * as React from 'react';
import { dateToSql, dateWithoutSeconds } from '../../../utils/DateUtils';
import * as d3 from 'd3';
import { get_x_from_η_φ, get_η, get_η_from_ηh_φ, get_η_from_φ_x } from '../../../utils/CalculsThermiques';
import { IDateInterval } from 'src/pages/Graph/GraphBoard';
import { ICrossValue } from 'src/interfaces/ICrossValue';
import { ScaleLinear } from 'd3';
import { observer } from 'mobx-react';
import { SvgCheckBox } from 'src/pages/Graph/SvgComponents/SvgCheckBox';
import { observable } from 'mobx';
import { Colors } from '@blueprintjs/core';

interface IProps {
    missionId: number;
    chartWidth: number;
    chartHeight: number;
    dateInterval: IDateInterval;
    capteurId: number;
    channelX: number; 
    // channelX: IChannel; 
    channelY: number; 
    // channelY: IChannel;
    channelXType: GraphType;
    channelYType: GraphType;
    currentHumidity: number;
    currentTemperature: number;
    showLegend: boolean;
}

interface Iηx {
    η: number;
    x: number;
}

interface Ixy {
    x: number;
    y: number;
    date: Date;
}

export enum EnumAlarm {
    confort = 'Confort',
    qualiteAir = 'Qualité de l\'air'
}

const HORIZONTAL_LEGEND_HEIGHT = 15;
const VERTICAL_LEGEND_WIDTH = 15;

@observer export class Mollier extends React.Component<IProps, {}> {

    mapValues: Map<Date, {x: number, y: number}> = new Map();
    chartRef: SVGGElement;
    referenceChartsHumidityRef: SVGGElement;
    referenceChartsEnthalpieRef: SVGGElement;
    referenceChartsTemperatureEnthalpieRef: SVGGElement;
    xAxisRef: SVGElement;
    yAxisRef: SVGElement;
    currentCrosshairRef: SVGGElement;
    enveloppesConfortRef: SVGGElement;
    enveloppesQualiteAirRef: SVGGElement;
    A0EnveloppeRef: SVGGElement;
    A1EnveloppeRef: SVGGElement;
    A2EnveloppeRef: SVGGElement;
    A3EnveloppeRef: SVGGElement;
    A4EnveloppeRef: SVGGElement;
    Z1BacteriesMicrochampignons: SVGGElement;
    Z2BacteriesMicrochampignons: SVGGElement;
    Z3SecheresseAcariens: SVGGElement;
    legendsRef: SVGGElement;
    checkBoxes: SVGGElement;

    startDate: string = undefined;
    stopDate: string = undefined;

    scaleX: ScaleLinear<number, number>;
    scaleY: ScaleLinear<number, number>;

    datum: Ixy[] = [];

    @observable alarmSelected: EnumAlarm = EnumAlarm.confort;

    @observable private chartWidth: number;
    @observable private chartHeight: number;

    constructor(props: IProps) {
        super(props);
        // configure ScaleX
        this.updateXScale();

        // configure ScaleY
        this.scaleY = d3.scaleLinear();
        this.scaleY.domain([25, 0]);
        this.scaleY.range([0, this.props.chartHeight]);

        this.componentWillReceiveProps(this.props);
    }

    private updateXScale = () => {
        this.chartWidth = this.props.showLegend ? this.props.chartWidth - VERTICAL_LEGEND_WIDTH : this.props.chartWidth;
        this.chartHeight = this.props.showLegend ? this.props.chartHeight - HORIZONTAL_LEGEND_HEIGHT : this.props.chartHeight;

        this.scaleX = d3.scaleLinear();
//        this.scaleX.domain(this.channelXType.domain.slice().reverse());
        this.scaleX.domain([0, 50]);
        this.scaleX.range([0, this.chartWidth])
    }

    componentWillReceiveProps(props: IProps) {

        const startDate = dateToSql(props.dateInterval.missionStartDate);
        const stopDate = dateToSql(props.dateInterval.missionStopDate);

        if ( startDate !== this.startDate || stopDate !== this.stopDate) {
            this.startDate = startDate;
            this.stopDate = stopDate;
            this.loadJsonFromAeroc(props.missionId, startDate, stopDate, props.channelX, props.channelY);
        }
        if ( props.channelX !== this.props.channelX || props.channelY !== this.props.channelY ) {
            this.loadJsonFromAeroc(props.missionId, startDate, stopDate, props.channelX, props.channelY);
        }

        if ( props.dateInterval.minDate !== this.props.dateInterval.minDate ||
            props.dateInterval.maxDate !== this.props.dateInterval.maxDate
        ) {
            d3.select(this.chartRef).selectAll('.classDots')
                .attr('opacity', (d: Ixy) => this.isDateBetweenInterval(d.date, props.dateInterval.minDate, props.dateInterval.maxDate) ? 1 : 0);
        }
    }

    // loadJsonFromAeroc = (dateBegin: string, dateEnd: string, channel1: IChannel, channel2: IChannel) => {
    loadJsonFromAeroc = (missionId: number, dateBegin: string, dateEnd: string, channel1: number, channel2: number) => {
        // LOAD DATA from AEROC
        if (channel1 !== undefined && channel2 !== undefined) {
            
            // date_begin=2017/12/09 20:13:04&date_end=2018/01/24 21:19:06
            var httpReq = 'https://api.alia-france.com/alia_searchCrossMesures.php?' 
                + 'mission_id=' + missionId
                + '&date_begin=' + dateBegin 
                + '&date_end=' + dateEnd 
                + '&capteur_id=' + this.props.capteurId 
                + '&channel1_id=' + channel1 
                + '&channel2_id=' + channel2;
            // console.log(httpReq);
            return fetch(httpReq)
                .then((response) => response.json())
                .then((data: ICrossValue[]) => {

                    data.forEach((line: ICrossValue) => {
                        var date = dateWithoutSeconds(line.date);
                        this.mapValues.set(date, {x: line.channel1, y: line.channel2});
                        this.datum.push( {x: line.channel1, y: line.channel2, date: date} )
                    })
            
                    // var maxChannel1 = d3.max(this.datum, (d)=>{return d.x})
                    // var minChannel1 = d3.min(this.datum, (d)=>{return d.x})
                    // var maxChannel2 = d3.max(this.datum, (d)=>{return d.y})
                    // var minChannel2 = d3.min(this.datum, (d)=>{return d.y})

                    // this.scaleX.domain([minChannel1,maxChannel1]);
                    // this.scaleY.domain([minChannel2,maxChannel2]);

                    this.drawGraph();
                    this.drawXAxis();
                    if (this.props.showLegend) {
                        this.drawYAxis();
                    }
                });
        }
        return undefined;
    }

    lineFunction_η_φ = d3.line<ICrossValue>()
        .x((d) => { return this.scaleX(d.channel1) })
        .y((d) => { return this.scaleY(get_x_from_η_φ(d.channel1, d.channel2))})
    .curve(d3.curveLinear);
        // d3.curveLinear
        // d3.curveStep
        // d3.curveStepBefore
        // d3.curveStepAfter
        // d3.curveBasis
        // d3.curveCardinal
        // d3.curveMonotoneX
        // d3.curveCatmullRom

    drawReferenceCourbesHumidite = () => {
        for ( var humidite = 0 ; humidite <= 100 ; humidite += 10) {
            var dataCourbeHumidite: ICrossValue[] = [];
            for ( var temperature = 0 ; temperature <= 60 ; temperature ++ ) {
                dataCourbeHumidite.push({date: undefined, channel1: temperature, channel2: humidite});
            }
            var currentCourbe = d3.select(this.referenceChartsHumidityRef).append('g')
            currentCourbe.datum(dataCourbeHumidite)
                .append('path')
                .attr('d', this.lineFunction_η_φ)
                .attr('fill', 'none')
                .attr('stroke', 'gray')
                .attr('stroke-width', 1);
        }
        this.drawTextAt ('10%', 40, 10, -15);
        this.drawTextAt ('20%', 40, 20, -40);
        this.drawTextAt ('30%', 40, 30, -50);
        this.drawTextAt ('40%', 38, 40, -55);
        this.drawTextAt ('50%', 35.2, 50, -60);
        this.drawTextAt ('60%', 32.9, 60, -61);
        this.drawTextAt ('70%', 30.8, 70, -62);
        this.drawTextAt ('80%', 29, 80, -63);
        this.drawTextAt ('90%', 27.5, 90, -63);
        this.drawTextAt ('100%', 26, 100, -64);
    }

    drawTextAt = (text: string, η: number, φ: number, rotation: number) => {
        var gRef = d3.select(this.legendsRef);
        gRef.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .attr('font-size', 10)
            .attr('font-weight', 'bold')
            .attr('fill', 'blue')
            .text(text)
            .attr('alignment-baseline', 'text-before-edge')
            .attr('dominant-baseline', 'text-before-edge')
            .attr('text-anchor', 'begin')
            .attr('transform', 'translate(' + (this.scaleX(η)) + ', ' + (this.scaleY(get_x_from_η_φ(η, φ))) + ') rotate(' + rotation + ')');
    }

    drawReferenceCourbesEnthalpie = () => {
        var x2 = 0;
        for ( var h = 0 ; h <= 60 ; h += 2 ) {
            var η1 = h;
            var η2 = get_η(h, x2);
            var x1 = get_x_from_η_φ(η1, 100);

            var currentCourbe = d3.select(this.referenceChartsEnthalpieRef).append('g')
            currentCourbe.append('line')
                .attr('x1', this.scaleX(η1))
                .attr('y1', this.scaleY(x1))
                .attr('x2', this.scaleX(η2))
                .attr('y2', this.scaleY(x2))
                .attr('stroke', 'gray')
                .attr('strokeWidth', 1);
        }
    }

    drawReferenceCourbesTemperatureEnthalpie = () => {
        const x2 = 0;
        for ( let ηh = 0 ; ηh <= 60 ; ηh += 2 ) {
            const η1 = ηh;
            const x1 = get_x_from_η_φ(η1, 100);
            const η2 = get_η_from_ηh_φ(ηh, 0);

            const currentCourbe = d3.select(this.referenceChartsTemperatureEnthalpieRef).append('g')
            currentCourbe.append('line')
                .attr('x1', this.scaleX(η1))
                .attr('y1', this.scaleY(x1))
                .attr('x2', this.scaleX(η2))
                .attr('y2', this.scaleY(x2))
                .attr('stroke', 'gray')
                .attr('strokeWidth', 1);
            if (this.props.showLegend) {
                currentCourbe.append('text')
                    .attr('x', this.scaleX(η1) - 10)
                    .attr('y', this.scaleY(x1) - 5)
                    .attr('font-size', 10)
                    .attr('fill', 'black')
                    .text(η1 + '°C');
            }
        }
    }

    lineFunction_η_x = d3.line<Iηx>()
    .x((d) => { return this.scaleX(d.η)})
    .y((d) => { return this.scaleY(d.x)})
    .curve(d3.curveLinear);

    drawA0Enveloppe = () => {
        var dataA0 = [
            {η: 18, x: 6.2},
            {η: 27, x: 6.2},
            {η: 27, x: 10.25},
            {η: get_η_from_φ_x(60, 10.25), x: 10.25}, // φ=60%, x=10.25
            {η: 22, x: get_x_from_η_φ(22, 60)},  // η=20, φ=60%
            {η: 20, x: get_x_from_η_φ(20, 60)},  // η=20, φ=60%
            {η: 18, x: get_x_from_η_φ(18, 60)},  // η=20, φ=60%
            {η: 18, x: 6.2},
        ];
        this.drawEnveloppe( this.A0EnveloppeRef, dataA0, Colors.GREEN3, Colors.GREEN5);
        d3.select(this.A0EnveloppeRef).append('text')
            .attr('x', this.scaleX(24))
            .attr('y', this.scaleY(10.5))
            .attr('font-weight', 'bold')
            .attr('font-size', '10')
            .attr('fill', Colors.GREEN3)
            .text('A0');
    }

    drawA1Enveloppe = () => {
        var dataA1 = [
            {η: 15,   x: get_x_from_η_φ(15, 20)},
            {η: 17.5, x: get_x_from_η_φ(17.5, 20)},
            {η: 20,   x: get_x_from_η_φ(20, 20)},
            {η: 22.5, x: get_x_from_η_φ(22.5, 20)},
            {η: 25,   x: get_x_from_η_φ(25, 20)},
            {η: 27.5, x: get_x_from_η_φ(27.5, 20)},
            {η: 30,   x: get_x_from_η_φ(30, 20)},
            {η: 32,   x: get_x_from_η_φ(32, 20)},
            {η: 32,   x: 12},
            {η: get_η_from_φ_x(80, 12), x: 12},
            {η: 19,   x: get_x_from_η_φ(19, 80)},
            {η: 17,   x: get_x_from_η_φ(17, 80)},
            {η: 15,   x: get_x_from_η_φ(15, 80)},
            {η: 15,   x: get_x_from_η_φ(15, 20)},
        ];
        this.drawEnveloppe( this.A1EnveloppeRef, dataA1, Colors.ORANGE3, Colors.ORANGE5);
        d3.select(this.A1EnveloppeRef).append('text')
            .attr('x', this.scaleX(27))
            .attr('y', this.scaleY(12.5))
            .attr('font-weight', 'bold')
            .attr('font-size', '10')
            .attr('fill', Colors.ORANGE3)
            .text('A1');
    }

    drawA2Enveloppe = () => {
        var dataA2 = [
            {η: 10,   x: get_x_from_η_φ(10, 20)},
            {η: 12.5, x: get_x_from_η_φ(12.5, 20)},
            {η: 15,   x: get_x_from_η_φ(15, 20)},
            {η: 17.5, x: get_x_from_η_φ(17.5, 20)},
            {η: 20,   x: get_x_from_η_φ(20, 20)},
            {η: 22.5, x: get_x_from_η_φ(22.5, 20)},
            {η: 25,   x: get_x_from_η_φ(25, 20)},
            {η: 27.5, x: get_x_from_η_φ(27.5, 20)},
            {η: 30,   x: get_x_from_η_φ(30, 20)},
            {η: 32,   x: get_x_from_η_φ(32, 20)},
            {η: 35,   x: get_x_from_η_φ(35, 20)},
            {η: 35,   x: 15.5},
            {η: get_η_from_φ_x(80, 15.5), x: 15.5},
            {η: 22,   x: get_x_from_η_φ(22, 80)},
            {η: 19,   x: get_x_from_η_φ(19, 80)},
            {η: 17,   x: get_x_from_η_φ(17, 80)},
            {η: 15,   x: get_x_from_η_φ(15, 80)},
            {η: 12.5, x: get_x_from_η_φ(12.5, 80)},
            {η: 10,   x: get_x_from_η_φ(10, 80)},
            {η: 10,   x: get_x_from_η_φ(10, 20)},
        ];
        this.drawEnveloppe( this.A2EnveloppeRef, dataA2, Colors.RED3, Colors.RED5);
        d3.select(this.A2EnveloppeRef).append('text')
            .attr('x', this.scaleX(31))
            .attr('y', this.scaleY(16))
            .attr('font-weight', 'bold')
            .attr('font-size', 10)
            .attr('fill', Colors.RED3)
            .text('A2');
    }

    drawZ1Enveloppe = () => {
        var dataZ1 = [
            {η: 15,   x: get_x_from_η_φ(15, 40)},
            {η: 17.5, x: get_x_from_η_φ(17.5, 40)},
            {η: 20,   x: get_x_from_η_φ(20, 40)},
            {η: 22.5, x: get_x_from_η_φ(22.5, 40)},
            {η: 25,   x: get_x_from_η_φ(25, 40)},
            {η: 28,   x: get_x_from_η_φ(28, 40)},
            {η: 28,   x: 0},
            {η: 15,   x: 0},
            {η: 15,   x: get_x_from_η_φ(15, 40)},
        ];
        this.drawEnveloppe( this.Z1BacteriesMicrochampignons, dataZ1, Colors.BLUE3, Colors.BLUE5);
        d3.select(this.Z1BacteriesMicrochampignons).append('text')
            .attr('x', this.scaleX(29))
            .attr('y', this.scaleY(8))
            .attr('font-size', 10)
            .attr('font-weight', 'bold')
            .attr('fill', Colors.BLUE3)
            .text('Z1');
    }

    drawZ2Enveloppe = () => {
        var dataZ2 = [
            {η: 15,   x: get_x_from_η_φ(15, 100)},
            {η: 17.5, x: get_x_from_η_φ(17.5, 100)},
            {η: 20,   x: get_x_from_η_φ(20, 100)},
            {η: 23,   x: get_x_from_η_φ(23, 100)},
            {η: 23,   x: get_x_from_η_φ(23, 70)},
            {η: 20,   x: get_x_from_η_φ(20, 70)},
            {η: 17.5, x: get_x_from_η_φ(17.5, 70)},
            {η: 15,   x: get_x_from_η_φ(15, 70)},
            {η: 15,   x: get_x_from_η_φ(15, 100)},
        ];
        this.drawEnveloppe( this.Z2BacteriesMicrochampignons, dataZ2, Colors.ORANGE3, Colors.ORANGE5);
        d3.select(this.Z2BacteriesMicrochampignons).append('text')
            .attr('x', this.scaleX(12))
            .attr('y', this.scaleY(8))
            .attr('font-size', 10)
            .attr('font-weight', 'bold')
            .attr('fill', Colors.ORANGE3)
            .text('Z2');
    }

    drawZ3Enveloppe = () => {
        var dataZ2 = [
            {η: 23, x: get_x_from_η_φ(23, 100)},
            {η: 25, x: get_x_from_η_φ(25, 100)},
            {η: 27, x: get_x_from_η_φ(27, 100)},
            {η: 27, x: get_x_from_η_φ(27, 70)},
            {η: 25, x: get_x_from_η_φ(25, 70)},
            {η: 23, x: get_x_from_η_φ(23, 70)},
            {η: 23, x: get_x_from_η_φ(23, 100)},
        ];
        this.drawEnveloppe( this.Z2BacteriesMicrochampignons, dataZ2, Colors.RED3, Colors.RED3);
        d3.select(this.Z2BacteriesMicrochampignons).append('text')
            .attr('x', this.scaleX(28))
            .attr('y', this.scaleY(18))
            .attr('font-size', 10)
            .attr('font-weight', 'bold')
            .attr('fill', Colors.RED3)
            .text('Z3');
    }

    isInA0 = (η: number, φ: number) => {
        if ( φ > 60 ) { return false };
        if ( η < 18) { return false };
        if ( η > 27 ) { return false };
        var x = get_x_from_η_φ(η, φ);
        if ( x < 6.2) { return false };
        if ( x > 10.25) { return false };
        return true;
    }

    isInA1 = (η: number, φ: number) => {
        if ( φ > 80 ) { return false };
        if ( φ < 20 ) { return false };
        if ( η < 15) { return false };
        if ( η > 32 ) { return false };
        var x = get_x_from_η_φ(η, φ);
        if ( x > 12) { return false };
        return true;
    }

    isInA2 = (η: number, φ: number) => {
        if ( φ > 80 ) { return false };
        if ( φ < 20 ) { return false };
        if ( η < 10) { return false };
        if ( η > 35 ) { return false };
        var x = get_x_from_η_φ(η, φ);
        if ( x > 15.5) { return false };
        return true;
    }

    isInA3 = () => {
        // TODO ?
    }

    isInZ1Secheresse = (η: number, φ: number) => {
        if ( φ > 40 ) { return false };
        if ( η < 15) { return false };
        if ( η > 28 ) { return false };
        return true;
    }

    isInZ23BacteriesChampignons = (η: number, φ: number) => {
        if ( φ < 70 ) { return false };
        if ( η < 15) { return false };
        if ( η > 28 ) { return false };
        return true;
    }

    isInZ3Acariens = (η: number, φ: number) => {
        if ( φ < 70 ) { return false };
        if ( η < 23) { return false };
        if ( η > 28 ) { return false };
        return true;
    }

    drawEnveloppe = (ref: SVGElement, data: Iηx[], colorStroke: string, colorFill: string) => {
        d3.select(ref)
            .datum(data)
            .append('path')
            .attr('d', this.lineFunction_η_x)
            .attr('fill', 'white')
            .attr('fill-opacity', 0)
            .attr('stroke', colorStroke)
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 1)
            .attr('interpolate', 'basis-closed')
            .on('mouseover', function() {d3.select(this).transition().attr('fill', colorFill).attr('fill-opacity', 0.2)})
            .on('mouseout', function() {d3.select(this).transition().attr('fill', 'white').attr('fill-opacity', 0)});
    }

    functionColor = (d: Ixy) => {
        if ( this.alarmSelected === EnumAlarm.confort ) {
            if ( this.isInA0(d.x, d.y) ) { return 'green' };
            if ( this.isInA1(d.x, d.y) ) { return 'orange' };
            if ( this.isInA2(d.x, d.y) ) { return 'red' };
            return 'darkred';
        } else {
            if ( this.isInZ1Secheresse(d.x, d.y) ) { return 'red' };
            if ( this.isInZ23BacteriesChampignons(d.x, d.y) ) { return 'red' };
            if ( this.isInZ3Acariens(d.x, d.y) ) { return 'red' };
            return 'gray';
        }
    }

    private drawGraph = () => {
        d3.select(this.chartRef).selectAll('dots')
            .data(this.datum)
            .enter().append('circle')
                .attr('class', 'classDots')
                .attr('cx', (d) => this.scaleX(d.x))
                .attr('cy', (d) => this.scaleY(get_x_from_η_φ (d.x, d.y)))
                .attr('r', 1)
                .attr('fill', 'none')
                .attr('stroke', this.functionColor)
                .attr('stroke-width', 1);
    };

    private isDateBetweenInterval = (date: Date, dateMin: Date, dateMax: Date) => {
        return (date >= dateMin) && (date <= dateMax);
    }

    drawXAxis = () => {
        d3.select(this.xAxisRef)
            .call(d3.axisTop(this.scaleX).tickValues([0, 5, 10, 15, 20, 25, 30, 35, 40]).tickFormat((value: number) => value + '°C'))
            .selectAll('text');
            // .append("text")
            // .attr("fill", "black")
            // // .style("text-anchor", "middle")
            // // .attr("y", -9) 
            // .text(function(d) { return d });
    }
    drawYAxis = () => {
        d3.select(this.yAxisRef)
            .call(d3.axisLeft(this.scaleY).tickValues([0, 5, 10, 15, 20, 25]))
            .selectAll('text');
            // .append("text")
            // .attr("fill", "black")
            // .style("text-anchor", "middle")
            // .attr("y", -9) 
            // .text(function(d) { return d });
    }

    selectAlarm = (alarm: EnumAlarm) => {
        this.alarmSelected = alarm;
        this.drawGraph();
    }

    drawEnveloppes = () => {
        this.drawA0Enveloppe();
        this.drawA1Enveloppe();
        this.drawA2Enveloppe();
        this.drawZ1Enveloppe();
        this.drawZ2Enveloppe();
        this.drawZ3Enveloppe();
    }

    // shouldComponentUpdate() {
    //     return true;
    // }

    componentDidMount() {
        this.drawReferenceCourbesHumidite();
        this.drawReferenceCourbesEnthalpie();
        this.drawReferenceCourbesTemperatureEnthalpie();

        this.drawEnveloppes();
    }

    componentDidUpdate() {

        if (!this.props.currentTemperature || !this.props.currentTemperature) {
            d3.select(this.currentCrosshairRef)
                .attr('opacity', 0);
        } else {
            var translateX = this.scaleX(this.props.currentTemperature);
            var translateY = this.scaleY(get_x_from_η_φ (this.props.currentTemperature, this.props.currentHumidity));
            var translateCrosshair = 'translate(-10,-10)';
            var displayCrosshair = false;
        
            if (translateX !== NaN && translateY !== NaN) {
                translateCrosshair = 'translate(' + translateX + ',' + translateY + ')';
                displayCrosshair = true;
            }
    
            d3.select(this.currentCrosshairRef)
                .transition()
                .attr('transform', translateCrosshair)
                .attr('opacity', displayCrosshair ? 1 : 0);
        }

    }

    render() {
        return (
            <div>
                <div>
                    <svg width={this.chartWidth} height={this.chartHeight}>
                        <rect x="0" y="0" width={this.chartWidth} height={this.chartHeight} fill="white" stroke="black"/>
                        <g>
                            <g ref={(ref) => {this.referenceChartsHumidityRef = ref}}/>
                            <g ref={(ref) => {this.referenceChartsEnthalpieRef = ref}}/>
                            <g ref={(ref) => {this.referenceChartsTemperatureEnthalpieRef = ref}}/>
                            <g ref={(ref) => {this.chartRef = ref}}/>
                            <g ref={(ref) => {this.xAxisRef = ref}} transform={'translate(0,' + this.chartHeight + ')'}/>
                            <g ref={(ref) => {this.yAxisRef = ref}} transform={'translate(' + this.chartWidth + ', 0)'}/>
                            <g
                                ref={(ref) => {this.currentCrosshairRef = ref}}
                                transform="translate(-10, -10)"
                                opacity="0"
                            >
                                <circle cx="0" cy="0" r="5" stroke="white" fill="steelblue"/>
                            </g>
                            <g ref={(ref) => {this.enveloppesConfortRef = ref}} opacity={this.alarmSelected === EnumAlarm.confort ? 1 : 0}>
                                <g ref={(ref) => {this.A2EnveloppeRef = ref}}/>
                                <g ref={(ref) => {this.A1EnveloppeRef = ref}}/>
                                <g ref={(ref) => {this.A0EnveloppeRef = ref}}/>
                            </g>
                            <g ref={(ref) => {this.enveloppesQualiteAirRef = ref}} opacity={this.alarmSelected === EnumAlarm.qualiteAir ? 1 : 0}>
                                <g ref={(ref) => {this.Z1BacteriesMicrochampignons = ref}}/>
                                <g ref={(ref) => {this.Z2BacteriesMicrochampignons = ref}}/>
                                <g ref={(ref) => {this.Z3SecheresseAcariens = ref}}/>
                            </g>
                            <g ref={(ref) => {this.legendsRef = ref}}/>
                            <g ref={(ref) => {this.checkBoxes = ref}}>
                                <g transform="translate(10,10)">
                                    <SvgCheckBox
                                        alarm={EnumAlarm.confort}
                                        selected={this.alarmSelected === EnumAlarm.confort}
                                        handleSelect={() => this.selectAlarm(EnumAlarm.confort)}
                                    />
                                </g>
                                <g transform="translate(10,25)">
                                    <SvgCheckBox
                                        alarm={EnumAlarm.qualiteAir}
                                        selected={this.alarmSelected === EnumAlarm.qualiteAir}
                                        handleSelect={() => this.selectAlarm(EnumAlarm.qualiteAir)}
                                    />
                                </g>
                            </g>
                        </g>
                    </svg>
                    {
                        this.props.showLegend ? 
                            <svg width={VERTICAL_LEGEND_WIDTH} height={this.chartHeight}>
                                <g
                                    transform={`translate(${VERTICAL_LEGEND_WIDTH - 5},${this.props.chartHeight / 2})`}
                                >
                                    <text
                                        textAnchor="middle"
                                        transform="rotate(-90 0 0)"
                                        fontSize="12"
                                    >
                                        x : Humidité absolue (kg eau/kg air sec)
                                    </text>
                                </g>
                            </svg>
                            :
                            <React.Fragment/>
                    }
                </div>
                <div>
                {
                    this.props.showLegend ? 
                        <svg width={this.chartWidth} height={HORIZONTAL_LEGEND_HEIGHT}>
                            <text
                                x={this.chartWidth / 2}
                                y={HORIZONTAL_LEGEND_HEIGHT - 5}
                                textAnchor="middle"
                                // transform="rotate(-90 0 0)"
                                fontSize="12"
                            >
                                η : Température (°C)
                            </text>
                        </svg>
                        :
                        <React.Fragment/>
                }
                </div>
           </div>
        )
    }
}