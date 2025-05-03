// src/app/schedule/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Send, Clock, Users, Loader2 } from 'lucide-react'; // Added Loader2
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { useAppData } from '@/context/AppDataContext'; // Import useAppData

export default function SchedulePage() {
  const { recipients, templates } = useAppData(); // Get data from context
  const { toast } = useToast();

  // Derive recipient groups and available templates from context data
  const recipientGroups = useMemo(() => {
      const groups = [
          { id: 'all', name: `All Recipients (${recipients.length})`, count: recipients.length },
          ...(['Not Invited', 'Invited', 'Follow-up 1', 'Follow-up 2', 'RSVPed', 'Declined'] as const).map(status => {
              const count = recipients.filter(r => r.status === status).length;
              return { id: status.toLowerCase().replace(' ', '_'), name: `${status} (${count})`, count };
          })
      ];
      // Example custom group: those invited but haven't responded
      const invitedNoReplyCount = recipients.filter(r => ['Invited', 'Follow-up 1', 'Follow-up 2'].includes(r.status)).length;
      groups.push({ id: 'invited_no_reply', name: `Invited - No Reply (${invitedNoReplyCount})`, count: invitedNoReplyCount });

      return groups.filter(g => g.id !== 'rsvped' && g.id !== 'declined'); // Exclude groups we typically don't send mass emails to
  }, [recipients]);

  const availableTemplates = useMemo(() => {
      return templates.map(t => ({ id: t.id, name: t.name }));
  }, [templates]);

  // State Management
  const [selectedGroup, setSelectedGroup] = useState<string>(recipientGroups.length > 0 ? recipientGroups[0].id : '');
  const [selectedTemplate, setSelectedTemplate] = useState<string>(availableTemplates.length > 0 ? availableTemplates[0].id : '');
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(new Date());
  const [scheduleTime, setScheduleTime] = useState<string>('09:00'); // HH:mm format
  const [isScheduling, setIsScheduling] = useState<boolean>(false);
  const [enableFollowUps, setEnableFollowUps] = useState<boolean>(true);


   // Update default selections when data loads
   React.useEffect(() => {
       if (!selectedGroup && recipientGroups.length > 0) {
           setSelectedGroup(recipientGroups[0].id);
       }
   }, [recipientGroups, selectedGroup]);

   React.useEffect(() => {
       if (!selectedTemplate && availableTemplates.length > 0) {
           setSelectedTemplate(availableTemplates[0].id);
       }
   }, [availableTemplates, selectedTemplate]);


  const handleSchedule = async () => {
    if (!scheduleDate) {
      toast({ title: 'Date Required', description: 'Please select a date to schedule the emails.', variant: 'destructive' });
      return;
    }
     if (!selectedGroup || !selectedTemplate) {
       toast({ title: 'Selection Required', description: 'Please select a recipient group and an email template.', variant: 'destructive' });
       return;
     }

    setIsScheduling(true);
    // Combine date and time
    const [hours, minutes] = scheduleTime.split(':');
    const scheduledDateTime = new Date(scheduleDate);
    scheduledDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    // Simulate API call for scheduling
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Find the selected group and template details for logging/toast
    const groupDetails = recipientGroups.find(g => g.id === selectedGroup);
    const templateDetails = availableTemplates.find(t => t.id === selectedTemplate);

    console.log('Scheduling emails:', {
      groupId: selectedGroup,
      groupName: groupDetails?.name,
      recipientCount: groupDetails?.count,
      templateId: selectedTemplate,
      templateName: templateDetails?.name,
      dateTime: scheduledDateTime.toISOString(),
      followUpsEnabled: enableFollowUps,
    });

    // Placeholder: Actual backend call would go here
    // try { ... } catch { ... }

    toast({
        title: 'Emails Scheduled (Simulated)',
        description: `${groupDetails?.count || 0} emails using template "${templateDetails?.name}" scheduled for ${format(scheduledDateTime, 'PPP p')}.`
    });

    setIsScheduling(false);
  };

  const timeOptions = Array.from({ length: 24 * 2 }, (_, i) => {
      const hour = Math.floor(i / 2);
      const minute = (i % 2) * 30;
      return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  });

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Schedule Emails</h1>
        <p className="text-muted-foreground">Configure and schedule bulk email sends for invitations and follow-ups.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
          <Card className="card-shadow rounded-corners">
            <CardHeader>
              <CardTitle>Schedule New Send</CardTitle>
              <CardDescription>Select recipients, template, and schedule time.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient-group">Recipient Group</Label>
                 <Select value={selectedGroup} onValueChange={setSelectedGroup} disabled={recipientGroups.length === 0}>
                  <SelectTrigger id="recipient-group" disabled={recipientGroups.length === 0}>
                    <SelectValue placeholder={recipientGroups.length === 0 ? "No groups available" : "Select recipient group"} />
                  </SelectTrigger>
                  <SelectContent>
                    {recipientGroups.map(group => (
                      <SelectItem key={group.id} value={group.id} disabled={group.count === 0}>
                        {group.name} {group.count === 0 ? '(Empty)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-select">Email Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate} disabled={availableTemplates.length === 0}>
                  <SelectTrigger id="template-select" disabled={availableTemplates.length === 0}>
                    <SelectValue placeholder={availableTemplates.length === 0 ? "No templates available" : "Select email template"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="schedule-date">Schedule Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !scheduleDate && "text-muted-foreground"
                          )}
                           disabled={isScheduling}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduleDate ? format(scheduleDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={scheduleDate}
                          onSelect={setScheduleDate}
                          initialFocus
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} // Disable past dates
                        />
                      </PopoverContent>
                    </Popover>
                 </div>
                 <div className="space-y-2">
                      <Label htmlFor="schedule-time">Schedule Time</Label>
                      <Select value={scheduleTime} onValueChange={setScheduleTime} disabled={isScheduling}>
                          <SelectTrigger id="schedule-time">
                              <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                              {timeOptions.map(time => (
                                  <SelectItem key={time} value={time}>
                                      {time}
                                  </SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                 </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                 <Switch
                   id="enable-followups"
                   checked={enableFollowUps}
                   onCheckedChange={setEnableFollowUps}
                   disabled={isScheduling}
                 />
                 <Label htmlFor="enable-followups">Enable Automated Follow-ups</Label>
               </div>
                <p className="text-xs text-muted-foreground">
                   If enabled, non-responders might receive follow-up emails based on system rules (feature placeholder).
                </p>

            </CardContent>
            <CardFooter>
              <Button
                 onClick={handleSchedule}
                 disabled={isScheduling || !selectedGroup || !selectedTemplate || !scheduleDate || (recipientGroups.find(g => g.id === selectedGroup)?.count ?? 0) === 0}
               >
                {isScheduling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {isScheduling ? 'Scheduling...' : 'Schedule Email Send'}
              </Button>
            </CardFooter>
          </Card>

          <Card className="card-shadow rounded-corners">
             <CardHeader>
               <CardTitle>Scheduled Sends</CardTitle>
               <CardDescription>View upcoming and past email schedules (placeholder).</CardDescription>
             </CardHeader>
             <CardContent>
               {/* Placeholder for displaying scheduled sends */}
               <div className="border border-dashed border-muted-foreground/50 p-6 rounded-md h-40 flex items-center justify-center">
                  <p className="text-muted-foreground text-center">No scheduled sends yet.<br/>Configure and schedule a send using the form.</p>
                </div>
               {/* Example structure for a scheduled item:
               <div className="border p-3 rounded mb-2 bg-card">
                   <p className="font-medium">Initial Invitation to Not Invited (400)</p>
                   <p className="text-sm text-muted-foreground">Scheduled for: {format(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), 'PPP p')}</p>
                   <div className="mt-2 flex gap-2">
                      <Button variant="outline" size="sm">Cancel</Button>
                      <Button variant="ghost" size="sm">View Details</Button>
                   </div>
               </div>
                */}
             </CardContent>
          </Card>

      </div>
    </div>
  );
}
