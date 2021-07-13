import { Token, TokenData, TokenModel, TokenRepoStruct, UserId } from './interfaces'
import { tokenModel } from './token.model'

export class TokenRepo implements TokenRepoStruct {
  public constructor(private tokenModel: TokenModel) {
    this.tokenModel = tokenModel
  }

  findOne = async (filter: Partial<TokenData>): Promise<string> => {
    const { refreshToken } = await this.tokenModel.findOne(filter)
    return refreshToken
  }

  delete = async (refreshToken: Token): Promise<void> => {
    await this.tokenModel.deleteOne({ refreshToken })
  }

  create = async (data: TokenData): Promise<void> => {
    await this.tokenModel.create(data)
  }

  update = async (id: UserId, newToken: Token): Promise<boolean> => {
    const currentTokenData = await this.tokenModel.findOne({ user: id })

    if (currentTokenData) {
      currentTokenData.refreshToken = newToken
      await currentTokenData.save()
      return true
    }

    return false
  }
}

export const tokenRepo = new TokenRepo(tokenModel)
