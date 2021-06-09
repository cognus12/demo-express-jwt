import * as bcrypt from 'bcrypt'
import { getConfig } from '../config/config'
import { ObjectId } from 'mongoose'
import { UserData } from '../models/user/interfaces'
import { userModel } from '../models/user/user.model'
import { tokenService } from './token.service'
import { ApiError } from '../middleware/error-handler'

const SALT = getConfig('SALT')

export type loginData = {
  _id: ObjectId
  email: string
}

export type UserEditParams = Partial<Pick<UserData, 'email' | 'username' | 'firstName' | 'lastName'>> & { id: string }

class UserService {
  public register = async (data: UserData) => {
    const { email, username, password, firstName, lastName, gender } = data

    const candidate = await userModel.findOne({ email })

    if (candidate) {
      this.#throwAlreadyExists()
    }

    const hashedPassword = await this.#hashPassword(password)

    const newUser = new userModel({
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      gender,
    })

    await newUser.save()

    const userDTO = newUser.getUserDTO()

    const { accessToken, refreshToken } = tokenService.generateTokens(userDTO.id)

    await tokenService.saveToken(userDTO.id, refreshToken)

    return { user: userDTO, accessToken, refreshToken }
  }

  public login = async (data: Pick<UserData, 'email' | 'password'>) => {
    const { email, password } = data

    const [user] = await userModel.find({ email })

    if (!user) {
      this.#throwAuthFailed()
    }

    const isPasswordValid = await this.#validatePassword(password, user.password)

    if (!isPasswordValid) {
      this.#throwAuthFailed()
    }

    const userDTO = user.getUserDTO()

    const { accessToken, refreshToken } = tokenService.generateTokens(userDTO.id)

    await tokenService.saveToken(userDTO.id, refreshToken)

    return {
      success: true,
      user: userDTO,
      accessToken,
      refreshToken,
    }
  }

  public logout = async (refreshToken: string) => {
    return await tokenService.removeToken(refreshToken)
  }

  public refresh = async (currentRefreshToken: string) => {
    if (!currentRefreshToken) {
      this.#throwUnauthorized()
    }

    const { data } = tokenService.validateRefreshToken(currentRefreshToken)

    const { id: userId } = data

    const existingToken = await tokenService.findToken(currentRefreshToken)

    if (!userId || !existingToken) {
      throw ApiError.UnauthorizedError()
    }

    const user = await userModel.findById(userId)
    const userDTO = user.getUserDTO()

    const { accessToken, refreshToken } = tokenService.generateTokens(userDTO.id)

    await tokenService.saveToken(userDTO.id, refreshToken)

    return {
      user: userDTO,
      accessToken,
      refreshToken,
    }
  }

  // TODO make som refactoring of update

  public edit = async (data: UserEditParams) => {
    const { id, email, username, firstName, lastName } = data

    const user = await userModel.findOne({ _id: id })

    if (!user) {
    }

    user.email = email ? email : user.email
    user.username = username ? username : user.username
    user.firstName = firstName ? firstName : user.firstName
    user.lastName = lastName ? lastName : user.lastName

    await user.save()

    return user.getUserDTO()
  }

  public delete = async (id: string, refreshToken: string) => {
    console.log('id', id)

    await tokenService.removeToken(refreshToken)
    await userModel.deleteOne({ _id: id })
  }

  #validatePassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash)
  }

  #hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(parseInt(SALT))
    return await bcrypt.hash(password, salt)
  }

  #throwAuthFailed = () => {
    throw ApiError.BadRequest('Incorrect email or password')
  }

  #throwAlreadyExists = () => {
    throw ApiError.Conflict('User already exists')
  }

  #throwUnauthorized = () => {
    throw ApiError.UnauthorizedError()
  }
}

const createUserService = () => new UserService()

export const userService = createUserService()
