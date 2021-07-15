import { Router } from 'express'

import { authValidationRules, deleteValidationRules, validate } from '../middleware/validation'
import { onlyAuthorised } from '../middleware/security'
import { userController } from '../modules/user'

export const userRouter = Router()

userRouter.post('/sign-up', userController.register)
userRouter.post('/sign-in', authValidationRules(), validate, userController.login)
userRouter.post('/logout', userController.logout)
userRouter.get('/refresh', userController.refresh)
userRouter.put('/edit', onlyAuthorised, userController.edit)
userRouter.delete('/delete', onlyAuthorised, deleteValidationRules(), validate, userController.delete)
