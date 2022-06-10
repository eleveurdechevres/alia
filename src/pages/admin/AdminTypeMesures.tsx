import * as React from 'react';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import 'react-table/react-table.css';
import 'react-datepicker/dist/react-datepicker.css';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { GlobalStore } from 'src/stores/GlobalStore';
import { ActionElementBar, IPropsActionElement } from 'src/components/ActionBar';
import { Button, Dialog, Icon, InputGroup, Intent } from '@blueprintjs/core';
import ReactTable, { RowInfo } from 'react-table';
import { ICapteurReference } from 'src/interfaces/ICapteurReference';
import { ITypeMesure } from 'src/interfaces/ITypeMesure';

interface IProps {
    globalStore: GlobalStore
}

const dialogLineStyle = style(csstips.margin(10), csstips.flex, csstips.horizontal);
const dialogFieldNameStyle = style(csstips.width(80), csstips.margin(5, 5));
const dialogFieldValueStyle = style(csstips.flex);

@observer export class AdminTypeMesures extends React.Component<IProps, {}> {

    @observable private typeMesures: ITypeMesure[];

    @observable private dialogEditTypeMesureOpened: boolean;

    @observable private typeMesureToSave: ITypeMesure = {
        id: undefined,
        measure_type: undefined,
        unit: undefined
    };

    @observable private isEditionMode: boolean;

    @observable private typeMesureSelected: ICapteurReference;

    // https://react-table.js.org/#/story/readme
    public constructor(props: IProps) {
        super(props);
    }

    public componentDidMount() {
        this.reloadTypeMesures();
    }

    public render() {
        let createCapteurRefButton: IPropsActionElement = {
            id: 'createNewTypeMesure',
            iconName: 'add',
            name: 'Créer un nouveau type de mesure',
            onClick: () => {
                this.isEditionMode = false;
                this.typeMesureToSave = {
                    id: undefined,
                    measure_type: undefined,
                    unit: undefined
                };
                this.dialogEditTypeMesureOpened = true;
            }
        };

        const columnsTypeMesure = [
            {
                Header: 'id',
                accessor: 'id',
                width: 60
            },
            {
                Header: 'Type de mesure',
                accessor: 'measure_type',
                width: 300
            },
            {
                Header: 'Unité',
                accessor: 'unit',
                width: 100
            },
            {
                width: 100,
                Cell: (row: RowInfo) => {
                    
                    return (
                        <Icon
                            className={style({cursor: 'pointer'})}    
                            icon="edit"
                            intent={Intent.PRIMARY}
                            onClick={() => {
                                this.typeMesureToSave = { ...row.original };
                                this.isEditionMode = true;
                                this.dialogEditTypeMesureOpened = true;
                            }}
                        />
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
                    isOpen={this.dialogEditTypeMesureOpened}
                    title={this.isEditionMode ? 'Edition type de mesure' : 'Nouveau type de mesure'}
                    icon="tag"
                    onClose={() => { this.dialogEditTypeMesureOpened = false; }}
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
                                        onChange={(event: any) => { this.typeMesureToSave.id = event.target.value }}
                                        defaultValue={this.typeMesureToSave.id.toString()}
                                        disabled={true}
                                    />
                                </div>
                            </div>
                        }
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldNameStyle}>
                                Type de mesure
                            </div>
                            <div className={dialogFieldValueStyle}>
                                <InputGroup
                                    placeholder="Type de mesure"
                                    onChange={(event: any) => { this.typeMesureToSave.measure_type = event.target.value }}
                                    defaultValue={this.typeMesureToSave.measure_type}
                                />
                            </div>
                        </div>
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldNameStyle}>
                                Unité
                            </div>
                            <div className={dialogFieldValueStyle}>
                                <InputGroup
                                    placeholder="Unité"
                                    onChange={(event: any) => { this.typeMesureToSave.unit = event.target.value }}
                                    defaultValue={this.typeMesureToSave.unit}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={style(csstips.horizontal, csstips.flex)}>
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.NONE}
                                text="Annuler"
                                onClick={() => { this.dialogEditTypeMesureOpened = false; }}
                            />
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.PRIMARY}
                                icon="cloud-upload"
                                text={this.isEditionMode ? 'Modifier' : 'Créer'}
                                onClick={this.handleWriteTypeMesure}
                            />
                        </div>
                </Dialog>
                
                <ActionElementBar elements={[createCapteurRefButton]} />
                    <div className={style(csstips.horizontal)}>
                        <div className={style(csstips.flex)}/>
                        <ReactTable
                            data={this.typeMesures}
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
                                    background = this.typeMesureSelected && (rowInfo.original.id === this.typeMesureSelected.id) ? 'lightgreen' : undefined;
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
                this.typeMesureSelected = rowInfo.original;
                this.forceUpdate();
            }
        }
    }

    private reloadTypeMesures = () => {
        this.props.globalStore.getTypeMesures().then((typeMesures: ITypeMesure[]) => {
            this.typeMesures = typeMesures;
        });
    }

    private handleWriteTypeMesure = () => {
        this.props.globalStore.writeTypeMesure(this.typeMesureToSave, () => {
            this.reloadTypeMesures();
            this.forceUpdate();
        });
        this.dialogEditTypeMesureOpened = false;
    }
}