import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import { GlobalStore } from 'src/stores/GlobalStore';
import { Auth0Provider } from '@auth0/auth0-react';

const globalStore: GlobalStore = new GlobalStore();

ReactDOM.render(
    <Auth0Provider
        domain="dev-vwrtlbjh.eu.auth0.com"
        clientId="PMAAmyYnIqVK2PEZ3yApS6472OsNMWrB"
        redirectUri={window.location.origin}
    >
        <App
            globalStore={globalStore}
        />
    </Auth0Provider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
