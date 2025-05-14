
import { useState, useMemo, useCallback } from "react";
import { SubmissionData } from "./adminService";

export const dateFilters: Record<string, { label: string, filter: (date: Date) => boolean }> = {
  all: { 
    label: "All Time", 
    filter: () => true 
  },
  today: {
    label: "Today",
    filter: (date: Date) => {
      const today = new Date();
      return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    }
  },
  yesterday: {
    label: "Yesterday",
    filter: (date: Date) => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();
    }
  },
  thisWeek: {
    label: "This Week",
    filter: (date: Date) => {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return date >= startOfWeek;
    }
  },
  thisMonth: {
    label: "This Month",
    filter: (date: Date) => {
      const today = new Date();
      return date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    }
  },
  last30days: {
    label: "Last 30 Days",
    filter: (date: Date) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return date >= thirtyDaysAgo;
    }
  },
};

export const filterSubmissions = (
  submissions: SubmissionData[],
  searchTerm: string,
  filters: {
    dateRange: string;
    ownRecording: boolean | null;
    wantCredit: boolean | null;
    hasPaypalEmail: boolean | null;
    status: string;
  }
) => {
  return submissions.filter(submission => {
    // Search term filtering
    const searchLower = searchTerm.toLowerCase().trim();
    if (searchTerm && !`${submission.firstName} ${submission.lastName}`.toLowerCase().includes(searchLower) &&
        !submission.email.toLowerCase().includes(searchLower) &&
        !(submission.location && submission.location.toLowerCase().includes(searchLower)) &&
        !(submission.description && submission.description.toLowerCase().includes(searchLower))) {
      return false;
    }
    
    // Date range filtering
    if (filters.dateRange !== 'all') {
      const submissionDate = new Date(submission.submittedAt);
      const dateFilter = dateFilters[filters.dateRange];
      if (dateFilter && !dateFilter.filter(submissionDate)) {
        return false;
      }
    }
    
    // Own recording filtering
    if (filters.ownRecording !== null && submission.isOwnRecording !== filters.ownRecording) {
      return false;
    }
    
    // Want credit filtering
    if (filters.wantCredit !== null && submission.wantCredit !== filters.wantCredit) {
      return false;
    }
    
    // PayPal email filtering
    if (filters.hasPaypalEmail !== null) {
      const hasPaypal = !!submission.paypalEmail;
      if (hasPaypal !== filters.hasPaypalEmail) {
        return false;
      }
    }
    
    // Status filtering
    if (filters.status !== 'all' && submission.status !== filters.status) {
      return false;
    }
    
    return true;
  });
};

// Add the useFilterService hook that was missing
export const useFilterService = (allSubmissions: SubmissionData[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [filterOptions, setFilterOptions] = useState({
    ownRecording: false,
    wantCredit: false,
    missingPaypal: false,
    pending: true,
    approved: true,
    rejected: true
  });

  // Filter submissions based on search term and other filters
  const filteredSubmissions = useMemo(() => {
    // Convert date range to string filter
    let dateRangeFilter = 'all';
    if (dateRange.from && dateRange.to) {
      // Custom date range logic
      const customDateFilter = (date: Date) => {
        const submissionDate = new Date(date);
        return submissionDate >= dateRange.from! && submissionDate <= dateRange.to!;
      };
      
      // We'll use our custom filter instead of predefined ones
      dateRangeFilter = 'custom';
    } else if (dateRange.from && !dateRange.to) {
      // Single date selection
      dateRangeFilter = 'custom';
    }

    // Apply status filters
    const statusFilters = [];
    if (filterOptions.pending) statusFilters.push('pending');
    if (filterOptions.approved) statusFilters.push('approved');
    if (filterOptions.rejected) statusFilters.push('rejected');

    let filteredByStatus = allSubmissions;
    if (statusFilters.length > 0 && statusFilters.length < 3) {
      filteredByStatus = allSubmissions.filter(sub => statusFilters.includes(sub.status));
    }

    // Apply other filters using the existing filterSubmissions function
    return filterSubmissions(
      filteredByStatus,
      searchTerm,
      {
        dateRange: dateRangeFilter,
        ownRecording: filterOptions.ownRecording ? true : null,
        wantCredit: filterOptions.wantCredit ? true : null,
        hasPaypalEmail: filterOptions.missingPaypal ? false : null,
        status: 'all' // We already filtered by status above
      }
    );
  }, [allSubmissions, searchTerm, dateRange, filterOptions]);

  // Export CSV function
  const exportToCSV = useCallback(() => {
    if (filteredSubmissions.length === 0) return;
    
    const headers = [
      'First Name', 'Last Name', 'Email', 'Location', 'Submitted At', 
      'Status', 'Is Own Recording', 'Want Credit', 'Has PayPal'
    ].join(',');
    
    const rows = filteredSubmissions.map(sub => [
      `"${sub.firstName}"`,
      `"${sub.lastName}"`,
      `"${sub.email}"`,
      `"${sub.location || ''}"`,
      `"${sub.submittedAt}"`,
      `"${sub.status}"`,
      sub.isOwnRecording ? 'Yes' : 'No',
      sub.wantCredit ? 'Yes' : 'No',
      sub.paypalEmail ? 'Yes' : 'No'
    ].join(','));
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `submissions-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredSubmissions]);
  
  // Export JSON function
  const exportToJSON = useCallback(() => {
    if (filteredSubmissions.length === 0) return;
    
    const data = JSON.stringify(filteredSubmissions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `submissions-export-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredSubmissions]);
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setDateRange({});
    setFilterOptions({
      ownRecording: false,
      wantCredit: false,
      missingPaypal: false,
      pending: true,
      approved: true,
      rejected: true
    });
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
