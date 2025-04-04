import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Loader2, Check, AlertCircle, ChevronDown, ChevronRight, PlayCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface SectionWithLectures {
  section: {
    id: number;
    courseId: number;
    title: string;
    description: string | null;
    orderIndex: number;
  };
  lectures: {
    lecture: {
      id: number;
      sectionId: number;
      title: string;
      description: string | null;
      videoUrl: string | null;
      duration: number;
      orderIndex: number;
      lectureType: string;
    };
    progress?: {
      completed: boolean;
      lastWatchedPosition: number;
    };
  }[];
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [openSection, setOpenSection] = useState<number | null>(null);

  // Fetch course details
  const {
    data: course,
    isLoading: isLoadingCourse,
    error: courseError,
  } = useQuery({
    queryKey: [`/api/courses/${id}`],
    enabled: !!id,
  });

  // Fetch course instructor
  const {
    data: instructor,
    isLoading: isLoadingInstructor,
  } = useQuery({
    queryKey: [`/api/instructors/${course?.instructorId}`],
    enabled: !!course,
  });

  // Fetch course sections and lectures
  const {
    data: sections,
    isLoading: isLoadingSections,
  } = useQuery<SectionWithLectures[]>({
    queryKey: [`/api/courses/${id}/progress`],
    enabled: !!id && !!user,
  });

  // Get just sections data if the user is not logged in
  const {
    data: publicSections,
    isLoading: isLoadingPublicSections,
  } = useQuery({
    queryKey: [`/api/courses/${id}/sections`],
    enabled: !!id && !user,
  });

  // Fetch course reviews
  const {
    data: reviews,
    isLoading: isLoadingReviews,
  } = useQuery({
    queryKey: [`/api/courses/${id}/reviews`],
    enabled: !!id,
  });

  // Check if user is enrolled in the course
  const {
    data: enrollment,
    isLoading: isLoadingEnrollment,
  } = useQuery({
    queryKey: [`/api/courses/${id}/enrollment`],
    enabled: !!id && !!user,
  });

  // Enroll in course mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/courses/${id}/enroll`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Enrolled successfully",
        description: "You're now enrolled in this course!",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${id}/enrollment`] });
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${id}/progress`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to enroll",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEnroll = () => {
    if (!user) {
      // Redirect to login page if not authenticated
      navigate("/auth");
      return;
    }
    enrollMutation.mutate();
  };

  const startCourse = () => {
    // Find the first lecture to start the course
    if (sections && sections.length > 0 && sections[0].lectures.length > 0) {
      const firstLecture = sections[0].lectures[0];
      navigate(`/courses/${id}/learn/${firstLecture.lecture.id}`);
    }
  };

  const continueCourse = () => {
    // Find the last incomplete lecture
    if (sections) {
      for (const section of sections) {
        for (const lecture of section.lectures) {
          if (!lecture.progress?.completed) {
            navigate(`/courses/${id}/learn/${lecture.lecture.id}`);
            return;
          }
        }
      }
      // If all are completed, start from the beginning
      startCourse();
    }
  };

  const toggleSection = (sectionId: number) => {
    if (openSection === sectionId) {
      setOpenSection(null);
    } else {
      setOpenSection(sectionId);
    }
  };

  // Format seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate total course duration
  const calculateTotalDuration = () => {
    if (!sections) return 0;
    let total = 0;
    sections.forEach(section => {
      section.lectures.forEach(lecture => {
        total += lecture.lecture.duration;
      });
    });
    return total;
  };

  // Calculate course content statistics
  const calculateCourseStats = () => {
    if (!sections) return { totalSections: 0, totalLectures: 0 };
    
    let totalLectures = 0;
    sections.forEach(section => {
      totalLectures += section.lectures.length;
    });
    
    return {
      totalSections: sections.length,
      totalLectures,
    };
  };

  const courseStats = calculateCourseStats();
  const totalDuration = calculateTotalDuration();
  const totalDurationHours = Math.floor(totalDuration / 3600);
  const totalDurationMinutes = Math.floor((totalDuration % 3600) / 60);

  // Format course duration for display
  const formattedTotalDuration = totalDurationHours > 0 
    ? `${totalDurationHours}h ${totalDurationMinutes}m` 
    : `${totalDurationMinutes}m`;

  if (isLoadingCourse || isLoadingInstructor || (user && isLoadingEnrollment)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
            <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/courses")}>
              Browse All Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Header Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/70 text-white mb-4">
                {course.categoryId}
              </span>
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <p className="mt-4">{course.description}</p>
              <div className="mt-6 flex items-center text-sm">
                <div className="flex items-center mr-4">
                  <StarRating rating={course.averageRating} count={course.ratingCount} size="sm" />
                </div>
                <div className="flex items-center mr-4">
                  <i className="fas fa-users text-gray-400 mr-1"></i>
                  <span>{course.totalStudents} students</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-clock text-gray-400 mr-1"></i>
                  <span>{course.durationHours} hours</span>
                </div>
              </div>
              <div className="mt-2 flex items-center">
                {instructor && (
                  <>
                    <img 
                      className="h-10 w-10 rounded-full mr-2" 
                      src={instructor.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name)}`} 
                      alt={instructor.name} 
                    />
                    <span>Created by <strong>{instructor.name}</strong></span>
                  </>
                )}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-700 text-gray-200">
                  Level: {course.level}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-700 text-gray-200">
                  English
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-700 text-gray-200">
                  Certificate of completion
                </span>
              </div>
            </div>
            <div className="lg:pl-10">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                  {course.thumbnailUrl ? (
                    <img 
                      src={course.thumbnailUrl} 
                      alt={course.title}
                      className="w-full h-56 object-cover"
                    />
                  ) : (
                    <div className="w-full h-56 bg-gray-800 flex items-center justify-center">
                      <i className="fas fa-play-circle text-white text-5xl opacity-80"></i>
                    </div>
                  )}
                </div>
                <div className="p-6 text-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-bold">${course.price.toFixed(2)}</span>
                    {course.price < 199.99 && (
                      <span className="text-lg text-gray-500 line-through">$199.99</span>
                    )}
                  </div>
                  
                  {user && enrollment ? (
                    <Button 
                      className="w-full mb-3" 
                      onClick={continueCourse}
                      disabled={isLoadingSections || !sections || sections.length === 0}
                    >
                      {isLoadingSections ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <>Continue Learning</>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full mb-3" 
                      onClick={handleEnroll}
                      disabled={enrollMutation.isPending}
                    >
                      {enrollMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <>Enroll Now</>
                      )}
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full">
                    Add to Wishlist
                  </Button>
                  
                  <div className="mt-6 space-y-4 text-sm">
                    <div className="flex items-start">
                      <i className="fas fa-infinity mt-1 w-5 text-gray-600"></i>
                      <span className="ml-2">Full lifetime access</span>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-mobile-alt mt-1 w-5 text-gray-600"></i>
                      <span className="ml-2">Access on mobile and desktop</span>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-certificate mt-1 w-5 text-gray-600"></i>
                      <span className="ml-2">Certificate of completion</span>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm">30-day money-back guarantee</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Create a complete web application with React.js</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Build RESTful APIs with Node.js and Express</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Connect your front-end to a MongoDB database</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Implement user authentication and authorization</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Deploy your application to production</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Work with modern JavaScript features (ES6+)</span>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Course Content</h2>
              <div className="bg-gray-50 p-4 rounded-lg mb-4 flex flex-wrap gap-4">
                <div className="text-sm">
                  <span className="font-medium">{courseStats.totalSections} sections</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">{courseStats.totalLectures} lectures</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Total length: {formattedTotalDuration}</span>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden divide-y divide-gray-200">
                {/* Loading state for sections */}
                {((user && isLoadingSections) || (!user && isLoadingPublicSections)) && (
                  <div className="p-8 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
                
                {/* Sections for authenticated users with progress tracking */}
                {user && sections && sections.map((sectionData) => (
                  <div key={sectionData.section.id} className={openSection === sectionData.section.id ? "bg-gray-50" : ""}>
                    <button
                      className="flex justify-between items-center w-full px-6 py-4 text-left"
                      onClick={() => toggleSection(sectionData.section.id)}
                    >
                      <div className="flex items-center">
                        {openSection === sectionData.section.id ? (
                          <ChevronDown className="mr-3 h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="mr-3 h-5 w-5 text-gray-500" />
                        )}
                        <span className="font-medium">{sectionData.section.title}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {sectionData.lectures.length} lectures • 
                        {' '}
                        {formatDuration(
                          sectionData.lectures.reduce((total, l) => total + l.lecture.duration, 0)
                        )}
                      </div>
                    </button>
                    
                    {openSection === sectionData.section.id && (
                      <div className="px-6 pb-4">
                        <ul className="space-y-2">
                          {sectionData.lectures.map((lectureData) => (
                            <li 
                              key={lectureData.lecture.id} 
                              className="flex items-center justify-between hover:bg-gray-100 p-2 rounded-md"
                            >
                              <div className="flex items-center">
                                {lectureData.lecture.lectureType === 'video' ? (
                                  <PlayCircle className="mr-3 h-5 w-5 text-gray-500" />
                                ) : (
                                  <FileText className="mr-3 h-5 w-5 text-gray-500" />
                                )}
                                <span>{lectureData.lecture.title}</span>
                                {lectureData.progress?.completed && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                    Completed
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDuration(lectureData.lecture.duration)}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Sections for non-authenticated users without progress tracking */}
                {!user && publicSections && publicSections.map((section) => (
                  <div key={section.id} className={openSection === section.id ? "bg-gray-50" : ""}>
                    <button
                      className="flex justify-between items-center w-full px-6 py-4 text-left"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="flex items-center">
                        {openSection === section.id ? (
                          <ChevronDown className="mr-3 h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="mr-3 h-5 w-5 text-gray-500" />
                        )}
                        <span className="font-medium">{section.title}</span>
                      </div>
                    </button>
                    
                    {/* Placeholder for lectures preview (non-authenticated users) */}
                    {openSection === section.id && (
                      <div className="px-6 pb-4">
                        <div className="text-center py-4">
                          <p className="text-gray-500 mb-3">
                            Sign in or enroll to access course content
                          </p>
                          <Button
                            onClick={() => navigate("/auth")}
                            variant="outline"
                            size="sm"
                          >
                            Sign in to view lectures
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Requirements</h2>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <i className="fas fa-circle text-xs mt-1.5 mr-2 text-gray-500"></i>
                  <span>Basic knowledge of HTML, CSS, and JavaScript</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-circle text-xs mt-1.5 mr-2 text-gray-500"></i>
                  <span>A computer with internet access and admin privileges to install software</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-circle text-xs mt-1.5 mr-2 text-gray-500"></i>
                  <span>No prior experience with React or Node.js is required</span>
                </li>
              </ul>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <div className="space-y-4">
                <p>This comprehensive course will take you from the fundamentals of web development all the way to building complex full-stack applications using React.js for the frontend and Node.js for the backend.</p>
                <p>You'll start by learning the basics of modern JavaScript, HTML, and CSS. Then, we'll dive deep into React.js, learning about components, props, state, hooks, and how to manage application state effectively. You'll build several mini-projects to reinforce your learning.</p>
                <p>On the backend, you'll learn how to create RESTful APIs with Node.js and Express, connect to MongoDB using Mongoose, implement user authentication, handle file uploads, and more. Finally, you'll bring everything together by building a complete full-stack application from scratch and deploying it to production.</p>
                <p>By the end of this course, you'll have the skills and confidence to build your own web applications and take on professional development projects.</p>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Instructor</h2>
              {instructor && (
                <div className="flex items-start">
                  <img 
                    className="h-16 w-16 rounded-full mr-4" 
                    src={instructor.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name)}`} 
                    alt={instructor.name} 
                  />
                  <div>
                    <h3 className="font-medium">{instructor.name}</h3>
                    <p className="text-sm text-gray-500">{instructor.role}</p>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <div className="flex items-center mr-3">
                        <i className="fas fa-star text-yellow-400 mr-1"></i>
                        <span>4.6 Instructor Rating</span>
                      </div>
                      <div className="flex items-center mr-3">
                        <i className="fas fa-comment text-gray-400 mr-1"></i>
                        <span>1,287 Reviews</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-user-friends text-gray-400 mr-1"></i>
                        <span>{course.totalStudents} Students</span>
                      </div>
                    </div>
                    <p className="mt-4">{instructor.bio}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Student Feedback</h2>
              {isLoadingReviews ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="col-span-1">
                      <div className="text-center p-4">
                        <div className="text-5xl font-bold text-gray-800">{course.averageRating.toFixed(1)}</div>
                        <div className="flex justify-center my-2">
                          <StarRating rating={course.averageRating} size="lg" />
                        </div>
                        <div className="text-sm text-gray-500">Course Rating</div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(star => {
                          // Calculate percentage for each star rating
                          const count = reviews?.filter(r => r.rating === star).length || 0;
                          const percentage = reviews?.length 
                            ? Math.round((count / reviews.length) * 100) 
                            : 0;
                            
                          return (
                            <div className="flex items-center" key={star}>
                              <div className="w-24 text-right mr-3">
                                <div className="flex items-center justify-end">
                                  <span className="text-sm mr-2">{star}</span>
                                  <i className="fas fa-star text-yellow-400 text-sm"></i>
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-yellow-400 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="w-12 text-right ml-3">
                                <span className="text-sm text-gray-500">{percentage}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.slice(0, 3).map(review => (
                        <div key={review.id} className="border-t pt-6">
                          <div className="flex items-start">
                            <img 
                              className="h-10 w-10 rounded-full mr-4" 
                              src={review.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user.name)}`} 
                              alt={review.user.name} 
                            />
                            <div>
                              <h4 className="font-medium">{review.user.name}</h4>
                              <div className="flex items-center mt-1">
                                <StarRating rating={review.rating} size="sm" />
                                <span className="text-xs text-gray-500 ml-2">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="mt-2 text-gray-600">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {reviews.length > 3 && (
                        <div className="text-center pt-4">
                          <Button variant="outline">
                            Show all {reviews.length} reviews
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-t">
                      <p className="text-gray-500">No reviews yet. Be the first to review this course!</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-24">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6 border border-gray-200 mb-6">
                <h3 className="text-lg font-bold mb-4">Course Includes:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <i className="fas fa-video mt-1 w-5 text-gray-600"></i>
                    <span className="ml-2">{course.durationHours} hours on-demand video</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-file-alt mt-1 w-5 text-gray-600"></i>
                    <span className="ml-2">15 articles</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-file-download mt-1 w-5 text-gray-600"></i>
                    <span className="ml-2">25 downloadable resources</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-code mt-1 w-5 text-gray-600"></i>
                    <span className="ml-2">10 coding exercises</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-infinity mt-1 w-5 text-gray-600"></i>
                    <span className="ml-2">Full lifetime access</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-mobile-alt mt-1 w-5 text-gray-600"></i>
                    <span className="ml-2">Access on mobile and TV</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-certificate mt-1 w-5 text-gray-600"></i>
                    <span className="ml-2">Certificate of completion</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6 border border-gray-200 mb-6">
                <h3 className="text-lg font-bold mb-4">Share This Course</h3>
                <div className="flex space-x-3">
                  <a href="#" className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-400 text-white hover:bg-blue-500">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-800 text-white hover:bg-blue-900">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                  <a href="#" className="flex items-center justify-center w-10 h-10 rounded-full bg-green-600 text-white hover:bg-green-700">
                    <i className="fab fa-whatsapp"></i>
                  </a>
                  <a href="#" className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white hover:bg-red-700">
                    <i className="far fa-envelope"></i>
                  </a>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6 border border-gray-200">
                <h3 className="text-lg font-bold mb-4">Similar Courses</h3>
                <div className="space-y-4">
                  <div className="flex">
                    <img className="h-16 w-24 object-cover rounded" src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" alt="Course thumbnail" />
                    <div className="ml-3">
                      <h4 className="font-medium text-sm mb-1">Modern JavaScript From The Beginning</h4>
                      <div className="flex items-center text-xs">
                        <StarRating rating={4.6} size="sm" />
                      </div>
                      <p className="text-sm text-primary font-bold mt-1">$59.99</p>
                    </div>
                  </div>
                  <div className="flex">
                    <img className="h-16 w-24 object-cover rounded" src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" alt="Course thumbnail" />
                    <div className="ml-3">
                      <h4 className="font-medium text-sm mb-1">React - The Complete Guide</h4>
                      <div className="flex items-center text-xs">
                        <StarRating rating={4.8} size="sm" />
                      </div>
                      <p className="text-sm text-primary font-bold mt-1">$69.99</p>
                    </div>
                  </div>
                  <div className="flex">
                    <img className="h-16 w-24 object-cover rounded" src="https://images.unsplash.com/photo-1593720213428-28a5b9e94613?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" alt="Course thumbnail" />
                    <div className="ml-3">
                      <h4 className="font-medium text-sm mb-1">Node.js API Masterclass</h4>
                      <div className="flex items-center text-xs">
                        <StarRating rating={4.0} size="sm" />
                      </div>
                      <p className="text-sm text-primary font-bold mt-1">$49.99</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
