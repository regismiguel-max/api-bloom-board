import { DashboardNav } from "@/components/DashboardNav";
import { KPICard } from "@/components/KPICard";
import { RevenueChart } from "@/components/RevenueChart";
import { SalesChart } from "@/components/SalesChart";
import { DataTable } from "@/components/DataTable";
import { DollarSign, Users, ShoppingCart, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      
      <main className="flex-1 md:ml-64 p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your business today.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Revenue"
            value="$45,231"
            change={20.1}
            trend="up"
            icon={DollarSign}
          />
          <KPICard
            title="Active Users"
            value="2,350"
            change={12.5}
            trend="up"
            icon={Users}
          />
          <KPICard
            title="Total Orders"
            value="1,234"
            change={-5.2}
            trend="down"
            icon={ShoppingCart}
          />
          <KPICard
            title="Conversion Rate"
            value="3.24%"
            change={8.3}
            trend="up"
            icon={TrendingUp}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-3">
          <RevenueChart />
          <SalesChart />
        </div>

        {/* Data Table */}
        <div className="grid gap-6 lg:grid-cols-3">
          <DataTable />
        </div>
      </main>
    </div>
  );
};

export default Index;
