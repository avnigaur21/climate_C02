import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    mode: 'DEMO - No Database'
  });
});

// Demo API endpoints
app.get('/api', (req, res) => {
  res.json({
    name: 'Carbon Risk Tracker API (DEMO)',
    version: '1.0.0',
    description: 'Backend API for Carbon → Humanitarian Risk Tracker - DEMO MODE',
    note: 'This is a demo version without database. Install PostgreSQL to use full functionality.',
    endpoints: {
      auth: {
        'POST /api/auth/signup': 'Create a new user account (DEMO)',
        'POST /api/auth/login': 'Authenticate user and get JWT token (DEMO)'
      },
      footprints: {
        'GET /api/footprints/summary': 'Get carbon footprint summary by period (DEMO)',
        'POST /api/footprints/import': 'Import footprints from CSV file (DEMO)',
        'GET /api/footprints': 'Get user footprints with pagination (DEMO)'
      },
      risk: {
        'POST /api/risk/evaluate': 'Evaluate humanitarian risk (DEMO)',
        'GET /api/risk/signals/footprint/:id': 'Get risk signals for a specific footprint (DEMO)'
      },
      regions: {
        'GET /api/regions': 'Get list of regions with vulnerability data (DEMO)',
        'GET /api/regions/:id': 'Get specific region details (DEMO)'
      }
    }
  });
});

// Demo regions data
const demoRegions = [
  {
    id: 'demo-1',
    name: 'Bangladesh',
    iso_code: 'BGD',
    vulnerability_index: 0.85,
    population: 164700000,
    base_hazard_prob: {
      flood: 0.3,
      drought: 0.15,
      heatwave: 0.25,
      storm: 0.4
    },
    exposure_fraction: 0.6
  },
  {
    id: 'demo-2',
    name: 'Philippines',
    iso_code: 'PHL',
    vulnerability_index: 0.78,
    population: 109600000,
    base_hazard_prob: {
      flood: 0.35,
      drought: 0.1,
      heatwave: 0.2,
      storm: 0.45
    },
    exposure_fraction: 0.55
  },
  {
    id: 'demo-3',
    name: 'Haiti',
    iso_code: 'HTI',
    vulnerability_index: 0.82,
    population: 11400000,
    base_hazard_prob: {
      flood: 0.25,
      drought: 0.2,
      heatwave: 0.3,
      storm: 0.35
    },
    exposure_fraction: 0.7
  }
];

// Demo endpoints
app.get('/api/regions', (req, res) => {
  res.json({
    regions: demoRegions,
    pagination: {
      limit: 50,
      offset: 0,
      total: demoRegions.length,
      has_more: false
    },
    note: 'DEMO DATA - Install PostgreSQL for full functionality'
  });
});

app.get('/api/regions/:id', (req, res): void => {
  const region = demoRegions.find(r => r.id === req.params.id);
  if (!region) {
    res.status(404).json({ error: 'Region not found' });
    return;
  }
  res.json({ region });
});

app.get('/api/regions/stats/summary', (req, res) => {
  res.json({
    summary: {
      total_regions: demoRegions.length,
      average_vulnerability_index: 0.82,
      min_vulnerability_index: 0.78,
      max_vulnerability_index: 0.85,
      total_population: 285600000,
      average_exposure_fraction: 0.62
    },
    note: 'DEMO DATA - Install PostgreSQL for full functionality'
  });
});

// Demo footprint summary
app.get('/api/footprints/summary', (req, res) => {
  res.json({
    summary: [
      {
        category: 'transport',
        total_co2_kg: 45.2,
        count: 12,
        period: '30d'
      },
      {
        category: 'energy',
        total_co2_kg: 23.8,
        count: 8,
        period: '30d'
      },
      {
        category: 'food',
        total_co2_kg: 18.5,
        count: 15,
        period: '30d'
      }
    ],
    period: '30d',
    total_categories: 3,
    total_co2_kg: 87.5,
    note: 'DEMO DATA - Install PostgreSQL for full functionality'
  });
});

// Demo risk evaluation
app.post('/api/risk/evaluate', (req, res) => {
  res.json({
    message: 'Risk evaluation completed (DEMO)',
    risk_signals: [
      {
        id: 'demo-risk-1',
        footprint_id: 'demo-footprint-1',
        region_id: 'demo-1',
        risk_type: 'flood',
        risk_score: 0.25,
        explanation: 'Flood risk assessment for Bangladesh (DEMO):\n- Total emissions: 2.5 tons CO2\n- Temperature increase: 0.0025°C\n- Base flood probability: 30.0%\n- Adjusted probability: 30.1%\n- Vulnerability index: 85.0%\n- Risk score: 25.0%\n- People at risk: 2,470,500',
        people_at_risk: 2470500
      }
    ],
    total_people_at_risk: 2470500,
    summary: [
      {
        region_id: 'demo-1',
        region_name: 'Bangladesh',
        total_risk_score: 0.25,
        people_at_risk: 2470500
      }
    ],
    note: 'DEMO DATA - Install PostgreSQL for full functionality'
  });
});

// Demo auth endpoints
app.post('/api/auth/signup', (req, res) => {
  res.json({
    message: 'User created successfully (DEMO)',
    user: {
      id: 'demo-user-1',
      email: req.body.email || 'demo@example.com',
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    token: 'demo-jwt-token-12345',
    note: 'DEMO MODE - Install PostgreSQL for real authentication'
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    message: 'Login successful (DEMO)',
    user: {
      id: 'demo-user-1',
      email: req.body.email || 'demo@example.com',
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    token: 'demo-jwt-token-12345',
    note: 'DEMO MODE - Install PostgreSQL for real authentication'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Carbon Risk Tracker API (DEMO) running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Documentation: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`⚠️  DEMO MODE - Install PostgreSQL for full functionality`);
});

export default app;
