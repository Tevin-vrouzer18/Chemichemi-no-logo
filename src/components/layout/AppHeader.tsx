import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Bell, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AppHeader() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [notifications, setNotifications] = useState(3); // Mock notification count
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Connection restored. Data will sync automatically.",
        variant: "default"
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "Working offline. Changes will sync when online.",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const handleSync = async () => {
    if (!isOnline) {
      toast({
        title: "Cannot Sync",
        description: "No internet connection available.",
        variant: "destructive"
      });
      return;
    }

    setSyncStatus('syncing');
    
    // Simulate sync process
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSyncStatus('success');
      toast({
        title: "Sync Complete",
        description: "All data has been synchronized successfully.",
        variant: "default"
      });
      
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      setSyncStatus('error');
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize data. Please try again.",
        variant: "destructive"
      });
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  return (
    <motion.header
      className="flex items-center justify-between p-4 bg-card border-b border-border shadow-card"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-4">
        <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground" />
        
        <div className="hidden sm:block">
          <h2 className="text-lg font-semibold text-foreground">
            Chemichemi Carwash
          </h2>
          <p className="text-sm text-muted-foreground">
            Business Management System
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Badge variant="outline" className="text-success border-success">
              <Wifi className="w-3 h-3 mr-1" />
              Online
            </Badge>
          ) : (
            <Badge variant="outline" className="text-warning border-warning">
              <WifiOff className="w-3 h-3 mr-1" />
              Offline
            </Badge>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Sync Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={!isOnline || syncStatus === 'syncing'}
          className="hidden sm:flex"
        >
          <RefreshCw 
            className={`w-4 h-4 mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} 
          />
          {syncStatus === 'syncing' ? 'Syncing...' : 'Sync'}
        </Button>

        {/* Notifications */}
        <Button variant="outline" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          {notifications > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs"
            >
              {notifications}
            </Badge>
          )}
        </Button>
      </div>
    </motion.header>
  );
}