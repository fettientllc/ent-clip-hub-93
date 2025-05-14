
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
