export enum UserRoles {
  Standard,
  Admin,
}

type TUserRoles = UserRoles.Standard | UserRoles.Admin

export interface IPasswordResetRequest {
  token: string
  expires: Date
}

export interface IUser {
  _id: any
  firstName: string
  lastName: string
  email: string
  role?: TUserRoles

  passwordHash: string
  passwordResetRequest?: IPasswordResetRequest
}

export class User implements IUser {
  public _id: any
  public firstName: string
  public lastName: string
  public email: string
  public role: TUserRoles
  public passwordHash: string
  public passwordResetRequest?: IPasswordResetRequest

  constructor(
    user?: IUser,
    firstName?: string,
    lastName?: string,
    email?: string,
    passwordHash?: string,
    role?: TUserRoles,
  ) {
    if (user) {
      this.firstName = user.firstName
      this.lastName = user.lastName
      this.email = user.email
      this.passwordHash = user.passwordHash
      this.role = user.role || UserRoles.Standard
    } else {
      this.firstName = firstName || ''
      this.lastName = lastName || ''
      this.email = email || ''
      this.role = role || UserRoles.Standard
      this.passwordHash = passwordHash || ''
    }
  }
}
