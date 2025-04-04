import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { CategoryCard } from "@/components/category-card";
import { CourseCard } from "@/components/course-card";
import { TestimonialCard } from "@/components/testimonial-card";
import { Category, Course, User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch popular courses
  const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  // Fetch instructors for courses
  const { data: instructors, isLoading: isLoadingInstructors } = useQuery<User[]>({
    queryKey: ["/api/instructors"],
    enabled: !!courses,
  });

  // Fetch testimonials
  const { data: testimonials, isLoading: isLoadingTestimonials } = useQuery({
    queryKey: ["/api/testimonials"],
  });

  // Find instructor by ID
  const getInstructor = (instructorId: number) => {
    return instructors?.find(instructor => instructor.id === instructorId);
  };

  return (
    <>
      {/* Hero Section */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Expand your knowledge with LearnHub</h1>
              <p className="mt-4 text-lg text-indigo-100">Access over 1,000 courses from expert instructors in programming, design, business, and more.</p>
              <div className="mt-8">
                <Link href="/courses">
                  <a className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-indigo-50">
                    Explore courses
                  </a>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" alt="Students learning" className="w-full h-80 object-cover rounded-lg shadow-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Course Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-6">Browse Categories</h2>
        {isLoadingCategories ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                <Skeleton className="w-12 h-12 rounded-full mb-3" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories?.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>

      {/* Popular Courses */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Popular Courses</h2>
            <Link href="/courses">
              <a className="text-primary hover:text-primary-700 font-medium">View All</a>
            </Link>
          </div>
          {isLoadingCourses || isLoadingInstructors ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-full mb-3" />
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                  <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses?.slice(0, 4).map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  instructor={getInstructor(course.instructorId)} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">What Our Students Say</h2>
        {isLoadingTestimonials ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <Skeleton className="h-12 w-12 rounded-full mr-4" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials?.map(testimonial => (
              <TestimonialCard 
                key={testimonial.id}
                name={testimonial.user.name}
                avatarUrl={testimonial.user.avatarUrl}
                text={testimonial.text}
                rating={testimonial.rating}
              />
            ))}
          </div>
        )}
      </div>

      {/* Become Instructor */}
      <div className="bg-secondary/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Become an Instructor</h2>
              <p className="mt-4 text-lg text-gray-600">Share your knowledge and expertise with students around the world. Create engaging courses and earn money while making a difference.</p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-secondary mt-1 mr-2"></i>
                  <span>Create courses in your area of expertise</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-secondary mt-1 mr-2"></i>
                  <span>Earn money from student enrollments</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-secondary mt-1 mr-2"></i>
                  <span>Help students achieve their goals</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-secondary mt-1 mr-2"></i>
                  <span>Join our community of expert instructors</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/become-instructor">
                  <a className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-secondary hover:bg-secondary/90 transition-colors">
                    Start Teaching Today
                  </a>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" alt="Teaching online" className="w-full h-96 object-cover rounded-lg shadow-xl" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
