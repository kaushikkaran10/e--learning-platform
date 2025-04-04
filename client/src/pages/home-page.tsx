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
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, ClipboardList, PlusCircle, Edit } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const isInstructor = user?.role === "instructor";

  // Fetch recommended courses
  const { data: courses, isLoading: isCoursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    enabled: true,
  });

  // Fetch user enrollments (in-progress courses)
  const { data: enrollments, isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ["/api/enrollments"],
    enabled: !!user && !isInstructor,
  });

  // Fetch instructor courses
  const { data: instructorCourses, isLoading: isInstructorCoursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses", { instructorId: user?.id }],
    enabled: !!user && isInstructor,
  });

  return (
    <PageLayout>
      <HeroSection />

      {/* Instructor Stats Section */}
      {isInstructor && (
        <Card className="mb-8 border-none shadow-md bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                <div className="p-3 rounded-full bg-blue-100 mr-4">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Courses</p>
                  <p className="text-2xl font-bold">
                    {isInstructorCoursesLoading ? (
                      <span className="inline-block w-10 h-6 bg-gray-200 animate-pulse rounded"></span>
                    ) : (
                      instructorCourses?.length || 0
                    )}
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                <div className="p-3 rounded-full bg-green-100 mr-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Students</p>
                  <p className="text-2xl font-bold">
                    {isInstructorCoursesLoading ? (
                      <span className="inline-block w-10 h-6 bg-gray-200 animate-pulse rounded"></span>
                    ) : (
                      instructorCourses?.reduce((acc: number, course: any) => acc + (course.enrollmentsCount || 0), 0) || 0
                    )}
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                <div className="p-3 rounded-full bg-amber-100 mr-4">
                  <ClipboardList className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Pending Assignments</p>
                  <p className="text-2xl font-bold">
                    {isInstructorCoursesLoading ? (
                      <span className="inline-block w-10 h-6 bg-gray-200 animate-pulse rounded"></span>
                    ) : (
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructor Courses */}
      {isInstructor && (
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
            <Link href="/instructor/dashboard">
              <Button 
                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              >
                <PlusCircle className="h-4 w-4" />
                New Course
              </Button>
            </Link>
          </div>
          
          {isInstructorCoursesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="h-40 bg-gray-200 animate-pulse"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : instructorCourses && instructorCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {instructorCourses.map((course) => (
                <div 
                  key={course.id} 
                  className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col"
                >
                  <div 
                    className="h-40 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${course.imageUrl || 'https://via.placeholder.com/640x360'})` }}
                  ></div>
                  <div className="p-4 flex-grow">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{course.title}</h3>
                    
                    {/* Course Stats */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Students</p>
                        <p className="font-bold">{(course as any).enrollmentsCount || 0}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Status</p>
                        <p className={`font-medium ${
                          course.status === 'published' ? 'text-green-600' : 'text-amber-600'
                        }`}>
                          {course.status === 'published' ? 'Published' : 'Draft'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-auto">
                      <Link href={`/instructor/dashboard?courseId=${course.id}`}>
                        <Button 
                          variant="outline" 
                          className="w-full flex items-center justify-center gap-2 border-gray-300"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/courses/${course.id}`}>
                        <Button 
                          variant="secondary" 
                          className="w-full flex items-center justify-center gap-2"
                        >
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Courses Created Yet</h3>
              <p className="text-gray-500 mb-4">Start creating your first course and share your knowledge with students around the world.</p>
              <Link href="/instructor/dashboard">
                <Button>Create Your First Course</Button>
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Student's In-progress courses (only for logged in users who are students) */}
      {user && !isInstructor && enrollments && (enrollments as any[]).length > 0 && (
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Continue Learning</h2>
            <Link href="/my-learning">
              <div className="text-primary hover:text-primary-dark font-medium flex items-center cursor-pointer">
                My learning 
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(enrollments as any[]).slice(0, 2).map((enrollment: any) => (
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

      {/* Recommended Courses - only show for students and non-logged in users */}
      {!isInstructor && (
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recommended for you</h2>
            <Link href="/courses">
              <div className="text-primary hover:text-primary-dark font-medium flex items-center cursor-pointer">
                View all 
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
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
              courses?.slice(0, 4).map((course: any) => (
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
      )}

      {/* Only show these sections to non-instructors */}
      {!isInstructor && (
        <>
          <FeaturedCategories />
          <FeaturedInstructors />
          <Testimonials />
        </>
      )}
      
      {/* Call to action to become instructor for students */}
      {user && !isInstructor && <CallToAction />}
    </PageLayout>
  );
}
