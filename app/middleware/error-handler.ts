import { ErrorRequestHandler } from 'express'

export interface ErrorMessage {
  [x: string]: string
}

class ApiError extends Error {
  status: number
  errors: ErrorMessage[]

  constructor(status: number, message: string, errors: ErrorMessage[] = []) {
    super(message)

    this.status = status
    this.errors = errors
  }

  static UnauthorizedError(): ApiError {
    return new ApiError(401, 'Not authorized')
  }

  static BadRequest(message: string, errors: ErrorMessage[] = []): ApiError {
    return new ApiError(400, message, errors)
  }

  static UnprocessableEntity(message: string, errors: ErrorMessage[] = []): ApiError {
    return new ApiError(422, message, errors)
  }

  static Conflict(message: string, errors: ErrorMessage[] = []): ApiError {
    return new ApiError(409, message, errors)
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleErrorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, errors: err.errors })
  }

  return res.status(500).json({ message: err.message })
}

export { ApiError, handleErrorMiddleware }
