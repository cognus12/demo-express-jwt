import { checkSchema, ValidationChain, validationResult } from 'express-validator'
import { ApiError, ErrorMessage } from './error-handler'
import { NextHandleFunction } from 'connect'

type ExtractedError = ErrorMessage
type CreateRules = () => ValidationChain[]

export const authValidationRules: CreateRules = () => {
  return checkSchema({
    email: {
      isEmail: {
        bail: true,
        errorMessage: 'Wrong email',
      },
    },
  })
}

export const deleteValidationRules: CreateRules = () => {
  return checkSchema({
    id: {
      in: ['body'],
      isString: true,
      errorMessage: 'User ID is wrong',
    },
  })
}

export const validate: NextHandleFunction = (req, res, next) => {
  const errors = validationResult(req)

  if (errors.isEmpty()) {
    return next()
  }
  const extractedErrors: ExtractedError[] = []

  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }))

  throw ApiError.UnprocessableEntity('Validation error', extractedErrors)
}
