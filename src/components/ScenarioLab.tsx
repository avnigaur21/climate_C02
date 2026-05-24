import { useMemo, useState } from "react";
import { Activity, Gauge, ShieldCheck, TrendingDown, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { SummaryCard } from "@/components/SummaryCard";
import { TimelineChart } from "@/components/TimelineChart";
import { RiskCard } from "@/components/RiskCard";
import { buildClimateScenario } from "@/lib/climateScenario";

const horizons = [2030, 2040, 2050];

const formatPeople = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return String(value);
};

export function ScenarioLab() {
  const [annualReductionPct, setAnnualReductionPct] = useState(5);
  const [adaptationInvestmentPct, setAdaptationInvestmentPct] = useState(45);
  const [horizonYear, setHorizonYear] = useState(2040);

  const scenario = useMemo(
    () => buildClimateScenario({ annualReductionPct, adaptationInvestmentPct, horizonYear }),
    [annualReductionPct, adaptationInvestmentPct, horizonYear]
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Scenario Lab</h2>
            <Badge variant="outline">Explainable model</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Model how mitigation and adaptation choices change regional humanitarian risk.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {horizons.map((year) => (
            <Button
              key={year}
              type="button"
              size="sm"
              variant={horizonYear === year ? "default" : "outline"}
              onClick={() => setHorizonYear(year)}
            >
              {year}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Scenario Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <label className="text-sm font-medium" htmlFor="annual-reduction">
                  Annual CO2 reduction
                </label>
                <Badge variant="secondary">{annualReductionPct}%</Badge>
              </div>
              <Slider
                id="annual-reduction"
                min={0}
                max={12}
                step={1}
                value={[annualReductionPct]}
                onValueChange={([value]) => setAnnualReductionPct(value)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <label className="text-sm font-medium" htmlFor="adaptation-investment">
                  Adaptation investment
                </label>
                <Badge variant="secondary">{adaptationInvestmentPct}%</Badge>
              </div>
              <Slider
                id="adaptation-investment"
                min={0}
                max={100}
                step={5}
                value={[adaptationInvestmentPct]}
                onValueChange={([value]) => setAdaptationInvestmentPct(value)}
              />
            </div>

            <div className="space-y-3 rounded-md border p-4">
              {scenario.methodology.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">{item.label}</div>
                  <div className="text-sm">{item.value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Projected CO2"
              value={scenario.projectedEmissions.toString()}
              unit="tons/year"
              change={-annualReductionPct}
              icon={<TrendingDown className="h-4 w-4 text-safe" />}
              trend="down"
              variant="success"
            />
            <SummaryCard
              title="Avoided CO2"
              value={scenario.avoidedEmissions.toString()}
              unit="tons"
              icon={<Activity className="h-4 w-4 text-forest" />}
              variant="success"
            />
            <SummaryCard
              title="People Protected"
              value={formatPeople(scenario.peopleProtected)}
              icon={<Users className="h-4 w-4 text-ocean" />}
              variant="warning"
            />
            <SummaryCard
              title="Resilience Score"
              value={scenario.resilienceScore.toString()}
              unit="/100"
              icon={<ShieldCheck className="h-4 w-4 text-primary" />}
              variant={scenario.resilienceScore > 70 ? "success" : "warning"}
            />
          </div>

          <TimelineChart data={scenario.timeline} title="Scenario Projection" showProjections />

          <div className="grid gap-4 lg:grid-cols-2">
            {scenario.topRisks.map((risk) => (
              <RiskCard key={risk.id} {...risk} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
