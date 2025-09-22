import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Calendar, 
  Users, 
  Car, 
  DollarSign, 
  Package,
  UserPlus,
  FileText,
  Zap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const quickActions = [
  {
    title: "New Appointment",
    description: "Schedule a car wash",
    icon: Calendar,
    route: "/appointments",
    action: "new-appointment",
    color: "primary",
    shortcut: "A"
  },
  {
    title: "Add Customer",
    description: "Register new customer",
    icon: UserPlus,
    route: "/customers",
    action: "new-customer",
    color: "success",
    shortcut: "C"
  },
  {
    title: "Record Expense",
    description: "Log business expense",
    icon: DollarSign,
    route: "/expenses",
    action: "new-expense",
    color: "expense",
    shortcut: "E"
  },
  {
    title: "Update Inventory",
    description: "Manage stock levels",
    icon: Package,
    route: "/inventory",
    action: "new-inventory",
    color: "warning",
    shortcut: "I"
  },
  {
    title: "New Service",
    description: "Add wash service",
    icon: Car,
    route: "/services",
    action: "new-service",
    color: "primary",
    shortcut: "S"
  },
  {
    title: "View Growth",
    description: "Business analytics",
    icon: FileText,
    route: "/growth",
    action: "view-growth",
    color: "secondary",
    shortcut: "R"
  }
];

export function QuickActions() {
  const navigate = useNavigate();

  const handleAction = (route: string, action?: string) => {
    navigate(route);
    // Store action in session for the target page to handle
    if (action) {
      sessionStorage.setItem('quickAction', action);
    }
  };

  const getButtonVariant = (color: string) => {
    switch (color) {
      case 'primary': return 'default';
      case 'success': return 'outline';
      case 'expense': return 'outline';
      case 'warning': return 'outline';
      case 'secondary': return 'outline';
      default: return 'outline';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'primary': return 'text-primary-foreground';
      case 'success': return 'text-success';
      case 'expense': return 'text-expense';
      case 'warning': return 'text-warning';
      case 'secondary': return 'text-secondary-foreground';
      default: return 'text-foreground';
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Frequently used features for faster workflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={getButtonVariant(action.color)}
                onClick={() => handleAction(action.route, action.action)}
                className="h-auto p-4 flex flex-col items-center gap-3 w-full group hover:shadow-md transition-all duration-200"
              >
                <div className={`p-2 rounded-lg bg-background/10 group-hover:bg-background/20 transition-colors`}>
                  <action.icon className={`w-6 h-6 ${action.color === 'primary' ? 'text-primary-foreground' : getIconColor(action.color)}`} />
                </div>
                
                <div className="text-center">
                  <div className="font-medium text-sm leading-tight">
                    {action.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    {action.description}
                  </div>
                </div>

                {/* Keyboard shortcut indicator */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-xs bg-background/20 px-1.5 py-0.5 rounded text-muted-foreground">
                    {action.shortcut}
                  </div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="mt-6 p-3 rounded-lg bg-secondary/30 border border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border border-muted-foreground rounded text-xs flex items-center justify-center">
              ⌘
            </div>
            <span>Use keyboard shortcuts for faster access</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}