import express, { Application, Router, RequestHandler, ErrorRequestHandler } from 'express'
import './providers/db.provider'
import { AppRouter } from './router/common.router'
import passport from 'passport'
import cookieParser from 'cookie-parser'
import { handleErrorMiddleware } from './middleware/error-handler'

export interface AppOptions {
  middlewares: RequestHandler[]
  errorHandler: ErrorRequestHandler
  router: Router
}

export type ConfigureApp<O = AppOptions> = (opts: O) => Application

const options: AppOptions = {
  middlewares: [
    express.urlencoded({
      extended: false,
    }),
    express.json(),
    cookieParser(),
    passport.initialize(),
  ],
  errorHandler: handleErrorMiddleware,
  router: AppRouter,
}

const configureApp: ConfigureApp = ({ middlewares, router, errorHandler }) => {
  const app = express()

  middlewares.forEach((m: RequestHandler) => app.use(m))

  app.use(router)

  app.use(errorHandler)

  return app
}

export const EXPRESS_APP = configureApp(options)
