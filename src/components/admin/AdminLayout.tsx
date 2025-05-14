
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Users, Settings, Video, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: BarChart3 },
    { name: "Submissions", path: "/admin/submissions", icon: Video },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border">
        <div className="h-16 flex items-center px-6">
          <h1 className="text-xl font-bold">Admin Portal</h1>
        </div>
        
        <Separator />
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                isActive(item.path)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
          ))}

          <div className="pt-4">
            <Separator className="my-4" />
            <Button variant="ghost" className="w-full justify-start text-muted-foreground" asChild>
              <Link to="/admin">
                <LogOut className="mr-3 h-4 w-4" />
                Sign Out
              </Link>
            </Button>
          </div>
        </nav>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-border flex items-center px-6 sticky top-0 bg-background z-10">
          <h1 className="text-xl font-semibold">{title}</h1>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
