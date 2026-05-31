import { useEffect, useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  fetchUserProfile,
  updateUserProfile,
  type UserProfileData,
  type UserProfileUpdate
} from "@/lib/supabaseData";
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Globe,
  Award,
  TrendingDown,
  Settings,
  Save,
  Edit
} from "lucide-react";

const achievements = [
  { name: "First Import", description: "Saved your first carbon footprint CSV import", earned: "When your first import completes" },
  { name: "Risk Mapper", description: "Reviewed regional climate risk signals from your footprint data", earned: "After dashboard analysis" },
  { name: "Reduction Planner", description: "Explored mitigation pathways in Scenario Lab", earned: "After scenario planning" }
];

const isDemoUser = (user: unknown) => Boolean((user as { is_demo_user?: boolean })?.is_demo_user);
const loginUrl = () => new URL("login", window.location.href).toString();

export default function Profile() {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [editData, setEditData] = useState<UserProfileUpdate>({
    fullName: "",
    location: "",
    country: ""
  });

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setProfileError(null);

    fetchUserProfile(user, { demo: isDemoUser(user) })
      .then((profile) => {
        if (cancelled) return;
        setUserData(profile);
        setEditData({
          fullName: profile.fullName,
          location: profile.location,
          country: profile.country
        });
      })
      .catch((error) => {
        if (!cancelled) {
          setProfileError(error instanceof Error ? error.message : "Failed to load profile");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSave = async () => {
    if (!user || !userData) return;

    setIsSaving(true);
    try {
      const saved = await updateUserProfile(user, editData, { demo: isDemoUser(user) });
      setUserData({
        ...userData,
        fullName: saved.full_name ?? editData.fullName,
        location: saved.location ?? editData.location,
        country: saved.country ?? editData.country
      });
      setIsEditing(false);
      toast({
        title: "Profile saved",
        description: userData.source === "supabase" ? "Your profile was updated in Supabase." : "Demo profile updated for this session."
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Could not update profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (userData) {
      setEditData({
        fullName: userData.fullName,
        location: userData.location,
        country: userData.country
      });
    }
    setIsEditing(false);
  };

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

  const initials = (userData?.fullName ?? "Climate User")
    .split(" ")
    .filter(Boolean)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={!!user} onLogout={signOut} />

      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">
              Manage your Supabase profile and review your saved climate impact
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {userData && (
              <Badge variant={userData.source === "supabase" ? "default" : "outline"}>
                {userData.source === "supabase" ? "Live Supabase profile" : "Demo profile"}
              </Badge>
            )}
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)} disabled={!userData}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {profileError && (
          <Card className="border-risk bg-risk/5">
            <CardContent className="p-4 text-sm text-risk">{profileError}</CardContent>
          </Card>
        )}

        {!userData ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Loading your Supabase profile...
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={`${import.meta.env.BASE_URL}placeholder.svg`} alt="Profile" />
                    <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold mb-2">{userData.fullName}</h2>
                  <p className="text-muted-foreground mb-4">{userData.email}</p>
                  <Badge variant="secondary" className="mb-4">
                    <Calendar className="h-3 w-3 mr-1" />
                    Member since {userData.joinDate}
                  </Badge>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{userData.location}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>{userData.country}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingDown className="h-5 w-5 text-green-500" />
                    <span>Your Impact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {userData.totalFootprint.toFixed(1)} tCO2
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-green-600">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-sm">
                        {Math.abs(userData.footprintChange).toFixed(1)}% change from saved data
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Personal Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={editData.fullName}
                          onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                        />
                      ) : (
                        <div className="p-2 text-sm bg-muted rounded-md">{userData.fullName}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="p-2 text-sm bg-muted rounded-md flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {userData.email}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      {isEditing ? (
                        <Input
                          id="location"
                          value={editData.location}
                          onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        />
                      ) : (
                        <div className="p-2 text-sm bg-muted rounded-md">{userData.location}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      {isEditing ? (
                        <Input
                          id="country"
                          value={editData.country}
                          onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                        />
                      ) : (
                        <div className="p-2 text-sm bg-muted rounded-md">{userData.country}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {achievements.map((achievement) => (
                      <div key={achievement.name} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Award className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{achievement.name}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">Earned: {achievement.earned}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Account Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Email Identity</h4>
                      <p className="text-sm text-muted-foreground">Managed by Supabase Auth for this account</p>
                    </div>
                    <Badge variant="outline">Auth</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Data Isolation</h4>
                      <p className="text-sm text-muted-foreground">RLS policies restrict saved rows to your user ID</p>
                    </div>
                    <Badge variant="outline">RLS</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
