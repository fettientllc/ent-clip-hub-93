import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminSettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    approvedFolder: '/approved-videos',
    enableNotifications: true,
    autoAdd: true,
    emailTemplate: 'Thank you for your submission! We will review your video shortly.',
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dlqi9c0qt',
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default'
  });

  const handleChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully"
    });
  };

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6">
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Using Cloudinary for video uploads with upload preset: <strong>{settings.uploadPreset}</strong>. 
            Make sure this preset exists in your Cloudinary dashboard with proper upload settings.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Cloudinary Integration</CardTitle>
            <CardDescription>
              Configure your Cloudinary video storage settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cloud-name">Cloud Name</Label>
              <Input
                id="cloud-name"
                value={settings.cloudName}
                onChange={(e) => handleChange('cloudName', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Your Cloudinary cloud name
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-preset">Upload Preset</Label>
              <Input
                id="upload-preset"
                value={settings.uploadPreset}
                onChange={(e) => handleChange('uploadPreset', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Upload preset (default: ml_default) - Create custom presets in your Cloudinary dashboard
              </p>
            </div>
            
            <Button onClick={handleSave}>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>File Storage Integration</CardTitle>
            <CardDescription>
              Configure how files are stored and organized after approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approved-folder">Approved Videos Folder</Label>
              <Input
                id="approved-folder"
                value={settings.approvedFolder}
                onChange={(e) => handleChange('approvedFolder', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Path where approved videos will be stored in Dropbox
              </p>
            </div>
            
            <Button onClick={handleSave}>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure notifications for new submissions and user actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when a new submission is received
                </p>
              </div>
              <Switch
                id="notifications"
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => handleChange('enableNotifications', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-add">Auto-add to Mailing List</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically add users to mailing list on submission
                </p>
              </div>
              <Switch
                id="auto-add"
                checked={settings.autoAdd}
                onCheckedChange={(checked) => handleChange('autoAdd', checked)}
              />
            </div>
            
            <Button onClick={handleSave}>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>
              Customize email templates sent to users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-template">Confirmation Email</Label>
              <Input
                id="email-template"
                value={settings.emailTemplate}
                onChange={(e) => handleChange('emailTemplate', e.target.value)}
              />
            </div>
            
            <Button onClick={handleSave}>Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
