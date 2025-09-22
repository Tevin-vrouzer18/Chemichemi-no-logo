import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Car } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        {/* Logo and Title */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-6 bg-gradient-primary rounded-full">
              <Car className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-foreground">
            Chemichemi Carwash
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline your carwash business with our comprehensive management platform. 
            Track customers, manage services, monitor inventory, and grow your business.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
          <div className="p-6 bg-gradient-card rounded-lg shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-2">Customer Management</h3>
            <p className="text-muted-foreground">Track customer profiles, vehicle history, and loyalty points</p>
          </div>
          <div className="p-6 bg-gradient-card rounded-lg shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-2">Business Analytics</h3>
            <p className="text-muted-foreground">Monitor revenue, expenses, and growth with detailed reports</p>
          </div>
          <div className="p-6 bg-gradient-card rounded-lg shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-2">Inventory Control</h3>
            <p className="text-muted-foreground">Manage supplies, track stock levels, and automate reorders</p>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-3">
              Get Started Today
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            Start managing your carwash business more efficiently
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;