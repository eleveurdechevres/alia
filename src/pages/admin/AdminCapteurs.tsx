import * as React from 'react';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import 'react-table/react-table.css';
import 'react-datepicker/dist/react-datepicker.css';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { GlobalStore } from 'src/stores/GlobalStore';
import { ActionElementBar, IPropsActionElement } from 'src/components/ActionBar';
import { Button, Dialog, Icon, Intent } from '@blueprintjs/core';
import ReactTable, { RowInfo } from 'react-table';
import { ICapteurReference } from 'src/interfaces/ICapteurReference';
import { IChannel } from 'src/interfaces/IChannel';

interface IProps {
    globalStore: GlobalStore
}

// const dialogLineStyle = style(csstips.margin(10), csstips.flex, csstips.horizontal);
// const dialogFieldNameStyle = style(csstips.width(80), csstips.margin(5, 5));
// const dialogFieldValueStyle = style(csstips.flex);

@observer export class AdminCapteurs extends React.Component<IProps, {}> {

    @observable private capteurRefs: ICapteurReference[];

    @observable private dialogEditCapteurRefOpened: boolean;
    @observable private capteurRefToModify: ICapteurReference[];
    @observable private dialogEditChannelOpened: boolean;
    @observable private channelToModify: IChannel;

    @observable private capteurRefSelected: ICapteurReference;
    @observable private channelSelected: IChannel;

    // https://react-table.js.org/#/story/readme
    public constructor(props: IProps) {
        super(props);
    }

    public componentDidMount() {
        this.reloadCapteurReferences();
    }

    public render() {
        let createCapteurRefButton: IPropsActionElement = {
            id: 'createNewCapteurRefButton',
            iconName: 'add',
            name: 'Créer une nouvelle référence de capteur',
            onClick: () => { 
                this.capteurRefToModify = undefined;
                this.dialogEditCapteurRefOpened = true;
            }
        };

        const columnsCapteur = [
            {
                Header: 'id',
                accessor: 'id',
                width: 300
            },
            {
                Header: 'Marque',
                accessor: 'marque',
                width: 300
            },
            {
                Header: 'Ref Fabricant',
                accessor: 'ref_fabricant',
                width: 300
            },
            {
                Header: 'Description',
                accessor: 'description'
            },
            {
                width: 40,
                Cell: (row: RowInfo) => {
                    return (
                        <Icon
                            className={style({cursor: 'pointer'})}    
                            icon="edit"
                            intent={Intent.PRIMARY}
                            onClick={() => {
                                this.capteurRefToModify = row.original;
                                this.dialogEditCapteurRefOpened = true;
                            }}
                        />
                    );
                }
            }
        ];
        const columnsChannel = [
            {
                Header: 'id',
                accessor: 'id',
                width: 100
            },
            {
                Header: 'Type de mesure',
                accessor: 'measure_type'
            },
            {
                Header: 'Unité',
                accessor: 'unit',
                width: 150
            },
            {
                Header: 'min range',
                accessor: 'min_range',
                width: 150
            },
            {
                Header: 'max range',
                accessor: 'max_range',
                width: 150
            },
            {
                Header: 'precision',
                accessor: 'precision_step',
                width: 150,
            },
            {
                width: 40,
                Cell: (row: RowInfo) => {
                    return (
                        <Icon
                            className={style({cursor: 'pointer'})}    
                            icon="edit"
                            intent={Intent.PRIMARY}
                            onClick={() => {
                                this.channelToModify = row.original;
                                this.dialogEditChannelOpened = true;
                            }}
                        />
                    );
                }
            }
        ];

        return (
            <div>
                <Dialog
                    autoFocus={true}
                    enforceFocus={true}
                    usePortal={true}
                    canOutsideClickClose={true}
                    canEscapeKeyClose={true}
                    isOpen={this.dialogEditCapteurRefOpened}
                    title={this.capteurRefToModify !== undefined ? 'Edition Reference' : 'Nouvelle référence'}
                    icon="dashboard"
                    onClose={() => { this.dialogEditCapteurRefOpened = false; }}
                >
                    <div>Capteur...</div>
                </Dialog>
                <Dialog
                    autoFocus={true}
                    enforceFocus={true}
                    usePortal={true}
                    canOutsideClickClose={true}
                    canEscapeKeyClose={true}
                    isOpen={this.dialogEditChannelOpened}
                    title={this.channelToModify !== undefined ? 'Edition Channel' : 'Nouveau channel'}
                    icon="property"
                    onClose={() => { this.dialogEditChannelOpened = false; }}
                >
                    <div>Channel...</div>
                </Dialog>
                <ActionElementBar elements={[createCapteurRefButton]} />
                {
                    // Liste des références de capteurs => ajout ref, modif ref
                    <ReactTable
                        data={this.capteurRefs}
                        columns={columnsCapteur}
                        defaultPageSize={20}
                        className="-striped -highlight"
                        getTrProps={this.handleEventsOnCapteurRef}
                        showPagination={true}
                        showPageJump={true}
                        sortable={true}
                        getTrGroupProps={(finalState: any, rowInfo?: RowInfo, column?: undefined, instance?: any) => {
                            let background: string = undefined;
                            if (rowInfo !== undefined) {
                                background = rowInfo.original === this.props.globalStore.client ? 'lightgreen' : undefined;
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
                        SubComponent={ row => {
                            let capteurRef: ICapteurReference = row.original;
                            return (
                                <div className={style(csstips.gridSpaced(5), csstips.margin(10))}>
                                    <ReactTable
                                        data={capteurRef.channels}
                                        columns={columnsChannel}
                                        defaultPageSize={capteurRef.channels.length}
                                        showPagination={false}
                                        className="-striped -highlight"
                                        getTrProps={this.handleEventsOnChannelRef}
                                        sortable={true}
                                        getTrGroupProps={(finalState: any, rowInfo?: RowInfo, column?: undefined, instance?: any) => {
                                            let background: string = undefined;
                                            if (rowInfo !== undefined) {
                                                background = rowInfo.original === this.props.globalStore.client ? 'lightgreen' : undefined;
                                            }

                                            return {
                                                style: {
                                                    background: background,
                                                    cursor: 'pointer'
                                                }
                                            }
                                        }}
                                    />
                                <Button
                                    icon="insert"
                                    text="Ajouter un channel"
                                    onClick={() => {
                                        this.channelToModify = undefined;
                                        this.dialogEditChannelOpened = true;
                                    }}
                                />
                                </div>
                            );
                        }}
                    />

                    // liste des capteurs de chaque ref quand on clique dessus ? => ajout capteur, modif capteur
                }
                <div className={style(csstips.height(120))}/>
            </div>
        );
    }

    private handleEventsOnCapteurRef = (state: any, rowInfo: any, column: any, instance: any) => {
        return {
            onClick: (e: any) => {
                this.capteurRefSelected = rowInfo.original;
                console.log(this.capteurRefSelected);
            }
        }
    }

    private handleEventsOnChannelRef = (state: any, rowInfo: any, column: any, instance: any) => {
        return {
            onClick: (e: any) => {
                this.channelSelected = rowInfo.original;
                console.log(this.channelSelected);
            }
        }
    }

    private reloadCapteurReferences = () => {
        this.props.globalStore.getAllCapteurReferences().then((capteurRefs: ICapteurReference[]) => this.capteurRefs = capteurRefs);
    }
}