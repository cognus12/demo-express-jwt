import { Document, Model, ObjectId } from 'mongoose'

export interface TokenData {
  refreshToken: string
  user: ObjectId
}

export interface TokenDocument extends TokenData, Document {}

export interface TokenModel extends Model<TokenDocument> {}

export type Token = TokenData['refreshToken']

export type UserId = TokenData['user']

export interface TokenRepoStruct {
  findOne: (filter: Partial<TokenData>) => Promise<string>
  delete: (refreshToken: Token) => Promise<void>
  create: (data: TokenData) => Promise<void>
  update: (id: UserId, newToken: Token) => Promise<boolean>
}
