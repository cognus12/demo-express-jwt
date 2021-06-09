import jwt from 'jsonwebtoken'
import { getConfig } from '../config/config'
import { tokenModel } from '../models/token/token.model'
import { ObjectId } from 'mongoose'

const ACCESS_KEY = getConfig('JWT_ACCESS_KEY')
const REFRESH_KEY = getConfig('JWT_REFRESH_KEY')
const ACCESS_EXP = getConfig('JWT_ACCESS_EXP')
const REFRESH_EXP = getConfig('JWT_REFRESH_EXP')

type TokenData = {
  [key: string]: never
}

class TokenService {
  public generateTokens = (id: ObjectId) => {
    return {
      accessToken: this.#generateAccessToken(id),
      refreshToken: this.#generateRefreshToken(id),
    }
  }

  public saveToken = async (id: ObjectId, refreshToken: string) => {
    const tokenData = await tokenModel.findOne({ user: id })

    if (tokenData) {
      tokenData.refreshToken = refreshToken
      return await tokenData.save()
    }

    return await tokenModel.create({ user: id, refreshToken })
  }

  public findToken = async (refreshToken: string) => await tokenModel.findOne({ refreshToken })

  public removeToken = async (refreshToken: string) => await tokenModel.deleteOne({ refreshToken })

  public validateAccessToken = (accessToken: string) => {
    try {
      return jwt.verify(accessToken, ACCESS_KEY)
    } catch (err) {
      return null
    }
  }

  public validateRefreshToken = (refreshToken: string) => {
    try {
      return jwt.verify(refreshToken, REFRESH_KEY) as TokenData
    } catch (err) {
      return null
    }
  }

  #generateAccessToken = (id: ObjectId) => {
    return jwt.sign({ data: { id } }, ACCESS_KEY, { expiresIn: ACCESS_EXP })
  }

  #generateRefreshToken = (id: ObjectId) => {
    return jwt.sign({ data: { id } }, REFRESH_KEY, { expiresIn: REFRESH_EXP })
  }
}

const createTokenService = () => new TokenService()

export const tokenService = createTokenService()
