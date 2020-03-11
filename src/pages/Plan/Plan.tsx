import * as React from 'react';
import * as d3 from 'd3';
// import $ from 'jquery'; 
// import { window } from 'd3-selection';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
import * as ReactModal from 'react-modal';
import { observable, autorun } from 'mobx';
import { observer } from 'mobx-react';
import { ICapteur } from 'src/interfaces/ICapteur';
import { IHabitat } from 'src/interfaces/IHabitat';
import { IMission } from 'src/interfaces/IMission';
import { GlobalStore } from 'src/stores/GlobalStore';
import { ContextMenu, Menu, MenuItem, MenuDivider } from '@blueprintjs/core';
import { IObservation } from 'src/interfaces/IObservation';
import { CapteurForPlan } from './CapteurForPlan';
import { DialogNouvelleObservation } from './DialogNouvelleObservation';
import { ObservationForPlan } from './ObservationForPlan';
import { ModalCapteur } from './ModalCapteur';
import { ModalObservation } from './ModalObservation';
import * as FormatUtils from '../../utils/FormatUtils';

// const transitionNewCapteur = d3.transition()
// .duration(3000)
// .ease(d3.easeElastic);

const legend = {
    width: 100,
    height: 14
}

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
    @observable isModalCapteurOpen: boolean = false;
    @observable isModalObservationOpen: boolean = false;
    @observable capteurDisplayed: ICapteur = undefined;
    @observable observationDisplayed: IObservation = undefined;
    @observable isDialogObservationOpened: boolean = false;

    // private svgRef: SVGGElement;
    private imageRef: SVGGElement;
    private gItemLegend: SVGGElement;
    private textItemLegend: SVGGElement;
    private xLastClickPercent: number = undefined;
    private yLastClickPercent: number = undefined;

    public constructor(props: IProps) {
        super(props);

        autorun(() => {
            if ( this.planImage ) {
                this.forceUpdate();
            }
        });
    }

    private saveLastClick = (observation?: IObservation) => {
        if (observation) {
            this.xLastClickPercent = observation.coordonneesPlanX;
            this.yLastClickPercent = observation.coordonneesPlanY;
        }
        else {
            let srcElement = d3.event.target || d3.event.srcElement;
            const xLastClick = d3.mouse(srcElement)[0];
            const yLastClick = d3.mouse(srcElement)[1];

            this.xLastClickPercent = xLastClick * 100 / this.width ;
            this.yLastClickPercent = yLastClick * 100 / this.height;
        }
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
    
        const req = `http://test.ideesalter.com/alia_searchObservationsForPlan.php?plan_id=${planId}&mission_id=${missionId}`;
        return fetch(req)
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
            this.reloadObservations();
        }
    }

    getImageSize = (data: string) => {
        let i = new Image(); 
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

        let image = d3.select(this.imageRef);

        image.attr('xlink:href', this.planImage)
            .attr('x', 0)
            .attr('y', 0)
            .on('contextmenu', () => {
                d3.event.preventDefault();

                this.showContextMenu();
            });
            this.getImageSize(this.planImage);


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

        // console.log(JSON.stringify(this.capteurs))
        // Capteurs
        // d3.select(this.svgRef).selectAll('classCapteur')
        //     .data(this.capteurs)
        //     .enter()
        //     .append('circle')
        //     .on('mouseover', this.afficheLegendeCapteur)
        //     .on('mouseout', this.masqueLegende)
        //     .on('click', (capteur: ICapteur) => {this.openModalCapteur(capteur)})
        //     .attr('class', 'classCapteur')
        //     .attr('cx', (capteur: ICapteur) => capteur.coordonneePlanX)
        //     .attr('cy', (capteur: ICapteur) => capteur.coordonneePlanY)
        //     // .attr('r', 0)
        //     .attr('stroke', 'black')
        //     .attr('strokeWidth', 1)
        //     .attr('fill', 'white')
        //     // .attr('opacity', 0)
        //     // .transition(transitionNewCapteur)
        //         .attr('r', 10)
        //         .attr('opacity', 1);

        // Observations
        // d3.select(this.svgRef).selectAll('classObservation')
        //     .exit().remove()
        //     .data(this.observations)
        //     .enter()
        //     .append('circle')
        //     .attr('class', 'classObservation')
        //     // .attr('r', 0)
        //     .attr('cx', (observation: IObservation) => observation.coordonneesPlanX * this.width / 100)
        //     .attr('cy', (observation: IObservation) => observation.coordonneesPlanY * this.height / 100)
        //     .attr('stroke', 'black')
        //     .attr('strokeWidth', 1)
        //     .attr('fill', 'blue')
        //     // .on('mouseover', this.afficheLegendeObservation)
        //     // .on('mouseout', this.masqueLegende)
        //     // .on('click', (observation: IObservation) => {this.openModalObservations(observation)})
        //     // .attr('opacity', 0)
        //     // .transition(transitionNewCapteur)
        //         .attr('r', 10)
        //         .attr('opacity', 1);


    }

    openModalCapteur = (capteur: ICapteur) => {
        this.capteurDisplayed = capteur;
        this.isModalCapteurOpen = true;
    }

    openModalObservation = (observation: IObservation) => {
        this.observationDisplayed = observation;
        this.isModalObservationOpen = true;
    }

    afterOpenModal = () => {
        // references are now sync'd and can be accessed.
    }

    closeModalCapteur = () => {
        this.isModalCapteurOpen = false;
        this.capteurDisplayed = undefined;
    }

    closeModalObservation = () => {
        this.isModalObservationOpen = false;
        this.observationDisplayed = undefined;
    }

    // private afficheLegendeCapteur = (capteur: ICapteur) => {
    //     let x = capteur.coordonneePlanX + 10;
    //     let y = capteur.coordonneePlanY - 20;
    //     let label = capteur.capteur_reference_id;
    //     this.afficheLegende(x, y, label);
    // }

    // private afficheLegendeObservation = (observation: IObservation) => {
    //     // Position relative
    //     let x = observation.coordonneesPlanX / 100 * this.width;
    //     let y = observation.coordonneesPlanY / 100 * this.height;
    //     let label = observation.label;
    //     this.afficheLegende(x, y, label);
    // }

    private afficheLegende = (x: number, y: number, label: string) => {
        let xDecalage = 10;
        let yDecalage = 10;
        if ( x > this.width / 2 ) {
            x = x - legend.width - xDecalage;
        }
        else {
            x = x + xDecalage;
        }
        if ( y > this.height / 2 ) {
            y = y - legend.height - yDecalage;
        }
        else {
            y = y + yDecalage;
        }
        let transition = d3.transition()
            .duration(100)
            .ease(d3.easeLinear);

        d3.select(this.gItemLegend)
            .transition(transition)
            .attr('transform', 'translate(' + x + ',' + y + ')')
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
                {
                    this.props.mission ? 
                        <DialogNouvelleObservation
                            isOpen={this.isDialogObservationOpened}
                            close={() => {
                                this.hideAddObservationModal();
                            }}
                            coordonneesPlanX={this.xLastClickPercent}
                            coordonneesPlanY={this.yLastClickPercent}
                            mission={this.props.mission}
                            planId={this.props.planId}
                            handleAddObservationToMission={this.writeObservation}
                        />
                    : <React.Fragment/>
                }
                <ModalCapteur
                    label={this.capteurDisplayed ? this.capteurDisplayed.capteur_reference_id : 'Capteur'}
                    isOpen={this.isModalCapteurOpen}
                    onClose={this.closeModalCapteur}

                    capteur={this.capteurDisplayed}
                    globalStore={this.props.globalStore}
                    habitat={this.props.habitat}
                    mission={this.props.mission}
                    planId={this.props.planId}
                />
                <ModalObservation
                    label={this.observationDisplayed ? this.observationDisplayed.label + ' (' + FormatUtils.dateForGui(new Date(this.observationDisplayed.dateObservation)) + ')' : 'Observation'}
                    isOpen={this.isModalObservationOpen}
                    onClose={this.closeModalObservation}

                    observation={this.observationDisplayed}
                />
                <div className={style(csstips.margin(10))}>
                    <svg width={this.width} height={this.height}>
                    {/* <svg ref={(ref) => {this.svgRef = ref}} width={this.width} height={this.height}> */}
                        <image ref={(ref) => {this.imageRef = ref}} />
                        {
                            this.props.mission ? 
                                this.capteurs.map((capteur: ICapteur) => {
                                    let x = capteur.coordonneePlanX * this.width / 100;
                                    let y = capteur.coordonneePlanY * this.height / 100;
                                    return <CapteurForPlan
                                        key={capteur.id}
                                        capteur={capteur}
                                        x={x}
                                        y={y}
                                        onClick={() => this.openModalCapteur(capteur)}
                                        onMouseOver={() => this.afficheLegende(x, y, capteur.capteur_reference_id)}
                                        onMouseOut={() => this.masqueLegende()}
                                    />
                                })
                            : <React.Fragment/>
                        }
                        {
                            this.props.mission ? 
                                this.observations.map((observation: IObservation) => {
                                    let x = observation.coordonneesPlanX * this.width / 100;
                                    let y = observation.coordonneesPlanY * this.height / 100;
                                    return <ObservationForPlan
                                        key={observation.id}
                                        observation={observation}
                                        x={x}
                                        y={y}
                                        onClick={() => this.openModalObservation(observation)}
                                        onRightClick={this.showContextMenu}
                                        onMouseOver={() => this.afficheLegende(x, y, observation.label)}
                                        onMouseOut={() => this.masqueLegende()}
                                    />
                                })
                            : <React.Fragment/>
                        }
                        <g ref={(ref) => {this.gItemLegend = ref}} opacity="0">
                            <rect
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

    private showContextMenu = (observation?: IObservation): void => {
        // let mouseDate = this.baseChart.timeScaleChart.invert(this.xLastClick);
        // this.newMarkerYValue = this.baseChart.yChart.invert(this.yLastClick);
        this.saveLastClick(observation);

        const menu = this.props.mission ? ( // <div/>
            <Menu>
                {
                    observation === undefined ?
                    [
                        <MenuItem key={'contextMenuCapteurVirtuelMenuItem'} text="Capteur virtuel" icon="add" onClick={() => this.showAddVirtualCapteurModal()}/>,
                        <MenuDivider key={'contextMenuDivider1'} />
                    ]
                    :
                    <React.Fragment/>
                }
                <MenuItem text="Observation" icon="add" onClick={() => this.showAddObservationModal()}/>
            </Menu>
        ) : <React.Fragment/>;

        // mouse position is available on event
        ContextMenu.show(menu, { left: d3.event.clientX - 20, top: d3.event.clientY - 20}, () => {
            // menu was closed; callback optional
        });
    }

    private showAddVirtualCapteurModal = () => {
        console.log('+ Capteur virtuel [' + this.xLastClickPercent + ', ' + this.yLastClickPercent + ']' );
    }

    private showAddObservationModal = () => {
        this.isDialogObservationOpened = true;
    }

    private hideAddObservationModal = () => {
        this.isDialogObservationOpened = false;
    }

    public writeObservation = (observation: IObservation) => {
        // let req = 'http://testbase.ideesalter.com/alia_writeObservation.php?id=3&' + 
        // '&mission_id=' + this.props.mission.id + 
        // '&plan_id=' + this.props.planId + 
        // '&coordonneesPlanX=' + this.xLastClickPercent + 
        // '&coordonneesPlanY=' + this.yLastClickPercent +
        // '&coordonneesPlanZ=0' + 
        // '&label=' + observation.label
        // '&description=' + observation.description
        // '&dateObservation=' + observation.dateObservation
        // '&image=' + observation.image;
        // console.log(req);
        // console.log(observation.image)

        fetch(`http://testbase.ideesalter.com/alia_writeObservation.php`, {
                method: 'post',
                headers: {
                //     'Access-Control-Allow-Origin:': '*',
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({
                    mission_id: observation.mission_id,
                    plan_id: observation.plan_id,
                    coordonneesPlanX: observation.coordonneesPlanX,
                    coordonneesPlanY: observation.coordonneesPlanY,
                    coordonneesPlanZ: observation.coordonneesPlanZ,
                    label: observation.label,
                    description: observation.description,
                    dateObservation: observation.dateObservation,
                    image: observation.image
                })
            }
        ).then((response) => {
                if (response.status === 200) {
                    this.reloadObservations()
                } else {
                    console.log(response);
                    // TODO : impossible de sauvegarder...
            }
        });
        this.hideAddObservationModal();

        // let req = 'http://testbase.ideesalter.com/alia_writeObservation.php?id=3&' + 
        // '&mission_id=' + this.props.mission.id + 
        // '&plan_id=' + this.props.planId + 
        // '&coordonneesPlanX=' + this.xLastClickPercent + 
        // '&coordonneesPlanY=' + this.yLastClickPercent +
        // '&coordonneesPlanZ=0' + 
        // '&label=Label%20test' + 
        // '&description=Description%20test' +
        // '&dateObservation=2017-12-26%2014:26:00' +
        // '&image=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQ';
        // console.log(req);
    }

    private reloadObservations() {
        this.getObservationsForPlan(this.props.planId, this.props.mission.id);
    }
}
