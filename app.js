const config = require("./utils/config")
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const loginRouter = require('./controllers/loginRouter')
const blogRouter = require('./controllers/blogRouter')
const userRouter = require('./controllers/userRouter')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')


const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)


mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(express.static('dist'))

app.use(cors())
app.use(express.json())
app.use(middleware.getTokenFrom)
app.use(middleware.requestLogger)

app.use('/api/login', loginRouter)
app.use('/api/blogs', blogRouter)
app.use('/api/users', userRouter)

if( process.env.NODE_ENV === 'test' ) {
  const testRouter = require('./controllers/testing')
  app.use('/api/testing', testRouter)
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app