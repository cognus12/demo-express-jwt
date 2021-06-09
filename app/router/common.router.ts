import { Router } from 'express'
import { userRouter } from './user.router'

export const AppRouter = Router()

AppRouter.use('/user', userRouter)
