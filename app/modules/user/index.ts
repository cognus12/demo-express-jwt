import { UserController } from './user.controller'
import { userRepo } from '../../models/user/user.repo'
import { tokenService } from '../../shared-services/token.service'
import { UserService } from './user.service'

export const userService = new UserService(userRepo, tokenService)
export const userController = new UserController(userService)
