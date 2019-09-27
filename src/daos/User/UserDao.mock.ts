import uuidv4 from 'uuid/v4'
import { IUser } from '@entities'
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
        if (user.id === id) {
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

  public async add(user: IUser): Promise<IUser> {
    try {
      const db = await super.openDb()
      user.id = uuidv4()
      db.users.push(user)
      await super.saveDb(db)
      return user
    } catch (err) {
      throw err
    }
  }

  public async update(user: IUser): Promise<void> {
    try {
      const db = await super.openDb()
      for (let i = 0; i < db.users.length; i++) {
        if (db.users[i].id === user.id) {
          db.users[i] = user
          await super.saveDb(db)
          return
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
        if (db.users[i].id === id) {
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
}
