import * as React from 'react';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
// import { render } from "react-dom";

// Import React Table
import ReactTable, { RowInfo } from 'react-table';
import 'react-table/react-table.css';
import * as moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { IHabitat } from 'src/interfaces/IHabitat';
import { PlansTable } from '../Plan/PlansTable';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { IMission } from 'src/interfaces/IMission';
import { NewElementButton } from 'src/components/NewElementButton';
import { Dialog, Button, Intent, InputGroup, Icon } from '@blueprintjs/core';

interface IProps {
    habitat: IHabitat;
}

const dialogLineStyle = style(csstips.margin(10), csstips.flex, csstips.horizontal);
const dialogFieldNameStyle = style(csstips.width(80), csstips.margin(5, 5));
const dialogFieldValueStyle = style(csstips.flex);

@observer export class Missions extends React.Component<IProps, {}> {

    @observable private missions: IMission[] = [];
    @observable private missionToDelete: IMission | undefined = undefined;
    @observable private dialogCreateMissionOpened: boolean = false;
    @observable private enableLineSelect: boolean = true;
    private password: string = '';
    @observable private missionToCreate: IMission = {
        id: undefined,
        habitat_id: undefined,
        date_debut: moment().format('YYYY-MM-DD HH:mm:ss'),
        date_fin: moment().format('YYYY-MM-DD HH:mm:ss')
    };

  // https://react-table.js.org/#/story/readme
  constructor(props: IProps) {
    super(props);
  }

  getMissionsForHabitat = (id: number) => {
    if (!id) {
      return Promise.resolve({ missions: [] });
    }
    var request = `http://test.ideesalter.com/alia_searchMission.php?habitat_id=${id}`;
    return fetch(request)
      .then((response) => response.json())
      .then((missions) => {this.missions = missions});
  }

  componentDidMount() {
    this.getMissionsForHabitat(this.props.habitat.id);
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
            { Header: 'Mission id',
                accessor: 'id',
                width: 100
            },
            { Header: 'Date début',
                accessor: 'date_debut',
                width: 150
            },
            { Header: 'Date fin',
                accessor: 'date_fin',
                width: 150
            },
            {
                Cell: (row: RowInfo) => {
                    return (
                        <div className={style(csstips.gridSpaced(10))}>
                            <Icon
                                icon="trash"
                                title="Supprimer la mission"
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

        if ( this.missions.length === 0 || (this.missions.length === 1 && this.missions[0] === undefined ) ) {
        return (
            <div/>
        );
        }

        return (
            <div>
                <ReactTable
                    data={this.missions.slice()}
                    noDataText="Pas de mission pour cet habitat"
                    columns={columns}
                    defaultPageSize={10}
                    className="-striped -highlight"
                    getTrProps={this.handleEventsOnMission}
                    SubComponent={ row => {
                        return (
                            <div className={style(csstips.gridSpaced(5), csstips.margin(10))}>
                                <Button
                                    icon="insert"
                                    text="Ajouter un plan"
                                    onClick={() => {
                                        console.log('TODO : create plan')
                                    }}
                                />
                                <PlansTable habitat={this.props.habitat} mission={row.original}/>
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
                                    selected={moment(this.missionToCreate.date_debut)}
                                    onChange={(date: moment.Moment) => {
                                        this.missionToCreate.date_debut = date.format('YYYY-MM-DD HH:mm:ss');
                                    }}
                                    // minDate={this.dateInterval.minDate}
                                    // maxDate={this.dateInterval.maxDate}
                                    dateFormat="DD/MM/YYYY"
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
                                    selected={moment(this.missionToCreate.date_fin)}
                                    onChange={(date: moment.Moment) => {
                                        this.missionToCreate.date_fin = date.format('YYYY-MM-DD HH:mm:ss');
                                    }}
                                    // minDate={this.dateInterval.minDate}
                                    // maxDate={this.dateInterval.maxDate}
                                    dateFormat="DD/MM/YYYY"
                                    placeholderText="Date de fin"
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
        fetch(`http://testbase.ideesalter.com/alia_deleteMission.php?id=` + this.missionToDelete.id + `&password=` + encodeURIComponent(this.password))
            .then((response) => {
                if (response.status === 200) {
                    this.getMissionsForHabitat(this.props.habitat.id);
                } else {
                    console.log(response);
                    // TODO : impossible de supprimer...
            }
        });
        this.missionToDelete = undefined;
        this.enableLineSelect = true;
    }

    private handleCreateMission = () => {
        this.handleWriteMission(this.missionToCreate);
        this.dialogCreateMissionOpened = false;
    };

    private handleWriteMission = (mission: IMission) => {
        fetch(`http://testbase.ideesalter.com/alia_writeMission.php` +
            `?id=` + mission.id +
            `&habitat_id=` + this.props.habitat.id + 
            `&date_debut=` + encodeURIComponent(mission.date_debut) + 
            `&date_fin=` + encodeURIComponent(mission.date_fin) + 
            `&password=` + encodeURIComponent(this.password)
        ).then((response) => {
                if (response.status === 200) {
                    this.getMissionsForHabitat(this.props.habitat.id);
                } else {
                    console.log(response);
                    // TODO : impossible de sauvegarder...
            }
        });
    }  
}