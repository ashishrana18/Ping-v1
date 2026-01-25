// Temporary winter theme component - can be removed after winter season
import { useEffect, useState } from "react";

export function WinterTheme() {
  const [isDark, setIsDark] = useState(false);

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    // Watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Generate snowflakes for winter theme
  const snowflakes = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
    size: 4 + Math.random() * 4,
  }));

  return (
    <>
      <style>{`
        @keyframes snowfall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0.7;
          }
          100% {
            transform: translateY(80px) translateX(20px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
      {/* Snow Effect */}
      {snowflakes.map((snowflake) => (
        <div
          key={snowflake.id}
          className="absolute opacity-70 dark:opacity-50"
          style={{
            left: `${snowflake.left}%`,
            top: "-10px",
            animationDelay: `${snowflake.delay}s`,
            animationDuration: `${snowflake.duration}s`,
            fontSize: `${snowflake.size}px`,
            animationName: "snowfall",
            animationIterationCount: "infinite",
            animationTimingFunction: "linear",
            filter: isDark
              ? "none"
              : "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(200deg) brightness(104%) contrast(97%)",
            WebkitFilter: isDark
              ? "none"
              : "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(200deg) brightness(104%) contrast(97%)",
          }}
        >
          ❄
        </div>
      ))}
    </>
  );
}

export function SantaCap() {
  return (
    <img
      src="/santa.png"
      alt="Santa Cap"
      className="absolute -top-3.5 -right-4 w-8 h-8 object-contain"
    />
  );
}
