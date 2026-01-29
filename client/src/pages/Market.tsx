import { useCryptoMarket, useAddFavorite, useFavorites, useRemoveFavorite } from "@/hooks/use-crypto";
import { Input } from "@/components/ui/input";
import { Search, Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Market() {
  const { data: coins, isLoading } = useCryptoMarket();
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const { data: favorites } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const { toast } = useToast();

  const filteredCoins = coins?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFavorite = async (e: React.MouseEvent, coin: any) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to save favorites.",
        variant: "destructive",
      });
      return;
    }

    const existing = favorites?.find(f => f.symbol === coin.symbol);
    
    try {
      if (existing) {
        await removeFavorite.mutateAsync(existing.id);
        toast({ title: "Removed from favorites" });
      } else {
        await addFavorite.mutateAsync({ 
          symbol: coin.symbol, 
          name: coin.name, 
          userId: user.id // In a real app, this should probably be handled by backend from session
        });
        toast({ title: "Added to favorites" });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to update favorites.", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Market Overview</h1>
          <p className="text-muted-foreground">Track prices, volume, and market cap.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search coins..." 
            className="pl-10 bg-white/5 border-white/10 focus:border-primary/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 pl-6 font-medium text-muted-foreground w-12">#</th>
                <th className="p-4 font-medium text-muted-foreground">Asset</th>
                <th className="p-4 font-medium text-muted-foreground text-right">Price</th>
                <th className="p-4 font-medium text-muted-foreground text-right">24h Change</th>
                <th className="p-4 font-medium text-muted-foreground text-right hidden md:table-cell">Market Cap</th>
                <th className="p-4 pr-6 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="p-4"><Skeleton className="h-4 w-4 bg-white/5" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-32 bg-white/5" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-20 ml-auto bg-white/5" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16 ml-auto bg-white/5" /></td>
                    <td className="p-4 hidden md:table-cell"><Skeleton className="h-4 w-24 ml-auto bg-white/5" /></td>
                    <td className="p-4"></td>
                  </tr>
                ))
              ) : filteredCoins?.map((coin, idx) => {
                const isFav = favorites?.some(f => f.symbol === coin.symbol);
                return (
                  <motion.tr 
                    key={coin.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-4 pl-6 text-muted-foreground font-mono text-sm">{idx + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={`https://coinicons-api.vercel.app/api/icon/${coin.symbol.toLowerCase()}`} 
                             className="w-8 h-8 rounded-full" 
                             alt={coin.name}
                             onError={(e) => {
                               // Fallback to initial
                               e.currentTarget.style.display = 'none';
                               e.currentTarget.nextElementSibling?.classList.remove('hidden');
                             }} 
                        />
                        <div className="w-8 h-8 rounded-full bg-white/10 hidden items-center justify-center font-bold text-xs">
                          {coin.symbol[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold">{coin.name}</div>
                          <div className="text-xs text-muted-foreground uppercase">{coin.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono font-medium">
                      ${coin.current_price.toLocaleString()}
                    </td>
                    <td className={cn("p-4 text-right font-mono font-medium", coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400")}>
                      {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                    </td>
                    <td className="p-4 text-right text-muted-foreground hidden md:table-cell font-mono">
                      ${(coin.market_cap / 1e9).toFixed(2)}B
                    </td>
                    <td className="p-4 pr-6">
                      <button 
                        onClick={(e) => toggleFavorite(e, coin)}
                        className={cn(
                          "p-2 rounded-full transition-all duration-300",
                          isFav ? "text-yellow-400 hover:text-yellow-300 bg-yellow-400/10" : "text-muted-foreground hover:text-white bg-transparent hover:bg-white/10"
                        )}
                      >
                        <Star className={cn("w-4 h-4", isFav && "fill-current")} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
