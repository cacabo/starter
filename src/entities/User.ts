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
  role?: TUserRoles

  passwordHash?: string
  passwordResetRequest?: {}
}

export interface IPasswordResetRequest {
  token: string
  expires: Date
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
    firstName: string,
    lastName: string,
    email: string,
    passwordHash: string,
    role?: TUserRoles,
  ) {
    this.firstName = firstName || ''
    this.lastName = lastName || ''
    this.email = email || ''
    this.role = role || UserRoles.Standard
    this.passwordHash = passwordHash || ''
  }
}
