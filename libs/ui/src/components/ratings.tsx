import { Star } from "lucide-react";

type RatingProps = {
  value: number; // e.g. 4.5
  max?: number;  // default 5
};

export default function Rating({ value, max = 5 }: RatingProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1;

        return (
          <Star
            key={index}
            size={16}
            className={
              starValue <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        );
      })}
      <span className="ml-1 text-sm text-gray-500">
        ({value.toFixed(1)})
      </span>
    </div>
  );
}
