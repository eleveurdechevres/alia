import * as React from 'react';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';

// Import React Table
import ReactTable, { RowInfo } from 'react-table';
import 'react-table/react-table.css';
// import { HabitatsTable } from '../Habitat/HabitatsTable';
import { IClient } from 'src/interfaces/IClient';
import { observer } from 'mobx-react';
import { toJS, observable } from 'mobx';
import { Icon, Dialog, Button, Intent, InputGroup } from '@blueprintjs/core';
import { NewElementButton } from 'src/components/NewElementButton';

interface IProps {
    client: IClient;
    selectClient: (client: IClient) => void;
//    handler: (client: IClient) => void;
}

const dialogLineStyle = style(csstips.margin(10), csstips.flex, csstips.horizontal);
const dialogFieldNameStyle = style(csstips.width(80), csstips.margin(5, 5));
const dialogFieldValueStyle = style(csstips.flex);

@observer export class Clients extends React.Component<IProps, {}> {

    @observable private clients: IClient[] = [];
    @observable private clientToDelete: IClient | undefined = undefined;
    @observable private dialogCreateClientOpened: boolean = false;
    @observable private enableLineSelect: boolean = true;
    private password: string = '';
    private clientToCreate: IClient = {
        id: undefined,
        nom: undefined,
        adresse: undefined,
        telephone: undefined,
        email: undefined
    };

    // https://react-table.js.org/#/story/readme
    constructor(props: IProps) {
        super(props);
    }

    private getClients = () => {
        return fetch(`http://test.ideesalter.com/alia_searchClient.php`)
        .then((response) => response.json())
        .then((clients) => { this.clients = clients });
    }

    public componentDidMount() {
        this.getClients();
    }

    // id
    // nom
    // adresse
    // email
    // telephone
    private handleEventsOnClient = (state: any, rowInfo: any, column: any, instance: any) => {
        return {
            onClick: (e: any) => {
                if ( this.enableLineSelect ) {
                    this.props.selectClient(rowInfo.original);
                }
            }
        }
    }

    public render() {
        const columns = [
            {
                Header: 'client id',
                accessor: 'id',
                width: 100
            },
            {
                Header: 'Nom',
                accessor: 'nom',
                width: 300
            },
            {
                Header: 'Adresse',
                accessor: 'adresse'
            },
            {
                Header: 'email',
                accessor: 'email',
                width: 300
            },
            {
                Header: 'Téléphone',
                accessor: 'telephone',
                width: 200,
            },
            {
                width: 40,
                Cell: (row: RowInfo) => {
                    return (
                        <Icon
                            icon="trash"
                            onClick={() => {
                                this.enableLineSelect = false;
                                this.clientToDelete = row.original;
                            }}
                        />
                    );
                }
            }

        ];

        return (

            <div>
                <ReactTable
                    data={toJS(this.clients)}
                    columns={columns}
                    defaultPageSize={10}
                    className="-striped -highlight"
                    getTrProps={this.handleEventsOnClient}
                    showPagination={true}
                    showPageJump={true}
                    sortable={true}
                    // SubComponent={ row => {
                    //     return (<HabitatsTable client={row.original} />);
                    // }}
                />
                <NewElementButton
                    name="Create new Client"
                    onClick={() => { 
                        this.dialogCreateClientOpened = true;
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
                    isOpen={this.clientToDelete !== undefined}
                    title={this.clientToDelete !== undefined ? 'Suppression client "' + this.clientToDelete.nom + '", id[' + this.clientToDelete.id + ']' : 'Erreur client inexistant'}
                    icon="warning-sign"
                    onClose={() => { this.clientToDelete = undefined; }}
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
                                onClick={() => { this.clientToDelete = undefined; }}
                            />
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.DANGER}
                                icon="warning-sign"
                                text="Supprimer"
                                onClick={this.handleDeleteClient}
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
                    isOpen={this.dialogCreateClientOpened}
                    title="Nouveau client"
                    icon="new-person"
                    onClose={() => { this.dialogCreateClientOpened = false; }}
                >
                    <div className={style(csstips.flex, csstips.vertical)}>
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldNameStyle}>
                                Nom
                            </div>
                            <div className={dialogFieldValueStyle}>
                                <InputGroup
                                    leftIcon="person"
                                    placeholder="Nom Prénom"
                                    onChange={(event: any) => { this.clientToCreate.nom = event.target.value }}
                                />
                            </div>
                        </div>
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldNameStyle}>
                                Adresse
                            </div>
                            <div className={dialogFieldValueStyle}>
                                <InputGroup
                                    leftIcon="home"
                                    placeholder="Adresse"
                                    onChange={(event: any) => { this.clientToCreate.adresse = event.target.value }}
                                />
                            </div>
                        </div>
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldNameStyle}>
                                Téléphone
                            </div>
                            <div className={dialogFieldValueStyle}>
                                <InputGroup
                                    leftIcon="phone"
                                    placeholder="Numéro de téléphone"
                                    onChange={(event: any) => { this.clientToCreate.telephone = event.target.value }}
                                />
                            </div>
                        </div>
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldNameStyle}>
                                e-mail
                            </div>
                            <div className={dialogFieldValueStyle}>
                                <InputGroup
                                    leftIcon="envelope"
                                    placeholder="e-mail"
                                    onChange={(event: any) => { this.clientToCreate.email = event.target.value }}
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
                                onClick={() => { this.dialogCreateClientOpened = false; }}
                            />
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.PRIMARY}
                                icon="add"
                                text="Créer"
                                onClick={this.handleCreateClient}
                            />
                        </div>
                    </div>
                </Dialog>
            </div>
        );
    }
    // http://testbase.ideesalter.com/alia_writeClient.php?id=8&nom=mon%20nom12&adresse=69%20rue%20du%20quai2&email=monNom@rueduquai2.fr&telephone=+3369696970
    // http://testbase.ideesalter.com/alia_deleteClient.php?id=8
    private handleDeleteClient = () => {
        fetch(`http://testbase.ideesalter.com/alia_deleteClient.php?id=` + this.clientToDelete.id + `&password=` + encodeURIComponent(this.password))
            .then((response) => {
                if (response.status === 200) {
                    this.getClients();
                } else {
                    console.log(response);
                    // TODO : impossible de supprimer...
            }
        });
        this.clientToDelete = undefined;
        this.enableLineSelect = true;
    }

    private handleCreateClient = () => {
        this.handleWriteClient(this.clientToCreate);
        this.dialogCreateClientOpened = false;
    };

    private handleWriteClient = (client: IClient) => {
        fetch(`http://testbase.ideesalter.com/alia_writeClient.php` +
            `?id=` + client.id +
            `&nom=` + client.nom + 
            `&adresse=` + client.adresse + 
            `&telephone=` + client.telephone + 
            `&email=` + client.email +
            `&password=` + encodeURIComponent(this.password)
        ).then((response) => {
                if (response.status === 200) {
                    this.getClients();
                } else {
                    console.log(response);
                    // TODO : impossible de sauvegarder...
            }
        });
    }
}
