
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminService, DashboardStats } from '@/services/adminService';
import { Check, X, Clock, Video, Upload, UserCheck, ArrowUpRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from 'date-fns';
import WorkflowExplainer from '@/components/admin/WorkflowExplainer';

const AdminDashboard: React.FC = () => {
  const { getDashboardStats } = useAdminService();
  const stats = getDashboardStats();

  // Get current date for the dashboard title
  const today = new Date();
  const formattedDate = format(today, 'MMMM d, yyyy');

  return (
    <AdminLayout title="Dashboard">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">{formattedDate}</p>
      </div>

      {/* Add the workflow explainer component at the top of the dashboard */}
      <WorkflowExplainer />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Submissions
                </CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.dailySubmissions} new today
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Review
                </CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
                <p className="text-xs text-muted-foreground">
                  Waiting for approval
                </p>
                {stats.pendingSubmissions > 0 && (
                  <a href="/admin/submissions" className="text-xs text-blue-500 flex items-center mt-1 hover:underline">
                    Review submissions
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                  </a>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Approved
                </CardTitle>
                <Check className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approvedSubmissions}</div>
                <p className="text-xs text-muted-foreground">
                  Uploaded to Dropbox
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Rejected
                </CardTitle>
                <X className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rejectedSubmissions}</div>
                <p className="text-xs text-muted-foreground">
                  Not meeting criteria
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Submission Summary</CardTitle>
                <CardDescription>
                  Overview of recent submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Daily Submissions
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {stats.dailySubmissions} submissions in the last 24 hours
                      </p>
                    </div>
                    <div className="ml-auto font-bold">{stats.dailySubmissions}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Weekly Submissions
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {stats.weeklySubmissions} submissions in the last 7 days
                      </p>
                    </div>
                    <div className="ml-auto font-bold">{stats.weeklySubmissions}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Monthly Submissions
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {stats.monthlySubmissions} submissions in the last 30 days
                      </p>
                    </div>
                    <div className="ml-auto font-bold">{stats.monthlySubmissions}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Storage Status</CardTitle>
                <CardDescription>
                  Information about video storage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Upload className="h-4 w-4 text-muted-foreground mr-2" />
                    <div className="ml-2 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Temporary Storage
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {stats.pendingSubmissions} videos awaiting review
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <div className="ml-2 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Dropbox Storage
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {stats.approvedSubmissions} videos uploaded to Dropbox
                      </p>
                    </div>
                  </div>
                  
                  <div className="rounded-md bg-blue-50 p-4 mt-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Video Review Process
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>
                            Videos are stored temporarily until reviewed by an admin. 
                            Once approved, they are permanently uploaded to Dropbox.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="submissions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg font-medium">
                  Pending Review
                </CardTitle>
                <Clock className="h-5 w-5 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.pendingSubmissions}</div>
                <div className="mt-4">
                  <a 
                    href="/admin/submissions" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    Review Submissions
                  </a>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg font-medium">
                  Approved Submissions
                </CardTitle>
                <Check className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.approvedSubmissions}</div>
                <p className="text-sm text-gray-500 mt-2">
                  Successfully uploaded to Dropbox
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg font-medium">
                  Rejected Submissions
                </CardTitle>
                <X className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.rejectedSubmissions}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg font-medium">
                  Registered Users
                </CardTitle>
                <UserCheck className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
                <div className="mt-4">
                  <a 
                    href="/admin/users" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    View Users
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminDashboard;
