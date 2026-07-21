'use client';

import React, { useState } from 'react';
import { Palette, CheckCircle2, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { useSettingsStore } from '../../../stores/use-settings-store';

export function BrandingConfig() {
  const { branding, setBranding } = useSettingsStore();
  const [orgName, setOrgName] = useState(branding.organizationName);
  const [primaryColor, setPrimaryColor] = useState(branding.primaryColor);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setBranding({ organizationName: orgName, primaryColor });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="max-w-2xl mx-auto border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="h-5 w-5 text-teal-600" />
          <span>Organization Branding & Theme Personalization</span>
        </CardTitle>
        <CardDescription>White-label AyuNet UI colors, logos, and print template headers.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-xs">
        <Input label="Healthcare Organization Name *" value={orgName} onChange={(e) => setOrgName(e.target.value)} />

        <div className="space-y-2">
          <label className="font-semibold text-slate-700 dark:text-slate-300">Primary Brand Theme Color *</label>
          <div className="flex items-center space-x-4">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-10 w-16 cursor-pointer rounded border border-slate-300 p-1 dark:border-slate-800"
            />
            <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-36 font-mono" />
          </div>
        </div>

        {/* Live Theme Preview Box */}
        <div className="space-y-2">
          <label className="font-semibold text-slate-700 dark:text-slate-300">Live Header Preview</label>
          <div
            className="rounded-xl p-4 text-white shadow-md font-bold flex items-center justify-between"
            style={{ backgroundColor: primaryColor }}
          >
            <span>{orgName}</span>
            <span className="text-xs opacity-80 font-mono">Enterprise Portal</span>
          </div>
        </div>

        {saved && (
          <div className="flex items-center space-x-2 text-emerald-600 font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Branding Tokens Applied Successfully!</span>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
            <Save className="mr-1.5 h-4 w-4" /> Save Theme Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
