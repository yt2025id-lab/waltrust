"use client";

import { useRef, useEffect, useState } from "react";

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  className?: string;
  repeat?: number;
}

export function Marquee({
  children,
  speed = 40,
  direction = "left",
  pauseOnHover = true,
  className = "",
  repeat = 4,
}: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(20);

  useEffect(() => {
    if (!trackRef.current) return;
    const scrollWidth = trackRef.current.scrollWidth / repeat;
    setDuration(scrollWidth / speed);
  }, [speed, repeat]);

  const animDirection = direction === "left" ? "normal" : "reverse";

  return (
    <div
      className={`overflow-hidden whitespace-nowrap ${pauseOnHover ? "[&:hover_.marquee-inner]:paused" : ""} ${className}`}
    >
      <div
        ref={trackRef}
        className="marquee-inner inline-flex"
        style={{
          animation: `marquee-scroll ${duration}s linear infinite ${animDirection}`,
          animationPlayState: "running",
        }}
      >
        {Array.from({ length: repeat }).map((_, i) => (
          <div key={i} className="inline-flex shrink-0 items-center">
            {children}
          </div>
        ))}
      </div>
      <style jsx>{`
        .marquee-inner.paused {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  );
}

interface MarqueeItemProps {
  children: React.ReactNode;
  separator?: string;
  separatorClassName?: string;
}

export function MarqueeItem({ children, separator = "◆", separatorClassName = "" }: MarqueeItemProps) {
  return (
    <span className="inline-flex items-center gap-6 mx-6">
      {children}
      <span className={`font-mono text-sm ${separatorClassName || "text-neo-green"}`}>
        {separator}
      </span>
    </span>
  );
}
