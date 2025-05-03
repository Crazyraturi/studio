import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Mail, Send, Users } from 'lucide-react';

export default function DashboardPage() {
  // Placeholder data - replace with actual data fetching
  const stats = {
    recipients: 1250,
    emailsSent: 850,
    openRate: '65%',
    rsvpRate: '22%',
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-secondary">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-primary">VBDA 2025 Dashboard</h1>
        <p className="text-muted-foreground">Overview of your invitation campaign.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="card-shadow rounded-corners">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recipients}</div>
            <p className="text-xs text-muted-foreground">Potential participants uploaded</p>
          </CardContent>
        </Card>
        <Card className="card-shadow rounded-corners">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emailsSent}</div>
            <p className="text-xs text-muted-foreground">Invitations dispatched</p>
          </CardContent>
        </Card>
        <Card className="card-shadow rounded-corners">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openRate}</div>
            <p className="text-xs text-muted-foreground">Based on tracked emails</p>
          </CardContent>
        </Card>
        <Card className="card-shadow rounded-corners">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RSVP Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.rsvpRate}</div>
            <p className="text-xs text-muted-foreground">Confirmed attendees</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         <Card className="card-shadow rounded-corners">
           <CardHeader>
             <CardTitle>Recent Activity</CardTitle>
           </CardHeader>
           <CardContent>
             {/* Placeholder for recent activity feed */}
             <p className="text-muted-foreground">No recent activity to display.</p>
           </CardContent>
         </Card>
         <Card className="card-shadow rounded-corners">
           <CardHeader>
             <CardTitle>Upcoming Schedules</CardTitle>
           </CardHeader>
           <CardContent>
             {/* Placeholder for upcoming email schedules */}
             <p className="text-muted-foreground">No upcoming schedules.</p>
           </CardContent>
         </Card>
      </div>
    </div>
  );
}
