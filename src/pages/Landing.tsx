import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NavLink } from "react-router-dom";
import { 
  Leaf, 
  Globe, 
  TrendingUp, 
  Users, 
  ArrowRight,
  BarChart3,
  Shield,
  Activity
} from "lucide-react";

export default function Landing() {
  const heroImage = new URL("../../carbonfootprint.png", import.meta.url).href;

  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-forest" />,
      title: "Track Your Carbon Footprint",
      description: "Monitor emissions across transport, energy, food, and shopping with detailed analytics."
    },
    {
      icon: <Globe className="h-8 w-8 text-ocean" />,
      title: "See Global Impact",
      description: "Visualize how your emissions contribute to humanitarian risks worldwide."
    },
    {
      icon: <Users className="h-8 w-8 text-warning" />,
      title: "Understand Human Cost",
      description: "Connect your lifestyle choices to real impacts on vulnerable communities."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Get Actionable Insights",
      description: "Receive personalized recommendations to reduce your environmental impact."
    }
  ];

  const stats = [
    { value: "2.3B", label: "People at climate risk", icon: <Users className="h-5 w-5" /> },
    { value: "15%", label: "Annual emission growth", icon: <TrendingUp className="h-5 w-5" /> },
    { value: "89M", label: "Climate displaced", icon: <Globe className="h-5 w-5" /> },
    { value: "1.5C", label: "Temperature increase", icon: <Activity className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 bg-card border-b">
        <div className="flex items-center space-x-2">
          <Leaf className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">Carbon Risk Tracker</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <NavLink to="/login">Login</NavLink>
          </Button>
          <Button asChild>
            <NavLink to="/signup">Sign Up</NavLink>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-primary"
        style={{
          backgroundImage: `linear-gradient(135deg, hsl(152 64% 18% / 0.96), hsl(168 71% 28% / 0.88)), url(${heroImage})`,
          backgroundPosition: "center, right 8% center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover, min(42vw, 420px)"
        }}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative container mx-auto px-6 py-24 text-center text-white">
          <div className="mx-auto max-w-4xl space-y-8">
            <h1 className="text-5xl font-bold leading-tight sm:text-6xl font-merriweather">
              We connect <span className="text-black">emissions</span> to their{" "}
              <span className="text-black">human impact</span>
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto font-merriweather">
              Track your carbon footprint and see how it affects vulnerable communities worldwide. 
              Make informed decisions with real humanitarian risk data.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 shadow-glow"
                asChild
              >
                <NavLink to="/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </NavLink>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white text-primary hover:bg-white/90 shadow-glow"
                asChild
              >
                <NavLink to="/demo">View Demo</NavLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center shadow-climate">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-2 text-primary">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-foreground font-merriweather">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-merriweather">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-merriweather">
              Understanding Climate Impact Through Data
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-merriweather">
              Our platform bridges the gap between personal carbon emissions and their 
              real-world humanitarian consequences.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center group hover:shadow-climate transition-all">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 font-merriweather">{feature.title}</h3>
                  <p className="text-muted-foreground font-merriweather">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-climate text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6 font-merriweather">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl opacity-90 mb-8 font-merriweather">
              Join thousands of users taking action on climate change. Start tracking your 
              impact today and discover how small changes can help protect vulnerable communities.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90"
                asChild
              >
                <NavLink to="/signup">Sign Up Free</NavLink>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white text-primary hover:bg-white/90"
                asChild
              >
                <NavLink to="/demo">Try Demo</NavLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="font-semibold">Carbon Risk Tracker</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>(c) 2026 Climate Impact Analytics</span>
              <Shield className="h-4 w-4" />
              <span>Humanitarian risk data is simplified for demo purposes</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
