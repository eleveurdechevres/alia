import * as React from 'react';
import './App.css';
import { DashBoard } from './pages/DashBoard';
// import * as csstips from 'csstips'; 
// import { style } from 'typestyle/lib';

class App extends React.Component {
  constructor(props: {}) {
    super(props);
  }
  
  render() {
    return (
      <div className={'App'}>
        <DashBoard />
      </div>
    );
  }
}

export default App;
