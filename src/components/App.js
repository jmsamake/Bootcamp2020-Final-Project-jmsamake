import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import './App.css';
import Poster from './Poster';
import Submitter from './Submitter';

export default function App() {
  return (
    <Router>
      <div>
        <ul>
          <li>
            <Link to="/poster">Job Poster</Link>
          </li>
          <li>
            <Link to="/submitter">Job hunter</Link>
          </li>  
        </ul>

        <hr />
 
        <Switch>
          <Route exact path="/poster">
            <Poster />
          </Route>
          <Route path="/submitter">
            <Submitter />
          </Route>
          
        </Switch>
      </div>
    </Router>
  );
}