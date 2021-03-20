import * as React from 'react';
import { observer } from 'mobx-react';
import { autorun } from 'mobx';
import * as Modal from '../../components/Modal';
import { ICapteurVirtuel } from 'src/interfaces/ICapteurVirtuel';
import ReactTable, { RowInfo } from 'react-table';
import 'react-table/react-table.css';
import { Icon, Intent, Button, Dialog, InputGroup } from '@blueprintjs/core';
import { IMesure } from 'src/interfaces/IMesure';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import * as DateUtils from '../../utils/DateUtils'
import { GlobalStore } from 'src/stores/GlobalStore';
import { ITypeMesure } from 'src/interfaces/ITypeMesure';
import { observable } from 'mobx';
import ReactDatePicker from 'react-datepicker';
import { IMission } from 'src/interfaces/IMission';

interface IProps extends Modal.IProps {
    capteurVirtuel: ICapteurVirtuel;
    mission: IMission;
    globalStore: GlobalStore;
}

const colWidth = {
    date: 300,
    valeur: 200,
    icons: 80
}

const dialogLineStyle = style(csstips.margin(10), csstips.flex, csstips.horizontal);
// const dialogFieldNameStyle = style(csstips.width(80), csstips.margin(5, 5));
const dialogFieldValueStyle = style(csstips.flex);

@observer export class ModalCapteurVirtuel extends Modal.Modal<IProps> {

    @observable private typeMesure: ITypeMesure;
    @observable private dialogCreateMesureOpened = false;
    @observable private editionMode: boolean;
    @observable private data: IMesure[] = [];
    
    // for spinners management
    @observable private currentMesure: IMesure = {
        date: undefined,
        valeur: undefined
    };

    public constructor(props: IProps) {
        super(props);
        autorun(() => {
            if (this.props.capteurVirtuel) {
                this.props.globalStore.getMesureType(this.props.capteurVirtuel.type_mesure).then((value: ITypeMesure) => {
                    this.typeMesure = value[0];
                });
            }
        });

// GET MESURES VIRTUELLES !!!
        // autorun(() => {
        //     if (this.props.capteurVirtuel) {
        //         var request = `http://test.ideesalter.com/alia_readMesureVirtuelle.php`;
        //         fetch(request)
        //         .then((response) => response.text())
        //         .then((responseData) => {
        //             this.imageData = responseData;

        //             var image = d3.select(this.imageRef);
        
        //             image
        //                 .attr('opacity', 0)
        //                 .attr('xlink:href', this.imageData)
        //                 .attr('x', 0)
        //                 .attr('y', 0)
        //                 .transition()
        //                 .attr('opacity', 1);
        //             this.getImageSize(this.imageData);
        //         });
        //     }
        // });
    }

    protected getTitle = () => {
        if (this.props.mission && this.props.capteurVirtuel) {
            const stringDateDebut = DateUtils.dateTimeString(new Date(this.props.mission.date_debut));
            const stringDateFin = DateUtils.dateTimeString(new Date(this.props.mission.date_fin));
            return `${this.props.capteurVirtuel.label} [${this.props.capteurVirtuel.id}], mission de ${stringDateDebut} à ${stringDateFin}`;
        }
        return 'Capteur virtuel';
    }
    protected onAfterOpen = () => {
        this.reloadMesures();
    }

    protected onAfterClose = () => {
        // on vide les données pour pas garder ça en mémoire
        this.data = [];
    }

    protected renderInternalComponent = (): JSX.Element => {

        if (this.props.capteurVirtuel === undefined) {
            return <React.Fragment/>
        }

        const unit = this.typeMesure ? this.typeMesure.unit : '';
        const measureType = this.typeMesure ? this.typeMesure.measure_type : '';

        const columns = [
            {
                Header: 'Date',
                accessor: 'date',
                width: colWidth.date,
                Cell: (row: RowInfo) => (
                    <div
                        className={style({
                            textAlign: 'center',
                            cursor: 'pointer'
                        })}
                    >
                        {DateUtils.dateTimeString(row.original.date)}
                    </div>
                )
            },
            {
                Header: 'Mesure',
                accessor: 'valeur',
                width: colWidth.valeur,
                Cell: (row: RowInfo) => (
                    <div
                        className={style({
                            textAlign: 'right',
                            cursor: 'pointer',
                        })}
                    >
                        {row.original.valeur} {unit}
                    </div>
                )
            },
            {
                width: colWidth.icons,
                Cell: (row: RowInfo) => {
                    return (
                        <div
                            className={style({
                                textAlign: 'center',
                            })}
                        >
                            <Icon
                                className={style({cursor: 'pointer', marginRight: '5px'})}    
                                icon="edit"
                                intent={Intent.PRIMARY}
                                onClick={() => {
                                    const mesure: IMesure = this.getMesureFromRow(row);
                                    this.editMesure(mesure);
                                }}
                            />
                            <Icon
                                className={style({cursor: 'pointer'})}    
                                icon="trash"
                                intent={Intent.DANGER}
                                onClick={() => {
                                    const mesure: IMesure = this.getMesureFromRow(row);
                                    this.handleDeleteMesure(mesure);
                                }}
                            />
                        </div>
                    );
                }
            }

        ];

        return (
            <React.Fragment>
                <Dialog
                    autoFocus={true}
                    enforceFocus={true}
                    usePortal={true}
                    canOutsideClickClose={true}
                    canEscapeKeyClose={true}
                    isOpen={this.dialogCreateMesureOpened}
                    title={`${measureType} (${unit})`}
                    icon={this.editionMode ? 'edit' : 'insert'}
                    onOpened={this.reloadMesures}
                    onClose={() => { this.dialogCreateMesureOpened = false; }}
                >
                    <div className={style(csstips.flex, csstips.vertical)}>
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldValueStyle}>
                                <ReactDatePicker
                                    disabled={this.editionMode}
                                    selected={this.currentMesure.date}
                                    onChange={(date: Date) => {
                                        this.currentMesure.date = date;
                                    }}
                                    minDate={new Date(this.props.mission.date_debut)}
                                    maxDate={new Date(this.props.mission.date_fin)}
                                    dateFormat="dd/MM/yyyy HH:mm"
                                    placeholderText="Date de la mesure"
                                    showTimeInput={true}
                                    timeFormat="HH:mm"
                                />
                                {new Date(this.props.mission.date_fin) < new Date() ? 
                                    <React.Fragment/>
                                    :
                                    <Button
                                        className={style({marginLeft: '5px'})}
                                        text="Now"
                                        onClick={() => { this.currentMesure.date = new Date(); }}
                                        disabled={this.editionMode}
                                        small={true}
                                    />
                                }
                            </div>
                        </div>
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldValueStyle}>
                                <InputGroup
                                    leftIcon="clipboard"
                                    placeholder="Valeur mesurée"
                                    value={this.currentMesure.valeur ? this.currentMesure.valeur.toString() : undefined}
                                    onChange={(event: any) => { this.currentMesure.valeur = event.target.value }}
                                />
                            </div>
                        </div>
                        <div className={style(csstips.horizontal, csstips.flex)}>
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.NONE}
                                text="Annuler"
                                onClick={() => { this.dialogCreateMesureOpened = false; }}
                            />
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.PRIMARY}
                                icon="add"
                                text="Enregistrer"
                                onClick={this.handleWriteMesure}
                                disabled={this.currentMesure === undefined || this.currentMesure.date === undefined || this.currentMesure.valeur === undefined}
                            />
                        </div>
                    </div>
                </Dialog>
                <div className={style(csstips.width(colWidth.date + colWidth.valeur + colWidth.icons))}>
                    <Button
                        icon="insert"
                        text="Ajouter une mesure"
                        onClick={() => {
                            this.insertNewMesure();
                        }}
                    />
                    <ReactTable
                        data={this.data}
                        columns={columns}
                        defaultPageSize={10}
                        className="-striped -highlight"
                        getTrProps={this.handleEventsOnMesure}
                        showPagination={true}
                        showPageJump={true}
                        sortable={true}
                    />
                </div>
            </React.Fragment>
        );
    }

    private handleWriteMesure = () => {
        this.props.globalStore.writeMesureVirtuelle(this.props.mission.id, this.props.capteurVirtuel, this.currentMesure, this.reloadMesures);
        this.dialogCreateMesureOpened = false;
    }

    private handleDeleteMesure = (mesure: IMesure) => {
        this.props.globalStore.deleteMesureVirtuelle(this.props.mission.id, this.props.capteurVirtuel, mesure, this.reloadMesures);
    }

    private handleEventsOnMesure = (state: any, row: RowInfo, column: any, instance: any) => {
        return {
            onClick: (e: any) => {
                // clic sur mesure
            },
            onDoubleClick: (e: any) => {
                const mesure: IMesure = this.getMesureFromRow(row);
                this.editMesure(mesure);
            }
        }
    }

    private insertNewMesure = () => {
        this.currentMesure.date = undefined;
        this.currentMesure.valeur = undefined;
        this.editionMode = false;
        this.dialogCreateMesureOpened = true;
    }

    private editMesure = (mesure: IMesure) => {
        this.currentMesure.date = mesure.date;
        this.currentMesure.valeur = mesure.valeur;
        this.editionMode = true;
        this.dialogCreateMesureOpened = true;
    }

    private reloadMesures = () => {
        this.props.globalStore.getMesuresViruelles(
            this.props.mission.id,
            this.props.capteurVirtuel.id,
            new Date(this.props.mission.date_debut),
            new Date(this.props.mission.date_fin)
        ).then((results: IMesure[]) => {
            this.data = results;
            this.forceUpdate();
        });
    }

    private getMesureFromRow = (row: RowInfo): IMesure => {
        const mesure: IMesure = {
            date: new Date(row.original.date),
            valeur: row.original.valeur
        };
        return mesure;
    }
}
