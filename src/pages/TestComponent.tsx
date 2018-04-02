import * as React from 'react';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips'; 
import { SunBehaviour } from 'src/pages/Graph/Channel/SunBehaviour';
import { SunBehaviourManager } from 'src/managers/SunBehaviourManager';
import { IHabitat } from 'src/interfaces/IHabitat';
import { NumericInput } from '@blueprintjs/core'
import '@blueprintjs/core/lib/css/blueprint.css';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

interface IProps {
}

@observer export class TestComponent extends React.Component {

    sunBehaviourManager: SunBehaviourManager;
    @observable crossHairTime: undefined;

    @observable humidite: number = undefined;
    @observable directionVent: number = undefined;
    @observable vitesseVent: number = undefined;

    refSunBehaviour: SVGSVGElement;
    center: HTMLElement;
    
    constructor(props: IProps) {
        super(props);
        let habitat: IHabitat = {
            id: 1,
            client_id: 1,
            adresse: 'adresse mauves',
            gps_elevation: 17,
            gps_lattitude: 47.2938326,
            gps_longitude: -1.3897073,
        }
        let startDate =  new Date('2017-12-20');
        let stopDate =  new Date('2017-12-24');
        this.sunBehaviourManager = new SunBehaviourManager(habitat, startDate, stopDate);
    }

    render() {
        return (
            <div className={style(csstips.flex, csstips.vertical)}>
                <div>
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    Humidité
                                </td>
                                <td>
                                    <NumericInput
                                        stepSize={1}
                                        // labelStepSize={100}
                                        value={this.humidite}
                                        min={0}
                                        max={360}
                                        onValueChange={(humidite) => {this.humidite = humidite}}
                                    />
                                </td>
                                <td>%</td>
                            </tr>
                            <tr>
                                <td>
                                    Direction Vent
                                </td>
                                <td>
                                    <NumericInput
                                        stepSize={1}
                                        // labelStepSize={100}
                                        value={this.directionVent}
                                        min={0}
                                        max={360}
                                        onValueChange={(directionVent) => {this.directionVent = directionVent}}
                                    />
                            </td>
                                <td>°</td>
                            </tr>
                            <tr>
                                <td>
                                    Vitesse Vent
                                </td>
                                <td>
                                    <NumericInput
                                        stepSize={1}
                                        // labelStepSize={100}
                                        value={this.vitesseVent}
                                        min={0}
                                        max={360}
                                        onValueChange={(vitesseVent) => {this.vitesseVent = vitesseVent}}
                                    />
                                </td>
                                <td>km/h</td>
                            </tr>
                        </tbody>
                    </table>
                </div>    
                <div className={style(csstips.flex, csstips.fillParent)}>
                    <SunBehaviour
                        sunBehaviourManager={this.sunBehaviourManager}
                        time={new Date()}
                        humidite={this.humidite}
                        directionVent={this.directionVent}
                        vitesseVent={this.vitesseVent}
                    />
                </div>
            </div>
        );
    }
}
