import { model, Schema } from 'mongoose'
import { UserBaseDocument, UserDocument, UserModel } from './interfaces'

//TODO remove gender from starter template

const UserSchema = new Schema<UserDocument, UserModel>(
  {
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: String,
    lastName: String,
    gender: {
      type: Number,
      enum: [0, 1],
      required: false,
    },
  },
  { collection: 'users' }
)

UserSchema.virtual('fullName').get(function (this: UserBaseDocument) {
  if (!this.firstName) {
    return ''
  }
  return `${this.firstName} ${this.lastName || ''}`
})

UserSchema.methods.getGender = function (this: UserBaseDocument) {
  if (!this.gender) {
    return 'Not specified'
  }
  return this.gender > 0 ? 'Male' : 'Female'
}

UserSchema.methods.getUserDTO = function (this: UserBaseDocument) {
  return {
    id: this._id,
    email: this.email,
    username: this.username,
    firsName: this.firstName,
    lastName: this.lastName,
  }
}

export const userModel = model<UserDocument, UserModel>('User', UserSchema)
