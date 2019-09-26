import { Document, Schema, Model, model } from 'mongoose'
import { User } from '@entities'

export interface IUserModel extends User, Document {}

// TODO validators

export var UserSchema: Schema = new Schema(
  {
    email: String,
    firstName: String,
    lastName: String,
    role: Number,
    passwordHash: String,
  },
  { timestamps: true }
)

export const UserModel: Model<IUserModel> = model<IUserModel>(
  'User',
  UserSchema
)
