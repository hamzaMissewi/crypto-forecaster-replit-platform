import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useCryptoHistory } from '@/hooks/use-crypto';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface CryptoChartProps {
  coinId: string;
  color?: string;
  height?: number;
}

export function CryptoChart({ coinId, color = "#00f0ff", height = 300 }: CryptoChartProps) {
  const { data, isLoading } = useCryptoHistory(coinId);

  if (isLoading) {
    return <Skeleton className="w-full rounded-xl bg-white/5" style={{ height }} />;
  }

  if (!data?.prices) {
    return (
      <div className="w-full flex items-center justify-center rounded-xl bg-white/5 text-muted-foreground" style={{ height }}>
        No chart data available
      </div>
    );
  }

  const chartData = data.prices.map(([timestamp, price]) => ({
    date: timestamp,
    price: price,
  }));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'MMM d');
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`gradient-${coinId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            stroke="rgba(255,255,255,0.3)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis 
            domain={['auto', 'auto']}
            tickFormatter={(val) => `$${val.toLocaleString()}`}
            stroke="rgba(255,255,255,0.3)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: number) => [formatPrice(value), 'Price']}
            labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy h:mm a')}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${coinId})`}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
