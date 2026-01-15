import { db } from '../db';
import { departments, subjects } from '../db/schema';
import { and, desc, eq, getTableColumns, ilike, or, sql } from 'drizzle-orm';
import express from 'express';

const router = express.Router();

/**
 * Escapa caracteres especiais do LIKE/ILIKE para evitar comportamento inesperado
 * Ex: "test%" vira "test\%" - busca literalmente por "test%" ao invés de padrão
 */
const escapeLikePattern = (value: string): string => {
  return value.replace(/[%_\\]/g, (char) => `\\${char}`);
};

/**
 * GET /subjects - Lista todos os subjects com busca, filtro e paginação
 *
 * Em Laravel seria:
 * Route::get('/subjects', [SubjectController::class, 'index']);
 */
router.get('/', async (req, res) => {
  try {
    // ============================================================
    // 1. EXTRAIR PARÂMETROS DA QUERY STRING
    // ============================================================
    // Em Laravel: $request->query('search'), $request->query('page', 1)
    const { search, department, page = 1, limit = 10 } = req.query;

    // Garante valores mínimos e máximos para paginação
    // Math.max evita números negativos ou zero
    // Math.min evita valores muito grandes que poderiam sobrecarregar o banco
    // Em Laravel seria: $request->validate(['limit' => 'integer|min:1|max:100'])
    const MAX_LIMIT = 100;
    const currentPage = Math.max(1, +page);
    const limitPerPage = Math.min(Math.max(1, +limit), MAX_LIMIT);

    // Calcula offset para paginação
    // Página 1: offset 0, Página 2: offset 10, Página 3: offset 20...
    // Em Laravel: ->skip($offset)->take($limit)
    const offset = (currentPage - 1) * limitPerPage;

    // ============================================================
    // 2. CONSTRUIR FILTROS DINAMICAMENTE
    // ============================================================
    // Array para acumular condições WHERE
    // Em Laravel seria usando ->when() ou criando scopes
    const filterConditions = [];

    // Se existe busca, filtra por nome OU código do subject
    // ilike = LIKE case-insensitive (ignora maiúsculas/minúsculas)
    // Em Laravel: ->where('name', 'ILIKE', "%{$search}%")
    //             ->orWhere('code', 'ILIKE', "%{$search}%")
    // Nota: trim/stripTags já feito pelo middleware global, aqui só escapa para LIKE
    if (search) {
      const sanitizedSearch = escapeLikePattern(String(search));
      filterConditions.push(
        or(
          ilike(subjects.name, `%${sanitizedSearch}%`),
          ilike(subjects.code, `%${sanitizedSearch}%`)
        )
      );
    }

    // Se existe filtro de departamento, filtra pelo nome do departamento
    // Em Laravel: ->whereHas('department', fn($q) => $q->where('name', 'ILIKE', ...))
    if (department) {
      const sanitizedDepartment = escapeLikePattern(String(department));
      filterConditions.push(ilike(departments.name, `%${sanitizedDepartment}%`));
    }

    // Combina todos os filtros com AND (se houver algum)
    // Em Laravel isso seria feito automaticamente pelo query builder
    const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

    // ============================================================
    // 3. CONTAR TOTAL DE REGISTROS (para paginação)
    // ============================================================
    // Em Laravel: Subject::join('departments'...)->where(...)->count()
    const countResult = await db
      .select({ count: sql<number>`count(*)` }) // SELECT COUNT(*)
      .from(subjects) // FROM subjects
      .leftJoin(departments, eq(subjects.departmentId, departments.id)) // LEFT JOIN departments
      .where(whereClause); // WHERE ...

    const totalCount = countResult[0]?.count ?? 0;

    // ============================================================
    // 4. BUSCAR SUBJECTS COM PAGINAÇÃO
    // ============================================================
    // Em Laravel:
    // Subject::select('subjects.*', 'departments.*')
    //   ->leftJoin('departments', 'subjects.department_id', '=', 'departments.id')
    //   ->where(...)
    //   ->orderBy('created_at', 'desc')
    //   ->skip($offset)
    //   ->take($limit)
    //   ->get()
    const subjectsList = await db
      .select({
        ...getTableColumns(subjects), // SELECT subjects.* (todas as colunas de subjects)
        department: { ...getTableColumns(departments) }, // + departments.* como objeto aninhado
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause)
      .orderBy(desc(subjects.createdAt)) // ORDER BY created_at DESC
      .limit(limitPerPage) // LIMIT 10
      .offset(offset); // OFFSET 0, 10, 20...

    // ============================================================
    // 5. RETORNAR RESPOSTA JSON
    // ============================================================
    // Em Laravel: return response()->json([...])
    res.status(200).json({
      success: true,
      data: subjectsList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage), // Arredonda para cima
      },
    });
  } catch (error) {
    // ============================================================
    // 6. TRATAMENTO DE ERROS
    // ============================================================
    // Em Laravel seria tratado pelo Handler ou try/catch no controller
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`GET /subjects error: ${errorMessage}`, error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar disciplinas',
    });
  }
});

export default router;
