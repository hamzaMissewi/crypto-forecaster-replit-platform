import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PriceCardProps {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap?: number;
  onClick?: () => void;
}

export function PriceCard({ name, symbol, price, change24h, marketCap, onClick }: PriceCardProps) {
  const isPositive = change24h >= 0;

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      className="glass-card p-5 rounded-2xl cursor-pointer hover:border-primary/30 group relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className={cn(
        "absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-10 transition-colors duration-500",
        isPositive ? "bg-green-500" : "bg-red-500"
      )} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-lg border border-white/10 group-hover:border-primary/50 transition-colors">
            {symbol.substring(0, 1)}
          </div>
          <div>
            <h3 className="font-bold text-lg leading-none">{name}</h3>
            <span className="text-xs text-muted-foreground uppercase">{symbol}</span>
          </div>
        </div>
        <div className={cn(
          "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border",
          isPositive 
            ? "bg-green-500/10 text-green-400 border-green-500/20" 
            : "bg-red-500/10 text-red-400 border-red-500/20"
        )}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change24h).toFixed(2)}%
        </div>
      </div>

      <div className="relative z-10">
        <div className="text-2xl font-display font-bold mb-1">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)}
        </div>
        {marketCap && (
          <div className="text-xs text-muted-foreground">
            MCap: ${(marketCap / 1e9).toFixed(2)}B
          </div>
        )}
      </div>
    </motion.div>
  );
}
