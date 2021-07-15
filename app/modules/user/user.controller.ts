import { NextFunction, Request, RequestHandler, Response } from 'express'
import { UserService } from './user.service'
import { pick } from '../../ustils/pick'
import { getConfig } from '../../config/config'
import { toMs } from 'ms-typescript'

const REFRESH_EXP_DAYS = toMs(getConfig('JWT_REFRESH_EXP'))

export class UserController {
  public constructor(private userService: UserService) {
    this.userService = userService
  }

  public register: RequestHandler = async (req, res, next) => {
    const data = pick(req.body, ['email', 'username', 'password', 'firstName', 'lastName'])
    try {
      const { user, accessToken, refreshToken } = await this.userService.register(data)

      res.cookie('refreshToken', refreshToken, { maxAge: REFRESH_EXP_DAYS, httpOnly: true })

      return res.status(200).json({ user, accessToken, refreshToken })
    } catch (err) {
      next(err)
    }
  }

  public login: RequestHandler = async (req, res, next) => {
    const loginData = pick(req.body, ['email', 'password'])

    try {
      const { user, accessToken, refreshToken } = await this.userService.login(loginData)

      res.cookie('refreshToken', refreshToken, { maxAge: REFRESH_EXP_DAYS, httpOnly: true })

      return res.status(200).json({ user, accessToken, refreshToken })
    } catch (err) {
      next(err)
    }
  }

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies

      const token = await this.userService.logout(refreshToken)

      res.clearCookie('refreshToken')

      return res.status(200).json(token)
    } catch (err) {
      next(err)
    }
  }

  public refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken: currentRefreshToken } = req.cookies

      const { user, accessToken, refreshToken } = await this.userService.refresh(currentRefreshToken)

      res.cookie('refreshToken', refreshToken, { maxAge: REFRESH_EXP_DAYS, httpOnly: true })

      return res.status(200).json({ user, accessToken, refreshToken })
    } catch (err) {
      next(err)
    }
  }
  // TODO bug with update, filter undefined
  public edit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedUserDTO = await this.userService.edit({ ...req.body })

      return res.status(200).json({ user: { ...updatedUserDTO } })
    } catch (err) {
      next(err)
    }
  }

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.body
    const { refreshToken } = req.cookies

    try {
      await this.userService.delete(id, refreshToken)
      res.clearCookie('refreshToken')

      return res.status(200).json({ success: true })
    } catch (err) {
      next(err)
    }
  }
}
