const createError = require('http-errors')
const express = require('express')
const bodyParser = require('body-parser')
const logger = require('morgan')
const favicon = require('serve-favicon')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const app = express()
const cors = require('cors')

module.exports = () => new Promise(async (resolve, reject) => {
  app.use(cors({
    methods:'SEARCH,GET,HEAD,PUT,PATCH,POST,DELETE'
  }))
  // app.use(fileUpload)

  app.use(favicon(path.join(__dirname, 'web-icon.png')))

  process.env.NODE_ENV === 'development' && app.use(logger('dev'))

  app.use(bodyParser.json({ limit: "500mb" }))
  app.use(bodyParser.urlencoded({ limit: "500mb", extended: true, parameterLimit: 50000 }))

  app.use(cookieParser())
  app.use(methodOverride())

  app.set('port', process.env.HTTP_PORT)

  // app.use('/media', express.static(path.join(__root, '../public')))

  global.getSearchParams=require('../lib/searchHelper').getSearchParams

  global.restControllers={
    auth: await util.moduleLoader(path.join(__dirname, '/controllers/auth'), '.controller.js'),
    haham: await util.moduleLoader(path.join(__dirname, '/controllers/haham'), '.controller.js'),
    admin: await util.moduleLoader(path.join(__dirname, '/controllers/admin'), '.controller.js'),
    // repo:await util.moduleLoader(path.join(__dirname, '/controllers/repo'), '.controller.js'),
    session:await util.moduleLoader(path.join(__dirname, '/controllers/session'), '.controller.js'),
  }

  
  // Object.keys(restControllers.auth).forEach((key)=>{
  //   console.log(`auth :`, key)
  // })
  require('./routes')(app)
  resolve(app)
  eventLog(`[RestAPI]`.cyan, 'started')
  
})
