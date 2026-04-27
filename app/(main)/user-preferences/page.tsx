"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DisplaySettings } from "./components/display-settings";
import { RegionalSettings } from "./components/regional-settings";
import { NotificationSettings } from "./components/notification-settings";
import { AccessibilitySettings } from "./components/accessibility-settings";
import { Monitor, Globe, Bell, Eye } from "lucide-react";
import { useSimpleUser } from "@/lib/context/simple-user-context";

export default function UserPreferencesPage() {
  const { user } = useSimpleUser();
  const [activeTab, setActiveTab] = useState("display");

  return (
    <div className="mx-auto px-6 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Preferences</h1>
        <p className="text-muted-foreground mt-2">
          Personalize your experience with CARMEN. Changes are saved automatically.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="display" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline">Display</span>
          </TabsTrigger>
          <TabsTrigger value="regional" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Regional</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Accessibility</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="display" className="space-y-4">
          <DisplaySettings userId={user?.id || ""} />
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <RegionalSettings userId={user?.id || ""} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings userId={user?.id || ""} />
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-4">
          <AccessibilitySettings userId={user?.id || ""} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
