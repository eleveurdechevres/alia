import * as React from 'react';
import { observable, autorun } from 'mobx';
import { observer } from 'mobx-react';
import { Dialog, InputGroup, Button, Intent, TextArea } from '@blueprintjs/core';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
import { ICapteurVirtuel } from '../../interfaces/ICapteurVirtuel';
import { IMission } from 'src/interfaces/IMission';
import { TypeMesureSelector } from '../../components/TypeMesureSelector';
import { ITypeMesure } from 'src/interfaces/ITypeMesure';

interface IProps {
    mission: IMission;
    planId: number;
    coordonneePlanX: number;
    coordonneePlanY: number;
    isOpen: boolean;
    close: () => void;
    handleAddCapteurVirtuelToMission: (newCapteur: ICapteurVirtuel) => void;
}

const dialogLineStyle = style(csstips.margin(10), csstips.flex, csstips.horizontal);
// const dialogFieldNameStyle = style(csstips.width(80), csstips.margin(5, 5));
const dialogFieldValueStyle = style(csstips.flex);

@observer export class DialogNouveauCapteurVirtuel extends React.Component<IProps, {}> {

    @observable private capteurVirtuelToCreate: ICapteurVirtuel = {
        id: undefined,
        plan_id: undefined,
        mission_id: undefined,
        coordonneePlanX: undefined,
        coordonneePlanY: undefined,
        coordonneePlanZ: undefined,
        label: undefined,
        description: undefined,
        type_mesure: undefined
    };

    @observable private typeMesure: ITypeMesure = undefined;

    public constructor(props: IProps) {
        super(props)

        autorun(() => {
            if (this.typeMesure) {
                this.capteurVirtuelToCreate.type_mesure = this.typeMesure.id;
                console.log('autorun ', this.typeMesure)
            }
        });
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
                title="Nouveau capteur virtuel"
                icon="manually-entered-data"
                onClose={this.props.close}
                onOpened={this.initNewCapteurVirtuel}
            >
                <div className={style(csstips.flex, csstips.vertical)}>
                    <div className={dialogLineStyle}>
                        <div className={dialogFieldValueStyle}>
                            <InputGroup
                                className={style(csstips.width('100%'))}
                                leftIcon="citation"
                                placeholder="Label"
                                onChange={(event: any) => { this.capteurVirtuelToCreate.label = event.target.value }}
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
                                onChange={(event: any) => { this.capteurVirtuelToCreate.description = event.target.value }}
                            />
                        </div>
                    </div>
                    <div className={dialogLineStyle}>
                        <div className={dialogFieldValueStyle}>
                            <TypeMesureSelector
                                typeMesure={this.typeMesure}
                                handleSelectTypeMesure={(typeMesure: ITypeMesure) => {
                                    this.typeMesure = typeMesure
                                }}
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
                            onClick={() => { this.props.handleAddCapteurVirtuelToMission(this.capteurVirtuelToCreate); }}
                            disabled={!this.isCapteurValide()}
                        />
                    </div>
                </div>
            </Dialog>
        )
    }

    private initNewCapteurVirtuel = () => {
        this.capteurVirtuelToCreate.plan_id = this.props.planId;
        this.capteurVirtuelToCreate.mission_id = this.props.mission.id;
        this.capteurVirtuelToCreate.coordonneePlanX = this.props.coordonneePlanX;
        this.capteurVirtuelToCreate.coordonneePlanY = this.props.coordonneePlanY;
        this.capteurVirtuelToCreate.coordonneePlanZ = 0;
    }

    private isCapteurValide = (): boolean => {
        return (
            this.capteurVirtuelToCreate.label !== undefined && this.capteurVirtuelToCreate.label !== '' &&
            this.capteurVirtuelToCreate.description !== undefined && this.capteurVirtuelToCreate.description !== '' &&
            this.capteurVirtuelToCreate.type_mesure !== undefined
        );
    }
}