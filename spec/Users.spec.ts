import app from '@server'
import supertest from 'supertest'

import { BAD_REQUEST, CREATED, OK } from 'http-status-codes'
import { Response, SuperTest, Test } from 'supertest'
import { IUser, User } from '@entities'
import { UserDao } from '@daos'
import { login } from './support/LoginAgent'
import { pErr, paramMissingError, jwtCookieProps } from '@shared'

describe('UserRouter', () => {
  const usersPath = '/api/users'
  const getUsersPath = `${usersPath}/all`
  const createUsersPath = `${usersPath}/new`
  const updateUserPath = (id: any) => `${usersPath}/${id}/update`
  const deleteUserPath = (id: any) => `${usersPath}/${id}/delete`

  let agent: SuperTest<Test>
  let jwtCookie: string

  beforeAll(done => {
    agent = supertest.agent(app)
    login(agent, (cookie: string) => {
      jwtCookie = cookie
      done()
    })
  })

  describe(`"GET:${getUsersPath}"`, () => {
    const callApi = () => {
      return agent.get(getUsersPath).set('Cookie', jwtCookie)
    }

    it(`should return a JSON object with all the users and a status code of
        "${OK}" if the request was successful.`, done => {
      // Setup Dummy Data
      const users = [
        new User({
          firstName: 'Sean',
          lastName: 'Maxwell',
          email: 'sean.maxwell@gmail.com',
          passwordHash: '13rwqgra',
          _id: '0',
        }),
        new User({
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@gmail.com',
          passwordHash: 'rfewraeh',
          _id: '1',
        }),
        new User({
          firstName: 'Gordan',
          lastName: 'Freeman',
          email: 'gordan.freeman@gmail.com',
          passwordHash: 'faefdfgfds',
          _id: '2',
        }),
      ]
      spyOn(UserDao.prototype, 'getAll').and.returnValue(Promise.resolve(users))

      // Call API
      callApi().end((err: Error, res: Response) => {
        pErr(err)
        expect(res.status).toBe(OK)
        // Caste instance-objects to 'User' objects
        const retUsers = res.body.users.map((user: IUser) => {
          return new User(user)
        })
        expect(retUsers).toEqual(users)
        expect(res.body.error).toBeUndefined()
        done()
      })
    })

    it(`should return a JSON object containing an error message and a status
        code of "${BAD_REQUEST}" if the request was unsuccessful.`, done => {
      // Setup Dummy Data
      const errMsg = 'Could not fetch users.'
      spyOn(UserDao.prototype, 'getAll').and.throwError(errMsg)

      // Call API
      callApi().end((err: Error, res: Response) => {
        pErr(err)
        expect(res.status).toBe(BAD_REQUEST)
        expect(res.body.error).toBe(errMsg)
        done()
      })
    })
  })

  describe(`"POST:${createUsersPath}"`, () => {
    const callApi = (reqBody: object) => {
      return agent
        .post(createUsersPath)
        .set('Cookie', jwtCookie)
        .type('form')
        .send(reqBody)
    }

    const userData = {
      user: new User({
        firstName: 'Gordan',
        lastName: 'Freeman',
        email: 'gordan.freeman@gmail.com',
        passwordHash: 'refwaghgeth',
      }),
    }

    it(`should return a status code of "${CREATED}" if the request was successful.`, done => {
      spyOn(UserDao.prototype, 'create').and.returnValue(Promise.resolve())
      callApi(userData).end((err: Error, res: Response) => {
        pErr(err)
        expect(res.status).toBe(CREATED)
        expect(res.body.error).toBeUndefined()
        done()
      })
    })

    it(`should return a JSON object with an error message of "${paramMissingError}"
        and a status code of "${BAD_REQUEST}" if the user param was missing.`, done => {
      callApi({}).end((err: Error, res: Response) => {
        pErr(err)
        expect(res.status).toBe(BAD_REQUEST)
        expect(res.body.error).toBe(paramMissingError)
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
        pErr(err)
        expect(res.status).toBe(BAD_REQUEST)
        expect(res.body.error).toBe(errMsg)
        done()
      })
    })
  })

  describe(`"PUT:${updateUserPath(':id')}"`, () => {
    const callApi = (id: any, reqBody: object) => {
      return agent
        .put(updateUserPath(id))
        .set('Cookie', jwtCookie)
        .type('form')
        .send(reqBody)
    }

    const userData = {
      user: {
        firstName: 'Cameron',
        lastName: 'Cabo',
      },
    }

    const invalidUserData = {
      user: {
        email: 'attackersemail@gmail.com',
      },
    }

    it(`should return a status code of "${OK}" if the request was successful.`, done => {
      spyOn(UserDao.prototype, 'update').and.returnValue(Promise.resolve())
      callApi('0', userData).end((err: Error, res: Response) => {
        pErr(err)
        expect(res.status).toBe(OK)
        expect(res.body.error).toBeUndefined()
        done()
      })
    })

    it(`should not let users change their email via update.`, done => {
      callApi('1', invalidUserData).end((err: Error, res: Response) => {
        pErr(err)
        expect(res.status).toBe(BAD_REQUEST) // TODO test error message
        expect(res.body.error).toBeDefined()
        expect(res.body.error).toContain('email')
        done()
      })
    })

    it(`should return a JSON object with an error message of "${paramMissingError}" and a
            status code of "${BAD_REQUEST}" if the user param was missing.`, done => {
      callApi('2', {}).end((err: Error, res: Response) => {
        pErr(err)
        expect(res.status).toBe(BAD_REQUEST)
        expect(res.body.error).toBeTruthy()
        expect(res.body.error).toBe(paramMissingError)
        done()
      })
    })

    it(`should return a JSON object with an error message and a status code of "${BAD_REQUEST}"
            if the request was unsuccessful.`, done => {
      // Setup Dummy Data
      const updateErrMsg = 'Could not update user.'
      spyOn(UserDao.prototype, 'update').and.throwError(updateErrMsg)

      // Call API
      callApi('1234', userData).end((err: Error, res: Response) => {
        pErr(err)
        expect(res.status).toBe(BAD_REQUEST)
        expect(res.body.error).toBe(updateErrMsg)
        done()
      })
    })
  })

  describe(`"DELETE:${deleteUserPath(':id')}"`, () => {
    const callApi = (id: number) => {
      const path = deleteUserPath(id.toString())
      return agent.delete(path).set('Cookie', jwtCookie)
    }

    it(`should return a status code of "${OK}" if the request was successful.`, done => {
      spyOn(UserDao.prototype, 'delete').and.returnValue(Promise.resolve())
      callApi(5).end((err: Error, res: Response) => {
        pErr(err)
        expect(res.status).toBe(OK)
        expect(res.body.error).toBeUndefined()
        done()
      })
    })

    it(`should return a JSON object with an error message and a status code of "${BAD_REQUEST}"
            if the request was unsuccessful.`, done => {
      // Setup Dummy Response
      const deleteErrMsg = 'Could not delete user.'
      spyOn(UserDao.prototype, 'delete').and.throwError(deleteErrMsg)

      // Call API
      callApi(1).end((err: Error, res: Response) => {
        pErr(err)
        expect(res.status).toBe(BAD_REQUEST)
        expect(res.body.error).toBe(deleteErrMsg)
        done()
      })
    })
  })
})
