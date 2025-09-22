import { motion } from "framer-motion";
import { Settings as SettingsIcon, Save, Palette, Monitor } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "next-themes";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  return (
    <motion.div
      className="space-y-6 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Configure application preferences and business settings
          </p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            Customize your carwash management experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Theme Settings</h3>
            </div>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Appearance</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <ThemeToggle />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">System Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Follow your device's theme preference
                  </p>
                </div>
                <Switch
                  checked={theme === "system"}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setTheme("system");
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="pt-6 border-t">
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <Monitor className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-base font-medium">More settings coming soon</p>
                <p className="text-sm">Business configuration, notifications, and system preferences</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}