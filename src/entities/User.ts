export enum UserRoles {
  Standard,
  Admin,
}

type TUserRoles = UserRoles.Standard | UserRoles.Admin

export interface IUser {
  _id: any
  firstName: string
  lastName: string
  email: string
  passwordHash?: string
  role?: TUserRoles
}

export class User implements IUser {
  public _id: any
  public firstName: string
  public lastName: string
  public email: string
  public role: TUserRoles
  public passwordHash?: string

  constructor(
    user?: IUser,
    firstName?: string,
    lastName?: string,
    email?: string,
    role?: TUserRoles,
    passwordHash?: string,
  ) {
    if (typeof user === 'undefined') {
      this.firstName = firstName || ''
      this.lastName = lastName || ''
      this.email = email || ''
      this.role = role || UserRoles.Standard
      this.passwordHash = passwordHash || ''
    } else {
      this.lastName = user.lastName
      this.firstName = user.firstName
      this.email = user.email
      this.role = user.role || UserRoles.Standard
      this.passwordHash = user.passwordHash
    }
  }
}
