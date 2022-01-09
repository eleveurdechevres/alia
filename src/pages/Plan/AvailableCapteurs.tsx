import * as React from 'react';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips';
// Import React Table
import ReactTable, { RowInfo } from 'react-table';
import 'react-table/react-table.css';
// import { HabitatsTable } from '../Habitat/HabitatsTable';
import { observer } from 'mobx-react';
import { GlobalStore } from 'src/stores/GlobalStore';
import { Icon, Intent } from '@blueprintjs/core';

interface IProps {
    dateDebut: Date;
    dateFin: Date;
    globalStore: GlobalStore;
    selectedCapteur: IAvailableCapteur;
    filteredCapteurs: IAvailableCapteur[];
    handleSelectCapteur: (capteur: IAvailableCapteur) => void;
}

@observer export class AvailableCapteurTable extends React.Component<IProps, {}> {


    constructor(props: IProps) {
        super(props);
    }

    private handleEventsOnCapteur = (state: any, rowInfo: any, column: any, instance: any) => {
        return {
            onClick: (e: any) => {
                this.props.handleSelectCapteur(rowInfo.original)
            }
        }
    }

    public render() {
        const columns = [
            {
                Header: 'Capteur id',
                accessor: 'id',
            },
            {
                Header: 'Ref',
                accessor: 'capteur_reference_id',
            },
            {
                Header: 'Marque',
                accessor: 'marque'
            },
            {
                Header: 'Fabricant',
                accessor: 'ref_fabricant',
            },
            {
                Header: 'Description',
                accessor: 'description',
            },
            {
                Header: '',
                accessor: 'available',
                Cell: (row: RowInfo) => {
                    const capteur: IAvailableCapteur = row.original;
                    return (
                        <Icon
                            icon={capteur.available ? 'tick' : 'ban-circle'}
                            intent={capteur.available ? Intent.SUCCESS : Intent.DANGER}
                        />
                    );
                }
            }

        ];

        return (

            <div className={style(csstips.margin(10), { boxShadow: '1px 1px 10px #888' })}>
                <ReactTable
                    data={this.props.filteredCapteurs}
                    columns={columns}
                    defaultPageSize={10}
                    className="-striped -highlight"
                    getTrProps={this.handleEventsOnCapteur}
                    showPagination={true}
                    showPageJump={true}
                    sortable={true}
                    getTrGroupProps={() => {
                        return {
                            style: {
                                cursor: 'pointer'
                            }
                           }
                    }}
                    // SubComponent={ row => {
                    //     return (<HabitatsTable client={row.original} />);
                    // }}
                />
            </div>
        );
    }
}
