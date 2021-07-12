import * as bcrypt from 'bcrypt'
import { getConfig } from '../config/config'
import { UserData, UserDTO, UserRepoStruct } from '../models/user/interfaces'
import { tokenService, TokenService } from './token.service'
import { ApiError } from '../middleware/error-handler'
import { userRepo } from '../models/user/user.repo'

const SALT = getConfig('SALT')

export type UserEditParams = Partial<Pick<UserData, 'email' | 'username' | 'firstName' | 'lastName'>> & { id: string }

export interface AuthData {
  user: UserDTO
  accessToken: string
  refreshToken: string
}

export class UserService {
  public constructor(private readonly userRepo: UserRepoStruct, private tokenService: TokenService) {
    this.userRepo = userRepo
    this.tokenService = tokenService
  }

  public register = async (data: UserData): Promise<AuthData> => {
    const { email, username, password, firstName, lastName, gender } = data

    const candidate = await this.userRepo.findOne({ email })

    if (candidate) {
      this._throwAlreadyExists()
    }

    const hashedPassword = await this._hashPassword(password)

    const user = await this.userRepo.create({
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      gender,
    })

    const { accessToken, refreshToken } = this.tokenService.generateTokens(user.id)

    await this.tokenService.saveToken(user.id, refreshToken)

    return { user, accessToken, refreshToken }
  }

  public login = async (data: Pick<UserData, 'email' | 'password'>): Promise<AuthData> => {
    const { email, password } = data

    const { passwordHash, user } = await this.userRepo.getPasswordHash(email)

    if (!passwordHash) {
      this._throwAuthFailed()
    }

    const isPasswordValid = await this._validatePassword(password, passwordHash)

    if (!isPasswordValid) {
      this._throwAuthFailed()
    }

    const { accessToken, refreshToken } = this.tokenService.generateTokens(user.id)

    await this.tokenService.saveToken(user.id, refreshToken)

    return {
      user,
      accessToken,
      refreshToken,
    }
  }

  public logout = async (refreshToken: string): Promise<unknown> => {
    return await this.tokenService.removeToken(refreshToken)
  }

  public refresh = async (currentRefreshToken: string): Promise<AuthData> => {
    if (!currentRefreshToken) {
      this._throwUnauthorized()
    }

    const { data } = this.tokenService.validateRefreshToken(currentRefreshToken)

    const { id: userId } = data

    const existingToken = await this.tokenService.findToken(currentRefreshToken)

    if (!userId || !existingToken) {
      throw ApiError.UnauthorizedError()
    }

    const user = await this.userRepo.findOne({ _id: userId })

    const { accessToken, refreshToken } = this.tokenService.generateTokens(user.id)

    await this.tokenService.saveToken(user.id, refreshToken)

    return {
      user,
      accessToken,
      refreshToken,
    }
  }

  // TODO make som refactoring of update

  public edit = async (data: UserEditParams): Promise<UserDTO> => {
    const { id } = data

    const user = await this.userRepo.update(id, data)

    if (!user) {
      throw ApiError.BadRequest('User not found')
    }

    return user
  }

  public delete = async (id: string, refreshToken: string): Promise<void> => {
    await this.tokenService.removeToken(refreshToken)
    await this.userRepo.deleteOne(id)
  }

  private _validatePassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash)
  }

  private _hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(parseInt(SALT))
    return await bcrypt.hash(password, salt)
  }

  private _throwAuthFailed = () => {
    throw ApiError.BadRequest('Incorrect email or password')
  }

  private _throwAlreadyExists = () => {
    throw ApiError.Conflict('User already exists')
  }

  private _throwUnauthorized = () => {
    throw ApiError.UnauthorizedError()
  }
}

export const userService = new UserService(userRepo, tokenService)
