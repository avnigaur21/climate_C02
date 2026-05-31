import { useEffect, useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { SummaryCard } from "@/components/SummaryCard";
import { RiskCard } from "@/components/RiskCard";
import { TimelineChart } from "@/components/TimelineChart";
import { RecommendationsList } from "@/components/RecommendationsList";
import { ScenarioLab } from "@/components/ScenarioLab";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { fetchDashboardData, type DashboardData } from "@/lib/supabaseData";
import {
  Activity,
  AlertTriangle,
  Car,
  Globe,
  Home,
  Settings,
  ShoppingBag,
  TrendingDown,
  Utensils
} from "lucide-react";

const categoryIcons = {
  Transport: <Car className="h-5 w-5" />,
  Energy: <Home className="h-5 w-5" />,
  Food: <Utensils className="h-5 w-5" />,
  Shopping: <ShoppingBag className="h-5 w-5" />
};

const isDemoUser = (user: unknown) => Boolean((user as { is_demo_user?: boolean })?.is_demo_user);
const loginUrl = () => new URL("login", window.location.href).toString();

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setDashboardError(null);

    fetchDashboardData(user.id, { demo: isDemoUser(user) })
      .then((data) => {
        if (!cancelled) setDashboardData(data);
      })
      .catch((error) => {
        if (!cancelled) {
          setDashboardError(error instanceof Error ? error.message : "Failed to load dashboard data");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = loginUrl();
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={!!user} onLogout={signOut} />

      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Climate Impact Dashboard</h1>
            <p className="text-muted-foreground">
              Track saved carbon footprint data and its humanitarian risk impact
            </p>
          </div>
          <div className="flex items-center gap-3">
            {dashboardData && (
              <Badge variant={dashboardData.source === "supabase" ? "default" : "outline"}>
                {dashboardData.source === "supabase" ? "Live Supabase data" : "Demo data"}
              </Badge>
            )}
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {dashboardError && (
          <Card className="border-risk bg-risk/5">
            <CardContent className="p-4 text-sm text-risk">
              {dashboardError}
            </CardContent>
          </Card>
        )}

        {!dashboardData ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Loading your footprint and risk data...
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card className="border-l-4 border-l-forest">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-forest" />
                      <span>Carbon Footprint</span>
                      <Badge variant="outline" className="ml-auto">
                        Saved Data
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <SummaryCard
                      title="Total CO2 Emissions"
                      value={dashboardData.carbonData.total.toString()}
                      unit="tons"
                      change={dashboardData.carbonData.change}
                      sparklineData={dashboardData.carbonData.sparkline}
                      icon={<TrendingDown className="h-4 w-4 text-safe" />}
                      trend={dashboardData.carbonData.change <= 0 ? "down" : "up"}
                      variant={dashboardData.carbonData.change <= 0 ? "success" : "warning"}
                    />

                    <div className="space-y-3">
                      <h3 className="font-semibold">Breakdown by Category</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {dashboardData.categoryBreakdown.map((category) => (
                          <SummaryCard
                            key={category.category}
                            title={category.category}
                            value={category.value.toString()}
                            unit="tons"
                            change={category.change}
                            icon={categoryIcons[category.category]}
                            trend={category.change <= 0 ? "down" : "up"}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <TimelineChart
                  data={dashboardData.timelineData}
                  title="Emissions & Impact Trends"
                  showProjections
                />
              </div>

              <div className="space-y-6">
                <Card className="border-l-4 border-l-risk">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-risk" />
                      <span>Humanitarian Risk Impact</span>
                      <Badge variant="outline" className="ml-auto">
                        Modelled
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-earth rounded-lg text-white">
                        <div>
                          <div className="text-2xl font-bold">
                            {dashboardData.riskData
                              .reduce((sum, risk) => sum + risk.peopleAffected, 0)
                              .toLocaleString()}
                          </div>
                          <div className="text-sm opacity-90">People at risk across top modelled signals</div>
                        </div>
                        <AlertTriangle className="h-8 w-8" />
                      </div>

                      <div className="space-y-3">
                        {dashboardData.riskData.map((risk) => (
                          <RiskCard key={risk.id} {...risk} />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-primary" />
                  <span>Personalized Recommendations</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Actions you can take to reduce your impact and help vulnerable communities
                </p>
              </CardHeader>
              <CardContent>
                <RecommendationsList recommendations={dashboardData.recommendations} />
              </CardContent>
            </Card>
          </>
        )}

        <ScenarioLab />
      </div>
    </div>
  );
}
