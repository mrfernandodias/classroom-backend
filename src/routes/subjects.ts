import { db } from '../db';
import { departments, subjects } from '../db/schema';
import { escapeLikePattern, toPositiveInt } from '../helpers';
import { and, desc, eq, getTableColumns, ilike, or, sql } from 'drizzle-orm';
import express from 'express';

// Constantes de configuração da rota
const MAX_LIMIT = 100;
const MAX_SEARCH_LENGTH = 255;

const router = express.Router();

/**
 * GET /subjects - Lista todos os subjects com busca, filtro e paginação
 *
 * Em Laravel seria:
 * Route::get('/subjects', [SubjectController::class, 'index']);
 */
router.get('/', async (req, res) => {
  try {
    // 1. Extrair e validar parâmetros
    const { search, department, page, limit } = req.query;
    const currentPage = toPositiveInt(page, 1);
    const limitPerPage = Math.min(toPositiveInt(limit, 10), MAX_LIMIT);
    const offset = (currentPage - 1) * limitPerPage;

    // 2. Construir filtros dinamicamente
    const filterConditions = [];

    if (search) {
      const sanitized = escapeLikePattern(String(search).slice(0, MAX_SEARCH_LENGTH));
      filterConditions.push(
        or(ilike(subjects.name, `%${sanitized}%`), ilike(subjects.code, `%${sanitized}%`))
      );
    }

    if (department) {
      const sanitized = escapeLikePattern(String(department).slice(0, MAX_SEARCH_LENGTH));
      filterConditions.push(ilike(departments.name, `%${sanitized}%`));
    }

    const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

    // 3. Contar total de registros
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause);

    const totalCount = Number(countResult[0]?.count ?? 0);

    // 4. Buscar subjects com paginação
    const subjectsList = await db
      .select({
        ...getTableColumns(subjects),
        department: { ...getTableColumns(departments) },
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause)
      .orderBy(desc(subjects.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    // 5. Retornar resposta
    res.status(200).json({
      success: true,
      data: subjectsList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage) || 1,
        isEmpty: totalCount === 0,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`GET /subjects error: ${errorMessage}`, error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar disciplinas',
    });
  }
});

export default router;
