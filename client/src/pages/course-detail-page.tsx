import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/layout/page-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Clock, Signal, Play, Video, File, Check, Lock, Users } from "lucide-react";

export default function CourseDetailPage() {
  const [, params] = useRoute("/courses/:id");
  const courseId = params?.id ? parseInt(params.id) : 0;
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("curriculum");

  // Fetch course details
  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });

  // Fetch reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: [`/api/courses/${courseId}/reviews`],
    enabled: !!courseId,
  });

  // Fetch enrollment status (if user is logged in)
  const { data: enrollment, isLoading: isLoadingEnrollment } = useQuery({
    queryKey: [`/api/enrollments`, courseId],
    enabled: !!courseId && !!user,
  });

  // Enroll in course mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/enrollments", { courseId });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Enrolled successfully!",
        description: "You can now start learning this course.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/enrollments`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Enrollment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEnroll = () => {
    if (!user) {
      window.location.href = `/auth?redirect=/courses/${courseId}`;
      return;
    }
    enrollMutation.mutate();
  };

  if (isLoadingCourse) {
    return (
      <PageLayout showSidebar={false}>
        <div className="container mx-auto">
          <div className="bg-white p-4 shadow rounded-lg animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!course) {
    return (
      <PageLayout showSidebar={false}>
        <div className="container mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h1>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <Link href="/courses">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  const isEnrolled = !!enrollment;
  const isInstructor = user?.id === course.instructorId;

  return (
    <PageLayout showSidebar={false}>
      {/* Course Header Banner */}
      <div className="bg-gray-900 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Course Info */}
            <div className="md:w-2/3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                    {course.category}
                  </span>
                  {course.subcategory && (
                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded">
                      {course.subcategory}
                    </span>
                  )}
                </div>
                
                {isInstructor && (
                  <Link href={`/courses/manage/${course.id}`}>
                    <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                      Manage Course
                    </Button>
                  </Link>
                )}
              </div>

              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              
              <p className="text-gray-300 mb-4 max-w-3xl">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="font-medium">{course.rating.toFixed(1)}</span>
                  <span className="text-gray-400 ml-1">({course.reviewCount} reviews)</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-1" />
                  <span>{Math.floor(course.totalDuration / 60)} hours</span>
                </div>
                
                <div className="flex items-center">
                  <Video className="h-5 w-5 text-gray-400 mr-1" />
                  <span>{course.totalLectures} lectures</span>
                </div>
                
                <div className="flex items-center">
                  <Signal className="h-5 w-5 text-gray-400 mr-1" />
                  <span>{course.level}</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-2">
                  <AvatarImage src={course.instructor?.avatarUrl} />
                  <AvatarFallback>{course.instructor?.fullName.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <span>Created by <span className="font-medium">{course.instructor?.fullName}</span></span>
              </div>
            </div>
            
            {/* Course Purchase Card */}
            <div className="md:w-1/3">
              <Card className="shadow-lg">
                <CardContent className="p-0">
                  {/* Course Preview Image */}
                  <div className="relative pb-[56.25%] bg-gray-800">
                    <img
                      src={course.imageUrl || "https://images.unsplash.com/photo-1580894894513-541e068a3e2b"}
                      alt={course.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                      <Button variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
                        <Play className="mr-2 h-4 w-4" />
                        Preview Course
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl font-semibold">Free Access</span>
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        Unlimited access to course content
                      </div>
                    </div>
                    
                    {isEnrolled ? (
                      <Link href={`/learn/${course.id}`}>
                        <Button className="w-full mb-4">Continue Learning</Button>
                      </Link>
                    ) : (
                      <Button 
                        className="w-full mb-4" 
                        onClick={handleEnroll}
                        disabled={enrollMutation.isPending}
                      >
                        {enrollMutation.isPending ? "Processing..." : "Enroll Now"}
                      </Button>
                    )}
                    
                    <div className="text-center text-sm text-gray-500 mb-6">
                      All courses on our platform are free
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">This course includes:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <Video className="h-4 w-4 mr-2 text-gray-500" />
                          {Math.floor(course.totalDuration / 60)} hours on-demand video
                        </li>
                        <li className="flex items-center">
                          <File className="h-4 w-4 mr-2 text-gray-500" />
                          Downloadable resources
                        </li>
                        <li className="flex items-center">
                          <Signal className="h-4 w-4 mr-2 text-gray-500" />
                          Full lifetime access
                        </li>
                        <li className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-gray-500" />
                          Access on mobile and desktop
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Content */}
      <div className="container mx-auto py-8 px-4">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="instructor">Instructor</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          {/* Curriculum Tab */}
          <TabsContent value="curriculum">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6">Course Content</h2>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>{course.sections?.length || 0} sections • {course.totalLectures} lectures • {Math.floor(course.totalDuration / 60)} hours total length</span>
                <Button variant="ghost" size="sm">Expand All Sections</Button>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                {course.sections?.map((section, idx) => (
                  <AccordionItem key={section.id} value={`section-${section.id}`}>
                    <AccordionTrigger className="hover:bg-gray-50 px-4 py-3 text-left">
                      <div>
                        <div className="font-medium">Section {idx + 1}: {section.title}</div>
                        <div className="text-sm text-gray-500">
                          {section.lectures?.length || 0} lectures • {section.lectures?.reduce((acc, lecture) => acc + lecture.duration, 0) || 0} min
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-1 pb-3">
                      <ul className="divide-y">
                        {section.lectures?.map((lecture) => (
                          <li key={lecture.id} className="py-3 flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              {isEnrolled ? (
                                <Play className="h-4 w-4 mr-3 text-primary" />
                              ) : (
                                <Lock className="h-4 w-4 mr-3 text-gray-400" />
                              )}
                              <span>{lecture.title}</span>
                            </div>
                            <span className="text-gray-500">{lecture.duration} min</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">About This Course</h2>
              <div className="prose max-w-none">
                <p className="mb-4">{course.description}</p>
                
                <h3 className="text-lg font-medium mt-6 mb-3">What you'll learn</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Comprehensive understanding of {course.category}</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Practical, hands-on experience</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Industry-standard best practices</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Advanced techniques and methodologies</span>
                  </li>
                </ul>
                
                <h3 className="text-lg font-medium mt-6 mb-3">Requirements</h3>
                <ul className="list-disc pl-5 mb-6">
                  <li>Basic understanding of computers and technology</li>
                  <li>No prior experience needed - we'll start from the basics</li>
                  <li>Enthusiasm and willingness to learn</li>
                </ul>
                
                <h3 className="text-lg font-medium mt-6 mb-3">Who this course is for</h3>
                <ul className="list-disc pl-5">
                  <li>Beginners with no prior experience</li>
                  <li>Intermediate learners looking to refresh knowledge</li>
                  <li>Professionals seeking to expand their skillset</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          {/* Instructor Tab */}
          <TabsContent value="instructor">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6">Meet Your Instructor</h2>
              
              {course.instructor && (
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/4 flex flex-col items-center">
                    <Avatar className="h-32 w-32 mb-4">
                      <AvatarImage src={course.instructor.avatarUrl} />
                      <AvatarFallback>{course.instructor.fullName.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-medium text-center">{course.instructor.fullName}</h3>
                    <p className="text-gray-500 text-center">{course.category} Expert</p>
                    
                    <div className="flex items-center mt-2 text-yellow-500">
                      <Star className="fill-yellow-500" size={16} />
                      <Star className="fill-yellow-500" size={16} />
                      <Star className="fill-yellow-500" size={16} />
                      <Star className="fill-yellow-500" size={16} />
                      <Star className="fill-yellow-500" size={16} />
                      <span className="ml-2 text-sm text-gray-600">4.8 Instructor Rating</span>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-600">
                      <div className="flex items-center mb-1">
                        <Star className="h-4 w-4 mr-1" /> 1,245 Reviews
                      </div>
                      <div className="flex items-center mb-1">
                        <Users className="h-4 w-4 mr-1" /> 75,000+ Students
                      </div>
                      <div className="flex items-center">
                        <Video className="h-4 w-4 mr-1" /> 15 Courses
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:w-3/4">
                    <div className="prose max-w-none">
                      <p className="mb-4">{course.instructor.bio || "No bio available."}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3">
                  <h2 className="text-xl font-bold mb-4">Student Feedback</h2>
                  
                  <div className="flex items-center mb-6">
                    <div className="text-5xl font-bold mr-4">{course.rating.toFixed(1)}</div>
                    <div>
                      <div className="flex text-yellow-500 mb-1">
                        <Star className="fill-yellow-500" size={20} />
                        <Star className="fill-yellow-500" size={20} />
                        <Star className="fill-yellow-500" size={20} />
                        <Star className="fill-yellow-500" size={20} />
                        <Star className="fill-yellow-500" size={20} />
                      </div>
                      <div className="text-sm text-gray-500">Course Rating</div>
                    </div>
                  </div>
                  
                  {/* Rating Breakdown */}
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center">
                        <div className="w-12 text-sm text-gray-600">{star} stars</div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mx-2">
                          <div 
                            className="bg-yellow-500 h-2.5 rounded-full" 
                            style={{ width: star === 5 ? "70%" : star === 4 ? "20%" : star === 3 ? "5%" : star === 2 ? "3%" : "2%" }}
                          ></div>
                        </div>
                        <div className="w-8 text-sm text-gray-600">
                          {star === 5 ? "70%" : star === 4 ? "20%" : star === 3 ? "5%" : star === 2 ? "3%" : "2%"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <h2 className="text-xl font-bold mb-4">Reviews</h2>
                  
                  {isLoadingReviews ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 border rounded-lg animate-pulse">
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                            <div>
                              <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                              <div className="h-3 w-24 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                          <div className="h-3 w-full bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 w-full bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : reviews && reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="p-4 border rounded-lg">
                          <div className="flex items-center mb-2">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={review.user?.avatarUrl} />
                              <AvatarFallback>{review.user?.fullName.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{review.user?.fullName}</div>
                              <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={16} 
                                    className={i < review.rating ? "fill-yellow-500" : "text-gray-300"}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="ml-auto text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                      <p className="text-gray-500">Be the first to review this course</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
