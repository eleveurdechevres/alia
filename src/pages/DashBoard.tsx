import * as React from 'react';
import { ClientSearchComponent } from './ClientSearchComponent';
import { IClient } from 'src/interfaces/IClient';
import { ClientSummary } from './ClientSummary';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { ClientsTable } from './Client/ClientsTable';
// import selectStyles  from 'react-select/dist/react-select.css';

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
            <div>
                <header>
                    <p>ALIA chart analysis</p>
                    <ClientSearchComponent handler={this.handlerClientSearch}/>
                    <br/>
                    <ClientSummary client={this.currentClient}/>
                </header>
                <ClientsTable client={this.currentClient} handler={this.handlerClientSelect}/>
                <footer/>
                </div>
        );
    }
}