import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Car, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Package,
  AlertTriangle,
  Star
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Currency, KESAmount } from "@/components/ui/currency";
import { GrowthChart } from "@/components/dashboard/GrowthChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useSupabaseQuery } from "@/hooks/useSupabase";
import { useRealTimeMetrics } from "@/hooks/useRealTimeMetrics";

interface DashboardStats {
  todayRevenue: number;
  todayWashes: number;
  todayCustomers: number;
  todayExpenses: number;
  totalCustomers: number;
  activeEmployees: number;
  lowStockItems: number;
  averageRating: number;
  monthlyGrowth: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayWashes: 0,
    todayCustomers: 0,
    todayExpenses: 0,
    totalCustomers: 0,
    activeEmployees: 0,
    lowStockItems: 0,
    averageRating: 0,
    monthlyGrowth: 0
  });

  // Real-time data from Supabase
  const { data: customers } = useSupabaseQuery('customers');
  const { data: services } = useSupabaseQuery('services');
  const { data: expenses } = useSupabaseQuery('expenses');
  const { data: inventory } = useSupabaseQuery('inventory');
  const { data: employees } = useSupabaseQuery('employees');
  const { data: feedback } = useSupabaseQuery('feedback');
  const { data: appointments } = useSupabaseQuery('appointments');
  
  // Real-time calculated metrics for growth chart
  const { data: growthData, loading: metricsLoading } = useRealTimeMetrics();

  const loading = !customers || !services || !expenses || !inventory || !employees || !feedback || !appointments || metricsLoading;

  useEffect(() => {
    if (!loading) {
      // Get today's data
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      // Calculate today's metrics
      const todayAppointments = appointments?.filter(app => {
        const appointmentDate = new Date(app.scheduled_date).toISOString().split('T')[0];
        return appointmentDate === todayString && app.status === 'completed';
      }) || [];

      const todayCustomers = customers?.filter(customer => 
        customer.last_visit === todayString
      ).length || 0;

      const todayExpenses = expenses?.filter(expense => 
        expense.expense_date === todayString
      ) || [];

      // Calculate aggregated stats
      const activeEmployees = employees?.filter(emp => emp.is_active).length || 0;
      const lowStockItems = inventory?.filter(item => item.current_stock <= item.minimum_stock).length || 0;
      
      const averageRating = feedback?.length > 0 
        ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length 
        : 0;

      // Calculate today's revenue
      const todayRevenue = todayAppointments.reduce((sum, app) => sum + (app.total_amount || 0), 0);
      const todayExpensesTotal = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

      // Calculate monthly growth (simplified)
      const monthlyGrowth = 12.5; // Placeholder

      setStats({
        todayRevenue,
        todayWashes: todayAppointments.length,
        todayCustomers,
        todayExpenses: todayExpensesTotal,
        totalCustomers: customers?.length || 0,
        activeEmployees,
        lowStockItems,
        averageRating,
        monthlyGrowth,
      });
    }
  }, [customers, services, expenses, inventory, employees, feedback, appointments, loading]);

  const statCards = [
    {
      title: "Today's Revenue",
      value: <Currency amount={stats.todayRevenue} size="xl" />,
      description: "Total earnings today",
      icon: DollarSign,
      trend: stats.monthlyGrowth > 0 ? "up" : "down",
      trendValue: `${Math.abs(stats.monthlyGrowth).toFixed(1)}%`,
      color: "profit"
    },
    {
      title: "Cars Washed",
      value: stats.todayWashes,
      description: "Completed today",
      icon: Car,
      trend: "up",
      trendValue: `${stats.todayWashes} today`,
      color: "primary"
    },
    {
      title: "Customers Served",
      value: stats.todayCustomers,
      description: `${stats.totalCustomers} total customers`,
      icon: Users,
      trend: "up",
      trendValue: `${stats.todayCustomers} today`,
      color: "primary"
    },
    {
      title: "Today's Expenses",
      value: <Currency amount={stats.todayExpenses} size="xl" />,
      description: "Operating costs",
      icon: TrendingUp,
      trend: "neutral",
      trendValue: "Daily tracking",
      color: "expense"
    }
  ];

  const quickStats = [
    {
      label: "Active Employees",
      value: stats.activeEmployees,
      icon: Users,
      color: "success"
    },
    {
      label: "Low Stock Items",
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: stats.lowStockItems > 0 ? "warning" : "success"
    },
    {
      label: "Average Rating",
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: stats.averageRating >= 4 ? "success" : "warning"
    },
    {
      label: "Net Profit Today",
      value: <Currency amount={stats.todayRevenue - stats.todayExpenses} showSign />,
      icon: DollarSign,
      color: (stats.todayRevenue - stats.todayExpenses) >= 0 ? "profit" : "expense"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening at your carwash today.
          </p>
        </div>
        <Badge variant="outline" className="text-primary border-primary w-fit">
          <Calendar className="w-4 h-4 mr-2" />
          {new Date().toLocaleDateString('en-KE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Badge>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="bg-gradient-card shadow-card hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {stat.trend === "up" && <TrendingUp className="w-3 h-3 mr-1 text-profit" />}
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Quick Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {quickStats.map((stat, index) => (
                <div key={stat.label} className="text-center p-4 rounded-lg bg-secondary/50">
                  <stat.icon className={`w-6 h-6 mx-auto mb-2 text-${stat.color}`} />
                  <div className="text-lg font-semibold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <GrowthChart data={growthData || []} />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <RecentActivity />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <QuickActions />
      </motion.div>
    </motion.div>
  );
}