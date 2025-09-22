import { motion } from "framer-motion";
import { BarChart3, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Reports() {
  return (
    <motion.div
      className="space-y-6 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Reports
          </h1>
          <p className="text-muted-foreground">
            Generate business reports and analytics
          </p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Business Reports</CardTitle>
          <CardDescription>
            Comprehensive reporting and data analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Report generation coming soon</p>
              <p className="text-sm">This will include financial reports, performance analytics, and custom reports</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}