import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Car, User, DollarSign, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Currency } from "@/components/ui/currency";
import { db, Appointment, Payment } from "@/lib/database";

interface ActivityItem {
  id: string;
  type: 'appointment' | 'payment' | 'completion';
  title: string;
  description: string;
  amount?: number;
  time: Date;
  status?: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentActivity();
  }, []);

  const loadRecentActivity = async () => {
    try {
      // Get recent appointments
      const recentAppointments = await db.appointments
        .orderBy('createdAt')
        .reverse()
        .limit(5)
        .toArray();

      // Get recent payments
      const recentPayments = await db.payments
        .orderBy('date')
        .reverse()
        .limit(5)
        .toArray();

      // Combine and format activities
      const activityItems: ActivityItem[] = [];

      // Add appointments
      for (const apt of recentAppointments) {
        const customer = await db.customers.get(apt.customerId);
        const service = await db.services.get(apt.serviceId);
        
        activityItems.push({
          id: `apt-${apt.id}`,
          type: apt.status === 'completed' ? 'completion' : 'appointment',
          title: apt.status === 'completed' ? 'Service Completed' : 'New Appointment',
          description: `${customer?.name || 'Unknown'} - ${service?.name || 'Service'}`,
          amount: apt.totalAmount,
          time: apt.createdAt,
          status: apt.status
        });
      }

      // Add payments
      for (const payment of recentPayments) {
        const appointment = await db.appointments.get(payment.appointmentId);
        const customer = appointment ? await db.customers.get(appointment.customerId) : null;
        
        activityItems.push({
          id: `pay-${payment.id}`,
          type: 'payment',
          title: 'Payment Received',
          description: `${customer?.name || 'Customer'} - ${payment.method}`,
          amount: payment.amount,
          time: payment.date,
          status: payment.status
        });
      }

      // Sort by time and take latest 8
      activityItems.sort((a, b) => b.time.getTime() - a.time.getTime());
      setActivities(activityItems.slice(0, 8));

    } catch (error) {
      console.error('Error loading recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Car className="w-4 h-4 text-primary" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-profit" />;
      case 'completion':
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const variants: Record<string, { variant: any; color: string }> = {
      completed: { variant: 'default', color: 'text-success border-success' },
      'in-progress': { variant: 'outline', color: 'text-warning border-warning' },
      scheduled: { variant: 'outline', color: 'text-primary border-primary' },
      cancelled: { variant: 'outline', color: 'text-destructive border-destructive' },
      pending: { variant: 'outline', color: 'text-warning border-warning' },
    };

    const statusStyle = variants[status] || variants.scheduled;
    
    return (
      <Badge variant={statusStyle.variant} className={statusStyle.color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest business activities and updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Activities will appear here as they happen</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.title}
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(activity.time)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      {activity.amount && (
                        <Currency amount={activity.amount} size="sm" />
                      )}
                      {activity.status && getStatusBadge(activity.status)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}