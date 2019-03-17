import * as React from 'react';
// import PropTypes from 'prop-types';
import { Async } from 'react-select';
import { style } from 'typestyle';
import * as csstips from 'csstips';
import 'react-select/dist/react-select.css';
import { observer } from 'mobx-react';
import { GlobalStore } from 'src/stores/GlobalStore';
import { IClient } from 'src/interfaces/IClient';

interface IProps {
    globalStore: GlobalStore
}

const selectStyle: any = style(csstips.content, csstips.fillParent);

@observer export class ClientSearchComponent extends React.Component<IProps, {}> {

    // https://jedwatson.github.io/react-select/
    // https://github.com/JedWatson/react-select/blob/master/examples/src/components/GithubUsers.js

    constructor(props: IProps) {
        super(props);
    }

    render () {
        return (
            <div>
                <Async 
                    autosize={true}
                    className={selectStyle}
                    value={this.props.globalStore.client}
                    onChange={(client: IClient) => this.props.globalStore.client = client} 
                    valueKey="id"
                    labelKey="nom"
                    loadOptions={this.props.globalStore.searchClients}
                />
            </div>
        );
    }
}
