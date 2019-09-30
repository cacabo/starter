import { Request, Response, NextFunction } from 'express'
import { UNAUTHORIZED } from 'http-status-codes'
import { UserRoles } from '@entities'
import { logger } from './Logger'
import { jwtCookieProps } from './cookies'
import { JwtService } from './JwtService'

// Init shared service
const jwtService = new JwtService()

export const paramMissingError = (param?: string) => {
  if (!param) {
    return 'One or more of the required parameters was missing.'
  }
  return `Missing ${param} parameter.`
}

export const passwordsDoNotMatchError = 'Passwords do not match'

export const loginFailedErr = 'Login failed'

export const pwdSaltRounds = 12

export const logErr = (err: Error) => {
  if (err) {
    logger.error(err)
  }
}

// Middleware to verify if user is an admin
export const adminMW = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get json-web-token
    const jwt = req.signedCookies[jwtCookieProps.key]
    if (!jwt) {
      throw Error('JWT not present in signed cookie.')
    }
    // Make sure user role is an admin
    const clientData = await jwtService.decodeJwt(jwt)
    if (clientData.role === UserRoles.Admin) {
      next()
    } else {
      throw Error('JWT not present in signed cookie.')
    }
  } catch (err) {
    return res.status(UNAUTHORIZED).json({
      error: err.message,
    })
  }
}
