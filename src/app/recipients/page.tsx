'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Filter, Trash2, Edit, Eye, Mail, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { personalizeInvitation } from '@/ai/flows/personalize-invitations';

interface Recipient {
  id: string;
  firstName: string;
  email: string;
  organization: string;
  achievement: string;
  role: string;
  status: 'Not Invited' | 'Invited' | 'Follow-up 1' | 'Follow-up 2' | 'RSVPed' | 'Declined';
  lastContacted?: Date | null;
}

// Placeholder data - replace with actual data fetching and state management (e.g., zustand, redux, context)
const initialRecipients: Recipient[] = [
  { id: '1', firstName: 'Aisha', email: 'aisha.sharma@innovatech.com', organization: 'Innovatech Solutions', achievement: 'Secured $50M Series B funding', role: 'CEO', status: 'Not Invited', lastContacted: null },
  { id: '2', firstName: 'Rohan', email: 'rohan.mehta@finserve.co', organization: 'FinServe Dynamics', achievement: 'Launched new fintech platform', role: 'CTO', status: 'Invited', lastContacted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  { id: '3', firstName: 'Priya', email: 'priya.patel@greenenergy.org', organization: 'GreenEnergy Foundation', achievement: 'Led $100M solar project initiative', role: 'Director', status: 'Follow-up 1', lastContacted: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
  { id: '4', firstName: 'Vikram', email: 'vikram.singh@healthplus.ai', organization: 'HealthPlus AI', achievement: 'Developed AI diagnostic tool', role: 'Lead Researcher', status: 'RSVPed', lastContacted: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
   { id: '5', firstName: 'Sunita', email: 'sunita.rao@edutechglobal.com', organization: 'EduTech Global', achievement: 'Expanded operations to 5 new countries', role: 'COO', status: 'Not Invited', lastContacted: null },
];

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>(initialRecipients);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('All');
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

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      const allIds = new Set(filteredRecipients.map(r => r.id));
      setSelectedRows(allIds);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleRowSelect = (id: string, checked: boolean) => {
    const newSelectedRows = new Set(selectedRows);
    if (checked) {
      newSelectedRows.add(id);
    } else {
      newSelectedRows.delete(id);
    }
    setSelectedRows(newSelectedRows);
  };

  const isAllSelected = selectedRows.size > 0 && selectedRows.size === filteredRecipients.length;
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < filteredRecipients.length;

  const handleDeleteSelected = () => {
      if (selectedRows.size === 0) {
          toast({title: "No recipients selected", description: "Please select recipients to delete.", variant: "destructive"});
          return;
      }
     // In a real app, you'd confirm deletion and call an API
     setRecipients(prev => prev.filter(r => !selectedRows.has(r.id)));
     setSelectedRows(new Set());
     toast({ title: "Recipients Deleted", description: `${selectedRows.size} recipient(s) removed.` });
  };

   const handleGeneratePersonalizedEmail = async (recipient: Recipient) => {
       toast({ title: "Generating Email...", description: `Personalizing email for ${recipient.firstName}...` });
       try {
           const result = await personalizeInvitation({
               firstName: recipient.firstName,
               email: recipient.email,
               organization: recipient.organization,
               achievement: recipient.achievement,
               role: recipient.role,
           });

           // In a real app, you might open a modal with the email or directly send it.
           console.log("Generated Email:", result);
           alert(`Generated Email Preview for ${recipient.firstName}:\n\nSubject: ${result.subject}\n\nBody:\n${result.body}`);
            toast({ title: "Email Generated", description: `Personalized email ready for ${recipient.firstName}.` });

       } catch (error) {
           console.error("Failed to generate personalized email:", error);
           toast({ title: "Generation Failed", description: "Could not generate personalized email.", variant: "destructive" });
       }
   };

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
                        checked={isAllSelected || isIndeterminate}
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
                        {recipient.lastContacted ? recipient.lastContacted.toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="ghost" className="h-8 w-8 p-0">
                               <span className="sr-only">Open menu</span>
                               <MoreHorizontal className="h-4 w-4" />
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
                              <DropdownMenuItem onClick={() => handleGeneratePersonalizedEmail(recipient)}>
                                <Sparkles className="mr-2 h-4 w-4" /> Generate Email
                              </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => alert(`Sending email to ${recipient.firstName}`)}>
                               <Mail className="mr-2 h-4 w-4" /> Send Test Email
                             </DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem onClick={() => {
                                 setRecipients(prev => prev.filter(r => r.id !== recipient.id));
                                 setSelectedRows(prev => { const next = new Set(prev); next.delete(recipient.id); return next; });
                                 toast({ title: "Recipient Deleted", description: `${recipient.firstName} removed.` });
                             }} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
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
                      No recipients found.
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
