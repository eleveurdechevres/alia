import * as React from 'react';
import { ClientSearchComponent } from './ClientSearchComponent';
import { IClient } from 'src/interfaces/IClient';
import { ClientSummary } from './ClientSummary';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { ClientsTable } from './Client/ClientsTable';
// import { TestComponent } from 'src/pages/TestComponent';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips'; 
// const customStyles = {
//     overlay : {
//       position          : 'fixed',
//       top               : 0,
//       left              : 0,
//       right             : 0,
//       bottom            : 0,
//       backgroundColor   : 'rgba(255, 255, 255, 0.75)'
//     },
//     content : {
//       position                   : 'absolute',
//       top                        : '40px',
//       left                       : '40px',
//       right                      : '40px',
//       bottom                     : '40px',
//       border                     : '1px solid #ccc',
//       background                 : '#fff',
//       overflow                   : 'auto',
//       WebkitOverflowScrolling    : 'touch',
//       borderRadius               : '4px',
//       outline                    : 'none',
//       padding                    : '20px'
//     }
// };

@observer export class DashBoard extends React.Component<{}, {}> {

    @observable currentClient: IClient = undefined;
    // habitats: [];
    @observable modalIsOpen: boolean = false;

    constructor(props: {}) {
        super(props);
    }

    openModal = () => {
        this.modalIsOpen = true;
    }

    afterOpenModal = () => {
        // references are now sync'd and can be accessed.
    }

    closeModal = () => {
        this.modalIsOpen = false;
    }
    
    handlerClientSearch = (client: IClient) => {
        this.currentClient = client;
    }

    handlerClientSelect = (client: IClient) => {
    //     //this.getHabitatsForClient(client.id);    
    }

    render() {
        return (
            <div className={style(csstips.vertical, csstips.flex, csstips.fillParent)}>
                <div className={style(csstips.flex1)}>
                    <p>ALIA chart analysis</p>
                    <ClientSearchComponent handler={this.handlerClientSearch}/>
                    <br/>
                    <ClientSummary client={this.currentClient}/>
                </div>
                <div className={style(csstips.flex)}>
                    <ClientsTable client={this.currentClient} handler={this.handlerClientSelect}/>
                </div>
                {/* TESTS */}
                {/* <div className={style(csstips.width(340), csstips.vertical, csstips.height(300))}>
                    <TestComponent />
                </div> */}
            </div>
        );
    }
}