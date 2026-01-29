import { useAuth } from "@/hooks/use-auth";
import { useFavorites, useRemoveFavorite, useCryptoMarket } from "@/hooks/use-crypto";
import { PriceCard } from "@/components/PriceCard";
import { Button } from "@/components/ui/button";
import { Star, AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Favorites() {
  const { isAuthenticated } = useAuth();
  const { data: favorites, isLoading: favLoading } = useFavorites();
  const { data: marketData, isLoading: marketLoading } = useCryptoMarket();
  const removeFavorite = useRemoveFavorite();

  if (!isAuthenticated) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Star className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-display font-bold">Your Watchlist</h1>
        <p className="text-muted-foreground max-w-md">
          Track your favorite assets in one place. Login to access your personalized watchlist.
        </p>
        <a href="/api/login">
          <Button size="lg" className="mt-4 gap-2 bg-primary text-primary-foreground">
            Login to Access
          </Button>
        </a>
      </div>
    );
  }

  const isLoading = favLoading || marketLoading;

  // Match favorites with real-time market data
  const favoriteCoins = favorites?.map(fav => {
    const marketCoin = marketData?.find(c => c.symbol === fav.symbol);
    return {
      ...fav,
      marketData: marketCoin
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold">Favorites</h1>
          <p className="text-muted-foreground">Your personal crypto watchlist.</p>
        </div>
      </div>

      {isLoading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 bg-white/5 rounded-2xl" />)}
         </div>
      ) : favoriteCoins?.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl flex flex-col items-center text-center border-dashed border-white/10">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">No favorites yet</h3>
          <p className="text-muted-foreground mb-6">Start exploring the market and star coins you want to track.</p>
          <Link href="/market">
            <Button className="gap-2">
              Go to Market <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteCoins?.map((fav) => (
            <div key={fav.id} className="relative group">
              {fav.marketData ? (
                <PriceCard
                  name={fav.name}
                  symbol={fav.symbol}
                  price={fav.marketData.current_price}
                  change24h={fav.marketData.price_change_percentage_24h}
                  marketCap={fav.marketData.market_cap}
                />
              ) : (
                // Fallback if coin data not found in current market fetch
                <div className="glass-card p-6 rounded-2xl h-full flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{fav.name}</h3>
                    <span className="text-xs text-muted-foreground uppercase">{fav.symbol}</span>
                  </div>
                  <div className="text-muted-foreground text-sm">Data unavailable</div>
                </div>
              )}
              
              <button
                onClick={() => removeFavorite.mutate(fav.id)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-red-500/20 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                title="Remove favorite"
              >
                <Star className="w-4 h-4 fill-current" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
