import * as React from 'react';
import * as d3 from 'd3';
// import $ from 'jquery'; 
// import { window } from 'd3-selection';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
import * as ReactModal from 'react-modal';
import { GraphBoard } from '../Graph/GraphBoard';
import { observable, autorun } from 'mobx';
import { observer } from 'mobx-react';
import { ICapteur } from 'src/interfaces/ICapteur';
import { IHabitat } from 'src/interfaces/IHabitat';
import { IMission } from 'src/interfaces/IMission';
import { GlobalStore } from 'src/stores/GlobalStore';
import { ContextMenu, Menu, MenuItem, MenuDivider } from '@blueprintjs/core';
import { IObservation } from 'src/interfaces/IObservation';

const customStyles = {
    overlay : {
      position          : 'fixed',
      top               : 0,
      left              : 0,
      right             : 0,
      bottom            : 0,
      backgroundColor   : 'rgba(255, 255, 255, 0.75)'
    },
    content : {
      position                   : 'absolute',
      top                        : '40px',
      left                       : '40px',
      right                      : '40px',
      bottom                     : '40px',
      border                     : '1px solid #ccc',
      background                 : '#fff',
      overflow                   : 'auto',
      WebkitOverflowScrolling    : 'touch',
      borderRadius               : '4px',
      outline                    : 'none',
      padding                    : '20px'
    }
};

interface IProps {
    globalStore: GlobalStore;
    habitat: IHabitat;
    planId: number;
    mission: IMission;
}

@observer export class Plan extends React.Component<IProps, {}> {

    // Text Alignment : http://apike.ca/prog_svg_text_style.html
    // Display values on mouseover : https://bl.ocks.org/mbostock/3902569

    @observable planImage: string = undefined;
    @observable width: number = undefined;
    @observable height: number = undefined;
    @observable capteurs: ICapteur[] = [];
    @observable observations: IObservation[] = [];
    @observable modalIsOpen: boolean = false;
    @observable capteurDisplayed: ICapteur = undefined;

    svgRef: SVGGElement;
    imageRef: SVGGElement;
    gItemLegend: SVGGElement;
    rectItemLegend: SVGGElement;
    textItemLegend: SVGGElement;

    constructor(props: IProps) {
        super(props);

        autorun(() => {
            if ( this.planImage ) {
                this.forceUpdate();
            }
        });
    }

    private getPlan = (id: number) => {
        if (!id) {
            return Promise.resolve({ plans: [] });
        }
        var request = `http://test.ideesalter.com/alia_afficheImagePlan.php?id=${this.props.planId}`;
        return fetch(request)
            .then((response) => {
                return( response.text() );
            })
            .then((responseData) => {
                this.planImage = responseData;
            }
        );
    }

    getCapteursForPlan = (planId: number, missionId: number) => {
        if (!planId) {
            return Promise.resolve({ capteurs: [] });
        }
    
        return fetch(`http://test.ideesalter.com/alia_searchCapteursForPlan.php?plan_id=${planId}&mission_id=${missionId}`)
            .then((response) => response.json())
            .then((capteurs) => {
                this.capteurs = capteurs;
            }
        );
    }

    getObservationsForPlan = (planId: number, missionId: number) => {
        if (!planId) {
            return Promise.resolve({ observations: [] });
        }
    
        return fetch(`http://test.ideesalter.com/alia_searchObservationsForPlan.php?plan_id=${planId}&mission_id=${missionId}`)
            .then((response) => response.json())
            .then((observations) => {
                // TODO : grouper les observations par coordonnées
                this.observations = observations;
            }
        );
    }

    componentDidMount() {
        this.getPlan(this.props.planId);
        if (this.props.mission) {
            this.getCapteursForPlan(this.props.planId, this.props.mission.id);
            this.getObservationsForPlan(this.props.planId, this.props.mission.id);
        }
    }

    getImageSize = (data: string) => {
        var i = new Image(); 
        i.onload = () => {
            if ( this.width === undefined && this.height === undefined ) {
                this.width = i.width;
                this.height = i.height;
            }
        };
        i.src = data;
    }

    componentDidUpdate() {
        this.masqueLegende();

        var image = d3.select(this.imageRef);

        image.attr('xlink:href', this.planImage)
            .attr('x', 0)
            .attr('y', 0)
            .on('contextmenu', () => {
                d3.event.preventDefault();

                this.showContextMenu();
            });
            this.getImageSize(this.planImage);


        var transitionNewCapteur = d3.transition()
            .duration(3000)
            .ease(d3.easeElastic);

        // TRANSITIONS
        // ============
        // easeElastic
        // easeBounce
        // easeLinear
        // easeSin
        // easeQuad
        // easeCubic
        // easePoly
        // easeCircle
        // easeExp
        // easeBack

        // Capteurs
        d3.select(this.svgRef).selectAll('classCapteur')
            .data(this.capteurs)
            .enter()
            .append('circle')
            .on('mouseover', this.afficheLegendeCapteur)
            .on('mouseout', this.masqueLegende)
            .on('click', (capteur) => {this.openModalCapteur(capteur)})
            .attr('class', 'classCapteur')
            .attr('cx', (capteur) => capteur.coordonneePlanX)
            .attr('cy', (capteur) => capteur.coordonneePlanY)
            .attr('r', 0)
            .attr('stroke', 'black')
            .attr('strokeWidth', 1)
            .attr('fill', 'white')
            .attr('opacity', 0)
            .transition(transitionNewCapteur)
                .attr('r', 10)
                .attr('opacity', 1);

        // Observations
        d3.select(this.svgRef).selectAll('classObservation')
            .data(this.observations)
            .enter()
            .append('circle')
            .on('mouseover', this.afficheLegendeObservation)
            .on('mouseout', this.masqueLegende)
            .on('click', (observation) => {this.openModalObservations(observation)})
            .attr('class', 'classObservation')
            .attr('cx', (observation) => observation.coordonneesPlanX)
            .attr('cy', (observation) => observation.coordonneesPlanY)
            .attr('r', 0)
            .attr('stroke', 'black')
            .attr('strokeWidth', 1)
            .attr('fill', 'white')
            .attr('opacity', 0)
            .transition(transitionNewCapteur)
                .attr('r', 10)
                .attr('opacity', 1);


    }

    openModalCapteur = (capteur: ICapteur) => {
        this.capteurDisplayed = capteur;
        this.modalIsOpen = true;
    }

    openModalObservations = (observation: IObservation) => {
        // console.log(JSON.stringify(observation));
    }

    afterOpenModal = () => {
        // references are now sync'd and can be accessed.
    }

    closeModal = () => {
        this.modalIsOpen = false;
    }

    private afficheLegendeCapteur = (capteur: ICapteur) => {
        let x = parseInt(capteur.coordonneePlanX, 10) + 10;
        let y = parseInt(capteur.coordonneePlanY, 10) - 20;
        let label = capteur.capteur_reference_id;
        this.afficheLegende(x, y, label);
    }

    private afficheLegendeObservation = (observation: IObservation) => {
        // Position relative
        let x = observation.coordonneesPlanX / 100 * this.width;
        let y = observation.coordonneesPlanY / 100 * this.height;
        let label = observation.label;
        this.afficheLegende(x, y, label);
    }

    private afficheLegende = (x: number, y: number, label: string) => {
        console.log(x, y, label)
        x = x + 10;
        y = y - 20;

        let transition = d3.transition()
            .duration(200)
            .ease(d3.easeLinear);

        d3.select(this.gItemLegend)
            .attr('transform', 'translate(' + x + ',' + y + ')')
            .transition(transition)
            .attr('opacity', 1);
        d3.select(this.textItemLegend).text(label);
    }

    private masqueLegende = () => {
        let transition = d3.transition()
            .duration(200)
            .ease(d3.easeLinear);

        d3.select(this.gItemLegend)
            .transition(transition)
            .attr('opacity', 0);
    }

    componentWillMount() {
        ReactModal.setAppElement('body')
    }

    render() {

        return (
            <div className="container">
                <ReactModal  
                    isOpen={this.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    style={customStyles}
                >
                    <GraphBoard
                        globalStore={this.props.globalStore}
                        habitat={this.props.habitat}
                        capteur={this.capteurDisplayed}
                        mission={this.props.mission}
                    />
                    {/* {this.graphContent} */}
                </ReactModal >
                <div className={style(csstips.margin(10))}>
                    <svg ref={(ref) => {this.svgRef = ref}} width={this.width} height={this.height}>
                        <image ref={(ref) => {this.imageRef = ref}} />
                        <g ref={(ref) => {this.gItemLegend = ref}} opacity="0">
                            <rect
                                ref={(ref) => {this.rectItemLegend = ref}} 
                                x="0"
                                y="0"
                                width="100"
                                height="14"
                                fill="green"
                                stroke="black"
                                strokeWidth="1"
                            />
                            <text
                                ref={(ref) => {this.textItemLegend = ref}}
                                x="50"
                                y="7"
                                fontSize="11"
                                textAnchor="middle"
                                alignmentBaseline="middle"
                                fill="black"
                            >
                                capteur
                            </text>
                        </g>
                    </svg>
                </div>
                <div>
                    {/* <PopupboxContainer /> */}
                </div>
            </div>
        );
    }

    private showContextMenu = (): void => {
        // let mouseDate = this.baseChart.timeScaleChart.invert(this.xLastClick);
        // this.newMarkerYValue = this.baseChart.yChart.invert(this.yLastClick);
        let srcElement = d3.event.target || d3.event.srcElement;
        const xLastClick = d3.mouse(srcElement)[0];
        const yLastClick = d3.mouse(srcElement)[1];

        const xPercent = xLastClick * 100 / this.width ;
        const yPercent = yLastClick * 100 / this.height;
        const menu = ( // <div/>
            <Menu>
                <MenuItem text="Capteur virtuel" icon="add" onClick={() => this.addVirtualCapteur(xPercent, yPercent)}/>
                <MenuDivider />
                <MenuItem text="Observation" icon="add" onClick={() => this.addObservation(xPercent, yPercent)}/>
            </Menu>
        );

        // mouse position is available on event
        ContextMenu.show(menu, { left: d3.event.clientX - 20, top: d3.event.clientY - 20}, () => {
            // menu was closed; callback optional
        });
    }

    private addVirtualCapteur = (x: number, y: number) => {
        console.log('+ Capteur virtuel [' + x + ', ' + y + ']' );
    }

    private addObservation = (x: number, y: number) => {
        console.log('+ Capteur observation [' + x + ', ' + y + ']' );
        // http://testbase.ideesalter.com/alia_writeObservation.php?id=3&
        // mission_id=1&
        // plan_id=1&
        // coordonneesPlanX=140&
        // coordonneesPlanY=140&
        // coordonneesPlanZ=0&
        // label=Label%20test&
        // description=Description%20test&
        // dateObservation=2017-12-26%2014:26:00&
        // image=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQ
    }
}
