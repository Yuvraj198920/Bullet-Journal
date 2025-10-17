import { ReactNode, useRef, useState, TouchEvent } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "motion/react";
import { Check, X, Trash2 } from "lucide-react";

interface SwipeableEntryProps {
  children: ReactNode;
  onSwipeRight?: () => void; // Complete/check action
  onSwipeLeft?: () => void; // Delete/cancel action
  disabled?: boolean;
  rightAction?: "complete" | "check";
  leftAction?: "delete" | "cancel";
}

export function SwipeableEntry({
  children,
  onSwipeRight,
  onSwipeLeft,
  disabled = false,
  rightAction = "complete",
  leftAction = "delete",
}: SwipeableEntryProps) {
  const x = useMotionValue(0);
  const [swiping, setSwiping] = useState(false);
  
  const backgroundColor = useTransform(
    x,
    [-100, 0, 100],
    ["rgb(239, 68, 68)", "rgb(255, 255, 255)", "rgb(34, 197, 94)"]
  );

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setSwiping(false);
    const threshold = 100;

    if (info.offset.x > threshold && onSwipeRight) {
      // Swipe right - complete/check
      onSwipeRight();
      x.set(0);
    } else if (info.offset.x < -threshold && onSwipeLeft) {
      // Swipe left - delete/cancel
      onSwipeLeft();
      x.set(0);
    } else {
      // Return to center
      x.set(0);
    }
  };

  if (disabled) {
    return <div>{children}</div>;
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background indicators */}
      <motion.div
        style={{ backgroundColor }}
        className="absolute inset-0 flex items-center justify-between px-6 rounded-md"
      >
        <div className="flex items-center gap-2 text-white">
          {rightAction === "complete" ? (
            <>
              <Check className="h-5 w-5" />
              <span className="text-sm font-medium">Complete</span>
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              <span className="text-sm font-medium">Check</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-white">
          {leftAction === "delete" ? (
            <>
              <span className="text-sm font-medium">Delete</span>
              <Trash2 className="h-5 w-5" />
            </>
          ) : (
            <>
              <span className="text-sm font-medium">Cancel</span>
              <X className="h-5 w-5" />
            </>
          )}
        </div>
      </motion.div>

      {/* Swipeable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 150 }}
        dragElastic={0.2}
        style={{ x }}
        onDragStart={() => setSwiping(true)}
        onDragEnd={handleDragEnd}
        className="relative z-10 bg-background"
      >
        {children}
      </motion.div>
    </div>
  );
}
