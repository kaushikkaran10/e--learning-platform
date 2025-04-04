import { Course } from "@shared/schema";
import { Link } from "wouter";
import { StarRating } from "@/components/ui/star-rating";

interface CourseCardProps {
  course: Course;
  instructor?: {
    name: string;
    avatarUrl: string;
  };
}

export function CourseCard({ course, instructor }: CourseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
      <div className="relative">
        <img 
          className="h-48 w-full object-cover" 
          src={course.thumbnailUrl} 
          alt={course.title} 
        />
        <div className="absolute top-2 right-2 bg-gray-900/70 text-white text-xs font-medium px-2 py-1 rounded">
          {course.durationHours} hours
        </div>
      </div>
      <div className="flex-1 p-4">
        <div className="flex items-center text-xs text-gray-500 mb-1">
          <span className="text-primary font-medium">{course.categoryId}</span>
          <span className="mx-2">•</span>
          <span>{course.level}</span>
        </div>
        <Link href={`/courses/${course.id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary cursor-pointer">
            {course.title}
          </h3>
        </Link>
        {instructor && (
          <div className="flex items-center text-sm mb-3">
            <img 
              className="h-6 w-6 rounded-full mr-2" 
              src={instructor.avatarUrl} 
              alt={instructor.name} 
            />
            <span className="text-gray-600">{instructor.name}</span>
          </div>
        )}
        <div className="flex items-center text-sm text-gray-700">
          <StarRating rating={course.averageRating} count={course.ratingCount} size="sm" />
          <span className="mx-2">•</span>
          <span>{course.totalStudents} students</span>
        </div>
      </div>
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="font-bold text-primary">${course.price.toFixed(2)}</span>
          <Link href={`/courses/${course.id}`}>
            <button className="px-3 py-1 bg-primary text-white text-sm font-medium rounded hover:bg-primary/90 transition-colors">
              Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
