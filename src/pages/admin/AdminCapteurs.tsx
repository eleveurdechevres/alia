import * as React from 'react';
import * as d3 from 'd3';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import 'react-table/react-table.css';
import 'react-datepicker/dist/react-datepicker.css';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { GlobalStore } from 'src/stores/GlobalStore';
import { ActionElementBar, IPropsActionElement } from 'src/components/ActionBar';
import { Button, Dialog, FileInput, Icon, InputGroup, Intent } from '@blueprintjs/core';
import ReactTable, { RowInfo } from 'react-table';
import { ICapteurReference } from 'src/interfaces/ICapteurReference';
import { IChannel } from 'src/interfaces/IChannel';

interface IProps {
    globalStore: GlobalStore
}

const dialogLineStyle = style(csstips.margin(10), csstips.flex, csstips.horizontal);
const dialogFieldNameStyle = style(csstips.width(80), csstips.margin(5, 5));
const dialogFieldValueStyle = style(csstips.flex);

@observer export class AdminCapteurs extends React.Component<IProps, {}> {

    @observable private capteurRefs: ICapteurReference[];

    @observable private dialogEditCapteurRefOpened: boolean;
    @observable private dialogEditChannelOpened: boolean;
    @observable private channelToSave: IChannel;
    
    @observable private capteurRefToSave: ICapteurReference = {
        id: undefined,
        marque: undefined,
        ref_fabricant: undefined,
        description: undefined,
        channels: [],
        image: undefined
    };

    @observable private isEditionMode: boolean;

    @observable private capteurRefSelected: ICapteurReference;
    @observable private imageToUpload: string = undefined;

    @observable private channelSelected: IChannel;
    private imageRefMap: Map<String, SVGImageElement> = new Map();
    @observable private capteurRefToSaveImage: SVGImageElement;

    // https://react-table.js.org/#/story/readme
    public constructor(props: IProps) {
        super(props);

        // autorun
        // observe(this.capteurRefToSave, (change: IObjectDidChange) => {
        //     let imageRef = d3.select(this.capteurRefToSaveImage);
        //     imageRef.attr('xlink:href', this.capteurRefToSave.image)
        //         .attr('x', 0)
        //         .attr('y', 0);
        // });
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
                this.isEditionMode = false;
                this.capteurRefToSave = {
                    id: undefined,
                    marque: undefined,
                    ref_fabricant: undefined,
                    description: undefined,
                    channels: [],
                    image: undefined
                };
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
                width: 150,
                Cell: (row: RowInfo) => {

                    return (
                        <svg width={128} height={128}>
                            <image ref={(ref) => { this.imageRefMap.set(row.original.id, ref); }} />
                        </svg>
                    );
                }
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
                                this.capteurRefToSave = { ...row.original };
                                this.isEditionMode = true;
                                
                                this.getImageCapteur(this.capteurRefToSave.id).then((imageCapteur) => {
                                    this.capteurRefToSave.image = imageCapteur;
                                });

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
                                this.channelToSave = row.original;
                                this.dialogEditChannelOpened = true;
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
                    isOpen={this.dialogEditCapteurRefOpened}
                    title={this.isEditionMode ? 'Edition Reference' : 'Nouvelle référence'}
                    icon="dashboard"
                    onClose={() => { this.dialogEditCapteurRefOpened = false; }}
                >
                    <div className={style(csstips.flex, csstips.vertical)}>
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldNameStyle}>
                                id
                            </div>
                            <div className={dialogFieldValueStyle}>
                                <InputGroup
                                    leftIcon="tag"
                                    placeholder="id"
                                    onChange={(event: any) => { this.capteurRefToSave.id = event.target.value }}
                                    value={this.capteurRefToSave.id}
                                    disabled={this.isEditionMode}
                                />
                            </div>
                        </div>
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldNameStyle}>
                                Marque
                            </div>
                            <div className={dialogFieldValueStyle}>
                                <InputGroup
                                    placeholder="Marque"
                                    onChange={(event: any) => { this.capteurRefToSave.marque = event.target.value }}
                                    value={this.capteurRefToSave.marque}
                                />
                            </div>
                        </div>
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldNameStyle}>
                                Ref Fabricant
                            </div>
                            <div className={dialogFieldValueStyle}>
                                <InputGroup
                                    placeholder="Ref Fabricant"
                                    onChange={(event: any) => { this.capteurRefToSave.ref_fabricant = event.target.value }}
                                    value={this.capteurRefToSave.ref_fabricant}
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
                                    onChange={(event: any) => { this.capteurRefToSave.description = event.target.value }}
                                    value={this.capteurRefToSave.description}
                                />
                            </div>
                        </div>
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldNameStyle}>
                                Image
                            </div>
                            <div className={dialogFieldValueStyle}>
                                <FileInput
                                    className={style(csstips.fillParent)}
                                    disabled={false}
                                    text={this.imageToUpload ? this.imageToUpload : 'Choisissez un fichier'}
                                    onChange={(event: any) => {
                                        event.preventDefault();
                                        let file: File = event.target.files[0];
                                        let fileReader = new FileReader();
                                        fileReader.onload = () => {
                                            this.imageToUpload = file.name;
                                        };
                                        fileReader.onerror = () => { console.log('Error reading file')};
                                        fileReader.onloadend = () => { 
                                            this.capteurRefToSave.image = fileReader.result as string;
                                            let imageRef = d3.select(this.capteurRefToSaveImage);
                                            imageRef.attr('xlink:href', this.capteurRefToSave.image)
                                                .attr('x', 0)
                                                .attr('y', 0);
                                        }
                                        fileReader.readAsDataURL(file);
                                    }}
                                />
                            </div>
                        </div>
                        <div className={dialogLineStyle}>
                            <svg width={128} height={128}>
                                <image ref={(ref) => { this.capteurRefToSaveImage = ref }} />
                            </svg>
                        </div>
                        {/* <div className={dialogLineStyle}>
                            <div className={dialogFieldNameStyle}/>
                            <div className={dialogFieldValueStyle}>
                                <InputGroup
                                    placeholder="password"
                                    onChange={(event: any) => { this.password = event.target.value }}
                                    type="password"
                                />
                            </div>
                        </div> */}
                        <div className={style(csstips.horizontal, csstips.flex)}>
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.NONE}
                                text="Annuler"
                                onClick={() => { this.dialogEditCapteurRefOpened = false; }}
                            />
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.PRIMARY}
                                icon="cloud-upload"
                                text={this.isEditionMode ? 'Modifier' : 'Créer'}
                                onClick={this.handleWriteCapteurReference}
                            />
                        </div>
                    </div>
                </Dialog>
                <Dialog
                    autoFocus={true}
                    enforceFocus={true}
                    usePortal={true}
                    canOutsideClickClose={true}
                    canEscapeKeyClose={true}
                    isOpen={this.dialogEditChannelOpened}
                    title={this.channelToSave !== undefined ? 'Edition Channel' : 'Nouveau channel'}
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
                                        this.channelToSave = undefined;
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
        this.props.globalStore.getAllCapteurReferences().then((capteurRefs: ICapteurReference[]) => {
            this.capteurRefs = capteurRefs;
            this.capteurRefs.forEach((capteurRef: ICapteurReference) => {
                this.getImageCapteur(capteurRef.id).then((imageCapteur) => {
                    let image = d3.select(this.imageRefMap.get(capteurRef.id));
                    image.attr('xlink:href', imageCapteur)
                        .attr('x', 0)
                        .attr('y', 0);
                });
            });
        });
    }

    private handleWriteCapteurReference = () => {
        this.props.globalStore.writeCapteurReference(this.capteurRefToSave).then(this.reloadCapteurReferences);
        this.dialogEditCapteurRefOpened = false;
        this.imageToUpload = undefined;
    }

    private getImageCapteur = (id: string) => {
        return new Promise<string>((resolve, reject) => {
            var request = `https://api.alia-france.com/alia_afficheImageCapteur.php?id=${id}`;
            return fetch(request)
                .then((response) => {
                    resolve(response.text());
                })
    
        });
    }

}