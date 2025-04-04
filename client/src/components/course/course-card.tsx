import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Clock, Signal, Video, BookmarkPlus } from "lucide-react";
import { Course } from "@shared/schema";

interface CourseCardProps {
  course: Course;
  instructorName?: string;
  instructorAvatar?: string;
  progress?: number;
}

export default function CourseCard({ course, instructorName, instructorAvatar, progress }: CourseCardProps) {
  const {
    id,
    title,
    description,
    imageUrl,
    category,
    price,
    level,
    totalLectures,
    totalDuration,
    rating
  } = course;

  // Format course duration from minutes to hours
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return `${hours} hours`;
  };

  // Get the first 2 letters of instructor name for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return "IN";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  // Get appropriate category background color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Programming": "bg-blue-100 text-blue-800",
      "Data Science": "bg-green-100 text-green-800",
      "Design": "bg-pink-100 text-pink-800",
      "Marketing": "bg-purple-100 text-purple-800",
      "Business": "bg-yellow-100 text-yellow-800",
      "Photography": "bg-red-100 text-red-800",
      "Music": "bg-indigo-100 text-indigo-800"
    };
    
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-transform hover:shadow-md hover:-translate-y-1">
      <div className="relative pb-[56.25%]">
        <Link href={`/courses/${id}`}>
          <img 
            src={imageUrl || `https://images.unsplash.com/photo-1580894894513-541e068a3e2b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80`} 
            className="absolute h-full w-full object-cover cursor-pointer"
            alt={title} 
          />
        </Link>
        <button className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-sm text-yellow-500 hover:text-yellow-600">
          <BookmarkPlus size={16} />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${getCategoryColor(category)}`}>
            {category}
          </span>
          <div className="flex items-center text-yellow-500">
            <Star className="h-4 w-4 fill-yellow-500" />
            <span className="ml-1 text-sm font-medium text-gray-900">{rating.toFixed(1)}</span>
          </div>
        </div>
        
        <Link href={`/courses/${id}`}>
          <h3 className="font-semibold text-gray-900 mb-1 text-lg leading-tight cursor-pointer hover:text-primary">
            {title}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{description}</p>
        
        <div className="flex items-center text-sm mb-3">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={instructorAvatar} />
            <AvatarFallback>{getInitials(instructorName)}</AvatarFallback>
          </Avatar>
          <span className="text-gray-600">{instructorName || "Instructor"}</span>
        </div>
        
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-gray-500 flex items-center">
            <Video className="h-3.5 w-3.5 mr-1" /> {totalLectures} lectures
          </span>
          <span className="text-gray-500 flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" /> {formatDuration(totalDuration)}
          </span>
          <span className="text-gray-500 flex items-center">
            <Signal className="h-3.5 w-3.5 mr-1" /> {level}
          </span>
        </div>
        
        {progress !== undefined && (
          <>
            <div className="w-full h-1.5 mb-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-green-500 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {progress > 0 ? `${progress}% complete` : "Not started"}
              </span>
              <div className="text-lg font-bold text-gray-900">${price.toFixed(2)}</div>
            </div>
          </>
        )}
        
        {progress === undefined && (
          <div className="flex justify-end">
            <div className="text-lg font-bold text-gray-900">${price.toFixed(2)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
