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
import { IAvailableCapteur } from 'src/interfaces/IAvailableCapteur';
import { IChannel } from 'src/interfaces/IChannel';

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
                Header: '',
                accessor: 'available',
                width: 28,
                Cell: (row: RowInfo) => {
                    const capteur: IAvailableCapteur = row.original;
                    return (
                        <Icon
                            icon={capteur.available ? 'tick' : 'ban-circle'}
                            intent={capteur.available ? Intent.SUCCESS : Intent.DANGER}
                        />
                    );
                }
            },
            {
                Header: 'Capteur id',
                accessor: 'id',
                width: 80
            },
            {
                Header: 'Ref interne',
                accessor: 'capteur_reference_id',
                width: 260
            },
            {
                Header: 'Marque',
                accessor: 'marque',
                width: 130
            },
            {
                Header: 'Ref fabricant',
                accessor: 'ref_fabricant',
                width: 150
            },
            {
                Header: 'Description',
                accessor: 'description',
                width: 410
            },
            {
                Header: 'Channels',
                accessor: 'channels',
                style: { overflow: 'visible' },
                Cell: (row: RowInfo) => {
                    const capteur: IAvailableCapteur = row.original;
                    return (
                        capteur.channels.map((channel: IChannel) => channel.measure_type).join(', ')
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
                    getTrGroupProps={(finalState: any, rowInfo?: RowInfo, column?: undefined, instance?: any) => {
                        let background: string = undefined;
                        if (rowInfo !== undefined) {
                            background = rowInfo.original === this.props.selectedCapteur ? 'lightgreen' : undefined;
                        }

                        return {
                            style: {
                                background: background,
                                cursor: 'pointer'
                            }
                        }
                    }}
                />
            </div>
        );
    }
}
