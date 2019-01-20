import * as React from 'react';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
// import { render } from "react-dom";

// Import React Table
import ReactTable, { RowInfo } from 'react-table';
import 'react-table/react-table.css';
import { IClient } from 'src/interfaces/IClient';
import { IHabitat } from 'src/interfaces/IHabitat';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Dialog, Button, Intent, InputGroup, Icon } from '@blueprintjs/core';
import { NewElementButton } from 'src/components/NewElementButton';

interface IProps {
    client: IClient;
    selectHabitat: (habitat: IHabitat) => void;
}

const dialogLineStyle = style(csstips.margin(10), csstips.flex, csstips.horizontal);
const dialogFieldNameStyle = style(csstips.width(80), csstips.margin(5, 5));
const dialogFieldValueStyle = style(csstips.flex);

@observer export class Habitats extends React.Component<IProps, {}> {

    @observable private habitats: IHabitat[] = [];
    @observable private habitatToDelete: IHabitat | undefined = undefined;
    @observable private dialogCreateHabitatOpened: boolean = false;
    @observable private enableLineSelect: boolean = true;
    private password: string = '';
    private habitatToCreate: IHabitat = {
        id: undefined,
        client_id: undefined,
        adresse: undefined,
        gps_latitude: undefined,
        gps_longitude: undefined,
        gps_elevation: undefined
    };

    // https://react-table.js.org/#/story/readme
    constructor(props: IProps) {
        super(props);
    }

    private getHabitatsForClient = (id: number) => {
        if (!id) {
            return Promise.resolve({ habitats: [] });
        }
        var request = `http://test.ideesalter.com/alia_searchHabitat.php?client_id=${id}`;
        return fetch(request)
            .then((response) => response.json())
            .then((habitats) => {this.habitats = habitats});
    }

    public componentDidMount() {
        if (this.props.client) {
            this.getHabitatsForClient(this.props.client.id);
        }
    }

    public componentWillReceiveProps(props: IProps) {
        if (props.client) {
            this.getHabitatsForClient(props.client.id);
        }
    }

    // id
    // nom
    // adresse
    // email
    // telephone
    private handleEventsOnHabitat = (state: any, rowInfo: any, column: any, instance: any) => {
        return {
            onClick: (e: any) => {
                if ( this.enableLineSelect ) {
                    this.props.selectHabitat(rowInfo.original);
                }
            }
        }
    }

    render() {
        const columns = [
            {
                Header: 'Habitat id',
                accessor: 'id',
                width: 100
            },
            {
                Header: 'Client id',
                accessor: 'client_id',
                width: 100
            },
            {
                Header: 'Adresse',
                accessor: 'adresse',
            },
            {
                Header: 'Latitude',
                accessor: 'gps_latitude',
                width: 150
            },
            {
                Header: 'Longitude',
                accessor: 'gps_longitude',
                width: 150
            },
            {
                Header: 'Altitude',
                accessor: 'gps_elevation',
                width: 150
            },
            {
                width: 40,
                Cell: (row: RowInfo) => {
                    return (
                        <Icon
                            icon="trash"
                            
                            onClick={() => {
                                this.enableLineSelect = false;
                                this.habitatToDelete = row.original;
                            }}
                        />
                    );
                }
            }
        ];

        return (
            <div>
                <ReactTable
                    data={this.habitats.slice()}
                    columns={columns}
                    noDataText="Pas d'habitat pour ce client"
                    defaultPageSize={10}
                    className="-striped -highlight"
                    getTrProps={this.handleEventsOnHabitat}
                    showPagination={true}
                    showPageJump={true}
                    sortable={true}
                    // SubComponent={ row => {
                    //     return (<MissionsTable habitat={row.original} />);
                    // }}
                />
                <NewElementButton
                    name="Create new Habitat"
                    onClick={() => { 
                        this.dialogCreateHabitatOpened = true;
                        // let client: IClient = {
                        //     id: undefined,
                        //     nom: 'essai',
                        //     adresse: 'adresse essai',
                        //     telephone: 'tel essai',
                        //     email: 'a@a.a'
                        // };
                        // this.handleWriteClient(client);
                    }}
                />
                <Dialog
                    autoFocus={true}
                    enforceFocus={true}
                    usePortal={true}
                    canOutsideClickClose={true}
                    canEscapeKeyClose={true}
                    isOpen={this.habitatToDelete !== undefined}
                    title={this.habitatToDelete !== undefined ? 'Suppression habitat "' + this.habitatToDelete.adresse + '", id[' + this.habitatToDelete.id + ']' : 'Erreur habitat inexistant'}
                    icon="warning-sign"
                    onClose={() => { this.habitatToDelete = undefined; }}
                >
                    <div className={style(csstips.flex, csstips.vertical)}>
                        <div className={style(csstips.margin(20), csstips.flex)}>
                            Opération irréversible : confirmer ?
                        </div>
                        <div className={style(csstips.margin(20), csstips.flex)}>
                            <InputGroup
                                placeholder="password"
                                onChange={(event: any) => { this.password = event.target.value }}
                                type="password"
                            />
                        </div>
                        <div className={style(csstips.horizontal, csstips.flex)}>
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.NONE}
                                text="Annuler"
                                onClick={() => { this.habitatToDelete = undefined; }}
                            />
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.DANGER}
                                icon="warning-sign"
                                text="Supprimer"
                                onClick={this.handleDeleteHabitat}
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
                    isOpen={this.dialogCreateHabitatOpened}
                    title="Nouvel habitat"
                    icon="new-person"
                    onClose={() => { this.dialogCreateHabitatOpened = false; }}
                >
                    <div className={style(csstips.flex, csstips.vertical)}>
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldNameStyle}>
                                Adresse
                            </div>
                            <div className={dialogFieldValueStyle}>
                                <InputGroup
                                    leftIcon="home"
                                    placeholder="Adresse"
                                    onChange={(event: any) => { this.habitatToCreate.adresse = event.target.value }}
                                />
                            </div>
                        </div>
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldNameStyle}>
                                Latitude
                            </div>
                            <div className={dialogFieldValueStyle}>
                                <InputGroup
                                    leftIcon="map-marker"
                                    placeholder="Latitude"
                                    onChange={(event: any) => { this.habitatToCreate.gps_latitude = event.target.value }}
                                />
                            </div>
                        </div>
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldNameStyle}>
                                Longitude
                            </div>
                            <div className={dialogFieldValueStyle}>
                                <InputGroup
                                    leftIcon="map-marker"
                                    placeholder="Longitude"
                                    onChange={(event: any) => { this.habitatToCreate.gps_longitude = event.target.value }}
                                />
                            </div>
                        </div>
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldNameStyle}>
                                Altitude
                            </div>
                            <div className={dialogFieldValueStyle}>
                                <InputGroup
                                    leftIcon="map-marker"
                                    placeholder="Altitude"
                                    onChange={(event: any) => { this.habitatToCreate.gps_elevation = event.target.value }}
                                />
                            </div>
                        </div>
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldNameStyle}/>
                            <div className={dialogFieldValueStyle}>
                                <InputGroup
                                    placeholder="password"
                                    onChange={(event: any) => { this.password = event.target.value }}
                                    type="password"
                                />
                            </div>
                        </div>
                        <div className={style(csstips.horizontal, csstips.flex)}>
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.NONE}
                                text="Annuler"
                                onClick={() => { this.dialogCreateHabitatOpened = false; }}
                            />
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.PRIMARY}
                                icon="add"
                                text="Créer"
                                onClick={this.handleCreateHabitat}
                            />
                        </div>
                    </div>
                </Dialog>
            </div>
        );
    }

    private handleDeleteHabitat = () => {
        fetch(`http://testbase.ideesalter.com/alia_deleteHabitat.php?id=` + this.habitatToDelete.id + `&password=` + encodeURIComponent(this.password))
            .then((response) => {
                if (response.status === 200) {
                    this.getHabitatsForClient(this.props.client.id);
                } else {
                    console.log(response);
                    // TODO : impossible de supprimer...
            }
        });
        this.habitatToDelete = undefined;
        this.enableLineSelect = true;
    }

    private handleCreateHabitat = () => {
        this.handleWriteHabitat(this.habitatToCreate);
        this.dialogCreateHabitatOpened = false;
    };

    private handleWriteHabitat = (habitat: IHabitat) => {
        fetch(`http://testbase.ideesalter.com/alia_writeHabitat.php` +
            `?id=` + habitat.id +
            `&client_id=` + this.props.client.id + 
            `&adresse=` + habitat.adresse + 
            `&latitude=` + habitat.gps_latitude + 
            `&longitude=` + habitat.gps_longitude + 
            `&elevation=` + habitat.gps_elevation + 
            `&password=` + encodeURIComponent(this.password)
        ).then((response) => {
                if (response.status === 200) {
                    this.getHabitatsForClient(this.props.client.id);
                } else {
                    console.log(response);
                    // TODO : impossible de sauvegarder...
            }
        });
    }
}