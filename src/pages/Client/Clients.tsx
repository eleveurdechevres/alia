import * as React from 'react';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';

// Import React Table
import ReactTable, { RowInfo } from 'react-table';
import 'react-table/react-table.css';
// import { HabitatsTable } from '../Habitat/HabitatsTable';
import { IClient } from 'src/interfaces/IClient';
import { observer } from 'mobx-react';
import { autorun, observable } from 'mobx';
import { Icon, Dialog, Button, Intent, InputGroup } from '@blueprintjs/core';
import { GlobalStore } from 'src/stores/GlobalStore';
import { Auth0Context, Auth0ContextInterface, User } from '@auth0/auth0-react';
import { NavBarTabEnum } from 'src/App';
import { ActionElementBar, IPropsActionElement } from 'src/components/ActionBar';

interface IProps {
    globalStore: GlobalStore;
}

const dialogLineStyle = style(csstips.margin(10), csstips.flex, csstips.horizontal);
const dialogFieldNameStyle = style(csstips.width(80), csstips.margin(5, 5));
const dialogFieldValueStyle = style(csstips.flex);

@observer export class Clients extends React.Component<IProps, {}> {

    static contextType: React.Context<Auth0ContextInterface<User>> = Auth0Context;

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

        autorun(() => {
            if (this.props.globalStore.client) {
                this.forceUpdate();
            }
        });
    }

    public componentDidMount() {
        this.selectClientForUser();
    }

    public componentDidUpdate() {
        this.selectClientForUser();
    }

    private selectClientForUser = () => {
        if (!this.props.globalStore.isRoleAdmin(this.context)) {
            const user: User = this.props.globalStore.getUser(this.context);
            const client = this.props.globalStore.clients.find((cl: IClient) => cl.email === user.email)
            if (client) {
                this.props.globalStore.client = client;
                this.props.globalStore.selectedTab = NavBarTabEnum.HABITATS;
            }
        }
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
                    this.props.globalStore.client = rowInfo.original;
                    this.props.globalStore.habitat = undefined;
                    this.props.globalStore.mission = undefined;
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
                            className={style({cursor: 'pointer'})}    
                            icon="trash"
                            intent={Intent.DANGER}
                            onClick={() => {
                                this.enableLineSelect = false;
                                this.clientToDelete = row.original;
                            }}
                        />
                    );
                }
            }

        ];

        const filterVisibleClient = (client: IClient): boolean => {
            if (this.props.globalStore.isRoleAdmin(this.context)) {
                return true;
            }
            else {
                if (client.email === this.props.globalStore.getUser(this.context).email) {
                    return true;
                }
            }
            return false;
        }

        let createClientButton: IPropsActionElement = {
            id: 'createNewAnalysisButton',
            iconName: 'add',
            name: 'Créer un nouveau client',
            onClick: () => { 
                this.dialogCreateClientOpened = true;
            }
        };

        return (

            <div className={style(csstips.margin(10), { boxShadow: '1px 1px 10px #888' })}>
                <ReactTable
                    data={this.props.globalStore.clients.filter(filterVisibleClient)}
                    columns={columns}
                    defaultPageSize={10}
                    className="-striped -highlight"
                    getTrProps={this.handleEventsOnClient}
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
                />
                <ActionElementBar elements={[createClientButton]} />
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

    private handleDeleteClient = () => {
        this.props.globalStore.deleteClient(this.clientToDelete, this.password);
        this.clientToDelete = undefined;
        this.enableLineSelect = true;
    }

    private handleCreateClient = () => {
        this.props.globalStore.writeClient(this.clientToCreate, this.password);
        this.dialogCreateClientOpened = false;
    };
}
