
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminService, SubmissionData } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

const AdminSubmissions: React.FC = () => {
  const { getSubmissions, approveSubmission, rejectSubmission, deleteSubmission } = useAdminService();
  const [submissions, setSubmissions] = useState<SubmissionData[]>(getSubmissions());
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    const success = await approveSubmission(id);
    if (success) {
      setSubmissions(getSubmissions());
    }
    setProcessingId(null);
  };

  const handleReject = (id: string) => {
    setProcessingId(id);
    const success = rejectSubmission(id);
    if (success) {
      setSubmissions(getSubmissions());
    }
    setProcessingId(null);
  };

  const handleDelete = (id: string) => {
    setProcessingId(id);
    const success = deleteSubmission(id);
    if (success) {
      setSubmissions(getSubmissions());
    }
    setProcessingId(null);
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

  return (
    <AdminLayout title="Video Submissions">
      <Card className="p-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Signature</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">
                    {submission.firstName} {submission.lastName}
                  </TableCell>
                  <TableCell>{submission.email}</TableCell>
                  <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                  <TableCell>{getStatusBadge(submission.status)}</TableCell>
                  <TableCell>
                    {submission.signatureProvided ? "Yes" : "No"}
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
                        disabled={processingId === submission.id}
                        onClick={() => handleDelete(submission.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {submissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No submissions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </AdminLayout>
  );
};

export default AdminSubmissions;
