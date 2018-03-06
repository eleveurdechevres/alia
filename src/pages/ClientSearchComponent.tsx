import * as React from 'react';
// import PropTypes from 'prop-types';
import { Async } from 'react-select';
import * as fetch from 'isomorphic-fetch';
import { IClient } from '../interfaces/IClient';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import 'react-select/dist/react-select.css';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

interface IProps {
    handler: (client: IClient) => void;
}

const selectStyle: any = style(csstips.content, csstips.width(500));

@observer export class ClientSearchComponent extends React.Component<IProps, {}> {

    @observable client: IClient;
    // https://jedwatson.github.io/react-select/
    // https://github.com/JedWatson/react-select/blob/master/examples/src/components/GithubUsers.js

    constructor(props: IProps) {
        super(props);
    }

    onChange = (client: IClient) => {
        this.client = client;
        this.props.handler(client);
    }

    gotoUser = (element: any) => {
        // TODO : lien vers le fichier client
        console.log(element);
    }
   
    getClients (nom: string) {
        if (!nom) {
            return Promise.resolve({ options: [] });
        }

        return fetch(`http://test.ideesalter.com/alia_searchClient.php?nom=${nom}`)
        .then((response) => response.json())
        .then((clients) => {
            return { options: clients };
        });
    }
    
    render () {

        return (
            <div className={style(csstips.flex)}>
                <Async 
                    autosize={true}
                    className={selectStyle}
                    value={this.client}
                    onChange={(element: IClient) => this.onChange(element)} 
                    onValueClick={this.gotoUser} 
                    valueKey="id" 
                    labelKey="nom" 
                    loadOptions={this.getClients}
                />
            </div>
        );
    }
}
