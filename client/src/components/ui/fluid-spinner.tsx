import * as React from "react";
import { cn } from "@/lib/utils";
import { type SpinnerTheme } from "./themed-spinner";

export interface FluidSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: SpinnerTheme;
  size?: number;
  text?: string;
}

export function FluidSpinner({
  theme = "book",
  size = 60,
  text,
  className,
  ...props
}: FluidSpinnerProps) {
  // Get color based on theme
  const getThemeColor = () => {
    switch (theme) {
      case "book": return "#3b82f6"; // blue-500
      case "pencil": return "#eab308"; // yellow-500
      case "science": return "#22c55e"; // green-500
      case "math": return "#a855f7"; // purple-500
      case "art": return "#ec4899"; // pink-500
      case "code": return "#06b6d4"; // cyan-500
      case "graduate": return "#f59e0b"; // amber-500
      case "lightbulb": return "#f97316"; // orange-500
      default: return "#3b82f6"; // blue-500
    }
  };

  // Get secondary color (lighter shade) based on theme
  const getSecondaryColor = () => {
    switch (theme) {
      case "book": return "#93c5fd"; // blue-300
      case "pencil": return "#fde047"; // yellow-300
      case "science": return "#86efac"; // green-300
      case "math": return "#d8b4fe"; // purple-300
      case "art": return "#f9a8d4"; // pink-300
      case "code": return "#67e8f9"; // cyan-300
      case "graduate": return "#fcd34d"; // amber-300
      case "lightbulb": return "#fdba74"; // orange-300
      default: return "#93c5fd"; // blue-300
    }
  };

  const primaryColor = getThemeColor();
  const secondaryColor = getSecondaryColor();

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className
      )}
      {...props}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Backdrop circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={secondaryColor}
          strokeWidth="8"
          opacity="0.3"
        />

        {/* Spinner circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={primaryColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="251.2"
          strokeDashoffset="100"
          transform="rotate(-90 50 50)"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="251.2"
            to="0"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Theme-based decorative elements */}
        {theme === "book" && (
          <g>
            <path
              d="M35 30 L65 30 L65 70 L35 70 Z"
              fill="none"
              stroke={primaryColor}
              strokeWidth="2"
            >
              <animate
                attributeName="d"
                values="M35 30 L65 30 L65 70 L35 70 Z; M38 33 L62 33 L62 67 L38 67 Z; M35 30 L65 30 L65 70 L35 70 Z"
                dur="3s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M40 35 L60 35"
              stroke={primaryColor}
              strokeWidth="2"
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values="M40 40 L60 40; M40 45 L60 45; M40 50 L60 50; M40 55 L60 55; M40 60 L60 60; M40 40 L60 40"
                dur="3s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        )}

        {theme === "pencil" && (
          <g>
            <path
              d="M50 30 L60 40 L50 70 L40 40 Z"
              fill={secondaryColor}
              opacity="0.6"
            >
              <animate
                attributeName="d"
                values="M50 30 L60 40 L50 70 L40 40 Z; M50 32 L58 42 L50 68 L42 42 Z; M50 30 L60 40 L50 70 L40 40 Z"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        )}

        {theme === "math" && (
          <g>
            <path
              d="M40 50 L60 50"
              stroke={primaryColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M50 40 L50 60"
              stroke={primaryColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M35 35 L65 65"
              stroke={secondaryColor}
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.6"
            >
              <animate
                attributeName="opacity"
                values="0.6;0.3;0.6"
                dur="2s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M65 35 L35 65"
              stroke={secondaryColor}
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.6"
            >
              <animate
                attributeName="opacity"
                values="0.6;0.3;0.6"
                dur="2s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        )}

        {theme === "code" && (
          <g>
            <path
              d="M40 45 L30 50 L40 55"
              fill="none"
              stroke={primaryColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <animate
                attributeName="d"
                values="M40 45 L30 50 L40 55; M38 43 L28 50 L38 57; M40 45 L30 50 L40 55"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M60 45 L70 50 L60 55"
              fill="none"
              stroke={primaryColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <animate
                attributeName="d"
                values="M60 45 L70 50 L60 55; M62 43 L72 50 L62 57; M60 45 L70 50 L60 55"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M45 65 L55 35"
              stroke={secondaryColor}
              strokeWidth="2"
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values="M45 65 L55 35; M46 64 L54 36; M45 65 L55 35"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        )}

        {theme === "science" && (
          <g>
            <path
              d="M45 65 L45 50 L40 40 L60 40 L55 50 L55 65 Z"
              fill="none"
              stroke={primaryColor}
              strokeWidth="2"
            >
              <animate
                attributeName="d"
                values="M45 65 L45 50 L40 40 L60 40 L55 50 L55 65 Z; M46 65 L46 51 L41 41 L59 41 L54 51 L54 65 Z; M45 65 L45 50 L40 40 L60 40 L55 50 L55 65 Z"
                dur="2s"
                repeatCount="indefinite"
              />
            </path>
            <circle
              cx="50"
              cy="55"
              r="5"
              fill={secondaryColor}
            >
              <animate
                attributeName="cy"
                values="55;50;55"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        )}

        {theme === "graduate" && (
          <g>
            <path
              d="M30 55 L50 45 L70 55 L50 65 Z"
              fill={secondaryColor}
              opacity="0.6"
            />
            <path
              d="M50 45 L50 35"
              stroke={primaryColor}
              strokeWidth="2"
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values="M50 45 L50 35; M50 44 L50 34; M50 45 L50 35"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>
            <circle
              cx="50"
              cy="30"
              r="5"
              fill={primaryColor}
            >
              <animate
                attributeName="r"
                values="5;5.5;5"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        )}

        {theme === "lightbulb" && (
          <g>
            <path
              d="M50 30 C60 30, 65 40, 65 50 C65 60, 60 65, 50 65 C40 65, 35 60, 35 50 C35 40, 40 30, 50 30 Z"
              fill={secondaryColor}
              opacity="0.5"
            >
              <animate
                attributeName="opacity"
                values="0.5;0.8;0.5"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M45 65 L45 70 L55 70 L55 65"
              stroke={primaryColor}
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M47 35 L53 35 M44 40 L56 40 M42 45 L58 45 M42 50 L58 50 M44 55 L56 55 M47 60 L53 60"
              stroke={primaryColor}
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values="M47 35 L53 35 M44 40 L56 40 M42 45 L58 45 M42 50 L58 50 M44 55 L56 55 M47 60 L53 60; 
                        M48 35 L52 35 M45 40 L55 40 M43 45 L57 45 M43 50 L57 50 M45 55 L55 55 M48 60 L52 60;
                        M47 35 L53 35 M44 40 L56 40 M42 45 L58 45 M42 50 L58 50 M44 55 L56 55 M47 60 L53 60"
                dur="2s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        )}

        {theme === "art" && (
          <g>
            <path
              d="M30 50 Q50 20, 70 50 Q50 80, 30 50 Z"
              fill="none"
              stroke={secondaryColor}
              strokeWidth="2"
            >
              <animate
                attributeName="d"
                values="M30 50 Q50 20, 70 50 Q50 80, 30 50 Z; 
                        M32 50 Q50 25, 68 50 Q50 75, 32 50 Z;
                        M30 50 Q50 20, 70 50 Q50 80, 30 50 Z"
                dur="3s"
                repeatCount="indefinite"
              />
            </path>
            <circle cx="40" cy="40" r="3" fill={primaryColor}>
              <animate
                attributeName="cy"
                values="40;42;40"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="60" cy="40" r="3" fill={primaryColor}>
              <animate
                attributeName="cy"
                values="40;42;40"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <path
              d="M45 55 Q50 60, 55 55"
              stroke={primaryColor}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values="M45 55 Q50 60, 55 55; M45 56 Q50 61, 55 56; M45 55 Q50 60, 55 55"
                dur="3s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        )}
      </svg>

      {text && (
        <div className="text-center text-sm font-medium text-muted-foreground animate-pulse">
          {text}
        </div>
      )}
    </div>
  );
}