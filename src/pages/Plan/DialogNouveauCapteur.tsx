import * as React from 'react';
import { observable, computed } from 'mobx';
import { observer } from 'mobx-react';
import { Dialog, InputGroup, Button, Intent, TextArea, Checkbox } from '@blueprintjs/core';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
import { ICapteurForMission } from '../../interfaces/ICapteurForMission';
import { IMission } from 'src/interfaces/IMission';
import { GlobalStore } from 'src/stores/GlobalStore';
import { MultiTypeMesureListSelector } from './MultiTypeMesureListSelector';
import { ITypeMesure } from 'src/interfaces/ITypeMesure';
import * as d3 from 'd3';
import { ScaleOrdinal } from 'd3';
import { AvailableCapteurTable } from './AvailableCapteurs';

interface IProps {
    globalStore: GlobalStore,
    mission: IMission;
    planId: number;
    coordonneePlanX: number;
    coordonneePlanY: number;
    isOpen: boolean;
    close: () => void;
    handleAddCapteurToMission: (newCapteur: ICapteurForMission) => void;
}

const dialogLineStyle = style(csstips.margin(10), csstips.flex, csstips.horizontal);
// const dialogFieldNameStyle = style(csstips.width(80), csstips.margin(5, 5));
const dialogFieldValueStyle = style(csstips.flex);

@observer export class DialogNouveauCapteur extends React.Component<IProps, {}> {

    private zColors: ScaleOrdinal<string, string> = d3.scaleOrdinal(d3.schemeCategory10);
    
    @observable private descriptionMissionRowToAdd: ICapteurForMission = {
        mission_id: undefined,
        capteur_id: undefined,
        plan_id: undefined,
        coordonneePlanX: undefined,
        coordonneePlanY: undefined,
        coordonneePlanZ: undefined,
        label: undefined,
        description: undefined
    };

    @observable private isOnlyAvailableCapteurs: boolean = true;
    @observable private availableCapteurs: IAvailableCapteur[] = [];
    @observable private selectedCapteur: IAvailableCapteur = undefined;
    @observable private selectedTypeMesureList: ITypeMesure[] = [];

    @computed get filteredCapteurs(): IAvailableCapteur[] {
        // TODO : filtrer les capteurs par type de mesure (le remonter de la DB pour ça !)
        return this.availableCapteurs.filter((capteur: IAvailableCapteur) => true);
    }

    public constructor(props: IProps) {
        super(props)
    }

    public componentDidMount(): void {
        this.props.globalStore.getAvailableCapteurs(new Date(this.props.mission.date_debut), new Date(this.props.mission.date_fin)).then(
            (capteurs: IAvailableCapteur[]) => {
                this.availableCapteurs = capteurs;
            }
        )
    }


    public render() {
        return (
            <Dialog
                style={csstips.width(800)}
                autoFocus={true}
                enforceFocus={true}
                usePortal={true}
                canOutsideClickClose={true}
                canEscapeKeyClose={true}
                isOpen={this.props.isOpen}
                title="Ajouter un capteur à la mission"
                icon="manually-entered-data"
                onClose={this.props.close}
                onOpened={this.initNewCapteur}
            >
                <div className={style(csstips.flex, csstips.vertical)}>
                    <div className={dialogLineStyle}>
                        <div className={dialogFieldValueStyle}>
                            <InputGroup
                                className={style(csstips.width('100%'))}
                                leftIcon="citation"
                                placeholder="Label"
                                onChange={(event: any) => { this.descriptionMissionRowToAdd.label = event.target.value }}
                            />
                        </div>
                    </div>
                    <div className={dialogLineStyle}>
                        <div className={dialogFieldValueStyle}>
                            <TextArea
                                className={style({ height: '400px' })}
                                growVertically={true}
                                
                                fill={true}
                                large={true}
                                intent={Intent.NONE}
                                placeholder="Description"
                                onChange={(event: any) => { this.descriptionMissionRowToAdd.description = event.target.value }}
                            />
                        </div>
                    </div>
                    <div className={dialogLineStyle}>
                        <div className={dialogFieldValueStyle}>
                            <Checkbox
                                label="Capteurs disponibles"
                                checked={this.isOnlyAvailableCapteurs}
                                onChange={() => {
                                    this.isOnlyAvailableCapteurs = !this.isOnlyAvailableCapteurs;
                                }}
                            />
                        </div>
                    </div>
                    <div className={dialogLineStyle}>
                        <div className={dialogFieldValueStyle}>
                            <MultiTypeMesureListSelector
                                globalStore={this.props.globalStore}
                                selectedTypeMesureList={this.selectedTypeMesureList}
                                handleAddTypeMesure={this.addTypeMesureToFilter}
                                handleRemoveTypeMesure={this.removeTypeMesureToFilter}
                                legendColorgenerator={this.legendColorGenerator}
                            />
                        </div>
                    </div>
                    <div className={dialogLineStyle}>
                        <div className={dialogFieldValueStyle}>
                            <AvailableCapteurTable
                                globalStore={this.props.globalStore}
                                dateDebut={new Date(this.props.mission.date_debut)}
                                dateFin={new Date(this.props.mission.date_fin)}
                                filteredCapteurs={this.filteredCapteurs}
                                selectedCapteur={this.selectedCapteur}
                                handleSelectCapteur={(capteur: IAvailableCapteur) => { this.selectedCapteur = capteur; }}
                            />
                        </div>
                    </div>
                    <div className={style(csstips.horizontal, csstips.flex)}>
                        <Button
                            className={style(csstips.margin(10), csstips.flex)}
                            intent={Intent.NONE}
                            text="Annuler"
                            onClick={this.props.close}
                        />
                        <Button
                            className={style(csstips.margin(10), csstips.flex)}
                            intent={Intent.PRIMARY}
                            icon="add"
                            text="Créer"
                            onClick={() => { this.props.handleAddCapteurToMission(this.descriptionMissionRowToAdd); }}
                            disabled={!this.isCapteurValide()}
                        />
                    </div>
                </div>
            </Dialog>
        )
    }

    private addTypeMesureToFilter = (typeMesure: ITypeMesure) => {
        if (this.selectedTypeMesureList.find((tm: ITypeMesure) => tm.id === typeMesure.id) === undefined) {
            this.selectedTypeMesureList.push(typeMesure);
        }
    }

    private removeTypeMesureToFilter = (typeMesure: ITypeMesure) => {
        let index = this.selectedTypeMesureList.findIndex((tm: ITypeMesure) => tm.id === typeMesure.id);
        if (index !== -1) {
            this.selectedTypeMesureList.splice(index, 1);
        }
    }

    private initNewCapteur = () => {
        this.descriptionMissionRowToAdd.plan_id = this.props.planId;
        this.descriptionMissionRowToAdd.mission_id = this.props.mission.id;
        this.descriptionMissionRowToAdd.coordonneePlanX = this.props.coordonneePlanX;
        this.descriptionMissionRowToAdd.coordonneePlanY = this.props.coordonneePlanY;
        this.descriptionMissionRowToAdd.coordonneePlanZ = 0;
    }

    private isCapteurValide = (): boolean => {
        return (
            this.descriptionMissionRowToAdd.label !== undefined && this.descriptionMissionRowToAdd.label !== '' &&
            this.descriptionMissionRowToAdd.description !== undefined && this.descriptionMissionRowToAdd.description !== ''
        );
    }

    private legendColorGenerator = (legend: string) => {
        return this.zColors(legend)
    }
}