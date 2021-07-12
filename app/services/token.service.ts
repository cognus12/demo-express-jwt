import jwt from 'jsonwebtoken'
import { getConfig } from '../config/config'
import { ObjectId } from 'mongoose'
import { TokenDocument, TokenModel } from '../models/token/interfaces'
import { tokenModel } from '../models/token/token.model'

const ACCESS_KEY = getConfig('JWT_ACCESS_KEY')
const REFRESH_KEY = getConfig('JWT_REFRESH_KEY')
const ACCESS_EXP = getConfig('JWT_ACCESS_EXP')
const REFRESH_EXP = getConfig('JWT_REFRESH_EXP')

export interface TokenData {
  accessToken: string
  refreshToken: string
}

export class TokenService {
  public constructor(private tokenModel: TokenModel) {
    this.tokenModel = tokenModel
  }

  public generateTokens = (id: ObjectId): TokenData => {
    return {
      accessToken: this._generateAccessToken(id),
      refreshToken: this._generateRefreshToken(id),
    }
  }

  public saveToken = async (id: ObjectId, refreshToken: string): Promise<TokenDocument> => {
    const tokenData = await this.tokenModel.findOne({ user: id })

    if (tokenData) {
      tokenData.refreshToken = refreshToken
      return await tokenData.save()
    }

    return await this.tokenModel.create({ user: id, refreshToken })
  }

  public findToken = async (refreshToken: string): Promise<TokenDocument> =>
    await this.tokenModel.findOne({ refreshToken })

  public removeToken = async (refreshToken: string): Promise<unknown> =>
    await this.tokenModel.deleteOne({ refreshToken })

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public validateAccessToken = (accessToken: string): any => {
    try {
      return jwt.verify(accessToken, ACCESS_KEY)
    } catch (err) {
      return null
    }
  }
  // TODO do something with string | object from jwt.verify
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public validateRefreshToken = (refreshToken: string): any => {
    try {
      return jwt.verify(refreshToken, REFRESH_KEY)
    } catch (err) {
      return null
    }
  }

  private _generateAccessToken = (id: ObjectId) => {
    return jwt.sign({ data: { id } }, ACCESS_KEY, { expiresIn: ACCESS_EXP })
  }

  private _generateRefreshToken = (id: ObjectId) => {
    return jwt.sign({ data: { id } }, REFRESH_KEY, { expiresIn: REFRESH_EXP })
  }
}

export const tokenService = new TokenService(tokenModel)
