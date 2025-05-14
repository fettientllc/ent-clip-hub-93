
import { useState, useEffect } from 'react';
import { SubmissionData } from './adminService';

interface FilterOptions {
  pending: boolean;
  approved: boolean;
  rejected: boolean;
  ownRecording: boolean;
  wantCredit: boolean;
  missingPaypal: boolean;
}

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export const useFilterService = (submissions: SubmissionData[], refreshKey = 0) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    pending: true,
    approved: true,
    rejected: true,
    ownRecording: false,
    wantCredit: false,
    missingPaypal: false
  });
  
  const [filteredSubmissions, setFilteredSubmissions] = useState<SubmissionData[]>(submissions);
  
  // Apply filters whenever filter options, search term, or date range changes
  // Also reapply when the refreshKey changes (meaning new data is available)
  useEffect(() => {
    let results = [...submissions];
    
    // Filter by status if not all statuses are selected
    if (!(filterOptions.pending && filterOptions.approved && filterOptions.rejected)) {
      results = results.filter(submission => 
        (filterOptions.pending && submission.status === 'pending') ||
        (filterOptions.approved && submission.status === 'approved') ||
        (filterOptions.rejected && submission.status === 'rejected')
      );
    }
    
    // Filter by recording ownership
    if (filterOptions.ownRecording) {
      results = results.filter(submission => submission.isOwnRecording === true);
    }
    
    // Filter by credit requirements
    if (filterOptions.wantCredit) {
      results = results.filter(submission => submission.wantCredit === true);
    }
    
    // Filter by missing PayPal email
    if (filterOptions.missingPaypal) {
      results = results.filter(submission => 
        !submission.paypalEmail || submission.paypalEmail.trim() === ""
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(submission => 
        submission.firstName.toLowerCase().includes(term) ||
        submission.lastName.toLowerCase().includes(term) ||
        submission.email.toLowerCase().includes(term) ||
        (submission.location && submission.location.toLowerCase().includes(term))
      );
    }
    
    // Filter by date range
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      results = results.filter(submission => {
        const submittedDate = new Date(submission.submittedAt);
        return submittedDate >= fromDate;
      });
      
      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        
        results = results.filter(submission => {
          const submittedDate = new Date(submission.submittedAt);
          return submittedDate <= toDate;
        });
      }
    }
    
    setFilteredSubmissions(results);
  }, [submissions, searchTerm, dateRange, filterOptions, refreshKey]);
  
  // Reset all filters to default values
  const resetFilters = () => {
    setSearchTerm('');
    setDateRange({ from: undefined, to: undefined });
    setFilterOptions({
      pending: true,
      approved: true,
      rejected: true,
      ownRecording: false,
      wantCredit: false,
      missingPaypal: false
    });
  };
  
  // Export to CSV format
  const exportToCSV = () => {
    // Format the filtered submissions for CSV export
    const headers = [
      'ID', 'First Name', 'Last Name', 'Email', 'Location', 
      'Submitted At', 'Status', 'Is Own Recording', 'Want Credit'
    ];
    
    const csvData = filteredSubmissions.map(sub => [
      sub.id,
      sub.firstName,
      sub.lastName,
      sub.email,
      sub.location || '',
      sub.submittedAt,
      sub.status,
      sub.isOwnRecording ? 'Yes' : 'No',
      sub.wantCredit ? 'Yes' : 'No'
    ]);
    
    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    downloadFile(csvContent, 'submissions.csv', 'text/csv');
  };
  
  // Export to JSON format
  const exportToJSON = () => {
    const jsonData = JSON.stringify(filteredSubmissions, null, 2);
    downloadFile(jsonData, 'submissions.json', 'application/json');
  };
  
  // Helper function to download file
  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return {
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
  };
};
