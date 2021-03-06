import path from 'path'
import express from 'express'
import {Server} from 'http'
import config from './server-config'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import methodOverride from 'method-override'
import routes from './server/routes'
import {convertDBContentObjsToContent} from './modules/core/content'

const app = express()
const server = Server(app)

// set up express
app.use(morgan('dev')) // log every request to the console
app.use(bodyParser.json())
app.use(bodyParser.json({type: 'application/vnd.api+json'}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('X-HTTP-Method-Override'))
app.use(express.static(__dirname))

// set up router
app.use('/', routes);

server.listen(config.port, () => console.log(`Listening on ${config.port}`))
