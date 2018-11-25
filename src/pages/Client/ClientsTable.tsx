import * as React from 'react';
// import { render } from "react-dom";

// Import React Table
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { HabitatsTable } from '../Habitat/HabitatsTable';
import { IClient } from 'src/interfaces/IClient';
import { observer } from 'mobx-react';

interface IProps {
    client: IClient;
    handler: (client: IClient) => void;
}
@observer export class ClientsTable extends React.Component<IProps, {}> {

  // https://react-table.js.org/#/story/readme
  constructor(props: IProps) {
      super(props);
  }

  // id
  // nom
  // adresse
  // email
  // telephone
  onRowClick = (state: any, rowInfo: any, column: any, instance: any) => {
    return {
        onClick: (e: any) => {
          var client = rowInfo.original;
          this.props.handler( client );
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
      { Header: 'client id',
        accessor: 'id'
      },
      { Header: 'Nom',
        accessor: 'nom'
      },
      { Header: 'Adresse',
        accessor: 'adresse'
      },
      { Header: 'email',
        accessor: 'email'
      },
      { Header: 'Téléphone',
        accessor: 'telephone'
      }
    ];

    // if ( this.clients.length === 0 || ( this.clients.length === 1 && this.clients[0] === undefined ) ) {
    if ( this.props.client === undefined ) {
      return (
        <div/>
      );
    }

    return (

      <div>
        <ReactTable
          data={[this.props.client]}
          columns={columns}
          defaultPageSize={1}
          className="-striped -highlight"
          getTrProps={this.onRowClick}
          showPagination={false}
          showPageJump={false}
          sortable={false}
          SubComponent={ row => {
            return (<HabitatsTable client={row.original} />);
          }}
        />
        <br />
      </div>
    );
  }
}
