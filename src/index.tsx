import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import { GlobalStore } from 'src/stores/GlobalStore';

const globalStore: GlobalStore = new GlobalStore();

ReactDOM.render(
  <App
    globalStore={globalStore}
  />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
