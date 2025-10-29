import { SafetyScore } from "@/components/Dashboard/SafetyScore";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { RecentRides } from "@/components/Dashboard/RecentRides";
import { Leaderboard } from "@/components/Dashboard/Leaderboard";
import { ActionButtons } from "@/components/Dashboard/ActionButtons";
import { Achievements } from "@/components/Dashboard/Achievements";
import { Bike, Coins, Flame } from "lucide-react";
import heroBike from "@/assets/hero-bike.jpg";

const Index = () => {
  // Data will be fetched from API - currently empty
  const currentScore = 0;
  const stats = {
    totalRides: 0,
    tokensEarned: 0,
    currentStreak: 0
  };

  const recentRides: Array<{
    id: string;
    date: string;
    duration: string;
    distance: string;
    score: number;
    tokensEarned: number;
    route: string;
  }> = [];

  const leaderboard: Array<{
    rank: number;
    rider: string;
    score: number;
    tokens: number;
    rides: number;
  }> = [];

  const achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: "shield" | "flame" | "target" | "zap";
    unlocked: boolean;
    progress?: number;
  }> = [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header 
        className="relative h-[400px] bg-cover bg-center flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: `url(${heroBike})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-gradient animate-fade-in">
            RideSafe Rewards
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-6 animate-fade-in">
            Earn Tokens for Every Safe Ride
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground animate-fade-in">
            <span className="flex items-center gap-1">
              <Bike className="w-4 h-4 text-primary" />
              AI-Powered
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-accent" />
              Blockchain Verified
            </span>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Score and Stats Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <div className="lg:col-span-1 flex justify-center items-start">
            <div className="glass p-8 rounded-2xl">
              <SafetyScore score={currentScore} />
            </div>
          </div>
          
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatsCard
              title="Total Rides"
              value={stats.totalRides}
              icon={Bike}
              color="primary"
            />
            <StatsCard
              title="Tokens Earned"
              value={stats.tokensEarned}
              icon={Coins}
              color="accent"
            />
            <StatsCard
              title="Current Streak"
              value={`${stats.currentStreak} days`}
              icon={Flame}
              color="secondary"
            />
          </div>
        </section>

        {/* Action Buttons */}
        <ActionButtons />

        {/* Achievements */}
        {achievements.length > 0 && <Achievements achievements={achievements} />}

        {/* Recent Rides and Leaderboard */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentRides rides={recentRides} />
          <Leaderboard entries={leaderboard} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">
            Powered by AI Analytics + Blockchain Technology
          </p>
          <p className="text-xs mt-2">
            Ride safe. Earn rewards. Build a safer community.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
