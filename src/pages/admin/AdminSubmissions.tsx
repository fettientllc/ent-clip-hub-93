import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminService, SubmissionData } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X, Download, Search, FileText, Mail } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { dateFilters, filterSubmissions } from "@/services/filterService";

const AdminSubmissions: React.FC = () => {
  const { 
    getSubmissions, 
    approveSubmission, 
    rejectSubmission, 
    deleteSubmission, 
    addSubmissionNote,
    downloadVideo,
    getVideoUrl
  } = useAdminService();
  
  // State
  const [submissions, setSubmissions] = useState<SubmissionData[]>(getSubmissions());
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionData | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filters, setFilters] = useState({
    dateRange: 'all',
    ownRecording: null as boolean | null,
    wantCredit: null as boolean | null,
    hasPaypalEmail: null as boolean | null,
    status: 'all',
  });
  
  // Filter submissions based on search term and filters
  const filteredSubmissions = filterSubmissions(submissions, searchTerm, filters);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    const success = await approveSubmission(id);
    if (success) {
      setSubmissions(getSubmissions());
      toast({
        title: "Success",
        description: "Submission has been approved",
      });
    }
    setProcessingId(null);
  };

  const handleReject = (id: string) => {
    setProcessingId(id);
    const success = rejectSubmission(id);
    if (success) {
      setSubmissions(getSubmissions());
      toast({
        title: "Success",
        description: "Submission has been rejected",
      });
    }
    setProcessingId(null);
  };

  const handleDelete = (id: string) => {
    setProcessingId(id);
    const success = deleteSubmission(id);
    if (success) {
      setSubmissions(getSubmissions());
      toast({
        title: "Success",
        description: "Submission has been deleted",
      });
    }
    setProcessingId(null);
  };
  
  const handleDownload = async (id: string) => {
    setProcessingId(id);
    try {
      await downloadVideo(id);
      toast({
        title: "Download started",
        description: "Your download should begin shortly",
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download failed",
        description: "Failed to download video",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleExportData = (format: 'csv' | 'json') => {
    // Get all submissions or just filtered ones
    const dataToExport = filteredSubmissions;
    
    let content = '';
    let filename = '';
    
    if (format === 'csv') {
      // Create CSV content
      const headers = ['ID', 'Name', 'Email', 'Location', 'Date', 'Status', 'Own Recording', 'Want Credit', 'PayPal Email'];
      content = headers.join(',') + '\n';
      
      dataToExport.forEach(sub => {
        const row = [
          sub.id,
          `${sub.firstName} ${sub.lastName}`,
          sub.email,
          sub.location || '',
          sub.submittedAt,
          sub.status,
          sub.isOwnRecording ? 'Yes' : 'No',
          sub.wantCredit ? 'Yes' : 'No',
          sub.paypalEmail || ''
        ];
        
        // Escape commas and quotes in CSV
        const escapedRow = row.map(cell => {
          if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        });
        
        content += escapedRow.join(',') + '\n';
      });
      
      filename = `submissions-export-${new Date().toISOString().slice(0, 10)}.csv`;
    } else {
      // JSON format
      content = JSON.stringify(dataToExport, null, 2);
      filename = `submissions-export-${new Date().toISOString().slice(0, 10)}.json`;
    }
    
    // Create download link
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: `Data exported as ${format.toUpperCase()}`,
    });
  };
  
  const handleSaveNote = (id: string, note: string) => {
    const success = addSubmissionNote(id, note);
    if (success) {
      setSubmissions(getSubmissions());
      toast({
        title: "Note saved",
        description: "Your note has been added to the submission",
      });
      setSelectedSubmission(null);
    } else {
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const handleContactSubmitter = (email: string) => {
    window.location.href = `mailto:${email}?subject=Regarding your video submission`;
  };

  // Get the actual video URL for a submission
  const getVideoSrc = (submission: SubmissionData) => {
    if (!submission.videoPath) return '';
    return getVideoUrl(submission.id);
  };

  const renderTable = () => (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Video Preview</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSubmissions.length > 0 ? filteredSubmissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell className="font-medium">
                {submission.firstName} {submission.lastName}
              </TableCell>
              <TableCell>{submission.email}</TableCell>
              <TableCell>{formatDate(submission.submittedAt)}</TableCell>
              <TableCell>{getStatusBadge(submission.status)}</TableCell>
              <TableCell>
                {submission.videoPath ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    Preview
                  </Button>
                ) : (
                  <span className="text-muted-foreground text-sm">No video</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={submission.status === 'approved' || processingId === submission.id}
                    onClick={() => handleApprove(submission.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={submission.status === 'rejected' || processingId === submission.id}
                    onClick={() => handleReject(submission.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={processingId === submission.id || !submission.videoPath}
                    onClick={() => handleDownload(submission.id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContactSubmitter(submission.email)}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                No submissions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  const renderGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredSubmissions.length > 0 ? filteredSubmissions.map((submission) => (
        <Card key={submission.id} className="overflow-hidden flex flex-col">
          {submission.videoPath && (
            <div className="bg-gray-100 w-full relative">
              <AspectRatio ratio={16 / 9}>
                <video 
                  src={getVideoSrc(submission)}
                  controls 
                  className="w-full h-full object-cover"
                  poster="/placeholder.svg"
                />
              </AspectRatio>
            </div>
          )}
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium">{submission.firstName} {submission.lastName}</h3>
              {getStatusBadge(submission.status)}
            </div>
            <p className="text-sm text-gray-600 mb-1">{submission.email}</p>
            <p className="text-xs text-gray-500 mb-3">{formatDate(submission.submittedAt)}</p>
            
            <div className="mt-auto flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={submission.status === 'approved' || processingId === submission.id}
                onClick={() => handleApprove(submission.id)}
              >
                <Check className="h-4 w-4 mr-1" /> Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={submission.status === 'rejected' || processingId === submission.id}
                onClick={() => handleReject(submission.id)}
              >
                <X className="h-4 w-4 mr-1" /> Reject
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={processingId === submission.id}
                onClick={() => setSelectedSubmission(submission)}
              >
                <FileText className="h-4 w-4 mr-1" /> Details
              </Button>
            </div>
          </div>
        </Card>
      )) : (
        <div className="col-span-full text-center py-10 text-muted-foreground">
          No submissions found
        </div>
      )}
    </div>
  );

  return (
    <AdminLayout title="Video Submissions">
      <div className="space-y-6">
        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or location..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
          >
            {viewMode === 'table' ? 'Grid View' : 'Table View'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => handleExportData('csv')}
          >
            Export CSV
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => handleExportData('json')}
          >
            Export JSON
          </Button>
        </div>
        
        {/* Filter options */}
        <div className="bg-muted/40 p-4 rounded-md">
          <h3 className="font-medium mb-3">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Date Range</label>
              <select 
                className="w-full rounded-md border border-input p-2 bg-background" 
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              >
                {Object.keys(dateFilters).map(key => (
                  <option key={key} value={key}>{dateFilters[key].label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Own Recording</label>
              <select 
                className="w-full rounded-md border border-input p-2 bg-background"
                value={filters.ownRecording === null ? '' : String(filters.ownRecording)}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : e.target.value === 'true';
                  setFilters({...filters, ownRecording: value});
                }}
              >
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Want Credit</label>
              <select 
                className="w-full rounded-md border border-input p-2 bg-background"
                value={filters.wantCredit === null ? '' : String(filters.wantCredit)}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : e.target.value === 'true';
                  setFilters({...filters, wantCredit: value});
                }}
              >
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">PayPal Email</label>
              <select 
                className="w-full rounded-md border border-input p-2 bg-background"
                value={filters.hasPaypalEmail === null ? '' : String(filters.hasPaypalEmail)}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : e.target.value === 'true';
                  setFilters({...filters, hasPaypalEmail: value});
                }}
              >
                <option value="">Any</option>
                <option value="true">Provided</option>
                <option value="false">Missing</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <select 
                className="w-full rounded-md border border-input p-2 bg-background"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Submissions */}
        <Card className="p-6">
          <Tabs defaultValue="submissions" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="submissions">Submissions ({filteredSubmissions.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="submissions">
              {viewMode === 'table' ? renderTable() : renderGrid()}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      {/* Detail dialog */}
      {selectedSubmission && (
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submission Details</DialogTitle>
              <DialogDescription>
                View and manage submission from {selectedSubmission.firstName} {selectedSubmission.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                {selectedSubmission.videoPath ? (
                  <div className="mb-6">
                    <AspectRatio ratio={16 / 9}>
                      <video 
                        src={getVideoSrc(selectedSubmission)}
                        controls 
                        className="rounded-md w-full h-full object-cover"
                        poster="/placeholder.svg"
                      />
                    </AspectRatio>
                    <div className="mt-2 flex gap-2">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleDownload(selectedSubmission.id)}
                        disabled={processingId === selectedSubmission.id}
                      >
                        <Download className="h-4 w-4 mr-2" /> Download Video
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-md p-6 flex items-center justify-center mb-6">
                    <p className="text-muted-foreground">No video available</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <h3 className="font-medium">Admin Notes</h3>
                  <Textarea 
                    placeholder="Add notes about this submission..."
                    rows={4}
                    className="w-full"
                    defaultValue={selectedSubmission.adminNotes || ''}
                    onBlur={(e) => handleSaveNote(selectedSubmission.id, e.target.value)}
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      disabled={selectedSubmission.status === 'approved' || processingId === selectedSubmission.id}
                      onClick={() => handleApprove(selectedSubmission.id)}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" /> Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={selectedSubmission.status === 'rejected' || processingId === selectedSubmission.id}
                      onClick={() => handleReject(selectedSubmission.id)}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" /> Reject
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContactSubmitter(selectedSubmission.email)}
                    className="w-full"
                  >
                    <Mail className="h-4 w-4 mr-2" /> Contact Submitter
                  </Button>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Submission Information</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between py-1 border-b">
                      <dt className="text-muted-foreground">Status</dt>
                      <dd>{getStatusBadge(selectedSubmission.status)}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <dt className="text-muted-foreground">Name</dt>
                      <dd>{selectedSubmission.firstName} {selectedSubmission.lastName}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <dt className="text-muted-foreground">Email</dt>
                      <dd>{selectedSubmission.email}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <dt className="text-muted-foreground">Date Submitted</dt>
                      <dd>{formatDate(selectedSubmission.submittedAt)}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <dt className="text-muted-foreground">Location</dt>
                      <dd>{selectedSubmission.location || 'Not provided'}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <dt className="text-muted-foreground">Own Recording</dt>
                      <dd>{selectedSubmission.isOwnRecording ? 'Yes' : 'No'}</dd>
                    </div>
                    {!selectedSubmission.isOwnRecording && selectedSubmission.recorderName && (
                      <div className="flex justify-between py-1 border-b">
                        <dt className="text-muted-foreground">Recorded By</dt>
                        <dd>{selectedSubmission.recorderName}</dd>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b">
                      <dt className="text-muted-foreground">Want Credit</dt>
                      <dd>{selectedSubmission.wantCredit ? 'Yes' : 'No'}</dd>
                    </div>
                    {selectedSubmission.wantCredit && selectedSubmission.creditPlatform && (
                      <div className="flex justify-between py-1 border-b">
                        <dt className="text-muted-foreground">Credit Platform</dt>
                        <dd>{selectedSubmission.creditPlatform}</dd>
                      </div>
                    )}
                    {selectedSubmission.wantCredit && selectedSubmission.creditUsername && (
                      <div className="flex justify-between py-1 border-b">
                        <dt className="text-muted-foreground">Username</dt>
                        <dd>{selectedSubmission.creditUsername}</dd>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b">
                      <dt className="text-muted-foreground">PayPal Email</dt>
                      <dd>{selectedSubmission.paypalEmail || 'Not provided'}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <dt className="text-muted-foreground">Signature Provided</dt>
                      <dd>{selectedSubmission.signatureProvided ? 'Yes' : 'No'}</dd>
                    </div>
                  </dl>
                </div>
                
                {selectedSubmission.description && (
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <div className="bg-muted/30 p-4 rounded-md">
                      <p className="text-sm">{selectedSubmission.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
};

export default AdminSubmissions;
