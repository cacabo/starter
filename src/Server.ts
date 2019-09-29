import cookieParser from 'cookie-parser'
import express from 'express'
import logger from 'morgan'
import path from 'path'
import mongoose from 'mongoose'

import BaseRouter from './routes'

import { Request, Response } from 'express'
import { jwtCookieProps } from '@shared'

// Init express
const app = express()

/**
 * Connect to the MongoDB database
 * If this fails, throw an error and exit the app
 */
const connectToMongo = async () => {
  try {
    console.log('Connecting to MongoDB database...') // tslint:disable-line
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/starter',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    )

    console.log('Connected to database successfully.') // tslint:disable-line
  } catch (error) {
    console.log('There was an error connecting to the database.') // tslint:disable-line
    process.exit(1)
  }
}

connectToMongo()

// Add middleware/settings/routes to express.
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/api', BaseRouter)

/**
 * Serve front-end content.
 */
const viewsDir = path.join(__dirname, 'views')
app.set('views', viewsDir)
const staticDir = path.join(__dirname, 'public')
app.use(express.static(staticDir))

app.get('/', (_, res: Response) => {
  res.sendFile('login.html', { root: viewsDir })
})

app.get('/users', (req: Request, res: Response) => {
  const jwt = req.signedCookies[jwtCookieProps.key]
  if (!jwt) {
    res.redirect('/')
  } else {
    res.sendFile('users.html', { root: viewsDir })
  }
})

// Export express instance
export default app
