import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@shared/schema";
import { Star, Users, BookOpen } from "lucide-react";

interface InstructorCardProps {
  instructor: Partial<User> & {
    id: number;
    fullName: string;
  };
  rating?: number;
  studentCount?: number;
  courseCount?: number;
  specialty?: string;
}

export default function InstructorCard({
  instructor,
  rating = 4.8,
  studentCount = 0,
  courseCount = 0,
  specialty = "Instructor"
}: InstructorCardProps) {
  const { fullName, bio, avatarUrl } = instructor;

  // Get the first 2 letters of instructor name for avatar fallback
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  // Generate star rating display
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center text-yellow-500">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="fill-yellow-500" size={16} />;
          } else if (i === fullStars && hasHalfStar) {
            return (
              <span key={i} className="relative">
                <Star className="text-gray-300" size={16} />
                <Star className="absolute top-0 left-0 w-1/2 overflow-hidden fill-yellow-500" size={16} />
              </span>
            );
          } else {
            return <Star key={i} className="text-gray-300" size={16} />;
          }
        })}
        <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)} Instructor Rating</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow p-4 flex flex-col items-center">
      <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
        <AvatarImage src={avatarUrl} alt={fullName} />
        <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
      </Avatar>
      
      <h3 className="font-semibold text-gray-900 text-lg">{fullName}</h3>
      <p className="text-sm text-gray-600 mb-2">{specialty}</p>
      
      <div className="mb-3">
        {renderStars(rating)}
      </div>
      
      <div className="text-sm text-gray-600 mb-4 text-center">
        <div className="flex items-center justify-center gap-4">
          <span className="flex items-center">
            <Users className="mr-1 h-4 w-4" /> {studentCount.toLocaleString()} students
          </span>
          <span className="flex items-center">
            <BookOpen className="mr-1 h-4 w-4" /> {courseCount} courses
          </span>
        </div>
      </div>
      
      {bio && (
        <p className="text-sm text-gray-600 text-center mb-4 line-clamp-3">{bio}</p>
      )}
      
      <a href="#" className="text-primary hover:text-primary/80 font-medium">View Profile</a>
    </div>
  );
}
