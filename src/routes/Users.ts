import { Request, Response, Router } from 'express'
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes'
import { ParamsDictionary } from 'express-serve-static-core'
import { UserDao } from '@daos'
import { paramMissingError, logger, adminMW } from '@shared'
import { UserRoles } from '@entities'

// Init shared
const router = Router()
const userDao = new UserDao()

/**
 * Get all users
 */
router.get('/all', adminMW, async (req: Request, res: Response) => {
  try {
    const users = await userDao.getAll()
    return res.status(OK).json({ users })
  } catch (err) {
    logger.error(err.message, err)
    return res.status(BAD_REQUEST).json({
      error: err.message,
    })
  }
})

/**
 * Create a new user
 */
router.post('/add', adminMW, async (req: Request, res: Response) => {
  try {
    // Check parameters
    const { user } = req.body
    if (!user) {
      return res.status(BAD_REQUEST).json({
        error: paramMissingError,
      })
    }

    // Add new user
    user.role = UserRoles.Standard
    await userDao.add(user)
    return res.status(CREATED).end()
  } catch (err) {
    logger.error(err.message, err)
    return res.status(BAD_REQUEST).json({
      error: err.message,
    })
  }
})

/**
 * Update the current user's account
 */
router.put('/update', adminMW, async (req: Request, res: Response) => {
  try {
    // Check Parameters
    const { user } = req.body
    if (!user) {
      return res.status(BAD_REQUEST).json({
        error: paramMissingError,
      })
    }

    // Update user
    user.id = Number(user.id)
    await userDao.update(user)
    return res.status(OK).end()
  } catch (err) {
    logger.error(err.message, err)
    return res.status(BAD_REQUEST).json({
      error: err.message,
    })
  }
})

/**
 * Delete the user with the specified ID
 */
router.delete('/delete/:id', adminMW, async (req: Request, res: Response) => {
  try {
    const { id } = req.params as ParamsDictionary
    await userDao.delete(Number(id))
    return res.status(OK).end()
  } catch (err) {
    logger.error(err.message, err)
    return res.status(BAD_REQUEST).json({
      error: err.message,
    })
  }
})

export default router
