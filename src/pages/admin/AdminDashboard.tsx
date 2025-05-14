
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminService } from '@/services/adminService';

const AdminDashboard: React.FC = () => {
  const { getDashboardStats } = useAdminService();
  const stats = getDashboardStats();

  // Calculate approval rate
  const approvalRate = stats.totalSubmissions > 0 
    ? Math.round((stats.approvedSubmissions / stats.totalSubmissions) * 100) 
    : 0;
    
  const rejectionRate = stats.totalSubmissions > 0 
    ? Math.round((stats.rejectedSubmissions / stats.totalSubmissions) * 100) 
    : 0;

  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">All time submissions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedSubmissions}</div>
            <p className="text-xs text-muted-foreground">Ready for use</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">In mailing list</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Submission Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Daily</p>
                  <p className="text-sm text-muted-foreground">{stats.dailySubmissions}</p>
                </div>
                <Progress value={stats.dailySubmissions / stats.totalSubmissions * 100 || 0} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Weekly</p>
                  <p className="text-sm text-muted-foreground">{stats.weeklySubmissions}</p>
                </div>
                <Progress value={stats.weeklySubmissions / stats.totalSubmissions * 100 || 0} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Monthly</p>
                  <p className="text-sm text-muted-foreground">{stats.monthlySubmissions}</p>
                </div>
                <Progress value={stats.monthlySubmissions / stats.totalSubmissions * 100 || 0} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Submission Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Approval Rate</p>
                  <p className="text-sm text-muted-foreground">{approvalRate}%</p>
                </div>
                <Progress value={approvalRate} className="bg-secondary h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Rejection Rate</p>
                  <p className="text-sm text-muted-foreground">{rejectionRate}%</p>
                </div>
                <Progress value={rejectionRate} className="bg-secondary h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Pending Rate</p>
                  <p className="text-sm text-muted-foreground">
                    {100 - approvalRate - rejectionRate}%
                  </p>
                </div>
                <Progress 
                  value={100 - approvalRate - rejectionRate} 
                  className="bg-secondary h-2" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
