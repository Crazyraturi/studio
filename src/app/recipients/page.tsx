// src/app/recipients/page.tsx
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Filter, Trash2, Edit, Eye, Mail, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { personalizeInvitation } from '@/ai/flows/personalize-invitations';
import { useAppData } from '@/context/AppDataContext'; // Import useAppData

// Define Recipient type here or import if defined centrally
export interface Recipient {
  id: string;
  firstName: string;
  email: string;
  organization: string;
  achievement: string;
  role: string;
  status: 'Not Invited' | 'Invited' | 'Follow-up 1' | 'Follow-up 2' | 'RSVPed' | 'Declined';
  lastContacted?: Date | null;
}

export default function RecipientsPage() {
  const { recipients, deleteRecipients } = useAppData(); // Get data and actions from context
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [generatingEmailId, setGeneratingEmailId] = useState<string | null>(null); // Track loading state per row
  const { toast } = useToast();

  const filteredRecipients = useMemo(() => {
    return recipients.filter(recipient => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        recipient.firstName.toLowerCase().includes(term) ||
        recipient.email.toLowerCase().includes(term) ||
        recipient.organization.toLowerCase().includes(term) ||
        recipient.role.toLowerCase().includes(term);

      const matchesStatus = filterStatus === 'All' || recipient.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [recipients, searchTerm, filterStatus]);

  const handleSelectAll = useCallback((checked: boolean | 'indeterminate') => {
    if (checked === true) {
      const allIds = new Set(filteredRecipients.map(r => r.id));
      setSelectedRows(allIds);
    } else {
      setSelectedRows(new Set());
    }
  }, [filteredRecipients]);

  const handleRowSelect = useCallback((id: string, checked: boolean) => {
    setSelectedRows(prev => {
      const newSelectedRows = new Set(prev);
      if (checked) {
        newSelectedRows.add(id);
      } else {
        newSelectedRows.delete(id);
      }
      return newSelectedRows;
    });
  }, []);

  const isAllSelected = useMemo(() => selectedRows.size > 0 && selectedRows.size === filteredRecipients.length, [selectedRows, filteredRecipients.length]);
  const isIndeterminate = useMemo(() => selectedRows.size > 0 && selectedRows.size < filteredRecipients.length, [selectedRows, filteredRecipients.length]);

  const handleDeleteSelected = useCallback(() => {
      if (selectedRows.size === 0) {
          toast({title: "No recipients selected", description: "Please select recipients to delete.", variant: "destructive"});
          return;
      }
     deleteRecipients(selectedRows); // Call context action
     setSelectedRows(new Set());
     toast({ title: "Recipients Deleted", description: `${selectedRows.size} recipient(s) removed.` });
  }, [selectedRows, deleteRecipients, toast]);

  const handleGeneratePersonalizedEmail = async (recipient: Recipient) => {
       setGeneratingEmailId(recipient.id); // Set loading state for this row
       toast({ title: "Generating Email...", description: `Personalizing email for ${recipient.firstName}...` });
       try {
           const result = await personalizeInvitation({
               firstName: recipient.firstName,
               email: recipient.email,
               organization: recipient.organization,
               achievement: recipient.achievement,
               role: recipient.role,
           });

           // Display the generated email in an alert for preview
           alert(`Generated Email Preview for ${recipient.firstName}:\n\nSubject: ${result.subject}\n\nBody:\n${result.body}`);
           toast({ title: "Email Generated", description: `Personalized email preview shown for ${recipient.firstName}.` });

       } catch (error) {
           console.error("Failed to generate personalized email:", error);
           toast({ title: "Generation Failed", description: "Could not generate personalized email.", variant: "destructive" });
       } finally {
           setGeneratingEmailId(null); // Clear loading state
       }
   };

   const handleDeleteSingle = useCallback((recipient: Recipient) => {
        const idsToDelete = new Set([recipient.id]);
        deleteRecipients(idsToDelete);
        setSelectedRows(prev => { const next = new Set(prev); next.delete(recipient.id); return next; });
        toast({ title: "Recipient Deleted", description: `${recipient.firstName} removed.` });
   }, [deleteRecipients, toast]);

  const statusOptions = ['All', 'Not Invited', 'Invited', 'Follow-up 1', 'Follow-up 2', 'RSVPed', 'Declined'];


  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Manage Recipients</h1>
        <p className="text-muted-foreground">View, filter, and manage your list of potential participants.</p>
      </header>

      <Card className="card-shadow rounded-corners">
        <CardHeader>
          <CardTitle>Recipient List</CardTitle>
           <CardDescription>Total Recipients: {recipients.length} | Displaying: {filteredRecipients.length}</CardDescription>
           <div className="flex flex-col md:flex-row gap-2 pt-4">
              <Input
                placeholder="Search recipients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
               <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                       <Button variant="outline" className="ml-auto">
                           <Filter className="mr-2 h-4 w-4" /> Filter by Status ({filterStatus})
                       </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                       {statusOptions.map(status => (
                             <DropdownMenuItem key={status} onSelect={() => setFilterStatus(status)} className={filterStatus === status ? 'bg-accent' : ''}>
                                 {status}
                             </DropdownMenuItem>
                         ))}
                   </DropdownMenuContent>
               </DropdownMenu>
              <Button variant="destructive" onClick={handleDeleteSelected} disabled={selectedRows.size === 0}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Selected ({selectedRows.size})
              </Button>
           </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                   <TableHead padding="checkbox">
                      <Checkbox
                        checked={isIndeterminate ? 'indeterminate' : isAllSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all rows"
                      />
                    </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Organization</TableHead>
                   <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Contacted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecipients.length > 0 ? (
                  filteredRecipients.map((recipient) => (
                    <TableRow key={recipient.id} data-state={selectedRows.has(recipient.id) ? 'selected' : ''}>
                       <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedRows.has(recipient.id)}
                            onCheckedChange={(checked) => handleRowSelect(recipient.id, !!checked)}
                            aria-label={`Select row ${recipient.id}`}
                          />
                        </TableCell>
                      <TableCell className="font-medium">{recipient.firstName}</TableCell>
                      <TableCell>{recipient.email}</TableCell>
                      <TableCell>{recipient.organization}</TableCell>
                      <TableCell className="hidden md:table-cell">{recipient.role}</TableCell>
                      <TableCell>{recipient.status}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {recipient.lastContacted ? new Date(recipient.lastContacted).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="ghost" className="h-8 w-8 p-0" disabled={generatingEmailId === recipient.id}>
                               <span className="sr-only">Open menu</span>
                               {generatingEmailId === recipient.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                             <DropdownMenuLabel>Actions</DropdownMenuLabel>
                             <DropdownMenuItem onClick={() => alert(`Viewing details for ${recipient.firstName}`)}>
                               <Eye className="mr-2 h-4 w-4" /> View Details
                             </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => alert(`Editing ${recipient.firstName}`)}>
                               <Edit className="mr-2 h-4 w-4" /> Edit Recipient
                             </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleGeneratePersonalizedEmail(recipient)} disabled={generatingEmailId === recipient.id}>
                                {generatingEmailId === recipient.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Generate Email
                              </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => alert(`Sending test email to ${recipient.firstName}`)}>
                               <Mail className="mr-2 h-4 w-4" /> Send Test Email
                             </DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem onClick={() => handleDeleteSingle(recipient)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                               <Trash2 className="mr-2 h-4 w-4" /> Delete
                             </DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No recipients found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
