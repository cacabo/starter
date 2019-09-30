import { Response } from 'express'
import { BAD_REQUEST, NOT_FOUND } from 'http-status-codes'
import { logger } from '@shared'

const handleErrorGenerator = (status: number) => (res: Response, msg: string) =>
  res.status(status).json({ error: msg })

export const handleError = (res: Response, err: Error) => {
  logger.error(err.message, err)
  return res.status(BAD_REQUEST).json({
    error: err.message,
  })
}

export const handleNotFound = handleErrorGenerator(NOT_FOUND)
export const handleBadRequest = handleErrorGenerator(BAD_REQUEST)
