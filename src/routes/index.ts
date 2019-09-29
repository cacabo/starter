import { Router } from 'express'
import UserRouter from './Users'
import AuthRouter from './Auth'
import { OK } from 'http-status-codes'

// Init router and path
const router = Router()

// Add sub-routes
router.use('/users', UserRouter)
router.use('/auth', AuthRouter)

router.get('/', async (_, res) => {
  res.status(OK).send('API is up and running')
})

export default router
