import { IUser, IPasswordResetRequest } from '@entities'
import { UserModel, IUserModel } from '../models'
import uuidv4 from 'uuid/v4'
import bcrypt from 'bcrypt'

// TODO custom error types

export interface IUserDao {
  getOne: (id: any) => Promise<IUser | null>
  getOneByEmail: (email: string) => Promise<IUser | null>
  getAll: () => Promise<IUser[]>
  create: (user: IUser) => Promise<IUser>
  update: (id: any, user: Partial<IUser>) => Promise<IUser>
  delete: (id: any) => Promise<void>
  changePassword: (
    id: any,
    password: string,
    newPassword: string,
  ) => Promise<IUser>
  requestForgotPassword(id: any): Promise<IUser>
  resetForgotPassword(
    id: any,
    token: string,
    newPassword: string,
  ): Promise<IUser>
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
  public async getOneByEmail(email: string): Promise<IUserModel | null> {
    return UserModel.findOne({ email })
  }

  public async getAll(): Promise<IUserModel[]> {
    return UserModel.find()
  }

  /**
   * @param user
   */
  public async create(user: IUser): Promise<IUserModel> {
    const userObj = new UserModel(user)
    return userObj.save()
  }

  /**
   * @param id of the user
   * @param user
   */
  public async update(id: any, user: Partial<IUser>): Promise<IUserModel> {
    if (!id) throw new Error('Missing user id')
    return UserModel.findByIdAndUpdate(id, user).then(somtimesUser => {
      if (!somtimesUser) throw new Error('User not found')
      return somtimesUser
    })
  }

  /**
   * @param id
   */
  public async delete(id: any): Promise<void> {
    return UserModel.findByIdAndDelete(id).then(sometimesUser => {
      if (!sometimesUser) throw new Error('User not found')
      return
    })
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
  ): Promise<IUserModel> {
    const user = await this.getOne(id)
    if (!user) throw new Error('User not found')
    const { passwordHash } = user
    // TODO compare passwords elsewhere (import from auth?)
    await bcrypt.compare(password, passwordHash)

    // TOOD hash bassword
    // TODO is object.assign necessary?
    const editedUser: IUser = Object.assign({}, user, {
      passwordHash: 'TODO',
    })
    return await this.update(id, editedUser)
  }

  /**
   * @param id of the user
   */
  public async requestForgotPassword(id: any): Promise<IUserModel> {
    const user = await this.getOne(id)
    if (!user) throw new Error('User not found')
    const token = uuidv4() // Create a new random token
    const hourInMs = 1000 * 60 * 60
    const passwordResetRequest: IPasswordResetRequest = {
      token,
      expires: new Date(Date.now() + hourInMs),
    }

    // TODO send email
    const editedUser: IUser = Object.assign({}, user, { passwordResetRequest })
    return await this.update(id, editedUser)
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
  ): Promise<IUserModel> {
    const user = await this.getOne(id)
    if (!user) throw new Error('User not found')
    const { passwordResetRequest } = user
    if (!passwordResetRequest) throw new Error('No reset request found')
    const { token: existingToken, expires } = passwordResetRequest
    if (token !== existingToken) throw new Error('Tokens do not match')
    const date = Date.now()
    // TODO test that this is correct
    if (date > expires.getTime()) throw new Error('Token expired')
    const editedUser: IUser = Object.assign({}, user, {
      passwordResetRequest: null,
      passwordHash: 'TODO',
    })
    return await this.update(id, editedUser)
  }
}
