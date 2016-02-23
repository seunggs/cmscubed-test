import React from 'react'
import {render} from 'react-dom'
import {Router, Route, IndexRoute, Link, browserHistory, createElement} from 'react-router'
import './assets/styles/main.css'
import App from './routes/App/'
import Home from './routes/App/Home/'
import About from './routes/App/About/'
import Products from './routes/App/Products/'
import Hacker from './routes/App/Products/Hacker/'
import Pro from './routes/App/Products/Pro/'
import {getRootContent, useContentPlaceholder} from './modules/client/core'

const routes = (
  <Route path="/" component={App}>
    <IndexRoute component={Home} />
    <Route path="about" component={About} />
    <Route path="products" component={Products}>
      <Route path="hacker" component={Hacker} />
      <Route path="pro" component={Pro} />
    </Route>
  </Route>
)

getRootContent('cmscubed-test.com', '/', {excludedRoutes: [], contentPlaceholder: '*'}).subscribe(rootContent => {
  console.log('rootContent arrived! ', rootContent)
  const createElement = (Component, props) => {
    props.rootContent = rootContent
    return <Component {...props} />
  }

  render((
    <Router routes={routes} createElement={createElement} history={browserHistory} />
  ), document.getElementById('app'))
})
