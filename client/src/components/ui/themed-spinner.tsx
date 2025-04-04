import * as React from "react";
import { cn } from "@/lib/utils";
import { BookOpen, PenTool, Beaker, Calculator, Palette, Code, GraduationCap, Lightbulb, Loader2 } from "lucide-react";

export const spinnerThemes = [
  "book",
  "pencil",
  "science",
  "math",
  "art",
  "code",
  "graduate",
  "lightbulb",
] as const;

export type SpinnerTheme = typeof spinnerThemes[number];

export interface ThemedSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: SpinnerTheme;
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
}

export function ThemedSpinner({
  theme = "book",
  size = "md",
  text,
  className,
  ...props
}: ThemedSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  // Define animation styles for each theme
  const getAnimationStyle = () => {
    const baseAnimationClass = "transition-all duration-700";
    
    switch (theme) {
      case "book":
        return cn(baseAnimationClass, "animate-bounce");
      case "pencil":
        return cn(baseAnimationClass, "animate-spin");
      case "science":
        return cn(baseAnimationClass, "animate-pulse");
      case "math":
        return cn(baseAnimationClass, "animate-ping");
      case "art":
        return cn(baseAnimationClass, "animate-bounce");
      case "code":
        return cn(baseAnimationClass, "animate-pulse");
      case "graduate":
        return cn(baseAnimationClass, "animate-bounce");
      case "lightbulb":
        return cn(baseAnimationClass, "animate-pulse");
      default:
        return cn(baseAnimationClass, "animate-spin");
    }
  };

  // Special animation for each theme
  const renderThemeIcon = () => {
    const iconClass = cn(
      getAnimationStyle(),
      sizeClasses[size],
      theme === "book" && "text-blue-500",
      theme === "pencil" && "text-yellow-500",
      theme === "science" && "text-green-500",
      theme === "math" && "text-purple-500",
      theme === "art" && "text-pink-500",
      theme === "code" && "text-cyan-500",
      theme === "graduate" && "text-amber-500",
      theme === "lightbulb" && "text-orange-500"
    );

    // Render different icons based on theme
    switch (theme) {
      case "book":
        return <BookOpen className={iconClass} />;
      case "pencil":
        return <PenTool className={iconClass} />;
      case "science":
        return <Beaker className={iconClass} />;
      case "math":
        return <Calculator className={iconClass} />;
      case "art":
        return <Palette className={iconClass} />;
      case "code":
        return <Code className={iconClass} />;
      case "graduate":
        return <GraduationCap className={iconClass} />;
      case "lightbulb":
        return <Lightbulb className={iconClass} />;
      default:
        return <Loader2 className={cn(iconClass, "animate-spin")} />;
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
      {...props}
    >
      <div className="relative">
        {renderThemeIcon()}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 bottom-0 animate-pulse rounded-full opacity-30",
            theme === "book" && "bg-blue-200",
            theme === "pencil" && "bg-yellow-200",
            theme === "science" && "bg-green-200",
            theme === "math" && "bg-purple-200",
            theme === "art" && "bg-pink-200",
            theme === "code" && "bg-cyan-200",
            theme === "graduate" && "bg-amber-200",
            theme === "lightbulb" && "bg-orange-200"
          )}
          style={{ 
            animationDuration: "1.5s",
            animationTimingFunction: "ease-in-out",
          }}
        />
      </div>
      {text && (
        <div className="text-center text-sm font-medium text-muted-foreground animate-pulse">
          {text}
        </div>
      )}
    </div>
  );
}

// Themed skeleton component for content loading
export function ThemedSkeleton({
  theme = "book",
  className,
  ...props
}: {
  theme?: SpinnerTheme;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div
      className={cn(
        "rounded-md animate-pulse",
        theme === "book" && "bg-blue-100",
        theme === "pencil" && "bg-yellow-100",
        theme === "science" && "bg-green-100",
        theme === "math" && "bg-purple-100",
        theme === "art" && "bg-pink-100",
        theme === "code" && "bg-cyan-100",
        theme === "graduate" && "bg-amber-100",
        theme === "lightbulb" && "bg-orange-100",
        className
      )}
      {...props}
    />
  );
}