'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Send, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

// Placeholder data - replace with actual data fetching
const recipientGroups = [
    { id: 'all', name: 'All Recipients (1250)', count: 1250 },
    { id: 'not_invited', name: 'Not Invited (400)', count: 400 },
    { id: 'invited_no_reply', name: 'Invited - No Reply (300)', count: 300 },
    { id: 'followup1_no_reply', name: 'Follow-up 1 - No Reply (150)', count: 150 },
];

const availableTemplates = [
    { id: 'invitation', name: 'Initial Invitation' },
    { id: 'followup1', name: 'Follow-Up (5 days)' },
    { id: 'followup2', name: 'Final Reminder (10 days)' },
];

export default function SchedulePage() {
  const [selectedGroup, setSelectedGroup] = useState<string>(recipientGroups[0].id);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(availableTemplates[0].id);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(new Date());
  const [scheduleTime, setScheduleTime] = useState<string>('09:00'); // HH:mm format
  const [isScheduling, setIsScheduling] = useState<boolean>(false);
  const [enableFollowUps, setEnableFollowUps] = useState<boolean>(true);
  const { toast } = useToast();

  const handleSchedule = async () => {
    if (!scheduleDate) {
      toast({ title: 'Date Required', description: 'Please select a date to schedule the emails.', variant: 'destructive' });
      return;
    }

    setIsScheduling(true);
    // Combine date and time
    const [hours, minutes] = scheduleTime.split(':');
    const scheduledDateTime = new Date(scheduleDate);
    scheduledDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);


    // Simulate API call for scheduling
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Scheduling emails:', {
      groupId: selectedGroup,
      templateId: selectedTemplate,
      dateTime: scheduledDateTime.toISOString(),
      followUpsEnabled: enableFollowUps,
    });

    // In a real app, call backend API:
    // try {
    //   const response = await fetch('/api/schedule-emails', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ groupId: selectedGroup, templateId: selectedTemplate, scheduleDateTime: scheduledDateTime.toISOString(), enableFollowUps }),
    //   });
    //   if (!response.ok) throw new Error('Scheduling failed');
    //   const result = await response.json();
    //   toast({ title: 'Emails Scheduled', description: `${result.count} emails scheduled for ${format(scheduledDateTime, 'PPP p')}.` });
    // } catch (error) {
    //   toast({ title: 'Scheduling Failed', description: error.message || 'Could not schedule emails.', variant: 'destructive' });
    // }

    const group = recipientGroups.find(g => g.id === selectedGroup);
    toast({ title: 'Emails Scheduled', description: `${group?.count || 0} emails using template "${availableTemplates.find(t=>t.id === selectedTemplate)?.name}" scheduled for ${format(scheduledDateTime, 'PPP p')}.` });

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
                 <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger id="recipient-group">
                    <SelectValue placeholder="Select recipient group" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipientGroups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-select">Email Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger id="template-select">
                    <SelectValue placeholder="Select email template" />
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
                        />
                      </PopoverContent>
                    </Popover>
                 </div>
                 <div className="space-y-2">
                      <Label htmlFor="schedule-time">Schedule Time</Label>
                      <Select value={scheduleTime} onValueChange={setScheduleTime}>
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
                 />
                 <Label htmlFor="enable-followups">Enable Automated Follow-ups</Label>
               </div>
                <p className="text-xs text-muted-foreground">
                   If enabled, non-responders will receive follow-up emails based on the configured sequence (e.g., 5 days, 10 days).
                </p>

            </CardContent>
            <CardFooter>
              <Button onClick={handleSchedule} disabled={isScheduling}>
                {isScheduling ? <Clock className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {isScheduling ? 'Scheduling...' : 'Schedule Email Send'}
              </Button>
            </CardFooter>
          </Card>

          <Card className="card-shadow rounded-corners">
             <CardHeader>
               <CardTitle>Scheduled Sends</CardTitle>
               <CardDescription>View upcoming and past email schedules.</CardDescription>
             </CardHeader>
             <CardContent>
               {/* Placeholder for displaying scheduled sends */}
               <p className="text-muted-foreground h-40 flex items-center justify-center">No scheduled sends yet.</p>
               {/* Example of how a scheduled item might look:
               <div className="border p-3 rounded mb-2">
                   <p className="font-medium">Initial Invitation to All Recipients</p>
                   <p className="text-sm text-muted-foreground">Scheduled for: {format(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), 'PPP p')}</p>
                   <p className="text-sm text-muted-foreground">Recipients: 1250</p>
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
