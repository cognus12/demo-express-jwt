import { Document, Model, ObjectId } from 'mongoose'

export enum Gender {
  Male = 1,
  Female = 0,
}

export interface UserData {
  email: string
  password: string
  username: string
  firstName?: string
  lastName?: string
  gender?: Gender
}

export interface UserBaseDocument extends UserData, Document {
  fullName: string
  getGender(): string
  getUserDTO(): UserDTO
}

export interface UserDTO extends Pick<UserData, 'email' | 'username' | 'firstName' | 'lastName'> {
  id: ObjectId
}

export interface UserDocument extends UserBaseDocument {}

export interface UserModel extends Model<UserDocument> {}

export interface UserEditableData extends Partial<Pick<UserData, 'email' | 'username' | 'firstName' | 'lastName'>> {}

export interface UserRepoStruct {
  findOne: (filter: Partial<UserData>) => Promise<UserDTO>
  deleteOne: (_id: string) => Promise<void>
  update: (_id: string, data: UserEditableData) => Promise<UserDTO>
}
