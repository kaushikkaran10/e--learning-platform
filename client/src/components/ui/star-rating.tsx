import { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  count,
  size = "md",
  readOnly = true,
  onChange,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-xl",
  };
  
  return (
    <div className="flex items-center">
      <div className="flex">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            className={cn(
              "focus:outline-none",
              sizeClasses[size],
              readOnly ? "cursor-default" : "cursor-pointer"
            )}
            onClick={() => {
              if (!readOnly && onChange) {
                onChange(star);
              }
            }}
            onMouseEnter={() => {
              if (!readOnly) {
                setHoverRating(star);
              }
            }}
            onMouseLeave={() => {
              if (!readOnly) {
                setHoverRating(0);
              }
            }}
            disabled={readOnly}
          >
            {star <= (hoverRating || rating) ? (
              <i className="fas fa-star text-yellow-400"></i>
            ) : star - rating < 1 ? (
              <i className="fas fa-star-half-alt text-yellow-400"></i>
            ) : (
              <i className="far fa-star text-yellow-400"></i>
            )}
          </button>
        ))}
      </div>
      {count !== undefined && (
        <span className={cn("ml-1 text-gray-600", sizeClasses[size])}>
          {rating.toFixed(1)}
          {count > 0 && ` (${count})`}
        </span>
      )}
    </div>
  );
}
