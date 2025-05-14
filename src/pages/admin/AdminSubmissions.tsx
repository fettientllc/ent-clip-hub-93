import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminService, SubmissionData } from '@/services/adminService';
import { 
  MoreHorizontal, 
  Download, 
  Mail, 
  Trash2, 
  Check, 
  X, 
  GridIcon, 
  List as ListIcon,
  Search,
  FileSpreadsheet,
  FileJson,
  Clock,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useFilterService } from '@/services/filterService';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';

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
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionData | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  
  // Get all submissions
  const allSubmissions = getSubmissions();
  
  // Filtering functionality
  const { 
    searchTerm, 
    setSearchTerm,
    dateRange,
    setDateRange,
    filterOptions,
    setFilterOptions,
    filteredSubmissions,
    resetFilters,
    exportToCSV,
    exportToJSON
  } = useFilterService(allSubmissions);
  
  // Handle opening submission details
  const handleOpenDetails = (submission: SubmissionData) => {
    setSelectedSubmission(submission);
    setAdminNote(submission.adminNotes || '');
    setIsDetailsOpen(true);
  };
  
  // Handle approval
  const handleApprove = async (id: string) => {
    const success = await approveSubmission(id);
    if (success) {
      // Refresh the list (in a real app, this might involve re-fetching)
      setIsDetailsOpen(false);
    }
  };
  
  // Handle rejection
  const handleReject = (id: string) => {
    const success = rejectSubmission(id);
    if (success) {
      // Refresh the list
      setIsDetailsOpen(false);
    }
  };
  
  // Handle delete
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      const success = deleteSubmission(id);
      if (success) {
        setIsDetailsOpen(false);
      }
    }
  };
  
  // Save admin note
  const handleSaveNote = (id: string) => {
    if (!selectedSubmission) return;
    
    const success = addSubmissionNote(id, adminNote);
    
    if (success) {
      toast({
        title: "Note Saved",
        description: "The admin note has been saved successfully",
      });
      
      // Update the selected submission to reflect the change
      setSelectedSubmission({
        ...selectedSubmission,
        adminNotes: adminNote
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save admin note",
        variant: "destructive",
      });
    }
  };
  
  // Download video
  const handleDownload = async (id: string) => {
    await downloadVideo(id);
  };
  
  // Apply background color based on status
  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };
  
  const handleDateRangeSelect = (date: Date | undefined) => {
    if (date) {
      if (!dateRange.from) {
        setDateRange({ from: date, to: undefined });
      } else if (dateRange.from && !dateRange.to && date >= dateRange.from) {
        setDateRange({ from: dateRange.from, to: date });
      } else {
        setDateRange({ from: date, to: undefined });
      }
    }
  };
  
  const handleFilterToggle = (filterName: string) => {
    setFilterOptions((prev) => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };
  
  const handleExportCSV = () => {
    exportToCSV();
    toast({
      title: "Export successful",
      description: "Submissions have been exported to CSV format",
    });
  };
  
  const handleExportJSON = () => {
    exportToJSON();
    toast({
      title: "Export successful",
      description: "Submissions have been exported to JSON format",
    });
  };
  
  const handleContactSubmitter = (email: string) => {
    window.location.href = `mailto:${email}?subject=Regarding your video submission`;
  };

  // Use demo videos for preview
  const getVideoSrc = (submission: SubmissionData) => {
    if (!submission.videoPath) return '';
    
    // Using static demo videos based on the submission ID
    const demoVideos = [
      'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    ];
    
    // Use the submission ID to deterministically select a demo video
    const videoIndex = parseInt(submission.id.replace('sub-', '')) % demoVideos.length;
    return demoVideos[videoIndex - 1 >= 0 ? videoIndex - 1 : 0];
  };

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submitted
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredSubmissions.map((submission) => (
            <tr 
              key={submission.id}
              className={`hover:bg-gray-100 transition-colors ${getStatusBackground(submission.status)}`}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {submission.firstName} {submission.lastName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {submission.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {submission.location}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(submission.submittedAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenDetails(submission)}
                  >
                    View Details
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(submission.id)}
                    title="Download Video"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleContactSubmitter(submission.email)}
                    title="Email Submitter"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredSubmissions.map((submission) => (
        <div 
          key={submission.id}
          className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${getStatusBackground(submission.status)}`}
        >
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
          
          <div className="p-4">
            <h3 className="font-bold text-lg">{submission.firstName} {submission.lastName}</h3>
            <p className="text-sm text-gray-500">{submission.email}</p>
            <p className="text-sm text-gray-500">{submission.location}</p>
            <p className="text-sm text-gray-600 mt-2">
              <Clock className="inline-block mr-1 h-4 w-4" />
              {formatDate(submission.submittedAt)}
            </p>
            
            {submission.description && (
              <p className="text-sm mt-2 line-clamp-2">{submission.description}</p>
            )}
            
            <div className="flex flex-wrap gap-1 mt-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleOpenDetails(submission)}
              >
                View Details
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDownload(submission.id)}
                title="Download Video"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleContactSubmitter(submission.email)}
                title="Email Submitter"
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  
  const filterSubmissionsByStatus = (status: string) => {
    return filteredSubmissions.filter(submission => submission.status === status);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Video Submissions</h1>
        
        <div className="flex space-x-2">
          <Button
            variant={isFilterPanelOpen ? "default" : "outline"}
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className="flex items-center space-x-1"
          >
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleExportCSV}
            className="flex items-center space-x-1"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleExportJSON}
            className="flex items-center space-x-1"
          >
            <FileJson className="h-4 w-4" />
            <span>Export JSON</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setView(view === 'table' ? 'grid' : 'table')}
          >
            {view === 'table' ? (
              <GridIcon className="h-4 w-4" />
            ) : (
              <ListIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Search by name, email, or location..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {isFilterPanelOpen && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Date Range</h3>
              <div className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "MMM d, yyyy")} - 
                            {format(dateRange.to, "MMM d, yyyy")}
                          </>
                        ) : (
                          format(dateRange.from, "MMM d, yyyy")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{
                        from: dateRange.from,
                        to: dateRange.to,
                      }}
                      onSelect={(range) => 
                        setDateRange({ 
                          from: range?.from, 
                          to: range?.to
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Filter Options</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="own-recording" 
                    checked={filterOptions.ownRecording} 
                    onCheckedChange={() => handleFilterToggle('ownRecording')}
                  />
                  <label htmlFor="own-recording" className="text-sm">Own Recording Only</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="want-credit" 
                    checked={filterOptions.wantCredit} 
                    onCheckedChange={() => handleFilterToggle('wantCredit')}
                  />
                  <label htmlFor="want-credit" className="text-sm">Want Credit Only</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="missing-paypal" 
                    checked={filterOptions.missingPaypal} 
                    onCheckedChange={() => handleFilterToggle('missingPaypal')}
                  />
                  <label htmlFor="missing-paypal" className="text-sm">Missing PayPal Email</label>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Status</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="pending" 
                    checked={filterOptions.pending} 
                    onCheckedChange={() => handleFilterToggle('pending')}
                  />
                  <label htmlFor="pending" className="text-sm">Pending</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="approved" 
                    checked={filterOptions.approved} 
                    onCheckedChange={() => handleFilterToggle('approved')}
                  />
                  <label htmlFor="approved" className="text-sm">Approved</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="rejected" 
                    checked={filterOptions.rejected} 
                    onCheckedChange={() => handleFilterToggle('rejected')}
                  />
                  <label htmlFor="rejected" className="text-sm">Rejected</label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
          </div>
        </div>
      )}
      
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <p className="text-gray-500">No submissions match your current filters</p>
              <Button variant="link" onClick={resetFilters} className="mt-2">
                Reset Filters
              </Button>
            </div>
          ) : (
            view === 'table' ? renderTable() : renderGrid()
          )}
        </TabsContent>
        <TabsContent value="pending">
          {filterSubmissionsByStatus('pending').length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <p className="text-gray-500">No pending submissions match your current filters</p>
              <Button variant="link" onClick={resetFilters} className="mt-2">
                Reset Filters
              </Button>
            </div>
          ) : (
            view === 'table' ? renderTable() : renderGrid()
          )}
        </TabsContent>
        <TabsContent value="approved">
          {filterSubmissionsByStatus('approved').length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <p className="text-gray-500">No approved submissions match your current filters</p>
              <Button variant="link" onClick={resetFilters} className="mt-2">
                Reset Filters
              </Button>
            </div>
          ) : (
            view === 'table' ? renderTable() : renderGrid()
          )}
        </TabsContent>
        <TabsContent value="rejected">
          {filterSubmissionsByStatus('rejected').length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <p className="text-gray-500">No rejected submissions match your current filters</p>
              <Button variant="link" onClick={resetFilters} className="mt-2">
                Reset Filters
              </Button>
            </div>
          ) : (
            view === 'table' ? renderTable() : renderGrid()
          )}
        </TabsContent>
      </Tabs>
      
      {/* Submission Details Dialog */}
      {selectedSubmission && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submission Details</DialogTitle>
              <DialogDescription>
                View and manage submission from {selectedSubmission.firstName} {selectedSubmission.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                {/* Video Preview */}
                <div className="mb-6">
                  <AspectRatio ratio={16 / 9}>
                    <video 
                      src={getVideoSrc(selectedSubmission)}
                      controls 
                      className="rounded-md w-full h-full object-cover"
                      poster="/placeholder.svg"
                    />
                  </AspectRatio>
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleDownload(selectedSubmission.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Video
                    </Button>
                  </div>
                </div>
                
                {/* Status Management */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Submission Status</h3>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-green-50 hover:bg-green-100 border-green-200"
                      onClick={() => handleApprove(selectedSubmission.id)}
                    >
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-red-50 hover:bg-red-100 border-red-200"
                      onClick={() => handleReject(selectedSubmission.id)}
                    >
                      <X className="h-4 w-4 mr-2 text-red-600" />
                      Reject
                    </Button>
                  </div>
                </div>
                
                {/* Admin Notes */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Admin Notes</h3>
                  <Textarea 
                    value={adminNote} 
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={4}
                    className="resize-none w-full"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => handleSaveNote(selectedSubmission.id)}
                  >
                    Save Notes
                  </Button>
                </div>
                
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => handleDelete(selectedSubmission.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Submission
                </Button>
              </div>
              
              <div>
                {/* Submission Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Submitter Information</h3>
                    <div className="space-y-1">
                      <p><span className="font-medium">Name:</span> {selectedSubmission.firstName} {selectedSubmission.lastName}</p>
                      <p>
                        <span className="font-medium">Email:</span> {selectedSubmission.email}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-2 h-6 p-1"
                          onClick={() => handleContactSubmitter(selectedSubmission.email)}
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                      </p>
                      {selectedSubmission.location && (
                        <p><span className="font-medium">Location:</span> {selectedSubmission.location}</p>
                      )}
                      <p><span className="font-medium">Submitted:</span> {formatDate(selectedSubmission.submittedAt)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Video Details</h3>
                    <div className="space-y-1">
                      <p>
                        <span className="font-medium">Is own recording:</span> {selectedSubmission.isOwnRecording ? "Yes" : "No"}
                      </p>
                      {!selectedSubmission.isOwnRecording && selectedSubmission.recorderName && (
                        <p><span className="font-medium">Recorded by:</span> {selectedSubmission.recorderName}</p>
                      )}
                      <p>
                        <span className="font-medium">Wants clip credit:</span> {selectedSubmission.wantCredit ? "Yes" : "No"}
                      </p>
                      {selectedSubmission.wantCredit && (
                        <>
                          {selectedSubmission.creditPlatform && (
                            <p><span className="font-medium">Platform:</span> {selectedSubmission.creditPlatform}</p>
                          )}
                          {selectedSubmission.creditUsername && (
                            <p><span className="font-medium">Username:</span> {selectedSubmission.creditUsername}</p>
                          )}
                        </>
                      )}
                      {selectedSubmission.paypalEmail && (
                        <p><span className="font-medium">PayPal Email:</span> {selectedSubmission.paypalEmail}</p>
                      )}
                    </div>
                  </div>
                  
                  {selectedSubmission.description && (
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <div className="bg-gray-50 p-3 rounded border">
                        {selectedSubmission.description}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
};

export default AdminSubmissions;
