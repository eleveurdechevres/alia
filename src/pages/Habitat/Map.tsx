import * as React from 'react';
import { observer } from 'mobx-react';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
import * as d3 from 'd3';

import { Map, View } from 'ol';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
// import { Icon, Style } from 'ol/style';
import VectorSource from 'ol/source/Vector';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { useGeographic } from 'ol/proj';

import 'ol/ol.css';
import { IHabitat } from 'src/interfaces/IHabitat';


interface IProps {
    habitats: IHabitat[];
}

@observer export class LocalisationMap extends React.Component<IProps, {}> {

    public map: Map = undefined;


    // !!! Pb d'affichage. Voir peut-être https://codesandbox.io/s/43p10r6w94?file=/src/MyMap.js:727-732

    public constructor(props: IProps) {
        super(props);
        this.createMap();
    }

    public componentDidMount() {
        this.map.setTarget('map')
        this.map.updateSize();
    }

    private createMap = () => {
        useGeographic();
        const features: Feature<Point>[] = this.props.habitats.map((habitat: IHabitat) => {
            return new Feature({
                geometry: new Point([habitat.gps_longitude, habitat.gps_latitude]),
                habitat: habitat,
                
            });
        });
        const centerView = [
            d3.mean(this.props.habitats.map((habitat: IHabitat) => habitat.gps_longitude)),
            d3.mean(this.props.habitats.map((habitat: IHabitat) => habitat.gps_latitude))
        ];

        const vectorSource = new VectorSource({
            features: features,
        });
        const vectorLayer = new VectorLayer({
            source: vectorSource,
        });

        this.map = new Map({
            layers: [
                new TileLayer({
                    source: new OSM()
                }),
                vectorLayer
            ],
            view: new View({
                center: centerView,
                zoom: 16
            }),
        });
        this.map.render();
    }

    public render() {
        return <div id="map" className={style(csstips.width('1883px'), csstips.height('450px'))}/>
    }
}