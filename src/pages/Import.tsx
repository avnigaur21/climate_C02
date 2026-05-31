import { useCallback, useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { importFootprints } from "@/lib/supabaseData";
import {
  AlertCircle,
  Car,
  CheckCircle,
  Download,
  FileText,
  Home,
  Info,
  ShoppingBag,
  Upload,
  Utensils
} from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: "processing" | "completed" | "error";
  records?: number;
  co2Impact?: number;
  error?: string;
  source?: "supabase" | "demo";
}

const templates = {
  transport: "date,category,amount,unit,type,description\n2026-01-15,transport,25.5,km,car,Commute to campus\n2026-01-16,travel,1200,km,flight,Short-haul flight",
  energy: "date,category,amount,unit,type,description\n2026-01-01,energy,450,kWh,electricity,Monthly electricity usage\n2026-01-01,energy,120,MJ,gas,Heating usage",
  food: "date,category,amount,unit,type,description\n2026-01-15,food,1,kg,beef,Beef meal\n2026-01-16,food,2,kg,vegetables,Vegetable groceries",
  shopping: "date,category,amount,unit,type,description\n2026-01-15,shopping,800,USD,electronics,Laptop purchase\n2026-01-16,shopping,60,USD,clothing,Jeans purchase"
};

const isDemoUser = (user: unknown) => Boolean((user as { is_demo_user?: boolean })?.is_demo_user);
const loginUrl = () => new URL("login", window.location.href).toString();

export default function Import() {
  const { user, loading, signOut } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const processFiles = async (files: File[]) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please sign in before importing footprint data.",
        variant: "destructive"
      });
      return;
    }

    for (const file of files) {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a CSV file`,
          variant: "destructive"
        });
        continue;
      }

      const id = crypto.randomUUID();
      setUploadedFiles((prev) => [
        ...prev,
        {
          id,
          name: file.name,
          size: file.size,
          status: "processing"
        }
      ]);

      try {
        const csvText = await file.text();
        const result = await importFootprints(user.id, file.name, csvText, { demo: isDemoUser(user) });

        setUploadedFiles((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: result.errors.length ? "error" : "completed",
                  records: result.imported,
                  co2Impact: result.totalCo2Kg / 1000,
                  error: result.errors[0],
                  source: result.source
                }
              : item
          )
        );

        toast({
          title: result.errors.length ? "Import completed with issues" : "Import completed",
          description: result.errors.length
            ? result.errors[0]
            : `${result.imported} rows saved to ${result.source === "supabase" ? "Supabase" : "demo storage"}.`
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to import CSV";
        setUploadedFiles((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: "error", error: message } : item))
        );
        toast({
          title: "Import failed",
          description: message,
          variant: "destructive"
        });
      }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    processFiles(Array.from(e.dataTransfer.files));
  }, [user]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(Array.from(e.target.files || []));
    e.target.value = "";
  };

  const downloadTemplate = (category: keyof typeof templates) => {
    const blob = new Blob([templates[category]], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${category}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalCO2Impact = uploadedFiles
    .filter((file) => file.status === "completed")
    .reduce((sum, file) => sum + (file.co2Impact || 0), 0);

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
            <h1 className="text-3xl font-bold">Import Data</h1>
            <p className="text-muted-foreground">
              Upload activity CSV files and save calculated emissions to your account
            </p>
          </div>
          <Badge variant="outline" className="text-info border-info">
            <Info className="h-3 w-3 mr-1" />
            CSV Format
          </Badge>
        </div>

        {uploadedFiles.length > 0 && (
          <Card className="border-l-4 border-l-forest">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-forest">
                    {totalCO2Impact.toFixed(2)} tons CO2
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Saved from {uploadedFiles.filter((file) => file.status === "completed").length} completed imports
                  </div>
                </div>
                <CheckCircle className="h-8 w-8 text-safe" />
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
            <TabsTrigger value="templates">Download Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload CSV Files</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Required columns: date, category, amount, unit. Optional: type, description.
                </p>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Drop your CSV files here</p>
                    <p className="text-sm text-muted-foreground">
                      Rows are calculated and persisted to Supabase under your user account.
                    </p>
                  </div>
                  <div className="mt-6">
                    <input
                      type="file"
                      multiple
                      accept=".csv"
                      onChange={handleFileInput}
                      className="hidden"
                      id="file-input"
                    />
                    <Button asChild>
                      <label htmlFor="file-input" className="cursor-pointer">
                        Browse Files
                      </label>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {uploadedFiles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Files ({uploadedFiles.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{file.name}</p>
                          {file.source && <Badge variant="outline">{file.source}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                          {file.records !== undefined && ` | ${file.records} rows`}
                          {file.co2Impact !== undefined && ` | ${file.co2Impact.toFixed(2)} tons CO2`}
                        </p>
                        {file.error && <p className="text-xs text-risk mt-1">{file.error}</p>}
                      </div>
                      {file.status === "processing" && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      )}
                      {file.status === "completed" && <CheckCircle className="h-4 w-4 text-safe" />}
                      {file.status === "error" && <AlertCircle className="h-4 w-4 text-risk" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>CSV Templates</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { category: "transport" as const, title: "Transport Data", description: "Car trips, flights, public transport", icon: <Car className="h-5 w-5" /> },
                    { category: "energy" as const, title: "Energy Usage", description: "Electricity, gas, heating consumption", icon: <Home className="h-5 w-5" /> },
                    { category: "food" as const, title: "Food Consumption", description: "Meals, groceries, dietary choices", icon: <Utensils className="h-5 w-5" /> },
                    { category: "shopping" as const, title: "Shopping Purchases", description: "Retail items, electronics, clothing", icon: <ShoppingBag className="h-5 w-5" /> }
                  ].map((template) => (
                    <Card key={template.category} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="text-primary">{template.icon}</div>
                          <div>
                            <h3 className="font-semibold">{template.title}</h3>
                            <p className="text-xs text-muted-foreground">{template.description}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => downloadTemplate(template.category)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
