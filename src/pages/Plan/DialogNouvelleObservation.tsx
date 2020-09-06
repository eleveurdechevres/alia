import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Dialog, InputGroup, FileInput, Button, Intent, Checkbox, TextArea } from '@blueprintjs/core';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
import { IObservation } from '../../interfaces/IObservation';
import { IMission } from 'src/interfaces/IMission';
import ReactDatePicker from 'react-datepicker';

interface IProps {
    mission: IMission;
    planId: number;
    coordonneePlanX: number;
    coordonneePlanY: number;
    isOpen: boolean;
    close: () => void;
    handleAddObservationToMission: (newObservation: IObservation) => void;
}

const dialogLineStyle = style(csstips.margin(10), csstips.flex, csstips.horizontal);
// const dialogFieldNameStyle = style(csstips.width(80), csstips.margin(5, 5));
const dialogFieldValueStyle = style(csstips.flex);

@observer export class DialogNouvelleObservation extends React.Component<IProps, {}> {

    @observable private dateFichier: Date = undefined;
    @observable private useDateFichier: boolean = false;
    @observable private selectedDate: Date = undefined;
    @observable private observationToCreate: IObservation = {
        id: undefined,
        plan_id: undefined,
        mission_id: undefined,
        coordonneePlanX: undefined,
        coordonneePlanY: undefined,
        coordonneePlanZ: undefined,
        label: undefined,
        description: undefined,
        image: undefined,
        dateObservation: undefined
    };

    public constructor(props: IProps) {
        super(props)
    }

    public render() {
        return (
            <Dialog
                autoFocus={true}
                enforceFocus={true}
                usePortal={true}
                canOutsideClickClose={true}
                canEscapeKeyClose={true}
                isOpen={this.props.isOpen}
                title="Nouvelle observation"
                icon="media"
                onClose={this.props.close}
                onOpened={this.initNewObservation}
            >
                <div className={style(csstips.flex, csstips.vertical)}>
                    <div className={dialogLineStyle}>
                        <div className={dialogFieldValueStyle}>
                            <InputGroup
                                leftIcon="citation"
                                placeholder="Label"
                                onChange={(event: any) => { this.observationToCreate.label = event.target.value }}
                            />
                        </div>
                    </div>
                    <div className={dialogLineStyle}>
                        <div className={dialogFieldValueStyle}>
                            <TextArea
                                growVertically={true}
                                large={true}
                                fill={true}
                                intent={Intent.NONE}
                                placeholder="Description"
                                onChange={(event: any) => { this.observationToCreate.description = event.target.value }}
                            />
                            {/* <InputGroup
                                leftIcon="edit"
                                placeholder="Description"
                                onChange={(event: any) => { this.observationToCreate.description = event.target.value }}
                            /> */}
                        </div>
                    </div>
                    <div className={dialogLineStyle}>
                        <div className={dialogFieldValueStyle}>
                            <FileInput
                                className={style(csstips.fillParent)}
                                inputProps={{placeholder: 'Choisissez une image...'}}
                                disabled={false}
                                text={this.observationToCreate.image ? this.observationToCreate.image : 'Choisissez un fichier'}
                                onChange={(event: any) => {
                                    event.preventDefault();
                                    let file: File = event.target.files[0];
                                    this.dateFichier = new Date(file.lastModified);
                                    let fileReader = new FileReader();
                                    fileReader.onload = () => {
                                        this.observationToCreate.image = file.name;
                                    };
                                    fileReader.onerror = () => { console.log('Error reading file')};
                                    fileReader.onloadend = () => { 
                                        this.observationToCreate.image = fileReader.result as string;
                                    }
                                    fileReader.readAsDataURL(file);
                                }}
                            />
                        </div>
                    </div>
                    <div className={dialogLineStyle}>
                        <Checkbox
                            disabled={this.observationToCreate.image === undefined}
                            label="Utiliser la date du fichier"
                            checked={this.useDateFichier && this.observationToCreate.image !== undefined}
                            onChange={() => {
                                this.useDateFichier = !this.useDateFichier;
                                this.computeDateObservation();
                            }}
                        />
                    </div>
                    <div className={dialogLineStyle}>
                        <div className={dialogFieldValueStyle}>
                            <ReactDatePicker
                                disabled={this.useDateFichier}
                                selected={this.observationToCreate.dateObservation}
                                onChange={this.handleChangeDateObservation}
                                minDate={new Date(this.props.mission.date_debut)}
                                maxDate={new Date(this.props.mission.date_fin)}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Date de l'observation"
                                showTimeInput={true}
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
                            onClick={() => {
                                this.props.handleAddObservationToMission(this.observationToCreate);
                            }}
                            disabled={!this.isObservationValide()}
                        />
                    </div>
                </div>
            </Dialog>
        )
    }

    private isObservationValide = (): boolean => {
        return (
            this.observationToCreate.label !== undefined && this.observationToCreate.label !== '' &&
            this.observationToCreate.description !== undefined && this.observationToCreate.description !== '' &&
            this.observationToCreate.image !== undefined &&
            this.observationToCreate.dateObservation !== undefined
        );
    }

    private initNewObservation = () => {
        this.observationToCreate.plan_id = this.props.planId;
        this.observationToCreate.mission_id = this.props.mission.id;
        this.observationToCreate.dateObservation = undefined;
        this.observationToCreate.coordonneePlanX = this.props.coordonneePlanX;
        this.observationToCreate.coordonneePlanY = this.props.coordonneePlanY;
        this.observationToCreate.coordonneePlanZ = 0;
    }

    private handleChangeDateObservation = (date: Date) => {
        this.selectedDate = date;
        this.computeDateObservation();
    }

    private computeDateObservation = (): void => {
        if (this.useDateFichier && this.dateFichier !== undefined) {
            this.observationToCreate.dateObservation = this.dateFichier;
        }
        else if (this.selectedDate !== undefined) {
            this.observationToCreate.dateObservation = this.selectedDate;
        }
    }
}