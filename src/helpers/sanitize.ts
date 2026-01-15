/**
 * Helpers de sanitização para queries e inputs
 * Em Laravel seria: app/Helpers/SanitizeHelper.php
 */

/**
 * Converte valor para inteiro positivo de forma segura
 * Evita NaN e valores inválidos
 *
 * @param value - Valor a ser convertido (string, number, array, etc.)
 * @param defaultValue - Valor padrão se conversão falhar
 * @returns Inteiro positivo ou valor padrão
 */
export const toPositiveInt = (value: unknown, defaultValue: number): number => {
  // Se for array, pega primeiro elemento (query params podem vir como array)
  const raw = Array.isArray(value) ? value[0] : value;

  // Converte para número
  const num = typeof raw === 'string' ? parseInt(raw, 10) : Number(raw);

  // Retorna default se NaN ou menor que 1
  return Number.isNaN(num) || num < 1 ? defaultValue : num;
};

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
