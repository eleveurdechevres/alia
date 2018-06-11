import * as React from 'react';
import * as d3 from 'd3';
// import $ from 'jquery'; 
// import { window } from 'd3-selection';
import * as ReactModal from 'react-modal';
import { GraphBoard } from '../Graph/GraphBoard';
import { observable, autorun } from 'mobx';
import { observer } from 'mobx-react';
import { ICapteur } from 'src/interfaces/ICapteur';
import { IHabitat } from 'src/interfaces/IHabitat';
import { IMission } from 'src/interfaces/IMission';

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
    habitat: IHabitat;
    id: number;
    mission: IMission;
}

@observer export class Plan extends React.Component<IProps, {}> {

    // Text Alignment : http://apike.ca/prog_svg_text_style.html
    // Display values on mouseover : https://bl.ocks.org/mbostock/3902569

    planId: number;
    missionId: number;
    @observable planImage: string = undefined;
    @observable width: number = undefined;
    @observable height: number = undefined;
    @observable capteurs: ICapteur[] = [];
    @observable modalIsOpen: boolean = false;
    @observable capteurDisplayed: ICapteur = undefined;

    svgRef: SVGGElement;
    imageRef: SVGGElement;
    gCapteurLegend: SVGGElement;
    rectCapteurLegend: SVGGElement;
    textCapteurLegend: SVGGElement;

    constructor(props: IProps) {
        super(props);

        this.planId = props.id;
        this.missionId = props.mission.id;

        autorun(() => {
            if ( this.planImage ) {
                this.forceUpdate();
            }
        });
    }

    getPlan = (id: number) => {
        if (!id) {
            return Promise.resolve({ plans: [] });
        }
        var request = `http://test.ideesalter.com/alia_afficheImagePlan.php?id=${this.planId}`;
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

    componentDidMount() {
        this.getPlan(this.planId);
        this.getCapteursForPlan(this.planId, this.missionId);
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
        this.masqueLegendeCapteur();

        var image = d3.select(this.imageRef);

        image.attr('xlink:href', this.planImage)
            .attr('x', 0)
            .attr('y', 0);
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

        d3.select(this.svgRef).selectAll('circle')
            .data(this.capteurs)
            .enter()
            .append('circle')
            .on('mouseover', this.afficheLegendeCapteur)
            .on('mouseout', this.masqueLegendeCapteur)
            .on('click', (capteur) => {this.openModal(capteur)})
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
    }

    openModal = (capteur: ICapteur) => {
        this.capteurDisplayed = capteur;
        this.modalIsOpen = true;
    }

    afterOpenModal = () => {
        // references are now sync'd and can be accessed.
    }

    closeModal = () => {
        this.modalIsOpen = false;
    }

    afficheLegendeCapteur = (capteur: ICapteur) => {
        var x = parseInt(capteur.coordonneePlanX, 10) + 10;
        var y = parseInt(capteur.coordonneePlanY, 10) - 20;

        var transition = d3.transition()
            .duration(200)
            .ease(d3.easeLinear);

        d3.select(this.gCapteurLegend)
            .attr('transform', 'translate(' + x + ',' + y + ')')
            .transition(transition)
            .attr('opacity', 1);
        d3.select(this.textCapteurLegend).text(capteur.capteur_reference_id);
    }

    masqueLegendeCapteur = () => {
        var transition = d3.transition()
            .duration(200)
            .ease(d3.easeLinear);

        d3.select(this.gCapteurLegend)
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
                    <GraphBoard habitat={this.props.habitat} capteur={this.capteurDisplayed} mission={this.props.mission} />
                    {/* {this.graphContent} */}
                </ReactModal >
                <svg ref={(ref) => {this.svgRef = ref}} width={this.width} height={this.height}>
                    <image ref={(ref) => {this.imageRef = ref}} />
                    <g ref={(ref) => {this.gCapteurLegend = ref}} opacity="0">
                        <rect
                            ref={(ref) => {this.rectCapteurLegend = ref}} 
                            x="0"
                            y="0"
                            width="100"
                            height="14"
                            fill="white"
                            stroke="black"
                            strokeWidth="1"
                        />
                        <text
                            ref={(ref) => {this.textCapteurLegend = ref}}
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
                <div>
                    {/* <PopupboxContainer /> */}
                </div>
            </div>
        );
    }
}
