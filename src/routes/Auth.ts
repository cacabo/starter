import bcrypt from 'bcrypt'
import { Request, Response, Router } from 'express'
import { BAD_REQUEST, OK, UNAUTHORIZED, CREATED } from 'http-status-codes'
import { UserDao } from '@daos'

import {
  getParamMissingError,
  passwordsDoNotMatchError,
  genericParamMissingError,
  loginFailedError,
  logger,
  jwtCookieProps,
  JwtService,
  pwdSaltRounds,
} from '@shared'
import { handleBadRequest, handleError } from './handlers'
import { User, IUser, UserRoles } from '@entities'
import { IUserDao } from 'src/daos/User/UserDao'

const router = Router()
const userDao: IUserDao = new UserDao()
const jwtService = new JwtService()

export interface IRegisterBody {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
}

router.post('/register', async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
    } = req.body as IRegisterBody

    if (!email) return handleBadRequest(res, getParamMissingError('email'))
    if (!firstName) {
      return handleBadRequest(res, getParamMissingError('first name'))
    }
    if (!lastName) {
      return handleBadRequest(res, getParamMissingError('last name'))
    }
    if (!password) {
      return handleBadRequest(res, getParamMissingError('password'))
    }
    if (!confirmPassword) {
      return handleBadRequest(
        res,
        getParamMissingError('password confirmation'),
      )
    }
    if (password.length < 8) {
      return handleBadRequest(res, 'Password must be at least 8 characters.')
    }
    if (password !== confirmPassword) {
      return handleBadRequest(res, passwordsDoNotMatchError)
    }
    const passwordHash = await bcrypt.hash(password, pwdSaltRounds)
    const user: IUser = new User({
      firstName,
      lastName,
      email,
      passwordHash,
    })
    await userDao.create(user)
    return res.status(CREATED).end()
  } catch (err) {
    handleError(res, err)
  }
})

export interface ILoginBody {
  email: string
  password: string
}

/**
 * Login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Check email and password present
    const { email, password } = req.body as ILoginBody
    if (!email) return handleBadRequest(res, getParamMissingError('email'))
    if (!password) {
      return handleBadRequest(res, getParamMissingError('password'))
    }

    // Fetch user by their email
    const user = await userDao.getOneByEmail(email)
    if (!user) {
      return res.status(UNAUTHORIZED).json({
        error: loginFailedError,
      })
    }

    // Check password
    const pwdPassed = await bcrypt.compare(password, user.passwordHash)
    if (!pwdPassed) {
      return res.status(UNAUTHORIZED).json({
        error: loginFailedError,
      })
    }

    // Setup Admin Cookie
    const jwt = await jwtService.getJwt({
      role: user.role || UserRoles.Standard,
      id: user._id,
    })
    const { key, options } = jwtCookieProps
    res.cookie(key, jwt, options)
    return res.status(OK).end()
  } catch (err) {
    logger.error(err.message, err)
    return res.status(BAD_REQUEST).json({
      error: err.message,
    })
  }
})

/**
 * Logout the current user
 */
router.get('/logout', async (_, res: Response) => {
  try {
    const { key, options } = jwtCookieProps
    res.clearCookie(key, options)
    return res.status(OK).end()
  } catch (err) {
    logger.error(err.message, err)
    return res.status(BAD_REQUEST).json({
      error: err.message,
    })
  }
})

export default router
