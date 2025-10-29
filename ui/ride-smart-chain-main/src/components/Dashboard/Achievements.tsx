import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Flame, Target, Zap } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: "shield" | "flame" | "target" | "zap";
  unlocked: boolean;
  progress?: number;
}

const iconMap = {
  shield: Shield,
  flame: Flame,
  target: Target,
  zap: Zap
};

interface AchievementsProps {
  achievements: Achievement[];
}

export const Achievements = ({ achievements }: AchievementsProps) => {
  return (
    <Card className="glass p-6 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4">Achievements</h2>
      {achievements.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">No achievements yet</p>
          <p className="text-sm text-muted-foreground">Start riding safely to unlock achievements</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((achievement, index) => {
          const Icon = iconMap[achievement.icon];
          return (
            <div
              key={achievement.id}
              className={`relative p-4 rounded-lg text-center transition-all ${
                achievement.unlocked 
                  ? 'bg-primary/20 border-2 border-primary' 
                  : 'bg-card/40 border border-border/50 opacity-50'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`inline-flex p-3 rounded-full mb-2 ${
                achievement.unlocked ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{achievement.title}</h3>
              <p className="text-xs text-muted-foreground">{achievement.description}</p>
              
              {!achievement.unlocked && achievement.progress !== undefined && (
                <div className="mt-2">
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{achievement.progress}%</p>
                </div>
              )}
              
              {achievement.unlocked && (
                <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground">
                  ✓
                </Badge>
              )}
            </div>
          );
          })}
        </div>
      )}
    </Card>
  );
};
