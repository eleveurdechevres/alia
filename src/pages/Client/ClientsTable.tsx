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
import { Icon, Dialog, Button, Intent } from '@blueprintjs/core';
import { NewElementButton } from 'src/components/NewElementButton';

interface IProps {
    client: IClient;
//    handler: (client: IClient) => void;
}
@observer export class ClientsTable extends React.Component<IProps, {}> {

    @observable clients: IClient[] = [];
    @observable clientToDelete: IClient | undefined = undefined
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
    onRowClick = (state: any, rowInfo: any, column: any, instance: any) => {
        return {
            onClick: (e: any) => {
            //   var client = rowInfo.original;
            // this.props.handler( client );
            // console.log('A Td Element was clicked!')
            // console.log('it produced this event:', e)
            // console.log('It was in this column:', column)
            // console.log('It was in this row:', rowInfo)
            // console.log('It was in this table instance:', instance)
            }
        }
    }

    render() {
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
                width: 200
            },
            {
                width: 40,
                Cell: (row: RowInfo) => {
                    return (
                        <Icon
                            icon="trash"
                            onClick={() => { this.clientToDelete = row.original; }}
                        />
                    );
                }
            }

        ];

        // if ( this.clients.length === 0 || ( this.clients.length === 1 && this.clients[0] === undefined ) ) {
        // if ( this.props.client === undefined ) {
        //     return (
        //         <div/>
        //     );
        // }

        return (

            <div>
                <ReactTable
                    data={toJS(this.clients)}
                    columns={columns}
                    defaultPageSize={10}
                    className="-striped -highlight"
                    getTrProps={this.onRowClick}
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
                        let client: IClient = {
                            id: undefined,
                            nom: 'essai',
                            adresse: 'adresse essai',
                            telephone: 'tel essai',
                            email: 'a@a.a'
                        };
                        this.handleWriteClient(client);
                    }}
                />
                {
                    this.clientToDelete ?
                    <Dialog
                        autoFocus={true}
                        enforceFocus={true}
                        usePortal={true}
                        canOutsideClickClose={true}
                        canEscapeKeyClose={true}
                        isOpen={this.clientToDelete !== undefined}
                        title={'Suppression client "' + this.clientToDelete.nom + '", id[' + this.clientToDelete.id + ']'}
                        icon="warning-sign"
                        onClose={() => { this.clientToDelete = undefined; }}
                    >
                        <div className={style(csstips.flex, csstips.vertical)}>
                            <div className={style(csstips.margin(20), csstips.flex)}>
                                Opération irréversible : confirmer ?
                            </div>
                            <div className={style(csstips.horizontal, csstips.flex)}>
                                <Button className={style(csstips.margin(10), csstips.flex)} intent={Intent.DANGER} icon="warning-sign" text="OK" onClick={this.handleDeleteClient}/>
                                <Button className={style(csstips.margin(10), csstips.flex)} intent={Intent.NONE} text="Cancel" onClick={() => { this.clientToDelete = undefined; }}/>
                            </div>
                        </div>
                    </Dialog> : ''
                }
            </div>
        );
    }
    // http://testbase.ideesalter.com/alia_writeClient.php?id=8&nom=mon%20nom12&adresse=69%20rue%20du%20quai2&email=monNom@rueduquai2.fr&telephone=+3369696970
    // http://testbase.ideesalter.com/alia_deleteClient.php?id=8
    private handleDeleteClient = () => {
        fetch(`http://testbase.ideesalter.com/alia_deleteClient.php?id=` + this.clientToDelete.id)
            .then((response) => {
                if (response.status === 200) {
                    this.getClients();
                } else {
                    console.log(response);
                    // TODO : impossible de supprimer...
            }
        });
        this.clientToDelete = undefined;
    }

    private handleWriteClient = (client: IClient) => {
        fetch(`http://testbase.ideesalter.com/alia_writeClient.php` +
            `?id=` + client.id +
            `&nom=` + client.nom + 
            `&adresse=` + client.adresse + 
            `&telephone=` + client.telephone + 
            `&email=` + client.email
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
