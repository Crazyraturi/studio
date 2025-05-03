// src/app/analytics/page.tsx
'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Mail, CheckCircle, XCircle, Users, Send } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext'; // Import useAppData

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--destructive))', 'hsl(var(--muted))']; // Corresponds to RSVPed, Declined, No Response/Other

export default function AnalyticsPage() {
  const { recipients } = useAppData(); // Get recipients from context

  // Calculate analytics data based on recipients
  const { overallStats, campaignPerformanceData, rsvpStatusData } = useMemo(() => {
    const totalRecipients = recipients.length;

    // Simulate sent/opened/clicked for now - replace with real tracking data
    const totalSent = Math.min(totalRecipients, 850); // Placeholder
    const totalOpened = Math.round(totalSent * 0.652); // Placeholder
    const totalClicked = Math.round(totalSent * 0.158); // Placeholder

    const rsvpedCount = recipients.filter(r => r.status === 'RSVPed').length;
    const declinedCount = recipients.filter(r => r.status === 'Declined').length;
    const invitedCount = recipients.filter(r => r.status === 'Invited' || r.status === 'Follow-up 1' || r.status === 'Follow-up 2').length;
    const notInvitedCount = recipients.filter(r => r.status === 'Not Invited').length;

    const overall = {
      totalSent: totalSent, // Using placeholder for sent count
      openRate: totalSent > 0 ? parseFloat(((totalOpened / totalSent) * 100).toFixed(1)) : 0,
      clickRate: totalSent > 0 ? parseFloat(((totalClicked / totalSent) * 100).toFixed(1)) : 0,
      rsvpRate: totalSent > 0 ? parseFloat(((rsvpedCount / totalSent) * 100).toFixed(1)) : 0, // Rate based on sent
      declineRate: totalSent > 0 ? parseFloat(((declinedCount / totalSent) * 100).toFixed(1)) : 0, // Rate based on sent
      totalRecipients: totalRecipients, // Add total recipients for context
      rsvpedCount: rsvpedCount,
      declinedCount: declinedCount,
    };

    // Placeholder for campaign stage performance - needs real tracking data
    const campaignData = [
      { name: 'Invitation', sent: totalSent, opened: totalOpened, clicked: totalClicked, rsvped: rsvpedCount + declinedCount }, // Example grouping
      // Add more stages if tracked (e.g., follow-ups)
      // { name: 'Follow-up 1', sent: invitedCount, opened: Math.round(invitedCount * 0.5), clicked: Math.round(invitedCount * 0.15), rsvped: 65 },
      // { name: 'Follow-up 2', sent: ..., opened: ..., clicked: ..., rsvped: ... },
    ];

    const noResponseCount = totalSent - rsvpedCount - declinedCount;
    const rsvpData = [
      { name: 'RSVPed', value: rsvpedCount },
      { name: 'Declined', value: declinedCount },
      // Group other statuses (Invited, Follow-ups, Not Invited if part of 'sent') as 'No Response' for simplicity
      { name: 'Awaiting Response', value: Math.max(0, noResponseCount) },
    ];


    return { overallStats: overall, campaignPerformanceData: campaignData, rsvpStatusData: rsvpData };
  }, [recipients]);


  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Campaign Analytics</h1>
        <p className="text-muted-foreground">Track the performance of your VBDA 2025 invitation campaign.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
         <Card className="card-shadow rounded-corners">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalRecipients}</div>
            <p className="text-xs text-muted-foreground">In the system</p>
          </CardContent>
        </Card>
        <Card className="card-shadow rounded-corners">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent (Simulated)</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalSent}</div>
             <p className="text-xs text-muted-foreground">Placeholder value</p>
          </CardContent>
        </Card>
        <Card className="card-shadow rounded-corners">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall RSVP Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{overallStats.rsvpRate}%</div>
             <p className="text-xs text-muted-foreground">{overallStats.rsvpedCount} Confirmed Attendees</p>
          </CardContent>
        </Card>
         <Card className="card-shadow rounded-corners">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Declined Rate</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.declineRate}%</div>
             <p className="text-xs text-muted-foreground">{overallStats.declinedCount} Declined Invitations</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-shadow rounded-corners">
          <CardHeader>
            <CardTitle>Campaign Funnel Performance (Simulated)</CardTitle>
            <CardDescription>Performance metrics for the main invitation send.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false}/>
                <Tooltip
                   contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                   itemStyle={{ color: 'hsl(var(--foreground))' }}
                   cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.1 }}
                />
                <Legend wrapperStyle={{fontSize: '12px'}}/>
                <Bar dataKey="sent" fill="hsl(var(--chart-1))" name="Sent" radius={[4, 4, 0, 0]} />
                <Bar dataKey="opened" fill="hsl(var(--chart-2))" name="Opened" radius={[4, 4, 0, 0]}/>
                <Bar dataKey="clicked" fill="hsl(var(--chart-3))" name="Clicked" radius={[4, 4, 0, 0]}/>
                 <Bar dataKey="rsvped" fill="hsl(var(--chart-4))" name="Responded (RSVP/Decline)" radius={[4, 4, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-shadow rounded-corners">
          <CardHeader>
            <CardTitle>Response Status Distribution</CardTitle>
             <CardDescription>Breakdown of recipient responses based on current status.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center">
             {rsvpStatusData.reduce((sum, item) => sum + item.value, 0) > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rsvpStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent, value }) => value > 0 ? `${name}: ${(percent * 100).toFixed(1)}%` : null}
                      filter={entry => entry.value > 0} // Don't render segments with 0 value
                    >
                      {rsvpStatusData
                        .filter(entry => entry.value > 0) // Filter out zero-value entries for cells
                        .map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="hsl(var(--background))" strokeWidth={2} />
                      ))}
                    </Pie>
                     <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                        formatter={(value: number, name: string) => {
                            const totalResponses = rsvpStatusData.reduce((sum, item) => sum + item.value, 0);
                            const percentage = totalResponses > 0 ? ((value / totalResponses) * 100).toFixed(1) : 0;
                            return [`${value} (${percentage}%)`, name];
                        }}
                     />
                     <Legend wrapperStyle={{fontSize: '12px'}}/>
                  </PieChart>
                </ResponsiveContainer>
             ) : (
                 <p className="text-muted-foreground">No response data to display.</p>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
