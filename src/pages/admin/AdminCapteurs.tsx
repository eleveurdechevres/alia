import * as React from 'react';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import 'react-table/react-table.css';
import 'react-datepicker/dist/react-datepicker.css';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { GlobalStore } from 'src/stores/GlobalStore';
import { ActionElementBar, IPropsActionElement } from 'src/components/ActionBar';
import { Button, Checkbox, Dialog, InputGroup, Intent } from '@blueprintjs/core';
import ReactTable, { RowInfo } from 'react-table';
import { ICapteur } from 'src/interfaces/ICapteur';
import { CapteurReferenceSelector } from './CapteurReferenceSelector';

interface IProps {
    globalStore: GlobalStore
}

const dialogLineStyle = style(csstips.margin(10), csstips.flex, csstips.horizontal);
const dialogFieldNameStyle = style(csstips.width(80), csstips.margin(5, 5));
const dialogFieldValueStyle = style(csstips.flex);

@observer export class AdminCapteurs extends React.Component<IProps, {}> {

    @observable private capteurs: ICapteur[];

    @observable private dialogEditCapteurOpened: boolean;

    @observable private capteurToSave: ICapteur = {
        id: undefined,
        capteur_reference_id: undefined,
        description: undefined,
        propriete_alia: true
    };

    @observable private isEditionMode: boolean;

    @observable private capteurSelected: ICapteur;

    // https://react-table.js.org/#/story/readme
    public constructor(props: IProps) {
        super(props);
    }

    public componentDidMount() {
        this.reloadCapteurs();
    }

    public render() {
        let createCapteurButton: IPropsActionElement = {
            id: 'addNewCapteur',
            iconName: 'add',
            name: 'Enregistrer un nouveau capteur',
            onClick: () => {
                this.isEditionMode = false;
                this.capteurToSave = {
                    id: undefined,
                    capteur_reference_id: undefined,
                    description: undefined,
                    propriete_alia: true
                };
                this.dialogEditCapteurOpened = true;
            }
        };

        const columnsTypeMesure = [
            {
                Header: 'id',
                accessor: 'id',
                width: 60
            },
            {
                Header: 'Reference',
                accessor: 'capteur_reference_id',
                width: 300
            },
            {
                Header: 'Description',
                accessor: 'description',
                width: 400
            },
            {
                Header: 'Création',
                accessor: 'dateCreation',
                width: 200
            },
            {
                width: 100,
                Header: 'Propriété Alia',
                Cell: (row: RowInfo) => {
                    return (
                        <Checkbox disabled={true} checked={row.original.propriete_alia === '1'}/>
                    );
                }
            }
        ];
        return (
            <div>
                <Dialog /* Création modification de capteurs */
                    autoFocus={true}
                    enforceFocus={true}
                    usePortal={true}
                    canOutsideClickClose={true}
                    canEscapeKeyClose={true}
                    isOpen={this.dialogEditCapteurOpened}
                    title={this.isEditionMode ? 'Edition capteur' : 'Nouveau capteur'}
                    icon="tag"
                    onClose={() => { this.dialogEditCapteurOpened = false; }}
                >
                    <div className={style(csstips.flex, csstips.vertical)}>
                        {
                            this.isEditionMode &&
                            <div className={dialogLineStyle}>
                                <div className={dialogFieldNameStyle}>
                                    id
                                </div>
                                <div className={dialogFieldValueStyle}>
                                    <InputGroup
                                        leftIcon="tag"
                                        placeholder="id"
                                        onChange={(event: any) => { this.capteurToSave.id = event.target.value }}
                                        value={this.capteurToSave.id.toString()}
                                        disabled={true}
                                    />
                                </div>
                            </div>
                        }
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldNameStyle}>
                                Référence de capteur
                            </div>
                            <div className={dialogFieldValueStyle}>
                                <CapteurReferenceSelector
                                    globalStore={this.props.globalStore}
                                    capteurReferenceSelected={this.capteurToSave.capteur_reference_id}
                                    handleSelect={(capteurRefId: string) => {this.capteurToSave.capteur_reference_id = capteurRefId}}
                                />
                            </div>
                        </div>
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldNameStyle}>
                                Description
                            </div>
                            <div className={dialogFieldValueStyle}>
                                <InputGroup
                                    placeholder="Description"
                                    onChange={(event: any) => { this.capteurToSave.description = event.target.value }}
                                    value={this.capteurToSave.description}
                                />
                            </div>
                        </div>
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldNameStyle}>
                                Propriété ALIA
                            </div>
                            <div className={dialogFieldValueStyle}>
                                <Checkbox
                                    onChange={(event: any) => { this.capteurToSave.propriete_alia = event.target.value }}
                                    checked={this.capteurToSave.propriete_alia}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={style(csstips.horizontal, csstips.flex)}>
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.NONE}
                                text="Annuler"
                                onClick={() => { this.dialogEditCapteurOpened = false; }}
                            />
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.PRIMARY}
                                icon="cloud-upload"
                                text={this.isEditionMode ? 'Modifier' : 'Créer'}
                                onClick={this.handleWriteCapteur}
                            />
                        </div>
                </Dialog>
                
                <ActionElementBar elements={[createCapteurButton]} />
                    <div className={style(csstips.horizontal)}>
                        <div className={style(csstips.flex)}/>
                        <ReactTable
                            data={this.capteurs}
                            columns={columnsTypeMesure}
                            defaultPageSize={20}
                            className="-striped -highlight"
                            getTrProps={this.handleEventsOnTypeMesure}
                            showPagination={true}
                            showPageJump={true}
                            sortable={true}
                            getTrGroupProps={(finalState: any, rowInfo?: RowInfo, column?: undefined, instance?: any) => {
                                let background: string = undefined;
                                if (rowInfo !== undefined) {
                                    background = this.capteurSelected && (rowInfo.original.id === this.capteurSelected.id) ? 'lightgreen' : undefined;
                                }

                                return {
                                    style: {
                                        background: background,
                                        cursor: 'pointer'
                                    }
                                }
                            }}
                            collapseOnPageChange={false}
                            collapseOnDataChange={false}
                            collapseOnSortingChange={true}
                        />
                        <div className={style(csstips.flex)}/>
                    </div>
                <div className={style(csstips.height(120))}/>
            </div>
        );
    }

    private handleEventsOnTypeMesure = (state: any, rowInfo: any, column: any, instance: any) => {
        return {
            onClick: (e: any) => {
                this.capteurSelected = rowInfo.original;
                this.forceUpdate();
            }
        }
    }

    private reloadCapteurs = () => {
        // this.props.globalStore.getCapteurs();
        this.props.globalStore.getCapteurs().then((capteurs: ICapteur[]) => {
            this.capteurs = capteurs;
        });
    }

    private handleWriteCapteur = () => {
        this.props.globalStore.writeCapteur(this.capteurToSave, () => {
            this.reloadCapteurs();
            this.forceUpdate();
        });
        this.dialogEditCapteurOpened = false;
    }
}