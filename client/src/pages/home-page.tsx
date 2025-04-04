import { useQuery } from "@tanstack/react-query";
import { Course } from "@shared/schema";
import PageLayout from "@/components/layout/page-layout";
import HeroSection from "@/components/home/hero-section";
import FeaturedCategories from "@/components/home/featured-categories";
import FeaturedInstructors from "@/components/home/featured-instructors";
import Testimonials from "@/components/home/testimonials";
import CallToAction from "@/components/home/call-to-action";
import CourseCard from "@/components/course/course-card";
import CourseProgressCard from "@/components/course/course-progress-card";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user } = useAuth();

  // Fetch recommended courses
  const { data: courses, isLoading: isCoursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    enabled: true,
  });

  // Fetch user enrollments (in-progress courses)
  const { data: enrollments, isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ["/api/enrollments"],
    enabled: !!user,
  });

  return (
    <PageLayout>
      <HeroSection />

      {/* In-progress courses (only for logged in users) */}
      {user && enrollments && enrollments.length > 0 && (
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Continue Learning</h2>
            <a href="/my-learning" className="text-primary hover:text-primary-dark font-medium flex items-center">
              My learning 
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {enrollments.slice(0, 2).map((enrollment) => (
              <CourseProgressCard
                key={enrollment.id}
                course={enrollment.course}
                progress={enrollment.progress}
                instructorName={enrollment.course.instructorName}
                instructorAvatar={enrollment.course.instructorAvatar}
                nextLecture={enrollment.nextLecture}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recommended Courses */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recommended for you</h2>
          <a href="/courses" className="text-primary hover:text-primary-dark font-medium flex items-center">
            View all 
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {isCoursesLoading ? (
            // Loading skeletons
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-40 bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))
          ) : (
            courses?.slice(0, 4).map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                // Fetch instructor info in a real application
                instructorName="Instructor Name"
              />
            ))
          )}
        </div>
      </section>

      <FeaturedCategories />
      <FeaturedInstructors />
      <Testimonials />
      <CallToAction />
    </PageLayout>
  );
}
