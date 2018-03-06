import * as React from 'react';
import './App.css';
import { DashBoard } from './pages/DashBoard';

class App extends React.Component {
  constructor(props: {}) {
    super(props);
  }
  
  render() {
    return (
      <div className="App">
        <DashBoard />
      </div>
    );
  }
}

export default App;
