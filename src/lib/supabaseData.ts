import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import {
  buildClimateScenario,
  climateRegions,
  mitigationActions,
  type ClimateRegion,
  type EmissionsProfile,
  type HazardType
} from "@/lib/climateScenario";

export type FootprintRow = Tables<"footprints">;
export type RegionRow = Tables<"regions">;
export type ImportRow = Tables<"imports">;
export type ProfileRow = Tables<"profiles">;
export type FootprintCategory = FootprintRow["category"];

export interface ParsedFootprintInput {
  category: FootprintCategory;
  amount: number;
  unit: string;
  activity_date: string;
  description: string;
  co2_kg: number;
  emission_factor: number;
  metadata: Record<string, string | number | null>;
}

export interface DashboardData {
  carbonData: {
    total: number;
    change: number;
    sparkline: { name: string; value: number }[];
  };
  categoryBreakdown: Array<{
    category: "Transport" | "Energy" | "Food" | "Shopping";
    value: number;
    change: number;
  }>;
  riskData: Array<{
    id: string;
    title: string;
    riskScore: number;
    peopleAffected: number;
    description: string;
    hazardType: "flood" | "drought" | "heat" | "displacement" | "food_insecurity" | "general";
    severity: "low" | "medium" | "high" | "critical";
    region: string;
  }>;
  timelineData: Array<{
    year: string;
    emissions: number;
    floodRisk: number;
    displacement: number;
    foodInsecurity: number;
    projection?: boolean;
  }>;
  recommendations: typeof mitigationActions;
  source: "supabase" | "demo";
}

export interface ProfileUserIdentity {
  id: string;
  email?: string | null;
  created_at?: string | null;
  user_metadata?: Record<string, unknown> | null;
}

export interface UserProfileData {
  fullName: string;
  email: string;
  joinDate: string;
  location: string;
  country: string;
  totalFootprint: number;
  footprintChange: number;
  source: "supabase" | "demo";
}

export interface UserProfileUpdate {
  fullName: string;
  location: string;
  country: string;
}

const categoryLabels = {
  transport: "Transport",
  energy: "Energy",
  food: "Food",
  shopping: "Shopping",
  purchase: "Shopping",
  travel: "Transport",
  other: "Shopping"
} satisfies Record<FootprintCategory, "Transport" | "Energy" | "Food" | "Shopping">;

const hazardLabels: Record<HazardType, string> = {
  flood: "Coastal Flooding Risk",
  drought: "Drought Stress",
  heat: "Extreme Heat Exposure",
  displacement: "Climate Displacement Pressure",
  food_insecurity: "Food Security Stress"
};

export const isDemoAuthUser = (userId?: string | null, forceDemo = false) => forceDemo || !userId || userId.startsWith("demo-");

const round = (value: number, digits = 1) => Number(value.toFixed(digits));

const metadataString = (user: ProfileUserIdentity, key: string) => {
  const value = user.user_metadata?.[key];
  return typeof value === "string" ? value : "";
};

const profileFallback = (user: ProfileUserIdentity, totalFootprint = 0, source: "supabase" | "demo" = "demo"): UserProfileData => {
  const fullName = metadataString(user, "full_name") ||
    [metadataString(user, "first_name"), metadataString(user, "last_name")].filter(Boolean).join(" ") ||
    user.email?.split("@")[0] ||
    "Climate User";

  return {
    fullName,
    email: user.email ?? "user@example.com",
    joinDate: user.created_at
      ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : "Current session",
    location: metadataString(user, "location") || "Not set",
    country: metadataString(user, "country") || "Not set",
    totalFootprint,
    footprintChange: 0,
    source
  };
};

const normalizeAmount = (amount: number, unit: string) => {
  const unitLower = unit.trim().toLowerCase();
  if (["mi", "mile", "miles"].includes(unitLower)) return amount * 1.60934;
  if (["m", "meter", "meters"].includes(unitLower)) return amount / 1000;
  if (["lb", "lbs", "pound", "pounds"].includes(unitLower)) return amount * 0.453592;
  if (["g", "gram", "grams"].includes(unitLower)) return amount / 1000;
  if (unitLower === "mj") return amount * 0.277778;
  if (unitLower === "btu") return amount * 0.000293071;
  if (unitLower === "eur") return amount * 1.1;
  if (unitLower === "gbp") return amount * 1.25;
  return amount;
};

const inferCategory = (rawCategory: string, description = ""): FootprintCategory => {
  const value = `${rawCategory} ${description}`.toLowerCase();
  if (value.includes("transport") || value.includes("car") || value.includes("bus") || value.includes("commute")) return "transport";
  if (value.includes("flight") || value.includes("travel") || value.includes("plane")) return "travel";
  if (value.includes("energy") || value.includes("electric") || value.includes("gas") || value.includes("kwh")) return "energy";
  if (value.includes("food") || value.includes("meal") || value.includes("beef") || value.includes("grocery")) return "food";
  if (value.includes("shopping") || value.includes("purchase") || value.includes("retail")) return "shopping";
  return "other";
};

const calculateEmission = (category: FootprintCategory, amount: number, unit: string, metadata: Record<string, string | number | null>) => {
  const normalizedAmount = normalizeAmount(amount, unit);
  const kind = String(metadata.type ?? metadata.transport_type ?? metadata.food_type ?? metadata.item ?? "").toLowerCase();

  if (category === "transport") {
    if (kind.includes("bus")) return { co2_kg: normalizedAmount * 0.105, emission_factor: 0.105 };
    if (kind.includes("flight") || kind.includes("plane")) return { co2_kg: normalizedAmount * 0.15, emission_factor: 0.15 };
    return { co2_kg: normalizedAmount * 0.192, emission_factor: 0.192 };
  }

  if (category === "travel") return { co2_kg: normalizedAmount * 0.15, emission_factor: 0.15 };
  if (category === "energy") return { co2_kg: normalizedAmount * 0.475, emission_factor: 0.475 };

  if (category === "food") {
    const factor = kind.includes("beef") ? 27 : kind.includes("pork") ? 12.1 : kind.includes("chicken") ? 6.9 : kind.includes("vegetable") ? 2 : 4;
    return { co2_kg: normalizedAmount * factor, emission_factor: factor };
  }

  const factor = 0.5;
  return { co2_kg: normalizedAmount * factor, emission_factor: factor };
};

const parseCsv = (text: string) => {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index++;
      row.push(current.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  row.push(current.trim());
  if (row.some(Boolean)) rows.push(row);
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => header.toLowerCase().replace(/\s+/g, "_"));
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
};

export const parseFootprintCsv = (text: string): ParsedFootprintInput[] => {
  return parseCsv(text).map((row) => {
    const amount = Number(row.amount || row.quantity || row.distance || row.usage || row.price || 0);
    const unit = String(row.unit || row.units || row.fuel_type || row.type || "unit");
    const description = String(row.description || row.item || row.type || "Imported activity");
    const category = inferCategory(String(row.category || row.type || ""), description);
    const activity_date = String(row.date || row.activity_date || new Date().toISOString().slice(0, 10));
    const metadata = { ...row };
    const { co2_kg, emission_factor } = calculateEmission(category, amount, unit, metadata);

    return {
      category,
      amount,
      unit,
      activity_date,
      description,
      co2_kg: round(co2_kg, 3),
      emission_factor,
      metadata
    };
  }).filter((row) => row.amount > 0 && row.co2_kg >= 0);
};

const toClimateRegion = (region: RegionRow): ClimateRegion => ({
  id: region.region_code,
  name: region.name,
  lat: region.lat,
  lng: region.lng,
  population: region.population,
  vulnerabilityIndex: region.vulnerability_index,
  exposureFraction: region.exposure_fraction,
  primaryRisk: region.primary_risk,
  climateImpacts: region.climate_impacts,
  hazardWeights: region.hazard_weights as ClimateRegion["hazardWeights"]
});

const severityFor = (score: number): "low" | "medium" | "high" | "critical" => {
  if (score >= 88) return "critical";
  if (score >= 72) return "high";
  if (score >= 48) return "medium";
  return "low";
};

const calculateRisks = (annualEmissionsTons: number, regions: ClimateRegion[]) => {
  const warmingPressure = Math.max(0.25, Math.min(1.3, annualEmissionsTons / 12.4 || 0.25));

  return regions.flatMap((region) =>
    (Object.entries(region.hazardWeights) as Array<[HazardType, number]>).map(([hazardType, hazardWeight]) => {
      const riskScore = Math.round(Math.min(98, Math.max(8, hazardWeight * region.vulnerabilityIndex * warmingPressure * 118)));
      const peopleAffected = Math.round(region.population * region.exposureFraction * (riskScore / 100) * (0.72 + hazardWeight * 0.28));

      return {
        id: `${region.id}-${hazardType}`,
        title: hazardLabels[hazardType],
        riskScore,
        peopleAffected,
        description: `${region.primaryRisk}; estimated from saved footprint data, regional vulnerability, and exposure.`,
        hazardType,
        severity: severityFor(riskScore),
        region: region.name,
        regionCode: region.id
      };
    })
  ).sort((a, b) => b.riskScore - a.riskScore);
};

export const fetchRegionCatalog = async (): Promise<{ regions: ClimateRegion[]; source: "supabase" | "demo" }> => {
  if (!supabase) return { regions: climateRegions, source: "demo" };

  const { data, error } = await supabase
    .from("regions")
    .select("*")
    .order("vulnerability_index", { ascending: false });

  if (error || !data?.length) return { regions: climateRegions, source: "demo" };
  return { regions: data.map(toClimateRegion), source: "supabase" };
};

export const fetchRegions = async () => {
  const catalog = await fetchRegionCatalog();
  return catalog.regions;
};

export const fetchDashboardData = async (userId?: string, options: { demo?: boolean } = {}): Promise<DashboardData> => {
  const regions = await fetchRegions();

  if (!supabase || isDemoAuthUser(userId, options.demo)) {
    const scenario = buildClimateScenario({ annualReductionPct: 5, adaptationInvestmentPct: 45, horizonYear: 2040 });
    return {
      carbonData: {
        total: scenario.currentEmissions,
        change: -8.5,
        sparkline: [
          { name: "Jan", value: 15.2 },
          { name: "Feb", value: 14.8 },
          { name: "Mar", value: 13.9 },
          { name: "Apr", value: 13.1 },
          { name: "May", value: scenario.currentEmissions }
        ]
      },
      categoryBreakdown: scenario.categoryBreakdown.map((item) => ({
        category: categoryLabels[item.category],
        value: item.value,
        change: -Math.max(3, Math.round(item.share / 2))
      })),
      riskData: scenario.topRisks,
      timelineData: scenario.timeline,
      recommendations: scenario.recommendations,
      source: "demo"
    };
  }

  const { data, error } = await supabase
    .from("footprints")
    .select("*")
    .eq("user_id", userId)
    .order("activity_date", { ascending: true });

  if (error) throw error;

  const footprints = data ?? [];
  const totalKg = footprints.reduce((sum, row) => sum + Number(row.co2_kg), 0);
  const totalTons = round(totalKg / 1000);

  const categoryTotals = new Map<"Transport" | "Energy" | "Food" | "Shopping", number>([
    ["Transport", 0],
    ["Energy", 0],
    ["Food", 0],
    ["Shopping", 0]
  ]);

  footprints.forEach((row) => {
    const label = categoryLabels[row.category];
    categoryTotals.set(label, (categoryTotals.get(label) ?? 0) + Number(row.co2_kg) / 1000);
  });

  const emissionsProfile: EmissionsProfile = {
    transport: round(categoryTotals.get("Transport") ?? 0),
    energy: round(categoryTotals.get("Energy") ?? 0),
    food: round(categoryTotals.get("Food") ?? 0),
    shopping: round(categoryTotals.get("Shopping") ?? 0)
  };

  const timelineBuckets = new Map<string, number>();
  footprints.forEach((row) => {
    const date = new Date(row.activity_date);
    const label = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    timelineBuckets.set(label, (timelineBuckets.get(label) ?? 0) + Number(row.co2_kg) / 1000);
  });

  const sparkline = Array.from(timelineBuckets.entries()).slice(-6).map(([name, value]) => ({ name, value: round(value) }));
  const scenario = buildClimateScenario({
    annualReductionPct: 5,
    adaptationInvestmentPct: 45,
    horizonYear: 2040,
    profile: totalTons > 0 ? emissionsProfile : undefined
  });

  const risks = calculateRisks(totalTons || scenario.currentEmissions, regions).slice(0, 4);

  return {
    carbonData: {
      total: totalTons,
      change: 0,
      sparkline: sparkline.length ? sparkline : [{ name: "Now", value: totalTons }]
    },
    categoryBreakdown: Array.from(categoryTotals.entries()).map(([category, value]) => ({
      category,
      value: round(value),
      change: 0
    })),
    riskData: risks,
    timelineData: scenario.timeline,
    recommendations: mitigationActions,
    source: "supabase"
  };
};

export const fetchUserProfile = async (
  user: ProfileUserIdentity,
  options: { demo?: boolean } = {}
): Promise<UserProfileData> => {
  const dashboard = await fetchDashboardData(user.id, options);
  const fallback = profileFallback(user, dashboard.carbonData.total, dashboard.source);

  if (!supabase || isDemoAuthUser(user.id, options.demo)) return fallback;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;

  return {
    ...fallback,
    fullName: data?.full_name || fallback.fullName,
    email: data?.email || fallback.email,
    location: data?.location || fallback.location,
    country: data?.country || fallback.country,
    source: "supabase"
  };
};

export const updateUserProfile = async (
  user: ProfileUserIdentity,
  input: UserProfileUpdate,
  options: { demo?: boolean } = {}
) => {
  if (!supabase || isDemoAuthUser(user.id, options.demo)) {
    return {
      full_name: input.fullName,
      location: input.location,
      country: input.country,
      email: user.email ?? "user@example.com"
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      email: user.email ?? null,
      full_name: input.fullName,
      location: input.location,
      country: input.country
    }, { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw error;
  return data;
};

export const importFootprints = async (
  userId: string,
  filename: string,
  csvText: string,
  options: { demo?: boolean } = {}
) => {
  const parsed = parseFootprintCsv(csvText);
  const totalCo2Kg = parsed.reduce((sum, row) => sum + row.co2_kg, 0);

  if (!supabase || isDemoAuthUser(userId, options.demo)) {
    return {
      imported: parsed.length,
      totalCo2Kg,
      errors: parsed.length ? [] : ["No valid rows found"],
      source: "demo" as const
    };
  }

  const importPayload: TablesInsert<"imports"> = {
    user_id: userId,
    filename,
    row_count: parsed.length,
    total_co2_kg: round(totalCo2Kg, 3),
    status: parsed.length ? "completed" : "failed",
    errors: parsed.length ? [] : ["No valid rows found"]
  };

  const { data: importRecord, error: importError } = await supabase
    .from("imports")
    .insert(importPayload)
    .select("*")
    .single();

  if (importError) throw importError;

  if (parsed.length) {
    const footprints: TablesInsert<"footprints">[] = parsed.map((row) => ({
      user_id: userId,
      import_id: importRecord.id,
      category: row.category,
      description: row.description,
      activity_date: row.activity_date,
      amount: row.amount,
      unit: row.unit,
      co2_kg: row.co2_kg,
      emission_factor: row.emission_factor,
      metadata: row.metadata
    }));

    const { error: footprintError } = await supabase.from("footprints").insert(footprints);
    if (footprintError) throw footprintError;

    const regions = await fetchRegions();
    const risks = calculateRisks(totalCo2Kg / 1000, regions).slice(0, 8);
    const regionRows = await supabase.from("regions").select("id, region_code");

    if (!regionRows.error && regionRows.data?.length) {
      const regionIds = new Map(regionRows.data.map((region) => [region.region_code, region.id]));
      const riskRows: TablesInsert<"risk_evaluations">[] = risks.flatMap((risk) => {
        const region_id = regionIds.get(risk.regionCode);
        if (!region_id) return [];

        return [{
          user_id: userId,
          region_id,
          risk_type: risk.hazardType,
          risk_score: risk.riskScore,
          people_at_risk: risk.peopleAffected,
          scenario: {
            import_id: importRecord.id,
            total_co2_kg: totalCo2Kg
          },
          explanation: risk.description
        }];
      });

      if (riskRows.length) {
        const { error: riskError } = await supabase.from("risk_evaluations").insert(riskRows);
        if (riskError) throw riskError;
      }
    }
  }

  return {
    imported: parsed.length,
    totalCo2Kg,
    errors: parsed.length ? [] : ["No valid rows found"],
    source: "supabase" as const
  };
};
