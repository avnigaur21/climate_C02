import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';
import { FootprintService } from '../services/footprintService';
import { CSVParser } from '../utils/csvParser';
import fs from 'fs';
import path from 'path';
import Joi from 'joi';

const router = Router();
const footprintService = new FootprintService();

// Validation schemas
const summaryQuerySchema = Joi.object({
  period: Joi.string().valid('7d', '30d', '90d', '1y').default('30d')
});

// GET /api/footprints/summary
router.get('/summary', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = summaryQuerySchema.validate(req.query);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const userId = (req as any).user.id;
    const { period } = value;

    const summary = await footprintService.getFootprintSummary(userId, period);

    res.json({
      summary,
      period,
      total_categories: summary.length,
      total_co2_kg: summary.reduce((sum, item) => sum + item.total_co2_kg, 0)
    });
  } catch (error: any) {
    console.error('Footprint summary error:', error);
    res.status(500).json({ error: 'Failed to get footprint summary' });
  }
});

// POST /api/footprints/import
router.post('/import', authenticateToken, uploadSingle, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No CSV file uploaded' });
      return;
    }

    const userId = (req as any).user.id;
    const filePath = req.file.path;

    try {
      // Parse CSV file
      const csvData = await CSVParser.parseCSV(filePath);
      
      // Validate CSV data
      const validation = CSVParser.validateCSVData(csvData);
      if (!validation.isValid) {
        res.status(400).json({
          error: 'Invalid CSV data', 
          details: validation.errors,
          expectedFormat: CSVParser.getExpectedCSVFormat()
        });
        return;
      }

      // Import footprints
      const result = await footprintService.importFromCSV(userId, csvData);

      res.json({
        message: 'CSV import completed',
        imported: result.imported,
        errors: result.errors,
        total_rows: csvData.length
      });
    } finally {
      // Clean up uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error: any) {
    console.error('CSV import error:', error);
    res.status(500).json({ error: 'Failed to import CSV file' });
  }
});

// GET /api/footprints
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const footprints = await footprintService.getFootprintsByUser(userId, limit, offset);

    res.json({
      footprints,
      pagination: {
        limit,
        offset,
        count: footprints.length
      }
    });
  } catch (error: any) {
    console.error('Get footprints error:', error);
    res.status(500).json({ error: 'Failed to get footprints' });
  }
});

// DELETE /api/footprints/:id
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const footprintId = req.params.id;

    const deleted = await footprintService.deleteFootprint(userId, footprintId);

    if (deleted) {
      res.json({ message: 'Footprint deleted successfully' });
    } else {
      res.status(404).json({ error: 'Footprint not found' });
    }
  } catch (error: any) {
    console.error('Delete footprint error:', error);
    res.status(500).json({ error: 'Failed to delete footprint' });
  }
});

export default router;
