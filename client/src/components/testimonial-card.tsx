import { StarRating } from "@/components/ui/star-rating";

interface TestimonialProps {
  name: string;
  avatarUrl: string;
  text: string;
  rating: number;
}

export function TestimonialCard({ name, avatarUrl, text, rating }: TestimonialProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center mb-4">
        <img 
          className="h-12 w-12 rounded-full mr-4" 
          src={avatarUrl} 
          alt={name} 
        />
        <div>
          <h4 className="font-medium">{name}</h4>
          <StarRating rating={rating} size="sm" />
        </div>
      </div>
      <p className="text-gray-600">{text}</p>
    </div>
  );
}
