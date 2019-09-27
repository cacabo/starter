import { IUser } from '@entities'
import { UserModel, IUserModel } from '../models'

export interface IUserDao {
  getOne: (id: any) => Promise<IUser | null>
  getOneByEmail: (email: string) => Promise<IUser | null>
  getAll: () => Promise<IUser[]>
  add: (user: IUser) => Promise<IUser>
  update: (user: IUser) => Promise<void>
  delete: (id: any) => Promise<void>
}

export class UserDao implements IUserDao {
  /**
   * @param id
   */
  public async getOne(id: any): Promise<IUserModel | null> {
    return UserModel.findById(id)
  }

  /**
   * @param email
   */
  public async getOneByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email })
  }

  public async getAll(): Promise<IUser[]> {
    return UserModel.find()
  }

  /**
   * @param user
   */
  public async add(user: IUser): Promise<IUser> {
    const userObj = new UserModel(user)
    return userObj.save()
  }

  /**
   * @param user
   */
  public async update(user: IUser): Promise<void> {
    return UserModel.findByIdAndUpdate(user.id, user).then(somtimesUser => {
      if (!somtimesUser) throw new Error('User not found')
      return
    })
  }

  /**
   * @param id
   */
  public async delete(id: number): Promise<void> {
    return UserModel.findByIdAndDelete(id).then(sometimesUser => {
      if (!sometimesUser) throw new Error('User not found')
      return
    })
  }
}
