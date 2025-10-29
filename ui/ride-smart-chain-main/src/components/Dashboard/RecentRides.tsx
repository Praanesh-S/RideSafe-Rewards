import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Timer } from "lucide-react";

interface Ride {
  id: string;
  date: string;
  duration: string;
  distance: string;
  score: number;
  tokensEarned: number;
  route: string;
}

interface RecentRidesProps {
  rides: Ride[];
}

export const RecentRides = ({ rides }: RecentRidesProps) => {
  const getScoreVariant = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "danger";
  };

  return (
    <Card className="glass p-6 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4">Recent Rides</h2>
      {rides.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">No rides yet</p>
          <p className="text-sm text-muted-foreground">Upload your first ride data to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rides.map((ride, index) => (
          <div 
            key={ride.id} 
            className="flex items-center justify-between p-4 rounded-lg bg-card/60 border border-border/50 hover:bg-card/80 transition-all"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant={getScoreVariant(ride.score)}>
                  Score: {ride.score}
                </Badge>
                <span className="text-accent font-semibold">+{ride.tokensEarned} SRT</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{ride.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  <span>{ride.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{ride.route}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{ride.distance}</p>
              <p className="text-xs text-muted-foreground">Distance</p>
            </div>
          </div>
          ))}
        </div>
      )}
    </Card>
  );
};
