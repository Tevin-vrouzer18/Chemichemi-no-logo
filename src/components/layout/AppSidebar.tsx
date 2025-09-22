import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Car,
  FileText,
  ShoppingBag,
  UserCheck,
  DollarSign,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Appointments", url: "/appointments", icon: Calendar },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Services", url: "/services", icon: Car },
  { title: "Service Records", url: "/service-records", icon: FileText },
  { title: "Expenses", url: "/expenses", icon: DollarSign },
  { title: "Inventory", url: "/inventory", icon: ShoppingBag },
  { title: "Employees", url: "/employees", icon: UserCheck },
  { title: "Growth", url: "/growth", icon: BarChart3 },
  { title: "Feedback", url: "/feedback", icon: MessageSquare },
];

const adminItems = [
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const currentPath = location.pathname;
  const { profile, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // The AuthContext will handle the redirect automatically
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    const active = isActive(path);
    return `flex items-center w-full text-left transition-all duration-200 ${
      active
        ? "bg-primary text-primary-foreground shadow-cyan"
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    }`;
  };

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 border-r border-border`}>
      <motion.div
        className="flex flex-col h-full bg-sidebar"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Chemichemi Carwash" 
              className="w-10 h-10 rounded-lg shadow-cyan animate-float"
            />
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-lg font-bold text-primary">Chemichemi</h1>
                <p className="text-xs text-muted-foreground">Carwash App</p>
              </motion.div>
            )}
          </div>
        </div>

        <SidebarContent className="flex-1">
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className={collapsed ? "hidden" : "block"}>
              Main Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {navigationItems.map((item, index) => (
                  <SidebarMenuItem key={item.title}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={getNavClassName(item.url)}>
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          {!collapsed && (
                            <span className="ml-3 font-medium">{item.title}</span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </motion.div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Admin Section */}
          {profile?.role === 'owner' && (
            <SidebarGroup>
              <SidebarGroupLabel className={collapsed ? "hidden" : "block"}>
                Admin
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {adminItems.map((item, index) => (
                    <SidebarMenuItem key={item.title}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (navigationItems.length + index) * 0.05 }}
                      >
                        <SidebarMenuButton asChild>
                          <NavLink to={item.url} className={getNavClassName(item.url)}>
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && (
                              <span className="ml-3 font-medium">{item.title}</span>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </motion.div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          {!collapsed && profile && (
            <motion.div
              className="mb-3 p-3 rounded-lg bg-sidebar-accent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-sm font-medium text-sidebar-accent-foreground">
                {profile.name}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {profile.role}
              </p>
            </motion.div>
          )}
          
          <Button
            variant="outline"
            size={collapsed ? "icon" : "default"}
            onClick={handleLogout}
            className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </motion.div>
    </Sidebar>
  );
}