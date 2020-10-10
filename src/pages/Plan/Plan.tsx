import * as React from 'react';
import * as d3 from 'd3';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
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
import { DialogNouveauCapteurVirtuel } from './DialogNouveauCapteurVirtuel';
import { ObservationForPlan } from './ObservationForPlan';
import { CapteurVirtuelForPlan } from './CapteurVirtuelForPlan';
import { ModalObservation } from './ModalObservation';
import { ICapteurVirtuel } from 'src/interfaces/ICapteurVirtuel';
import { ILocalizable } from 'src/interfaces/ILocalizable';
import { ModalCapteurVirtuel } from './ModalCapteurVirtuel';
import { ModalCapteur } from './ModalCapteur';

// const transitionNewCapteur = d3.transition()
// .duration(3000)
// .ease(d3.easeElastic);

const legend = {
    width: 100,
    height: 20
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
    @observable capteursVirtuels: ICapteurVirtuel[] = [];
    @observable observations: IObservation[] = [];
    @observable isModalCapteurOpen: boolean = false;
    @observable isModalObservationOpen: boolean = false;
    @observable isModalCapteurVirtuelOpen: boolean = false;

    @observable capteurDisplayed: ICapteur = undefined;
    @observable observationDisplayed: IObservation = undefined;
    @observable capteurVirtuelDisplayed: ICapteurVirtuel = undefined;

    @observable isDialogObservationOpened: boolean = false;
    @observable isDialogCapteurVirtuelOpened: boolean = false;
    
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

    public componentDidMount() {
        this.getPlan(this.props.planId);
        if (this.props.mission) {
            this.getCapteursForPlan(this.props.planId, this.props.mission.id);
            this.reloadObservations();
            this.reloadCapteursVirtuels();
        }
    }

    public componentDidUpdate() {
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

    public render() {
        return (
            <div className="container">
                {
                    this.props.mission ? 
                        <DialogNouveauCapteurVirtuel
                            isOpen={this.isDialogCapteurVirtuelOpened}
                            close={() => {
                                this.hideAddVirtualCapteurModal();
                            }}
                            coordonneePlanX={this.xLastClickPercent}
                            coordonneePlanY={this.yLastClickPercent}
                            mission={this.props.mission}
                            planId={this.props.planId}
                            handleAddCapteurVirtuelToMission={this.handleAddCapteurVirtuelToMission}
                        />
                    : <React.Fragment/>
                }
                {
                    this.props.mission ? 
                        <DialogNouvelleObservation
                            isOpen={this.isDialogObservationOpened}
                            close={() => {
                                this.hideAddObservationModal();
                            }}
                            coordonneePlanX={this.xLastClickPercent}
                            coordonneePlanY={this.yLastClickPercent}
                            mission={this.props.mission}
                            planId={this.props.planId}
                            handleAddObservationToMission={this.handleAddObservationToMission}
                        />
                    : <React.Fragment/>
                }
                <ModalCapteurVirtuel
                    isOpen={this.isModalCapteurVirtuelOpen}
                    onClose={this.closeModalCapteurVirtuel}
                    capteurVirtuel={this.capteurVirtuelDisplayed}
                    mission={this.props.mission}
                    globalStore={this.props.globalStore}
                />
                <ModalObservation
                    isOpen={this.isModalObservationOpen}
                    onClose={this.closeModalObservation}

                    observation={this.observationDisplayed}
                />
                <ModalCapteur
                    isOpen={this.isModalCapteurOpen}
                    onClose={this.closeModalCapteur}
                    capteur={this.capteurDisplayed}
                    globalStore={this.props.globalStore}
                    habitat={this.props.habitat}
                    mission={this.props.mission}
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
                                        onMouseOver={() => this.afficheLegende(x, y, 'Capteur [' + capteur.capteur_reference_id + ']')}
                                        onMouseOut={() => this.masqueLegende()}
                                    />
                                })
                            : <React.Fragment/>
                        }
                        {
                            this.props.mission ? 
                                this.capteursVirtuels.map((capteurVirtuel: ICapteurVirtuel) => {
                                    let x = capteurVirtuel.coordonneePlanX * this.width / 100;
                                    let y = capteurVirtuel.coordonneePlanY * this.height / 100;
                                    return <CapteurVirtuelForPlan
                                        key={capteurVirtuel.id}
                                        capteurVirtuel={capteurVirtuel}
                                        x={x}
                                        y={y}
                                        onClick={() => this.openModalCapteurVirtuel(capteurVirtuel)}
                                        onRightClick={this.showContextMenu}
                                        onMouseOver={() => this.afficheLegende(x, y, 'Capteur virtuel [' + capteurVirtuel.label + ']')}
                                        onMouseOut={() => this.masqueLegende()}
                                    />
                                })
                            : <React.Fragment/>
                        }
                        {
                            this.props.mission ? 
                                this.observations.map((observation: IObservation) => {
                                    let x = observation.coordonneePlanX * this.width / 100;
                                    let y = observation.coordonneePlanY * this.height / 100;
                                    return <ObservationForPlan
                                        key={observation.id}
                                        observation={observation}
                                        x={x}
                                        y={y}
                                        onClick={() => this.openModalObservation(observation)}
                                        onRightClick={this.showContextMenu}
                                        onMouseOver={() => this.afficheLegende(x, y, 'Observation [' + observation.label + ']')}
                                        onMouseOut={() => this.masqueLegende()}
                                    />
                                })
                            : <React.Fragment/>
                        }
                        <g
                            ref={(ref) => {this.gItemLegend = ref}}
                            opacity="0"
                            pointerEvents="none"
                        >
                            <rect
                                x="0"
                                y="0"
                                rx="3"
                                ry="3"
                                // width={legend.width}
                                height={legend.height}
                                fill="#2485C1"
                                stroke="#1F5A7F"
                                strokeWidth="1"
                            />
                            <text
                                ref={(ref) => {this.textItemLegend = ref}}
                                // x={legend.width / 2}
                                y={legend.height / 2}
                                fontSize="11"
                                textAnchor="middle"
                                alignmentBaseline="middle"
                                fill="white"
                            />
                        </g>
                    </svg>
                </div>
                <div>
                    {/* <PopupboxContainer /> */}
                </div>
            </div>
        );
    }

    private saveLastClick = (localizableItem?: ILocalizable) => {
        if (localizableItem) {
            this.xLastClickPercent = localizableItem.coordonneePlanX;
            this.yLastClickPercent = localizableItem.coordonneePlanY;
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

    private getCapteursForPlan = (planId: number, missionId: number) => {
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

    private getCapteursVirtuelsForPlan = (planId: number, missionId: number) => {
        if (!planId) {
            return Promise.resolve({ capteurs: [] });
        }
    
        let request = `http://test.ideesalter.com/alia_searchCapteursVirtuelsForPlan.php?plan_id=${planId}&mission_id=${missionId}`;
        return fetch(request)
            .then((response) => response.json())
            .then((capteursVirtuels) => {
                this.capteursVirtuels = capteursVirtuels;
            }
        );
    }

    private getObservationsForPlan = (planId: number, missionId: number) => {
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

    private getImageSize = (data: string) => {
        let i = new Image(); 
        i.onload = () => {
            if ( this.width === undefined && this.height === undefined ) {
                this.width = i.width;
                this.height = i.height;
            }
        };
        i.src = data;
    }


    private openModalCapteur = (capteur: ICapteur) => {
        this.isModalCapteurOpen = true;
        this.capteurDisplayed = capteur;
    }

    private closeModalCapteur = () => {
        this.isModalCapteurOpen = false;
        this.capteurDisplayed = undefined;
    }

    private openModalObservation = (observation: IObservation) => {
        this.isModalObservationOpen = true;
        this.observationDisplayed = observation;
    }

    private closeModalObservation = () => {
        this.isModalObservationOpen = false;
        this.observationDisplayed = undefined;
    }

    private openModalCapteurVirtuel = (capteurVirtuel: ICapteurVirtuel) => {
        this.isModalCapteurVirtuelOpen = true;
        this.capteurVirtuelDisplayed = capteurVirtuel;
    }

    private closeModalCapteurVirtuel = () => {
        this.isModalCapteurVirtuelOpen = false;
        this.capteurVirtuelDisplayed = undefined;
    }

    private afficheLegende = (x: number, y: number, label: string) => {
        let xDecalage = 10;
        let yDecalage = 10;
        const legendWidth = label.length * 8;
        if ( x > this.width / 2 ) {
            x = x - legendWidth - xDecalage;
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

        d3.select(this.gItemLegend).select('rect')
            .attr('width', legendWidth)
        d3.select(this.gItemLegend).select('text')
            .attr('x', legendWidth / 2)
        d3.select(this.textItemLegend).text(label);
        d3.select(this.gItemLegend)
            .transition(transition)
            .attr('transform', 'translate(' + x + ',' + y + ')')
            .attr('opacity', 1);
    }

    private masqueLegende = () => {
        let transition = d3.transition()
            .duration(200)
            .ease(d3.easeLinear);

        d3.select(this.gItemLegend)
            .transition(transition)
            .attr('opacity', 0);
    }


    private showContextMenu = (item?: ILocalizable): void => {
        // let mouseDate = this.baseChart.timeScaleChart.invert(this.xLastClick);
        // this.newMarkerYValue = this.baseChart.yChart.invert(this.yLastClick);
        this.saveLastClick(item);

        const menu = this.props.mission ? ( // <div/>
            <Menu>
                {
                    item === undefined ?
                    [
                        <MenuItem key={'contextMenuCapteurVirtuelMenuItem'} text="Capteur virtuel" icon="add" onClick={() => this.showAddVirtualCapteurModal()}/>,
                        <MenuDivider key={'contextMenuDivider1'} />,
                        <MenuItem key={'contextMenuObservationMenuItem'} text="Observation" icon="add" onClick={() => this.showAddObservationModal()}/>
                    ]
                    :
                    <React.Fragment/>
                }
            </Menu>
        ) : <React.Fragment/>;

        // mouse position is available on event
        if (item === undefined) {
            ContextMenu.show(menu, { left: d3.event.clientX - 20, top: d3.event.clientY - 20}, () => {
                // menu was closed; callback optional
            });
        }
    }

    private showAddVirtualCapteurModal = () => {
        this.isDialogCapteurVirtuelOpened = true;
    }

    private hideAddVirtualCapteurModal = () => {
        this.isDialogCapteurVirtuelOpened = false;
    }

    private showAddObservationModal = () => {
        this.isDialogObservationOpened = true;
    }

    private hideAddObservationModal = () => {
        this.isDialogObservationOpened = false;
    }

    
    private handleAddCapteurVirtuelToMission = (capteurVirtuel: ICapteurVirtuel) => {
        this.props.globalStore.writeCapteurVirtuel(capteurVirtuel, this.reloadCapteursVirtuels);
        this.hideAddVirtualCapteurModal();
    }

    private handleAddObservationToMission = (observation: IObservation) => {
        this.props.globalStore.writeObservation(observation, this.reloadObservations);
        this.hideAddObservationModal();    }

    private reloadObservations = () => {
        this.getObservationsForPlan(this.props.planId, this.props.mission.id);
    }

    private reloadCapteursVirtuels = () => {
        this.getCapteursVirtuelsForPlan(this.props.planId, this.props.mission.id);
    }
}
