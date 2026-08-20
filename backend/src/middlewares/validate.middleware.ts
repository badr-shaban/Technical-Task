import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'

interface RequestSchema {
  body?: ZodType
  query?: ZodType
  params?: ZodType
}

function setRequestValue(req: Request, key: 'query' | 'params', value: unknown): void {
  Object.defineProperty(req, key, {
    configurable: true,
    enumerable: true,
    writable: true,
    value,
  })
}

export function validate(schema: RequestSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body)
      }

      // Express 5 exposes query/params as getters, so they cannot be assigned directly.
      if (schema.query) {
        setRequestValue(req, 'query', schema.query.parse(req.query))
      }

      if (schema.params) {
        setRequestValue(req, 'params', schema.params.parse(req.params))
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
