import { Document, Model, ObjectId } from 'mongoose'

export interface TokenData {
  refreshToken: string
  user: ObjectId
}

export interface TokenDocument extends TokenData, Document {}

export interface TokenModel extends Model<TokenDocument> {}
