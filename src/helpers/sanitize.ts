/**
 * Helpers de sanitização para queries e inputs
 * Em Laravel seria: app/Helpers/SanitizeHelper.php
 */

/**
 * Escapa caracteres especiais do LIKE/ILIKE para evitar comportamento inesperado
 * Ex: "test%" vira "test\%" - busca literalmente por "test%" ao invés de padrão
 *
 * @param value - String a ser sanitizada
 * @returns String com caracteres especiais escapados
 */
export const escapeLikePattern = (value: string): string => {
  return value.replace(/[%_\\]/g, (char) => `\\${char}`);
};

/**
 * Remove tags HTML e scripts maliciosos
 * Em Laravel seria: strip_tags() ou Purifier
 *
 * @param value - String a ser limpa
 * @returns String sem tags HTML
 */
export const stripTags = (value: string): string => {
  return value.replace(/<[^>]*>/g, '');
};

/**
 * Remove espaços extras no início, fim e múltiplos espaços internos
 *
 * @param value - String a ser normalizada
 * @returns String com espaços normalizados
 */
export const normalizeSpaces = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ');
};

/**
 * Sanitiza string para uso seguro em queries LIKE
 * Combina: trim + strip tags + escape LIKE
 *
 * @param value - String a ser sanitizada
 * @returns String sanitizada e segura para LIKE
 */
export const sanitizeForLike = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return escapeLikePattern(normalizeSpaces(stripTags(value)));
};

/**
 * Sanitiza objeto de query params
 * Útil para sanitizar req.query de uma vez
 *
 * @param query - Objeto com parâmetros
 * @param fields - Campos a serem sanitizados para LIKE
 * @returns Objeto com campos sanitizados
 */
export const sanitizeQueryParams = <T extends Record<string, unknown>>(
  query: T,
  likeFields: (keyof T)[]
): T => {
  const sanitized = { ...query };

  for (const field of likeFields) {
    if (sanitized[field]) {
      sanitized[field] = sanitizeForLike(sanitized[field]) as T[keyof T];
    }
  }

  return sanitized;
};
