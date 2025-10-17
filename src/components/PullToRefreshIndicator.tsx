import { RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface PullToRefreshIndicatorProps {
  pulling: boolean;
  refreshing: boolean;
  progress: number;
  pullDistance: number;
}

export function PullToRefreshIndicator({
  pulling,
  refreshing,
  progress,
  pullDistance,
}: PullToRefreshIndicatorProps) {
  if (!pulling && !refreshing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{
        opacity: pulling || refreshing ? 1 : 0,
        y: pulling || refreshing ? pullDistance * 0.5 : -50,
      }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-4 bg-background/80 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-2">
        <RefreshCw
          className={`h-6 w-6 text-primary ${refreshing ? "animate-spin" : ""}`}
          style={{
            transform: `rotate(${progress * 3.6}deg)`,
          }}
        />
        <p className="text-xs text-muted-foreground">
          {refreshing ? "Refreshing..." : progress >= 100 ? "Release to refresh" : "Pull to refresh"}
        </p>
      </div>
    </motion.div>
  );
}
