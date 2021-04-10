import * as React from 'react';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
import * as DateUtils from '../../utils/DateUtils';
// import { render } from "react-dom";

// Import React Table
import ReactTable, { RowInfo } from 'react-table';
import 'react-table/react-table.css';
import * as moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PlansTable } from '../Plan/PlansTable';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { IMission } from 'src/interfaces/IMission';
import { NewElementButton } from 'src/components/NewElementButton';
import { Dialog, Button, Intent, InputGroup, Icon } from '@blueprintjs/core';
import { GlobalStore } from 'src/stores/GlobalStore';
import { DataClusterSelector } from '../analyse/Detail/DataClusterSelector';

interface IProps {
    globalStore: GlobalStore
}

const dialogLineStyle = style(csstips.margin(10), csstips.flex, csstips.horizontal);
const dialogFieldNameStyle = style(csstips.width(80), csstips.margin(5, 5));
const dialogFieldValueStyle = style(csstips.flex);

@observer export class Missions extends React.Component<IProps, {}> {

    @observable private missionToDelete: IMission | undefined = undefined;
    @observable private dialogCreateMissionOpened: boolean = false;
    @observable private enableLineSelect: boolean = true;
    private password: string = '';
    @observable private missionToCreate: IMission = {
        id: undefined,
        databaseId: undefined,
        habitat_id: undefined,
        date_debut: moment().format('YYYY-MM-DD HH:mm:ss'),
        date_fin: moment().format('YYYY-MM-DD HH:mm:ss')
    };

  // https://react-table.js.org/#/story/readme
  constructor(props: IProps) {
    super(props);
  }

  // componentWillReceiveProps(nextProps) {
  //   console.log("componentWillReceiveProps=======");
  //   if( nextProps !== this.props ) {
  //     console.log(nextProps);
  //       this.setState({
  //         habitats: nextProps.habitats
  //       });
  //   }
  //   console.log("=======componentWillReceiveProps");
  // }

  // id
  // nom
  // adresse
  // email
  // telephone
handleEventsOnMission = (state: any, rowInfo: any, column: any, instance: any) => {
    return {
        onClick: (e: any) => {
            if ( this.enableLineSelect ) {
                // this.props.selectMission(rowInfo.original);
            }
        }
    }
  }

    render() {
        const columns = [
            {   Header: 'Mission id',
                accessor: 'id',
                width: 100
            },
            {   Header: 'Date début',
                accessor: 'date_debut',
                width: 150
            },
            {   Header: 'Date fin',
                accessor: 'date_fin',
                width: 150
            },
            {   Header: <><Icon intent={Intent.PRIMARY} icon="database"/>&nbsp;Cluster</>,
                accessor: 'databaseId',
                width: 150
            },
            {
                Cell: (row: RowInfo) => {
                    return (
                        <div className={style(csstips.gridSpaced(10))}>
                            {/* // Utilisé pour mette à jour MissionSunInterval => fini, maintenant on génère ces données à la volée
                                // Eventuellement garder ce bout de code pour modifier la mission, en réaffichant la fenêtre de dialogue de création de mission
                            <Icon
                                className={style({cursor: 'pointer'})}
                                icon="automatic-updates"
                                title="Mettre à jour les données environnementales"
                                intent={Intent.PRIMARY}
                                onClick={() => {
                                    this.enableLineSelect = false;
                                    const missionToUpdate: IMission = row.original;
                                    this.props.globalStore.writeMission(missionToUpdate, '#moulin44');
                                }}
                            /> */}
                            <Icon
                                className={style({cursor: 'pointer'})}
                                icon="trash"
                                title="Supprimer la mission"
                                intent={Intent.DANGER}
                                onClick={() => {
                                    this.enableLineSelect = false;
                                    this.missionToDelete = row.original;
                                }}
                            />
                        </div>
                    );
                }
            }
        ];

        if ( this.props.globalStore.missionsForHabitat.length === 0 ||
            (
                this.props.globalStore.missionsForHabitat.length === 1 &&
                this.props.globalStore.missionsForHabitat[0] === undefined
            )
        ) {
            return (
                <div/>
            );
        }

        return (
            <div className={style(csstips.margin(10), { boxShadow: '1px 1px 10px #888' })}>
                <ReactTable
                    data={this.props.globalStore.missionsForHabitat.slice()}
                    noDataText="Pas de mission pour cet habitat"
                    columns={columns}
                    defaultPageSize={10}
                    className="-striped -highlight"
                    getTrProps={this.handleEventsOnMission}
                    SubComponent={ row => {
                        return (
                            <div className={style(csstips.gridSpaced(5), csstips.margin(10))}>
                                <PlansTable
                                    globalStore={this.props.globalStore}
                                    habitat={this.props.globalStore.habitat}
                                    mission={row.original}
                                    editable={false}
                                />
                            </div>
                        );
                    }}
                />
                <NewElementButton
                    name="Create new Habitat"
                    onClick={() => { 
                        this.dialogCreateMissionOpened = true;
                    }}
                />
                <Dialog
                    autoFocus={true}
                    enforceFocus={true}
                    usePortal={true}
                    canOutsideClickClose={true}
                    canEscapeKeyClose={true}
                    isOpen={this.missionToDelete !== undefined}
                    title={
                        this.missionToDelete !== undefined
                            ?
                            'Suppression mission "' + this.missionToDelete.date_debut + '-' + this.missionToDelete.date_fin + '", id[' + this.missionToDelete.id + ']'
                            :
                            'Erreur mission inexistante'
                        }
                    icon="warning-sign"
                    onClose={() => { this.missionToDelete = undefined; }}
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
                                onClick={() => { this.missionToDelete = undefined; }}
                            />
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.DANGER}
                                icon="warning-sign"
                                text="Supprimer"
                                onClick={this.handleDeleteMission}
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
                    isOpen={this.dialogCreateMissionOpened}
                    title="Nouvelle mission"
                    icon="new-person"
                    onClose={() => { this.dialogCreateMissionOpened = false; }}
                >
                    <div className={style(csstips.flex, csstips.vertical)}>
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldNameStyle}>
                                Date de début
                            </div>
                            <div className={dialogFieldValueStyle}>
                                <DatePicker
                                    selected={new Date(this.missionToCreate.date_debut)}
                                    onChange={(date: Date) => {
                                        this.missionToCreate.date_debut = DateUtils.dateToSql(date); // .format('YYYY-MM-DD HH:mm:ss');
                                    }}
                                    // minDate={this.dateInterval.minDate}
                                    // maxDate={this.dateInterval.maxDate}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="Date de début"
                                />
                            </div>
                        </div>
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldNameStyle}>
                                Date de fin
                            </div>
                            <div className={dialogFieldValueStyle}>
                                <DatePicker
                                    selected={new Date(this.missionToCreate.date_fin)}
                                    onChange={(date: Date) => {
                                        this.missionToCreate.date_fin = DateUtils.dateToSql(date); // .format('YYYY-MM-DD HH:mm:ss');
                                    }}
                                    // minDate={this.dateInterval.minDate}
                                    // maxDate={this.dateInterval.maxDate}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="Date de fin"
                                />
                            </div>
                        </div>
                        <div className={dialogLineStyle}>
                            <div className={dialogFieldNameStyle}>
                                Cluster
                            </div>
                            <div className={dialogFieldValueStyle}>
                                <DataClusterSelector
                                    databaseIdSelected={this.missionToCreate.databaseId}
                                    globalStore={this.props.globalStore}
                                    handleSelect={(databaseIdSelected: string) => { this.missionToCreate.databaseId = databaseIdSelected; }}
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
                                onClick={() => { this.dialogCreateMissionOpened = false; }}
                            />
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.PRIMARY}
                                icon="add"
                                text="Créer"
                                onClick={this.handleCreateMission}
                            />
                        </div>
                    </div>
                </Dialog>
            </div>
        );
    }

    private handleDeleteMission = () => {
        this.props.globalStore.deleteMission(this.missionToDelete, this.password);
        this.missionToDelete = undefined;
        this.enableLineSelect = true;
    }

    private handleCreateMission = () => {
        this.props.globalStore.writeMission(this.missionToCreate, this.password);
        this.dialogCreateMissionOpened = false;
    };
}