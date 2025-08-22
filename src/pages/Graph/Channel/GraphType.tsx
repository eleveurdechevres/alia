import * as d3 from 'd3';

export type GraphTypeName = 'PRESENCE' | 'TEMPERATURE' | 'HUMIDITE' | 'LUMINOSITE';

export type GraphTypeConfig = {
  svgClass: string;
  svgContextClass: string;
  domain: [number, number];
  interpolation: d3.CurveFactory;
  tickValues?: number[];
  scaleFunction: d3.ScaleLinear<number, number>;
  getYValue: (yMouse: number) => number;
  color: string;
};

export const GraphType: Record<GraphTypeName, GraphTypeConfig> & {
  getGraphTypeFromMeasuretype: (measureType: string) => GraphTypeConfig;
} = {
  PRESENCE: {
    svgClass: 'presence',
    svgContextClass: 'presenceContext',
    domain: [1.2, 0],
    interpolation: d3.curveStepBefore,
    scaleFunction: d3.scaleLinear(),
    getYValue: (yMouse) => Math.round(GraphType.PRESENCE.scaleFunction.invert(yMouse)),
    color: 'purple',
    tickValues: [0, 1],
  },
  TEMPERATURE: {
    svgClass: 'temperature',
    svgContextClass: 'temperatureContext',
    domain: [40, -10],
    interpolation: d3.curveMonotoneX,
    scaleFunction: d3.scaleLinear(),
    getYValue: (yMouse) => Math.round(GraphType.TEMPERATURE.scaleFunction.invert(yMouse) * 10) / 10,
    color: 'red',
  },
  HUMIDITE: {
    svgClass: 'humidite',
    svgContextClass: 'curveCatmullRom',
    domain: [100, 0],
    interpolation: d3.curveMonotoneX,
    scaleFunction: d3.scaleLinear(),
    getYValue: (yMouse) => Math.round(GraphType.HUMIDITE.scaleFunction.invert(yMouse) * 10) / 10,
    color: 'darkblue',
  },
  LUMINOSITE: {
    svgClass: 'luminosite',
    svgContextClass: 'curveCatmullRom',
    domain: [1000, 0],
    interpolation: d3.curveMonotoneX,
    scaleFunction: d3.scaleLinear(),
    getYValue: (yMouse) => Math.round(GraphType.LUMINOSITE.scaleFunction.invert(yMouse)),
    color: 'orange',
  },

  // 4️⃣ La fonction utilitaire
  getGraphTypeFromMeasuretype: (measureType: string) => {
    switch (measureType) {
      case 'Température': return GraphType.TEMPERATURE;
      case 'Mouvement': return GraphType.PRESENCE;
      case 'Humidité': return GraphType.HUMIDITE;
      case 'Luminosité': return GraphType.LUMINOSITE;
      default: return GraphType.TEMPERATURE;
    }
  }
};