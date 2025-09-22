import { cn } from "@/lib/utils";

interface CurrencyProps {
  amount: number;
  className?: string;
  showSign?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Currency({ amount, className, showSign = false, size = 'md' }: CurrencyProps) {
  const isPositive = amount >= 0;
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(value));
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const getColorClass = () => {
    if (showSign) {
      return isPositive ? 'text-profit' : 'text-expense';
    }
    return 'text-currency';
  };

  return (
    <span className={cn(
      "font-semibold tabular-nums",
      sizeClasses[size],
      getColorClass(),
      className
    )}>
      {showSign && !isPositive && '-'}
      {showSign && isPositive && '+'}
      {formatAmount(amount)}
    </span>
  );
}

// Helper component for displaying KES amounts with proper formatting
export function KESAmount({ 
  amount, 
  className,
  prefix,
  suffix
}: { 
  amount: number; 
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <span className={cn("text-currency font-medium", className)}>
      {prefix && <span className="text-muted-foreground mr-1">{prefix}</span>}
      KES {amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      {suffix && <span className="text-muted-foreground ml-1">{suffix}</span>}
    </span>
  );
}