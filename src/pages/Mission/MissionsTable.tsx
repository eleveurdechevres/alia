import * as React from 'react';
// import { render } from "react-dom";

// Import React Table
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { IHabitat } from 'src/interfaces/IHabitat';
import { PlansTable } from '../Plan/PlansTable';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { IMission } from 'src/interfaces/IMission';

interface IProps {
    habitat: IHabitat;
}

@observer export class MissionsTable extends React.Component<IProps, {}> {

    @observable private habitat: IHabitat;
    @observable private missions: IMission[] = [];

  // https://react-table.js.org/#/story/readme
  constructor(props: IProps) {
    super(props);

    this.habitat = props.habitat;
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
    this.getMissionsForHabitat(this.habitat.id);
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
        //   var currentHabitat = rowInfo.original;
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
      { Header: 'Mission id',
        accessor: 'id'
      },
      { Header: 'Date début',
        accessor: 'date_debut'
      },
      { Header: 'Date fin',
        accessor: 'date_fin'
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
          defaultPageSize={this.missions.length < 5 ? this.missions.length : 5}
          className="-striped -highlight"
          getTrProps={this.handleEventsOnMission}
          SubComponent={ row => {
            return (<PlansTable habitat={this.habitat} mission={row.original}/>);
          }}
        />
        <br />
      </div>
    );
  }
}