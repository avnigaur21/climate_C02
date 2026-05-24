import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { SummaryCard } from "@/components/SummaryCard";
import { RiskCard } from "@/components/RiskCard";
import { TimelineChart } from "@/components/TimelineChart";
import { RecommendationsList } from "@/components/RecommendationsList";
import { InteractiveMap } from "@/components/InteractiveMap";
import { ScenarioLab } from "@/components/ScenarioLab";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavLink } from "react-router-dom";
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
  Play,
  Info,
  ExternalLink
} from "lucide-react";

export default function Demo() {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Demo data - same as Dashboard but with demo indicators
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
    }
  ];

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
    }
  ];

  const regions = [
    {
      id: "1",
      name: "Bangladesh Delta",
      lat: 23.6850,
      lng: 90.3563,
      riskScore: 85,
      peopleAffected: 4200000,
      primaryRisk: "Coastal flooding and sea level rise"
    },
    {
      id: "2",
      name: "Sahel Region",
      lat: 14.0000,
      lng: 2.0000,
      riskScore: 78,
      peopleAffected: 2100000,
      primaryRisk: "Drought and desertification"
    },
    {
      id: "3",
      name: "Pacific Small Islands",
      lat: -8.5000,
      lng: 179.0000,
      riskScore: 92,
      peopleAffected: 680000,
      primaryRisk: "Sea level rise and coral bleaching"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={false} />
      
      <div className="container mx-auto p-6 space-y-8">
        {/* Demo Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold">Demo Experience</h1>
              <Badge className="bg-gradient-hero text-white">
                <Play className="h-3 w-3 mr-1" />
                Live Demo
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Explore the Carbon Risk Tracker with sample data
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" asChild>
              <NavLink to="/">
                Back to Home
              </NavLink>
            </Button>
            <Button asChild>
              <NavLink to="/signup">
                Sign Up to Get Started
                <ExternalLink className="h-4 w-4 ml-2" />
              </NavLink>
            </Button>
          </div>
        </div>

        {/* Demo Notice */}
        <Card className="border-warning bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Info className="h-5 w-5 text-warning" />
              <div className="text-sm">
                <strong>Demo Notice:</strong> This is a demonstration with sample data. 
                Humanitarian risk projections are simplified estimates for illustration purposes.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="scenario">Scenario Lab</TabsTrigger>
            <TabsTrigger value="regions">Risk Regions</TabsTrigger>
            <TabsTrigger value="import">Data Import</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Carbon Footprint Panel */}
              <div className="space-y-6">
                <Card className="border-l-4 border-l-forest">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-forest" />
                      <span>Carbon Footprint</span>
                      <Badge variant="outline" className="ml-auto">
                        Sample Data
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
                  title="Emissions & Impact Trends (Demo)"
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
                        Simulated
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

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-primary" />
                  <span>Sample Recommendations</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Example actions to reduce your carbon footprint
                </p>
              </CardHeader>
              <CardContent>
                <RecommendationsList
                  recommendations={recommendations}
                  onImplement={(id) => console.log("Demo: Implementing", id)}
                  onLearnMore={(id) => console.log("Demo: Learning more about", id)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scenario" className="space-y-8">
            <ScenarioLab />
          </TabsContent>

          {/* Regions Tab */}
          <TabsContent value="regions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-ocean" />
                  <span>Global Risk Regions (Demo)</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Interactive map showing vulnerable regions
                </p>
              </CardHeader>
              <CardContent>
                <InteractiveMap
                  regions={regions}
                  onRegionClick={(region) => console.log("Demo: Selected region", region.name)}
                  className="h-96"
                />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              {regions.map((region) => (
                <Card key={region.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{region.name}</h3>
                      <Badge variant={region.riskScore >= 80 ? "destructive" : "default"}>
                        {region.riskScore}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {region.primaryRisk}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Users className="h-3 w-3 mr-1" />
                      {region.peopleAffected.toLocaleString()} affected
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Import (Demo Mode)</CardTitle>
                <p className="text-sm text-muted-foreground">
                  In the full version, you can upload CSV files with your activity data
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Supported Data Types</h3>
                    <div className="space-y-2">
                      {[
                        { icon: <Car className="h-4 w-4" />, name: "Transport", desc: "Car trips, flights, public transport" },
                        { icon: <Home className="h-4 w-4" />, name: "Energy", desc: "Electricity, gas, heating" },
                        { icon: <Utensils className="h-4 w-4" />, name: "Food", desc: "Meals, groceries, dietary choices" },
                        { icon: <ShoppingBag className="h-4 w-4" />, name: "Shopping", desc: "Retail purchases, electronics" }
                      ].map((type) => (
                        <div key={type.name} className="flex items-center space-x-3 p-3 border rounded">
                          <div className="text-primary">{type.icon}</div>
                          <div>
                            <div className="font-medium text-sm">{type.name}</div>
                            <div className="text-xs text-muted-foreground">{type.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">How It Works</h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-start space-x-2">
                        <div className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                        <div>Upload your activity data in CSV format</div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                        <div>Our system calculates CO₂ emissions automatically</div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                        <div>View humanitarian risk projections based on your data</div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                        <div>Receive personalized recommendations to reduce impact</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center p-6 border-2 border-dashed border-muted rounded-lg">
                  <div className="text-muted-foreground mb-4">
                    Sign up to start importing your own data
                  </div>
                  <Button asChild>
                    <NavLink to="/signup">
                      Create Free Account
                    </NavLink>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="bg-gradient-hero text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Track Your Real Impact?</h2>
            <p className="text-lg opacity-90 mb-6">
              Sign up today to start measuring your carbon footprint and making a difference for vulnerable communities.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
                <NavLink to="/signup">
                  Sign Up Free
                </NavLink>
              </Button>
              <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-white/90" asChild>
                <NavLink to="/login">
                  I Have an Account
                </NavLink>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
