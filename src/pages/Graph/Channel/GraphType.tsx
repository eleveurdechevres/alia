import * as d3 from 'd3';

export const GraphType = {
    PRESENCE: {
      svgClass: 'presence',
      svgContextClass: 'presenceContext',
      domain: [1.2, 0],
      interpolation: d3.curveStepBefore,
      tickValues: [0, 1],
      scaleFunction: d3.scaleLinear(),
      getYValue: (yMouse: number) => Math.round(GraphType.PRESENCE.scaleFunction.invert(yMouse)),
      color: 'purple',
    },
    TEMPERATURE: {
      svgClass: 'temperature',
      svgContextClass: 'temperatureContext',
      domain: [40, -10],
      interpolation: d3.curveCatmullRom,
//      tickValues: [15, 20, 25],
      scaleFunction: d3.scaleLinear(),
      getYValue: (yMouse: number) => Math.round(GraphType.TEMPERATURE.scaleFunction.invert(yMouse) * 10) / 10,
      color: 'red',
    },
    HUMIDITE: {
      svgClass: 'humidite',
      svgContextClass: 'curveCatmullRom',
      domain: [100, 0],
      interpolation: d3.curveMonotoneX,
//      tickValues: [45, 50, 55, 60, 65, 70, 75],
      scaleFunction: d3.scaleLinear(),
      getYValue: (yMouse: number) => Math.round(GraphType.HUMIDITE.scaleFunction.invert(yMouse) * 10) / 10,
      color: 'darkblue',
    },
    LUMINOSITE: {
      svgClass: 'luminosite',
      svgContextClass: 'curveCatmullRom',
      // domain:[1000, 0.1],
      // tickValues: [1, 10, 100],
      // scaleFunction: d3.scaleLog(),
      domain: [1000, 0],
      interpolation: d3.curveMonotoneX,
//      tickValues: [100, 500, 900],
      scaleFunction: d3.scaleLinear(),
      getYValue: (yMouse: number) => Math.round(GraphType.LUMINOSITE.scaleFunction.invert(yMouse)),
      color: 'orange',
    },

    getGraphTypeFromMeasuretype: (measureType: string) => {
      switch (measureType) {
        case 'Température':
          return GraphType.TEMPERATURE;
        case 'Mouvement':
          return GraphType.PRESENCE;
        case 'Humidité':
          return GraphType.HUMIDITE;
        case 'Luminosité':
          return GraphType.LUMINOSITE;
        default:
          return null;
      }
    }
  };