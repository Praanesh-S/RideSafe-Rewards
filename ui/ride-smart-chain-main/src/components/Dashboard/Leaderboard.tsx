import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  rider: string;
  score: number;
  tokens: number;
  rides: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserRank?: number;
}

export const Leaderboard = ({ entries, currentUserRank }: LeaderboardProps) => {
  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-accent" />;
      case 2:
        return <Medal className="w-5 h-5 text-muted-foreground" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-bold">{rank}</span>;
    }
  };

  return (
    <Card className="glass p-6 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-accent" />
        Global Leaderboard
      </h2>
      {entries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">No leaderboard data yet</p>
          <p className="text-sm text-muted-foreground">Be the first to complete a safe ride</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {entries.map((entry, index) => (
          <div
            key={entry.rank}
            className={`flex items-center justify-between p-4 rounded-lg transition-all ${
              entry.rank === currentUserRank 
                ? 'bg-primary/10 border-2 border-primary' 
                : 'bg-card/60 border border-border/50 hover:bg-card/80'
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 flex justify-center">
                {getRankIcon(entry.rank)}
              </div>
              <div>
                <p className="font-semibold">
                  {entry.rider}
                  {entry.rank === currentUserRank && (
                    <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">{entry.rides} rides</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">{entry.score}</p>
              <p className="text-xs text-accent">{entry.tokens} SRT</p>
            </div>
          </div>
            ))}
          </div>
          
          {currentUserRank && currentUserRank > 10 && (
            <div className="mt-4 p-4 rounded-lg bg-card/60 border-2 border-primary">
              <p className="text-sm text-muted-foreground">Your Rank</p>
              <p className="text-2xl font-bold text-primary">#{currentUserRank}</p>
            </div>
          )}
        </>
      )}
    </Card>
  );
};
