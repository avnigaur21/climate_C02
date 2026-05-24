import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { RiskEngine } from '../services/riskEngine';
import Joi from 'joi';

const router = Router();
const riskEngine = new RiskEngine();

// Validation schemas
const riskEvaluationSchema = Joi.object({
  footprint_ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
  region_ids: Joi.array().items(Joi.string().uuid()).min(1).required()
});

// POST /api/risk/evaluate
router.post('/evaluate', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = riskEvaluationSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { footprint_ids, region_ids } = value;

    // Verify that all footprints belong to the authenticated user
    const userId = (req as any).user.id;
    const footprintService = new (await import('../services/footprintService')).FootprintService();
    const userFootprints = await footprintService.getFootprintsByIds(footprint_ids);
    
    const invalidFootprints = userFootprints.filter(fp => fp.user_id !== userId);
    if (invalidFootprints.length > 0) {
      res.status(403).json({ error: 'Access denied to some footprints' });
      return;
    }

    const result = await riskEngine.evaluateRisk({ footprint_ids, region_ids });

    res.json({
      message: 'Risk evaluation completed',
      ...result
    });
  } catch (error: any) {
    console.error('Risk evaluation error:', error);
    res.status(500).json({ error: error.message || 'Failed to evaluate risk' });
  }
});

// GET /api/risk/signals/footprint/:footprintId
router.get('/signals/footprint/:footprintId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const footprintId = req.params.footprintId;
    const userId = (req as any).user.id;

    // Verify footprint ownership
    const footprintService = new (await import('../services/footprintService')).FootprintService();
    const userFootprints = await footprintService.getFootprintsByIds([footprintId]);
    
    if (userFootprints.length === 0 || userFootprints[0].user_id !== userId) {
      res.status(404).json({ error: 'Footprint not found' });
      return;
    }

    const riskSignals = await riskEngine.getRiskSignalsByFootprint(footprintId);

    res.json({
      footprint_id: footprintId,
      risk_signals: riskSignals
    });
  } catch (error: any) {
    console.error('Get risk signals error:', error);
    res.status(500).json({ error: 'Failed to get risk signals' });
  }
});

// GET /api/risk/signals/region/:regionId
router.get('/signals/region/:regionId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const regionId = req.params.regionId;

    const riskSignals = await riskEngine.getRiskSignalsByRegion(regionId);

    res.json({
      region_id: regionId,
      risk_signals: riskSignals
    });
  } catch (error: any) {
    console.error('Get risk signals by region error:', error);
    res.status(500).json({ error: 'Failed to get risk signals' });
  }
});

export default router;
