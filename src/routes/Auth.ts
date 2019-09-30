import bcrypt from 'bcrypt'
import { Request, Response, Router } from 'express'
import { BAD_REQUEST, OK, UNAUTHORIZED, CREATED } from 'http-status-codes'
import { UserDao } from '@daos'

import {
  paramMissingError,
  passwordsDoNotMatchError,
  loginFailedErr,
  logger,
  jwtCookieProps,
  JwtService,
  pwdSaltRounds,
} from '@shared'
import { handleBadRequest, handleError } from './handlers'
import { User, IUser } from '@entities'

const router = Router()
const userDao = new UserDao()
const jwtService = new JwtService()

export interface IRegisterUserBody {
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
    } = req.body as IRegisterUserBody

    if (!email) return handleBadRequest(res, paramMissingError('email'))
    if (!firstName) {
      return handleBadRequest(res, paramMissingError('first name'))
    }
    if (!lastName) return handleBadRequest(res, paramMissingError('last name'))
    if (!password) return handleBadRequest(res, paramMissingError('password'))
    if (!confirmPassword) {
      return handleBadRequest(res, 'Missing password confirmation')
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

/**
 * Login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Check email and password present
    const { email, password } = req.body
    if (!(email && password)) {
      return res.status(BAD_REQUEST).json({
        error: paramMissingError(),
      })
    }

    // Fetch user
    const user = await userDao.getOne(email)
    if (!user) {
      return res.status(UNAUTHORIZED).json({
        error: loginFailedErr,
      })
    }

    // Check password
    const pwdPassed = await bcrypt.compare(password, user.passwordHash)
    if (!pwdPassed) {
      return res.status(UNAUTHORIZED).json({
        error: loginFailedErr,
      })
    }

    // Setup Admin Cookie
    const jwt = await jwtService.getJwt({
      role: user.role,
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
