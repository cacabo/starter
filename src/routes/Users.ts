import { Request, Response, Router } from 'express'
import { BAD_REQUEST, CREATED, OK, NOT_FOUND } from 'http-status-codes'
import { ParamsDictionary } from 'express-serve-static-core'
import { UserDao } from '@daos'
import { paramMissingError, adminMW } from '@shared'
import { IUser } from '@entities'
import { IUserDao } from 'src/daos/User/UserDao'
import { handleError, handleNotFound, handleBadRequest } from './handlers'

// TODO have more than just admin MW (probably need more info in the JWT)

// Init shared
const router = Router()
const userDao: IUserDao = new UserDao()

/**
 * Get all users
 */
router.get('/all', adminMW, async (_, res: Response) => {
  try {
    const users = await userDao.getAll()
    return res.status(OK).json({ users })
  } catch (err) {
    handleError(res, err)
  }
})

/**
 * Get user with the specified id
 */
router.get('/:id', adminMW, async (req: Request, res: Response) => {
  try {
    const { id } = req.params as ParamsDictionary
    const user = await userDao.getOne(id)
    if (!user) {
      return res.status(NOT_FOUND).json({ error: 'User not found' })
    }
    return res.status(OK).json(user)
  } catch (err) {
    handleError(res, err)
  }
})

export interface IUpdateUserBody {
  user: Partial<IUser>
}

/**
 * Update the specified user's account
 */
router.put('/:id/update', adminMW, async (req: Request, res: Response) => {
  try {
    const { id } = req.params as ParamsDictionary

    // Check parameters
    const { user } = req.body as IUpdateUserBody
    if (!user) {
      return res.status(BAD_REQUEST).json({
        error: paramMissingError(),
      })
    }

    const editableFields = { firstName: true, lastName: true }
    const keys: string[] = Object.keys(user)

    for (const key of keys) {
      if (!(key in editableFields) && key !== '_id') {
        return res
          .status(BAD_REQUEST)
          .json({ error: `Cannot update property ${key} on user` })
      }
    }

    // TODO this might not be needed
    if (user._id && user._id !== id) {
      return res
        .status(BAD_REQUEST)
        .json({ error: 'Provided user IDs do not match' })
    }

    // Update user
    await userDao.update(id, user)
    return res.status(OK).end()
  } catch (err) {
    handleError(res, err)
  }
})

/**
 * Delete the user with the specified ID
 */
router.delete('/:id/delete', adminMW, async (req: Request, res: Response) => {
  try {
    const { id } = req.params as ParamsDictionary
    await userDao.delete(id)
    return res.status(OK).end()
  } catch (err) {
    handleError(res, err)
  }
})

export interface IChangePasswordBody {
  id: any
  password: string
  newPassword: string
}

router.post(
  '/password/change',
  adminMW,
  async (req: Request, res: Response) => {
    try {
      const { id, password, newPassword } = req.body as IChangePasswordBody
      if (!id) return handleBadRequest(res, 'Missing ID')
      if (!password) return handleBadRequest(res, 'Missing password')
      if (!newPassword) return handleBadRequest(res, 'Missing newPassword')
      return await userDao.changePassword(id, password, newPassword)
    } catch (err) {
      handleError(res, err)
    }
  },
)

export interface IForgotPasswordBody {
  email: string
}

router.post(
  '/password/forgot',
  adminMW,
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body
      if (!email) return handleBadRequest(res, 'Missing email')
      const user = await userDao.getOneByEmail(email)
      if (!user) return handleNotFound(res, 'User with email not found')
      return await userDao.requestForgotPassword(user._id)
    } catch (err) {
      handleError(res, err)
    }
  },
)

export interface IResetPasswordBody {
  token: string
  id: any
  newPassword: string
}

router.post('/password/reset', adminMW, async (req: Request, res: Response) => {
  try {
    const { token, id, newPassword } = req.body as IResetPasswordBody
    if (!token) return handleBadRequest(res, 'Missing token')
    if (!id) return handleBadRequest(res, 'Missing ID')
    if (!newPassword) return handleBadRequest(res, 'Missing newPassword')
    return await userDao.resetForgotPassword(id, token, newPassword)
  } catch (err) {
    handleError(res, err)
  }
})

export default router
