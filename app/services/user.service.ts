import * as bcrypt from 'bcrypt'
import { getConfig } from '../config/config'
import { UserData, UserDTO, UserModel } from '../models/user/interfaces'
import { userModel } from '../models/user/user.model'
import { tokenService, TokenService } from './token.service'
import { ApiError } from '../middleware/error-handler'

const SALT = getConfig('SALT')

export type UserEditParams = Partial<Pick<UserData, 'email' | 'username' | 'firstName' | 'lastName'>> & { id: string }

export interface AuthData {
  user: UserDTO
  accessToken: string
  refreshToken: string
}

export class UserService {
  public constructor(private readonly userModel: UserModel, private tokenService: TokenService) {
    this.userModel = userModel
    this.tokenService = tokenService
  }

  public register = async (data: UserData): Promise<AuthData> => {
    const { email, username, password, firstName, lastName, gender } = data

    const candidate = await this.userModel.findOne({ email })

    if (candidate) {
      this._throwAlreadyExists()
    }

    const hashedPassword = await this._hashPassword(password)

    const newUser = new this.userModel({
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      gender,
    })

    await newUser.save()

    const userDTO = newUser.getUserDTO()

    const { accessToken, refreshToken } = this.tokenService.generateTokens(userDTO.id)

    await this.tokenService.saveToken(userDTO.id, refreshToken)

    return { user: userDTO, accessToken, refreshToken }
  }

  public login = async (data: Pick<UserData, 'email' | 'password'>): Promise<AuthData> => {
    const { email, password } = data

    const [user] = await this.userModel.find({ email })

    if (!user) {
      this._throwAuthFailed()
    }

    const isPasswordValid = await this._validatePassword(password, user.password)

    if (!isPasswordValid) {
      this._throwAuthFailed()
    }

    const userDTO = user.getUserDTO()

    const { accessToken, refreshToken } = this.tokenService.generateTokens(userDTO.id)

    await this.tokenService.saveToken(userDTO.id, refreshToken)

    return {
      user: userDTO,
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

    const user = await this.userModel.findById(userId)
    const userDTO = user.getUserDTO()

    const { accessToken, refreshToken } = this.tokenService.generateTokens(userDTO.id)

    await this.tokenService.saveToken(userDTO.id, refreshToken)

    return {
      user: userDTO,
      accessToken,
      refreshToken,
    }
  }

  // TODO make som refactoring of update

  public edit = async (data: UserEditParams): Promise<UserDTO> => {
    const { id, email, username, firstName, lastName } = data

    const user = await this.userModel.findOne({ _id: id })

    if (!user) {
    }

    user.email = email ? email : user.email
    user.username = username ? username : user.username
    user.firstName = firstName ? firstName : user.firstName
    user.lastName = lastName ? lastName : user.lastName

    await user.save()

    return user.getUserDTO()
  }

  public delete = async (id: string, refreshToken: string): Promise<void> => {
    await this.tokenService.removeToken(refreshToken)
    await this.userModel.deleteOne({ _id: id })
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

export const userService = new UserService(userModel, tokenService)
