import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { SummaryCard } from "@/components/SummaryCard";
import { RiskCard } from "@/components/RiskCard";
import { TimelineChart } from "@/components/TimelineChart";
import { RecommendationsList } from "@/components/RecommendationsList";
import { ScenarioLab } from "@/components/ScenarioLab";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import {
  Activity,
  Car,
  Home,
  Utensils,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Globe,
  Users,
  AlertTriangle,
  Settings
} from "lucide-react";

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  
  // Mock data for carbon footprint
  const carbonData = {
    total: 12.4,
    change: -8.5,
    sparkline: [
      { name: "Jan", value: 15.2 },
      { name: "Feb", value: 14.8 },
      { name: "Mar", value: 13.9 },
      { name: "Apr", value: 13.1 },
      { name: "May", value: 12.4 }
    ]
  };

  const categoryBreakdown = [
    { 
      category: "Transport", 
      value: 5.2, 
      change: -12, 
      icon: <Car className="h-5 w-5" />,
      color: "text-earth"
    },
    { 
      category: "Energy", 
      value: 3.8, 
      change: -5, 
      icon: <Home className="h-5 w-5" />,
      color: "text-warning"
    },
    { 
      category: "Food", 
      value: 2.1, 
      change: -3, 
      icon: <Utensils className="h-5 w-5" />,
      color: "text-forest"
    },
    { 
      category: "Shopping", 
      value: 1.3, 
      change: -15, 
      icon: <ShoppingBag className="h-5 w-5" />,
      color: "text-ocean"
    }
  ];

  // Mock data for humanitarian risks
  const riskData = [
    {
      id: "1",
      title: "Coastal Flooding Risk",
      riskScore: 78,
      peopleAffected: 2400000,
      description: "Rising sea levels threaten coastal communities in Southeast Asia",
      hazardType: "flood" as const,
      severity: "high" as const,
      region: "Southeast Asia"
    },
    {
      id: "2", 
      title: "Drought-Induced Displacement",
      riskScore: 65,
      peopleAffected: 890000,
      description: "Prolonged drought forcing migration in East Africa",
      hazardType: "displacement" as const,
      severity: "medium" as const,
      region: "East Africa"
    },
    {
      id: "3",
      title: "Food Security Crisis",
      riskScore: 82,
      peopleAffected: 1200000,
      description: "Climate change disrupting agricultural production",
      hazardType: "food_insecurity" as const,
      severity: "high" as const,
      region: "Central America"
    }
  ];

  // Mock timeline data
  const timelineData = [
    {
      year: "2020",
      emissions: 15.2,
      floodRisk: 45,
      displacement: 120,
      foodInsecurity: 180
    },
    {
      year: "2021",
      emissions: 14.8,
      floodRisk: 52,
      displacement: 135,
      foodInsecurity: 195
    },
    {
      year: "2022",
      emissions: 13.9,
      floodRisk: 58,
      displacement: 148,
      foodInsecurity: 210
    },
    {
      year: "2023",
      emissions: 13.1,
      floodRisk: 65,
      displacement: 162,
      foodInsecurity: 225
    },
    {
      year: "2024",
      emissions: 12.4,
      floodRisk: 72,
      displacement: 175,
      foodInsecurity: 240,
      projection: false
    },
    {
      year: "2025",
      emissions: 11.8,
      floodRisk: 78,
      displacement: 190,
      foodInsecurity: 260,
      projection: true
    },
    {
      year: "2026",
      emissions: 11.2,
      floodRisk: 85,
      displacement: 205,
      foodInsecurity: 280,
      projection: true
    }
  ];

  // Mock recommendations
  const recommendations = [
    {
      id: "1",
      title: "Switch to Electric Vehicle",
      description: "Replace your gasoline car with an electric vehicle to reduce transport emissions",
      category: "transport" as const,
      co2Savings: 2.8,
      difficulty: "medium" as const,
      impact: "high" as const
    },
    {
      id: "2",
      title: "Install Solar Panels",
      description: "Generate renewable energy for your home to reduce grid dependence",
      category: "energy" as const,
      co2Savings: 1.9,
      difficulty: "hard" as const,
      impact: "high" as const
    },
    {
      id: "3",
      title: "Reduce Meat Consumption",
      description: "Adopt a more plant-based diet 3 days per week",
      category: "food" as const,
      co2Savings: 0.8,
      difficulty: "easy" as const,
      impact: "medium" as const
    },
    {
      id: "4",
      title: "Buy Second-Hand First",
      description: "Choose pre-owned items before buying new to reduce manufacturing emissions",
      category: "shopping" as const,
      co2Savings: 0.6,
      difficulty: "easy" as const,
      impact: "medium" as const
    }
  ];

  const handleRecommendationImplement = (id: string) => {
    console.log("Implementing recommendation:", id);
  };

  const handleRecommendationLearnMore = (id: string) => {
    console.log("Learning more about recommendation:", id);
  };

  // Show loading state
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

  // Redirect to login if not authenticated
  if (!user) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={!!user} onLogout={signOut} />
      
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Climate Impact Dashboard</h1>
            <p className="text-muted-foreground">
              Track your carbon footprint and its humanitarian impact
            </p>
          </div>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Carbon Footprint Panel */}
          <div className="space-y-6">
            <Card className="border-l-4 border-l-forest">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-forest" />
                  <span>Carbon Footprint</span>
                  <Badge variant="outline" className="ml-auto">
                    This Month
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Total Emissions */}
                <SummaryCard
                  title="Total CO₂ Emissions"
                  value={carbonData.total.toString()}
                  unit="tons"
                  change={carbonData.change}
                  sparklineData={carbonData.sparkline}
                  icon={<TrendingDown className="h-4 w-4 text-safe" />}
                  trend="down"
                  variant="success"
                />

                {/* Category Breakdown */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Breakdown by Category</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {categoryBreakdown.map((category) => (
                      <SummaryCard
                        key={category.category}
                        title={category.category}
                        value={category.value.toString()}
                        unit="tons"
                        change={category.change}
                        icon={category.icon}
                        trend="down"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Chart */}
            <TimelineChart
              data={timelineData}
              title="Emissions & Impact Trends"
              showProjections={true}
            />
          </div>

          {/* Humanitarian Risk Panel */}
          <div className="space-y-6">
            <Card className="border-l-4 border-l-risk">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-risk" />
                  <span>Humanitarian Risk Impact</span>
                  <Badge variant="outline" className="ml-auto">
                    Current
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-earth rounded-lg text-white">
                    <div>
                      <div className="text-2xl font-bold">4.5M</div>
                      <div className="text-sm opacity-90">People at risk from your emissions category</div>
                    </div>
                    <AlertTriangle className="h-8 w-8" />
                  </div>

                  <div className="space-y-3">
                    {riskData.map((risk) => (
                      <RiskCard key={risk.id} {...risk} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="space-y-6">
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
              <RecommendationsList
                recommendations={recommendations}
                onImplement={handleRecommendationImplement}
                onLearnMore={handleRecommendationLearnMore}
              />
            </CardContent>
          </Card>
        </div>

        <ScenarioLab />
      </div>
    </div>
  );
}
