export type EmissionCategory = "transport" | "energy" | "food" | "shopping";

export type HazardType = "flood" | "drought" | "heat" | "displacement" | "food_insecurity";

export interface EmissionsProfile {
  transport: number;
  energy: number;
  food: number;
  shopping: number;
}

export interface ClimateRegion {
  id: string;
  name: string;
  lat: number;
  lng: number;
  population: number;
  vulnerabilityIndex: number;
  exposureFraction: number;
  primaryRisk: string;
  climateImpacts: string[];
  hazardWeights: Record<HazardType, number>;
}

export interface MitigationAction {
  id: string;
  title: string;
  description: string;
  category: EmissionCategory | "travel";
  co2Savings: number;
  difficulty: "easy" | "medium" | "hard";
  impact: "low" | "medium" | "high";
}

export interface ScenarioInput {
  annualReductionPct: number;
  adaptationInvestmentPct: number;
  horizonYear: number;
  profile?: EmissionsProfile;
}

export interface ScenarioRisk {
  id: string;
  title: string;
  riskScore: number;
  peopleAffected: number;
  description: string;
  hazardType: HazardType;
  severity: "low" | "medium" | "high" | "critical";
  region: string;
}

export interface ScenarioTimelinePoint {
  year: string;
  emissions: number;
  floodRisk: number;
  displacement: number;
  foodInsecurity: number;
  projection?: boolean;
}

export interface ClimateScenario {
  currentEmissions: number;
  projectedEmissions: number;
  avoidedEmissions: number;
  peopleAtRisk: number;
  peopleProtected: number;
  resilienceScore: number;
  confidenceScore: number;
  categoryBreakdown: Array<{
    category: EmissionCategory;
    value: number;
    share: number;
  }>;
  timeline: ScenarioTimelinePoint[];
  topRisks: ScenarioRisk[];
  recommendations: MitigationAction[];
  methodology: Array<{
    label: string;
    value: string;
  }>;
}

export const baselineProfile: EmissionsProfile = {
  transport: 5.2,
  energy: 3.8,
  food: 2.1,
  shopping: 1.3
};

export const climateRegions: ClimateRegion[] = [
  {
    id: "bangladesh-delta",
    name: "Bangladesh Delta",
    lat: 23.685,
    lng: 90.3563,
    population: 8500000,
    vulnerabilityIndex: 0.82,
    exposureFraction: 0.58,
    primaryRisk: "Coastal flooding and sea level rise",
    climateImpacts: ["Flooding", "Cyclones", "Saltwater intrusion"],
    hazardWeights: {
      flood: 0.88,
      drought: 0.22,
      heat: 0.48,
      displacement: 0.71,
      food_insecurity: 0.42
    }
  },
  {
    id: "sahel-region",
    name: "Sahel Region",
    lat: 14,
    lng: 2,
    population: 5600000,
    vulnerabilityIndex: 0.78,
    exposureFraction: 0.52,
    primaryRisk: "Drought and desertification",
    climateImpacts: ["Drought", "Desertification", "Food insecurity"],
    hazardWeights: {
      flood: 0.18,
      drought: 0.84,
      heat: 0.75,
      displacement: 0.64,
      food_insecurity: 0.86
    }
  },
  {
    id: "pacific-islands",
    name: "Pacific Small Islands",
    lat: -8.5,
    lng: 179,
    population: 890000,
    vulnerabilityIndex: 0.91,
    exposureFraction: 0.68,
    primaryRisk: "Sea level rise and storm surge",
    climateImpacts: ["Sea level rise", "Coral bleaching", "Storm surge"],
    hazardWeights: {
      flood: 0.92,
      drought: 0.31,
      heat: 0.56,
      displacement: 0.78,
      food_insecurity: 0.48
    }
  },
  {
    id: "central-america-highlands",
    name: "Central America Highlands",
    lat: 14.6349,
    lng: -90.5069,
    population: 3200000,
    vulnerabilityIndex: 0.73,
    exposureFraction: 0.46,
    primaryRisk: "Extreme weather and crop failure",
    climateImpacts: ["Hurricanes", "Drought", "Crop failure"],
    hazardWeights: {
      flood: 0.58,
      drought: 0.62,
      heat: 0.44,
      displacement: 0.46,
      food_insecurity: 0.72
    }
  },
  {
    id: "east-african-highlands",
    name: "East African Highlands",
    lat: 1,
    lng: 37,
    population: 6800000,
    vulnerabilityIndex: 0.71,
    exposureFraction: 0.5,
    primaryRisk: "Irregular rainfall and food insecurity",
    climateImpacts: ["Irregular rainfall", "Food insecurity", "Pastoral conflicts"],
    hazardWeights: {
      flood: 0.36,
      drought: 0.69,
      heat: 0.59,
      displacement: 0.5,
      food_insecurity: 0.82
    }
  }
];

export const mitigationActions: MitigationAction[] = [
  {
    id: "ev-commute",
    title: "Electrify weekly commute",
    description: "Shift high-frequency car trips to EV, transit, or shared mobility.",
    category: "transport",
    co2Savings: 2.8,
    difficulty: "medium",
    impact: "high"
  },
  {
    id: "home-efficiency",
    title: "Home efficiency retrofit",
    description: "Combine efficient appliances, insulation, and cleaner electricity sourcing.",
    category: "energy",
    co2Savings: 1.9,
    difficulty: "hard",
    impact: "high"
  },
  {
    id: "plant-forward",
    title: "Plant-forward meals",
    description: "Replace carbon-intensive meals three days per week.",
    category: "food",
    co2Savings: 0.8,
    difficulty: "easy",
    impact: "medium"
  },
  {
    id: "circular-shopping",
    title: "Circular purchasing",
    description: "Prefer repair, second-hand purchases, and lower-carbon suppliers.",
    category: "shopping",
    co2Savings: 0.6,
    difficulty: "easy",
    impact: "medium"
  },
  {
    id: "flight-budget",
    title: "Annual travel budget",
    description: "Set a flight budget and substitute one short-haul trip with rail.",
    category: "travel",
    co2Savings: 1.4,
    difficulty: "medium",
    impact: "high"
  }
];

const hazardLabels: Record<HazardType, string> = {
  flood: "Coastal Flooding Risk",
  drought: "Drought Stress",
  heat: "Extreme Heat Exposure",
  displacement: "Climate Displacement Pressure",
  food_insecurity: "Food Security Stress"
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const totalEmissions = (profile: EmissionsProfile) =>
  Object.values(profile).reduce((sum, value) => sum + value, 0);

const severityFor = (score: number): ScenarioRisk["severity"] => {
  if (score >= 88) return "critical";
  if (score >= 72) return "high";
  if (score >= 48) return "medium";
  return "low";
};

export function buildClimateScenario(input: ScenarioInput): ClimateScenario {
  const profile = input.profile ?? baselineProfile;
  const currentEmissions = totalEmissions(profile);
  const startYear = 2026;
  const years = Math.max(1, input.horizonYear - startYear);
  const annualReductionRate = clamp(input.annualReductionPct, 0, 12) / 100;
  const adaptationFactor = clamp(input.adaptationInvestmentPct, 0, 100) / 100;
  const projectedEmissions = currentEmissions * Math.pow(1 - annualReductionRate, years);
  const avoidedEmissions = Math.max(0, currentEmissions * years - projectedEmissions * years);
  const warmingPressure = clamp(projectedEmissions / currentEmissions, 0.25, 1.25);
  const resilienceMultiplier = 1 - adaptationFactor * 0.32;

  const risks = climateRegions.flatMap((region) =>
    (Object.entries(region.hazardWeights) as Array<[HazardType, number]>).map(([hazardType, hazardWeight]) => {
      const rawScore = hazardWeight * region.vulnerabilityIndex * warmingPressure * resilienceMultiplier * 118;
      const riskScore = Math.round(clamp(rawScore, 8, 98));
      const peopleAffected = Math.round(
        region.population * region.exposureFraction * (riskScore / 100) * (0.72 + hazardWeight * 0.28)
      );

      return {
        id: `${region.id}-${hazardType}`,
        title: hazardLabels[hazardType],
        riskScore,
        peopleAffected,
        description: `${region.primaryRisk}; scenario adjusted for mitigation and adaptation assumptions.`,
        hazardType,
        severity: severityFor(riskScore),
        region: region.name
      };
    })
  );

  const topRisks = risks.sort((a, b) => b.riskScore - a.riskScore).slice(0, 4);
  const peopleAtRisk = topRisks.reduce((sum, risk) => sum + risk.peopleAffected, 0);
  const baselinePeopleAtRisk = 8900000;
  const peopleProtected = Math.max(0, baselinePeopleAtRisk - peopleAtRisk);
  const resilienceScore = Math.round(clamp((1 - warmingPressure) * 42 + adaptationFactor * 58 + 38, 0, 100));
  const confidenceScore = Math.round(clamp(82 - years * 0.55 + adaptationFactor * 6, 58, 88));

  const timeline: ScenarioTimelinePoint[] = Array.from({ length: Math.min(years + 1, 9) }, (_, index) => {
    const year = startYear + Math.round((years / Math.min(years, 8)) * index);
    const elapsed = year - startYear;
    const emissions = currentEmissions * Math.pow(1 - annualReductionRate, elapsed);
    const pressure = emissions / currentEmissions;

    return {
      year: String(year),
      emissions: Number(emissions.toFixed(1)),
      floodRisk: Math.round(clamp(64 * pressure * resilienceMultiplier + elapsed * 0.9, 25, 95)),
      displacement: Math.round(clamp(150 * pressure * resilienceMultiplier + elapsed * 4.2, 65, 310)),
      foodInsecurity: Math.round(clamp(205 * pressure * resilienceMultiplier + elapsed * 5.8, 80, 380)),
      projection: year > startYear
    };
  });

  const categoryBreakdown = (Object.entries(profile) as Array<[EmissionCategory, number]>).map(([category, value]) => ({
    category,
    value,
    share: Math.round((value / currentEmissions) * 100)
  }));

  return {
    currentEmissions: Number(currentEmissions.toFixed(1)),
    projectedEmissions: Number(projectedEmissions.toFixed(1)),
    avoidedEmissions: Number(avoidedEmissions.toFixed(1)),
    peopleAtRisk,
    peopleProtected,
    resilienceScore,
    confidenceScore,
    categoryBreakdown,
    timeline,
    topRisks,
    recommendations: mitigationActions,
    methodology: [
      { label: "Emissions pathway", value: `${input.annualReductionPct}% annual reduction through ${input.horizonYear}` },
      { label: "Adaptation lever", value: `${input.adaptationInvestmentPct}% resilience investment assumption` },
      { label: "Risk model", value: "hazard weight x vulnerability x exposure x scenario pressure" },
      { label: "Confidence", value: `${confidenceScore}% based on horizon length and data completeness` }
    ]
  };
}
