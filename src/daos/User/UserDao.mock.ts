import uuidv4 from 'uuid/v4'
import { IUser, IPasswordResetRequest } from '@entities'
import { MockDaoMock } from '../MockDb/MockDao.mock'
import { IUserDao } from './UserDao'

export class UserDao extends MockDaoMock implements IUserDao {
  /**
   * @param id
   */
  public async getOne(id: any): Promise<IUser | null> {
    try {
      const db = await super.openDb()
      for (const user of db.users) {
        if (user._id === id) {
          return user
        }
      }
      return null
    } catch (err) {
      throw err
    }
  }

  /**
   * @param email
   */
  public async getOneByEmail(email: string): Promise<IUser | null> {
    try {
      const db = await super.openDb()
      for (const user of db.users) {
        if (user.email === email) {
          return user
        }
      }
      return null
    } catch (err) {
      throw err
    }
  }

  public async getAll(): Promise<IUser[]> {
    try {
      const db = await super.openDb()
      return db.users
    } catch (err) {
      throw err
    }
  }

  public async create(user: IUser): Promise<IUser> {
    try {
      const db = await super.openDb()
      const userObj: IUser = Object.assign({}, user, { _id: uuidv4() })
      db.users.push(userObj)
      await super.saveDb(db)
      return userObj
    } catch (err) {
      throw err
    }
  }

  public async update(id: any, user: Partial<IUser>): Promise<IUser> {
    try {
      const db = await super.openDb()
      for (let i = 0; i < db.users.length; i++) {
        if (db.users[i]._id === id) {
          const existingUser: IUser = db.users[i]
          const editedUser: IUser = Object.assign({}, existingUser, user)
          db.users[i] = editedUser
          await super.saveDb(db)
          return editedUser
        }
      }
      throw new Error('User not found')
    } catch (err) {
      throw err
    }
  }

  public async delete(id: any): Promise<void> {
    try {
      const db = await super.openDb()
      for (let i = 0; i < db.users.length; i++) {
        if (db.users[i]._id === id) {
          db.users.splice(i, 1)
          await super.saveDb(db)
          return
        }
      }
      throw new Error('User not found')
    } catch (err) {
      throw err
    }
  }

  /**
   * @param id of the user
   * @param password existing
   * @param newPassword to replace existing one
   */
  public async changePassword(
    id: any,
    password: string,
    newPassword: string,
  ): Promise<IUser> {
    const user = await this.getOne(id)
    if (!user) throw new Error('User not found')
    const { passwordHash } = user
    if (password !== passwordHash) throw new Error('Passwords do not match')
    const editedUser = Object.assign({}, user, {
      passwordHash: newPassword,
    })
    return await this.update(id, editedUser)
  }

  /**
   * @param id of the user
   */
  public async requestForgotPassword(id: any): Promise<IUser> {
    const user = await this.getOne(id)
    if (!user) throw new Error('User not found')
    const token = uuidv4() // Create a new random token
    const hourInMs = 1000 * 60 * 60
    const passwordResetRequest: IPasswordResetRequest = {
      token,
      expires: new Date(Date.now() + hourInMs),
    }

    const editedUser: IUser = Object.assign({}, user, { passwordResetRequest })
    return await this.update(editedUser, id)
  }

  /**
   * @param id of the user
   * @param token emailed to user to replace their password with
   * @param newPassword to replace existing one
   */
  public async resetForgotPassword(
    id: any,
    token: string,
    newPassword: string,
  ) {
    const user = await this.getOne(id)

    // Validations
    if (!user) throw new Error('User not found')
    const { passwordResetRequest } = user
    if (!passwordResetRequest) throw new Error('No reset request found')
    const { token: existingToken, expires } = passwordResetRequest
    if (token !== existingToken) throw new Error('Tokens do not match')
    const date = Date.now()
    if (date > expires.getTime()) throw new Error('Token expired')

    const editedUser: IUser = Object.assign({}, user, {
      passwordResetRequest: null,
      passwordHash: newPassword,
    })
    return await this.update(id, editedUser)
  }
}
