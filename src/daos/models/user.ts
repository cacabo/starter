import { Document, Schema, Model, model } from 'mongoose'
import { User } from '@entities'

export interface IUserModel extends User, Document {}

const validateEmail = (email: string) => {
  const re: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  return re.test(email) as boolean
}

export const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 254,
      validate: [validateEmail, 'Please fill a valid email address'],
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    role: {
      type: Number,
      required: true,
      min: 0,
      max: 2,
      validate: [Number.isInteger, 'Role must be an integer'],
    },
    passwordHash: { type: String, required: true },
    passwordResetRequest: {
      token: String,
      expires: Date,
    },
  },
  { timestamps: true },
)

export const UserModel: Model<IUserModel> = model<IUserModel>(
  'User',
  UserSchema,
)
