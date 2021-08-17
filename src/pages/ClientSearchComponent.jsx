import * as React from 'react';
// import PropTypes from 'prop-types';
import Select from 'react-select/dist/react-select';
import fetch from 'isomorphic-fetch';

export class ClientSearchComponent extends React.Component {

    // https://jedwatson.github.io/react-select/
    // https://github.com/JedWatson/react-select/blob/master/examples/src/components/GithubUsers.js
    
    constructor(props) {
        super(props)
        this.state = {
        }
    }

	onChange = (client) => {
		this.setState({
			client: client,
        });
        this.props.handler(client);
    }
    
   
	getClients (nom) {
		if (!nom) {
			return Promise.resolve({ options: [] });
		}

        return fetch(`https://api.alia-france.com/alia_searchClient.php?nom=${nom}`)
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
					onChange={(element) => this.onChange(element)} 
					onValueClick={this.gotoUser} 
					valueKey="id" 
					labelKey="nom" 
					loadOptions={this.getClients} />
			</div>
		);
	}
}
