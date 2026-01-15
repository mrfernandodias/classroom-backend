import { normalizeSpaces, stripTags } from '../helpers';
import { type NextFunction, type Request, type Response } from 'express';

/**
 * Sanitiza valor de forma recursiva (strings, arrays e objetos aninhados)
 * Em Laravel seria similar ao TrimStrings middleware que trata recursivamente
 */
const sanitizeValue = (value: unknown): unknown => {
  // String: aplica sanitização
  if (typeof value === 'string') {
    return normalizeSpaces(stripTags(value));
  }

  // Array: sanitiza cada elemento
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  // Objeto: sanitiza cada propriedade recursivamente
  if (value && typeof value === 'object') {
    const sanitizedObject: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      sanitizedObject[key] = sanitizeValue(nestedValue);
    }
    return sanitizedObject;
  }

  // Outros tipos (number, boolean, null): retorna como está
  return value;
};

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
 * Trata recursivamente objetos aninhados e arrays
 */
export const sanitizeBody = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  next();
};
