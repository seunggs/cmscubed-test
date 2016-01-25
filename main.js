import React from 'react'
import {render} from 'react-dom'
import {Router, Route, Link, createElement} from 'react-router'
import App from './routes/App'
import './assets/styles/main.css'

render((
  <Router>
    <Route path="/" component={App}>
    </Route>
  </Router>
), document.getElementById('app'))
