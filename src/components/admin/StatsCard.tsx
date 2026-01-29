import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'destructive';
  loading?: boolean;
}

const variantStyles = {
  primary: 'gradient-primary',
  secondary: 'gradient-secondary',
  accent: 'gradient-accent',
  success: 'gradient-success',
  destructive: 'bg-destructive',
};

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = 'primary',
  loading = false 
}: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden border-border/50 hover:border-primary/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-3xl font-bold">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            )}
            {trend && !loading && (
              <p className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-500" : "text-destructive"
              )}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
              </p>
            )}
          </div>
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center",
            variantStyles[variant]
          )}>
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
      </CardContent>
      {/* Decorative gradient line at bottom */}
      <div className={cn("absolute bottom-0 left-0 right-0 h-1", variantStyles[variant])} />
    </Card>
  );
}
