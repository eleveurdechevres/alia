//import { scaleLinear, scaleLog, scaleTime } from 'd3-scale';
import * as d3 from "d3";

class AeotecScales {

    timeScale(domain, range) {
        var scale = d3.scaleTime().domain(domain).range(range);
        return scale;
    }
    
    presenceScale = () => {
        var scale = d3.scaleLinear();
        return scale;
    }
    
    temperatureScale = () => {
        var scale = d3.scaleLinear();
        return scale;
    }
    
    humidityScale = () => {
        var scale = d3.scaleLinear();
        return scale;
    }
    
    luminosityScale = () => {
        var scale = d3.scaleLog();
        return scale;
    }
}
export default AeotecScales;
