import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Course } from "@shared/schema";

interface CourseProgressCardProps {
  course: Course;
  progress: number;
  nextLecture?: {
    id: number;
    title: string;
  };
  instructorName?: string;
  instructorAvatar?: string;
  timeRemaining?: string;
}

export default function CourseProgressCard({
  course,
  progress,
  nextLecture,
  instructorName,
  instructorAvatar,
  timeRemaining = "5h 20m"
}: CourseProgressCardProps) {
  const { id, title, imageUrl } = course;

  // Get the first 2 letters of instructor name for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return "IN";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 relative">
          <img 
            src={imageUrl || `https://images.unsplash.com/photo-1580894894513-541e068a3e2b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80`} 
            className="h-full w-full object-cover"
            alt={title} 
          />
        </div>
        
        <div className="p-4 md:w-2/3">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          
          <div className="flex items-center text-sm mb-3">
            <Avatar className="h-5 w-5 mr-1">
              <AvatarImage src={instructorAvatar} />
              <AvatarFallback>{getInitials(instructorName)}</AvatarFallback>
            </Avatar>
            <span className="text-gray-600 text-xs">{instructorName || "Instructor"}</span>
          </div>
          
          <div className="mb-2">
            <div className="w-full h-1.5 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-green-500 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">{progress}% complete</span>
              <span className="text-xs text-gray-500">{timeRemaining} left</span>
            </div>
          </div>
          
          {nextLecture && (
            <div className="flex items-center text-sm mb-3">
              <span className="text-primary font-medium">Next: </span>
              <span className="ml-1 text-gray-700">{nextLecture.title}</span>
            </div>
          )}
          
          <Link href={nextLecture ? `/learn/${id}?lecture=${nextLecture.id}` : `/learn/${id}`}>
            <Button className="mt-1 w-full">
              Resume Course
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
