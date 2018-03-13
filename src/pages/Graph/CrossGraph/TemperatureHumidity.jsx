import * as React from 'react';
import { momentToSql, dateWithoutSeconds } from '../../../utils/DateUtils';
import * as d3 from 'd3';
import { get_x_from_η_φ, get_η, get_η_from_ηh_φ, get_η_from_φ_x } from "../../../utils/CalculsThermiques"
import { GraphType } from '../Channel/GraphType';
export class TemperatureHumidity extends React.Component {

    mapValues = new Map();
    chartRef;
    referenceChartsHumidityRef;
    referenceChartsEnthalpieRef;
    referenceChartsTemperatureEnthalpieRef;
    xAxisRef;
    yAxisRef;
    currentCrosshairRef;
    enveloppesRef;
    A0EnveloppeRef;
    A1EnveloppeRef;
    A2EnveloppeRef;
    A3EnveloppeRef;
    A4EnveloppeRef;


    channelXType;
    channelYType;
    scaleX;
    scaleY;

    datum = [];

    constructor(props) {
        super(props);
        this.chartWidth=this.props.chartWidth;
        this.chartHeight=this.props.chartHeight;
        this.capteurId=this.props.capteurId
        this.channelXType=this.props.channelXType; 
        this.channelYType=this.props.channelYType; 

        // configure ScaleX
        this.scaleX=d3.scaleLinear();
//        this.scaleX.domain(this.channelXType.domain.slice().reverse());
        this.scaleX.domain([0,50]);
        this.scaleX.range([0, this.chartWidth])
    
        // configure ScaleY
        this.scaleY=d3.scaleLinear();
        this.scaleY.domain([25, 0]);
        this.scaleY.range([0, this.chartHeight]);
    }

    componentWillReceiveProps(props) {
        var startDate = momentToSql(props.dateInterval.startDate);
        var stopDate = momentToSql(props.dateInterval.stopDate);

        if( startDate !== this.startDate || stopDate !== this.stopDate) {
            this.startDate = startDate;
            this.stopDate = stopDate;
            this.loadJsonFromAeroc(startDate, stopDate, props.channelX, props.channelY);
        }
        if( props.channelX !== this.props.channelX || props.channelY !== this.props.channelY ) {
            this.loadJsonFromAeroc(startDate, stopDate, props.channel1, props.channel2);
        }
        // if( props.currentHumidity !== this.props.currentHumidity || props.currentTemperature !== this.props.currentTemperature ) {

        // }
    }

    loadJsonFromAeroc = (dateBegin, dateEnd, channel1, channel2) => {
        // LOAD DATA from AEROC
        if(channel1 !== undefined && channel2 !== undefined) {

            // date_begin=2017/12/09 20:13:04&date_end=2018/01/24 21:19:06
            var httpReq = 'http://test.ideesalter.com/alia_searchCrossMesures.php?date_begin=' + dateBegin + '&date_end=' + dateEnd + '&capteur_id=' + this.capteurId + '&channel1_id=' + channel1.id + '&channel2_id=' + channel2.id;
            //console.log(httpReq);
            return fetch(httpReq)
                .then((response) => response.json())
                .then((data) => {

                    data.forEach((line) => {
                        var date = dateWithoutSeconds(line.date);
                        this.mapValues.set(date.getTime(), {x: line.channel1, y:line.channel2});
                        this.datum.push( {x: line.channel1, y: line.channel2} )
                    })
            
                    // var maxChannel1 = d3.max(this.datum, (d)=>{return d.x})
                    // var minChannel1 = d3.min(this.datum, (d)=>{return d.x})
                    // var maxChannel2 = d3.max(this.datum, (d)=>{return d.y})
                    // var minChannel2 = d3.min(this.datum, (d)=>{return d.y})

                    // this.scaleX.domain([minChannel1,maxChannel1]);
                    // this.scaleY.domain([minChannel2,maxChannel2]);

                    this.drawGraph();
                    this.drawXAxis();
                    this.drawYAxis();
                });
        }
    }


    lineFunction_η_φ = d3.line()
    .x((d) => { return this.scaleX(d.x) })
    .y((d) => { return this.scaleY(get_x_from_η_φ(d.x, d.y))})
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
        for( var humidite = 0 ; humidite <= 100 ; humidite += 10) {
            var dataCourbeHumidite = [];
            for( var temperature = 0 ; temperature <= 60 ; temperature ++ ) {
                dataCourbeHumidite.push({x:temperature, y:humidite});
            }
            var currentCourbe = d3.select(this.referenceChartsHumidityRef).append("g")
            currentCourbe.datum(dataCourbeHumidite)
                .append("path")
                .attr("d", this.lineFunction_η_φ)
                .attr("fill", "none")
                .attr("stroke", "gray")
                .attr("stroke-width", 1);
            }
    }

    drawReferenceCourbesEnthalpie = () => {
        var x2=0;
        for( var h=0 ; h<=60 ; h+=2 ) {
            var η1 = h;
            var η2 = get_η(h, x2);
            var x1 = get_x_from_η_φ(η1, 100);
            var x2 = 0;

            var currentCourbe = d3.select(this.referenceChartsEnthalpieRef).append("g")
            currentCourbe.append("line")
                .attr("x1", this.scaleX(η1))
                .attr("y1", this.scaleY(x1))
                .attr("x2", this.scaleX(η2))
                .attr("y2", this.scaleY(x2))
                .attr("stroke", "gray")
                .attr("strokeWidth", 1);
        }
    }

    drawReferenceCourbesTemperatureEnthalpie = () => {
        var x2=0;
        for( var ηh=0 ; ηh<=60 ; ηh+=2 ) {
            var η1 = ηh;
            var x1 = get_x_from_η_φ(η1, 100);
            var η2 = get_η_from_ηh_φ(ηh, 0);
            var x2 = 0;

            var currentCourbe = d3.select(this.referenceChartsTemperatureEnthalpieRef).append("g")
            currentCourbe.append("line")
                .attr("x1", this.scaleX(η1))
                .attr("y1", this.scaleY(x1))
                .attr("x2", this.scaleX(η2))
                .attr("y2", this.scaleY(x2))
                .attr("stroke", "gray")
                .attr("strokeWidth", 1);
            currentCourbe.append("text")
                .attr("x", this.scaleX(η1)-10)
                .attr("y", this.scaleY(x1)-5)
                .attr("font-size", "10")
                .attr("fill", "black")
                .text(η1);
        }
    }

    lineFunction_η_x = d3.line()
    .x((d) => { return this.scaleX(d.η)})
    .y((d) => { return this.scaleY(d.x)})
    .curve(d3.curveLinear);

    drawA0Enveloppe = () => {
        var dataA0 = [
            {η: 18, x: 6.2},
            {η: 27, x: 6.2},
            {η: 27, x: 10.25},
            {η: get_η_from_φ_x(60, 10.25), x: 10.25}, // φ=60%, x=10.25
            {η: 22, x:get_x_from_η_φ(22, 60)},  // η=20, φ=60%
            {η: 20, x:get_x_from_η_φ(20, 60)},  // η=20, φ=60%
            {η: 18, x:get_x_from_η_φ(18, 60)},  // η=20, φ=60%
            {η: 18, x: 6.2},
        ];
        this.drawEnveloppe( this.A0EnveloppeRef, dataA0);
        d3.select(this.A0EnveloppeRef).append("text")
            .attr("x", this.scaleX(24))
            .attr("y", this.scaleY(10.5))
            .attr("font-size", "10")
            .attr("fill", "black")
            .text("A0");
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
        this.drawEnveloppe( this.A1EnveloppeRef, dataA1);
        d3.select(this.A1EnveloppeRef).append("text")
            .attr("x", this.scaleX(27))
            .attr("y", this.scaleY(12.5))
            .attr("font-size", "10")
            .attr("fill", "black")
            .text("A1");
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
        this.drawEnveloppe( this.A2EnveloppeRef, dataA2);
        d3.select(this.A2EnveloppeRef).append("text")
            .attr("x", this.scaleX(31))
            .attr("y", this.scaleY(16))
            .attr("font-size", "10")
            .attr("fill", "black")
            .text("A2");
    }

    isInA0 = (η, φ) => {
        if( φ > 60 ) return false;
        if( η < 18) return false;
        if( η > 27 ) return false;
        var x = get_x_from_η_φ(η, φ);
        if( x < 6.2) return false;
        if( x > 10.25) return false;
        return true;
    }

    isInA1 = (η, φ) => {
        if( φ > 80 ) return false;
        if( φ < 20 ) return false;
        if( η < 15) return false;
        if( η > 32 ) return false;
        var x = get_x_from_η_φ(η, φ);
        if( x > 12) return false;
        return true;
    }

    isInA2 = (η, φ) => {
        if( φ > 80 ) return false;
        if( φ < 20 ) return false;
        if( η < 10) return false;
        if( η > 35 ) return false;
        var x = get_x_from_η_φ(η, φ);
        if( x > 15.5) return false;
        return true;
    }

    isInA3 = () => {
        
    }



    drawEnveloppe = (ref, data) => {
        d3.select(ref)
            .datum(data)
            .append("path")
            .attr("d", this.lineFunction_η_x)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 1);
    }

    functionColor = (d) => {
        if( this.isInA0(d.x, d.y) ) return "green";
        if( this.isInA1(d.x, d.y) ) return "orange";
        if( this.isInA2(d.x, d.y) ) return "red";
        return "darkred";
    }

    drawGraph = (mapValues) => {
        d3.select(this.chartRef).selectAll("dots")
            .data(this.datum)
            .enter().append("circle")
                .attr("cx", (d) => this.scaleX(d.x))
                .attr("cy", (d) => this.scaleY(get_x_from_η_φ (d.x, d.y)))
                .attr("r", 1)
                .attr("fill", "none")
                .attr("stroke", this.functionColor)
                .attr("stroke-width", 1);
    };

    drawXAxis = () => {
        d3.select(this.xAxisRef)
            .call(d3.axisTop(this.scaleX).tickValues([0,5,10,15,20,25,30,35,40]))
            .selectAll("text");
            // .append("text")
            // .attr("fill", "black")
            // // .style("text-anchor", "middle")
            // // .attr("y", -9) 
            // .text(function(d) { return d });
    }
    drawYAxis = () => {
        d3.select(this.yAxisRef)
            .call(d3.axisLeft(this.scaleY).tickValues([0,5,10,15,20,25]))
            .selectAll("text");
            // .append("text")
            // .attr("fill", "black")
            // .style("text-anchor", "middle")
            // .attr("y", -9) 
            // .text(function(d) { return d });
    }

    shouldComponentUpdate() {
        return true;
    }

    componentDidMount() {
        this.drawReferenceCourbesHumidite();
        this.drawReferenceCourbesEnthalpie();
        this.drawReferenceCourbesTemperatureEnthalpie();
        this.drawA0Enveloppe();
        this.drawA1Enveloppe();
        this.drawA2Enveloppe();
    }


    render() {
        var translateX = this.scaleX(this.props.currentTemperature);
        var translateY = this.scaleY(get_x_from_η_φ (this.props.currentTemperature, this.props.currentHumidity));
        var translateCrosshair='translate(0,0)';
        var displayCrosshair=false;
        if(translateX !== "NaN" && translateY !== "NaN") {
            translateCrosshair = 'translate(' + translateX + ',' + translateY + ')';
            displayCrosshair=false;
        }
        return (
            <svg width={this.chartWidth} height={this.chartHeight}>
                <rect x='0' y='0' width={this.chartWidth} height={this.chartHeight} fill="white" stroke="black"/>
                <g>
                    <g ref={(ref) => {this.referenceChartsHumidityRef = ref}}/>
                    <g ref={(ref) => {this.referenceChartsEnthalpieRef = ref}}/>
                    <g ref={(ref) => {this.referenceChartsTemperatureEnthalpieRef = ref}}/>
                    <g ref={(ref) => {this.chartRef = ref}}/>
                    <g ref={(ref) => {this.xAxisRef = ref}} transform={'translate(0,'+this.chartHeight+')'}/>
                    <g ref={(ref) => {this.yAxisRef = ref}} transform={'translate('+this.chartWidth+', 0)'}/>
                    <g ref={(ref) => {this.currentCrosshairRef}} transform={translateCrosshair} opacity={displayCrosshair?1:"none"}>
                        <circle cx="0" cy="0" r="5" fill="red"/>
                    </g>
                    <g ref={(ref) => {this.enveloppesRef}}>
                        <g ref={(ref) => {this.A0EnveloppeRef = ref}}/>
                        <g ref={(ref) => {this.A1EnveloppeRef = ref}}/>
                        <g ref={(ref) => {this.A2EnveloppeRef = ref}}/>
                        <g ref={(ref) => {this.A3EnveloppeRef = ref}}/>
                        <g ref={(ref) => {this.A4EnveloppeRef = ref}}/>
                    </g>
                </g>
            </svg>
        )
    }
}