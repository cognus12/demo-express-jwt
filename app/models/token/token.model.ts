import { model, Schema } from 'mongoose'
import { TokenDocument, TokenModel } from './interfaces'

const TokenSchema = new Schema<TokenDocument, TokenModel>({
  refreshToken: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
})

export const tokenModel = model<TokenDocument, TokenModel>('Token', TokenSchema)
