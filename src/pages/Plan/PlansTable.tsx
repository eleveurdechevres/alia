import * as React from 'react';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
// import { render } from "react-dom";

// Import React Table
import ReactTable, { RowInfo } from 'react-table';
import 'react-table/react-table.css';
import { Plan } from '../Plan/Plan';
// import { zip } from "d3-array";
import './Plan.css'
import { IHabitat } from 'src/interfaces/IHabitat';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { IPlan } from 'src/interfaces/IPlan';
import { IMission } from 'src/interfaces/IMission';
import { GlobalStore } from 'src/stores/GlobalStore';
import { Icon, InputGroup, Dialog, Button, Intent } from '@blueprintjs/core';

interface IProps {
    globalStore: GlobalStore;
    habitat: IHabitat;
    mission: IMission;
    editable: boolean;
}

@observer export class PlansTable extends React.Component<IProps, {}> {

    @observable private habitat: IHabitat;
    @observable private planToDelete: IPlan | undefined = undefined;
    private password: string = '';

  // https://react-table.js.org/#/story/readme
  constructor(props: IProps) {
    super(props);

    this.habitat = props.habitat;
  }

  componentDidMount() {
    this.props.globalStore.reloadPlansForHabitat(this.habitat.id);
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
  handleEventsOnPlan = (state: any, rowInfo: any, column: any, instance: any) => {
    return {
      onClick: (e: any) => {
        // var currentPlan = rowInfo.original;
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
            { Header: 'Plan id',
                accessor: 'id'
            },
            { Header: 'Etage',
                accessor: 'etage',

                
            },
            {
                width: 40,
                Cell: (row: RowInfo) => {
                    return this.props.editable ?
                        (
                            <Icon
                                className={style({cursor: 'pointer'})}
                                icon="trash"
                                intent={Intent.DANGER}
                                onClick={() => {
                                    this.planToDelete = row.original;
                                }}
                            />
                        ) : <React.Fragment/>;
                }
            }
        ];

        let plans = this.props.globalStore.plansForHabitat.get(this.habitat.id);
        if ( plans === undefined || plans.length === 0 ||
            (plans.length === 1 && plans[0] === undefined ) ) {
            return (
                <React.Fragment/>
            );
        }
        return (
            <div>
                <ReactTable
                    data={plans.slice()}
                    noDataText="Pas de plan pour cet habitat"
                    columns={columns}
                    defaultPageSize={plans.length}
                    showPagination={false}
                    showPageJump={false}
                    className="-striped -highlight"
                    getTrProps={this.handleEventsOnPlan}
                    SubComponent={ row => {
                        return (
                            <Plan
                                globalStore={this.props.globalStore}
                                habitat={this.habitat}
                                planId={row.original.id}
                                mission={this.props.mission}
                            />
                        );
                    }}
                />
                <br />
                <Dialog
                    autoFocus={true}
                    enforceFocus={true}
                    usePortal={true}
                    canOutsideClickClose={true}
                    canEscapeKeyClose={true}
                    isOpen={this.planToDelete !== undefined}
                    title={this.planToDelete !== undefined ? 'Suppression plan  id[' + this.planToDelete.id + ']' : 'Erreur plan inexistant'}
                    icon="warning-sign"
                    onClose={() => { this.planToDelete = undefined; }}
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
                                onClick={() => { this.planToDelete = undefined; }}
                            />
                            <Button
                                className={style(csstips.margin(10), csstips.flex)}
                                intent={Intent.DANGER}
                                icon="warning-sign"
                                text="Supprimer"
                                onClick={this.handleDeletePlan}
                            />
                        </div>
                    </div>
                </Dialog>
            </div>
        );
    }

    private handleDeletePlan = () => {
        this.props.globalStore.deletePlan(this.planToDelete, this.password);
        this.planToDelete = undefined;
    }

}

