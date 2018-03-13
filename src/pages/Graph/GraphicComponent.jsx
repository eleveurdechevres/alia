import React, { Component } from 'react';
import * as d3 from "d3";
import $ from 'jquery'; 
import { FocusValues } from './FocusValues';
//import axios from 'axios';
import GraphType from './Channel/GraphType';

import { line } from 'd3-shape';
import 'd3-transition';
import AeotecScales from './AeotecScales.jsx';

var svgWidth = 900;
var svgHeight = 800;

var contextHeight = 30;
var marginVertical = 10;

var marginChart = {left: 30, right: 10, top: 100, bottom: 100 + contextHeight };

var chartWidth = svgWidth - marginChart.left - marginChart.right;


var originx = marginChart.left;
var chartHeight = (svgHeight - 3*marginVertical - marginChart.top - marginChart.bottom) / 4;
var top1 = marginChart.top;
var top2 = marginChart.top + chartHeight + marginVertical;
var top3 = marginChart.top + 2*chartHeight + 2*marginVertical;
var top4 = marginChart.top + 3*chartHeight + 3*marginVertical;

var timeScale = undefined;

// var brush = d3.brushX()
//     .extent([[0, 0], [chartWidth, contextHeight]])
//     .on("brush end", this.brushed);



export class GraphicComponent extends Component {


  constructor(props) {
    super(props);
    this.state = {
      jsonData: [],
      mapJsonData: new Map()
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.loadJsonFromAeroc('2017/12/16 12:00:00', '2017/12/16 14:00:00', () => {
      this.loadJsonFromAeroc('2017/12/16 14:00:00', '2017/12/16 16:00:00', () => {
        this.loadJsonFromAeroc('2017/12/16 16:00:00', '2017/12/16 18:00:00', () => {
          this.loadJsonFromAeroc('2017/12/16 18:00:00', '2017/12/16 20:00:00', () => {
          });
        });
      });
    });
  }

  componentWillReceiveProps() {
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  componentWillUpdate() {
  }

  drawGraph(graphType, originx, originy, widthGraph, heightGraph, data, color) {

    var domain = graphType.domain;
    var range = [originy, originy + heightGraph];

    graphType.scale = graphType.scaleFunction.domain(domain).range(range);

    var lineFunction = d3.line()
                            .x((d) => { return timeScale(new Date(d.date)); })
                            .y((d) => { return graphType.scale(d.valeur); })
                            .curve(d3.curveStepAfter);
// d3.curveLinear
// d3.curveStep
// d3.curveStepBefore
// d3.curveStepAfter
// d3.curveBasis
// d3.curveCardinal
// d3.curveMonotoneX
// d3.curveCatmullRom
    var svgContainer = d3.select("g." + graphType.svgClass);

    svgContainer.append('rect')
      .attr("width", widthGraph)
      .attr("height", heightGraph)
      .attr("fill", graphType.background)
      .attr("transform", "translate(" + originx + ", " + originy + ")");

  //The line SVG Path we draw
    //var lineGraph = 
    svgContainer.append("path")
      .datum(data)
      .attr("d", lineFunction)
      .attr("fill", "none")
      .attr("stroke", graphType.color)
      .attr("stroke-width", 1);

  // focus.append("circle")
  //     .attr("r", 4.5);

  // focus.append("text")
  //     .attr("x", 9)
  //     .attr("dy", ".35em");
    var verticalFocus = d3.select("g.verticalFocus");
    var focusValues = d3.select("g.focusValues");

    svgContainer.append("rect")
      .attr("class", "overlay")
      .attr("width", widthGraph)
      .attr("height", heightGraph)
      .attr("fill", "transparent")
      .attr("transform", "translate(" + originx + ", " + originy + ")")
      .on("mouseover", () => {
        verticalFocus.style("display", null);
        focusValues.style("display", null);
      })
      .on("mouseout", () => {
        verticalFocus.style("display", "none");
        focusValues.style("display", "none");
      })
      .on("mousemove", this.mousemove);
                          
  };

  drawContext() {}
  drawContextAxis() {}

  computeScaleforGraph(graphType, originx, originy, heightGraph) {
    var domain = graphType.domain;
    var range = [originy, originy + heightGraph];

    graphType.scaleFunction.domain(domain).range(range);
  }
  // Echelle du temps
  drawYAxis(graphType, originx, originy, heightGraph) {

    var svgContainer = d3.select("g." + graphType.svgClass)
    .append("g").attr("transform", "translate(" + originx + ", 0 )");

    svgContainer.call(d3.axisLeft(graphType.scaleFunction).tickValues(graphType.tickValues))
    .append("text")
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .attr("y", -9) 
    .text(function(d) { return d });
  }
  
  // Echelles du temps
  drawDateAxis() {
    d3.select("g.dateAxis")
    .attr("transform", "translate(" + 0 + "," + marginChart.top + ")")
    .call(d3.axisTop(timeScale)
            .tickFormat(d3.timeFormat("%d/%Y/%m"))
            // .ticks(d3.timeHour.every(12))
          )
    .selectAll("text")	
  }

  drawTimeAxis() {
    d3.select("g.hourAxis")
    .attr("transform", "translate(" + 0 + "," + (svgHeight - marginChart.bottom) + ")")
    .call(d3.axisBottom(timeScale)
            .tickFormat(d3.timeFormat("%H:%M"))
            // .ticks(d3.timeMinute.every(60))
          )
    .selectAll("text")	
  }

  componentDidUpdate() {

    // Presence capteur 1
    console.log(this.state)
    console.log(this.state.mapJsonData)
    console.log(this.state.mapJsonData.get("1"))
    console.log(this.state.mapJsonData.get("1").get("1"))
    var capteur1Channel1 = this.state.mapJsonData.get("1").get("1");
    // Temperature capteur 1
    var capteur1Channel2 = this.state.mapJsonData.get("1").get("2");
    // Humidité capteur 1
    var capteur1Channel3 = this.state.mapJsonData.get("1").get("3");
    // Luminosité capteur 1
    var capteur1Channel4 = this.state.mapJsonData.get("1").get("4");
    // Batterie capteur 1
    //var capteur1Channel5 = this.state.mapJsonData.get("1").get("5");
    // Sabotage capteur 1
    //var capteur1Channel9 = this.state.mapJsonData.get("1").get("9");

    this.drawDateAxis();

    this.computeScaleforGraph(GraphType.PRESENCE, originx, top1, chartHeight);
    this.computeScaleforGraph(GraphType.TEMPERATURE, originx, top2, chartHeight);
    this.computeScaleforGraph(GraphType.HUMIDITE, originx, top3, chartHeight);
    this.computeScaleforGraph(GraphType.LUMINOSITE, originx, top4, chartHeight);

    this.drawGraph(GraphType.PRESENCE, originx, top1, chartWidth, chartHeight, capteur1Channel1, 'pink');
    this.drawGraph(GraphType.TEMPERATURE, originx, top2, chartWidth, chartHeight, capteur1Channel2, 'red');
    this.drawGraph(GraphType.HUMIDITE, originx, top3, chartWidth, chartHeight, capteur1Channel3, 'blue');
    this.drawGraph(GraphType.LUMINOSITE, originx, top4, chartWidth, chartHeight, capteur1Channel4, 'yellow');
    
    this.drawYAxis(GraphType.PRESENCE, originx, top1, chartHeight);
    this.drawYAxis(GraphType.TEMPERATURE, originx, top2, chartHeight);
    this.drawYAxis(GraphType.HUMIDITE, originx, top3, chartHeight);
    this.drawYAxis(GraphType.LUMINOSITE, originx, top4, chartHeight);

    this.drawTimeAxis();
    this.drawContext();
    this.drawContextAxis();
  };

  /**
   * Créer les nodes SVG pour pouvoir les réutiliser
   */
  init() {
  }

  loadJsonFromAeroc(dateBegin, dateEnd, callback = null) {
      // LOAD DATA from AEROC
    $.getJSON('http://test.ideesalter.com/alia_readMesure.php?date_begin=' + dateBegin + '&date_end=' + dateEnd, function(data) {
      console.log('http://test.ideesalter.com/alia_readMesure.php?date_begin=' + dateBegin + '&date_end=' + dateEnd);
      let mapCapteurs = this.state.mapJsonData;
      data.forEach((item, index) => {
        item.date = new Date(item.date).setSeconds(0, 0);

        //console.log(i);
        //console.log(mapCapteurs.get(item.capteur_id));
        if( !mapCapteurs.get(item.capteur_id) ) {
          mapCapteurs.set(item.capteur_id, new Map());
        }
        let mapCapteur = mapCapteurs.get(item.capteur_id)
        //mapCapteurs.set(item.capteur_id, item);
        if( !mapCapteur.get(item.channel_id) ) {
          mapCapteur.set(item.channel_id, []);
        }
        //let arrayChannel = mapCapteur.get(item.channel_id)
        mapCapteurs.get(item.capteur_id).get(item.channel_id).push(item);
      });
      // console.log(mapCapteurs);

      var newJsonData = this.state.jsonData.concat(data);
      var newMapJsonData = this.state.mapJsonData;
      mapCapteurs.forEach((value, key) => {
        newMapJsonData.set(key, value);
      });


      this.minDate = d3.min(newJsonData, (d, i) => {return d.date});
      this.maxDate = d3.max(newJsonData, (d, i) => {return d.date});
      
      var aeotecScales = new AeotecScales();
      timeScale = aeotecScales.timeScale([new Date(this.minDate), new Date(this.maxDate)], [marginChart.left, marginChart.left + chartWidth]);

      //console.log("minDate " + minDate);
      //console.log("maxDate " + maxDate);

      // Merge Values
      this.setState({ jsonData: newJsonData, mapJsonData: newMapJsonData });
    
      //this.addJsonData(data);
      // this.jsonData = data;
      // data.forEach(mesure => {
      //   this.jsonData.push(mesure);
      // });
      if( callback != null ) callback();
    }.bind(this));
  }

  brushed() {
    // if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    // var s = d3.event.selection || x2.range();
    // x.domain(s.map(x2.invert, x2));
    // focus.select(".area").attr("d", area);
    // focus.select(".axis--x").call(xAxis);
    // svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
    //     .scale(width / (s[1] - s[0]))
    //     .translate(-s[0], 0));
  }
  
  // zoomed() {
  //   if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
  //   var t = d3.event.transform;
  //   x.domain(t.rescaleX(x2).domain());
  //   focus.select(".area").attr("d", area);
  //   focus.select(".axis--x").call(xAxis);
  //   context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
  // }
  
  mousemove() {

    //var bisectDate = d3.bisector(function(d) { return d.date; }).left;
    var verticalFocusGroup = d3.select("g.verticalFocus");
    verticalFocusGroup.attr("display", null)

    var x0 = timeScale.invert(d3.mouse(this)[0]);
    //var y0 = 
    var verticalFocusLine = verticalFocusGroup.select("line.verticalFocus");
    verticalFocusLine.attr("class", "verticalFocus")
      .attr('x1', timeScale(x0) + marginChart.left)
      .attr('y1', marginChart.top)
      .attr('x2', timeScale(x0) + marginChart.left)
      .attr('y2', marginChart.top + 4*chartHeight + 3*marginVertical)
      .attr("stroke", "black")
      .attr("stroke-width", "1");
    //var capteur1Channel1 = this.state.mapJsonData.get("1").get("1");
    //var presenceGraph = d3.select('.' + GraphType.PRESENCE.svgClass);
    //var path = presenceGraph.selectAll('path');
    console.log(d3.select("GraphicComponent"));
    console.log("mouseMove " + d3.mouse(this)[0] + " : " + x0);
    // var i = bisectDate(capteur1Channel1, x0, 1);
    // var d0 = capteur1Channel1[i - 1];
    // var d1 = capteur1Channel1[i];
    // var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    // var focus = d3.select(".focus");

    // focus.attr("transform", "translate(" + this.timeScale(d.date) + "," + GraphType.PRESENCE.scale(d.close) + ")");
    // focus.select("text").text(d.close);
  }


  render() {
    return (
      <svg width={svgWidth} height={svgHeight}>
        <rect x='0' y='0' width={svgWidth} height={svgHeight} fill='none' stroke='lavender' strokeWidth='1'></rect>

        <g className='dateAxis'></g>

        <g className={GraphType.PRESENCE.svgContextClass}></g>
        <g className={GraphType.PRESENCE.svgClass}></g>

        <g className={GraphType.TEMPERATURE.svgContextClass}></g>
        <g className={GraphType.TEMPERATURE.svgClass}></g>

        <g className={GraphType.HUMIDITE.svgContextClass}></g>
        <g className={GraphType.HUMIDITE.svgClass}></g>

        <g className={GraphType.LUMINOSITE.svgContextClass}></g>
        <g className={GraphType.LUMINOSITE.svgClass}></g>

        <g className='hourAxis'></g>
        <g className='timeContext'></g>

        <g className="verticalFocus">
          <line className="verticalFocus"></line>
        </g>

        <FocusValues />

      </svg>
    );

  }
}
