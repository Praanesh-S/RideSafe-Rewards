import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "primary" | "accent" | "secondary";
}

export const StatsCard = ({ title, value, icon: Icon, trend, color = "primary" }: StatsCardProps) => {
  const colorClasses = {
    primary: "text-primary",
    accent: "text-accent",
    secondary: "text-muted-foreground"
  };

  return (
    <Card className="glass p-6 hover:card-glow transition-all duration-300 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold mb-2">{value}</h3>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg bg-card`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};
