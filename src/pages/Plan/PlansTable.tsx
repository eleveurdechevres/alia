import * as React from 'react';
// import { render } from "react-dom";

// Import React Table
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { Plan } from '../Plan/Plan';
// import { zip } from "d3-array";
import './Plan.css'
import { IHabitat } from 'src/interfaces/IHabitat';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { IPlan } from 'src/interfaces/IPlan';

interface IProps {
    habitat: IHabitat;
}

@observer export class PlansTable extends React.Component<IProps, {}> {

    @observable private habitat: IHabitat;
    @observable private plans: IPlan[] = [];

  // https://react-table.js.org/#/story/readme
  constructor(props: IProps) {
    super(props);

    this.habitat = props.habitat;
  }

  getPlansForHabitat = (id: number) => {
    if (!id) {
      return Promise.resolve({ plans: [] });
    }

    return fetch(`http://test.ideesalter.com/alia_searchPlan.php?habitat_id=${id}`)
      .then((response) => response.json())
      .then((plans) => {
          this.plans = plans
      }
    );
  }

  componentDidMount() {
    this.getPlansForHabitat(this.habitat.id);
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
      { Header: 'Id',
        accessor: 'id'
      },
      { Header: 'Etage',
        accessor: 'etage'
      },
      // { Header: "localisation",
      //   accessor: d =>  ({latitude: d.gps_latitude,
      //                     longitude: d.gps_longitude,
      //                     elevation: d.gps_elevation
      //                   })
      // },
    ];

    if ( this.plans.length === 0 ||
        (this.plans.length === 1 && this.plans[0] === undefined ) ) {
      return (
        <div/>
      );
    }

    return (
      <div>
        <ReactTable
          data={this.plans.slice()}
          noDataText="Pas de plan pour ce client"
          columns={columns}
          defaultPageSize={this.plans.length}
          showPagination={false}
          showPageJump={false}
          className="-striped -highlight"
          getTrProps={this.handleEventsOnPlan}
          SubComponent={ row => {
            return (<Plan habitatId={this.habitat.id} id={row.original.id} />);
          }}
        />
        <br />
      </div>
    );
  }
}