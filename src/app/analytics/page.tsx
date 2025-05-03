'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Mail, CheckCircle, XCircle, Users, Send } from 'lucide-react';

// Placeholder data - replace with actual data fetching and processing
const overallStats = {
  totalSent: 850,
  openRate: 65.2,
  clickRate: 15.8,
  rsvpRate: 22.1,
  declineRate: 5.3,
};

const campaignPerformanceData = [
  { name: 'Invitation', sent: 850, opened: 554, clicked: 134, rsvped: 188 },
  { name: 'Follow-up 1', sent: 296, opened: 150, clicked: 45, rsvped: 65 },
  { name: 'Follow-up 2', sent: 146, opened: 60, clicked: 20, rsvped: 30 },
];

const rsvpStatusData = [
  { name: 'RSVPed', value: Math.round(overallStats.totalSent * (overallStats.rsvpRate / 100)) },
  { name: 'Declined', value: Math.round(overallStats.totalSent * (overallStats.declineRate / 100)) },
  { name: 'No Response', value: overallStats.totalSent - Math.round(overallStats.totalSent * (overallStats.rsvpRate / 100)) - Math.round(overallStats.totalSent * (overallStats.declineRate / 100)) },
];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--destructive))', 'hsl(var(--muted))']; // Corresponds to RSVPed, Declined, No Response

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Campaign Analytics</h1>
        <p className="text-muted-foreground">Track the performance of your VBDA 2025 invitation campaign.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="card-shadow rounded-corners">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalSent}</div>
          </CardContent>
        </Card>
        <Card className="card-shadow rounded-corners">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Open Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.openRate}%</div>
          </CardContent>
        </Card>
        <Card className="card-shadow rounded-corners">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall RSVP Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{overallStats.rsvpRate}%</div>
             <p className="text-xs text-muted-foreground">{rsvpStatusData[0].value} Confirmed</p>
          </CardContent>
        </Card>
         <Card className="card-shadow rounded-corners">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Declined Rate</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.declineRate}%</div>
             <p className="text-xs text-muted-foreground">{rsvpStatusData[1].value} Declined</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-shadow rounded-corners">
          <CardHeader>
            <CardTitle>Campaign Funnel Performance</CardTitle>
            <CardDescription>Performance metrics for each stage of the email sequence.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                   contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                   itemStyle={{ color: 'hsl(var(--foreground))' }}
                   cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.1 }}
                />
                <Legend wrapperStyle={{fontSize: '12px'}}/>
                <Bar dataKey="sent" fill="hsl(var(--chart-1))" name="Sent" radius={[4, 4, 0, 0]} />
                <Bar dataKey="opened" fill="hsl(var(--chart-2))" name="Opened" radius={[4, 4, 0, 0]}/>
                <Bar dataKey="clicked" fill="hsl(var(--chart-3))" name="Clicked" radius={[4, 4, 0, 0]}/>
                 <Bar dataKey="rsvped" fill="hsl(var(--chart-4))" name="RSVPed" radius={[4, 4, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-shadow rounded-corners">
          <CardHeader>
            <CardTitle>RSVP Status Distribution</CardTitle>
             <CardDescription>Breakdown of recipient responses.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center">
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
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}

                >
                  {rsvpStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                 <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value, name) => [`${value} (${((value / overallStats.totalSent) * 100).toFixed(1)}%)`, name]}
                 />
                 <Legend wrapperStyle={{fontSize: '12px'}}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
