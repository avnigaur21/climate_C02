import { Router, Request, Response } from 'express';
import Database from '../database/connection';
import Joi from 'joi';

const router = Router();
const db = Database.getInstance();

// Validation schemas
const regionsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
  search: Joi.string().optional(),
  min_vulnerability: Joi.number().min(0).max(1).optional(),
  max_vulnerability: Joi.number().min(0).max(1).optional()
});

// GET /api/regions
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = regionsQuerySchema.validate(req.query);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { limit, offset, search, min_vulnerability, max_vulnerability } = value;

    let query = 'SELECT * FROM regions';
    const params: any[] = [];
    let paramCount = 0;

    const conditions: string[] = [];

    if (search) {
      paramCount++;
      conditions.push(`(name ILIKE $${paramCount} OR iso_code ILIKE $${paramCount})`);
      params.push(`%${search}%`);
    }

    if (min_vulnerability !== undefined) {
      paramCount++;
      conditions.push(`vulnerability_index >= $${paramCount}`);
      params.push(min_vulnerability);
    }

    if (max_vulnerability !== undefined) {
      paramCount++;
      conditions.push(`vulnerability_index <= $${paramCount}`);
      params.push(max_vulnerability);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY vulnerability_index DESC, name ASC';
    
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await db.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM regions';
    const countParams: any[] = [];
    let countParamCount = 0;

    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
      countParams.push(...params.slice(0, -2)); // Remove limit and offset params
    }

    const countResult = await db.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      regions: result.rows,
      pagination: {
        limit,
        offset,
        total: totalCount,
        has_more: offset + limit < totalCount
      }
    });
  } catch (error: any) {
    console.error('Get regions error:', error);
    res.status(500).json({ error: 'Failed to get regions' });
  }
});

// GET /api/regions/stats/summary
router.get('/stats/summary', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query(`
      SELECT
        COUNT(*) as total_regions,
        AVG(vulnerability_index) as avg_vulnerability,
        MIN(vulnerability_index) as min_vulnerability,
        MAX(vulnerability_index) as max_vulnerability,
        SUM(population) as total_population,
        AVG(exposure_fraction) as avg_exposure_fraction
      FROM regions
    `);

    const stats = result.rows[0];

    res.json({
      summary: {
        total_regions: parseInt(stats.total_regions),
        average_vulnerability_index: parseFloat(stats.avg_vulnerability),
        min_vulnerability_index: parseFloat(stats.min_vulnerability),
        max_vulnerability_index: parseFloat(stats.max_vulnerability),
        total_population: parseInt(stats.total_population),
        average_exposure_fraction: parseFloat(stats.avg_exposure_fraction)
      }
    });
  } catch (error: any) {
    console.error('Get regions stats error:', error);
    res.status(500).json({ error: 'Failed to get regions statistics' });
  }
});

// GET /api/regions/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const regionId = req.params.id;

    const result = await db.query(
      'SELECT * FROM regions WHERE id = $1',
      [regionId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Region not found' });
      return;
    }

    res.json({
      region: result.rows[0]
    });
  } catch (error: any) {
    console.error('Get region error:', error);
    res.status(500).json({ error: 'Failed to get region' });
  }
});

export default router;
