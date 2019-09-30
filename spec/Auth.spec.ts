import app from '@server'
import supertest from 'supertest'
import bcrypt from 'bcrypt'

import { BAD_REQUEST, OK, UNAUTHORIZED, CREATED } from 'http-status-codes'
import { Response, SuperTest, Test } from 'supertest'
import { User, UserRoles } from '@entities'
import {
  logErr,
  pwdSaltRounds,
  jwtCookieProps,
  loginFailedError,
  getParamMissingError,
  passwordsDoNotMatchError,
} from '@shared'
import { UserDao } from '@daos'

describe('UserRouter', () => {
  const authPath = '/api/auth'
  const loginPath = `${authPath}/login`
  const logoutPath = `${authPath}/logout`
  const registerPath = `${authPath}/register`

  let agent: SuperTest<Test>

  beforeAll(done => {
    agent = supertest.agent(app)
    done()
  })

  describe(`"POST:${registerPath}"`, () => {
    const callApi = (reqBody: object) => {
      return agent
        .post(registerPath)
        .type('form')
        .send(reqBody)
    }

    const userData = {
      firstName: 'Gordan',
      lastName: 'Freeman',
      email: 'gordan.freeman@gmail.com',
      password: 'reallyGoodPassword',
      confirmPassword: 'reallyGoodPassword',
    }

    const userDataWithoutMatchingPassword = {
      firstName: 'Gordan',
      lastName: 'Freeman',
      email: 'gordan.freeman@gmail.com',
      password: 'reallyGoodPassword',
      confirmPassword: 'notTheSamePassword',
    }

    const userDataWithNoEmail = {
      firstName: 'Gordan',
      lastName: 'Freeman',
      password: 'reallyGoodPassword',
      confirmPassword: 'reallyGoodPassword',
    }

    it(`should return a status code of "${CREATED}" if the request was successful.`, done => {
      spyOn(UserDao.prototype, 'create').and.returnValue(Promise.resolve())
      callApi(userData).end((err: Error, res: Response) => {
        logErr(err)
        expect(res.status).toBe(CREATED)
        expect(res.body.error).toBeUndefined()
        done()
      })
    })

    it(`should return a status code of "${BAD_REQUEST}" if the password and confirm password did match.`, done => {
      spyOn(UserDao.prototype, 'create').and.returnValue(Promise.resolve())
      callApi(userDataWithoutMatchingPassword).end(
        (err: Error, res: Response) => {
          logErr(err)
          expect(res.status).toBe(BAD_REQUEST)
          expect(res.body.error).toBeDefined()
          expect(res.body.error).toBe(passwordsDoNotMatchError)
          done()
        },
      )
    })

    it(`should return a JSON object with an error message of "${getParamMissingError(
      'email',
    )}" and a status code of "${BAD_REQUEST}" if the email param was missing.`, done => {
      callApi(userDataWithNoEmail).end((err: Error, res: Response) => {
        logErr(err)
        expect(res.status).toBe(BAD_REQUEST)
        expect(res.body.error).toBe(getParamMissingError('email'))
        done()
      })
    })

    it(`should return a JSON object with an error message and a status code of
        "${BAD_REQUEST}" if the request was unsuccessful.`, done => {
      // Setup Dummy Response
      const errMsg = 'Could not create user.'
      spyOn(UserDao.prototype, 'create').and.throwError(errMsg)

      // Call API
      callApi(userData).end((err: Error, res: Response) => {
        logErr(err)
        expect(res.status).toBe(BAD_REQUEST)
        expect(res.body.error).toBe(errMsg)
        done()
      })
    })
  })

  describe(`"POST:${loginPath}"`, () => {
    const callApi = (reqBody: object) => {
      return agent
        .post(loginPath)
        .type('form')
        .send(reqBody)
    }

    it(`should return a response with a status of ${OK} and a cookie with a jwt if the login
        was successful.`, done => {
      // Setup Dummy Data
      const creds = {
        email: 'jsmith@gmail.com',
        password: 'Password@1',
      }

      const role = UserRoles.Standard
      const passwordHash = hashPwd(creds.password)
      const loginUser = new User({
        firstName: 'john',
        lastName: 'smith',
        email: creds.email,
        role,
        passwordHash,
        _id: '1234567890',
      })
      spyOn(UserDao.prototype, 'getOne').and.returnValue(
        Promise.resolve(loginUser),
      )

      // Call API
      callApi(creds).end((err: Error, res: any) => {
        logErr(err)
        expect(res.status).toBe(OK)
        expect(res.headers['set-cookie'][0]).toContain(jwtCookieProps.key)
        done()
      })
    })

    it(`should return a response with a status of ${UNAUTHORIZED} and a json with the error
            "${loginFailedError}" if the email was not found.`, done => {
      // Setup Dummy Data
      const creds = {
        email: 'jsmith@gmail.com',
        password: 'Password@1',
      }
      spyOn(UserDao.prototype, 'getOne').and.returnValue(Promise.resolve(null))

      // Call API
      callApi(creds).end((err: Error, res: any) => {
        logErr(err)
        expect(res.status).toBe(UNAUTHORIZED)
        expect(res.body.error).toBe(loginFailedError)
        done()
      })
    })

    it(`should return a response with a status of ${UNAUTHORIZED} and a json with the error
            "${loginFailedError}" if the password failed.`, done => {
      // Setup Dummy Data
      const creds = {
        email: 'jsmith@gmail.com',
        password: 'someBadPassword',
      }
      const role = UserRoles.Standard
      const passwordHash = hashPwd('Password@1')
      const loginUser = new User({
        _id: 'fewahudsi',
        firstName: 'john',
        lastName: 'smith',
        email: creds.email,
        role,
        passwordHash,
      })
      spyOn(UserDao.prototype, 'getOne').and.returnValue(
        Promise.resolve(loginUser),
      )

      // Call API
      callApi(creds).end((err: Error, res: any) => {
        logErr(err)
        expect(res.status).toBe(UNAUTHORIZED)
        expect(res.body.error).toBe(loginFailedError)
        done()
      })
    })

    it(
      `should return a response with a status of ${BAD_REQUEST} and a json ` +
        `withan error for all other bad responses.`,
      done => {
        // Setup Dummy Data
        const creds = {
          email: 'jsmith@gmail.com',
          password: 'someBadPassword',
        }
        spyOn(UserDao.prototype, 'getOneByEmail').and.throwError(
          'Database query failed.',
        )

        // Call API
        callApi(creds).end((err: Error, res: any) => {
          logErr(err)
          expect(res.status).toBe(BAD_REQUEST)
          expect(res.body.error).toBeTruthy()
          done()
        })
      },
    )
  })

  describe(`"GET:${logoutPath}"`, () => {
    it(`should return a response with a status of ${OK}.`, done => {
      agent.get(logoutPath).end((err: Error, res: any) => {
        logErr(err)
        expect(res.status).toBe(OK)
        done()
      })
    })
  })

  function hashPwd(pwd: string) {
    return bcrypt.hashSync(pwd, pwdSaltRounds)
  }
})
