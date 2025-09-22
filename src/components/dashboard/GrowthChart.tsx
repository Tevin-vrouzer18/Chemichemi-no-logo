import { useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, BarChart3, LineChart as LineChartIcon } from "lucide-react";
import { Currency } from "@/components/ui/currency";
import { DailyMetrics } from "@/lib/database";

interface GrowthChartProps {
  data: DailyMetrics[];
}

export function GrowthChart({ data }: GrowthChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Calculate growth trends
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const latestMetrics = data[data.length - 1];
  const previousMetrics = data[data.length - 2];
  
  const revenueGrowth = previousMetrics 
    ? calculateGrowth(latestMetrics?.revenue || 0, previousMetrics.revenue)
    : 0;
  
  const washGrowth = previousMetrics 
    ? calculateGrowth(latestMetrics?.washCount || 0, previousMetrics.washCount)
    : 0;

  // Format data for charts
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }),
    revenue: item.revenue,
    expenses: item.expenses,
    netProfit: item.netProfit,
    washes: item.washCount,
    customers: item.customerCount,
    rating: item.averageRating
  }));

  // Filter data based on time range
  const getFilteredData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return chartData.slice(-days);
  };

  const filteredData = getFilteredData();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-medium text-foreground">
                {entry.name.includes('revenue') || entry.name.includes('expense') || entry.name.includes('profit') 
                  ? `KES ${entry.value.toLocaleString()}` 
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Business Growth Tracking
            </CardTitle>
            <CardDescription>
              Daily performance metrics and growth trajectory
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              <LineChartIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Growth Indicators */}
        <div className="flex flex-wrap gap-4 mt-4">
          <Badge 
            variant="outline" 
            className={`${revenueGrowth >= 0 ? 'text-profit border-profit' : 'text-expense border-expense'}`}
          >
            {revenueGrowth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            Revenue: {revenueGrowth.toFixed(1)}%
          </Badge>
          <Badge 
            variant="outline" 
            className={`${washGrowth >= 0 ? 'text-profit border-profit' : 'text-expense border-expense'}`}
          >
            {washGrowth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            Washes: {washGrowth.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="financial" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full grid-cols-3 sm:w-auto">
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button
                variant={timeRange === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('7d')}
              >
                7D
              </Button>
              <Button
                variant={timeRange === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('30d')}
              >
                30D
              </Button>
              <Button
                variant={timeRange === '90d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('90d')}
              >
                90D
              </Button>
            </div>
          </div>

          <TabsContent value="financial" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `${value.toLocaleString()}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      name="Revenue (KES)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="hsl(var(--expense))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--expense))", strokeWidth: 2, r: 3 }}
                      name="Expenses (KES)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="netProfit" 
                      stroke="hsl(var(--profit))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--profit))", strokeWidth: 2, r: 3 }}
                      name="Net Profit (KES)"
                    />
                    <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  </LineChart>
                ) : (
                  <BarChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `${value.toLocaleString()}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue (KES)" />
                    <Bar dataKey="expenses" fill="hsl(var(--expense))" name="Expenses (KES)" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </motion.div>
          </TabsContent>

          <TabsContent value="operations" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="washes" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      name="Cars Washed"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="customers" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 3 }}
                      name="Customers Served"
                    />
                  </LineChart>
                ) : (
                  <BarChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="washes" fill="hsl(var(--primary))" name="Cars Washed" />
                    <Bar dataKey="customers" fill="hsl(var(--success))" name="Customers Served" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </motion.div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    domain={[0, 5]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="rating" 
                    stroke="hsl(var(--warning))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--warning))", strokeWidth: 2, r: 4 }}
                    name="Average Rating"
                  />
                  <ReferenceLine y={4} stroke="hsl(var(--success))" strokeDasharray="3 3" label="Target" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}