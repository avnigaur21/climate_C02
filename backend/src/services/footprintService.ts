import Database from '../database/connection';
import { EmissionCalculator } from './emissionCalculator';
import { Footprint, FootprintSummary, CSVRow } from '../types';

export class FootprintService {
  private db = Database.getInstance();
  private emissionCalculator = new EmissionCalculator();

  async createFootprint(userId: string, footprint: Omit<Footprint, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Footprint> {
    const result = await this.db.query(
      `INSERT INTO footprints (user_id, category, co2_kg, date, meta)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, footprint.category, footprint.co2_kg, footprint.date, JSON.stringify(footprint.meta)]
    );

    return result.rows[0];
  }

  async getFootprintsByUser(userId: string, limit: number = 100, offset: number = 0): Promise<Footprint[]> {
    const result = await this.db.query(
      `SELECT * FROM footprints 
       WHERE user_id = $1 
       ORDER BY date DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows;
  }

  async getFootprintSummary(userId: string, period: string = '30d'): Promise<FootprintSummary[]> {
    let dateFilter = '';
    let params: any[] = [userId];

    switch (period) {
      case '7d':
        dateFilter = 'AND date >= CURRENT_DATE - INTERVAL \'7 days\'';
        break;
      case '30d':
        dateFilter = 'AND date >= CURRENT_DATE - INTERVAL \'30 days\'';
        break;
      case '90d':
        dateFilter = 'AND date >= CURRENT_DATE - INTERVAL \'90 days\'';
        break;
      case '1y':
        dateFilter = 'AND date >= CURRENT_DATE - INTERVAL \'1 year\'';
        break;
      default:
        dateFilter = 'AND date >= CURRENT_DATE - INTERVAL \'30 days\'';
    }

    const result = await this.db.query(
      `SELECT 
         category,
         SUM(co2_kg) as total_co2_kg,
         COUNT(*) as count
       FROM footprints 
       WHERE user_id = $1 ${dateFilter}
       GROUP BY category
       ORDER BY total_co2_kg DESC`,
      params
    );

    return result.rows.map((row: { category: string; total_co2_kg: string; count: string }) => ({
      category: row.category,
      total_co2_kg: parseFloat(row.total_co2_kg),
      count: parseInt(row.count),
      period
    }));
  }

  async importFromCSV(userId: string, csvData: CSVRow[]): Promise<{ imported: number; errors: string[] }> {
    const errors: string[] = [];
    let imported = 0;

    for (const [index, row] of csvData.entries()) {
      try {
        // Validate required fields
        if (!row.category || !row.amount || !row.unit || !row.date) {
          errors.push(`Row ${index + 1}: Missing required fields (category, amount, unit, date)`);
          continue;
        }

        // Parse the row using emission calculator
        const footprintData = this.emissionCalculator.parseCSVRow(row);
        
        if (!footprintData.category || !footprintData.co2_kg || !footprintData.date) {
          errors.push(`Row ${index + 1}: Failed to calculate emissions`);
          continue;
        }

        // Create footprint record
        await this.createFootprint(userId, {
          category: footprintData.category,
          co2_kg: footprintData.co2_kg,
          date: footprintData.date,
          meta: footprintData.meta || {}
        });

        imported++;
      } catch (error: any) {
        errors.push(`Row ${index + 1}: ${error.message}`);
      }
    }

    return { imported, errors };
  }

  async getFootprintsByIds(footprintIds: string[]): Promise<Footprint[]> {
    if (footprintIds.length === 0) return [];

    const placeholders = footprintIds.map((_, index) => `$${index + 1}`).join(',');
    const result = await this.db.query(
      `SELECT * FROM footprints WHERE id IN (${placeholders})`,
      footprintIds
    );

    return result.rows;
  }

  async deleteFootprint(userId: string, footprintId: string): Promise<boolean> {
    const result = await this.db.query(
      'DELETE FROM footprints WHERE id = $1 AND user_id = $2',
      [footprintId, userId]
    );

    return result.rowCount > 0;
  }
}
