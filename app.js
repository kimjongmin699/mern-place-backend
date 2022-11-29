import express from 'express'
const bodyParser = require('body-parser')

import placesRouter from './routes/place-routes'
import usersRouter from './routes/users-routes'
import fs from 'fs'
import path from 'path'

const app = express()

app.use(bodyParser.json())
app.use('/uploads/images', express.static(path.join('uploads', 'images')))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin,X-Requested-With, Content-Type,Accept,Authorization'
  )
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  next()
})

app.use('/api/places', placesRouter)
app.use('/api/users', usersRouter)

app.use((req, res, next) => {
  const error = new Error('Could not find this route.', 404)
  throw error
})

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err)
    })
  }
  if (res.headerSent) {
    return next(error)
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || 'An unknown error occer!' })
})

app.listen(process.env.PORT || 5000, () => console.log(`Server start in 5000`))
