
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useMailingListService } from '@/services/mailingListService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Download, Search, UserPlus, UserMinus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminUsers: React.FC = () => {
  const { getMailingList } = useMailingListService();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const users = getMailingList();
  
  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCsv = () => {
    try {
      // Create CSV content
      const headers = ['First Name', 'Last Name', 'Email', 'Source', 'Keep In Touch', 'Added At'];
      const csvContent = [
        headers.join(','),
        ...filteredUsers.map(user => [
          user.firstName,
          user.lastName,
          user.email,
          user.source,
          user.keepInTouch?.toString() || 'false',
          user.addedAt
        ].join(','))
      ].join('\n');
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "mailing-list.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: `Exported ${filteredUsers.length} users to CSV`
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the data",
        variant: "destructive"
      });
    }
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <AdminLayout title="User Management">
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>
      
      <Card className="p-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Marketing</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.source}</TableCell>
                  <TableCell>{user.keepInTouch ? "Yes" : "No"}</TableCell>
                  <TableCell>{formatDate(user.addedAt)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No users found
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

export default AdminUsers;
