import { useCryptoMarket } from "@/hooks/use-crypto";
import { CryptoChart } from "@/components/CryptoChart";
import { PriceCard } from "@/components/PriceCard";
import { Loader2, TrendingUp, Zap, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: marketData, isLoading } = useCryptoMarket();
  // console.log(marketData);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48 bg-white/5" />
          <Skeleton className="h-10 w-32 bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl bg-white/5" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (!marketData) return null;

  const topCoin = marketData[0]; // Usually Bitcoin
  const topMovers = [...marketData].sort((a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h)).slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Market Dashboard</h1>
          <p className="text-muted-foreground">Real-time overview of the crypto market.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-pulse">
          <div className="w-2 h-2 rounded-full bg-primary" />
          Live Market Data
        </div>
      </div>

      {/* Featured Chart */}
      <div className="glass-card p-6 rounded-2xl border-white/5">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
              <span className="text-xl font-bold text-orange-500">{topCoin.symbol.toUpperCase()[0]}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">{topCoin.name} Price Action</h2>
              <div className="text-sm text-muted-foreground">Last 7 Days</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold font-display">
              ${topCoin.current_price.toLocaleString()}
            </div>
            <div className={`text-sm font-medium ${topCoin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {topCoin.price_change_percentage_24h >= 0 ? '+' : ''}{topCoin.price_change_percentage_24h.toFixed(2)}%
            </div>
          </div>
        </div>
        <CryptoChart coinId={topCoin.id} color="#f7931a" height={350} />
      </div>

      {/* Top Movers Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4 text-lg font-semibold">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h3>Top Movers (24h)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topMovers.map((coin) => (
            <PriceCard
              key={coin.id}
              name={coin.name}
              symbol={coin.symbol}
              price={coin.current_price}
              change24h={coin.price_change_percentage_24h}
              marketCap={coin.market_cap}
            />
          ))}
        </div>
      </div>

      {/* Market Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Market Dominance</h3>
          </div>
          <div className="space-y-4">
            {marketData.slice(0, 5).map((coin, idx) => (
              <div key={coin.id} className="flex items-center gap-4">
                <span className="w-6 text-sm text-muted-foreground">#{idx + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{coin.name}</span>
                    <span className="text-sm text-muted-foreground">${(coin.market_cap / 1e9).toFixed(1)}B</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(coin.market_cap / marketData[0].market_cap) * 100}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className="h-full bg-primary/50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-lg">Trending Assets</h3>
          </div>
          <div className="space-y-3">
            {marketData.slice(5, 10).map((coin) => (
              <div key={coin.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold group-hover:border-accent/50 transition-colors">
                    {coin.symbol[0].toUpperCase()}
                  </div>
                  <span className="font-medium">{coin.name}</span>
                </div>
                <div className={`text-sm font-medium ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
