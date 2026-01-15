import { normalizeSpaces, stripTags } from '../helpers';
import { type NextFunction, type Request, type Response } from 'express';

/**
 * Middleware para sanitizar query params automaticamente
 * Em Laravel seria: app/Http/Middleware/SanitizeInput.php
 *
 * Aplica sanitização básica (trim, strip tags) em todos os query params
 * A sanitização específica para LIKE deve ser feita no controller/route
 */
export const sanitizeQuery = (req: Request, _res: Response, next: NextFunction) => {
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      const value = req.query[key];
      if (typeof value === 'string') {
        req.query[key] = normalizeSpaces(stripTags(value));
      }
    }
  }
  next();
};

/**
 * Middleware para sanitizar body automaticamente
 * Em Laravel seria: TrimStrings middleware
 */
export const sanitizeBody = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      const value = req.body[key];
      if (typeof value === 'string') {
        req.body[key] = normalizeSpaces(stripTags(value));
      }
    }
  }
  next();
};
