import { useEffect, useState } from "react";

interface SafetyScoreProps {
  score: number;
}

export const SafetyScore = ({ score }: SafetyScoreProps) => {
  const [displayScore, setDisplayScore] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "hsl(var(--success))";
    if (score >= 60) return "hsl(var(--warning))";
    return "hsl(var(--danger))";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Great";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Improvement";
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg className="transform -rotate-90 w-48 h-48">
        {/* Background circle */}
        <circle
          cx="96"
          cy="96"
          r="90"
          stroke="hsl(var(--muted))"
          strokeWidth="12"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="96"
          cy="96"
          r="90"
          stroke={getScoreColor(displayScore)}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${getScoreColor(displayScore)})`
          }}
        />
      </svg>
      
      <div className="absolute flex flex-col items-center">
        <span className="text-5xl font-bold" style={{ color: getScoreColor(displayScore) }}>
          {Math.round(displayScore)}
        </span>
        <span className="text-sm text-muted-foreground mt-1">Safety Score</span>
        <span className="text-xs font-semibold mt-1" style={{ color: getScoreColor(displayScore) }}>
          {getScoreLabel(displayScore)}
        </span>
      </div>
    </div>
  );
};
