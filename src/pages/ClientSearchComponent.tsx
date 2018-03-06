import * as React from 'react';
// import PropTypes from 'prop-types';
import Select, { Async } from 'react-select';
import * as fetch from 'isomorphic-fetch';
import { InterfaceClient } from "../interfaces/InterfaceClient"

interface InterfaceProps {
	handler: (client: string) => {}
}

interface InterfaceState {
	client: string
}

export class ClientSearchComponent extends React.Component<InterfaceProps, InterfaceState> {

    // https://jedwatson.github.io/react-select/
    // https://github.com/JedWatson/react-select/blob/master/examples/src/components/GithubUsers.js
	
    constructor(props: InterfaceProps) {
        super(props)
    }

	onChange = (client: string) => {
		this.setState({
			client: client,
        });
        this.props.handler(client);
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
		const AsyncComponent = Select.Async;

			return (
			<div className="section">
				<AsyncComponent 
					width="100" 
					client={this.state.client} 
					onChange={this.onChange()} 
					onValueClick={this.gotoUser} 
					valueKey="id" 
					labelKey="nom" 
					loadOptions={this.getClients} />
			</div>
		);
	}
}
