import * as React from 'react';
// import { render } from "react-dom";

// Import React Table
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { IClient } from 'src/interfaces/IClient';
import { IHabitat } from 'src/interfaces/IHabitat';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { MissionsTable } from 'src/pages/Mission/MissionsTable';

interface IProps {
    client: IClient;
}

@observer export class HabitatsTable extends React.Component<IProps, {}> {

    @observable private habitats: IHabitat[] = [];

    // https://react-table.js.org/#/story/readme
    constructor(props: IProps) {
        super(props);
    }

    getHabitatsForClient = (id: number) => {
        if (!id) {
            return Promise.resolve({ habitats: [] });
        }
        var request = `http://test.ideesalter.com/alia_searchHabitat.php?client_id=${id}`;
        return fetch(request)
            .then((response) => response.json())
            .then((habitats) => {this.habitats = habitats});
    }

    componentDidMount() {
        if (this.props.client) {
            this.getHabitatsForClient(this.props.client.id);
        }
    }

    componentWillReceiveProps(props: IProps) {
        if (props.client) {
            this.getHabitatsForClient(props.client.id);
        }
    }

    // id
    // nom
    // adresse
    // email
    // telephone
    handleEventsOnHabitat = (state: any, rowInfo: any, column: any, instance: any) => {
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
        console.log('render habitat')
        const columns = [
        {
            Header: 'Habitat id',
            accessor: 'id'
        },
        {
            Header: 'Adresse',
            accessor: 'adresse'
        },
        // { Header: "localisation",
        //   accessor: d =>  ({latitude: d.gps_latitude,
        //                     longitude: d.gps_longitude,
        //                     elevation: d.gps_elevation
        //                   })
        // },
        ];

        if ( this.habitats.length === 0 || (this.habitats.length === 1 && this.habitats[0] === undefined ) ) {
            return (
                <div/>
            );
        }

        return (
            <div>
                <ReactTable
                    data={this.habitats.slice()}
                    noDataText="Pas d'habitat pour ce client"
                    columns={columns}
                    defaultPageSize={1}
                    className="-striped -highlight"
                    getTrProps={this.handleEventsOnHabitat}
                    SubComponent={ row => {
                        return (<MissionsTable habitat={row.original} />);
                    }}
                />
                <br />
            </div>
        );
    }
}