import * as React from 'react';
// import { ClientSummary } from './ClientSummary';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
// import { ClientsTable } from './Client/ClientsTable';
// import { TestComponent } from 'src/pages/tests/TestComponent';
import { style } from 'typestyle/lib';
import * as csstips from 'csstips'; 
import { IClient } from 'src/interfaces/IClient';
import { HabitatsTable } from 'src/pages/Habitat/HabitatsTable';
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

interface IProps {
    currentClient: IClient
}

@observer export class DashBoard extends React.Component<IProps, {}> {

    // habitats: [];
    @observable modalIsOpen: boolean = false;

    constructor(props: IProps) {
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
    
    handlerClientSelect = (client: IClient) => {
        //     //this.getHabitatsForClient(client.id);    
    }

    render() {
        console.log('titi')
        return (
            <div className={style(csstips.vertical, csstips.flex, csstips.fillParent)}>
                <div className={style(csstips.flex)}>
                    {/* <p>ALIA chart analysis</p>
                    <ClientSearchComponent handler={this.handlerClientSearch}/>
                    <br/> */}
                    {/* <ClientSummary client={this.props.currentClient}/> */}
                </div>
                <div className={style(csstips.flex)}>
                    {/* <ClientsTable client={this.props.currentClient} handler={this.handlerClientSelect}/> */}
                    <HabitatsTable client={this.props.currentClient} />
                </div>
                {/* TESTS */}
                {/* <div className={style(csstips.width(340), csstips.vertical, csstips.height(300))}>
                    <TestComponent />
                </div> */}
            </div>
        );
    }
}