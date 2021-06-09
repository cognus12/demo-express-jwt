import { Router } from 'express'
import { userController } from '../controllers/user.controller'
import { authValidationRules, deleteValidationRules, validate } from '../middleware/validation'
import { onlyAuthorised } from '../middleware/security'

export const userRouter = Router()

userRouter.post('/sign-up', userController.register)
userRouter.post('/sign-in', authValidationRules(), validate, userController.login)
userRouter.post('/logout', userController.logout)
userRouter.get('/refresh', userController.refresh)
userRouter.put('/edit', onlyAuthorised, userController.edit)
userRouter.delete('/delete', onlyAuthorised, deleteValidationRules(), validate, userController.delete)
