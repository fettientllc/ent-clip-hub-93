
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Settings, Users, Home, FileSpreadsheet, LogOut } from "lucide-react";
import DropboxHealthStatus from './DropboxHealthStatus';

interface AdminHeaderProps {
  title: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center mb-6 pb-4 border-b">
      <h1 className="text-2xl font-bold">{title}</h1>
      
      <div className="flex items-center space-x-4">
        {/* Dropbox Health Status Component */}
        <DropboxHealthStatus />
        
        {/* Navigation Buttons */}
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1"
          >
            <Home className="h-4 w-4" />
            <span className="hidden md:inline">Dashboard</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/admin/submissions')}
            className="flex items-center gap-1"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden md:inline">Submissions</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-1"
          >
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Users</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/admin/settings')}
            className="flex items-center gap-1"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">Settings</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1 text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
